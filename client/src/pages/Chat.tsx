import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useWebRTC } from "@/hooks/use-web-rtc";
import { VideoDisplay } from "@/components/VideoDisplay";
import { ChatBox } from "@/components/ChatBox";
import { ReportDialog } from "@/components/ReportDialog";
import { Video as VideoIcon, Users, Mic, MicOff, Camera, CameraOff, MessageCircle, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useFeedback } from "@/hooks/use-feedback";
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
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [isTextOnly, setIsTextOnly] = useState(false);

  useEffect(() => {
    if (chatState === 'connected') {
      playSound('success');
      triggerHaptic('heavy');
    }
  }, [chatState]);

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
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === 'Escape') (e.target as HTMLElement).blur();
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

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col font-sans">
      {/* Top Bar */}
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTextOnly(!isTextOnly)}
            disabled={chatState !== 'idle'}
            className={`h-8 rounded-full border-primary/20 text-[10px] font-bold uppercase tracking-wider transition-all ${isTextOnly ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10 text-primary'} ${chatState !== 'idle' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isTextOnly ? 'Video: OFF' : 'Video: ON'}
          </Button>

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
        {/* Extended Chat Section (Left Side) */}
        <div className="flex-1 h-full flex flex-col bg-card min-w-0">
          <ChatBox 
            messages={messages} 
            onSendMessage={sendMessage} 
            onTyping={sendTyping}
            isPartnerTyping={isTyping}
            disabled={chatState !== 'connected'} 
            className="flex-1 border-none bg-transparent min-h-0"
          />
          
          {/* Bottom Control Bar */}
          <div className="h-20 px-4 bg-card border-t border-border flex items-center gap-4 shrink-0">
            {chatState === 'idle' ? (
              <Button 
                data-testid="button-start"
                onClick={() => {
                  playSound('pop');
                  triggerHaptic('medium');
                  startChat();
                }}
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
                  onClick={() => {
                    playSound('click');
                    triggerHaptic('light');
                    stopChat();
                  }}
                  className="h-12 px-6 md:px-8 font-bold rounded-lg uppercase tracking-wider text-xs md:text-sm"
                  title="Shortcut: Esc"
                >
                  STOP <span className="hidden lg:inline ml-2 opacity-50 text-[10px]">(ESC)</span>
                </Button>
                <Button 
                  data-testid="button-next"
                  onClick={() => {
                    playSound('pop');
                    triggerHaptic('medium');
                    nextPartner();
                  }}
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

        {/* Video Column (Right Side) */}
        <div className="w-full md:w-[400px] flex flex-col gap-2 p-2 border-l border-border bg-background shrink-0 overflow-y-auto">
          {/* Remote Video */}
          <div className={`relative rounded-lg overflow-hidden bg-card border border-border flex items-center justify-center transition-all duration-500 aspect-video md:aspect-square shrink-0 ${isTextOnly ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
            <VideoDisplay 
              stream={remoteStream} 
              isVideoEnabled={partnerMediaStatus.video}
              className="w-full h-full object-cover"
              data-remote="true"
              placeholder={
                chatState === 'idle' ? (
                  <div className="flex flex-col items-center gap-2">
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
            <div className="absolute top-2 right-2 flex gap-1.5">
              {chatState === 'connected' && (
                <div className="px-2 py-0.5 bg-background/80 backdrop-blur-md rounded-full text-[8px] font-bold border border-border flex items-center gap-1">
                  HQ
                </div>
              )}
              {!partnerMediaStatus.audio && (
                <div className="p-1.5 bg-destructive/10 backdrop-blur-md rounded-full text-destructive border border-destructive/20">
                  <MicOff className="w-3 h-3" />
                </div>
              )}
              {!partnerMediaStatus.video && (
                <div className="p-1.5 bg-destructive/10 backdrop-blur-md rounded-full text-destructive border border-destructive/20">
                  <CameraOff className="w-3 h-3" />
                </div>
              )}
            </div>
            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-background/80 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-foreground border border-border">
              Stranger
            </div>
          </div>

          {/* Local Video */}
          <div className={`relative rounded-lg overflow-hidden bg-card border border-border flex items-center justify-center transition-all duration-500 aspect-video md:aspect-square shrink-0 ${isTextOnly ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
            <VideoDisplay 
              stream={localStream} 
              isLocal 
              isVideoEnabled={isVideoEnabled}
              className="w-full h-full object-cover" 
            />
            <div className="absolute top-2 right-2 flex gap-1.5">
              <Button
                size="icon"
                variant="secondary"
                onClick={takeSnapshot}
                className="rounded-full w-8 h-8 bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20"
                title="Take Snapshot"
              >
                <Camera className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant={isAudioEnabled ? "secondary" : "destructive"}
                onClick={toggleAudio}
                className="rounded-full w-8 h-8"
              >
                {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
              <Button
                size="icon"
                variant={isVideoEnabled ? "secondary" : "destructive"}
                onClick={toggleVideo}
                className="rounded-full w-8 h-8"
              >
                {isVideoEnabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
              </Button>
            </div>
            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-background/80 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-foreground border border-border">
              You
            </div>
          </div>
          
          {isTextOnly && (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center space-y-2">
                <MessageCircle className="w-8 h-8 text-primary mx-auto opacity-50" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Video Disabled</p>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsTextOnly(false)}
                  className="text-[10px] font-bold text-primary p-0 h-auto hover:bg-transparent"
                >
                  RE-ENABLE
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Chat Drawer Trigger (for small screens) */}
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
