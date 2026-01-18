import { motion } from "framer-motion";

export default function MaintenancePage() {
  return (
    <div className="fixed inset-0 w-full h-full bg-background flex flex-col justify-center items-center overflow-hidden font-sans">
      {/* Construction Tapes */}
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: "150%" }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="absolute top-[15%] left-[-10%] h-[60px] bg-accent text-accent-foreground flex items-center whitespace-nowrap font-black uppercase text-lg shadow-2xl -rotate-[15deg] z-20 pointer-events-none select-none"
      >
        <span className="px-4">⚠ UNDER CONSTRUCTION ⚠ UNDER CONSTRUCTION ⚠ UNDER CONSTRUCTION ⚠ UNDER CONSTRUCTION ⚠ UNDER CONSTRUCTION ⚠ UNDER CONSTRUCTION ⚠ UNDER CONSTRUCTION</span>
      </motion.div>

      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: "150%" }}
        transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
        className="absolute top-[5%] right-[-10%] h-[60px] bg-accent text-accent-foreground flex items-center whitespace-nowrap font-black uppercase text-lg shadow-2xl rotate-[10deg] origin-right z-20 pointer-events-none select-none"
      >
        <span className="px-4">⚠ UNDER CONSTRUCTION ⚠ UNDER CONSTRUCTION ⚠ UNDER CONSTRUCTION ⚠ UNDER CONSTRUCTION ⚠ UNDER CONSTRUCTION ⚠ UNDER CONSTRUCTION ⚠ UNDER CONSTRUCTION</span>
      </motion.div>

      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: "150%" }}
        transition={{ duration: 1, delay: 0.1, ease: "easeInOut" }}
        className="absolute bottom-[10%] left-[-5%] h-[60px] bg-accent text-accent-foreground flex items-center whitespace-nowrap font-black uppercase text-lg shadow-2xl rotate-[15deg] z-20 pointer-events-none select-none"
      >
        <span className="px-4">⚠ UNDER CONSTRUCTION ⚠ UNDER CONSTRUCTION ⚠ UNDER CONSTRUCTION ⚠ UNDER CONSTRUCTION ⚠ UNDER CONSTRUCTION ⚠ UNDER CONSTRUCTION ⚠ UNDER CONSTRUCTION</span>
      </motion.div>

      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: "150%" }}
        transition={{ duration: 1.8, delay: 0.5, ease: "easeInOut" }}
        className="absolute bottom-[20%] right-[-10%] h-[60px] bg-accent text-accent-foreground flex items-center whitespace-nowrap font-black uppercase text-lg shadow-2xl -rotate-[8deg] origin-right z-20 pointer-events-none select-none"
      >
        <span className="px-4">⚠ UNDER CONSTRUCTION ⚠ UNDER CONSTRUCTION ⚠ UNDER CONSTRUCTION ⚠ UNDER CONSTRUCTION ⚠ UNDER CONSTRUCTION ⚠ UNDER CONSTRUCTION ⚠ UNDER CONSTRUCTION</span>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-7xl md:text-9xl font-heading font-bold text-foreground mb-2"
        >
          Oops!
        </motion.h1>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-2xl md:text-3xl font-heading font-light text-muted-foreground mb-4"
        >
          Website is
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="inline-block border-b-4 border-primary pb-2"
        >
          <span className="text-4xl md:text-6xl font-black uppercase tracking-widest text-foreground">
            Under Construction
          </span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="mt-8 text-xl md:text-2xl font-bold tracking-[0.3em] text-primary/80 uppercase"
        >
          Coming Soon...
        </motion.div>
      </div>
    </div>
  );
}
