"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Bot, 
  Send, 
  Copy, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { useAiChat } from "@/context/ai-chat-context";
import MarkdownRenderer from "../home/MarkdownRenderer";

export default function AiAssistantPage() {
  const router = useRouter();
  const { 
    chatMessages, 
    aiLoading, 
    handleSendPrompt, 
    detailsOpen, 
    toggleDetails, 
    handleCopyResponse 
  } = useAiChat();

  const [inputVal, setInputVal] = useState("");
  const chatInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || aiLoading) return;
    const txt = inputVal;
    setInputVal("");
    await handleSendPrompt(txt);
  };

  const handleSuggestClick = (prompt: string) => {
    handleSendPrompt(prompt);
  };

  const lastUserMessage = [...chatMessages].reverse().find(m => m.sender === "user")?.text;

  // No conversation means no messages from the user have been sent yet (only initial bot greeting message at index 0)
  const hasNoConversation = chatMessages.filter(m => m.sender === "user").length === 0;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 select-none pb-12 font-body text-zinc-950 dark:text-zinc-50 font-medium">
      
      {/* Back Button */}
      <div className="flex items-center justify-start">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/home")}
          className="flex items-center gap-2 text-zinc-650 dark:text-zinc-350 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
      </div>

      <div className="text-left space-y-1">
        <h1 className="text-2xl md:text-3xl font-black font-outfit tracking-tight text-zinc-900 dark:text-zinc-50">
          CampusCopilot Workspace
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
          Your full screen study hub with shared workspace memory, tone personalization, and calendar synching.
        </p>
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800/60 shadow-xs rounded-2xl overflow-hidden h-[620px] flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/50 bg-indigo-50/20 dark:bg-zinc-950/20 flex items-center justify-between shadow-xxs shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="h-5.5 w-5.5 text-primary shrink-0 animate-pulse" />
              <div className="text-left">
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 font-outfit">CampusCopilot AI Workspace</h3>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block font-medium">Synced conversation instance active</span>
              </div>
            </div>
          </div>

          {/* Chat Container */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            
            {hasNoConversation ? (
              /* Centered Empty State */
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-6 max-w-sm mx-auto h-full">
                <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-primary dark:text-indigo-400 flex items-center justify-center shadow-xxs">
                  <Bot className="h-8 w-8 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-black font-outfit text-zinc-900 dark:text-zinc-50">🤖 CampusCopilot</h2>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 font-bold">Start a new conversation.</p>
                </div>
                
                <div className="w-full text-left space-y-2.5">
                  <span className="text-[10px] text-zinc-450 dark:text-zinc-500 font-bold uppercase tracking-wider block">Suggested Questions:</span>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      "Explain a concept",
                      "Generate study notes",
                      "Create a quiz",
                      "Help me prepare for exams"
                    ].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => handleSuggestClick(q)}
                        className="w-full p-3.5 bg-zinc-50 dark:bg-zinc-950/40 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 border border-zinc-150/40 dark:border-zinc-800/60 rounded-xl transition-all text-xs font-bold text-zinc-700 dark:text-zinc-350 hover:text-primary dark:hover:text-indigo-400 cursor-pointer flex items-center justify-between text-left shadow-xxs"
                      >
                        <span>• {q}</span>
                        <span>➔</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Chat bubbles list when there is conversation */
              <div className="space-y-4">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 max-w-[85%] text-left ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                    
                    {/* Avatar */}
                    <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold shadow-xxs select-none ${
                      msg.sender === "user" 
                        ? "bg-indigo-600 text-white" 
                        : "bg-zinc-100 dark:bg-zinc-800 text-primary border border-zinc-200/50 dark:border-zinc-800"
                    }`}>
                      {msg.sender === "user" ? "U" : <Bot className="h-4.5 w-4.5" />}
                    </div>

                    {/* Bubble */}
                    <div className="space-y-1.5 w-full">
                      <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed border ${
                        msg.sender === "user"
                          ? "bg-primary border-primary text-white"
                          : "bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200/50 dark:border-zinc-800/60 text-zinc-900 dark:text-zinc-100"
                      }`}>
                        {msg.sender === "bot" ? (
                          <div className="prose dark:prose-invert max-w-none text-xs font-medium leading-relaxed font-body">
                            <MarkdownRenderer content={msg.text} />
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        )}
                      </div>

                      {/* Metadata & Actions (Bot only) */}
                      {msg.sender === "bot" && (
                        <div className="flex flex-wrap items-center gap-3 px-1 text-[9px] font-semibold text-zinc-400 dark:text-zinc-500">
                          <button 
                            type="button"
                            onClick={() => handleCopyResponse(msg.text)}
                            className="flex items-center gap-1 hover:text-zinc-650 dark:hover:text-zinc-350 cursor-pointer"
                          >
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </button>

                          {msg.details ? (
                            <button
                              type="button"
                              onClick={() => toggleDetails(idx)}
                              className="inline-flex items-center gap-1 text-primary hover:underline cursor-pointer"
                            >
                              {detailsOpen[idx] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              <span>{detailsOpen[idx] ? "Hide Details" : "View Details"}</span>
                            </button>
                          ) : (
                            <span>Generated by CampusCopilot AI</span>
                          )}

                          {msg.details && detailsOpen[idx] && (
                            <div className="w-full mt-2 p-3 bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200/50 dark:border-zinc-850/60 rounded-xl space-y-2 text-zinc-500 dark:text-zinc-400 animate-slideDown">
                              <div>
                                <span className="block text-[8px] font-black uppercase text-zinc-400 dark:text-zinc-500">Execution Time</span>
                                <span className="text-[9px] font-semibold">{msg.details.time}</span>
                              </div>
                              <div>
                                <span className="block text-[8px] font-black uppercase text-zinc-400 dark:text-zinc-500">Sources Contacted</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {msg.details.sources.map((s, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-[8px] font-bold">{s}</span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="block text-[8px] font-black uppercase text-zinc-400 dark:text-zinc-500">Agent Flow Execution</span>
                                <div className="flex items-center gap-1.5 mt-1 font-bold text-[8.5px]">
                                  {msg.details.agents.map((a, i) => (
                                    <React.Fragment key={i}>
                                      {i > 0 && <span>➔</span>}
                                      <span className="text-primary">{a}</span>
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Follow-up chips */}
                {!aiLoading && chatMessages.length > 1 && chatMessages[chatMessages.length - 1].sender === "bot" && (
                  <div className="flex flex-wrap gap-1.5 pl-11 text-left mt-3">
                    {[
                      "Continue Learning",
                      "Explain with an Example",
                      "Generate Practice Questions",
                      "Summarize",
                      "Simplify"
                    ].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleSuggestClick(chip)}
                        className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-[9px] font-bold text-zinc-650 dark:text-zinc-350 hover:border-primary/50 hover:bg-zinc-50 dark:hover:bg-zinc-850 hover:text-primary transition-all cursor-pointer shadow-xxs"
                      >
                        {chip}
                      </button>
                    ))}
                    {lastUserMessage && (
                      <button
                        type="button"
                        onClick={() => handleSuggestClick(lastUserMessage)}
                        className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-[9px] font-bold text-indigo-600 dark:text-indigo-400 hover:border-primary/50 hover:bg-zinc-50 dark:hover:bg-zinc-850 hover:text-indigo-700 transition-all cursor-pointer shadow-xxs flex items-center gap-1"
                      >
                        <RotateCcw className="h-2.5 w-2.5" />
                        <span>Regenerate Response</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Thinking State */}
            {aiLoading && (
              <div className="flex gap-3 max-w-[85%] text-left mr-auto pt-2">
                <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold shadow-xxs bg-zinc-100 dark:bg-zinc-800 text-primary border border-zinc-200/50 dark:border-zinc-800">
                  <Bot className="h-4.5 w-4.5 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="p-3.5 rounded-2xl text-xs font-semibold leading-relaxed border bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200/50 dark:border-zinc-800/60 text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                    <div className="flex space-x-1 items-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                    </div>
                    <span>🤖 CampusCopilot is thinking...</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer Input Area */}
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/50 shrink-0">
            <form onSubmit={onSubmit} className="flex gap-2">
              <input
                ref={chatInputRef}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask CampusCopilot about schedule venue details, tasks, or course slides..."
                className="flex-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-950 dark:text-zinc-50 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary/50 transition-all font-semibold"
                disabled={aiLoading}
              />
              <Button
                type="submit"
                disabled={!inputVal.trim() || aiLoading}
                className="bg-primary hover:bg-indigo-500 text-white font-bold text-xs p-2.5 rounded-xl shadow-xs cursor-pointer transition-all shrink-0 flex items-center justify-center w-10 h-10 active:scale-95"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>

        </Card>
      </motion.div>

    </div>
  );
}
