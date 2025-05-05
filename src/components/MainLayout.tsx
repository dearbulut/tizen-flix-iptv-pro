
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, Settings, Home, Film, Tv, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Ana Sayfa', icon: <Home size={24} /> },
    { path: '/live', label: 'Canlı TV', icon: <Tv size={24} /> },
    { path: '/movies', label: 'Filmler', icon: <Film size={24} /> },
    { path: '/series', label: 'Diziler', icon: <Film size={24} /> },
  ];

  return (
    <div className="min-h-screen bg-netflix-black flex flex-col">
      <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-netflix-black to-transparent">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-netflix-red font-bold text-2xl">
                TizenFlix
              </Link>
              <nav className="hidden md:flex items-center space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`text-base ${
                      isActive(item.path) 
                        ? 'text-white font-semibold' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/search')} 
                className="p-2 rounded-full hover:bg-netflix-mediumGray"
              >
                <Search size={20} className="text-white" />
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)} 
                  className="p-2 rounded-full hover:bg-netflix-mediumGray"
                >
                  <User size={20} className="text-white" />
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-netflix-darkGray border border-netflix-mediumGray rounded shadow-lg py-2 z-50">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-gray-300 hover:bg-netflix-mediumGray"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <User size={16} className="inline mr-2" />
                      Profil
                    </Link>
                    <Link 
                      to="/settings" 
                      className="block px-4 py-2 text-gray-300 hover:bg-netflix-mediumGray"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Settings size={16} className="inline mr-2" />
                      Ayarlar
                    </Link>
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }} 
                      className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-netflix-mediumGray"
                    >
                      <LogOut size={16} className="inline mr-2" />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow pt-16">
        {children}
      </main>
      
      <nav className="md:hidden fixed bottom-0 w-full bg-netflix-black border-t border-netflix-mediumGray z-40">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`py-3 px-4 flex flex-col items-center ${
                isActive(item.path) 
                  ? 'text-netflix-red' 
                  : 'text-gray-400'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;
