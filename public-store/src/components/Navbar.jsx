import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Download, Moon, Sun } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Browse Directory', path: '/browse' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#030712]/95 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/LOGO.png" 
            alt="DP EDITZ Logo" 
            className="w-10 h-10 object-contain rounded-full shadow-sm" 
          />
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white hidden sm:block">
            DP_EDITZ
          </span>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono uppercase hidden md:inline-block">
            Directory
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium tracking-tight transition-colors ${
                  isActive
                    ? 'text-slate-900 dark:text-white border-b border-slate-900 dark:border-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-b border-transparent'
                } py-1`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* CTA & Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <Link
            to="/browse"
            className="bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-md px-4 py-2 text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Get Templates</span>
          </Link>
        </div>

        {/* Mobile menu triggers */}
        <div className="md:hidden flex items-center space-x-3">
          <button
            onClick={toggleDarkMode}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1 cursor-pointer"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#030712] px-6 py-6 space-y-6 shadow-sm absolute w-full z-40">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <Link
            to="/browse"
            onClick={() => setIsOpen(false)}
            className="w-full text-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-md py-3 text-xs font-semibold flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Get Templates</span>
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
