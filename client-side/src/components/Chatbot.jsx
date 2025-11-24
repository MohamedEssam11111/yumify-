import { useState, useRef, useEffect } from "react";
import chatbotAPI from "../apis/chatbot.api";
import { MessageCircle, X, Send, Trash2, Sun, Moon } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
import ReactMarkdown from "react-markdown";

// Primary accent color: #FF7A18
const PRIMARY_COLOR = "#FF7A18";

const Chatbot = () => {
  const { darkMode, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input when chat opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isOpen]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "model",
          content:
            "Hi! I'm Ymym 🍽️, your healthy-Life assistant. Ask me about nutrition, calories, macros, or fitness tips ... ",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");

    // Add user message to chat
    const newUserMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    // Show loading indicator
    setIsLoading(true);
    const loadingMessageId = Date.now();
    setMessages((prev) => [
      ...prev,
      {
        role: "model",
        content: "...",
        timestamp: new Date(),
        isLoading: true,
        id: loadingMessageId,
      },
    ]);

    try {
      // Build conversation history for context
      const history = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Send message to backend
      const response = await chatbotAPI.sendMessage(userMessage, history);

      // Replace loading message with actual response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessageId
            ? {
                role: "model",
                content: response.message || "I'm sorry, I didn't understand that.",
                timestamp: new Date(),
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Chatbot error:", error);
      
      // Handle rate limit errors specifically
      let errorMessage = error.message || "Failed to get response. Please try again.";
      let userFriendlyMessage = errorMessage;
      const isRateLimit = error.status === 429 || errorMessage.includes("Rate limit") || errorMessage.includes("Too Many Requests") || errorMessage.includes("429");
      const retryAfter = error.retryAfter || 30;
      
      if (isRateLimit) {
        userFriendlyMessage = `⚠️ Too many requests! Please wait ${retryAfter} seconds before sending another message.`;
        toast.error(`Rate limit exceeded. Please wait ${retryAfter} seconds...`);
      } else if (errorMessage.includes("GEMINI_API_KEY") || errorMessage.includes("configured")) {
        userFriendlyMessage = "⚠️ Chatbot service is not configured. Please contact the administrator.";
        toast.error("Configuration error");
      } else if (errorMessage.includes("quota") || errorMessage.includes("Quota")) {
        userFriendlyMessage = "⚠️ Service quota exceeded. Please try again later.";
        toast.error("Service unavailable");
      } else {
        toast.error("Failed to get response. Please try again.");
      }

      // Replace loading message with error message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessageId
            ? {
                role: "model",
                content: userFriendlyMessage,
                timestamp: new Date(),
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    toast.success("Chat cleared");
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 rounded-full p-3 md:p-4 shadow-lg transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-0 pointer-events-none scale-0" : "opacity-100 hover:scale-110 active:scale-95"
        }`}
        style={{ backgroundColor: PRIMARY_COLOR }}
        aria-label="Open chatbot"
      >
        <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
        {messages.length > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {messages.filter((m) => m.role === "user").length}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
      <div
        className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 w-[calc(100vw-2rem)] md:w-96 max-w-[calc(100vw-2rem)] md:max-w-[calc(100vw-3rem)] h-[calc(100vh-8rem)] md:h-[600px] max-h-[calc(100vh-8rem)] rounded-lg shadow-2xl flex flex-col animate-fade-in ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      >
        {/* Chat Header */}
        <div
          className="flex items-center justify-between p-4 rounded-t-lg text-white"
          style={{ backgroundColor: PRIMARY_COLOR }}
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <h3 className="font-semibold text-lg">Ymym</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded hover:bg-white/20 transition-colors"
              aria-label="Toggle theme"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded hover:bg-white/20 transition-colors"
                aria-label="Clear chat"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={toggleChat}
              className="p-1.5 rounded hover:bg-white/20 transition-colors"
              aria-label="Close chatbot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div
          className={`flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 ${
            darkMode ? "bg-gray-900" : "bg-gray-50"
          }`}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "text-white"
                    : darkMode
                    ? "bg-gray-700 text-gray-100 border border-gray-600"
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
                style={
                  message.role === "user"
                    ? { backgroundColor: PRIMARY_COLOR }
                    : {}
                }
              >
                {message.isLoading ? (
                  <span className="flex items-center gap-1 text-sm">
                    <span className="animate-bounce [animation-delay:0ms]">.</span>
                    <span className="animate-bounce [animation-delay:150ms]">.</span>
                    <span className="animate-bounce [animation-delay:300ms]">.</span>
                  </span>
                ) : (
                  <div className={`text-sm break-words markdown-content ${message.role === "user" ? "text-white" : darkMode ? "text-gray-100" : "text-gray-800"}`}>
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-2 last:mb-0 leading-relaxed" style={{ margin: 0, marginBottom: '0.5rem' }}>{children}</p>
                        ),
                        strong: ({ children }) => {
                          const color = message.role === "user" 
                            ? "#FFFFFF" 
                            : darkMode 
                            ? "#F97316" // orange-500 for dark mode
                            : "#EA580C"; // orange-600 for light mode
                          return (
                            <strong 
                              style={{ 
                                fontWeight: 700,
                                color: color,
                                display: 'inline'
                              }}
                            >
                              {children}
                            </strong>
                          );
                        },
                        em: ({ children }) => (
                          <em className="italic" style={{ fontStyle: 'italic' }}>{children}</em>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside mb-2 space-y-1 ml-1" style={{ marginLeft: '0.5rem', marginBottom: '0.5rem' }}>{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside mb-2 space-y-1 ml-1" style={{ marginLeft: '0.5rem', marginBottom: '0.5rem' }}>{children}</ol>
                        ),
                        li: ({ children }) => (
                          <li className="ml-1" style={{ marginLeft: '0.25rem' }}>{children}</li>
                        ),
                        code: ({ children }) => {
                          const bgColor = darkMode ? '#1F2937' : '#F3F4F6';
                          const codeColor = darkMode ? '#F97316' : '#EA580C';
                          return (
                            <code
                              style={{
                                padding: '0.125rem 0.375rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                fontFamily: 'monospace',
                                backgroundColor: bgColor,
                                color: codeColor
                              }}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Container */}
        <div
          className={`p-4 border-t rounded-b-lg ${
            darkMode
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className={`flex-1 px-4 py-2 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-colors ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-90"
              style={{ backgroundColor: PRIMARY_COLOR }}
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p
            className={`text-xs mt-2 text-center ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Ask me about nutrition, fitness, or healthy eating
          </p>
        </div>
      </div>
      )}
    </>
  );
};

export default Chatbot;

