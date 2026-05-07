
import { motion } from 'framer-motion';

const HeroContent = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.5
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-20 px-6">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="text-center"
      >
        <motion.div variants={item} className="mb-8">
          <span className="inline-block px-4 py-1 border border-accent-1 bg-accent-1/10 rounded-full font-mono text-[10px] text-accent-hot tracking-[0.2em] uppercase animate-pulse">
            TITAN Family · Research Preview
          </span>
        </motion.div>

        <motion.h1 
          variants={item}
          className="font-space font-extrabold text-5xl md:text-8xl text-text-primary leading-[0.92] tracking-[-0.035em] mb-8"
        >
          The first mind<br />that sees yours.
        </motion.h1>

        <motion.p 
          variants={item}
          className="font-inter text-lg md:text-xl text-text-muted max-w-[500px] mx-auto leading-relaxed mb-12"
        >
          OMMA reads what you feel while you think. Keystroke patterns. Voice. Language. Emotion — decoded.
        </motion.p>

        <motion.div variants={item} className="flex flex-col md:flex-row gap-4 justify-center">
          <button 
            className="px-9 py-3.5 bg-gradient-to-r from-accent-1 to-accent-2 text-text-primary font-bold rounded-sm hover:shadow-[0_0_32px_var(--glow-hot)] hover:scale-[1.02] transition-all duration-300"
            onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Join the Waitlist
          </button>
          <button className="px-7 py-3.5 border border-accent-dim text-text-muted font-medium rounded-sm hover:border-accent-1 hover:text-text-primary transition-all duration-300">
            Understand OMMA →
          </button>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 w-full flex flex-wrap justify-center gap-x-8 gap-y-4 px-6 font-mono text-[10px] text-text-dim tracking-widest uppercase"
      >
        <span>5M Parameters</span>
        <span className="hidden md:inline">·</span>
        <span>Emotional State Recognition</span>
        <span className="hidden md:inline">·</span>
        <span>Beta 2026</span>
      </motion.div>

      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-accent-1"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </motion.div>
    </div>
  );
};

export default HeroContent;
