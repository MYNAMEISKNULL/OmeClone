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
    <div className="h-screen bg-background overflow-hidden flex flex-col">
      {/* Top Bar removed and replaced by global Header component */}
      <div className="h-16" /> {/* Spacer for the floating header */}

      <div className="flex-1 p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-0 max-w-[1800px] mx-auto w-full">
        {/* Main Video Area */}
        <div className="lg:col-span-3 flex flex-col gap-6 relative">
          <div className="flex-1 relative rounded-[3rem] overflow-hidden bg-black/60 border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
            {/* Remote Video (Main) */}
            <AnimatePresence mode="wait">
              {chatState === 'waiting' ? (
                <motion.div 
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/5 rounded-full blur-[100px] animate-pulse" />
                    <Loader2 className="w-10 h-10 text-primary/20 animate-spin relative z-10" />
                  </div>
                  <h3 className="mt-8 text-lg font-display font-light text-white/40 tracking-widest uppercase">Connecting</h3>
                </motion.div>
              ) : (
                <motion.div
                  key="video"
                  initial={{ opacity: 0, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 1 }}
                  className="w-full h-full"
                >
                  <VideoDisplay 
                    stream={remoteStream} 
                    className="w-full h-full rounded-none border-none object-cover"
                    placeholder="Establishing connection..."
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Local Video (PIP) */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="absolute bottom-10 right-10 w-44 aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/5 z-20 hover:scale-105 transition-transform duration-700 backdrop-blur-xl bg-black/10"
            >
              <VideoDisplay stream={localStream} isLocal className="w-full h-full rounded-none border-none bg-transparent" />
            </motion.div>
          </div>

          {/* Controls Bar - Floating */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 w-full max-w-xs">
            <Controls 
              onNext={nextPartner} 
              onStop={() => {
                stopChat();
                setLocation('/');
              }} 
              onReport={() => setIsReportOpen(true)}
              state={chatState}
              localStream={localStream}
            />
          </div>
        </div>

        {/* Sidebar Chat */}
        <div className="hidden lg:block lg:col-span-1 h-full min-h-0">
          <ChatBox 
            messages={messages} 
            onSendMessage={sendMessage} 
            disabled={chatState !== 'connected'} 
          />
        </div>
      </div>

      <ReportDialog open={isReportOpen} onOpenChange={setIsReportOpen} />
    </div>
  );
}
