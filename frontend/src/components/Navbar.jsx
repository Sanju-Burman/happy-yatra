import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, User, LogOut, Sun, Moon, Menu, X, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '@/api.jsx';
import { toast } from 'sonner';
import { useTheme } from '@/components/theme-provider.jsx';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setIsMobileMenuOpen(false);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const NavLinks = ({ onClick }) => (
    <>
      <button
        onClick={() => {
          setTheme(theme === "dark" ? "light" : "dark");
          if (onClick) onClick();
        }}
        className="p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors mx-auto md:mx-0 flex items-center justify-center gap-2"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        <span className="md:hidden">Toggle Theme</span>
      </button>

      {user?.role === 'admin' && (
        <Link to="/admin" onClick={onClick} className="font-semibold text-amber-500 hover:text-amber-600 transition-colors text-center md:text-left flex items-center justify-center md:justify-start gap-2">
          <Shield className="w-4 h-4" />
          Admin
        </Link>
      )}

      {user ? (
        <>
          <Link onClick={onClick} to="/survey" className="font-medium text-muted-foreground hover:text-primary transition-colors text-center md:text-left" data-testid="nav-survey-link">Survey</Link>
          <Link onClick={onClick} to="/recommendations" className="font-medium text-muted-foreground hover:text-primary transition-colors text-center md:text-left" data-testid="nav-recommendations-link">Recommendations</Link>
          <Link onClick={onClick} to="/profile" className="font-medium text-muted-foreground hover:text-primary transition-colors flex items-center justify-center md:justify-start gap-2" data-testid="nav-profile-link">
            <User className="w-4 h-4" strokeWidth={1.5} />
            Profile
          </Link>
          <button onClick={handleLogout} className="font-medium text-muted-foreground hover:text-primary transition-colors flex items-center justify-center md:justify-start gap-2" data-testid="logout-button">
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            Logout
          </button>
        </>
      ) : (
        <>
          <Link onClick={onClick} to="/login" className="font-medium text-muted-foreground hover:text-primary transition-colors text-center md:text-left" data-testid="nav-login-link">Login</Link>
          <Link onClick={onClick} to="/signup" className="bg-primary text-primary-foreground rounded-full px-6 py-2 hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg font-medium text-center md:text-left mx-auto md:mx-0 inline-block w-fit" data-testid="nav-signup-button">Get Started</Link>
        </>
      )}
    </>
  );

  return (
    <nav data-testid="main-navbar" className="backdrop-blur-md bg-background/80 border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group" data-testid="logo-link">
            <Compass className="w-8 h-8 text-primary transition-transform group-hover:rotate-45" strokeWidth={1.5} />
            <span className="text-2xl font-heading font-bold tracking-tight text-foreground">Happy Yatra</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLinks />
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-foreground focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="flex flex-col gap-6 py-6 px-6 shadow-inner">
              <NavLinks onClick={() => setIsMobileMenuOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;