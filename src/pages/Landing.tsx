import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  MapPin,
  ShieldCheck,
  Clock,
  Wallet,
  Package,
  Star } from
'lucide-react';
export function Landing() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                duration: 0.5
              }}>
              
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
                <Star className="h-4 w-4" /> Welcome to the future of logistics
              </span>
            </motion.div>

            <motion.h1
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                duration: 0.5,
                delay: 0.1
              }}
              className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-8 leading-tight">
              
              Send anything, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                anywhere, with anyone.
              </span>
            </motion.h1>

            <motion.p
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                duration: 0.5,
                delay: 0.2
              }}
              className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              
              Connect with nearby travellers heading your way. Fast, secure, and
              affordable peer-to-peer delivery for the modern world.
            </motion.p>

            <motion.div
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                duration: 0.5,
                delay: 0.3
              }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4">
              
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg hover:bg-primary/90 transition-all hover:shadow-glow flex items-center justify-center gap-2">
                
                Get Started <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/how-it-works"
                className="w-full sm:w-auto px-8 py-4 bg-card border border-border text-foreground rounded-full font-semibold text-lg hover:bg-muted transition-all flex items-center justify-center">
                
                See How It Works
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="py-24 bg-card/50 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Why choose SHIPMATE?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Whether you're sending a package or looking to earn on your
              commute, we've got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
            {
              icon: Clock,
              title: 'Faster Deliveries',
              description:
              'Skip the warehouse. Your items go straight from pickup to drop-off with a dedicated traveller.'
            },
            {
              icon: Wallet,
              title: 'Earn While Traveling',
              description:
              'Turn your daily commute or road trip into a profitable journey by delivering items along your route.'
            },
            {
              icon: ShieldCheck,
              title: 'Secure & Verified',
              description:
              'Every user is verified, and real-time tracking keeps you updated every step of the way.'
            }].
            map((feature, i) =>
            <motion.div
              key={i}
              initial={{
                opacity: 0,
                y: 20
              }}
              whileInView={{
                opacity: 1,
                y: 0
              }}
              viewport={{
                once: true
              }}
              transition={{
                delay: i * 0.1
              }}
              className="bg-card p-8 rounded-3xl border border-border hover:border-primary/50 transition-colors">
              
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Dual CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{
                opacity: 0,
                x: -20
              }}
              whileInView={{
                opacity: 1,
                x: 0
              }}
              viewport={{
                once: true
              }}
              className="bg-gradient-to-br from-card to-card/50 p-10 rounded-[2.5rem] border border-border relative overflow-hidden group">
              
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Package className="h-32 w-32" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-display font-bold mb-4">
                  Need to send something?
                </h3>
                <p className="text-muted-foreground mb-8 max-w-sm">
                  Post your request, choose a trusted traveller, and track your
                  item in real-time.
                </p>
                <Link
                  to="/signup?role=sender"
                  className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
                  
                  Sign up as Sender <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                x: 20
              }}
              whileInView={{
                opacity: 1,
                x: 0
              }}
              viewport={{
                once: true
              }}
              className="bg-gradient-to-br from-card to-card/50 p-10 rounded-[2.5rem] border border-border relative overflow-hidden group">
              
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <MapPin className="h-32 w-32" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-display font-bold mb-4">
                  Traveling somewhere?
                </h3>
                <p className="text-muted-foreground mb-8 max-w-sm">
                  Find delivery requests along your route, accept them, and earn
                  money on the go.
                </p>
                <Link
                  to="/signup?role=traveller"
                  className="inline-flex items-center gap-2 text-secondary font-semibold hover:gap-3 transition-all">
                  
                  Sign up as Traveller <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>);

}