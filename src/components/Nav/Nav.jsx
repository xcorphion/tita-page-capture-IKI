
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const Nav = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-bg-secondary/80 backdrop-blur-xl py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="font-space font-bold text-sm tracking-widest text-text-primary uppercase">
            Xcorpion Corporation
          </span>
        </div>

        <div className="flex items-center gap-8">
          <span className="hidden md:block font-mono text-xs text-text-muted tracking-tight">
            TITAN — OMMA
          </span>
          <button 
            className="px-4 py-2 border border-accent-1 text-accent-hot text-xs font-mono uppercase tracking-widest hover:bg-accent-1 hover:text-white transition-all duration-300"
            onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Waitlist
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Nav;
