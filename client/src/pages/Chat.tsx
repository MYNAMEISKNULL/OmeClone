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
      {/* Top Bar */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-sm z-50">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setLocation('/')}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
            <span className="font-bold text-white text-xs">NX</span>
          </div>
          <span className="font-display font-bold text-lg text-white">Nexus</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className={`w-2 h-2 rounded-full ${chatState === 'connected' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
          <span className="text-muted-foreground">
            {chatState === 'connected' ? 'Connected' : chatState === 'waiting' ? 'Searching...' : 'Idle'}
          </span>
        </div>
      </div>

      <div className="flex-1 p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 min-h-0">
        {/* Main Video Area */}
        <div className="lg:col-span-3 flex flex-col gap-4 relative">
          <div className="flex-1 relative rounded-3xl overflow-hidden bg-black/40 border border-white/5 shadow-2xl">
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
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                    <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
                  </div>
                  <h3 className="mt-8 text-2xl font-display font-medium text-white">Looking for a partner...</h3>
                  <p className="mt-2 text-muted-foreground">Connecting you with someone awesome</p>
                </motion.div>
              ) : (
                <motion.div
                  key="video"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full"
                >
                  <VideoDisplay 
                    stream={remoteStream} 
                    className="w-full h-full rounded-none border-none"
                    placeholder="Partner connecting..."
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Local Video (PIP) */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute bottom-6 right-6 w-48 aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-white/10 z-20 hover:scale-105 transition-transform duration-300"
            >
              <VideoDisplay stream={localStream} isLocal className="w-full h-full rounded-none border-none bg-black" />
            </motion.div>
          </div>

          {/* Controls Bar - Floating */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-md">
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
