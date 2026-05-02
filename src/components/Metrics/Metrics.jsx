
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const MetricItem = ({ value, label, sublabel, showSeparator }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const end = parseInt(value) || 0;
          if (isNaN(end)) {
            setDisplayValue(value);
            return;
          }
          const duration = 2000;
          const stepTime = Math.abs(Math.floor(duration / end));
          const timer = setInterval(() => {
            start += 1;
            setDisplayValue(start);
            if (start >= end) clearInterval(timer);
          }, stepTime);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="relative flex flex-col items-center md:items-start p-8">
      {showSeparator && (
        <div className="hidden md:block absolute left-0 top-1/4 bottom-1/4 w-[1px] bg-accent-dim"></div>
      )}
      <span className="font-space font-black text-5xl md:text-6xl text-accent-1 leading-none">
        {displayValue}{value.includes('M') ? 'M' : ''}
      </span>
      <span className="mt-4 font-mono text-[10px] text-text-dim uppercase tracking-[0.15em]">
        {label}
      </span>
      {sublabel && (
        <span className="mt-1 font-mono text-[10px] text-text-dim uppercase tracking-[0.15em]">
          {sublabel}
        </span>
      )}
    </div>
  );
};

const Metrics = () => {
  return (
    <section className="bg-bg-primary border-t border-b border-accent-dim py-20 px-6">
      <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        <MetricItem value="5M" label="Parâmetros" />
        <MetricItem value="Único" label="no mundo" showSeparator />
        <MetricItem value="2026" label="Beta" showSeparator />
        <MetricItem value="Multimodal" label="Texto · Voz · Keystroke" showSeparator />
      </div>
    </section>
  );
};

export default Metrics;
