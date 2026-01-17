import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { User, VideoOff } from "lucide-react";

interface VideoDisplayProps {
  stream: MediaStream | null;
  isLocal?: boolean;
  className?: string;
  muted?: boolean;
  placeholder?: string;
}

export function VideoDisplay({ 
  stream, 
  isLocal = false, 
  className,
  muted = false,
  placeholder = "Waiting for partner..."
}: VideoDisplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={cn(
      "relative overflow-hidden bg-black/40 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-sm group",
      className
    )}>
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal || muted}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-secondary/50">
          <div className="p-4 rounded-full bg-background/50 mb-3 animate-pulse">
            {isLocal ? <VideoOff className="w-8 h-8" /> : <User className="w-12 h-12" />}
          </div>
          <p className="text-sm font-medium animate-pulse">{placeholder}</p>
        </div>
      )}
      
      {/* Label */}
      <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-medium text-white/90 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {isLocal ? "You" : "Partner"}
      </div>
    </div>
  );
}
