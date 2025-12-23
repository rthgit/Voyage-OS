import React, { useState } from 'react';
import {
    FileText,
    Presentation,
    Download,
    Plus,
    Settings,
    Layout,
    Type,
    Image as ImageIcon,
    CheckCircle2,
    Loader2,
    ChevronRight,
    FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MyPDFApp = () => {
    const [activeTab, setActiveTab] = useState('pdf');
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleGenerate = async () => {
        if (!title) return;
        setIsGenerating(true);
        setResult(null);

        // Mock generation for UI feedback
        setTimeout(() => {
            setIsGenerating(false);
            setResult({
                filename: activeTab === 'pdf' ? `${title.replace(/\s+/g, '_')}.pdf` : `${title.replace(/\s+/g, '_')}.pptx`,
                type: activeTab
            });
        }, 2000);
    };

    const templates = [
        { id: 1, title: 'Report Aziendale', type: 'pdf', icon: <FileText className="w-5 h-5" />, desc: 'Layout pulito con grafici e tabelle finanziarie.' },
        { id: 2, title: 'Pitch Deck Startup', type: 'pptx', icon: <Presentation className="w-5 h-5" />, desc: '10 slide ottimizzate per investitori e partner.' },
        { id: 3, title: 'Manuale Tecnico', type: 'pdf', icon: <Layout className="w-5 h-5" />, desc: 'Struttura a capitoli con indice e glossario.' },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
            {/* Sidebar / Nav */}
            <div className="flex flex-1">
                <aside className="w-64 bg-white border-r border-gray-200 p-6 hidden lg:flex flex-col">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="bg-pdf-light p-2 rounded-xl shadow-lg shadow-blue-100">
                            <FileDown className="text-white w-6 h-6" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">MyPDF</h1>
                    </div>

                    <nav className="space-y-2 flex-1">
                        <button
                            onClick={() => setActiveTab('pdf')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'pdf' ? 'bg-pdf-light text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <FileText className="w-4 h-4" />
                            Report PDF
                        </button>
                        <button
                            onClick={() => setActiveTab('pptx')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'pptx' ? 'bg-pdf-light text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <Presentation className="w-4 h-4" />
                            Slide PPTX
                        </button>
                        <div className="pt-6 pb-2">
                            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold px-4">Recenti</p>
                        </div>
                        <button className="w-full flex items-center justify-between px-4 py-2 text-xs text-gray-500 hover:text-gray-800">
                            <span>Analisi_Q4.pdf</span>
                            <ChevronRight className="w-3 h-3" />
                        </button>
                    </nav>

                    <div className="mt-auto pt-6 border-t border-gray-100">
                        <div className="bg-gray-50 rounded-2xl p-4">
                            <p className="text-xs font-bold text-gray-700 mb-1">Piano Pro</p>
                            <p className="text-[10px] text-gray-500 mb-3">Documenti illimitati e export HD.</p>
                            <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                                <div className="bg-pdf-light h-full w-3/4"></div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
                    <header className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {activeTab === 'pdf' ? 'Nuovo Report PDF' : 'Nuova Presentazione PPTX'}
                            </h2>
                            <p className="text-sm text-gray-500">Trasforma le tue idee in documenti pronti all'uso.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-2 text-gray-400 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-200">
                                <Settings className="w-5 h-5" />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-pdf-accent/10 flex items-center justify-center text-pdf-accent font-bold text-sm border border-pdf-accent/20">
                                CQ
                            </div>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Editor Area */}
                        <div className="xl:col-span-2 space-y-6">
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Titolo Documento</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="es. Analisi di Mercato 2025"
                                            className="w-full text-2xl font-bold text-gray-800 placeholder-gray-200 focus:outline-none border-b-2 border-transparent focus:border-pdf-light pb-2 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Contenuto Principale</label>
                                        <textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="Descrivi qui il contenuto o incolla il testo da elaborare..."
                                            className="w-full h-64 text-gray-600 placeholder-gray-300 focus:outline-none resize-none text-lg leading-relaxed"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                        <div className="flex gap-2">
                                            <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-xl transition-all" title="Aggiungi Immagine">
                                                <ImageIcon className="w-5 h-5" />
                                            </button>
                                            <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-xl transition-all" title="Formattazione Testo">
                                                <Type className="w-5 h-5" />
                                            </button>
                                            <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-xl transition-all" title="Layout">
                                                <Layout className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={handleGenerate}
                                            disabled={!title || isGenerating}
                                            className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-xl shadow-blue-100 ${!title || isGenerating
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-pdf-light text-white hover:bg-pdf-dark active:scale-95'
                                                }`}
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Elaborazione...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-5 h-5" />
                                                    Genera {activeTab.toUpperCase()}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Result Card */}
                            <AnimatePresence>
                                {result && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white border-2 border-green-100 rounded-3xl p-8 shadow-xl flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="bg-green-50 p-4 rounded-2xl">
                                                <CheckCircle2 className="text-green-500 w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">{result.filename}</h3>
                                                <p className="text-sm text-gray-500">Documento pronto per il download.</p>
                                            </div>
                                        </div>
                                        <button className="bg-pdf-light text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-pdf-dark transition-all shadow-lg shadow-blue-100">
                                            <Download className="w-5 h-5" />
                                            Scarica Ora
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Sidebar Tools */}
                        <div className="space-y-8">
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                <h4 className="font-bold text-gray-800 mb-4 px-2">Template Rapidi</h4>
                                <div className="space-y-3">
                                    {templates.map(t => (
                                        <button
                                            key={t.id}
                                            className="w-full text-left p-4 rounded-2xl border border-gray-50 hover:border-pdf-light hover:bg-blue-50/30 transition-all group"
                                        >
                                            <div className="flex items-center gap-3 mb-1">
                                                <div className="text-gray-400 group-hover:text-pdf-light transition-colors">
                                                    {t.icon}
                                                </div>
                                                <span className="font-bold text-gray-700 text-sm">{t.title}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 pl-8">{t.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-pdf-dark to-blue-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <h4 className="font-bold text-lg mb-2">AI Document Intelligence</h4>
                                    <p className="text-xs text-blue-100 leading-relaxed mb-6">
                                        L'AI analizzerà il tuo testo per creare automaticamente grafici, tabelle e un layout professionale coerente con il brand.
                                    </p>
                                    <button className="w-full bg-white text-pdf-dark py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all">
                                        Scopri di più
                                    </button>
                                </div>
                                <div className="absolute -right-10 -bottom-10 opacity-10">
                                    <FileText className="w-40 h-40" />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <footer className="p-6 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest border-t border-gray-100 bg-white">
                © 2025 MyPDF Architect • Powered by RTH Synapse Protocol
            </footer>
        </div>
    );
};

export default MyPDFApp;
