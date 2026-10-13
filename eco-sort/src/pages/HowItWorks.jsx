import { Camera, Cpu, ShieldCheck, Sliders, ArrowRight } from 'lucide-react';

export default function HowItWorks({ onNavigate }) {
  const steps = [
    {
      num: '01',
      title: 'Image Acquisition & Normalization',
      icon: Camera,
      desc: 'When you take a photo or select an image, the browser processes the raw bitmap into an offscreen canvas. The image is cropped to a 1:1 aspect ratio and normalized to a 224×224 pixel matrix compatible with MobileNet tensor requirements.',
    },
    {
      num: '02',
      title: 'On-Device TensorFlow.js Inference',
      icon: Cpu,
      desc: 'The normalized image tensor is passed into an optimized neural network running in WebGL or WebAssembly directly inside your browser. No image data, frames, or biometric information are ever sent across a network.',
    },
    {
      num: '03',
      title: 'Confidence Evaluation & Safety Guardrails',
      icon: Sliders,
      desc: 'The model produces a softmax probability distribution across all trained material classes. If the top class confidence falls below 65%, EcoSort AI intentionally reports the result as "Uncertain" to prevent contamination from wish-cycling.',
    },
    {
      num: '04',
      title: 'Actionable Disposal Guidance',
      icon: ShieldCheck,
      desc: 'The recognized class is mapped to standard waste streams (Recyclable, Organic, E-Waste) with strict preparation steps—such as rinsing food containers, removing plastic produce tags, or taping battery terminals.',
    },
  ];

  return (
    <div className="space-y-12 max-w-4xl mx-auto py-4 px-4">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-5xl font-black text-charcoal tracking-tight">
          How EcoSort AI Works
        </h1>
        <p className="text-sm sm:text-base text-secondary max-w-2xl mx-auto leading-relaxed">
          Explore the technical pipeline behind our browser-first waste classification system and local inference engine.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.num} className="rounded-lg border border-border bg-white">
              <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-6">
                <div className="flex items-center gap-4 sm:flex-col sm:items-center">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-sage text-forest">
                    STEP {step.num}
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-offwhite text-forest flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <div className="space-y-2 flex-1">
                  <h2 className="text-xl font-bold text-charcoal">
                    {step.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Model & Architecture Specs */}
      <div className="space-y-4 rounded-lg border border-border bg-white p-6 sm:p-8">
        <h2 className="text-xl font-bold text-charcoal">Model Architecture & Offline Guarantee</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1 rounded-lg border border-border bg-offwhite p-4">
            <span className="block font-semibold text-secondary">Backbone</span>
            <strong className="text-sm text-charcoal">MobileNet v2 Transfer</strong>
            <p className="text-[11px] text-secondary">Trained via Google Teachable Machine</p>
          </div>

          <div className="space-y-1 rounded-lg border border-border bg-offwhite p-4">
            <span className="block font-semibold text-secondary">Inference Runtime</span>
            <strong className="text-sm text-charcoal">TensorFlow.js WebGL / WASM</strong>
            <p className="text-[11px] text-secondary">Zero backend network roundtrips</p>
          </div>

          <div className="space-y-1 rounded-lg border border-border bg-offwhite p-4">
            <span className="block font-semibold text-secondary">Offline Caching</span>
            <strong className="text-sm text-charcoal">Workbox Service Worker</strong>
            <p className="text-[11px] text-secondary">Precached model weights & guidance</p>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="button"
            onClick={() => onNavigate?.('scan')}
            className="inline-flex items-center rounded-md bg-forest px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-deep"
          >
            Try It Live <ArrowRight className="w-4 h-4 ml-1.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
