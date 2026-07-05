"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "@/types/chat";
import ContactForm, { detectForm, ContactFormData } from "./ContactForm";
import CrushForm, { CrushFormData } from "./CrushForm";

interface MessageBubbleProps {
  message: Message;
  onContactSubmit?: (data: ContactFormData) => void;
  onCrushSubmit?: (data: CrushFormData) => void;
}

export default function MessageBubble({ message, onContactSubmit, onCrushSubmit }: MessageBubbleProps) {
  const isUser = message.role === "user";

  const detected = isUser
    ? { preamble: message.content, formType: null }
    : detectForm(message.content);
  // The backend's structured signal decides whether a form renders;
  // detectForm remains the fallback (and supplies the display preamble).
  const formType =
    !isUser && message.form !== undefined ? message.form : detected.formType;
  const preamble = formType ? detected.preamble : message.content;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${
            isUser
              ? "bg-blue-600 text-white rounded-br-md"
              : "bg-zinc-800 text-zinc-100 rounded-bl-md"
          }`}
      >
        {!isUser && (
          <span className="block text-xs font-medium text-zinc-400 mb-1">
            Portfolia
          </span>
        )}
        {isUser ? (
          message.content
        ) : (
          <>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => (
                  <h2 className="text-base font-bold text-zinc-50 mt-4 mb-2 first:mt-0">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-bold text-zinc-100 mt-3 mb-1.5 first:mt-0">{children}</h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-sm font-semibold text-zinc-200 mt-2 mb-1 first:mt-0">{children}</h4>
                ),
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => (
                  <strong className="font-semibold text-zinc-50">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-zinc-300">{children}</em>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline hover:text-blue-300"
                  >
                    {children}
                  </a>
                ),
                img: ({ src, alt }) => (
                  <span className="block my-3">
                    {/* eslint-disable-next-line @next/next/no-img-element --
                        Renders arbitrary remote images from LLM-generated markdown.
                        Dimensions are unknown at build time and hosts vary, so
                        next/image (which requires width/height and remotePatterns
                        config) isn't a drop-in replacement here. */}
                    <img
                      src={src}
                      alt={alt || ""}
                      className="rounded-lg max-w-full border border-zinc-700"
                      loading="lazy"
                    />
                    {alt && (
                      <span className="block text-xs text-zinc-400 mt-1.5 italic">{alt}</span>
                    )}
                  </span>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-outside pl-5 mb-2 space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-outside pl-5 mb-2 space-y-1">{children}</ol>
                ),
                li: ({ children }) => <li className="text-zinc-200">{children}</li>,
                code: ({ className, children }) => {
                  const isBlock = className?.includes("language-");
                  return isBlock ? (
                    <code className="block bg-zinc-900 rounded-md p-3 my-2 text-xs text-zinc-200 overflow-x-auto whitespace-pre">
                      {children}
                    </code>
                  ) : (
                    <code className="bg-zinc-700 rounded px-1.5 py-0.5 text-xs text-zinc-200">
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => <pre className="my-2">{children}</pre>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-zinc-600 pl-3 my-2 text-zinc-300 italic">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-3">
                    <table className="min-w-full text-xs border border-zinc-700 rounded-lg">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-zinc-700/50">{children}</thead>
                ),
                th: ({ children }) => (
                  <th className="px-3 py-2 text-left font-semibold text-zinc-200 border-b border-zinc-600">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-3 py-2 text-zinc-300 border-b border-zinc-700/50">
                    {children}
                  </td>
                ),
                hr: () => <hr className="border-zinc-700 my-3" />,
              }}
            >
              {formType ? preamble : message.content}
            </ReactMarkdown>
            {formType === "contact" && onContactSubmit && (
              <ContactForm onSubmit={onContactSubmit} />
            )}
            {formType === "crush" && onCrushSubmit && (
              <CrushForm onSubmit={onCrushSubmit} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
