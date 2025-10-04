"use client";

import { useChat } from "@/contexts/chat-context";
import { chatApi } from "@/lib/api";
import { Loader2, Send, Trash2, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const { messages, addMessage, clearMessages } = useChat();
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("chat");
  const locale = useLocale() as "id" | "en";

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

  const examplePrompts = [t("examplePrompts.unfinishedProjects"), t("examplePrompts.tomatoFarms"), t("examplePrompts.unharvested")];

  const handleExampleClick = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await chatApi.chat({ prompt: inputValue, locale });
      const assistantMessage: Message = {
        role: "assistant",
        content: response.data.response,
        timestamp: new Date(),
      };
      addMessage(assistantMessage);
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: "Oops! I'm having trouble connecting right now. Could you please try asking again?",
        timestamp: new Date(),
      };
      addMessage(errorMessage);
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:flex md:items-start md:justify-center md:pt-16 md:p-4 pointer-events-none">
      {/* Backdrop - subtle with minimal blur, hidden on mobile */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] pointer-events-auto hidden md:block" onClick={onClose} />

      {/* Modal - Full screen on mobile, centered on desktop */}
      <div className="relative bg-white md:rounded-lg md:shadow-2xl w-full md:max-w-2xl h-full md:h-[600px] flex flex-col pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Daisy</h2>
            <p className="text-xs text-gray-500 hidden sm:block">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="text-gray-400 hover:text-red-600 transition-colors p-1"
                aria-label="Clear chat history"
                title="Clear chat history"
              >
                <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1" aria-label="Close chat">
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-2">
              <div className="text-center space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <p className="text-base sm:text-lg text-gray-600">{t("welcome")}</p>
                <p className="text-xs sm:text-sm text-gray-500 px-4">{t("welcomeMessage")}</p>
              </div>

              {/* Example Prompts */}
              <div className="w-full max-w-md space-y-2 sm:space-y-3">
                <p className="text-xs text-gray-400 font-medium mb-2">{t("tryAsking")}</p>
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(prompt)}
                    className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-lg transition-colors text-xs sm:text-sm text-gray-700 hover:text-green-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-3 sm:px-4 py-2 ${
                    message.role === "user" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {message.role === "user" ? (
                    <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  ) : (
                    <div className="text-xs sm:text-sm prose prose-sm max-w-none prose-p:my-1 prose-headings:mt-1.5 prose-headings:mb-1 prose-headings:font-semibold prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-strong:font-bold prose-strong:text-gray-900 prose-code:text-xs prose-code:bg-gray-200 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  )}
                  <p className={`text-[10px] sm:text-xs mt-1 ${message.role === "user" ? "text-green-100" : "text-gray-500"}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-3 sm:px-4 py-2">
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-white">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t("placeholder")}
              className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-600 text-gray-900"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-w-[44px]"
              aria-label="Send message"
            >
              {isLoading ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : <Send className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
