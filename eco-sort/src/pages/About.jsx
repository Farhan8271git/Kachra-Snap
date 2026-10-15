import React from 'react';
import { Award, Target, Cpu, Shield, Globe, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-12 max-w-4xl mx-auto py-4 px-4">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
          <Award className="w-3.5 h-3.5" />
          <span>BioSolve Hackathon 2026</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          About EcoSort AI
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Developed for the Software & Digital track of the BioSolve Hackathon to make waste sorting transparent, private, and contamination-free.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border-2 border-slate-200 rounded-2xl bg-white">
          <div className="p-6 sm:p-8 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              The Recycling Contamination Crisis
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Nearly 1 in 4 items placed in residential recycling bins cannot actually be recycled. "Wish-cycling"—hoping an item is recyclable—clogs sorting facilities, ruins entire loads of clean paper and cardboard with grease, and costs municipalities millions of dollars annually.
            </p>
          </div>
        </div>

        <div className="border-2 border-slate-200 rounded-2xl bg-white">
          <div className="p-6 sm:p-8 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Our Digital Solution
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              EcoSort AI brings computer vision directly to consumers' fingertips without friction. By operating completely in the browser, users can instantly determine if an item is truly recyclable, organic compost, or toxic e-waste—even with no cell signal in recycling basements or rural parks.
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-slate-900 text-white space-y-6">
        <h2 className="text-xl font-bold">Core Engineering Principles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="space-y-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white text-sm">Genuine & Honest</h3>
            <p className="text-slate-400 leading-relaxed">
              Never fabricating fake AI scores. Low-confidence outputs are flagged as uncertain to avoid false confidence.
            </p>
          </div>

          <div className="space-y-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white text-sm">Privacy by Design</h3>
            <p className="text-slate-400 leading-relaxed">
              Your camera feed never leaves your device. No user tracking, no backend image ingestion.
            </p>
          </div>

          <div className="space-y-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white text-sm">Open & Accessible</h3>
            <p className="text-slate-400 leading-relaxed">
              Built with open web standards, keyboard accessibility, high contrast, and responsive ergonomics for all screens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
