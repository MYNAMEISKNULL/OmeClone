import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, SkipForward, Square, Flag } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ControlsProps {
  onNext: () => void;
  onStop: () => void;
  onReport?: () => void;
  state: 'idle' | 'waiting' | 'connected';
  localStream: MediaStream | null;
}

export function Controls({ onNext, onStop, onReport, state, localStream }: ControlsProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 p-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl max-w-fit mx-auto">
      <div className="flex items-center gap-2 mr-4 border-r border-white/10 pr-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className={cn(
                "rounded-full w-12 h-12 transition-all duration-200",
                isMuted 
                  ? "bg-destructive/20 text-destructive hover:bg-destructive/30" 
                  : "bg-white/5 hover:bg-white/10 text-white"
              )}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isMuted ? "Unmute Microphone" : "Mute Microphone"}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVideo}
              className={cn(
                "rounded-full w-12 h-12 transition-all duration-200",
                isVideoOff 
                  ? "bg-destructive/20 text-destructive hover:bg-destructive/30" 
                  : "bg-white/5 hover:bg-white/10 text-white"
              )}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isVideoOff ? "Turn Camera On" : "Turn Camera Off"}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={onStop}
          variant="destructive"
          className="rounded-xl px-6 h-12 font-semibold shadow-lg shadow-destructive/20 hover:shadow-destructive/30 transition-all hover:-translate-y-0.5"
        >
          <Square className="w-4 h-4 mr-2 fill-current" />
          Stop
        </Button>

        <Button
          onClick={onNext}
          disabled={state === 'waiting'}
          className={cn(
            "rounded-xl px-8 h-12 font-semibold transition-all hover:-translate-y-0.5",
            "bg-gradient-to-r from-primary to-primary/80 hover:to-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40",
            state === 'waiting' && "opacity-80 cursor-wait animate-pulse"
          )}
        >
          {state === 'waiting' ? (
            "Searching..."
          ) : (
            <>
              Next
              <SkipForward className="w-4 h-4 ml-2 fill-current" />
            </>
          )}
        </Button>
      </div>
      
      {state === 'connected' && onReport && (
        <div className="ml-4 pl-6 border-l border-white/10">
           <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onReport}
                className="rounded-full w-10 h-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Flag className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Report Partner</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
