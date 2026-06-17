import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
export function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{
          scale: 0.8,
          opacity: 0
        }}
        animate={{
          scale: 1,
          opacity: 1
        }}
        transition={{
          duration: 0.8,
          ease: 'easeOut'
        }}
        className="relative z-10 flex flex-col items-center">
        
        <motion.div
          animate={{
            y: [0, -10, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="bg-card p-6 rounded-3xl shadow-glow border border-border mb-6">
          
          <Package className="h-16 w-16 text-primary" />
        </motion.div>

        <motion.h1
          initial={{
            y: 20,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          transition={{
            delay: 0.3,
            duration: 0.5
          }}
          className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground mb-2">
          
          SHIPMATE
        </motion.h1>

        <motion.p
          initial={{
            y: 20,
            opacity: 0
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          transition={{
            delay: 0.5,
            duration: 0.5
          }}
          className="text-muted-foreground text-lg">
          
          Peer-to-peer delivery, reimagined.
        </motion.p>
      </motion.div>
    </div>);

}