import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X, Video, Shield, MessageSquare, Heart } from "lucide-react";

import logoUrl from "@assets/ChatGPT_Image_Jan_18,_2026,_08_40_11_AM_1768754432091.png";

export function Header() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuExpanded, setMenuExpanded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMenuExpanded(false);
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  if (location === '/chat') return null;

  const toggleMenu = () => {
    if (menuOpen) {
      setMenuExpanded(false);
      setMenuOpen(false);
    } else {
      setMenuOpen(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setMenuExpanded(true);
      }, 250);
    }
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex justify-center pointer-events-none w-full px-4">
      <motion.div
        ref={containerRef}
        layout
        initial={false}
        style={{ originX: 0.5 }}
        animate={{
          width: menuOpen ? (menuExpanded ? (window.innerWidth < 640 ? "100%" : 720) : (window.innerWidth < 640 ? "90%" : 540)) : (window.innerWidth < 640 ? "85%" : 420),
          height: menuExpanded ? "auto" : 64,
        }}
        transition={{
          width: { type: "spring", stiffness: 300, damping: 30 },
          height: { type: "spring", stiffness: 300, damping: 30 }
        }}
        className="bg-card/80 backdrop-blur-xl border border-border shadow-2xl rounded-3xl pointer-events-auto overflow-hidden flex flex-col max-w-full"
      >
        <div className="h-16 flex items-center justify-between px-6 shrink-0">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden bg-background border border-border group-hover:scale-105 transition-transform">
                <img src={logoUrl} alt="OmeClone Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-foreground text-xl tracking-tight group-hover:text-primary transition-colors">OmeClone</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              data-testid="button-menu"
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="rounded-xl hover:bg-muted"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {menuExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-6 pb-6 pt-2"
            >
              <div className="grid grid-cols-3 gap-3">
                <Link href="/safety">
                  <Button variant="outline" className="w-full h-24 flex-col gap-2 rounded-2xl hover:border-primary/50 group">
                    <Shield className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium">Safety</span>
                  </Button>
                </Link>
                <Link href="/feedback">
                  <Button variant="outline" className="w-full h-24 flex-col gap-2 rounded-2xl hover:border-accent/50 group">
                    <Heart className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium">Feedback</span>
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="w-full h-24 flex-col gap-2 rounded-2xl hover:border-primary/50 group">
                    <MessageSquare className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium">Contact</span>
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
