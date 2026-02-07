import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, User, LogOut, Sun, Moon } from 'lucide-react';
import { logout } from '@/api.jsx';
import { toast } from 'sonner';
import { useTheme } from '@/components/theme-provider.jsx';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <nav data-testid="main-navbar" className="backdrop-blur-md bg-background/80 border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group" data-testid="logo-link">
            <Compass className="w-8 h-8 text-primary transition-transform group-hover:rotate-45" strokeWidth={1.5} />
            <span className="text-2xl font-heading font-bold tracking-tight text-foreground">Happy Yatraa</span>
          </Link>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {user ? (
              <>
                <Link to="/survey" className="font-medium text-muted-foreground hover:text-primary transition-colors" data-testid="nav-survey-link">Survey</Link>
                <Link to="/recommendations" className="font-medium text-muted-foreground hover:text-primary transition-colors" data-testid="nav-recommendations-link">Recommendations</Link>
                <Link to="/profile" className="font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2" data-testid="nav-profile-link">
                  <User className="w-4 h-4" strokeWidth={1.5} />
                  Profile
                </Link>
                <button onClick={handleLogout} className="font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2" data-testid="logout-button">
                  <LogOut className="w-4 h-4" strokeWidth={1.5} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="font-medium text-muted-foreground hover:text-primary transition-colors" data-testid="nav-login-link">Login</Link>
                <Link to="/signup" className="bg-primary text-primary-foreground rounded-full px-6 py-2 hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 font-medium" data-testid="nav-signup-button">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;