"use client";
import { useState, useEffect } from "react";
import {
    Radio,
    Zap,
    MessageSquare,
    Smartphone,
    ShieldCheck,
    ExternalLink,
    RefreshCw,
    Globe,
    Lock,
    QrCode,
    CheckCircle2,
    Clock,
    UserCheck,
    AlertCircle,
    Info,
    ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/context/ToastContext";
import { db } from "@/lib/firebaseClient";
import { doc, onSnapshot } from "firebase/firestore";

/**
 * BotFlux V1.5 - Channel Management Hub
 * 🛰️ [PT] Painel de Controle de Transmissão (Telegram)
 * 🛰️ [EN] Transmission Control Panel (Telegram)
 */
export default function ChannelsPage() {
    const { showToast } = useToast() || { showToast: () => { } };
    const [isRefreshing, setIsRefreshing] = useState(false);

    // [PT] Estados para monitoramento de conexão em tempo real
    // [EN] States for real-time connection monitoring
    const [tgStatus, setTgStatus] = useState("online"); // online, offline
    const [wpStatus, setWpStatus] = useState("disconnected"); // disconnected, connecting, online
    const [botSettings, setBotSettings] = useState(null);

    useEffect(() => {
        if (!db) return;
        /**
         * [PT] Listener em tempo real para configurações do bot no Firestore
         * [EN] Real-time listener for bot settings in Firestore
         */
        const unsub = onSnapshot(doc(db, "settings", "bot"), (docSnap) => {
            if (docSnap.exists()) setBotSettings(docSnap.data());
        });
        return () => unsub();
    }, []);

    // [PT] Simulação de sincronização de rede
    // [EN] Network synchronization simulation
    const refreshSystems = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
            showToast("Neural Link re-established.", "success");
        }, 1500);
    };

    return (
        <div className="max-w-7xl mx-auto pb-40 space-y-12">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500 tracking-tighter">
                        Platform Hub
                    </h1>
                    <p className="text-gray-500 mt-2 font-mono text-xs uppercase tracking-[0.3em] flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
                        Neural Matrix : [ACTIVE]
                    </p>
                </div>
                <button
                    onClick={refreshSystems}
                    disabled={isRefreshing}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 group"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Sync All Channels
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* TELEGRAM CARD */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group relative bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 overflow-hidden shadow-2xl"
                >
                    <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/10 transition-all" />

                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
                                <Radio className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight">Telegram OS</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] text-emerald-500 font-mono font-bold uppercase tracking-widest">Signal Verified</span>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[10px] font-mono text-blue-400 font-bold uppercase">
                            v2.5 STABLE
                        </div>
                    </div>

                    <div className="space-y-6 mb-10">
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Node</span>
                                <span className="text-[10px] text-gray-600 font-mono">ID: 8829...</span>
                            </div>
                            <p className="text-sm font-bold text-white mb-1">@{botSettings?.bot_username || "BotSudo_Bot"}</p>
                            <p className="text-[10px] text-gray-500 font-medium">Automatic handler for Group and Private sessions.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                <p className="text-[9px] font-bold text-gray-600 uppercase mb-2 tracking-widest">Message Speed</p>
                                <p className="text-lg font-black text-white">0.4s <span className="text-[10px] text-emerald-400">FAST</span></p>
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                <p className="text-[9px] font-bold text-gray-600 uppercase mb-2 tracking-widest">Uptime</p>
                                <p className="text-lg font-black text-white">99.9%</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="flex-1 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                            Node Settings
                            <ArrowUpRight className="w-4 h-4" />
                        </button>
                        <button className="w-14 h-14 bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 rounded-2xl flex items-center justify-center transition-all">
                            <Lock className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* CHANNEL STATS OVERVIEW */}
            <div className="bg-[#070707] border border-white/[0.03] rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-violet-500/10 rounded-2xl border border-violet-500/20">
                        <Globe className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">Global Connectivity Metrics</h3>
                        <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">Cross-platform synchronization status</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { label: "Total Synced Leads", value: "1.2k", icon: UserCheck, color: "blue" },
                        { label: "Neural Response Rate", value: "98.4%", icon: Zap, color: "emerald" },
                        { label: "Daily Transmissions", value: "4.5k", icon: MessageSquare, color: "violet" },
                    ].map((m, i) => (
                        <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                            <div className="flex items-center gap-3 mb-3 text-gray-600">
                                <m.icon className="w-4 h-4" />
                                <span className="text-[9px] font-bold uppercase tracking-widest">{m.label}</span>
                            </div>
                            <p className={`text-2xl font-black text-${m.color}-400`}>{m.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
