// components/chatbot/Chatbot.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Search,
  ChevronRight,
  Clock,
  HelpCircle,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your PorterPro assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
      type: "text",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  // FAQ Categories and Questions
  const faqCategories = [
    {
      id: "booking",
      name: "Booking",
      icon: "📅",
      questions: [
        "How do I book a porter?",
        "Can I schedule a porter in advance?",
        "What are the booking charges?",
        "How do I cancel a booking?",
      ],
    },
    {
      id: "payment",
      name: "Payment",
      icon: "💰",
      questions: [
        "What payment methods do you accept?",
        "Is there a cancellation fee?",
        "How do I get a refund?",
        "Are there any hidden charges?",
      ],
    },
    {
      id: "porter",
      name: "Porter",
      icon: "👷",
      questions: [
        "How are porters assigned?",
        "Can I choose a specific porter?",
        "What if my porter is late?",
        "How do I rate a porter?",
      ],
    },
    {
      id: "delivery",
      name: "Delivery",
      icon: "📦",
      questions: [
        "What items can be delivered?",
        "Is there a weight limit?",
        "How do I track my delivery?",
        "What if my item gets damaged?",
      ],
    },
  ];

  // Predefined quick replies
  const quickReplies = [
    "Book a porter",
    "Track my delivery",
    "Cancel booking",
    "Payment issues",
    "Talk to human agent",
  ];

  // Bot responses based on keywords
  const botResponses = {
    greeting: [
      "Hello! I'm here to help with your porter management needs. 😊",
      "Hi there! How can I assist you today?",
    ],
    booking: [
      "You can book a porter through our app or website. Just select your location, choose the type of service needed, and confirm your booking! 📅",
      "To book a porter: 1) Open the booking page 2) Enter your pickup and drop locations 3) Select service type 4) Choose a porter 5) Confirm booking",
      "Yes! You can schedule porters up to 7 days in advance. Premium users can schedule up to 30 days ahead.",
    ],
    payment: [
      "We accept credit/debit cards, digital wallets (eSewa, Khalti), cash on delivery, and bank transfers. 💳",
      "Cancellation fees apply only if cancelled less than 2 hours before scheduled time. No fee for earlier cancellations.",
      "Refunds are processed within 5-7 business days to your original payment method.",
    ],
    pricing: [
      "Basic rates start at ₹200 for the first 2km, then ₹50 per additional km. Premium services are available at higher rates.",
      "You can view detailed pricing in the 'Pricing' section of our app or website.",
      "Charges vary based on distance, weight, and service type. Use our price calculator for accurate estimates.",
    ],
    tracking: [
      "You can track your delivery in real-time from the 'My Orders' section. Click on any active order to see the porter's location on map. 🗺️",
      "Real-time tracking is available once your porter is assigned. You'll receive live updates every 5 minutes.",
    ],
    cancellation: [
      "To cancel: Go to 'My Bookings' > Select booking > Click 'Cancel' > Choose reason > Confirm. No fee if cancelled 2+ hours before.",
      "Cancellations within 2 hours of scheduled time incur a 20% fee. No shows are charged 50% of the booking amount.",
    ],
    support: [
      "You can reach our human support team at support@porterpro.com or call 01-XXXXXXX. Available 24/7! 📞",
      "Our customer service team is available round the clock. Email: help@porterpro.com, Phone: 1-800-XXX-XXXX",
    ],
    default: [
      "I'm not sure about that. Could you rephrase your question?",
      "Let me connect you with a human agent who can help with that specific query.",
      "I don't have information on that yet. Please check our FAQ section or contact support.",
    ],
  };

  // Function to get bot response
  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return botResponses.greeting[
        Math.floor(Math.random() * botResponses.greeting.length)
      ];
    }
    if (lowerMessage.includes("book") || lowerMessage.includes("schedule")) {
      return botResponses.booking[
        Math.floor(Math.random() * botResponses.booking.length)
      ];
    }
    if (lowerMessage.includes("pay") || lowerMessage.includes("refund")) {
      return botResponses.payment[
        Math.floor(Math.random() * botResponses.payment.length)
      ];
    }
    if (
      lowerMessage.includes("price") ||
      lowerMessage.includes("cost") ||
      lowerMessage.includes("charge")
    ) {
      return botResponses.pricing[
        Math.floor(Math.random() * botResponses.pricing.length)
      ];
    }
    if (lowerMessage.includes("track") || lowerMessage.includes("where")) {
      return botResponses.tracking[
        Math.floor(Math.random() * botResponses.tracking.length)
      ];
    }
    if (lowerMessage.includes("cancel")) {
      return botResponses.cancellation[
        Math.floor(Math.random() * botResponses.cancellation.length)
      ];
    }
    if (
      lowerMessage.includes("support") ||
      lowerMessage.includes("agent") ||
      lowerMessage.includes("human")
    ) {
      return botResponses.support[
        Math.floor(Math.random() * botResponses.support.length)
      ];
    }

    return botResponses.default[
      Math.floor(Math.random() * botResponses.default.length)
    ];
  };

  // Function to send message
  const sendMessage = (text, sender = "user") => {
    if (!text.trim()) return;

    // Add user message
    const newMessage = {
      id: messages.length + 1,
      text,
      sender,
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
    setShowQuickReplies(false);

    // Bot typing indicator
    if (sender === "user") {
      setIsTyping(true);

      // Simulate bot response after delay
      setTimeout(() => {
        const botResponse = getBotResponse(text);
        const botMessage = {
          id: messages.length + 2,
          text: botResponse,
          sender: "bot",
          timestamp: new Date(),
          type: "text",
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
    }
  };

  // Function to handle FAQ question click
  const handleFAQClick = (question) => {
    sendMessage(question, "user");
  };

  // Function to handle quick reply click
  const handleQuickReplyClick = (text) => {
    sendMessage(text, "user");
  };

  // Function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed z-50 right-6 bottom-24 sm:bottom-16 md:bottom-10 md:right-6 lg:bottom-6 lg:right-6 bg-primary text-primary-foreground p-4 rounded-full shadow-2xl cursor-pointer"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </motion.button>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-96 h-[600px] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-primary to-yellow-400 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Doko Namlo Assistant</h3>
                    <p className="text-white/80 text-sm">AI-powered support</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-white/20 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 ${
                        message.sender === "user"
                          ? "bg-primary text-white rounded-br-none"
                          : "bg-white border border-gray-200 rounded-bl-none"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {message.sender === "bot" ? (
                          <Bot className="w-4 h-4 text-primary" />
                        ) : (
                          <User className="w-4 h-4 text-white/80" />
                        )}
                        <span className="text-xs opacity-70">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{message.text}</p>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-3">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-blue-500" />
                        <div className="flex gap-1">
                          <motion.span
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                          <motion.span
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                              repeat: Infinity,
                              duration: 1,
                              delay: 0.2,
                            }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                          <motion.span
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                              repeat: Infinity,
                              duration: 1,
                              delay: 0.4,
                            }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Quick Replies */}
                {showQuickReplies && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <p className="text-sm text-gray-500 text-center">
                      Quick replies
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {quickReplies.map((reply, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickReplyClick(reply)}
                          className="px-3 py-2 bg-white border border-gray-200 rounded-full text-sm hover:bg-gray-50 transition hover:border-blue-300"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* FAQ Section */}
                {showQuickReplies && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium text-gray-700">
                        Browse FAQs
                      </p>
                    </div>
                    <div className="space-y-3">
                      {faqCategories.map((category) => (
                        <div
                          key={category.id}
                          className="bg-white border border-gray-200 rounded-xl p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span>{category.icon}</span>
                              <span className="font-medium text-gray-900">
                                {category.name}
                              </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="space-y-2">
                            {category.questions.map((question, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleFAQClick(question)}
                                className="block w-full text-left text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                              >
                                {question}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Chat Input */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && sendMessage(inputText)
                    }
                    placeholder="Type your message..."
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isTyping}
                  />
                  <button
                    onClick={() => inputText.trim() && sendMessage(inputText)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                    disabled={isTyping || !inputText.trim()}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowQuickReplies((prev) => !prev)}
                    // onClick={() => setShowQuickReplies(true)}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    <HelpCircle className="w-4 h-4" />
                    FAQ
                  </button>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    24/7 Support
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-1 hover:text-green-600" title="Helpful">
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1 hover:text-red-600"
                    title="Not helpful"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
