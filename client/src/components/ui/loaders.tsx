import { motion } from "framer-motion";

export function ActionLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-12 h-12">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            borderRadius: ["20%", "50%", "20%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-full h-full bg-primary/20 border-2 border-primary"
        />
        <motion.div
          animate={{
            scale: [0.8, 1, 0.8],
            rotate: [360, 180, 0],
            borderRadius: ["50%", "20%", "50%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 w-full h-full bg-accent/20 border-2 border-accent"
        />
      </div>
      <motion.span
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground"
      >
        Processing
      </motion.span>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted/50 ${className}`}
    />
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex-1 p-4 space-y-4">
      <div className="flex gap-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-[60%]" />
          <Skeleton className="h-4 w-[40%]" />
        </div>
      </div>
      <div className="flex flex-row-reverse gap-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="space-y-2 flex-1 flex flex-col items-end">
          <Skeleton className="h-4 w-[50%]" />
        </div>
      </div>
      <div className="flex gap-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-[70%]" />
        </div>
      </div>
    </div>
  );
}
