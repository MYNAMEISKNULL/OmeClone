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
    <div className="flex items-center justify-center gap-3 p-3 bg-black/40 backdrop-blur-2xl rounded-full border border-white/5 shadow-2xl shadow-black/50">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleMute}
        className="w-12 h-12 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
      >
        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </Button>

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleVideo}
        className="w-12 h-12 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
      >
        {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
      </Button>

      <div className="w-px h-6 bg-white/10 mx-1" />

      <Button 
        variant="default" 
        onClick={onNext}
        className="h-12 px-8 rounded-full bg-white text-black hover:bg-white/90 font-medium active:scale-95 transition-all"
      >
        <SkipForward className="w-5 h-5 mr-2" />
        Next
      </Button>

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onStop}
        className="w-12 h-12 rounded-full hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
      >
        <Square className="w-5 h-5" />
      </Button>

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onReport}
        className="w-12 h-12 rounded-full hover:bg-white/10 text-white/20 hover:text-white/40 transition-colors"
      >
        <Flag className="w-4 h-4" />
      </Button>
    </div>
  );
}
