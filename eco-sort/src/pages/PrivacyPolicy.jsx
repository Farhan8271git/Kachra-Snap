import React from 'react';
import { ShieldCheck, Lock, Database, Trash2 } from 'lucide-react';

const appName = 'Kachra-Snap';
const contactEmail = 'hello@ecosort.app';

export default function PrivacyPolicy() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto py-4 px-4">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Privacy Policy v1.0</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-500">
          Effective Date: October 2026 • Last Reviewed: October 2026
        </p>
      </div>

      <div className="border-2 border-slate-200 rounded-2xl bg-white">
        <div className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              1. 100% On-Device Processing Guarantee
            </h2>
            <p>
              {appName} is architected from the ground up as a client-side Progressive Web Application (PWA). All image classification operations run entirely within your device's web browser using client-side TensorFlow.js.
            </p>
            <p className="font-semibold text-slate-900">
              We never upload, stream, transmit, or store your camera feeds, video frames, or uploaded photographs on any server or cloud service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              2. Camera and Sensor Permissions
            </h2>
            <p>
              When you use the live scanner, {appName} requests temporary access to your camera via the standard W3C <code>getUserMedia</code> API. Camera access is strictly active while the scanner tab is in use, and stops immediately when you leave the scanner or close the tab. No video recordings are persisted without your explicit instruction.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              3. Local Browser Storage
            </h2>
            <p>
              {appName} uses your browser's local storage (<code>localStorage</code>) exclusively for two purposes:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>
                <strong>Legal Consent State:</strong> Storing your acknowledgement of these terms so you are not repeatedly prompted.
              </li>
              <li>
                <strong>Optional Scan History:</strong> Saving classification logs and low-resolution thumbnails if you choose to click "Save Scan Log".
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-emerald-600" />
              4. Data Control & Deletion
            </h2>
            <p>
              You maintain total sovereignty over your data:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>You can delete individual scan logs at any time in the Scan History tab.</li>
              <li>You can wipe all history instantly by clicking "Clear All".</li>
              <li>You can reset legal consent preferences using the footer link.</li>
              <li>Clearing your browser cache or site data removes all stored records permanently.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">
              5. Contact Regarding Privacy
            </h2>
            <p>
              If you have any questions about our privacy architecture or technical implementation for the BioSolve Hackathon, contact us at <code>{contactEmail}</code>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
