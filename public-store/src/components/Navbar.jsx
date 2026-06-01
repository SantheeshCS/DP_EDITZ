import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Browse Catalog', path: '/browse' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
            AESTHETIX
          </span>
          <span className="text-[10px] bg-purple-500/10 border border-purple-500/30 text-purple-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest hidden sm:inline-block">
            Market
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
                    ? 'text-purple-400'
                    : 'text-slate-300 hover:text-purple-400'
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
            className="relative overflow-hidden group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center space-x-2 transition-all shadow-lg shadow-purple-600/20 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Storefront</span>
          </Link>
        </div>

        {/* Mobile menu triggers */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-400 hover:text-slate-200 transition-colors p-2"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#030712]/95 backdrop-blur-xl px-6 py-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block text-base font-semibold transition-colors ${
                location.pathname === link.path ? 'text-purple-400' : 'text-slate-300'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/browse"
            onClick={() => setIsOpen(false)}
            className="w-full text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl py-3 text-sm font-bold flex items-center justify-center space-x-2 shadow-lg"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Templates</span>
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
