import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Package, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
export function PublicLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <Package className="h-6 w-6" />
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              SHIPMATE
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/about"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              
              About
            </Link>
            <Link
              to="/how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              
              How it Works
            </Link>
            <div className="flex items-center gap-4 ml-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-sm font-medium text-primary hover:underline transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20 px-4 py-2 rounded-full hover:bg-destructive/20 transition-colors"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium hover:text-primary transition-colors">
                    
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition-colors">
                    
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            
            {isMobileMenuOpen ?
            <X className="h-6 w-6" /> :

            <Menu className="h-6 w-6" />
            }
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen &&
        <motion.div
          initial={{
            opacity: 0,
            y: -20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            y: -20
          }}
          className="md:hidden absolute top-16 left-0 w-full bg-card border-b border-border z-40 shadow-lg">
          
            <div className="flex flex-col p-4 space-y-4">
              <Link
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-medium p-2 hover:bg-muted rounded-md">
              
                About
              </Link>
              <Link
              to="/how-it-works"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-medium p-2 hover:bg-muted rounded-md">
              
                How it Works
              </Link>
              <div className="h-px bg-border my-2"></div>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm font-medium p-2 text-primary hover:bg-muted rounded-md text-center"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="text-sm font-medium bg-destructive/10 text-destructive p-2 rounded-md text-center hover:bg-destructive/20 transition-all w-full"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-medium p-2 hover:bg-muted rounded-md">
                  
                    Log in
                  </Link>
                  <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-medium bg-primary text-primary-foreground p-2 rounded-md text-center">
                  
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        }
      </AnimatePresence>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card py-12 mt-auto">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 text-primary mb-4">
              <Package className="h-6 w-6" />
              <span className="font-display font-bold text-xl tracking-tight text-foreground">
                SHIPMATE
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The premium peer-to-peer delivery marketplace connecting senders
              with local travellers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/about"
                  className="hover:text-primary transition-colors">
                  
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="hover:text-primary transition-colors">
                  
                  How it Works
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="hover:text-primary transition-colors">
                  
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/help"
                  className="hover:text-primary transition-colors">
                  
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/safety"
                  className="hover:text-primary transition-colors">
                  
                  Trust & Safety
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-primary transition-colors">
                  
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-primary transition-colors">
                  
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-primary transition-colors">
                  
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SHIPMATE. All rights reserved.
        </div>
      </footer>
    </div>);

}