"use client";
import { useState, useEffect } from "react";
import { Send, AlertCircle, CheckCircle2, Loader2, Zap, Calendar, Clock, Image as ImageIcon, XCircle, Users, Lock, Globe, Radio, Trash2, Repeat, Edit2, Info, Link, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/context/ToastContext";
import { db } from "@/lib/firebaseClient";
import { addDoc, collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from "firebase/firestore";

export default function BroadcastPage() {
    const { showToast } = useToast() || { showToast: () => { } };

    // --- STATE: EDITOR ---
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState("idle");
    const [result, setResult] = useState(null);
    const [broadcastImage, setBroadcastImage] = useState("");
    const [targetScope, setTargetScope] = useState("global"); // global, private, group

    // --- STATE: BUTTONS ---
    const [buttons, setButtons] = useState([]); // Array of { label, url }
    const [btnLabel, setBtnLabel] = useState("");
    const [btnUrl, setBtnUrl] = useState("");
    const [showBtnInput, setShowBtnInput] = useState(false);

    // --- STATE: SCHEDULING ---
    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduleDate, setScheduleDate] = useState("");
    const [scheduleTime, setScheduleTime] = useState("");
    const [repeatFreq, setRepeatFreq] = useState("once"); // once, daily, weekly

    // --- STATE: LOGS ---
    const [scheduledTasks, setScheduledTasks] = useState([]);

    // --- INIT ---
    useEffect(() => {
        const q = query(collection(db, "scheduled_tasks"), orderBy("created_at", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setScheduledTasks(tasks);
        });
        return () => unsubscribe();
    }, []);

    const processImage = (file) => {
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
                else { setBroadcastImage(CompressedBase64); }
            };
        };
    };

    const addButton = () => {
        if (!btnLabel || !btnUrl) return;
        if (buttons.length >= 5) { showToast("Max 5 buttons.", "error"); return; }
        setButtons([...buttons, { label: btnLabel, url: btnUrl }]);
        setBtnLabel(""); setBtnUrl(""); setShowBtnInput(false);
    };

    const removeButton = (idx) => {
        const newBtns = [...buttons];
        newBtns.splice(idx, 1);
        setButtons(newBtns);
    };

    const startEdit = (task) => {
        setEditingId(task.id);
        setMessage(task.message);
        setBroadcastImage(task.image || "");
        setTargetScope(task.scope || "global");
        setRepeatFreq(task.frequency || "once");
        setButtons(task.buttons || []);

        if (task.scheduled_at) {
            const date = task.scheduled_at.seconds ? new Date(task.scheduled_at.seconds * 1000) : new Date(task.scheduled_at);
            setScheduleDate(date.toISOString().split('T')[0]);
            setScheduleTime(date.toTimeString().split(' ')[0].substring(0, 5));
            setIsScheduled(true);
        }

        showToast("Loaded signal for editing.", "info");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setMessage("");
        setBroadcastImage("");
        setTargetScope("global");
        setButtons([]);
        setRepeatFreq("once");
        setScheduleDate("");
        setScheduleTime("");
        setIsScheduled(false);
    };

    const handleBroadcast = async () => {
        if (!message && !broadcastImage) return;
        setStatus("loading");

        try {
            const payload = {
                message,
                image: broadcastImage,
                scope: targetScope,
                buttons, // Added buttons to payload
                frequency: repeatFreq,
                scheduled_at: isScheduled ? new Date(`${scheduleDate}T${scheduleTime}`) : null,
                status: "pending",
                created_at: new Date()
            };

            if (isScheduled) {
                if (!scheduleDate || !scheduleTime) {
                    showToast("Date and Time required.", "error"); setStatus("idle"); return;
                }

                if (editingId) {
                    await updateDoc(doc(db, "scheduled_tasks", editingId), payload);
                    showToast("Signal Updated.", "success");
                } else {
                    await addDoc(collection(db, "scheduled_tasks"), payload);
                    showToast("Signal Scheduled.", "success");
                }
                setStatus("success"); setResult("Scheduled");
                cancelEdit();

            } else {
                // IMMEDIATE
                if (editingId && confirm("Send immediately & remove schedule?")) {
                    await deleteDoc(doc(db, "scheduled_tasks", editingId));
                }

                const res = await fetch("/api/broadcast", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        text: message,
                        image: broadcastImage,
                        scope: targetScope,
                        buttons, // Pass buttons to API
                        password: "admin123"
                    }),
                });

                const data = await res.json();
                if (res.ok) {
                    setStatus("success"); setResult(data.count);
                    cancelEdit();
                    showToast(`Signal Transmitted. Targets: ${data.count}`, "success");
                } else {
                    setStatus("error"); setResult(data.error);
                }
            }
        } catch (error) {
            setStatus("error"); setResult("Network Failure");
        }
    };

    const deleteTask = async (id) => {
        if (!confirm("Delete signal?")) return;
        try { await deleteDoc(doc(db, "scheduled_tasks", id)); showToast("Signal Deleted.", "info"); }
        catch (e) { showToast("Error deleting.", "error"); }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "Pending";
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="max-w-7xl mx-auto pb-40 space-y-12">

            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <Radio className="w-8 h-8 text-indigo-500" />
                        Global Signal Broadcast
                    </h1>
                    <p className="text-gray-400 text-sm">Mass communication array for active leads.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* TRANSMISSION DECK (LEFT) */}
                <div className="lg:col-span-2">
                    <div className={`bg-[#111] border rounded-3xl p-1 shadow-2xl relative overflow-hidden group transition-colors ${editingId ? 'border-indigo-500/50' : 'border-white/5'}`}>
                        <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-3xl -z-10" />

                        <div className="bg-[#0a0a0a] rounded-[1.4rem] p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                        {editingId ? <Edit2 className="w-5 h-5 text-white" /> : <Send className="w-5 h-5 text-white" />}
                                    </div>
                                    <h2 className="text-lg font-bold text-white">
                                        {editingId ? 'Editing Signal' : 'Transmission Deck'}
                                    </h2>
                                </div>
                                {editingId && (
                                    <button onClick={cancelEdit} className="text-xs font-bold text-rose-500 uppercase tracking-widest hover:text-rose-400">
                                        Cancel Edit
                                    </button>
                                )}
                            </div>

                            {/* MESSAGE INPUT */}
                            <div className="mb-6 relative">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Enter signal payload (HTML supported)..."
                                    className="w-full h-40 bg-[#151515] border border-white/5 rounded-2xl pl-4 p-4 text-sm text-gray-300 focus:border-indigo-500 focus:text-white outline-none resize-none transition-colors"
                                />
                            </div>

                            {/* BUTTON MANAGER */}
                            <div className="mb-8">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center justify-between">
                                    <span>Interactive Elements (Buttons)</span>
                                    <span className="text-xs bg-white/5 px-2 py-0.5 rounded text-gray-400">{buttons.length}/5</span>
                                </label>

                                <div className="space-y-3">
                                    {buttons.map((btn, idx) => (
                                        <div key={idx} className="flex items-center gap-3 bg-[#151515] p-2 rounded-xl border border-white/5 group hover:border-white/10 transition-colors">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-xs">{idx + 1}</div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-white">{btn.label}</p>
                                                <p className="text-[10px] text-gray-500 truncate">{btn.url}</p>
                                            </div>
                                            <button onClick={() => removeButton(idx)} className="p-2 text-gray-600 hover:text-rose-500"><XCircle className="w-4 h-4" /></button>
                                        </div>
                                    ))}

                                    {showBtnInput ? (
                                        <div className="bg-[#151515] p-4 rounded-xl border border-indigo-500/30 animate-in fade-in zoom-in-95">
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <input value={btnLabel} onChange={e => setBtnLabel(e.target.value)} placeholder="Label (e.g. Join Now)" className="bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" />
                                                <input value={btnUrl} onChange={e => setBtnUrl(e.target.value)} placeholder="URL (https://...)" className="bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={addButton} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-xs font-bold uppercase tracking-wider">Add Button</button>
                                                <button onClick={() => setShowBtnInput(false)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-white">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button onClick={() => setShowBtnInput(true)} className="w-full py-3 rounded-xl border border-dashed border-white/10 text-gray-500 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                            <Plus className="w-4 h-4" /> Add Inline Button
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* CONTROLS GRID */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* ATTACHMENT */}
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Visual Payload</label>
                                    <div className="h-14 bg-[#151515] border border-white/5 rounded-xl flex items-center px-4 overflow-hidden relative">
                                        {broadcastImage ? (
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center gap-3">
                                                    <img src={broadcastImage} className="w-8 h-8 rounded object-cover border border-white/10" />
                                                    <span className="text-xs text-emerald-500 font-bold">Attached</span>
                                                </div>
                                                <button onClick={() => setBroadcastImage("")} className="text-rose-500"><XCircle className="w-4 h-4" /></button>
                                            </div>
                                        ) : (
                                            <label className="flex items-center gap-3 w-full h-full cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                                                <ImageIcon className="w-4 h-4 text-gray-400" />
                                                <span className="text-xs text-gray-400">Upload Image / Banner</span>
                                                <input type="file" accept="image/*" onChange={(e) => processImage(e.target.files[0])} className="hidden" />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* SCOPE */}
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">Target Scope</label>
                                    <div className="flex bg-[#151515] rounded-xl p-1 border border-white/5">
                                        {['global', 'group', 'private'].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setTargetScope(s)}
                                                className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2 ${targetScope === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-500 hover:text-white'}`}
                                            >
                                                {s === 'global' && <Globe className="w-3 h-3" />}
                                                {s === 'group' && <Users className="w-3 h-3" />}
                                                {s === 'private' && <Lock className="w-3 h-3" />}
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* SCHEDULER */}
                            <div className={`mb-8 transition-all overflow-hidden ${isScheduled ? 'max-h-96 opacity-100' : 'max-h-0 opacity-50'}`}>
                                <div className="bg-[#151515] p-6 rounded-2xl border border-white/5">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Date</label>
                                            <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Time</label>
                                            <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Frequency</label>
                                            <select value={repeatFreq} onChange={e => setRepeatFreq(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-500 outline-none appearance-none">
                                                <option value="once">One-Time</option>
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-start gap-3 bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-xl">
                                        <Info className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                                        <div className="text-[10px] text-gray-400 leading-relaxed">
                                            <p className="mb-1 text-indigo-300 font-bold uppercase tracking-wider">How it works</p>
                                            <p>
                                                {repeatFreq === 'once' && 'The signal will be transmitted exactly once on the specified date and time.'}
                                                {repeatFreq === 'daily' && 'The first signal sends on the specified date/time, then repeats every 24 hours indefinitely.'}
                                                {repeatFreq === 'weekly' && 'The first signal sends on the specified date/time, then repeats every 7 days indefinitely.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsScheduled(!isScheduled)}
                                    className={`h-14 px-6 rounded-2xl border border-white/10 flex items-center gap-2 font-bold text-xs uppercase tracking-wider transition-all ${isScheduled ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'bg-[#151515] text-gray-500 hover:bg-[#222]'}`}
                                >
                                    <Calendar className="w-4 h-4" />
                                    {isScheduled ? 'Scheduled' : 'Schedule'}
                                </button>

                                <button
                                    onClick={handleBroadcast}
                                    disabled={status === "loading" || !message}
                                    className={`h-14 flex-1 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3
                                        ${editingId ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-amber-600/20' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/20'}
                                    `}
                                >
                                    {status === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                                    {editingId ? 'Update Signal' : (isScheduled ? 'Confirm Sequence' : 'Transmit Signal')}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                {/* SIGNAL LOG (RIGHT) */}
                <div className="lg:col-span-1 border-l border-white/5 lg:pl-8 space-y-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Signal Log
                    </h3>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {scheduledTasks.length === 0 && (
                            <div className="text-center py-10 text-gray-600 text-xs italic">No scheduled signals.</div>
                        )}

                        {scheduledTasks.map(task => (
                            <div key={task.id} className={`bg-[#111] border rounded-2xl p-4 transition-all group relative overflow-hidden ${editingId === task.id ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/5 hover:border-white/10'}`}>
                                {task.image && (
                                    <div className="absolute top-0 right-0 w-20 h-full opacity-10 pointer-events-none">
                                        <img src={task.image} className="w-full h-full object-cover mask-gradient" />
                                    </div>
                                )}

                                <div className="flex items-start justify-between mb-2 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${task.status === 'completed' ? 'border-emerald-500/30 text-emerald-500' : 'border-indigo-500/30 text-indigo-400'}`}>
                                            {task.status}
                                        </span>
                                        {task.frequency !== 'once' && (
                                            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase border border-purple-500/30 text-purple-400 flex items-center gap-1">
                                                <Repeat className="w-2.5 h-2.5" /> {task.frequency}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => startEdit(task)} className="p-1 text-gray-600 hover:text-amber-500 transition-colors bg-white/5 rounded-lg hover:bg-white/10"><Edit2 className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => deleteTask(task.id)} className="p-1 text-gray-600 hover:text-rose-500 transition-colors bg-white/5 rounded-lg hover:bg-white/10"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>

                                <p className="text-gray-400 text-xs line-clamp-2 mb-3 font-medium relative z-10">{task.message}</p>

                                <div className="flex items-center gap-3 text-[10px] text-gray-600 relative z-10">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(task.scheduled_at)}</span>
                                    <span className="w-1 h-1 bg-gray-700 rounded-full" />
                                    <span className="flex items-center gap-1 uppercase">{task.scope}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
