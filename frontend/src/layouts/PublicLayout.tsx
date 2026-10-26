import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Leaf, Globe, Moon, Sun, Menu, X, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GovEmblem } from '../components/custom/GovEmblem';

const navLinks = [
  { name: 'Features', path: '/features' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

export const PublicLayout = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });
  const [language, setLanguage] = useState<'EN' | 'TE'>('EN');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'EN' ? 'TE' : 'EN');
  };

  return (
    <div className={`min-h-screen flex flex-col bg-background font-sans text-foreground selection:bg-primary/20 selection:text-primary ${theme}`}>
      {/* Gov Banner Strip */}
      <div className="w-full bg-muted/30 border-b border-border py-1.5 px-4 text-xs text-muted-foreground flex items-center justify-center md:justify-end gap-2">
        <Building2 className="h-3.5 w-3.5" />
        <span>Official Portal of the Government of Telangana</span>
      </div>

      {/* Sticky Navigation */}
      <header 
        className={`sticky top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-background/95 backdrop-blur-md shadow-sm border-b' : 'bg-background/80 backdrop-blur-sm border-b'
        }`}
      >
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Leaf className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold font-heading tracking-tight text-foreground leading-tight">Gram<span className="text-primary">AI</span></span>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Government of Telangana</span>
            </div>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-base font-medium transition-colors hover:text-primary relative ${
                  location.pathname === link.path ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div layoutId="underline" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>
          
          <div className="hidden md:flex items-center gap-3">
            <button onClick={toggleLanguage} className="p-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 rounded-full hover:bg-muted" aria-label="Toggle Language">
              <Globe className="h-4 w-4" />
              <span className="text-xs font-bold">{language}</span>
            </button>
            <button onClick={toggleTheme} className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted" aria-label="Toggle Dark Mode">
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <div className="w-px h-6 bg-border mx-2"></div>
            <Link to="/login" className="text-base font-medium hover:text-primary transition-colors px-2">
              Log in
            </Link>
            <Button asChild size="lg" className="rounded-full px-6 shadow-sm">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background pt-24 px-6 md:hidden flex flex-col"
          >
            <nav className="flex flex-col gap-6 text-xl font-semibold mb-8">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.path} onClick={() => setMobileMenuOpen(false)} className="border-b pb-4 border-border">
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="flex gap-4 mb-8">
              <button onClick={toggleLanguage} className="flex-1 py-3 border rounded-xl flex items-center justify-center gap-2 bg-muted/50">
                <Globe className="h-5 w-5" /> {language === 'EN' ? 'Telugu' : 'English'}
              </button>
              <button onClick={toggleTheme} className="flex-1 py-3 border rounded-xl flex items-center justify-center gap-2 bg-muted/50">
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />} Mode
              </button>
            </div>
            <div className="flex flex-col gap-4 mt-auto pb-12">
              <Button asChild variant="outline" size="lg" className="w-full h-14 text-lg rounded-xl">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
              </Button>
              <Button asChild size="lg" className="w-full h-14 text-lg rounded-xl">
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative">
        <Outlet />
      </main>

      {/* Professional Footer */}
      <footer className="bg-stone-900 text-stone-300 dark:bg-black py-16 border-t-4 border-primary">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
            <div className="col-span-1 lg:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                  <Leaf className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white">GramAI</span>
              </Link>
              <p className="text-stone-400 mb-8 max-w-sm leading-relaxed text-lg">
                Connecting the citizens of Telangana to the benefits they deserve through the power of Voice AI and simple technology.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-6 text-lg">Platform</h4>
              <ul className="space-y-4">
                <li><Link to="/features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-6 text-lg">Target Users</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-primary transition-colors">For Farmers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">For Students</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">For Senior Citizens</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">For Gov Officers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-6 text-lg">Legal</h4>
              <ul className="space-y-4">
                <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-stone-800 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-stone-500 text-sm">
            <p>&copy; {new Date().getFullYear()} GramAI. Built for Telangana.</p>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <span>Made with</span> <span className="text-destructive">♥</span> <span>in Hyderabad</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
