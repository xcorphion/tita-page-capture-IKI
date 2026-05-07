
import { motion } from 'framer-motion';

const features = [
  {
    id: '01',
    title: 'KEYSTROKE DYNAMICS',
    description: 'Analisa velocidade, ritmo e pausas na digitação. Cada hesitação conta. Cada aceleração revela.'
  },
  {
    id: '02',
    title: 'MARCADORES SOMÁTICOS',
    description: 'Framework neurocientífico de Damásio integrado ao pipeline de inferência. Emoção como dado.'
  },
  {
    id: '03',
    title: 'VOZ BIDIRECIONAL',
    description: 'Recebe e emite áudio. Lê prosódia, cadência e tensão emocional na fala em tempo real.'
  },
  {
    id: '04',
    title: 'ESTADO CONTÍNUO',
    description: 'Não avalia momentos isolados. Constrói um mapa emocional ao longo de toda a conversa.'
  },
  {
    id: '05',
    title: 'API AFETIVA',
    description: 'Exponha inteligência emocional via API REST. System prompt customizável. Fine-tuning futuro.'
  },
  {
    id: '06',
    title: 'WHITE LABEL',
    description: 'Plataforma própria ou integração silenciosa. OMMA como motor invisível da sua aplicação.'
  }
];

const Features = () => {
  return (
    <section className="bg-bg-primary py-32 px-6">
      <div className="max-w-[1440px] mx-auto">
        <motion.span 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="block font-mono text-xs text-accent-1 tracking-[0.2em] uppercase text-center mb-16"
        >
          ARQUITETURA PERCEPTIVA
        </motion.span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-accent-dim">
          {features.map((feature, i) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative bg-bg-primary p-9 md:p-12 hover:bg-glass-hover transition-all duration-300"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-transparent group-hover:bg-accent-1 transition-all duration-300"></div>
              
              <span className="block font-mono text-xs text-accent-1 mb-6">
                {feature.id}
              </span>
              
              <h3 className="font-space font-bold text-xl text-text-primary mb-4">
                {feature.title}
              </h3>
              
              <p className="font-inter text-sm text-text-muted leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
