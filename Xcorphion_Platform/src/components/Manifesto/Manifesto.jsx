
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Manifesto = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.15
  });

  const text = "OMMΩ não processa apenas linguagem. Ele estima o estado afetivo de quem escreve.";
  const words = text.split(" ");

  return (
    <section className="relative bg-bg-secondary py-32 md:py-48 px-6 overflow-hidden">
      {/* Grain Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      <div className="max-w-[720px] mx-auto text-center md:text-left">
        <motion.span 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="inline-block font-inter text-xs text-accent-1 tracking-[0.2em] uppercase mb-8"
        >
          SOBRE O MODELO
        </motion.span>

        <h2 ref={ref} className="font-space font-bold text-3xl md:text-5xl text-text-primary leading-[1.12] mb-12">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="inline-block mr-3"
            >
              {word}
            </motion.span>
          ))}
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="space-y-8"
        >
          <p className="font-inter text-lg text-text-muted leading-[1.85]">
            Baseado no Circumplex Model of Affect de James Russell e na tradição de Affective Computing de Rosalind Picard, OMMΩ usa Inter-Keystroke Interval como sinal periférico para estimar valência e arousal — em tempo de sessão, não de token. A Hipótese do Marcador Somático de Antônio Damásio fornece a motivação filosófica: o corpo informa a decisão antes da consciência.
          </p>

          <div className="pt-8 border-t border-accent-dim">
            <span className="font-inter text-sm text-text-dim">
              Família TITAN · ~10M parâmetros iniciais · Arquitetura proprietária Xcorphion Corporation — 2026
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Manifesto;
