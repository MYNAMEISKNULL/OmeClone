import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChatSkeleton } from "./ui/loaders";

interface Message {
  id: string;
  text: string;
  isLocal: boolean;
  timestamp: Date;
}

interface ChatBoxProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  onTyping?: (isTyping: boolean) => void;
  isPartnerTyping?: boolean;
  disabled?: boolean;
  className?: string;
  isLoading?: boolean;
}

export function ChatBox({ 
  messages, 
  onSendMessage, 
  onTyping, 
  isPartnerTyping, 
  disabled, 
  className,
  isLoading 
}: ChatBoxProps) {
  const [inputValue, setInputValue] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isPartnerTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
    if (onTyping) {
      onTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue("");
      if (onTyping) {
        onTyping(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-card", className)}>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
      >
        {isLoading ? (
          <ChatSkeleton />
        ) : (
          <>
            <div className="text-red-500 mb-6 text-center py-2 px-4 text-xs md:text-sm font-bold animate-in zoom-in-95 duration-500">
              Connect with new people — keep it decent, safe, and friendly.
            </div>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                  msg.isLocal ? "ml-auto items-end" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words shadow-sm",
                    msg.isLocal 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-muted text-foreground rounded-tl-none border border-border"
                  )}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                  {msg.isLocal ? "You" : "Stranger"} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {isPartnerTyping && (
              <div className="flex items-center gap-2 p-1 animate-in fade-in slide-in-from-bottom-1">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-dot-1" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-dot-2" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-dot-3" />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Stranger is typing</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
