
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useState } from 'react';

const Waitlist = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [isSuccess, setIsSuccess] = useState(false);

  const onSubmit = (data) => {
    // Mocking storage
    const waitlist = JSON.parse(localStorage.getItem('omma_waitlist') || '[]');
    waitlist.push(data.email);
    localStorage.setItem('omma_waitlist', JSON.stringify(waitlist));
    
    setIsSuccess(true);
    reset();
  };

  return (
    <section id="waitlist" className="bg-bg-secondary py-32 md:py-48 px-6">
      <div className="max-w-[600px] mx-auto text-center">
        <motion.span 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="block font-mono text-xs text-accent-1 tracking-[0.2em] uppercase mb-8"
        >
          ACESSO ANTECIPADO
        </motion.span>

        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-space font-bold text-4xl md:text-5xl text-text-primary leading-[1.1] mb-8"
        >
          Seja o primeiro a<br />perceber com OMMA.
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="font-inter text-lg text-text-muted leading-relaxed mb-12"
        >
          Beta em 2026. Vagas limitadas para pesquisadores, empresas e desenvolvedores selecionados.
        </motion.p>

        {isSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 border border-accent-1 bg-accent-1/5"
          >
            <span className="font-mono text-accent-hot text-sm tracking-widest uppercase">
              ✓ Você está na lista. Aguarde nosso contato.
            </span>
          </motion.div>
        ) : (
          <motion.form 
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col md:flex-row gap-4"
          >
            <div className="flex-1 relative">
              <input
                type="email"
                placeholder="seu@email.com"
                {...register("email", { 
                  required: "Email obrigatório",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email inválido"
                  }
                })}
                className={`w-full bg-bg-tertiary border ${errors.email ? 'border-accent-hot' : 'border-glass-border'} focus:border-accent-1 outline-none text-text-primary text-sm p-4 rounded-none transition-all duration-300`}
              />
              {errors.email && (
                <span className="absolute -bottom-6 left-0 font-mono text-[10px] text-accent-hot uppercase">
                  {errors.email.message}
                </span>
              )}
            </div>
            
            <button 
              type="submit"
              className="bg-accent-1 text-text-primary font-mono text-xs uppercase tracking-widest px-8 py-4 hover:bg-accent-hot hover:shadow-[0_0_20px_var(--glow-hot)] transition-all duration-300 rounded-none"
            >
              Entrar na Waitlist →
            </button>
          </motion.form>
        )}

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-12 space-y-2"
        >
          <p className="font-inter text-xs text-text-dim">
            Sem spam. Apenas atualizações do projeto.
          </p>
          <p className="font-mono text-xs text-text-dim tracking-tight">
            Xcorpion Corporation · TITAN Family
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Waitlist;
