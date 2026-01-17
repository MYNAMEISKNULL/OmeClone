import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Video, Globe, Shield, MessageSquare, Zap, Twitter, Github, Mail } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [isFooterHovered, setIsFooterHovered] = useState(false);

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 overflow-hidden">
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              <Zap className="w-4 h-4 fill-current" />
              <span>Instant matching, no login required</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
              Talk to strangers, <br />
              <span className="text-primary">instantly.</span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience the next generation of anonymous video chat. Simple, fast, and secure. Connect with people from all over the world in seconds.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Button 
              size="lg"
              data-testid="button-start-chat"
              onClick={() => setLocation('/chat')}
              className="h-16 px-10 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 group"
            >
              <Video className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
              START VIDEO CHAT
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="h-16 px-10 rounded-2xl text-lg font-bold border-border hover:bg-muted transition-all"
            >
              LEARN MORE
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-8 pt-8 text-sm font-medium text-muted-foreground"
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

      {/* Thin Sleek Footer with Hover Expansion */}
      <motion.footer 
        onMouseEnter={() => setIsFooterHovered(true)}
        onMouseLeave={() => setIsFooterHovered(false)}
        animate={{ height: isFooterHovered ? "auto" : "64px" }}
        className="border-t border-border bg-card/50 backdrop-blur-md shrink-0 transition-colors hover:bg-card/80"
      >
        <div className="max-w-7xl mx-auto px-6">
          {/* Main Footer Row (Always Visible) */}
          <div className="h-16 flex items-center justify-between text-sm text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-primary" />
              <span className="text-foreground font-bold">OmeClone</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="hover:text-primary transition-colors">Safety</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
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
                    <li><a href="#" className="hover:text-primary transition-colors">How it works</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Safety measures</a></li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-foreground font-bold text-sm uppercase tracking-wider">Resources</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Guidelines</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-foreground font-bold text-sm uppercase tracking-wider">Company</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
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
