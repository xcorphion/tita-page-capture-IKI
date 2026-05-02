
const Footer = () => {
  return (
    <footer className="bg-bg-primary border-t border-accent-dim pt-24 pb-12 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-24">
          <div className="col-span-2 md:col-span-1">
            <span className="font-space font-bold text-sm text-text-primary tracking-widest uppercase">
              Xcorpion Corporation
            </span>
            <p className="mt-4 font-inter text-sm text-text-muted italic leading-relaxed">
              The first mind<br />that sees yours.
            </p>
          </div>

          <div>
            <span className="block font-mono text-xs text-accent-1 tracking-[0.15em] uppercase mb-6">Produto</span>
            <div className="space-y-4">
              <a href="#" className="block font-inter text-sm text-text-dim hover:text-accent-hot transition-colors duration-200">TITAN — OMMA</a>
              <a href="#waitlist" className="block font-inter text-sm text-text-dim hover:text-accent-hot transition-colors duration-200">Waitlist</a>
              <a href="#" className="block font-inter text-sm text-text-dim hover:text-accent-hot transition-colors duration-200">API (em breve)</a>
              <a href="#" className="block font-inter text-sm text-text-dim hover:text-accent-hot transition-colors duration-200">White Label</a>
            </div>
          </div>

          <div>
            <span className="block font-mono text-xs text-accent-1 tracking-[0.15em] uppercase mb-6">Empresa</span>
            <div className="space-y-4">
              <a href="#" className="block font-inter text-sm text-text-dim hover:text-accent-hot transition-colors duration-200">Sobre</a>
              <a href="#" className="block font-inter text-sm text-text-dim hover:text-accent-hot transition-colors duration-200">Contato</a>
              <a href="#" className="block font-inter text-sm text-text-dim hover:text-accent-hot transition-colors duration-200">Xcorpion Corp</a>
            </div>
          </div>

          <div>
            <span className="block font-mono text-xs text-accent-1 tracking-[0.15em] uppercase mb-6">Pesquisa</span>
            <div className="space-y-4">
              <a href="#" className="block font-inter text-sm text-text-dim hover:text-accent-hot transition-colors duration-200">Damásio Framework</a>
              <a href="#" className="block font-inter text-sm text-text-dim hover:text-accent-hot transition-colors duration-200">Keystroke Dynamics</a>
              <a href="#" className="block font-inter text-sm text-text-dim hover:text-accent-hot transition-colors duration-200">Publicações</a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-accent-dim flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-mono text-[10px] text-text-dim uppercase tracking-wider">
            © 2025 Xcorpion Corporation. All rights reserved.
          </span>
          <span className="font-mono text-[10px] text-text-dim uppercase tracking-wider">
            TITAN — OMMA · v0.1-alpha
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
