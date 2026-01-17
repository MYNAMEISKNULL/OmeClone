import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Video, Globe, Shield, MessageSquare, Zap, Twitter, Github, Mail } from "lucide-react";
import { Link } from "wouter";
import { useState, useRef } from "react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [isFooterHovered, setIsFooterHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsFooterHovered(true);
    }, 300); // 300ms delay to prevent accidental triggers
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsFooterHovered(false);
  };

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden fixed inset-0">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
        {/* Background blobs for subtle depth */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-foreground">
              Talk to strangers, <br />
              <span className="text-primary">instantly.</span>
            </h1>
          </motion.div>

          {/* Age Warning */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative h-10 bg-destructive/10 overflow-hidden rounded-2xl border border-destructive/20 flex items-center justify-center w-full max-w-md mx-auto"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-destructive/20 to-transparent -skew-x-12"
              animate={{
                left: ["-100%", "200%"],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <span className="relative z-10 text-[10px] sm:text-xs font-bold text-destructive uppercase tracking-widest px-6 text-center">
              You must be 18+ to use this service.
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full px-4"
          >
            <Button 
              size="lg"
              data-testid="button-start-chat"
              onClick={() => setLocation('/chat')}
              className="relative w-full sm:w-auto h-16 px-10 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 group overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                animate={{
                  left: ["-100%", "200%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 1
                }}
              />
              <Video className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform relative z-10" />
              <span className="relative z-10">START VIDEO CHAT</span>
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-16 px-10 rounded-2xl text-lg font-bold border-border hover:bg-muted transition-all"
            >
              LEARN MORE
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 md:gap-8 pt-8 text-sm font-medium text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Global reach</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>End-to-end encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>Clean community</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Thin Sleek Footer with Hover Expansion as Overlay */}
      <div className="h-16 shrink-0" /> {/* Spacer for the fixed footer base */}
      <motion.footer 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        initial={{ height: "64px" }}
        animate={{ height: isFooterHovered ? "auto" : "64px" }}
        className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/80 backdrop-blur-md z-[100] transition-colors hover:bg-card/95 overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Main Footer Row (Always Visible) */}
          <div className="h-16 flex items-center justify-between text-sm text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-primary" />
              <span className="text-foreground font-bold">OmeClone</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/info?tab=safety" className="hover:text-primary transition-colors">Safety</Link>
              <Link href="/info?tab=terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="/info?tab=privacy" className="hover:text-primary transition-colors">Privacy</Link>
            </div>
            <div className="text-muted-foreground/60">
              © 2026 OmeClone
            </div>
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {isFooterHovered && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="py-10 grid grid-cols-1 md:grid-cols-4 gap-12 border-t border-border/50"
              >
                <div className="space-y-4">
                  <h4 className="text-foreground font-bold text-sm uppercase tracking-wider">Product</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link href="/info?tab=safety" className="hover:text-primary transition-colors">How it works</Link></li>
                    <li><Link href="/info?tab=safety" className="hover:text-primary transition-colors">Features</Link></li>
                    <li><Link href="/info?tab=safety" className="hover:text-primary transition-colors">Safety measures</Link></li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-foreground font-bold text-sm uppercase tracking-wider">Resources</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link href="/info?tab=safety" className="hover:text-primary transition-colors">Help Center</Link></li>
                    <li><Link href="/info?tab=safety" className="hover:text-primary transition-colors">Guidelines</Link></li>
                    <li><Link href="/info?tab=safety" className="hover:text-primary transition-colors">Blog</Link></li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-foreground font-bold text-sm uppercase tracking-wider">Company</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link href="/info?tab=safety" className="hover:text-primary transition-colors">About Us</Link></li>
                    <li><Link href="/info?tab=feedback" className="hover:text-primary transition-colors">Feedback</Link></li>
                    <li><Link href="/info?tab=contact" className="hover:text-primary transition-colors">Contact</Link></li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-foreground font-bold text-sm uppercase tracking-wider">Follow Us</h4>
                  <div className="flex gap-4">
                    <Button variant="outline" size="icon" className="rounded-xl border-border hover:border-primary/50 group">
                      <Twitter className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-xl border-border hover:border-primary/50 group">
                      <Github className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-xl border-border hover:border-primary/50 group">
                      <Mail className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Button>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground/60 max-w-[200px]">
                    Join our newsletter to stay updated with the latest community features.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.footer>
    </div>
  );
}
