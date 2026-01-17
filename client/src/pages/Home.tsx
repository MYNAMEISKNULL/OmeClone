import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Video, Globe, Shield, MessageSquare, Hash, X, Twitter, Github, Mail } from "lucide-react";
import { Link } from "wouter";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const PRESET_INTERESTS = ["Gaming", "Music", "Coding", "Movies", "Travel", "Art", "Sports", "Tech"];

export default function Home() {
  const [, setLocation] = useLocation();
  const [isFooterHovered, setIsFooterHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const footerRef = useRef<HTMLElement>(null);
  
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem('user_interests');
    if (saved) {
      try {
        setInterests(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load interests', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('user_interests', JSON.stringify(interests));
  }, [interests]);

  const addInterest = (interest: string) => {
    const trimmed = interest.trim().toLowerCase();
    if (trimmed && !interests.includes(trimmed) && interests.length < 5) {
      setInterests([...interests, trimmed]);
      setInterestInput("");
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleStartChat = () => {
    setLocation('/chat');
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsFooterHovered(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsFooterHovered(false);
  };

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden fixed inset-0">
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto">
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

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="w-full max-w-lg bg-card/50 backdrop-blur-xl border border-border p-6 rounded-3xl shadow-2xl space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-widest">
                  <Hash className="w-4 h-4 text-primary" />
                  Your Interests
                </div>
                <span className="text-[10px] font-medium text-muted-foreground uppercase">{interests.length}/5 max</span>
              </div>
              
              <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-background/50 rounded-2xl border border-border/50">
                <AnimatePresence mode="popLayout">
                  {interests.map(interest => (
                    <motion.div
                      key={interest}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      layout
                    >
                      <Badge variant="secondary" className="pl-3 pr-1 py-1 rounded-full gap-1 bg-primary/10 text-primary border-primary/20">
                        {interest}
                        <button 
                          onClick={() => removeInterest(interest)}
                          className="p-0.5 hover:bg-primary/20 rounded-full transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    </motion.div>
                  ))}
                  {interests.length === 0 && (
                    <span className="text-xs text-muted-foreground/50 self-center px-1 italic">Add interests for better matching...</span>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-2">
                <Input 
                  placeholder="e.g. gaming, music, art..."
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addInterest(interestInput)}
                  className="rounded-xl h-11 bg-background/50"
                  maxLength={20}
                />
                <Button 
                  onClick={() => addInterest(interestInput)}
                  className="h-11 px-6 rounded-xl font-bold"
                  disabled={interests.length >= 5 || !interestInput.trim()}
                >
                  ADD
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                {PRESET_INTERESTS.filter(p => !interests.includes(p.toLowerCase())).map(preset => (
                  <button
                    key={preset}
                    onClick={() => addInterest(preset)}
                    disabled={interests.length >= 5}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary disabled:opacity-30 disabled:pointer-events-none"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              size="lg"
              data-testid="button-start-chat"
              onClick={handleStartChat}
              className="relative w-full h-16 rounded-2xl text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 group overflow-hidden"
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

      <div className="h-16 shrink-0" />
      <motion.footer 
        ref={footerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        initial={{ height: "64px" }}
        animate={{ height: isFooterHovered ? "auto" : "64px" }}
        className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/80 backdrop-blur-md z-[100] transition-colors hover:bg-card/95 overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-16 flex items-center justify-between text-sm text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-primary" />
              <span className="text-foreground font-bold">OmeClone</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/safety" className="hover:text-primary transition-colors">Safety</Link>
              <Link href="/info?tab=terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="/info?tab=privacy" className="hover:text-primary transition-colors">Privacy</Link>
            </div>
            <div className="text-muted-foreground/60">
              © 2026 OmeClone
            </div>
          </div>

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
                    <li><Link href="/safety" className="hover:text-primary transition-colors">How it works</Link></li>
                    <li><Link href="/safety" className="hover:text-primary transition-colors">Features</Link></li>
                    <li><Link href="/safety" className="hover:text-primary transition-colors">Safety measures</Link></li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-foreground font-bold text-sm uppercase tracking-wider">Resources</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link href="/safety" className="hover:text-primary transition-colors">Help Center</Link></li>
                    <li><Link href="/safety" className="hover:text-primary transition-colors">Guidelines</Link></li>
                    <li><Link href="/safety" className="hover:text-primary transition-colors">Blog</Link></li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-foreground font-bold text-sm uppercase tracking-wider">Company</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link href="/safety" className="hover:text-primary transition-colors">About Us</Link></li>
                    <li><Link href="/feedback" className="hover:text-primary transition-colors">Feedback</Link></li>
                    <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.footer>
    </div>
  );
}
