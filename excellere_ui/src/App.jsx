import React, { useState } from 'react';
import {
    FileSpreadsheet,
    Download,
    Plus,
    Settings,
    Zap,
    Table as TableIcon,
    BarChart3,
    Layers,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const ExcellereApp = () => {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('create');
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${window.location.origin}/api/upload`, formData);
            setPrompt(`Analizza il file Excel caricato: ${response.data.filename}. Dimmi cosa contiene e suggerisci dei miglioramenti.`);
            setActiveTab('create');
        } catch (error) {
            console.error("Upload error:", error);
            alert("Errore durante l'upload del file.");
        } finally {
            setUploading(false);
        }
    };

    const handleGenerate = async () => {
        if (!prompt) return;

        setIsGenerating(true);
        setResult(null);

        try {
            // Logica di "comprensione" del prompt (mock per ora)
            let data = {
                filename: 'Documento_Generato.xlsx',
                sheets: [{
                    name: 'Foglio1',
                    columns: [{ header: 'Dato', key: 'dato' }, { header: 'Valore', key: 'valore' }],
                    rows: [{ dato: 'Esempio', valore: 100 }]
                }]
            };

            if (prompt.toLowerCase().includes('budget')) {
                data = {
                    filename: 'Budget_Personale_2024.xlsx',
                    sheets: [{
                        name: 'Riepilogo Mensile',
                        columns: [
                            { header: 'Categoria', key: 'cat' },
                            { header: 'Previsto (€)', key: 'prev' },
                            { header: 'Effettivo (€)', key: 'eff' },
                            { header: 'Differenza (€)', key: 'diff' }
                        ],
                        rows: [
                            { cat: 'Affitto/Mutuo', prev: 800, eff: 800, diff: 0 },
                            { cat: 'Spesa Alimentare', prev: 400, eff: 450, diff: -50 },
                            { cat: 'Trasporti', prev: 150, eff: 120, diff: 30 },
                            { cat: 'Svago', prev: 200, eff: 250, diff: -50 },
                            { cat: 'Risparmi', prev: 500, eff: 400, diff: -100 }
                        ]
                    }]
                };
            } else if (prompt.toLowerCase().includes('vendite')) {
                data = {
                    filename: 'Report_Vendite_Q4.xlsx',
                    sheets: [{
                        name: 'Dati Vendite',
                        columns: [
                            { header: 'Prodotto', key: 'prod' },
                            { header: 'Quantità', key: 'qty' },
                            { header: 'Prezzo Unitario', key: 'price' },
                            { header: 'Totale', key: 'total' }
                        ],
                        rows: [
                            { prod: 'Laptop Pro 15', qty: 12, price: 1200, total: 14400 },
                            { prod: 'Monitor 4K', qty: 25, price: 350, total: 8750 },
                            { prod: 'Tastiera Mech', qty: 45, price: 80, total: 3600 }
                        ]
                    }]
                };
            }

            const response = await axios.post(`${window.location.origin}/api/generate`, data);

            if (response.data.success) {
                setResult({
                    filename: data.filename,
                    url: response.data.downloadUrl,
                    sheets: data.sheets.map(s => s.name)
                });
            }
        } catch (error) {
            console.error("Errore durante la generazione:", error);
            alert("Errore di connessione al server Excellere.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (result && result.url) {
            window.open(result.url, '_blank');
        }
    };

    const handleTemplateClick = (t) => {
        setPrompt(`Crea un file Excel per: ${t.title}. ${t.desc}`);
        setActiveTab('create');
    };

    const templates = [
        { id: 'quotes', title: 'Preventivi', icon: <FileSpreadsheet className="w-5 h-5" />, desc: 'Struttura professionale con calcolo automatico IVA e totali.' },
        { id: 'inventory', title: 'Magazzino', icon: <Layers className="w-5 h-5" />, desc: 'Tracciamento scorte, codici SKU e alert sottoscorta.' },
        { id: 'orders', title: 'Gestione Ordini', icon: <TableIcon className="w-5 h-5" />, desc: 'Registro ordini clienti con stato spedizione e pagamenti.' },
        { id: 'cashflow', title: 'Analisi Cashflow', icon: <BarChart3 className="w-5 h-5" />, desc: 'Monitoraggio entrate e uscite monetarie mensili.' },
        { id: 'crm', title: 'CRM Clienti', icon: <Settings className="w-5 h-5" />, desc: 'Database contatti, storico interazioni e gestione lead.' },
        { id: 'sales', title: 'Analisi Vendite', icon: <BarChart3 className="w-5 h-5" />, desc: 'Report dettagliato prestazioni per prodotto e regione.' },
        { id: 'expenses', title: 'Nota Spese', icon: <Zap className="w-5 h-5" />, desc: 'Modulo per rimborso spese trasferte e pasti.' },
        { id: 'marketing', title: 'Piano Marketing', icon: <Plus className="w-5 h-5" />, desc: 'Pianificazione campagne, canali e monitoraggio budget.' },
        { id: 'gantt', title: 'Gantt Project', icon: <Layers className="w-5 h-5" />, desc: 'Timeline di progetto con task, scadenze e responsabili.' },
        { id: 'attendance', title: 'Registro Presenze', icon: <TableIcon className="w-5 h-5" />, desc: 'Controllo ore lavorate, ferie e permessi dipendenti.' },
        { id: 'social', title: 'Social Calendar', icon: <Zap className="w-5 h-5" />, desc: 'Pianificazione editoriale per Facebook, IG e LinkedIn.' },
        { id: 'roi', title: 'Calcolo ROI', icon: <BarChart3 className="w-5 h-5" />, desc: 'Analisi ritorno sugli investimenti per nuovi progetti.' },
    ];

    return (
        <div className="min-h-screen bg-excel-bg flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-excel-light p-2 rounded-lg">
                        <FileSpreadsheet className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">Excellere</h1>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Excel Automation AI</p>
                    </div>
                </div>

                <nav className="hidden md:flex items-center gap-8">
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`text-sm font-semibold transition-colors ${activeTab === 'create' ? 'text-excel-light' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        Crea
                    </button>
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`text-sm font-semibold transition-colors ${activeTab === 'templates' ? 'text-excel-light' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        Template
                    </button>
                </nav>

                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 bg-excel-light/10 hover:bg-excel-light/20 text-excel-light px-4 py-2 rounded-xl cursor-pointer transition-all border border-excel-light/20">
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-bold">{uploading ? '...' : 'Analizza File'}</span>
                        <input type="file" className="hidden" onChange={handleFileUpload} accept=".xlsx,.xls" disabled={uploading} />
                    </label>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-excel-light to-green-400 flex items-center justify-center text-white font-bold text-xs">
                        CQ
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-10">
                <AnimatePresence mode="wait">
                    {activeTab === 'create' ? (
                        <motion.div
                            key="create"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-extrabold text-gray-900">Cosa vuoi costruire oggi?</h2>
                                <p className="text-gray-500">Descrivi il tuo foglio Excel e l'AI si occuperà di formule, tabelle e formattazione.</p>
                            </div>

                            <div className="glass-card rounded-2xl p-1 shadow-xl">
                                <div className="bg-white rounded-xl p-4">
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Esempio: Crea un file per il calcolo del cashflow aziendale mensile..."
                                        className="w-full h-40 p-4 text-gray-700 placeholder-gray-400 focus:outline-none resize-none text-lg leading-relaxed"
                                    />
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex gap-2">
                                            <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors">
                                                <Zap className="w-5 h-5" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors">
                                                <TableIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleGenerate}
                                            disabled={!prompt || isGenerating}
                                            className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${!prompt || isGenerating
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                                : 'bg-excel-light text-white hover:bg-excel-dark active:scale-95'
                                                }`}
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Generazione...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-5 h-5" />
                                                    Genera Spreadsheet
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Result */}
                            <AnimatePresence>
                                {result && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white border border-green-100 rounded-2xl p-6 shadow-lg flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="bg-green-100 p-3 rounded-full">
                                                <CheckCircle2 className="text-green-600 w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{result.filename}</h3>
                                                <p className="text-sm text-gray-500">Generato con successo • {result.sheets.length} fogli</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleDownload}
                                            className="bg-excel-light text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-excel-dark transition-all shadow-md"
                                        >
                                            <Download className="w-5 h-5" />
                                            Scarica
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Quick Tips */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-yellow-500" /> Analisi AI
                                    </h4>
                                    <p className="text-sm text-gray-500">Carica un file esistente e chiedi all'AI di analizzarlo o migliorarlo.</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-blue-500" /> Multi-Foglio
                                    </h4>
                                    <p className="text-sm text-gray-500">Strutture complesse con più fogli collegati tra loro.</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-excel-light" /> Grafici Pronti
                                    </h4>
                                    <p className="text-sm text-gray-500">Dashboard visive con grafici automatici per i tuoi dati.</p>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="templates"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        >
                            {templates.map((t) => (
                                <div
                                    key={t.id}
                                    onClick={() => handleTemplateClick(t)}
                                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-excel-light hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="bg-gray-50 p-3 rounded-xl w-fit mb-4 group-hover:bg-green-50 transition-colors text-gray-600 group-hover:text-excel-light">
                                        {t.icon}
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1">{t.title}</h3>
                                    <p className="text-sm text-gray-500">{t.desc}</p>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <footer className="p-6 text-center text-gray-400 text-xs font-medium">
                © 2024 Excellere AI • Powered by RTH Synapse Protocol
            </footer>
        </div>
    );
};

export default ExcellereApp;
