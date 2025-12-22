import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Sun, Cloud, DollarSign, Plane } from 'lucide-react';

// --- Mock Data (Simulating what comes from MCP) ---
const MOCK_DESTINATIONS = [
  {
    id: "dest_001",
    name: "Amalfi Coast",
    country: "Italy",
    description: "Dramatic cliffs and coastal villages.",
    price: "$$$",
    image: "https://images.unsplash.com/photo-1633321088355-d0f8c1eaad48?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "dest_002",
    name: "Santorini",
    country: "Greece",
    description: "White buildings, blue domes, sunsets.",
    price: "$$$",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "dest_003",
    name: "Bali",
    country: "Indonesia",
    description: "Tropical beaches and lush jungles.",
    price: "$",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop"
  }
];

// --- Translations ---
const TRANSLATIONS = {
  en: {
    title: "RTH Synapse Voyage Architect",
    subtitle: "Advanced AI Travel Engineering",
    tabs: { inspire: "Inspire", plan: "Architect", saved: "Vault" },
    noSaved: "No archived voyages.",
    planTitle: "Initialize Architecture",
    planDesc: "Input your parameters: destination, budget, and style. I will architect the optimal flow.",
    placeholder: "e.g. 14 days in Japan, cultural immersion & luxury...",
    goBtn: "Generate Architecture"
  },
  it: {
    title: "RTH Synapse Voyage Architect",
    subtitle: "Ingegneria di Viaggio AI Avanzata",
    tabs: { inspire: "Ispirazione", plan: "Architetto", saved: "Archivio" },
    noSaved: "Nessun viaggio archiviato.",
    planTitle: "Inizializza Architettura",
    planDesc: "Inserisci i parametri: destinazione, budget e stile. Progetterò il flusso ottimale.",
    placeholder: "es. 14 giorni in Giappone, immersione culturale e lusso...",
    goBtn: "Genera Architettura"
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('inspire');
  // Simple language detection: default to 'en', switch to 'it' if browser is Italian
  const [lang, setLang] = useState(navigator.language.startsWith('it') ? 'it' : 'en');
  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <header className="mb-12 text-center relative">
        {/* Language Switcher */}
        <div className="absolute top-0 right-0">
          <button
            onClick={() => setLang(lang === 'en' ? 'it' : 'en')}
            className="text-xs font-bold px-2 py-1 rounded bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
          >
            {lang.toUpperCase()}
          </button>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent"
        >
          {t.title}
        </motion.h1>
        <p className="text-slate-400 mt-2">{t.subtitle}</p>
      </header>

      {/* Navigation Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        {Object.keys(t.tabs).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setActiveTab(tabKey)}
            className={`px-6 py-2 rounded-full transition-all ${activeTab === tabKey
              ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
          >
            {t.tabs[tabKey]}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <main>
        {activeTab === 'inspire' && <InspireView />}
        {activeTab === 'plan' && <PlanView t={t} />}
        {activeTab === 'saved' && <div className="text-center text-slate-500">{t.noSaved}</div>}
      </main>
    </div>
  );
}

// --- Sub-Components ---

function InspireView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {MOCK_DESTINATIONS.map((dest, i) => (
        <motion.div
          key={dest.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card overflow-hidden group cursor-pointer hover:border-sky-500/50 transition-colors"
        >
          <div className="h-48 overflow-hidden relative">
            <img
              src={dest.image}
              alt={dest.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-xs font-bold">
              {dest.price}
            </div>
          </div>
          <div className="p-5">
            <h3 className="text-xl font-bold mb-1">{dest.name}</h3>
            <div className="flex items-center text-slate-400 text-sm mb-3">
              <MapPin size={14} className="mr-1" />
              {dest.country}
            </div>
            <p className="text-slate-300 text-sm">{dest.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function PlanView({ t }) {
  return (
    <div className="glass-card p-8 text-center">
      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <Plane className="text-sky-400" size={32} />
      </div>
      <h2 className="text-2xl font-bold mb-2">{t.planTitle}</h2>
      <p className="text-slate-400 mb-6">{t.planDesc}</p>

      <div className="flex gap-2 max-w-md mx-auto">
        <input
          type="text"
          placeholder={t.placeholder}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-sky-500 transition-colors"
        />
        <button className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          {t.goBtn}
        </button>
      </div>
    </div>
  );
}

export default App;
