import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { User, VideoOff, AlertTriangle } from "lucide-react";

interface VideoDisplayProps {
  stream: MediaStream | null;
  isLocal?: boolean;
  className?: string;
  muted?: boolean;
  placeholder?: React.ReactNode;
  isVideoEnabled?: boolean;
  onBlackFrameChange?: (isBlack: boolean) => void;
}

export function VideoDisplay({ 
  stream, 
  isLocal = false, 
  className,
  muted = false,
  placeholder = "Waiting for partner...",
  isVideoEnabled = true,
  onBlackFrameChange,
  ...props
}: VideoDisplayProps & React.HTMLAttributes<HTMLDivElement>) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isBlackFrame, setIsBlackFrame] = useState(false);

  useEffect(() => {
    if (onBlackFrameChange) {
      onBlackFrameChange(isBlackFrame);
    }
  }, [isBlackFrame, onBlackFrameChange]);

  useEffect(() => {
    if (videoRef.current && stream && isVideoEnabled) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isVideoEnabled]);

  useEffect(() => {
    if (!stream || !isVideoEnabled) {
      setIsBlackFrame(false);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 48;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const checkFrame = () => {
      if (videoRef.current && videoRef.current.readyState >= 2 && ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        let totalBrightness = 0;
        // Sample more pixels for accuracy
        for (let i = 0; i < pixels.length; i += 4) {
          totalBrightness += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
        }
        
        const avgBrightness = totalBrightness / (pixels.length / 4);
        console.log(`[VideoDisplay] ${isLocal ? 'Local' : 'Remote'} avg brightness:`, avgBrightness);
        // Slightly higher threshold (20) to be safer
        setIsBlackFrame(avgBrightness < 20);
      }
    };

    const interval = setInterval(checkFrame, 1000); // Check faster (every 1s)
    return () => clearInterval(interval);
  }, [stream, isVideoEnabled]);

  return (
    <div 
      className={cn(
        "relative overflow-hidden group",
        className
      )}
      {...props}
    >
      {stream && isVideoEnabled ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal || muted}
            className={cn("w-full h-full object-cover transition-opacity", isBlackFrame && "opacity-40")}
            data-remote={!isLocal ? "true" : "false"}
          />
          {isBlackFrame && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20 p-4 text-center">
              <AlertTriangle className="w-8 h-8 text-yellow-500 mb-2 animate-pulse" />
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                {isLocal ? "Your camera is black/covered" : "Stranger's camera is black"}
              </p>
              <p className="text-[10px] text-white/70 mt-1">
                {isLocal ? "Please show yourself to continue" : "Waiting for them to show video"}
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
          <div className="p-4 rounded-full bg-background/50 mb-3">
            {isLocal ? <VideoOff className="w-8 h-8" /> : <User className="w-12 h-12" />}
          </div>
          <div className="text-sm font-medium">{isVideoEnabled ? placeholder : (isLocal ? "Camera Off" : "Partner's Camera Off")}</div>
        </div>
      )}
      
      {/* Label */}
      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-background/80 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-foreground border border-border opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
        {isLocal ? "You" : "Stranger"}
      </div>
    </div>
  );
}
