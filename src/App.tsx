/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Terminal, Rocket, Github, ExternalLink, ShieldCheck } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold tracking-tight">BuildReady</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-black/60 hover:text-black transition-colors">Documentation</a>
            <a href="#" className="text-sm font-medium text-black/60 hover:text-black transition-colors">Templates</a>
            <button className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-black/80 transition-all active:scale-95">
              Deploy Now
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <h1 className="text-6xl font-bold tracking-tighter mb-6">
            Production-Ready <br />
            <span className="text-black/40">React Architecture</span>
          </h1>
          <p className="text-xl text-black/60 max-w-2xl mx-auto leading-relaxed">
            A meticulously crafted template designed to eliminate deployment friction and provide a solid foundation for your next big idea.
          </p>
        </motion.div>

        {/* Build Status Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-sm border border-black/5"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Build Status</h3>
                  <p className="text-xs text-black/40 uppercase tracking-widest font-medium">Last check: Just now</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
                Passing
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-[#f9f9f9] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Terminal className="w-5 h-5 text-black/40" />
                  <span className="text-sm font-mono">vite build</span>
                </div>
                <span className="text-xs font-mono text-emerald-600">0.44s</span>
              </div>
              <div className="p-4 bg-[#f9f9f9] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <ShieldCheck className="w-5 h-5 text-black/40" />
                  <span className="text-sm font-mono">tsc --noEmit</span>
                </div>
                <span className="text-xs font-mono text-emerald-600">1.2s</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Fixes */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-black text-white rounded-[32px] p-8 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Troubleshooting Build Errors</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Seeing "Failed to resolve index.tsx"? Ensure your index.html points to the correct entry point (usually src/main.tsx).
              </p>
            </div>
            <div className="space-y-3">
              <div className="text-xs font-mono text-white/40 bg-white/5 p-3 rounded-xl border border-white/10">
                &lt;script src="/src/main.tsx"&gt;
              </div>
              <button className="w-full py-3 bg-white text-black rounded-2xl text-sm font-semibold hover:bg-white/90 transition-colors">
                View Fix Guide
              </button>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Vite 6', desc: 'Lightning fast HMR and optimized production builds.' },
            { title: 'Tailwind 4', desc: 'The latest utility-first CSS framework for rapid UI.' },
            { title: 'TypeScript', desc: 'Strict type safety for robust application logic.' },
            { title: 'Motion', desc: 'Fluid animations and transitions out of the box.' },
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              className="p-6 bg-white rounded-2xl border border-black/5 hover:border-black/10 transition-colors group"
            >
              <h4 className="font-bold mb-2 group-hover:text-black transition-colors">{feature.title}</h4>
              <p className="text-sm text-black/50 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-black/5 mt-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-40">
            <Rocket className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">BuildReady v1.0.0</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors">Privacy</a>
            <a href="#" className="text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors">Terms</a>
            <a href="#" className="text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors flex items-center gap-1">
              Github <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
