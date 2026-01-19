import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useWebRTC } from "@/hooks/use-web-rtc";
import { VideoDisplay } from "@/components/VideoDisplay";
import { ChatBox } from "@/components/ChatBox";
import { ReportDialog } from "@/components/ReportDialog";
import { Mic, MicOff, Camera, CameraOff, MessageCircle, Keyboard, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
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
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between bg-card border-b border-border z-50 shrink-0">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-9 h-9 overflow-hidden group-hover:scale-105 transition-transform bg-primary rounded-lg flex items-center justify-center shadow-md">
              <img src={logoUrl} alt="Logo" className="w-7 h-7 object-contain brightness-0 invert" />
            </div>
            <span className="font-bold text-foreground text-2xl tracking-tight">umingle</span>
          </div>
        </Link>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-sm font-bold text-primary">
            <div className="w-12 h-6 bg-muted rounded-full relative flex items-center px-1">
              <div className="w-4 h-4 bg-muted-foreground/30 rounded-full" />
            </div>
            <span>{onlineCount.toLocaleString()} + online</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-background overflow-hidden p-2 gap-2">
        {/* Left Section: Stacked Videos */}
        <div className="w-full md:w-[35%] lg:w-[30%] flex flex-col gap-2 shrink-0">
          {/* Remote Video */}
          <div className="relative rounded-sm overflow-hidden bg-[#333] aspect-[4/3] w-full border border-border shadow-sm">
            <VideoDisplay 
              stream={remoteStream} 
              isVideoEnabled={partnerMediaStatus.video}
              className="w-full h-full object-cover"
              data-remote="true"
              placeholder={
                chatState === 'idle' ? null : (
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
            <div className="absolute bottom-2 left-2 text-[10px] font-bold text-white/50 lowercase">umingle.com</div>
            <div className="absolute bottom-2 right-2 text-primary opacity-80">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
            </div>
          </div>

          {/* Local Video */}
          <div className="relative rounded-sm overflow-hidden bg-[#333] aspect-[4/3] w-full border border-border shadow-sm">
            <VideoDisplay 
              stream={localStream} 
              isLocal 
              isVideoEnabled={isVideoEnabled}
              className="w-full h-full object-cover" 
            />
            <div className="absolute top-3 right-3 flex flex-col gap-2">
               <Button
                  size="icon"
                  variant={isAudioEnabled ? "secondary" : "destructive"}
                  onClick={toggleAudio}
                  className="rounded-full w-8 h-8 opacity-80 hover:opacity-100"
                >
                  {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </Button>
                <Button
                  size="icon"
                  variant={isVideoEnabled ? "secondary" : "destructive"}
                  onClick={toggleVideo}
                  className="rounded-full w-8 h-8 opacity-80 hover:opacity-100"
                >
                  {isVideoEnabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                </Button>
            </div>
          </div>
        </div>

        {/* Right Section: Chat Area */}
        <div className="flex-1 flex flex-col bg-card border border-border rounded-sm min-w-0 shadow-sm overflow-hidden">
          <div className="flex-1 overflow-hidden p-6">
             {chatState === 'idle' ? (
                <div className="space-y-6 max-w-lg">
                  <h2 className="text-3xl font-bold tracking-tight">Welcome to Umingle.</h2>
                  <div className="space-y-3 text-lg">
                    <div className="flex items-center gap-3 font-bold text-[#222]">
                      <div className="w-6 h-6 rounded-full border-2 border-[#222] flex items-center justify-center text-[10px]">18</div>
                      <span className="text-primary border-b border-primary">You must be 18+</span>
                    </div>
                    <p className="text-[#333]">No nudity, hate speech, or harassment</p>
                    <p className="text-[#333]">Your webcam must show you, live</p>
                    <p className="text-[#333]">Do not ask for gender. This is not a dating site</p>
                    <p className="text-[#333]">Violators will be banned</p>
                  </div>
                </div>
             ) : (
                <ChatBox 
                  messages={messages} 
                  onSendMessage={sendMessage} 
                  onTyping={sendTyping}
                  isPartnerTyping={isTyping}
                  disabled={chatState !== 'connected'} 
                  className="h-full border-none bg-transparent p-0"
                />
             )}
          </div>
          
          {/* Bottom Bar: Input & Controls */}
          <div className="h-20 px-3 bg-white border-t border-border flex items-center gap-3 shrink-0">
             <Button 
                onClick={() => {
                  if (chatState === 'idle') startChat();
                  else nextPartner();
                }}
                className="h-14 min-w-[100px] bg-primary hover:bg-primary/90 text-white font-bold rounded-md flex flex-col items-center justify-center gap-0.5 shadow-md"
              >
                <span className="text-lg leading-none">{chatState === 'idle' ? 'Start' : 'Next'}</span>
                <span className="text-[10px] font-normal opacity-80">Esc</span>
              </Button>
              
              <div className="flex-1 relative flex items-center gap-2">
                <input 
                   disabled={chatState !== 'connected'}
                   placeholder=""
                   className="flex-1 h-14 bg-white border border-border rounded-md px-4 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all text-lg"
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                       sendMessage(e.currentTarget.value);
                       e.currentTarget.value = "";
                     }
                   }}
                />
                <button 
                  disabled={chatState !== 'connected'}
                  className="absolute right-4 text-primary opacity-80 hover:opacity-100 transition-opacity disabled:opacity-30"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
          </div>
        </div>
      </div>

      <ReportDialog open={isReportOpen} onOpenChange={setIsReportOpen} />
    </div>
  );
}
