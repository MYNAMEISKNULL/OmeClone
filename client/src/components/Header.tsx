import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      setTimeout(() => setMenuExpanded(true), 150);
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
        animate={{
          width: menuOpen ? (menuExpanded ? 600 : 450) : 320,
          height: menuExpanded ? "auto" : 64,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 24,
        }}
        className="floating-card rounded-[2rem] shadow-2xl overflow-hidden pointer-events-auto w-full max-w-fit"
      >
        <div className="h-16 px-6 flex items-center justify-between gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                <Video className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-white group-hover:text-white/80 transition-colors">
                Nexus
              </span>
            </div>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            className="rounded-full w-10 h-10 hover:bg-white/5 text-white/60 hover:text-white transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        <AnimatePresence>
          {menuExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="px-6 pb-6 pt-2"
            >
              <nav className="flex flex-col gap-2">
                {[
                  { label: "Home", href: "/" },
                  { label: "Chat", href: "/chat" },
                ].map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 cursor-pointer ${
                        location === item.href
                          ? "bg-white/10 text-white shadow-inner"
                          : "text-white/40 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {item.label}
                    </div>
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
