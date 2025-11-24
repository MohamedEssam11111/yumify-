import e from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const router = e.Router();

// Simple in-memory rate limiter per IP
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 requests per minute per IP

// Rate limiting middleware
const rateLimiter = (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  // Clean old entries
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now - data.windowStart > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(ip);
    }
  }
  
  // Check current IP
  const ipData = rateLimitMap.get(clientIp);
  
  if (!ipData) {
    // First request from this IP
    rateLimitMap.set(clientIp, {
      count: 1,
      windowStart: now,
    });
    return next();
  }
  
  if (now - ipData.windowStart > RATE_LIMIT_WINDOW) {
    // Window expired, reset
    rateLimitMap.set(clientIp, {
      count: 1,
      windowStart: now,
    });
    return next();
  }
  
  if (ipData.count >= MAX_REQUESTS_PER_WINDOW) {
    // Rate limit exceeded
    const remainingTime = Math.ceil((RATE_LIMIT_WINDOW - (now - ipData.windowStart)) / 1000);
    return res.status(429).json({
      message: `Too many requests. Please wait ${remainingTime} seconds before trying again.`,
      error: "Rate limit exceeded",
      retryAfter: remainingTime,
    });
  }
  
  // Increment counter
  ipData.count++;
  next();
};

// System prompt for health and fitness chatbot
const SYSTEM_PROMPT = `You are Ymym, a concise health and fitness assistant for Yumify, a food ordering application. Your name is Ymym (pronounced "Yummy").

CRITICAL RESPONSE GUIDELINES:
- make sure that the response should be composide of pullet points and detailed explanations
- Keep responses SHORT and PRECISE (2-6 sentences maximum)
- ALWAYS include specific NUMBERS, percentages, grams, calories, or measurements when relevant
- Focus on actionable, data-driven advice

Specializations:
- Nutrition values and macros (always include numbers)
- Dietary recommendations with specific portions
- Fitness tips with sets/reps/duration
- Healthy food choices on menus 

Remember: Always keep responses under 100 words and include specific numbers or measurements.`;

// Initialize Gemini AI
const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in environment variables");
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  // Try gemini-1.5-flash first (faster and free tier), fallback to gemini-1.5-pro or gemini-pro
  // const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  return genAI.getGenerativeModel({ model: modelName });
};

// POST endpoint to send a message to the chatbot
router.post("/message", rateLimiter, async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    // Validate input
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        message: "Please provide a valid message",
      });
    }

    // Sanitize message (basic validation)
    const sanitizedMessage = message.trim().slice(0, 1000); // Limit message length

    // Build conversation context from history
    const hasHistory = Array.isArray(history) && history.length > 0;
    let conversationContext = "";
    
    if (hasHistory) {
      // Build conversation context from history (limit to last 6 exchanges)
      const recentHistory = history.slice(-6);
      conversationContext = recentHistory
        .map((msg) => {
          const role = msg.role === "user" ? "User" : "Assistant";
          const content = String(msg.content || msg.text || "").slice(0, 500);
          return `${role}: ${content}`;
        })
        .join("\n");
      conversationContext = conversationContext + "\n\n";
    }

    // Get model
    const model = getGeminiModel();
    
    // Build the full prompt with system instruction and conversation context
    const fullPrompt = `${SYSTEM_PROMPT}\n\n${conversationContext}User: ${sanitizedMessage}\n\nAssistant:`;
    
    // Generate response with retry logic for rate limiting
    let result;
    let response;
    let responseText;
    const maxRetries = 3;
    let retryCount = 0;
    let lastError = null;

    while (retryCount < maxRetries) {
      try {
        result = await model.generateContent(fullPrompt);
        response = await result.response;
        responseText = response.text();
        break; // Success, exit retry loop
      } catch (retryError) {
        lastError = retryError;
        
        // Check if it's a rate limit error (429)
        if (retryError.status === 429 || retryError.statusText === 'Too Many Requests') {
          retryCount++;
          
          if (retryCount < maxRetries) {
            // Exponential backoff: wait 2^retryCount seconds
            const waitTime = Math.pow(2, retryCount) * 1000; // Convert to milliseconds
            console.log(`Rate limit hit. Retrying in ${waitTime/1000} seconds... (Attempt ${retryCount}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue; // Retry
          } else {
            // Max retries reached
            throw new Error("Rate limit exceeded. Please wait a moment before sending another message.");
          }
        } else {
          // Non-rate-limit error, throw immediately
          throw retryError;
        }
      }
    }

    if (!responseText && lastError) {
      throw lastError;
    }

    res.status(200).json({
      message: responseText,
      success: true,
    });
  } catch (error) {
    console.error("Error in POST /message (chatbot.route):", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      status: error.status,
      statusText: error.statusText,
    });

    // Handle rate limit errors (429)
    if (error.status === 429 || error.statusText === 'Too Many Requests' || error.message.includes("Rate limit") || error.message.includes("Too Many Requests")) {
      return res.status(429).json({
        message: "I'm receiving too many requests right now. Please wait a moment and try again in a few seconds.",
        error: "Rate limit exceeded",
        details: "The API rate limit has been exceeded. Please wait before sending another message.",
        retryAfter: 30, // Suggest waiting 30 seconds
      });
    }

    // Handle specific errors
    if (error.message.includes("GEMINI_API_KEY") || error.message.includes("API key") || !process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        message: "Chatbot service is not properly configured. Please add GEMINI_API_KEY to your .env file.",
        error: "Configuration error",
        details: "Missing GEMINI_API_KEY environment variable",
      });
    }

    // Handle quota exceeded errors
    if (error.message.includes("quota") || error.message.includes("Quota")) {
      return res.status(503).json({
        message: "The AI service quota has been exceeded. Please try again later or contact support.",
        error: "Quota exceeded",
        details: "API quota limit reached",
      });
    }

    // Handle API errors
    if (error.message.includes("API") || error.message.includes("permission") || error.status === 401 || error.status === 403) {
      return res.status(500).json({
        message: "Unable to connect to the AI service. Please check your API key and configuration.",
        error: error.message,
        details: "API authentication or permission error",
      });
    }

    // Handle model not found errors
    if (error.message.includes("model") || error.status === 404) {
      return res.status(500).json({
        message: "The AI model is not available. Please check your model configuration.",
        error: error.message,
        details: "Model configuration error",
      });
    }

    // Generic error response
    res.status(500).json({
      message: "Sorry, I'm having trouble responding right now. Please try again later.",
      error: error.message || "Unknown error",
      details: "Server error occurred",
    });
  }
});

export default router;

