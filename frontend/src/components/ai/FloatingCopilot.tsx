"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  Send, 
  Copy, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAiChat } from "@/context/ai-chat-context";
import MarkdownRenderer from "../../app/home/MarkdownRenderer";
import { cn } from "@/lib/utils";

const SUGGESTION_CHIPS = [
  "Explain today's lecture",
  "Generate study plan",
  "Draft leave letter",
  "Summarize today's classes"
];

const FOLLOW_UP_SUGGESTIONS = [
  "Continue Learning",
  "Explain with an Example",
  "Generate Practice Questions",
  "Summarize",
  "Simplify"
];

const SUGGESTED_QUESTIONS = [
  { label: "Explain a concept", prompt: "Explain a concept", icon: "📚" },
  { label: "Generate a study plan", prompt: "Generate a study plan", icon: "📝" },
  { label: "Create quiz questions", prompt: "Create quiz questions", icon: "🎯" },
  { label: "Summarize notes", prompt: "Summarize notes", icon: "📖" },
  { label: "Draft an email", prompt: "Draft an email", icon: "📧" },
  { label: "Plan my week", prompt: "Plan my week", icon: "📅" }
];

export default function FloatingCopilot() {
  const {
    chatMessages,
    aiLoading,
    handleSendPrompt,
    detailsOpen,
    toggleDetails,
    handleCopyResponse,
    isCopilotOpen: isOpen,
    setIsCopilotOpen: setIsOpen,
    profile
  } = useAiChat();

  const [inputVal, setInputVal] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Listen to global custom events for inter-component interaction
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
    };
    
    const handleSend = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setIsOpen(true);
      if (customEvent.detail) {
        handleSendPrompt(customEvent.detail);
      }
    };

    window.addEventListener("open-copilot", handleOpen);
    window.addEventListener("send-copilot-prompt", handleSend);
    
    return () => {
      window.removeEventListener("open-copilot", handleOpen);
      window.removeEventListener("send-copilot-prompt", handleSend);
    };
  }, [setIsOpen, handleSendPrompt]);

  const lastUserMessage = [...chatMessages].reverse().find(m => m.sender === "user")?.text;

  // Render nothing if user is not authenticated yet
  if (!profile) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 font-body select-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="absolute bottom-16 right-0 w-[380px] sm:w-[400px] h-[550px] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/50 bg-indigo-50/20 dark:bg-zinc-950/20 flex items-center justify-between shadow-xxs">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary shrink-0 animate-pulse" />
                <div className="text-left">
                  <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-100 font-outfit">CampusCopilot AI</h3>
                  <span className="text-[9px] text-zinc-45 block font-medium">Assistant agent online</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-left text-xs">
              
              {/* Suggested Questions Grid (Always at the top of the chat area) */}
              <div className="bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-100 dark:border-zinc-800/50 rounded-xl p-3 space-y-2">
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block font-outfit">
                  Suggested Questions
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => handleSendPrompt(q.prompt)}
                      className="p-2 text-xxs text-left border border-zinc-200/50 bg-white dark:border-zinc-800/60 dark:bg-zinc-950 hover:border-primary/50 dark:hover:border-indigo-500/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 rounded-lg transition-all flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer shadow-xxs"
                    >
                      <span className="shrink-0">{q.icon}</span>
                      <span className="truncate">{q.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col gap-1 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <div className={cn(
                    "p-3 rounded-2xl max-w-[85%] leading-normal font-medium shadow-xxs",
                    msg.sender === "user"
                      ? "bg-primary text-white rounded-tr-xs"
                      : "bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-100 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300 rounded-tl-xs whitespace-pre-line"
                  )}>
                    {msg.sender === "user" ? (
                      <div>{msg.text}</div>
                    ) : (
                      <MarkdownRenderer content={msg.text} />
                    )}

                    {/* Suggestion Chips inside the Welcome Message (first bot message) */}
                    {idx === 0 && msg.sender === "bot" && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-zinc-200/50 dark:border-zinc-800/50">
                        {SUGGESTION_CHIPS.map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => handleSendPrompt(chip)}
                            className="px-2 py-0.5 rounded-full bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-800/60 hover:border-primary/50 text-[8px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-primary dark:hover:text-indigo-400 cursor-pointer transition-colors"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Follow-up Suggestion Chips below subsequent bot messages */}
                    {idx > 0 && msg.sender === "bot" && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-zinc-200/50 dark:border-zinc-800/50">
                        {FOLLOW_UP_SUGGESTIONS.map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => handleSendPrompt(chip)}
                            className="px-2 py-0.5 rounded-full bg-white hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-800/60 hover:border-primary/50 text-[8px] font-bold text-zinc-650 dark:text-zinc-355 hover:text-primary dark:hover:text-indigo-400 cursor-pointer transition-colors"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.sender === "bot" && (
                    <div className="w-full mt-1 flex items-center justify-between text-[9px] text-zinc-400 font-bold px-1 select-none">
                      {msg.details ? (
                        <button
                          onClick={() => toggleDetails(idx)}
                          className="inline-flex items-center gap-1 text-primary hover:underline cursor-pointer"
                        >
                          {detailsOpen[idx] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          <span>{detailsOpen[idx] ? "Hide Details" : "View Details"}</span>
                        </button>
                      ) : (
                        <div />
                      )}

                      <button
                        onClick={() => handleCopyResponse(msg.text)}
                        className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer transition-colors"
                        title="Copy full response"
                      >
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </button>
                    </div>
                  )}

                  {msg.sender === "bot" && msg.details && (
                    <AnimatePresence>
                      {detailsOpen[idx] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="w-full overflow-hidden border border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-950/30 p-2.5 rounded-xl mt-1 space-y-1.5 text-[9px] text-zinc-500 dark:text-zinc-400"
                        >
                          <div>
                            <strong className="block text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider text-[7px] mb-0.5">Sources Used:</strong>
                            <ul className="list-disc pl-3.5 space-y-0.5">
                              {msg.details.sources.map((s, si) => <li key={si}>{s}</li>)}
                            </ul>
                          </div>
                          <div>
                            <strong className="block text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider text-[7px] mb-0.5">Agents Involved:</strong>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {msg.details.agents.map((ag, ai) => (
                                <span key={ai} className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[7px] font-semibold text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-800/50">
                                  {ag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-[8px] text-zinc-400 pt-0.5 border-t border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center">
                            <span>Sync State</span>
                            <span>{msg.details.time}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}

              {aiLoading && (
                <div className="flex flex-col gap-1 items-start">
                  <div className="bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-100 dark:border-zinc-800/50 p-3 rounded-2xl rounded-tl-xs max-w-[85%] text-zinc-650 dark:text-zinc-400 flex items-center gap-2.5 shadow-xxs">
                    <div className="flex items-center gap-1 shrink-0">
                      <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">🤖 CampusCopilot is thinking...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/30 dark:bg-zinc-950/10 space-y-2 shadow-xxs">
              {lastUserMessage && !aiLoading && (
                <div className="flex justify-end pr-1">
                  <button
                    type="button"
                    onClick={() => handleSendPrompt(lastUserMessage)}
                    className="inline-flex items-center gap-1 text-[9px] font-bold text-primary hover:text-indigo-500 cursor-pointer border border-zinc-200/50 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 py-0.5 rounded-lg shadow-xxs transition-all hover:shadow-xs active:scale-98"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    <span>Regenerate response</span>
                  </button>
                </div>
              )}

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendPrompt(inputVal);
                }}
                className="relative flex items-center w-full"
              >
                <input
                  ref={chatInputRef}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="How can I help today?"
                  className="w-full pr-10 pl-3 py-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-primary/40 focus:border-primary/50 text-zinc-800 dark:text-zinc-100 shadow-xxs"
                />
                <button
                  type="submit"
                  className="absolute right-3 text-primary hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer disabled:text-zinc-300 disabled:dark:text-zinc-700 transition-colors"
                  disabled={!inputVal.trim()}
                  aria-label="Send query"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="h-14 w-14 rounded-full bg-primary hover:bg-indigo-650 dark:bg-indigo-650 dark:hover:bg-indigo-700 text-white shadow-lg flex items-center justify-center cursor-pointer transition-all border border-indigo-400/20 hover:shadow-xl relative"
        aria-label="Toggle CampusCopilot AI"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Bot className="h-6 w-6 animate-pulse" />
        )}
      </motion.button>
    </div>
  );
}
