
import React, { useState } from 'react';
import Nav from './components/Nav/Nav';
import HeroCanvas from './components/Hero/HeroCanvas';
import HeroContent from './components/Hero/HeroContent';
import Manifesto from './components/Manifesto/Manifesto';
import Features from './components/Features/Features';
import Pipeline from './components/Pipeline/Pipeline';
import Metrics from './components/Metrics/Metrics';
import Waitlist from './components/Waitlist/Waitlist';
import Footer from './components/Footer/Footer';
import LoadingScreen from './components/ui/LoadingScreen';
import { useMouseParallax } from './hooks/useMouseParallax';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  useMouseParallax();

  return (
    <div className="relative bg-bg-primary selection:bg-accent-1 selection:text-white">
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      
      {/* Background elements */}
      <div className="grain-overlay" />
      
      {/* Scroll-following glow (Desktop only) */}
      <div 
        className="hidden lg:block fixed pointer-events-none z-[1] w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 transition-[transform] duration-100"
        style={{
          background: 'radial-gradient(circle, rgba(139,0,0,0.08) 0%, transparent 70%)',
          left: 'var(--mouse-x, 0)',
          top: 'var(--mouse-y, 0)'
        }}
      />

      <Nav />
      
      <main>
        <section className="relative h-screen overflow-hidden">
          <HeroCanvas />
          <HeroContent />
        </section>
        
        <Manifesto />
        <Features />
        <Pipeline />
        <Metrics />
        <Waitlist />
      </main>

      <Footer />
    </div>
  );
}

export default App;
