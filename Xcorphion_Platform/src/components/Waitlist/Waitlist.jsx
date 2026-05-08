import { useState } from 'react';
import { motion } from 'framer-motion';
import WaitlistGateModal from '../WaitlistGate/WaitlistGateModal';

const Waitlist = () => {
  const [gateOpen, setGateOpen] = useState(false);
  return (
    <section id="waitlist" className="bg-bg-secondary py-32 md:py-48 px-6">
      <div className="max-w-[600px] mx-auto text-center">

        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="block font-inter text-xs text-accent-1 tracking-[0.2em] uppercase mb-8"
        >
          ACESSO À WAITLIST
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-space font-bold text-4xl md:text-5xl text-text-primary leading-[1.1] mb-8"
        >
          A lista não é aberta.<br />É conquistada.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="font-inter text-lg text-text-muted leading-relaxed mb-12"
        >
          Para entrar na lista de espera do OMMΩ, você precisa participar da
          Sessão 1 da nossa pesquisa. É o mesmo dado que vai treinar o modelo
          — e sua porta de entrada para o beta.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => setGateOpen(true)}
            className="inline-flex items-center gap-3 bg-accent-1 text-text-primary font-inter font-medium text-sm px-9 py-4 rounded-sm hover:bg-accent-hot hover:shadow-[0_0_32px_var(--glow-hot)] transition-all duration-300"
          >
            Waitlist
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-10 space-y-2"
        >
          <p className="font-inter text-xs text-text-dim">
            8–15 minutos. Requer teclado físico.
          </p>
          <p className="font-inter text-xs text-text-dim tracking-tight">
            Xcorphion Corporation · TITAN Family
          </p>
        </motion.div>

      </div>
    </section>
    <WaitlistGateModal isOpen={gateOpen} onClose={() => setGateOpen(false)} />
  );
};

export default Waitlist;
