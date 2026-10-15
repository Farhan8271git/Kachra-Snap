import React from 'react';
import { Recycle, Heart, Shield, Award } from 'lucide-react';

const appName = 'KachraSnap';

export const Footer = ({ onResetConsent, onNavigate }) => {
  const handleNavigate = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Recycle className="w-4 h-4 text-slate-950" />
              </div>
              <span className="font-bold text-base tracking-tight">{appName}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Browser-first AI waste classification running on-device for total privacy.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800 text-[11px] text-emerald-400">
              <Award className="w-3.5 h-3.5" />
              <span>BioSolve Hackathon 2026</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Application
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button type="button" onClick={() => handleNavigate('scan')} className="hover:text-white transition-colors text-left">
                  AI Scanner
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNavigate('guide')} className="hover:text-white transition-colors text-left">
                  Disposal Guide
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNavigate('history')} className="hover:text-white transition-colors text-left">
                  Scan History
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNavigate('how-it-works')} className="hover:text-white transition-colors text-left">
                  How It Works
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Legal & Privacy
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button type="button" onClick={() => handleNavigate('privacy')} className="hover:text-white transition-colors flex items-center gap-1 text-left">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  Privacy Policy
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNavigate('terms')} className="hover:text-white transition-colors text-left">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNavigate('credits')} className="hover:text-white transition-colors text-left">
                  Copyright & Credits
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNavigate('accessibility')} className="hover:text-white transition-colors text-left">
                  Accessibility Statement
                </button>
              </li>
              {onResetConsent && (
                <li>
                  <button
                    type="button"
                    onClick={onResetConsent}
                    className="text-slate-400 hover:text-emerald-400 transition-colors text-left text-[11px]"
                  >
                    Reset Cookie / Legal Preferences
                  </button>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Project & Contact
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button type="button" onClick={() => handleNavigate('about')} className="hover:text-white transition-colors text-left">
                  About the Project
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleNavigate('contact')} className="hover:text-white transition-colors text-left">
                  Contact & Feedback
                </button>
              </li>
              <li className="text-slate-500 text-[11px] pt-1">
                Software & Digital Track
              </li>
              <li className="text-slate-500 text-[11px]">
                Built with React, Vite, TensorFlow.js
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-center sm:text-left">
            © 2026 {appName}. Built for the BioSolve Hackathon. Informational guidance only.
          </p>
          <div className="flex items-center gap-1 text-slate-500 text-[11px]">
            <span>Designed for sustainability</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
            <span>and zero e-waste</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
