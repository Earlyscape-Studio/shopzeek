"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { X, Send } from "lucide-react";

// International format, no "+" or spaces — update if the support line changes.
const WHATSAPP_NUMBER = "09110497316";
const DEFAULT_MESSAGE = "Thank you for contacting Zeek!. Please let us know how we can help you.";
const PLACEHOLDER = "Hi Zeek! I'd like to ask about...";

export function WhatsAppChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);

  const handleSend = () => {
    const trimmed = message.trim();
    const text = trimmed || "Hi Zeek! I'd like to chat with someone.";
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {isOpen && (
        <div className="w-[320px] max-w-[calc(100vw-2.5rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-[#25D366] px-4 py-4 flex items-center gap-3 text-white">
            <div className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faWhatsapp} className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm leading-tight">Zeek Support</p>
              <p className="text-[11px] text-white/80 flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-300 inline-block" />
                Typically replies within minutes
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="bg-[#E5DDD5] px-4 py-4 space-y-3 max-h-[260px] overflow-y-auto">
            <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 max-w-[85%] shadow-sm">
              <p className="text-sm text-gray-800 leading-relaxed">
                Hi there 👋 Need help with an order, a product, or something
                else? Send us a message and we&apos;ll continue the
                conversation on WhatsApp.
              </p>
              <p className="text-[10px] text-gray-400 mt-1 text-right">Zeek Team</p>
            </div>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white flex items-end gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              placeholder={PLACEHOLDER}
              className="flex-1 resize-none text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
            />
            <button
              onClick={handleSend}
              aria-label="Open WhatsApp chat"
              className="h-10 w-10 rounded-full bg-[#25D366] hover:bg-[#1ebe5b] text-white flex items-center justify-center shrink-0 transition-colors shadow-sm"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 text-center pb-2 px-3">
            This opens a chat with us on WhatsApp.
          </p>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close WhatsApp chat" : "Open WhatsApp chat"}
        className="relative h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#1ebe5b] text-white shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <>
            <FontAwesomeIcon icon={faWhatsapp} className="h-7 w-7" />
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-white animate-pulse" />
          </>
        )}
      </button>
    </div>
  );
}