import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, User, LogOut } from 'lucide-react';
import { logout } from '../api';
import { toast } from 'sonner';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <nav data-testid="main-navbar" className="backdrop-blur-md bg-white/80 border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group" data-testid="logo-link">
            <Compass className="w-8 h-8 text-primary transition-transform group-hover:rotate-45" strokeWidth={1.5} />
            <span className="text-2xl font-heading font-bold tracking-tight text-secondary">WanderGuide</span>
          </Link>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link to="/survey" className="font-medium text-gray-600 hover:text-primary transition-colors" data-testid="nav-survey-link">Survey</Link>
                <Link to="/recommendations" className="font-medium text-gray-600 hover:text-primary transition-colors" data-testid="nav-recommendations-link">Recommendations</Link>
                <Link to="/profile" className="font-medium text-gray-600 hover:text-primary transition-colors flex items-center gap-2" data-testid="nav-profile-link">
                  <User className="w-4 h-4" strokeWidth={1.5} />
                  Profile
                </Link>
                <button onClick={handleLogout} className="font-medium text-gray-600 hover:text-primary transition-colors flex items-center gap-2" data-testid="logout-button">
                  <LogOut className="w-4 h-4" strokeWidth={1.5} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="font-medium text-gray-600 hover:text-primary transition-colors" data-testid="nav-login-link">Login</Link>
                <Link to="/signup" className="bg-primary text-white rounded-full px-6 py-2 hover:bg-[#A04B32] transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 font-medium" data-testid="nav-signup-button">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;