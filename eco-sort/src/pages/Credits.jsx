import React from 'react';
import { Award, ExternalLink, Heart } from 'lucide-react';

const appName = 'EcoSort AI';

export default function Credits() {
  const credits = [
    {
      title: '29-Class Waste & Recyclables Teachable Machine Model',
      author: 'Teachable Machine Community Model (OGpAH453K)',
      license: 'Open Access / Creative Commons',
      link: 'https://teachablemachine.withgoogle.com/models/OGpAH453K/',
      description:
        'Trained multi-class neural network classifying 29 waste objects including bottles, cans, paper, food waste, cardboard, cartons, and batteries.',
    },
    {
      title: 'New Trash Classification Dataset',
      author: 'Damar Galih (Kaggle)',
      license: 'Creative Commons Attribution 4.0 International (CC BY 4.0)',
      link: 'https://www.kaggle.com/datasets/damargalih/new-trash-classfication-dataset',
      description:
        'Comprehensive image dataset comprising thousands of labeled images across plastic, paper, cardboard, metal, glass, organic, and e-waste used for training transfer learning models.',
    },
    {
      title: 'TensorFlow.js & Teachable Machine',
      author: 'Google Research / TensorFlow Team',
      license: 'Apache License 2.0',
      link: 'https://teachablemachine.withgoogle.com/',
      description:
        'Web-native deep learning runtime providing MobileNet transfer learning architectures and WebGL/WASM acceleration in the browser.',
    },
    {
      title: 'Lucide Icons',
      author: 'Lucide Contributors',
      license: 'ISC License',
      link: 'https://lucide.dev/',
      description:
        'Clean, accessible, and lightweight SVG icon set for modern web applications.',
    },
    {
      title: 'React & Vite',
      author: 'Meta & Vite Community',
      license: 'MIT License',
      link: 'https://vite.dev/',
      description:
        'Fast frontend tooling, component composition engine, and static bundler.',
    },
  ];

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-4 px-4">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
          <Award className="w-3.5 h-3.5" />
          <span>Attributions & Licenses</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          Copyright & Credits
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          We gratefully acknowledge the researchers, artists, and open-source contributors whose assets and tools make {appName} possible.
        </p>
      </div>

      <div className="space-y-4">
        {credits.map((item, idx) => (
          <div key={idx} className="border-2 border-slate-200 rounded-2xl bg-white">
            <div className="p-6 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {item.title}
                </h2>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-700 gap-1"
                >
                  Source <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-medium text-slate-700">
                  By {item.author}
                </span>
                <span className="text-slate-400">•</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[11px]">
                  {item.license}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center gap-3">
        <Heart className="w-5 h-5 text-rose-500 shrink-0 fill-rose-500" />
        <span>
          Developed for the Software & Digital Track in support of the United Nations Sustainable Development Goal 12: Responsible Consumption and Production.
        </span>
      </div>
    </div>
  );
}
