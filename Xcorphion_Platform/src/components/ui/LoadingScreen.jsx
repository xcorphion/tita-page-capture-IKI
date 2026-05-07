
import { motion } from 'framer-motion';

const LoadingScreen = ({ onComplete }) => {
  const letters = "OMMA".split("");

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.4, delay: 1.6 }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center pointer-events-none"
    >
      <div className="flex gap-4 mb-8">
        {letters.map((letter, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: i * 0.15,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="font-space font-black text-5xl md:text-7xl text-text-primary"
          >
            {letter}
          </motion.span>
        ))}
      </div>
      
      <div className="w-48 md:w-64 h-[1px] bg-accent-dim overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
          className="h-full bg-accent-1"
        />
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
