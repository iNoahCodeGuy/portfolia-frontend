"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Message } from "@/types/chat";
import { sendMessage } from "@/lib/api";
import WelcomeScreen from "./WelcomeScreen";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { ContactFormData, detectForm } from "./ContactForm";
import { CrushFormData } from "./CrushForm";

// Menu button texts that should be sent as role to the backend
const MENU_BUTTONS = new Set([
  "Learn more about Noah",
  "See what Noah has built",
  "How I relate to Enterprise AI",
  "Confess a crush",
]);

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const showWelcome = messages.length === 0;

  // True when the last assistant message contains a form that hasn't been submitted yet
  const formActive = useMemo(() => {
    if (messages.length === 0) return false;
    const last = messages[messages.length - 1];
    if (last.role !== "assistant") return false;
    return detectForm(last.content).formType !== null;
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const role = MENU_BUTTONS.has(content) ? content : undefined;
        const result = await sendMessage(content, sessionId, role);
        setSessionId(result.sessionId);

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.response,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch {
        const errorMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Something went wrong. Try again in a moment.",
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId],
  );

  const handleContactSubmit = useCallback(
    (data: ContactFormData) => {
      const formatted = [
        `Name: ${data.name}`,
        data.phone ? `Number: ${data.phone}` : null,
        `Email: ${data.email}`,
        data.company ? `Company: ${data.company}` : null,
        data.additional ? `Additional information: ${data.additional}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      handleSendMessage(formatted);
    },
    [handleSendMessage],
  );

  const handleCrushSubmit = useCallback(
    (data: CrushFormData) => {
      const formatted = [
        `Name: ${data.name}`,
        `Number or social: ${data.contact}`,
        `Message for Noah: ${data.message}`,
      ].join("\n");

      handleSendMessage(formatted);
    },
    [handleSendMessage],
  );

  const handleReset = () => {
    setMessages([]);
    setSessionId(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with home button */}
      {!showWelcome && (
        <div className="flex items-center px-4 py-2 border-b border-zinc-800">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z"
                clipRule="evenodd"
              />
            </svg>
            Start over
          </button>
        </div>
      )}

      {/* Chat messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll">
        {showWelcome ? (
          <WelcomeScreen onSelectOption={handleSendMessage} />
        ) : (
          <div className="mx-auto max-w-3xl px-4 py-6 flex flex-col gap-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onContactSubmit={handleContactSubmit}
                onCrushSubmit={handleCrushSubmit}
              />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-zinc-400">
                  <span className="block text-xs font-medium text-zinc-400 mb-1">
                    Portfolia
                  </span>
                  <span className="inline-flex gap-1">
                    <span className="animate-pulse">.</span>
                    <span className="animate-pulse [animation-delay:200ms]">.</span>
                    <span className="animate-pulse [animation-delay:400ms]">.</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input bar */}
      <ChatInput
        onSend={handleSendMessage}
        disabled={isLoading || formActive}
        placeholder={formActive ? "Please fill out the form above first" : undefined}
      />
    </div>
  );
}
