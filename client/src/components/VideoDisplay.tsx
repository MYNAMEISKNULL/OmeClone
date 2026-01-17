import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { User, VideoOff } from "lucide-react";

interface VideoDisplayProps {
  stream: MediaStream | null;
  isLocal?: boolean;
  className?: string;
  muted?: boolean;
  placeholder?: React.ReactNode;
  isVideoEnabled?: boolean;
}

export function VideoDisplay({ 
  stream, 
  isLocal = false, 
  className,
  muted = false,
  placeholder = "Waiting for partner...",
  isVideoEnabled = true
}: VideoDisplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream && isVideoEnabled) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isVideoEnabled]);

  return (
    <div className={cn(
      "relative overflow-hidden bg-muted/30 rounded-2xl border border-border shadow-sm group",
      className
    )}>
      {stream && isVideoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal || muted}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
          <div className="p-4 rounded-full bg-background/50 mb-3">
            {isLocal ? <VideoOff className="w-8 h-8" /> : <User className="w-12 h-12" />}
          </div>
          <div className="text-sm font-medium">{isVideoEnabled ? placeholder : (isLocal ? "Camera Off" : "Partner's Camera Off")}</div>
        </div>
      )}
      
      {/* Label */}
      <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-background/80 backdrop-blur-md text-xs font-medium text-foreground border border-border opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {isLocal ? "You" : "Partner"}
      </div>
    </div>
  );
}
