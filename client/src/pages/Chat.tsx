import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useWebRTC } from "@/hooks/use-web-rtc";
import { VideoDisplay } from "@/components/VideoDisplay";
import { ChatBox } from "@/components/ChatBox";
import { ReportDialog } from "@/components/ReportDialog";
import { Video as VideoIcon, Users } from "lucide-react";
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
    error 
  } = useWebRTC();

  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    startChat();
  }, []);

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col font-sans">
      {/* Top Bar */}
      <div className="h-12 px-4 flex items-center justify-between bg-card border-b border-border z-50">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground text-lg tracking-tight">Ome<span className="text-primary">Clone</span></span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-muted-foreground font-medium">24,000+ Online</span>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 bg-background">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-2 grid grid-cols-1 md:grid-cols-2 gap-2 min-h-0">
            {/* Remote Video */}
            <div className="relative rounded-lg overflow-hidden bg-card border border-border flex items-center justify-center">
              <VideoDisplay 
                stream={remoteStream} 
                className="w-full h-full object-cover"
                placeholder={
                  <div className="flex flex-col items-center gap-4 text-muted-foreground/30">
                    <div className="w-16 h-16 border-2 border-border rounded-xl flex items-center justify-center">
                      <VideoIcon className="w-8 h-8" />
                    </div>
                  </div>
                }
              />
              <div className="absolute bottom-4 left-4 px-3 py-1 bg-background/80 backdrop-blur-md rounded-full text-xs font-medium text-foreground border border-border">
                Stranger
              </div>
            </div>

            {/* Local Video */}
            <div className="relative rounded-lg overflow-hidden bg-card border border-border flex items-center justify-center">
              <VideoDisplay 
                stream={localStream} 
                isLocal 
                className="w-full h-full object-cover" 
              />
              <div className="absolute bottom-4 left-4 px-3 py-1 bg-background/80 backdrop-blur-md rounded-full text-xs font-medium text-foreground border border-border">
                You
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="h-20 px-4 bg-card border-t border-border flex items-center gap-4">
            <Button 
              data-testid="button-stop"
              variant="destructive"
              onClick={() => {
                stopChat();
                setLocation('/');
              }}
              className="h-12 px-8 font-bold rounded-lg uppercase tracking-wider"
            >
              STOP
            </Button>
            <Button 
              data-testid="button-next"
              onClick={nextPartner}
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg uppercase tracking-wider text-base shadow-lg shadow-primary/20"
            >
              {chatState === 'waiting' ? 'FINDING STRANGER...' : 'NEW STRANGER'}
            </Button>
          </div>
        </div>

        {/* Sidebar Chat */}
        <div className="w-80 border-l border-border flex flex-col bg-card">
          <div className="p-4 flex-1 overflow-y-auto text-sm">
            <div className="text-muted-foreground mb-4 text-center py-2 px-3 bg-muted/30 rounded-lg">
              You're connected to a stranger. Say hello!
            </div>
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
