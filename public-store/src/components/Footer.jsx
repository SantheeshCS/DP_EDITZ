import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#030712] py-16 px-6 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand identity */}
        <div className="space-y-4 md:col-span-1">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/LOGO.png" 
              alt="DP EDITZ Logo" 
              className="w-8 h-8 object-contain rounded-full shadow-sm grayscale hover:grayscale-0 transition-all" 
            />
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              DP_EDITZ_TEMPLATES
            </span>
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
            Curated premium editing templates, poster designs, and elite creative assets. Free to download. No account required.
          </p>
        </div>

        {/* Download Apps */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Get Editing Apps</h3>
          <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
            <li>
              <a href="https://capecutapk.com/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                CapCut Pro
              </a>
            </li>
            <li>
              <a href="https://alightmotionsapps.com/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Alight Motion
              </a>
            </li>
            <li>
              <a href="https://lrszone.com/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                Lightroom Premium
              </a>
            </li>
          </ul>
        </div>

        {/* Security badge and notices */}
        <div className="flex flex-col items-start md:items-end gap-2 text-left md:text-right">
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Crafted for visual artists
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-4">
            © {new Date().getFullYear()} DP_EDITZ_TEMPLATES.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
