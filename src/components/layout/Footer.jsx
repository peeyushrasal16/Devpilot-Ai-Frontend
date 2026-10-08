import React from 'react';
import { Terminal, Shield, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950/80 border-t border-slate-800/80 py-4 px-6 mt-auto text-xs text-slate-400">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-brand-400" />
          <span className="font-semibold text-slate-300">DevPilot AI</span>
          <span className="text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400">
            AI-Powered Developer Project Management Platform
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          {/* <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>API Online :8080</span>
          </div> */}
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>JWT Secured</span>
          </div>
          <span className="text-slate-700">•</span>
          <span>© {new Date().getFullYear()} DevPilot AI</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
