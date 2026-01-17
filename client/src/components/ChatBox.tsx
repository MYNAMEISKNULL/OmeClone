import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatBoxProps {
  messages: { id: string; content: string; isLocal: boolean }[];
  onSendMessage: (msg: string) => void;
  disabled?: boolean;
}

export function ChatBox({ messages, onSendMessage, disabled }: ChatBoxProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-card/30 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold tracking-wide text-white/90 font-display">LIVE CHAT</h3>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 p-8 text-center">
            <p className="text-sm">Say hello to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm font-medium break-words shadow-sm",
                msg.isLocal
                  ? "ml-auto bg-primary text-primary-foreground rounded-tr-sm"
                  : "mr-auto bg-secondary text-secondary-foreground rounded-tl-sm border border-white/5"
              )}
            >
              {msg.content}
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/40 border-t border-white/5">
        <form onSubmit={handleSubmit} className="relative flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={disabled}
            placeholder={disabled ? "Connecting..." : "Type a message..."}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50 disabled:opacity-50 disabled:cursor-not-allowed text-white"
          />
          <Button
            type="submit"
            disabled={disabled || !input.trim()}
            size="icon"
            className={cn(
              "h-auto aspect-square rounded-xl transition-all duration-300",
              input.trim() 
                ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" 
                : "bg-white/5 text-muted-foreground hover:bg-white/10"
            )}
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
