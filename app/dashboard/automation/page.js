"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Plus, Trash2, MessageSquare, Zap, Bot, Send, RefreshCw, Link as LinkIcon, ExternalLink, Command, Image as ImageIcon, Info, UploadCloud, XCircle, Clock, Edit2, LayoutGrid, MoreVertical, ShieldCheck, Shield } from "lucide-react";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { useToast } from "@/context/ToastContext";

export default function BotCommandsPage() {
    const { showToast } = useToast() || { showToast: () => { } };
    const [loading, setLoading] = useState(true);

    // --- GLOBAL SETTINGS (/start) ---
    const [welcomeMsg, setWelcomeMsg] = useState("");
    const [welcomeImage, setWelcomeImage] = useState("");
    const [welcomeButtons, setWelcomeButtons] = useState([]);
    const [defaultReply, setDefaultReply] = useState("");

    // --- AUTOMATIONS ---
    const [automations, setAutomations] = useState([]);

    // --- MODAL STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null); // null = creating new

    // --- FORM STATE (For Modal) ---
    const [formTrigger, setFormTrigger] = useState("");
    const [formResponse, setFormResponse] = useState("");
    const [formImage, setFormImage] = useState("");
    const [formScope, setFormScope] = useState("global");
    const [formCooldown, setFormCooldown] = useState(0);
    const [formButtons, setFormButtons] = useState([]);
    const [formStrictSlash, setFormStrictSlash] = useState(true);

    // --- BTN BUILDER STATE (Inside Modal & Main Hub) ---
    const [btnLabel, setBtnLabel] = useState("");
    const [btnType, setBtnType] = useState("url");
    const [btnValue, setBtnValue] = useState("");

    // --- WAKE UP ---
    const wakeUpBot = async () => {
        try { await fetch("/api/cron"); } catch (e) { }
    };

    // --- INIT ---
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                // Load Automations
                const autoSnapshot = await getDocs(collection(db, "automation"));
                const autos = autoSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAutomations(autos);

                // Load Global Config
                const settingsDoc = await getDoc(doc(db, "settings", "bot_config"));
                if (settingsDoc.exists()) {
                    const data = settingsDoc.data();
                    setWelcomeMsg(data.welcome_message || "");
                    setWelcomeImage(data.welcome_image || ""); // NEW
                    setWelcomeButtons(data.welcome_buttons || []);
                    setDefaultReply(data.default_reply || "");
                }
            } catch (error) {
                showToast("Failed to load neural configuration.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    // --- GENERIC IMAGE UPLOADER ---
    const processImage = (file, callback) => {
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { showToast("File too large. Max 5MB.", "error"); return; }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const MAX_WIDTH = 800; const MAX_HEIGHT = 800;
                let width = img.width; let height = img.height;
                if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } }
                else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
                canvas.width = width; canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                const CompressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                if (CompressedBase64.length > 900000) showToast("Image too complex.", "error");
                else callback(CompressedBase64);
            };
        };
    };

    // --- ACTIONS: MAIN HUB ---
    const saveMainHub = async () => {
        try {
            await setDoc(doc(db, "settings", "bot_config"), {
                welcome_message: welcomeMsg,
                welcome_image: welcomeImage,
                welcome_buttons: welcomeButtons,
                default_reply: defaultReply,
                updated_at: new Date()
            }, { merge: true });
            showToast("Main Hub Updated!", "success");
            wakeUpBot();
        } catch (err) { showToast("Save failed.", "error"); }
    };

    const addWelcomeButton = () => {
        if (!btnLabel || !btnValue) return;
        setWelcomeButtons([...welcomeButtons, { label: btnLabel, type: btnType, value: btnValue }]);
        setBtnLabel(""); setBtnValue("");
    };

    // --- ACTIONS: COMMANDS ---
    const openModal = (cmd = null) => {
        if (cmd) {
            setEditingId(cmd.id);
            setFormTrigger(cmd.trigger);
            setFormResponse(cmd.response);
            setFormImage(cmd.image_url || "");
            setFormScope(cmd.scope || "global");
            setFormCooldown(cmd.cooldown || 0);
            setFormButtons(cmd.buttons || []);
            setFormStrictSlash(cmd.strict_slash !== undefined ? cmd.strict_slash : true);
        } else {
            setEditingId(null);
            setFormTrigger(""); setFormResponse(""); setFormImage(""); setFormScope("global"); setFormCooldown(0); setFormButtons([]); setFormStrictSlash(true);
        }
        setIsModalOpen(true);
    };

    const saveCommand = async () => {
        if (!formTrigger || !formResponse) { showToast("Trigger and Response required.", "error"); return; }

        let finalTrigger = formTrigger.toLowerCase().trim();
        // If strict slash, ensure it starts with / only if the user didn't write it
        // and it's not a callback click which might not have slashes. 
        // Logic will be handled in findAutomation anyway based on the full string.

        const payload = {
            trigger: finalTrigger,
            response: formResponse,
            image_url: formImage,
            buttons: formButtons,
            scope: formScope,
            cooldown: Number(formCooldown),
            strict_slash: formStrictSlash,
            active: true,
            updated_at: new Date()
        };

        try {
            if (editingId) {
                // UPDATE
                await updateDoc(doc(db, "automation", editingId), payload);
                setAutomations(prev => prev.map(a => a.id === editingId ? { ...a, ...payload } : a));
                showToast("Command Updated.", "success");
            } else {
                // CREATE
                const docRef = await addDoc(collection(db, "automation"), { ...payload, created_at: new Date() });
                setAutomations(prev => [...prev, { id: docRef.id, ...payload }]);
                showToast("Command Created.", "success");
            }
            setIsModalOpen(false);
            wakeUpBot();
        } catch (err) { showToast("Operation failed.", "error"); }
    };

    const deleteCommand = async (id) => {
        if (!confirm("Delete this command?")) return;
        try {
            await deleteDoc(doc(db, "automation", id));
            setAutomations(prev => prev.filter(a => a.id !== id));
            showToast("Command Deleted.", "info");
            wakeUpBot();
        } catch (err) { showToast("Deletion failed.", "error"); }
    };

    const addFormButton = () => {
        if (!btnLabel || !btnValue) return;
        setFormButtons([...formButtons, { label: btnLabel, type: btnType, value: btnValue }]);
        setBtnLabel(""); setBtnValue("");
    };

    if (loading) return <div className="p-10 text-center text-gray-500 font-mono animate-pulse">LOADING BOT MATRIX...</div>;

    return (
        <div className="max-w-7xl mx-auto pb-40">
            {/* HEADER */}
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <Bot className="w-8 h-8 text-cyan-500" />
                        Bot Commands
                    </h1>
                    <p className="text-gray-400 text-sm">Design the behavior and intelligence of your bot.</p>
                </div>
                <button onClick={() => openModal()} className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-full p-4 shadow-lg shadow-cyan-500/30 transition-all hover:scale-110 active:scale-95">
                    <Plus className="w-6 h-6" />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-3 space-y-8">

                    {/* MAIN HUB CARD */}
                    <div className="bg-[#111] border border-white/5 rounded-3xl p-1 shadow-2xl relative overflow-hidden ring-1 ring-white/5 group">
                        <div className="absolute top-0 right-0 p-32 bg-cyan-500/5 rounded-full blur-3xl -z-10" />

                        <div className="bg-[#0a0a0a] rounded-[1.4rem] p-6 sm:p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                        <Command className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Main Hub</h2>
                                        <p className="text-xs text-cyan-400 font-mono">/start TRIGGER</p>
                                    </div>
                                </div>
                                <button onClick={saveMainHub} className="bg-white/5 hover:bg-emerald-500/20 text-emerald-500 hover:text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-emerald-500/20 flex items-center gap-2">
                                    <Save className="w-4 h-4" /> SAVE HUB
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Welcome Image</label>
                                    <div className="relative group/img">
                                        {welcomeImage ? (
                                            <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video bg-black/50">
                                                <img src={welcomeImage} className="w-full h-full object-cover" />
                                                <button onClick={() => setWelcomeImage("")} className="absolute top-2 right-2 p-2 bg-black/60 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"><XCircle className="w-5 h-5" /></button>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-white/10 rounded-2xl hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all cursor-pointer group/upload">
                                                <ImageIcon className="w-8 h-8 text-gray-600 group-hover/upload:text-cyan-500 mb-2 transition-colors" />
                                                <span className="text-xs text-gray-500 group-hover/upload:text-cyan-400 font-bold uppercase">Upload Cover</span>
                                                <input type="file" accept="image/*" onChange={(e) => processImage(e.target.files[0], setWelcomeImage)} className="hidden" />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Welcome Message</label>
                                        <textarea
                                            value={welcomeMsg}
                                            onChange={e => setWelcomeMsg(e.target.value)}
                                            className="w-full h-32 bg-[#151515] border border-white/5 rounded-2xl p-4 text-sm text-gray-300 focus:border-cyan-500 focus:text-white outline-none resize-none transition-colors"
                                            placeholder="Write your welcome message here..."
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Hub Buttons</label>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {welcomeButtons.map((btn, i) => (
                                                <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 flex items-center gap-2">
                                                    {btn.label}
                                                    <button onClick={() => setWelcomeButtons(prev => prev.filter((_, idx) => idx !== i))} className="text-rose-500 hover:text-white"><XCircle className="w-3 h-3" /></button>
                                                </span>
                                            ))}
                                            <button onClick={() => document.getElementById('hub-btn-adder').classList.toggle('hidden')} className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-lg text-xs font-bold hover:bg-cyan-500/20">+ Add</button>
                                        </div>

                                        <div id="hub-btn-adder" className="hidden p-3 bg-white/5 rounded-xl border border-white/5 grid grid-cols-3 gap-2">
                                            <input value={btnLabel} onChange={e => setBtnLabel(e.target.value)} placeholder="Label" className="bg-[#000] border border-white/10 rounded-lg px-2 py-1 text-xs" />
                                            <input value={btnValue} onChange={e => setBtnValue(e.target.value)} placeholder="Value/Url" className="bg-[#000] border border-white/10 rounded-lg px-2 py-1 text-xs" />
                                            <button onClick={addWelcomeButton} className="bg-cyan-600 rounded-lg text-xs font-bold text-white">Add</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* COMMANDS GRID */}
                    <div>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            Command Protocols
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            <button onClick={() => openModal()} className="group h-full min-h-[180px] bg-[#111] hover:bg-[#161616] border border-dashed border-white/10 hover:border-cyan-500/50 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all">
                                <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-cyan-500/10 flex items-center justify-center transition-colors">
                                    <Plus className="w-6 h-6 text-gray-600 group-hover:text-cyan-500" />
                                </div>
                                <span className="text-sm font-bold text-gray-600 group-hover:text-cyan-500">New Command</span>
                            </button>

                            {automations.map(auto => (
                                <motion.div layoutId={auto.id} key={auto.id} className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all group relative">
                                    {auto.image_url ? (
                                        <div className="h-24 w-full bg-gray-900 relative">
                                            <img src={auto.image_url} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent" />
                                        </div>
                                    ) : (
                                        <div className="h-24 w-full bg-gradient-to-br from-gray-900 to-black relative">
                                            <Bot className="absolute bottom-2 right-2 w-12 h-12 text-white/5 -rotate-12" />
                                        </div>
                                    )}

                                    <div className="p-4 relative">
                                        <div className="absolute -top-6 left-4 bg-[#222] border border-white/10 px-3 py-1 rounded-lg shadow-xl flex items-center gap-2">
                                            <span className="text-cyan-400 font-mono font-bold text-xs tracking-wider">{auto.trigger}</span>
                                            {auto.strict_slash && <ShieldCheck className="w-3 h-3 text-emerald-500" title="Strict Slash Mandatory" />}
                                        </div>

                                        <div className="mt-2 space-y-2">
                                            <p className="text-gray-400 text-xs line-clamp-2 min-h-[2.5em]">{auto.response}</p>

                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${auto.scope === 'private' ? 'border-indigo-500/30 text-indigo-400' : 'border-gray-600 text-gray-500'}`}>{auto.scope || 'Global'}</span>
                                                {auto.cooldown > 0 && <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase border border-orange-500/30 text-orange-400 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{auto.cooldown}s</span>}
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                            <button onClick={() => openModal(auto)} className="text-xs font-bold text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
                                                <Edit2 className="w-3 h-3" /> EDIT
                                            </button>
                                            <button onClick={() => deleteCommand(auto.id)} className="text-xs font-bold text-gray-600 hover:text-rose-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-[#111] border border-white/10 w-full max-w-2xl rounded-[2rem] shadow-2xl relative overflow-hidden z-10 max-h-[90vh] overflow-y-auto">

                            <div className="p-6 sm:p-8 border-b border-white/5 flex items-center justify-between bg-[#151515]">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    {editingId ? <Edit2 className="w-5 h-5 text-cyan-500" /> : <Plus className="w-5 h-5 text-cyan-500" />}
                                    {editingId ? "Edit Command" : "New Command"}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"><XCircle className="w-6 h-6 text-gray-400" /></button>
                            </div>

                            <div className="p-6 sm:p-8 space-y-6">
                                {/* TRIGGER & SCOPE */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Command Trigger</label>
                                        <div className="relative">
                                            <input value={formTrigger} onChange={e => setFormTrigger(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-cyan-400 font-mono focus:border-cyan-500 outline-none" placeholder="help or /help" />
                                        </div>
                                        <button
                                            onClick={() => setFormStrictSlash(!formStrictSlash)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${formStrictSlash ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-gray-500'}`}
                                        >
                                            {formStrictSlash ? <ShieldCheck className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                            <span className="text-[10px] font-bold uppercase tracking-wider">{formStrictSlash ? "Strict: Slash Mandatory" : "Flexible: Optional Slash"}</span>
                                        </button>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Scope</label>
                                        <select value={formScope} onChange={e => setFormScope(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none appearance-none">
                                            <option value="global">Global (All Chats)</option>
                                            <option value="private">Private DM Only</option>
                                            <option value="group">Groups Only</option>
                                        </select>
                                    </div>
                                </div>

                                {/* RESPONSE */}
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Response Text</label>
                                    <textarea value={formResponse} onChange={e => setFormResponse(e.target.value)} className="w-full h-32 bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-sm text-white focus:border-cyan-500 outline-none resize-none" placeholder="Bot will reply with..." />
                                </div>

                                {/* IMAGE & COOLDOWN */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Attachment</label>
                                        <div className="h-12 bg-[#0a0a0a] border border-white/10 rounded-xl flex items-center px-4 overflow-hidden relative">
                                            {formImage ? (
                                                <div className="flex items-center justify-between w-full">
                                                    <span className="text-xs text-emerald-500 font-bold flex items-center gap-2"><ImageIcon className="w-3 h-3" /> Attached</span>
                                                    <button onClick={() => setFormImage("")} className="text-rose-500"><XCircle className="w-4 h-4" /></button>
                                                </div>
                                            ) : (
                                                <label className="flex items-center gap-2 w-full h-full cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                                                    <UploadCloud className="w-4 h-4 text-gray-400" />
                                                    <span className="text-xs text-gray-400">Upload Image</span>
                                                    <input type="file" accept="image/*" onChange={(e) => processImage(e.target.files[0], setFormImage)} className="hidden" />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Cooldown (s)</label>
                                        <input type="number" min="0" value={formCooldown} onChange={e => setFormCooldown(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-orange-500 outline-none" />
                                    </div>
                                </div>

                                {/* BUTTONS */}
                                <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block flex items-center gap-2"><LinkIcon className="w-3 h-3" /> Buttons</label>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {formButtons.map((btn, i) => (
                                            <span key={i} className="px-3 py-1 bg-[#151515] border border-white/10 rounded-lg text-xs text-gray-400 flex items-center gap-2">
                                                {btn.label}
                                                <button onClick={() => setFormButtons(prev => prev.filter((_, idx) => idx !== i))} className="text-rose-500 hover:text-white"><XCircle className="w-3 h-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <input value={btnLabel} onChange={e => setBtnLabel(e.target.value)} placeholder="Label" className="bg-[#151515] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none" />
                                        <input value={btnValue} onChange={e => setBtnValue(e.target.value)} placeholder="Value/URL" className="bg-[#151515] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none" />
                                        <button onClick={addFormButton} className="bg-cyan-600 rounded-lg text-xs font-bold text-white hover:bg-cyan-500">Add</button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/5 bg-[#151515] flex justify-end gap-3">
                                <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-xs font-bold text-gray-500 hover:bg-white/5 transition-colors">CANCEL</button>
                                <button onClick={saveCommand} className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform">
                                    {editingId ? "SAVE CHANGES" : "CREATE COMMAND"}
                                </button>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
