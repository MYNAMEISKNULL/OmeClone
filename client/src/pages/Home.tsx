import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Video, Zap, Shield, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Video className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Nexus
          </span>
        </div>
        <div className="text-sm text-muted-foreground font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-2 animate-pulse" />
          1,240 Online Now
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">New</span>
            <span className="w-px h-3 bg-white/20" />
            <span className="text-sm text-muted-foreground">Video chat re-imagined for the modern web</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-white leading-[1.1]">
            Connect with strangers <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-accent">
              across the globe.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground/80 leading-relaxed">
            Experience instant, high-quality video connections. No login required. 
            Just click start and meet someone new in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link href="/chat">
              <Button 
                size="lg" 
                className="h-14 px-8 rounded-2xl text-lg font-semibold bg-white text-black hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-xl shadow-white/10"
              >
                Start Video Chat
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="h-14 px-8 rounded-2xl text-lg font-semibold bg-transparent border-white/10 hover:bg-white/5 hover:text-white transition-all duration-300 backdrop-blur-sm"
              onClick={() => alert("Text chat coming soon!")}
            >
              Text Chat Only
            </Button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl w-full"
        >
          {[
            { 
              icon: Zap, 
              title: "Instant Match", 
              desc: "Our lightning-fast matching algorithm connects you in milliseconds." 
            },
            { 
              icon: Shield, 
              title: "Safe & Secure", 
              desc: "Advanced moderation and reporting tools keep the community safe." 
            },
            { 
              icon: Users, 
              title: "Global Community", 
              desc: "Meet fascinating people from over 150+ countries worldwide." 
            }
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
      
      <footer className="py-6 text-center text-sm text-muted-foreground/50 relative z-10">
        &copy; {new Date().getFullYear()} Nexus Inc. All rights reserved.
      </footer>
    </div>
  );
}
