import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuExpanded, setMenuExpanded] = useState(false);

  const toggleMenu = () => {
    if (menuOpen) {
      setMenuExpanded(false);
      setTimeout(() => setMenuOpen(false), 200);
    } else {
      setMenuOpen(true);
      setTimeout(() => setMenuExpanded(true), 250);
    }
  };

  // Close menu when location changes
  useEffect(() => {
    setMenuExpanded(false);
    setMenuOpen(false);
  }, [location]);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full px-4 flex justify-center pointer-events-none">
      <motion.div
        initial={false}
        animate={{
          width: menuOpen ? (menuExpanded ? 720 : 540) : 420,
          height: menuExpanded ? "auto" : 64,
        }}
        transition={{
          type: "spring",
          stiffness: 160,
          damping: 26,
          mass: 1.2
        }}
        className="floating-card rounded-full shadow-2xl overflow-hidden pointer-events-auto w-full max-w-fit px-1"
      >
        <div className="h-16 px-6 flex items-center justify-between gap-12">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-all duration-500">
                <Video className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-foreground group-hover:opacity-80 transition-opacity">
                Nexus
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1 mr-2">
              {[
                { label: "Home", href: "/" },
                { label: "Chat", href: "/chat" },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`px-8 py-3 rounded-full text-base font-semibold transition-all duration-300 cursor-pointer ${
                      location === item.href
                        ? "bg-foreground/[0.08] text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03]"
                    }`}
                  >
                    {item.label}
                  </div>
                </Link>
              ))}
            </div>

            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="rounded-full w-12 h-12 hover:bg-foreground/5 text-foreground/40 hover:text-foreground transition-all active:scale-90"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {menuExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="px-8 pb-8 pt-2"
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Start Chatting", href: "/chat", desc: "Connect with someone now" },
                  { label: "Community", href: "#", desc: "View our guidelines" },
                  { label: "Settings", href: "#", desc: "Manage your experience" },
                  { label: "Support", href: "#", desc: "Get help from our team" },
                ].map((item) => (
                  <Link key={item.label} href={item.href}>
                    <div className="p-6 rounded-[2rem] bg-foreground/[0.03] hover:bg-foreground/[0.08] border border-border/50 transition-all duration-500 cursor-pointer group relative overflow-hidden">
                      <div className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{item.label}</div>
                      <div className="text-sm text-muted-foreground mt-1">{item.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
