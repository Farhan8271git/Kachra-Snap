import React from 'react';
import { Eye, Check, Keyboard, Smartphone } from 'lucide-react';

const appName = 'EcoSort AI';
const contactEmail = 'hello@ecosort.app';

export default function Accessibility() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto py-4 px-4">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
          <Eye className="w-3.5 h-3.5" />
          <span>Universal Access</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          Accessibility Statement
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          {appName} is dedicated to ensuring digital waste guidance is accessible to all users, regardless of ability or assistive technology.
        </p>
      </div>

      <div className="border-2 border-slate-200 rounded-2xl bg-white">
        <div className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              1. Conformance Standard
            </h2>
            <p>
              We aim to adhere to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards across all application screens, dialogs, and interactive widgets.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-emerald-600" />
              2. Full Keyboard Navigation
            </h2>
            <p>
              All core interactions—including tab switching, file upload selection, scan initiation, history deletion, and legal consent actions—are fully navigable via standard keyboard inputs:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><code>Tab</code> / <code>Shift+Tab</code>: Move focus across interactive controls</li>
              <li><code>Enter</code> / <code>Space</code>: Activate buttons and toggle checkboxes</li>
              <li><code>Escape</code>: Close active modal dialogs</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              3. Visual & Ergonomic Design
            </h2>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>
                <strong>Color Contrast:</strong> Minimum 4.5:1 text-to-background contrast ratio for standard body copy.
              </li>
              <li>
                <strong>Touch Targets:</strong> Interactive touch targets meet the minimum 44×44px recommendation for mobile screen ergonomics.
              </li>
              <li>
                <strong>Reduced Motion:</strong> Supports operating system preferences for reduced animations.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">
              4. Feedback and Reporting Issues
            </h2>
            <p>
              If you experience any barriers accessing content or services within {appName}, please contact us via our Contact form or email <code>{contactEmail}</code>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
