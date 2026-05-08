
import { motion } from 'framer-motion';

const features = [
  {
    id: '01',
    title: 'KEYSTROKE DYNAMICS',
    description: 'Analisa a distribuição estatística dos intervalos entre teclas. O ritmo da sua digitação carrega informação somática que o conteúdo não revela.'
  },
  {
    id: '02',
    title: 'VALÊNCIA × AROUSAL',
    description: 'Mede estado afetivo usando o Circumplex Model de Russell — dois eixos contínuos em vez de rótulos discretos de emoção. A linguagem da afetividade, não das emoções.'
  },
  {
    id: '03',
    title: 'ESTADO CONTÍNUO',
    description: 'Não avalia momentos isolados. Constrói representação do estado ao longo de toda a sessão — antes, durante e depois de cada hesitação.'
  },
  {
    id: '04',
    title: 'MODELO WITHIN-PERSON',
    description: 'Cada representação é personalizada. OMMΩ aprende o padrão individual do usuário, não compara com uma população genérica.'
  },
  {
    id: '05',
    title: 'API AFETIVA',
    description: 'Acesso programático ao núcleo somático do OMMΩ via API REST.',
    status: 'em desenvolvimento'
  },
  {
    id: '06',
    title: 'WHITE LABEL',
    description: 'Capacidades somáticas completas sob sua marca. OMMΩ como motor invisível da sua aplicação.',
    status: 'em breve'
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
          className="block font-inter text-xs text-accent-1 tracking-[0.2em] uppercase text-center mb-16"
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
              
              <span className="block font-inter text-xs text-accent-1 mb-6">
                {feature.id}
              </span>
              
              <h3 className="font-space font-bold text-xl text-text-primary mb-4">
                {feature.title}
              </h3>
              
              <p className="font-inter text-sm text-text-muted leading-relaxed">
                {feature.description}
              </p>
              {feature.status && (
                <span className="inline-block mt-4 font-inter text-[10px] uppercase tracking-[0.1em] px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.28)' }}>
                  {feature.status}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
