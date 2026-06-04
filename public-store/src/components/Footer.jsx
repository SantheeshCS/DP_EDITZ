import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-12 px-6 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand identity */}
        <div className="text-center md:text-left space-y-2">
          <Link to="/" className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-wide">
            AESTHETIX
          </Link>
          <p className="text-xs text-slate-500 max-w-sm">
            Curated premium editing templates, poster designs, and elite creative assets. Free to download. No account required.
          </p>
        </div>

        {/* Security badge and notices */}
        <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for creative visual artists</span>
          </div>
          <p className="text-[10px] text-slate-400">
            © {new Date().getFullYear()} Aesthetix. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
