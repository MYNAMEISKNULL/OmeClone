import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useWebRTC } from "@/hooks/use-web-rtc";
import { VideoDisplay } from "@/components/VideoDisplay";
import { ChatBox } from "@/components/ChatBox";
import { ReportDialog } from "@/components/ReportDialog";
import { Mic, MicOff, Camera, CameraOff, MessageCircle, Keyboard, Send, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useFeedback } from "@/hooks/use-feedback";
import { cn } from "@/lib/utils";
import logoUrl from "@assets/ChatGPT_Image_Jan_18,_2026,_08_40_11_AM_1768754432091.png";

export default function Chat() {
  const [, setLocation] = useLocation();
  const { playSound, triggerHaptic } = useFeedback();
  const { toast } = useToast();
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
  } = useWebRTC();

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isTextOnly, setIsTextOnly] = useState(false);
  const [isLocalVideoBlack, setIsLocalVideoBlack] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [isChatOpenOnMobile, setIsChatOpenOnMobile] = useState(false); // Add this back for toggle logic if needed elsewhere, but mainly to fix LSP errors if it's being used in a template string or similar

  useEffect(() => {
    if (chatState === 'connected') {
      playSound('success');
      triggerHaptic('heavy');
      if (window.innerWidth < 768) {
        setIsMobileChatOpen(true);
      }
    }
  }, [chatState]);

  const handleStartChat = () => {
    if (isLocalVideoBlack) {
      toast({
        title: "Camera is Black",
        description: "Please show yourself before starting a chat!",
        variant: "destructive"
      });
      return;
    }
    startChat();
  };

  const handleNextPartner = () => {
    if (isLocalVideoBlack) {
      toast({
        title: "Camera is Black",
        description: "Please show yourself before finding a new partner!",
        variant: "destructive"
      });
      stopChat();
      return;
    }
    nextPartner();
  };

  const handleStopChat = () => {
    stopChat();
  };

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage.isLocal) {
        playSound('message');
        triggerHaptic('light');
      }
    }
  }, [messages]);

  const takeSnapshot = async () => {
    const remoteVideo = document.querySelector('video[data-remote="true"]') as HTMLVideoElement;
    if (!remoteVideo || chatState !== 'connected') return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = remoteVideo.videoWidth;
      canvas.height = remoteVideo.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(remoteVideo, 0, 0);
        const link = document.createElement('a');
        link.download = `omeclone-snapshot-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
        toast({ title: "Snapshot Saved", description: "Memory captured successfully!" });
      }
    } catch (err) {
      toast({ title: "Snapshot Failed", description: "Could not capture video.", variant: "destructive" });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is typing in any input or textarea, ignore global shortcuts
      const activeElement = document.activeElement;
      const isInputFocused = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement;
      
      if (isInputFocused) {
        if (e.key === 'Escape') (activeElement as HTMLElement).blur();
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'escape':
          if (chatState !== 'idle') handleStopChat();
          break;
        case 'enter':
          if (chatState === 'idle') {
            handleStartChat();
          } else if (chatState === 'connected') {
            handleNextPartner();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chatState, isLocalVideoBlack, handleStartChat, handleNextPartner, handleStopChat]);

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col font-sans">
      {/* OmeClone Header */}
      <div className="h-12 px-4 flex items-center justify-between bg-card border-b border-border z-50 shrink-0">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-7 h-7 overflow-hidden group-hover:scale-105 transition-transform">
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-foreground text-lg tracking-tight group-hover:text-primary transition-colors">Ome<span className="text-primary group-hover:text-foreground transition-colors">Clone</span></span>
          </div>
        </Link>
        
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
                  <p className="text-xs font-semibold text-muted-foreground mb-1 text-left">Keyboard Shortcuts</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">New / Next Chat</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono border border-border shadow-sm">ENTER</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Stop Chat</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono border border-border shadow-sm">ESC</kbd>
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-background overflow-hidden p-2 gap-2 relative">
        {/* Left Section: Stacked Videos */}
        <div className="w-full md:w-[35%] lg:w-[30%] flex flex-col shrink-0 h-full overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Stranger Video */}
            <div className="flex-1 min-h-0 relative">
              <VideoDisplay 
                stream={remoteStream} 
                isVideoEnabled={partnerMediaStatus.video}
                className="w-full h-full rounded-lg overflow-hidden bg-card border border-border shadow-sm object-cover"
                data-remote="true"
                placeholder={
                  chatState === 'idle' ? (
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Stranger</span>
                    </div>
                  ) : (
                    <div className="loader-wrapper scale-75">
                      <div className="typing-dots">
                        <div className="dot animate-dot-1 bg-[#00f2ff] w-2 h-2 rounded-full" />
                        <div className="dot animate-dot-2 bg-[#bc13fe] w-2 h-2 rounded-full" />
                        <div className="dot animate-dot-3 bg-[#ff0055] w-2 h-2 rounded-full" />
                      </div>
                    </div>
                  )
                }
              />
            </div>

            {/* Your Video */}
            <div className="flex-1 min-h-0 relative mt-2">
              <VideoDisplay 
                stream={localStream} 
                isLocal 
                isVideoEnabled={isVideoEnabled}
                onBlackFrameChange={setIsLocalVideoBlack}
                className="w-full h-full rounded-lg overflow-hidden bg-card border border-border shadow-sm object-cover" 
              />
            </div>
          </div>
          
          {/* Mobile Bottom Bar (Always visible) */}
          <div className="md:hidden h-20 px-3 bg-card border border-border rounded-xl flex items-center gap-3 shrink-0 mt-2">
             <div className="flex flex-col gap-1 min-w-[100px]">
               {chatState === 'idle' ? (
                 <Button 
                    onClick={handleStartChat}
                    size="sm"
                    className={cn(
                      "h-14 w-full font-bold rounded-lg flex flex-col items-center justify-center gap-0.5 shadow-lg transition-all active:scale-95",
                      isLocalVideoBlack ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    )}
                  >
                    <span className="text-xs uppercase tracking-wider">Start</span>
                    <span className="text-[9px] opacity-70 font-medium">ENTER</span>
                  </Button>
               ) : chatState === 'waiting' ? (
                 <Button 
                    onClick={handleStopChat}
                    variant="destructive"
                    size="sm"
                    className="h-14 w-full font-bold flex flex-col items-center justify-center gap-0.5 uppercase rounded-lg shadow-lg active:scale-95"
                  >
                    <span className="text-xs tracking-wider">Stop</span>
                    <span className="text-[9px] opacity-70 font-medium">ESC</span>
                  </Button>
               ) : (
                 <Button 
                    onClick={handleNextPartner}
                    size="sm"
                    className={cn(
                      "h-14 w-full font-bold rounded-lg flex flex-col items-center justify-center gap-0.5 shadow-lg transition-all active:scale-95",
                      isLocalVideoBlack ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    )}
                  >
                    <span className="text-xs uppercase tracking-wider">Next</span>
                    <span className="text-[9px] opacity-70 font-medium">ENTER</span>
                  </Button>
               )}
             </div>
             <Button
                variant="secondary"
                className="flex-1 h-12 rounded-xl border border-border flex items-center justify-center gap-2"
                onClick={() => setIsMobileChatOpen(true)}
              >
                <MessageCircle className="w-5 h-5" />
                <span>Chat</span>
                {messages.length > 0 && (
                  <span className="bg-primary text-primary-foreground text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                    {messages.length}
                  </span>
                )}
                <ChevronUp className="w-4 h-4 ml-auto opacity-50" />
              </Button>
          </div>
        </div>

        {/* Desktop Chat Area */}
        <div className="hidden md:flex flex-1 flex-col bg-card border border-border rounded-lg min-w-0 shadow-sm overflow-hidden">
          <div className="flex-1 overflow-hidden">
             <ChatBox 
                messages={messages} 
                onSendMessage={sendMessage} 
                onTyping={sendTyping}
                isPartnerTyping={isTyping}
                disabled={chatState !== 'connected'} 
                className="h-full border-none bg-transparent"
              />
          </div>
          
          <div className="h-20 px-3 bg-card border-t border-border flex items-center gap-3 shrink-0">
             <div className="flex flex-col gap-1 min-w-[120px]">
               {chatState === 'idle' ? (
                 <Button 
                    onClick={handleStartChat}
                    className={cn(
                      "h-14 w-full font-bold rounded-xl flex flex-col items-center justify-center gap-0.5 shadow-lg transition-all active:scale-95",
                      isLocalVideoBlack ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
                    )}
                  >
                    <span className="text-sm uppercase tracking-wider">Start</span>
                    <span className="text-[10px] opacity-70 font-medium">ENTER</span>
                  </Button>
               ) : chatState === 'waiting' ? (
                 <Button 
                    onClick={handleStopChat}
                    variant="destructive"
                    className="h-14 w-full font-bold flex flex-col items-center justify-center gap-0.5 uppercase rounded-xl shadow-lg shadow-destructive/20 active:scale-95"
                  >
                    <span className="text-sm tracking-wider">Stop</span>
                    <span className="text-[10px] opacity-70 font-medium">ESC</span>
                  </Button>
               ) : (
                 <Button 
                    onClick={handleNextPartner}
                    className={cn(
                      "h-14 w-full font-bold rounded-xl flex flex-col items-center justify-center gap-0.5 shadow-lg transition-all active:scale-95",
                      isLocalVideoBlack ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
                    )}
                  >
                    <span className="text-sm uppercase tracking-wider">Next</span>
                    <span className="text-[10px] opacity-70 font-medium">ENTER</span>
                  </Button>
               )}
             </div>
              
              <div className="flex-1 relative flex items-center gap-2">
                <input 
                   disabled={chatState !== 'connected'}
                   placeholder="Type a message..."
                   className="flex-1 h-14 bg-background border border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-base"
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                       sendMessage(e.currentTarget.value);
                       e.currentTarget.value = "";
                     }
                   }}
                />
                <button 
                  disabled={chatState !== 'connected'}
                  onClick={() => {
                    const input = document.querySelector('input') as HTMLInputElement;
                    if (input && input.value.trim()) {
                      sendMessage(input.value);
                      input.value = "";
                    }
                  }}
                  className="absolute right-4 text-primary hover:text-primary/80 transition-colors disabled:opacity-30 p-2"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
          </div>
        </div>

        {/* Mobile Sliding Chat Overlay (Drawer) */}
        <Drawer open={isMobileChatOpen} onOpenChange={setIsMobileChatOpen}>
          <DrawerContent className="h-[85vh] p-0 flex flex-col bg-background outline-none border-t border-border">
            <DrawerHeader className="shrink-0 border-b border-border bg-card/50 backdrop-blur-md px-4 py-3 flex items-center justify-between">
              <DrawerTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                Chatting with Stranger
              </DrawerTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsMobileChatOpen(false)} className="text-xs h-8 px-2">
                Minimize
              </Button>
            </DrawerHeader>
            <div className="flex-1 overflow-hidden">
               <ChatBox 
                  messages={messages} 
                  onSendMessage={sendMessage} 
                  onTyping={sendTyping}
                  isPartnerTyping={isTyping}
                  disabled={chatState !== 'connected'} 
                  className="h-full border-none bg-transparent"
                />
            </div>
            <div className="h-24 px-4 bg-card border-t border-border flex items-center gap-3 shrink-0 pb-8">
              <div className="flex-1 relative flex items-center gap-2">
                <input 
                   disabled={chatState !== 'connected'}
                   placeholder="Type a message..."
                   className="flex-1 h-12 bg-background border border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-base"
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                       sendMessage(e.currentTarget.value);
                       e.currentTarget.value = "";
                     }
                   }}
                />
                <button 
                  disabled={chatState !== 'connected'}
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Type a message..."]') as HTMLInputElement;
                    if (input && input.value.trim()) {
                      sendMessage(input.value);
                      input.value = "";
                    }
                  }}
                  className="absolute right-3 text-primary p-2"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      <ReportDialog open={isReportOpen} onOpenChange={setIsReportOpen} />
    </div>
  );
}
