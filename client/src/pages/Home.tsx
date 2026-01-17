import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Video, Globe, Shield, MessageSquare, Zap } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

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

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground font-medium">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            <span className="text-foreground font-bold text-lg">OmeClone</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="hover:text-primary transition-colors">Safety Guidelines</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          </div>
          <div className="text-muted-foreground/60">
            © 2026 OmeClone. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
