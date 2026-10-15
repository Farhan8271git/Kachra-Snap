import React from 'react';
import { FileText, AlertTriangle, CheckCircle, Scale } from 'lucide-react';

const appName = 'Kachra-Snap';

export default function Terms() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto py-4 px-4">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
          <Scale className="w-3.5 h-3.5" />
          <span>Terms and Conditions v1.0</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          Terms & Conditions of Use
        </h1>
        <p className="text-xs text-slate-500">
          Effective Date: October 2026 • Version 1.0
        </p>
      </div>

      <div className="border-2 border-slate-200 rounded-2xl bg-white">
        <div className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using {appName}, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you should not access or use the application.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              2. Informational Guidance Disclaimer
            </h2>
            <p className="font-semibold text-slate-800">
              {appName} provides informational guidance powered by probabilistic computer vision algorithms. It does not provide legal, municipal, or environmental guarantees.
            </p>
            <p>
              While we strive for high precision, image classifications may occasionally be inaccurate due to lighting, camera angles, physical item degradation, or dataset limitations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              3. Primacy of Local Waste Regulations
            </h2>
            <p>
              Waste management regulations, bin color conventions, and accepted recyclable materials vary widely across cities, counties, and countries. In any case of conflict, your local municipal authority's published guidelines supersede any output provided by {appName}.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">
              4. Limitation of Liability
            </h2>
            <p>
              Under no circumstances shall the creators of {appName} or organizers of the Software & Digital Track be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the application, including but not limited to municipal fines, contaminated recycling loads, or damage resulting from handling hazardous e-waste.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
