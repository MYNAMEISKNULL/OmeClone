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
  disabled?: boolean;
  className?: string;
}

export function ChatBox({ messages, onSendMessage, disabled, className }: ChatBoxProps) {
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-card", className)}>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-border"
      >
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
                "px-3 py-2 rounded-2xl text-sm leading-relaxed break-words shadow-sm",
                msg.isLocal 
                  ? "bg-primary text-primary-foreground rounded-tr-none" 
                  : "bg-muted text-foreground rounded-tl-none border border-border"
              )}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 px-1">
              {msg.isLocal ? "You" : "Stranger"}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex gap-2">
          <Input
            data-testid="input-chat"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            disabled={disabled}
            className="rounded-xl bg-background border-border focus-visible:ring-primary/20"
          />
          <Button 
            data-testid="button-send"
            type="submit" 
            size="icon" 
            disabled={disabled || !inputValue.trim()}
            className="rounded-xl shrink-0 transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
