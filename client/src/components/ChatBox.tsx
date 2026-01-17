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
    <div className="flex flex-col h-full bg-transparent">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
              msg.isLocal
                ? "ml-auto bg-[#2a3441] text-white"
                : "mr-auto bg-white/5 text-white/90"
            )}
          >
            {msg.content}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/5">
        <form onSubmit={handleSubmit} className="relative flex items-center bg-black/20 rounded-full border border-white/5 px-4 py-2 focus-within:border-white/20 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={disabled}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-white/20"
          />
          <Button
            type="submit"
            disabled={disabled || !input.trim()}
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80 font-bold uppercase tracking-tight ml-2"
          >
            SEND
          </Button>
        </form>
      </div>
    </div>
  );
}
