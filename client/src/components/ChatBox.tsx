import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
}

export function ChatBox({ messages, onSendMessage, onTyping, isPartnerTyping, disabled, className }: ChatBoxProps) {
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
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none md:scrollbar-thin scrollbar-thumb-border"
      >
        <div className="text-muted-foreground mb-6 text-center py-2 px-3 bg-muted/30 rounded-lg text-xs md:text-sm">
          You're connected to a stranger. Say hello!
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
      </div>

      <form onSubmit={handleSubmit} className="p-3 md:p-4 border-t border-border bg-card/50 backdrop-blur-sm shrink-0">
        <div className="flex gap-2">
          <Input
            data-testid="input-chat"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type a message..."
            disabled={disabled}
            autoComplete="off"
            className="rounded-xl bg-background border-border focus-visible:ring-primary/20 h-10 md:h-11"
          />
          <Button 
            data-testid="button-send"
            type="submit" 
            size="icon" 
            disabled={disabled || !inputValue.trim()}
            className="rounded-xl shrink-0 transition-all active:scale-95 h-10 w-10 md:h-11 md:w-11"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
