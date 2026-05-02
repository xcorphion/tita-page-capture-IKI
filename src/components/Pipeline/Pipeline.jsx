
import { motion } from 'framer-motion';
import PipelineCanvas from './PipelineCanvas';

const steps = [
  { id: '01', text: 'Input recebido — texto, keystroke ou voz' },
  { id: '02', text: 'Extração de features afetivas em paralelo' },
  { id: '03', text: 'Fusão multimodal nos marcadores somáticos' },
  { id: '04', text: 'Estado emocional inferido com confiança' },
  { id: '05', text: 'Resposta adaptada ao estado detectado' }
];

const Pipeline = () => {
  return (
    <section className="bg-bg-secondary py-32 px-6 overflow-hidden">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-24">
        <div className="w-full md:w-[40%]">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="block font-mono text-xs text-accent-1 tracking-[0.2em] uppercase mb-8"
          >
            PIPELINE EMOCIONAL
          </motion.span>

          <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="font-space font-bold text-4xl md:text-5xl text-text-primary leading-[1.1] mb-12"
          >
            Do sinal ao<br />sentimento.
          </motion.h2>

          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="flex items-center gap-6"
              >
                <span className="font-mono text-sm text-accent-1">{step.id}</span>
                <span className="font-mono text-sm text-text-muted leading-none">{step.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="w-full md:w-[60%]"
        >
          <PipelineCanvas />
        </motion.div>
      </div>
    </section>
  );
};

export default Pipeline;
