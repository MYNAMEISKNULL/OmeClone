import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useWebRTC } from "@/hooks/use-web-rtc";
import { VideoDisplay } from "@/components/VideoDisplay";
import { ChatBox } from "@/components/ChatBox";
import { ReportDialog } from "@/components/ReportDialog";
import { Video as VideoIcon, Users, Mic, MicOff, Camera, CameraOff, MessageCircle, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { motion } from "framer-motion";

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
    sendTyping,
    isTyping,
    toggleAudio,
    toggleVideo,
    isAudioEnabled,
    isVideoEnabled,
    partnerMediaStatus,
    onlineCount,
    error 
  } = useWebRTC();

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'escape':
          if (chatState !== 'idle') stopChat();
          break;
        case 'enter':
          if (chatState === 'idle') {
            startChat();
          } else {
            nextPartner();
          }
          break;
        case 'm':
          toggleAudio();
          break;
        case 'v':
          toggleVideo();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chatState, startChat, nextPartner, stopChat, toggleAudio, toggleVideo]);

  useEffect(() => {
    startChat();
  }, [startChat]);

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col font-sans">
      {/* Top Bar */}
      <div className="h-12 px-4 flex items-center justify-between bg-card border-b border-border z-50 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground text-lg tracking-tight">Ome<span className="text-primary">Clone</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-accent/50">
                  <Keyboard className="w-4 h-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="w-64 p-4" align="end">
                <div className="grid gap-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Keyboard Shortcuts</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">New / Next Chat</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono border border-border shadow-sm">ENTER</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Stop Chat</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono border border-border shadow-sm">ESC</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Toggle Microphone</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono border border-border shadow-sm">M</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Toggle Camera</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono border border-border shadow-sm">V</kbd>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-muted-foreground font-medium">{onlineCount.toLocaleString()}+ Online</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-background overflow-hidden">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className="flex-1 p-2 grid grid-cols-1 md:grid-cols-2 gap-2 min-h-0 overflow-hidden">
            {/* Remote Video */}
            <div className="relative rounded-lg overflow-hidden bg-card border border-border flex items-center justify-center h-[40vh] md:h-full">
              <VideoDisplay 
                stream={remoteStream} 
                isVideoEnabled={partnerMediaStatus.video}
                className="w-full h-full object-cover"
                placeholder={
                  chatState === 'idle' ? (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-sm font-bold text-primary">PRESS START TO FIND STRANGER</span>
                    </div>
                  ) : (
                    <div className="loader-wrapper">
                      <div className="typing-dots">
                        <div className="dot animate-dot-1 bg-[#00f2ff] w-3 h-3 rounded-full" />
                        <div className="dot animate-dot-2 bg-[#bc13fe] w-3 h-3 rounded-full" />
                        <div className="dot animate-dot-3 bg-[#ff0055] w-3 h-3 rounded-full" />
                      </div>
                      <div className="status-text mt-4 text-sm font-medium text-muted-foreground/60 tracking-wider">FINDING STRANGER...</div>
                    </div>
                  )
                }
              />
              <div className="absolute top-4 right-4 flex gap-2">
                {!partnerMediaStatus.audio && (
                  <div className="p-2 bg-destructive/10 backdrop-blur-md rounded-full text-destructive border border-destructive/20">
                    <MicOff className="w-4 h-4" />
                  </div>
                )}
                {!partnerMediaStatus.video && (
                  <div className="p-2 bg-destructive/10 backdrop-blur-md rounded-full text-destructive border border-destructive/20">
                    <CameraOff className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="absolute bottom-4 left-4 px-3 py-1 bg-background/80 backdrop-blur-md rounded-full text-xs font-medium text-foreground border border-border">
                Stranger
              </div>
            </div>

            {/* Local Video */}
            <div className="relative rounded-lg overflow-hidden bg-card border border-border flex items-center justify-center h-[40vh] md:h-full">
              <VideoDisplay 
                stream={localStream} 
                isLocal 
                isVideoEnabled={isVideoEnabled}
                className="w-full h-full object-cover" 
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="icon"
                  variant={isAudioEnabled ? "secondary" : "destructive"}
                  onClick={toggleAudio}
                  className="rounded-full w-10 h-10"
                  title="Shortcut: M"
                >
                  {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </Button>
                <Button
                  size="icon"
                  variant={isVideoEnabled ? "secondary" : "destructive"}
                  onClick={toggleVideo}
                  className="rounded-full w-10 h-10"
                  title="Shortcut: V"
                >
                  {isVideoEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                </Button>
              </div>
              <div className="absolute bottom-4 left-4 px-3 py-1 bg-background/80 backdrop-blur-md rounded-full text-xs font-medium text-foreground border border-border">
                You
              </div>
            </div>
          </div>

          {/* Age Warning */}
          <div className="relative h-7 bg-destructive/10 overflow-hidden flex items-center justify-center shrink-0 border-y border-destructive/20">
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 w-24 h-[1px] bg-destructive"
                animate={{
                  left: ["-100%", "200%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <motion.div
                className="absolute bottom-0 left-0 w-24 h-[1px] bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                animate={{
                  left: ["-100%", "200%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 1.5,
                }}
              />
            </div>
            <span className="relative z-10 text-[10px] font-bold text-destructive uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-destructive animate-pulse" />
              Warning: You must be 18+ to use this service. Please report inappropriate behavior.
              <span className="w-1 h-1 rounded-full bg-destructive animate-pulse" />
            </span>
          </div>

          {/* Bottom Bar */}
          <div className="h-20 px-4 bg-card border-t border-border flex items-center gap-4 shrink-0">
            {chatState === 'idle' ? (
              <Button 
                data-testid="button-start"
                onClick={startChat}
                className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg uppercase tracking-wider text-sm md:text-base shadow-lg shadow-primary/20"
                title="Shortcut: Enter"
              >
                START <span className="hidden lg:inline ml-2 opacity-50 text-[10px]">(ENTER)</span>
              </Button>
            ) : (
              <>
                <Button 
                  data-testid="button-stop"
                  variant="destructive"
                  onClick={stopChat}
                  className="h-12 px-6 md:px-8 font-bold rounded-lg uppercase tracking-wider text-xs md:text-sm"
                  title="Shortcut: Esc"
                >
                  STOP <span className="hidden lg:inline ml-2 opacity-50 text-[10px]">(ESC)</span>
                </Button>
                <Button 
                  data-testid="button-next"
                  onClick={nextPartner}
                  className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg uppercase tracking-wider text-sm md:text-base shadow-lg shadow-primary/20"
                  title="Shortcut: Enter"
                >
                  {chatState === 'waiting' ? 'FINDING STRANGER...' : 'NEW STRANGER'}
                  <span className="hidden lg:inline ml-2 opacity-50 text-[10px]">(ENTER)</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Sidebar Chat (Desktop) */}
        <div className="hidden md:flex w-80 h-full border-l border-border flex-col bg-card shrink-0">
          <ChatBox 
            messages={messages} 
            onSendMessage={sendMessage} 
            onTyping={sendTyping}
            isPartnerTyping={isTyping}
            disabled={chatState !== 'connected'} 
            className="flex-1 border-none bg-transparent min-h-0"
          />
        </div>

        {/* Mobile Chat Drawer */}
        <Drawer open={isChatDrawerOpen} onOpenChange={setIsChatDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              size="icon"
              variant="secondary"
              className="md:hidden fixed bottom-24 right-4 z-50 rounded-full w-12 h-12 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[80vh] px-0">
            <DrawerHeader className="border-b shrink-0">
              <DrawerTitle className="text-center">Chat with Stranger</DrawerTitle>
            </DrawerHeader>
            <div className="flex-1 overflow-hidden flex flex-col">
              <ChatBox 
                messages={messages} 
                onSendMessage={sendMessage} 
                onTyping={sendTyping}
                isPartnerTyping={isTyping}
                disabled={chatState !== 'connected'} 
                className="flex-1 border-none bg-transparent"
              />
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      <ReportDialog open={isReportOpen} onOpenChange={setIsReportOpen} />
    </div>
  );
}
