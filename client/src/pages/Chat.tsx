import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useWebRTC } from "@/hooks/use-web-rtc";
import { VideoDisplay } from "@/components/VideoDisplay";
import { ChatBox } from "@/components/ChatBox";
import { Controls } from "@/components/Controls";
import { ReportDialog } from "@/components/ReportDialog";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Chat() {
  const [, setLocation] = useLocation();
  const { 
    localStream, 
    remoteStream, 
    chatState, 
    messages, 
    startChat, 
    nextPartner, 
    stopChat, 
    sendMessage,
    error 
  } = useWebRTC();

  const [isReportOpen, setIsReportOpen] = useState(false);

  // Auto-start chat on mount
  useEffect(() => {
    startChat();
    // Cleanup handled in hook
  }, []);

  // Handle fatal error
  useEffect(() => {
    if (error) {
      // alert(error); // Removed alert to prevent jumping
      // setLocation('/'); // Removed redirect to allow user to see what happened
    }
  }, [error]);

  return (
    <div className="h-screen bg-[#1a1a1a] overflow-hidden flex flex-col font-sans">
      {/* Top Bar */}
      <div className="h-12 px-4 flex items-center justify-between bg-[#1a1a1a] border-b border-white/5 z-50">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-lg tracking-tight">OmeClone</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-white/60">24,000+ Online</span>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 bg-[#0a0a0a]">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#000000]">
          <div className="flex-1 p-2 grid grid-cols-1 md:grid-cols-2 gap-2 min-h-0">
            {/* Remote Video */}
            <div className="relative rounded-lg overflow-hidden bg-[#2a3441] border border-white/5 flex items-center justify-center">
              <VideoDisplay 
                stream={remoteStream} 
                className="w-full h-full object-cover"
                placeholder={<div className="flex flex-col items-center gap-4 text-white/20">
                  <div className="w-16 h-16 border-2 border-white/10 rounded-xl flex items-center justify-center">
                    <Video className="w-8 h-8" />
                  </div>
                </div>}
              />
              <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs text-white/80 border border-white/10">
                Stranger
              </div>
            </div>

            {/* Local Video */}
            <div className="relative rounded-lg overflow-hidden bg-[#2a3441] border border-white/5 flex items-center justify-center">
              <VideoDisplay 
                stream={localStream} 
                isLocal 
                className="w-full h-full object-cover" 
              />
              <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs text-white/80 border border-white/10">
                You
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="h-20 px-4 bg-[#1a1a1a] border-t border-white/5 flex items-center gap-4">
            <Button 
              onClick={() => {
                stopChat();
                setLocation('/');
              }}
              className="h-12 px-8 bg-[#ff4b5c] hover:bg-[#ff3246] text-white font-bold rounded-lg uppercase tracking-wider"
            >
              STOP
            </Button>
            <Button 
              onClick={nextPartner}
              className="flex-1 h-12 bg-white hover:bg-white/90 text-black font-bold rounded-lg uppercase tracking-wider text-base"
            >
              {chatState === 'waiting' ? 'FINDING STRANGER...' : 'NEW STRANGER'}
            </Button>
          </div>
        </div>

        {/* Sidebar Chat */}
        <div className="w-80 border-l border-white/5 flex flex-col bg-[#1a1a1a]">
          <div className="p-4 flex-1 overflow-y-auto text-sm">
            <div className="text-white/60 mb-4 text-center">You're connected to a stranger. Say hello!</div>
            <ChatBox 
              messages={messages} 
              onSendMessage={sendMessage} 
              disabled={chatState !== 'connected'} 
              className="h-full border-none bg-transparent"
            />
          </div>
        </div>
      </div>

      <ReportDialog open={isReportOpen} onOpenChange={setIsReportOpen} />
    </div>
  );
}
