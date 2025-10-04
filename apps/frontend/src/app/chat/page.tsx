"use client";

import { useChat } from "@/contexts/chat-context";
import { chatApi } from "@/lib/api";
import { Loader2, MessageCircle, Send, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
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
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <MessageCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{t("title")}</h1>
              <p className="text-sm text-gray-500">{t("subtitle")}</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="flex items-center gap-2 text-gray-400 hover:text-red-600 transition-colors px-3 py-1 rounded-lg hover:bg-red-50"
              aria-label="Clear chat history"
              title="Clear chat history"
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-sm">{t("clear")}</span>
            </button>
          )}
        </div>

        {/* Messages Area */}
        <div className={`flex-1 px-4 py-4 space-y-4 min-h-0 ${messages.length > 0 ? "overflow-y-auto" : "overflow-hidden"}`}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center space-y-4 mb-8">
                <div className="p-4 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                  <MessageCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-medium text-gray-900">{t("welcome")}</p>
                  <p className="text-gray-500 mt-2 max-w-xl text-base">{t("welcomeMessage")}</p>
                </div>
              </div>

              {/* Example Prompts */}
              <div className="w-full max-w-2xl space-y-3">
                <p className="text-base text-gray-600 font-medium mb-4 text-center">{t("tryAsking")}</p>
                <div className="grid gap-3 md:grid-cols-1">
                  {examplePrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(prompt)}
                      className="text-left px-4 py-3 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-lg transition-all duration-200 text-sm text-gray-700 hover:text-green-700 hover:shadow-md"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="flex flex-col max-w-[80%]">
                    <div
                      className={`rounded-lg px-4 py-3 ${
                        message.role === "user" ? "bg-green-600 text-white rounded-br-md" : "bg-gray-100 text-gray-900 rounded-bl-md"
                      }`}
                    >
                      {message.role === "user" ? (
                        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                      ) : (
                        <div className="text-sm prose prose-sm max-w-none prose-p:my-1.5 prose-headings:mt-2 prose-headings:mb-1.5 prose-headings:font-semibold prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-strong:font-bold prose-strong:text-gray-900 prose-code:text-xs prose-code:bg-gray-200 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                    <p className={`text-xs mt-1 px-2 ${message.role === "user" ? "text-gray-500 text-right" : "text-gray-500 text-left"}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 text-gray-600 animate-spin" />
                      <span className="text-sm text-gray-600">{t("thinking")}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-4 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t("placeholder")}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm placeholder-gray-600 text-gray-900"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium text-sm"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>{t("send")}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
