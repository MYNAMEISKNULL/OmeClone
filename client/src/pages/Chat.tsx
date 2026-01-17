import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useWebRTC } from "@/hooks/use-web-rtc";
import { VideoDisplay } from "@/components/VideoDisplay";
import { ChatBox } from "@/components/ChatBox";
import { ReportDialog } from "@/components/ReportDialog";
import { Video as VideoIcon, Users, Mic, MicOff, Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    toggleAudio,
    toggleVideo,
    isAudioEnabled,
    isVideoEnabled,
    partnerMediaStatus,
    error 
  } = useWebRTC();

  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    startChat();
  }, []);

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col font-sans">
      {/* Top Bar */}
      <div className="h-12 px-4 flex items-center justify-between bg-card border-b border-border z-50 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground text-lg tracking-tight">Ome<span className="text-primary">Clone</span></span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-muted-foreground font-medium">24,000+ Online</span>
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
                  <div className="flex flex-col items-center gap-4 text-muted-foreground/30">
                    <div className="w-16 h-16 border-2 border-border rounded-xl flex items-center justify-center">
                      <VideoIcon className="w-8 h-8" />
                    </div>
                  </div>
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
                >
                  {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </Button>
                <Button
                  size="icon"
                  variant={isVideoEnabled ? "secondary" : "destructive"}
                  onClick={toggleVideo}
                  className="rounded-full w-10 h-10"
                >
                  {isVideoEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                </Button>
              </div>
              <div className="absolute bottom-4 left-4 px-3 py-1 bg-background/80 backdrop-blur-md rounded-full text-xs font-medium text-foreground border border-border">
                You
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="h-20 px-4 bg-card border-t border-border flex items-center gap-4 shrink-0">
            <Button 
              data-testid="button-stop"
              variant="destructive"
              onClick={() => {
                stopChat();
                setLocation('/');
              }}
              className="h-12 px-6 md:px-8 font-bold rounded-lg uppercase tracking-wider text-xs md:text-sm"
            >
              STOP
            </Button>
            <Button 
              data-testid="button-next"
              onClick={nextPartner}
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg uppercase tracking-wider text-sm md:text-base shadow-lg shadow-primary/20"
            >
              {chatState === 'waiting' ? 'FINDING STRANGER...' : 'NEW STRANGER'}
            </Button>
          </div>
        </div>

        {/* Sidebar Chat */}
        <div className="w-full md:w-80 h-1/3 md:h-full border-t md:border-t-0 md:border-l border-border flex flex-col bg-card shrink-0">
          <ChatBox 
            messages={messages} 
            onSendMessage={sendMessage} 
            disabled={chatState !== 'connected'} 
            className="flex-1 border-none bg-transparent min-h-0"
          />
        </div>
      </div>

      <ReportDialog open={isReportOpen} onOpenChange={setIsReportOpen} />
    </div>
  );
}
