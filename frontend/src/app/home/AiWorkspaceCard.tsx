"use client";

import React, { useState, useRef } from "react";
import { 
  Bot, 
  Send, 
  Copy, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { useAiChat } from "@/context/ai-chat-context";
import MarkdownRenderer from "./MarkdownRenderer";

export default function AiWorkspaceCard() {
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
    <Card className="bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800/60 shadow-xs rounded-2xl overflow-hidden h-[620px] flex flex-col justify-between">
      
      {/* Header */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/50 bg-indigo-50/20 dark:bg-zinc-950/20 flex items-center justify-between shadow-xxs shrink-0">
        <div className="flex items-center gap-2 text-left">
          <Bot className="h-4.5 w-4.5 text-primary shrink-0 animate-pulse" />
          <div>
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-100 font-outfit">CampusCopilot Workspace</h3>
            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block font-medium">Assistant shared instance</span>
          </div>
        </div>
      </div>

      {/* Chat messages viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {hasNoConversation ? (
          /* Centered Empty State */
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-5 max-w-xs mx-auto h-full">
            <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-primary dark:text-indigo-400 flex items-center justify-center shadow-xxs animate-fadeIn">
              <Bot className="h-7 w-7 animate-bounce" />
            </div>
            <div className="space-y-1 text-center">
              <h2 className="text-sm font-black font-outfit text-zinc-900 dark:text-zinc-50">🤖 CampusCopilot</h2>
              <p className="text-[10px] text-zinc-405 dark:text-zinc-500 font-bold">Start a new conversation.</p>
            </div>
            
            <div className="w-full text-left space-y-2">
              <span className="text-[8px] text-zinc-450 dark:text-zinc-500 font-bold uppercase tracking-wider block">Suggested Questions:</span>
              <div className="grid grid-cols-1 gap-1.5">
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
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950/40 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 border border-zinc-150/40 dark:border-zinc-800/60 rounded-xl transition-all text-[10px] font-bold text-zinc-700 dark:text-zinc-350 hover:text-primary dark:hover:text-indigo-400 cursor-pointer flex items-center justify-between text-left shadow-xxs"
                  >
                    <span>• {q}</span>
                    <span>➔</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Chat Feed when there is conversation */
          <div className="space-y-4">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 max-w-[90%] text-left ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                
                {/* Avatar */}
                <div className={`h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold shadow-xxs select-none ${
                  msg.sender === "user" 
                    ? "bg-indigo-600 text-white" 
                    : "bg-zinc-100 dark:bg-zinc-800 text-primary border border-zinc-200/50 dark:border-zinc-805"
                }`}>
                  {msg.sender === "user" ? "U" : <Bot className="h-4 w-4" />}
                </div>

                {/* Bubble */}
                <div className="space-y-1 w-full">
                  <div className={`p-3 rounded-2xl text-[11px] font-medium leading-normal border ${
                    msg.sender === "user"
                      ? "bg-primary border-primary text-white"
                      : "bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200/50 dark:border-zinc-800/60 text-zinc-900 dark:text-zinc-100"
                  }`}>
                    {msg.sender === "bot" ? (
                      <div className="prose dark:prose-invert max-w-none text-[11px] font-medium leading-normal font-body">
                        <MarkdownRenderer content={msg.text} />
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>

                  {/* Actions & details (Bot only) */}
                  {msg.sender === "bot" && (
                    <div className="flex flex-wrap items-center gap-2 px-1 text-[8px] font-semibold text-zinc-400 dark:text-zinc-500">
                      <button 
                        type="button"
                        onClick={() => handleCopyResponse(msg.text)}
                        className="flex items-center gap-0.5 hover:text-zinc-600 dark:hover:text-zinc-350 cursor-pointer"
                      >
                        <Copy className="h-2.5 w-2.5" />
                        <span>Copy</span>
                      </button>

                      {msg.details ? (
                        <button
                          type="button"
                          onClick={() => toggleDetails(idx)}
                          className="inline-flex items-center gap-0.5 text-primary hover:underline cursor-pointer"
                        >
                          {detailsOpen[idx] ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
                          <span>{detailsOpen[idx] ? "Hide Details" : "View Details"}</span>
                        </button>
                      ) : (
                        <span>AI Suggested</span>
                      )}

                      {msg.details && detailsOpen[idx] && (
                        <div className="w-full mt-1.5 p-2.5 bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200/50 dark:border-zinc-855/60 rounded-xl space-y-1.5 text-zinc-500 dark:text-zinc-400 animate-slideDown">
                          <div>
                            <span className="block text-[7px] font-black uppercase text-zinc-400 dark:text-zinc-500">Latency</span>
                            <span className="text-[8px] font-semibold">{msg.details.time}</span>
                          </div>
                          <div>
                            <span className="block text-[7px] font-black uppercase text-zinc-400 dark:text-zinc-500">Sources</span>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {msg.details.sources.map((s, i) => (
                                <span key={i} className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-[7px] font-bold">{s}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="block text-[7px] font-black uppercase text-zinc-400 dark:text-zinc-500">Execution Flows</span>
                            <div className="flex items-center gap-1 mt-0.5 font-bold text-[7.5px]">
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

            {/* Follow ups */}
            {!aiLoading && chatMessages.length > 1 && chatMessages[chatMessages.length - 1].sender === "bot" && (
              <div className="flex flex-wrap gap-1 pl-9 text-left mt-3">
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
                    className="px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 rounded-full text-[8px] font-bold text-zinc-650 dark:text-zinc-350 hover:border-primary/50 hover:bg-zinc-50 hover:text-primary transition-all cursor-pointer shadow-xxs"
                  >
                    {chip}
                  </button>
                ))}
                {lastUserMessage && (
                  <button
                    type="button"
                    onClick={() => handleSuggestClick(lastUserMessage)}
                    className="px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-805 rounded-full text-[8px] font-bold text-indigo-600 dark:text-indigo-400 hover:border-primary/50 hover:bg-zinc-50 hover:text-indigo-700 transition-all cursor-pointer shadow-xxs flex items-center gap-0.5"
                  >
                    <RotateCcw className="h-2 w-2" />
                    <span>Regenerate</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Loading bubble */}
        {aiLoading && (
          <div className="flex gap-2 max-w-[90%] text-left mr-auto pt-2">
            <div className="h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold shadow-xxs bg-zinc-100 dark:bg-zinc-800 text-primary border border-zinc-200/50 dark:border-zinc-805">
              <Bot className="h-4 w-4 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="p-3 rounded-2xl text-[11px] font-semibold leading-normal border bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200/50 dark:border-zinc-800/60 text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <div className="flex space-x-1 items-center">
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                </div>
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Input Form footer */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/50 shrink-0">
        <form onSubmit={onSubmit} className="flex gap-1.5">
          <input
            ref={chatInputRef}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask CampusCopilot..."
            className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80 rounded-xl text-[11px] text-zinc-950 dark:text-zinc-50 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary/50 transition-all font-semibold"
            disabled={aiLoading}
          />
          <Button
            type="submit"
            disabled={!inputVal.trim() || aiLoading}
            className="bg-primary hover:bg-indigo-500 text-white font-bold text-[11px] p-2 rounded-xl shadow-xs cursor-pointer transition-all shrink-0 flex items-center justify-center w-8 h-8 active:scale-95 animate-fadeIn"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>

    </Card>
  );
}
