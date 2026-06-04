import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Download } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Browse Directory', path: '/browse' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 border-b border-slate-200 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AESTHETIX
          </span>
          <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest hidden sm:inline-block">
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
                className={`text-sm font-semibold tracking-wide transition-colors ${
                  isActive
                    ? 'text-indigo-600'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* CTA: Browse Direct */}
        <div className="hidden md:flex items-center">
          <Link
            to="/browse"
            className="relative overflow-hidden group bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center space-x-2 transition-all shadow-md active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Get Templates</span>
          </Link>
        </div>

        {/* Mobile menu triggers */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-500 hover:text-slate-800 transition-colors p-2 cursor-pointer"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl px-6 py-6 space-y-4 shadow-lg absolute w-full">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block text-base font-semibold transition-colors ${
                location.pathname === link.path ? 'text-indigo-600' : 'text-slate-700'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/browse"
            onClick={() => setIsOpen(false)}
            className="w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 text-sm font-bold flex items-center justify-center space-x-2 shadow-md cursor-pointer"
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
