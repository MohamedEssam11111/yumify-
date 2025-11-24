import e from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const router = e.Router();

// System prompt for health and fitness chatbot
const SYSTEM_PROMPT = `You are Ymym, a concise health and fitness assistant for Yumify, a food ordering application. Your name is Ymym (pronounced "Yummy").

CRITICAL RESPONSE GUIDELINES:
- Keep responses SHORT and PRECISE (2-4 sentences maximum)
- ALWAYS include specific NUMBERS, percentages, grams, calories, or measurements when relevant
- Focus on actionable, data-driven advice
- Use bullet points or numbered lists when providing multiple facts
- Prioritize numerical information over lengthy explanations
- Be friendly but brief - think quick, helpful answers

Examples of good responses:
- "A typical serving (150g) has ~200 calories, 15g protein, and 30g carbs. Great for post-workout recovery!"
- "Aim for 25-30g protein per meal. That's about 100g chicken or 150g salmon."
- "Daily recommendation: 7-9 hours sleep, 2-3L water, 30min exercise. Track with apps!"

Specializations:
- Nutrition values and macros (always include numbers)
- Dietary recommendations with specific portions
- Fitness tips with sets/reps/duration
- Healthy food choices on menus (with nutritional data when possible)

Remember: You are NOT a substitute for professional medical advice. Always keep responses under 100 words and include specific numbers or measurements.`;

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
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";
  return genAI.getGenerativeModel({ model: modelName });
};

// POST endpoint to send a message to the chatbot
router.post("/message", async (req, res) => {
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
    
    // Generate response (simplified approach - just pass the prompt string)
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const responseText = response.text();

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
    });

    // Handle specific errors
    if (error.message.includes("GEMINI_API_KEY") || error.message.includes("API key") || !process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        message: "Chatbot service is not properly configured. Please add GEMINI_API_KEY to your .env file.",
        error: "Configuration error",
        details: "Missing GEMINI_API_KEY environment variable",
      });
    }

    // Handle API errors
    if (error.message.includes("API") || error.message.includes("quota") || error.message.includes("permission") || error.message.includes("401") || error.message.includes("403")) {
      return res.status(500).json({
        message: "Unable to connect to the AI service. Please check your API key and configuration.",
        error: error.message,
        details: "API authentication or permission error",
      });
    }

    // Handle model not found errors
    if (error.message.includes("model") || error.message.includes("404")) {
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

