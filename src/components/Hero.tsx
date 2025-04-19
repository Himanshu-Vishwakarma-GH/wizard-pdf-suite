import * as React from 'react';
import { Button } from "@/components/ui/button";

const Hero = () => {
  const startButtonRef = React.useRef<HTMLButtonElement>(null);
  
  const scrollToTools = () => {
    document.getElementById('tools-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  React.useEffect(() => {
    const createWaveAnimation = () => {
      if (typeof window === 'undefined') return;
    };
    
    createWaveAnimation();
  }, []);

  return (
    <section className="relative pt-20 pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 -z-10" />
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#6EC1E4_1px,transparent_1px)] [background-size:20px_20px] -z-10" />
      
      <div className="container-custom">
        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            All Your PDF Tools. <br />
            <span className="text-primary">In One Place.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Fast, free, and secure online PDF solutions.
            Transform your documents with just a few clicks.
          </p>
          
          <Button 
            ref={startButtonRef}
            onClick={scrollToTools}
            className="animate-fade-in" 
            style={{ animationDelay: '0.2s' }}
          >
            Start Using
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
