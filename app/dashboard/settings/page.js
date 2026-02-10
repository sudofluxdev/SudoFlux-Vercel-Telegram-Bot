"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, ShieldAlert, Database, Cloud, Radio, Link as LinkIcon, CheckCircle, Loader2, Trash2, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebaseClient";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/context/ToastContext";

export default function SettingsPage() {
    const { user } = useAuth();
    const { showToast } = useToast();

    // Webhook Manager State
    const [botToken, setBotToken] = useState("");
    const [webhookStatus, setWebhookStatus] = useState(null); // 'loading', 'success', 'error'
    const [webhookInfo, setWebhookInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const savedToken = localStorage.getItem("botToken");
        if (savedToken) setBotToken(savedToken);
    }, []);

    const handleTokenChange = (e) => {
        const newToken = e.target.value;
        setBotToken(newToken);
        localStorage.setItem("botToken", newToken);
    };

    const checkWebhook = async () => {
        if (!botToken) return showToast("Target Token required.", "error");
        setLoading(true);
        setWebhookStatus('loading');
        try {
            const res = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
            const data = await res.json();

            if (data.ok) {
                setWebhookInfo(data.result);
                setWebhookStatus('success');
                showToast("Connection diagnostic complete.", "info");
            } else {
                throw new Error(data.description);
            }
        } catch (err) {
            setWebhookStatus('error');
            showToast(`Diagnostic Failure: ${err.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    const setWebhook = async () => {
        if (!botToken) return showToast("Target Token required.", "error");
        setLoading(true);
        try {
            // 1. Save Token to Cloud Matrix
            await setDoc(doc(db, "settings", "bot_config"), {
                telegram_token: botToken,
                updated_at: new Date()
            }, { merge: true });

            // 2. Point Webhook
            const currentUrl = window.location.origin;
            const webhookUrl = `${currentUrl}/api/webhook`;
            const SECRET = "SUDO_FLUX_SECURE_TOKEN_2026";

            const allowedUpdates = ["message", "callback_query", "my_chat_member"];
            const res = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookUrl}&secret_token=${SECRET}&allowed_updates=${JSON.stringify(allowedUpdates)}`);
            const data = await res.json();

            if (data.ok) {
                showToast("Hyper-Core Webhook successfully synchronized.", "success");
                checkWebhook();
            } else {
                showToast(`Telegram Rejection: ${data.description}`, "error");
            }
        } catch (err) {
            showToast(`Sync Error: ${err.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    const deleteWebhook = async () => {
        if (!botToken) return showToast("No token detected.", "error");
        if (!confirm("Are you sure you want to terminate the bot connection?")) return;
        setLoading(true);
        try {
            const res = await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`);
            const data = await res.json();
            if (data.ok) {
                showToast("Connection severed. Webhook destroyed.", "info");
                checkWebhook();
            } else {
                showToast(`Termination failed: ${data.description}`, "error");
            }
        } catch (err) {
            showToast(`Error: ${err.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 tracking-tighter">
                        Nexus Configuration
                    </h1>
                    <p className="text-gray-400 mt-2 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em]">
                        <Settings className="w-3 h-3 text-cyan-500" />
                        GLOBAL SYSTEM CALIBRATION
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* --- TELEGRAM LINK --- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-[#070707] border border-cyan-500/20 p-10 rounded-[3rem] relative overflow-hidden lg:col-span-2 shadow-2xl"
                >
                    <div className="absolute top-0 right-0 p-32 bg-cyan-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="flex items-center gap-4 mb-10 relative z-10">
                        <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
                            <Radio className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">Telegram Neural Link</h3>
                            <p className="text-xs text-gray-500 font-medium">Synchronize your bot instance with the SudoFlux Core.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] block mb-3 ml-1">Secure Authorization Token</label>
                                <input
                                    type="password"
                                    value={botToken}
                                    onChange={handleTokenChange}
                                    placeholder="123456:ABC-def..."
                                    className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 text-white focus:border-cyan-500 focus:outline-none transition-all shadow-inner font-mono text-sm"
                                />
                                <div className="flex items-center gap-2 mt-2 ml-1">
                                    <div className="w-1 h-1 rounded-full bg-gray-700" />
                                    <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest">Retrieved from @BotFather</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={checkWebhook}
                                    disabled={loading}
                                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold text-xs transition-all border border-white/5 active:scale-95"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-cyan-500" /> : "DIAGNOSTIC"}
                                </button>
                                <button
                                    onClick={setWebhook}
                                    disabled={loading}
                                    className="flex-1 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:scale-[1.02] text-white rounded-2xl font-bold text-xs transition-all shadow-xl shadow-cyan-600/20 flex items-center justify-center gap-3 active:scale-95"
                                >
                                    <LinkIcon className="w-4 h-4" />
                                    SYNC CORE
                                </button>
                            </div>

                            <div className="pt-6 space-y-3">
                                <button
                                    onClick={async () => {
                                        if (!botToken) return showToast("No token provided.", "error");
                                        const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
                                        const data = await res.json();
                                        if (data.ok) showToast(`Identity Confirmed: @${data.result.username}`, "success");
                                        else showToast(`Identity Theft Detected: Invalid Token`, "error");
                                    }}
                                    className="w-full py-3 bg-white/[0.02] hover:bg-white/[0.05] text-gray-400 hover:text-white rounded-2xl font-bold text-[10px] transition-all border border-white/5 flex items-center justify-center gap-2 uppercase tracking-widest"
                                >
                                    <Zap className="w-3 h-3 text-cyan-500" />
                                    Verify Hash Integrity
                                </button>

                                <button
                                    onClick={deleteWebhook}
                                    disabled={loading}
                                    className="w-full py-3 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500/60 hover:text-rose-500 rounded-2xl font-bold text-[10px] transition-all border border-rose-500/10 flex items-center justify-center gap-2 uppercase tracking-widest"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Destroy Webhook
                                </button>
                            </div>
                        </div>

                        {/* Status Display */}
                        <div className="bg-black border border-white/5 rounded-3xl p-8 flex flex-col justify-center min-h-[300px] shadow-inner relative">
                            {!webhookStatus && (
                                <div className="text-center text-gray-700 text-xs font-mono tracking-tighter">
                                    AWAITING INPUT...<br />PLEASE PROVIDE KEY FOR SYSTEM SYNC.
                                </div>
                            )}

                            {webhookStatus === 'loading' && (
                                <div className="text-center text-gray-600 text-xs flex flex-col items-center gap-4 font-mono tracking-widest animate-pulse">
                                    <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                                    ESTABLISHING NEURAL LINK...
                                </div>
                            )}

                            {webhookStatus === 'success' && webhookInfo && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 text-emerald-500 text-xs font-black uppercase tracking-[0.3em]">
                                        <CheckCircle className="w-4 h-4 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        NODE STATUS: ONLINE
                                    </div>
                                    <div className="space-y-4 font-mono text-[10px]">
                                        <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 space-y-3">
                                            <p className="text-gray-600 uppercase font-black">Link Endpoint</p>
                                            <p className="text-gray-400 break-all leading-relaxed">{webhookInfo.url || "[CLOSED]"}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                                <p className="text-gray-600 uppercase font-black mb-1">Queue Size</p>
                                                <p className="text-white text-lg font-black">{webhookInfo.pending_update_count}</p>
                                            </div>
                                            <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                                <p className="text-gray-600 uppercase font-black mb-1">Encryption</p>
                                                <p className="text-emerald-500 text-lg font-black tracking-tighter">ACTIVE</p>
                                            </div>
                                        </div>

                                        {webhookInfo.last_error_message && (
                                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                                                <p className="text-rose-400 font-black uppercase text-[9px] mb-1">System Corruption:</p>
                                                <p className="text-rose-300 text-[10px] leading-tight">{webhookInfo.last_error_message}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {webhookStatus === 'error' && (
                                <div className="text-center text-rose-500 text-xs flex flex-col items-center gap-4 font-black uppercase tracking-widest">
                                    <ShieldAlert className="w-10 h-10 animate-vertical-bounce" />
                                    CONNECTION BREACHED<br />INTERNAL TOKEN ERROR
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Security and DB */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#070707] border border-white/5 p-10 rounded-[3rem] shadow-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                                <ShieldAlert className="w-6 h-6 text-rose-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Security Protocol</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                                <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-2">Authenticated Entity</p>
                                <p className="font-bold text-white font-mono text-sm">{user?.email}</p>
                            </div>
                            <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/10 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-emerald-500 tracking-widest uppercase">SUPERIOR CLEARANCE</p>
                                    <p className="text-[10px] text-emerald-400/50 font-mono italic">Access Level: OVERLORD</p>
                                </div>
                                <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#070707] border border-white/5 p-10 rounded-[3rem] shadow-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                <Database className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Cloud Matrix Status</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <Cloud className="w-6 h-6 text-cyan-500/50" />
                                    <div>
                                        <p className="text-sm font-bold text-white">Google Firestore</p>
                                        <p className="text-[10px] text-gray-600 font-mono">us-central1.v1</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-lg border border-emerald-500/20 tracking-tighter">ONLINE</span>
                            </div>
                            <button className="w-full py-4 text-gray-500 hover:text-white border border-dashed border-white/10 hover:border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                                Global integrity check
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
