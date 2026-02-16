"use client";
import { Users, UserCheck, MessageSquare, TrendingUp, Activity, ArrowUpRight, Zap, Globe, Database, RefreshCw, Send, Command } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { useToast } from "@/context/ToastContext";

export default function Dashboard() {
    const router = useRouter();
    const { showToast } = useToast() || { showToast: () => { } };
    const [leads, setLeads] = useState([]);
    const [realStats, setRealStats] = useState({ total_messages: 0 });
    const [stats, setStats] = useState([
        { name: "Total Leads", value: "0", icon: Users, change: "+0%", color: "cyan" },
        { name: "Active Users", value: "0", icon: UserCheck, change: "+0%", color: "blue" },
        { name: "Total Messages", value: "0", icon: MessageSquare, change: "+0%", color: "violet" },
        { name: "Conv. Rate", value: "0%", icon: TrendingUp, change: "+0%", color: "emerald" },
    ]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshEngine = async () => {
        setIsRefreshing(true);
        try {
            await fetch("/api/cron");
            showToast("Bot Engine successfully rebooted!", "success");
        } catch (e) {
            showToast("Neural sync failed.", "error");
        }
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    useEffect(() => {
        if (!db) return;

        // Listen to Leads
        const unsubLeads = onSnapshot(collection(db, "leads"), (snapshot) => {
            const leadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLeads(leadsData);

            const sortedLeads = leadsData.sort((a, b) => {
                const dateA = a.data_entrada?.toDate ? a.data_entrada.toDate() : new Date(a.data_entrada || 0);
                const dateB = b.data_entrada?.toDate ? b.data_entrada.toDate() : new Date(b.data_entrada || 0);
                return dateB - dateA;
            });

            const activity = sortedLeads.slice(0, 5).map(lead => ({
                id: lead.id,
                name: lead.first_name || lead.username || "Unknown User",
                action: "New Lead Captured",
                time: lead.data_entrada?.toDate ? lead.data_entrada.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just Now"
            }));
            setRecentActivity(activity);
        });

        // Listen to Counter Stats
        const unsubStats = onSnapshot(doc(db, "settings", "stats"), (docSnap) => {
            if (docSnap.exists()) {
                setRealStats(docSnap.data());
            }
        });

        return () => {
            unsubLeads();
            unsubStats();
        };
    }, []);

    // Update Stats UI when data changes
    useEffect(() => {
        const totalLeads = leads.length;
        const activeUsers = leads.filter(l => l.type === 'private').length;
        const messages = realStats.total_messages || 0;
        const convRate = totalLeads > 0 ? "100%" : "0%";

        setStats([
            { name: "Total Leads", value: totalLeads.toString(), icon: Users, change: "LIVE", color: "cyan" },
            { name: "Active Users", value: activeUsers.toString(), icon: UserCheck, change: "SYNC", color: "blue" },
            { name: "Total Messages", value: messages >= 1000 ? (messages / 1000).toFixed(1) + "k" : messages.toString(), icon: MessageSquare, change: "AUTO", color: "violet" },
            { name: "Conv. Rate", value: convRate, icon: TrendingUp, change: "MAX", color: "emerald" },
        ]);
    }, [leads, realStats]);

    return (
        <div className="space-y-10">
            {/* Header / Welcome */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500 tracking-tighter">
                        Command Overview
                    </h1>
                    <p className="text-gray-400 mt-2 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em]">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)] animate-pulse" />
                        Live Neural Link : [SECURE]
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-2xl">
                        <Database className="w-4 h-4 text-cyan-500" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Firestore Connected</span>
                    </div>
                    <button
                        onClick={refreshEngine}
                        disabled={isRefreshing}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Reboot Neural Node
                    </button>
                </div>
            </div>

            {/* QUICK ACTION HUB */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                    { title: "Blast Broadcast", desc: "Push transmission to all nodes", icon: Send, path: "/dashboard/broadcast", color: "blue" },
                    { title: "Edit Intelligence", icon: Command, desc: "Modify automation protocols", path: "/dashboard/automation", color: "cyan" },
                    { title: "Archive Leads", icon: Users, desc: "Analyze captured biologicals", path: "/dashboard/leads", color: "violet" },
                ].map((action, i) => (
                    <button
                        key={i}
                        onClick={() => router.push(action.path)}
                        className="group relative bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] text-left hover:border-white/10 transition-all overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 p-12 bg-${action.color}-500/5 rounded-full blur-3xl -z-10 group-hover:bg-${action.color}-500/10 transition-all`} />
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-2xl bg-${action.color}-500/10 border border-${action.color}-500/20 text-${action.color}-400 group-hover:scale-110 transition-transform`}>
                                <action.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white mb-1">{action.title}</h4>
                                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{action.desc}</p>
                            </div>
                            <ArrowUpRight className="ml-auto w-4 h-4 text-gray-700 group-hover:text-white transition-colors" />
                        </div>
                    </button>
                ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative bg-[#070707] border border-white/[0.03] p-8 rounded-[2rem] overflow-hidden hover:border-white/10 transition-all shadow-xl"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 text-${stat.color}-400`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                    <Zap className="w-3 h-3" />
                                    {stat.change}
                                </div>
                            </div>
                            <h3 className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-1">{stat.name}</h3>
                            <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-[#070707] border border-white/[0.03] rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                <Activity className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight">Neural Volume Flux</h3>
                                <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">Message frequency analytics</p>
                            </div>
                        </div>
                    </div>

                    {/* CSS Chart */}
                    <div className="flex items-end justify-between h-48 gap-2 mb-10 px-4 relative z-10">
                        {[40, 70, 45, 90, 65, 80, 50, 85, 95, 60, 75, 55].map((val, i) => (
                            <div key={i} className="flex-1 group relative flex flex-col items-center">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${val}%` }}
                                    transition={{ duration: 1.5, delay: i * 0.05, ease: "circOut" }}
                                    className={`w-full max-w-[12px] rounded-full bg-gradient-to-t ${i === 8 ? 'from-cyan-600 to-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'from-gray-800 to-gray-700'} group-hover:from-blue-500 group-hover:to-cyan-400 transition-all`}
                                />
                                <div className="absolute -top-6 h-4 px-2 bg-white/5 rounded text-[8px] font-mono text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {Math.floor(val * 1.5)} TX
                                </div>
                            </div>
                        ))}
                        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-white/5" />
                    </div>

                    <div className="space-y-8 relative z-10">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-4 mb-6">Recent Detection Stream</h4>
                        {recentActivity.length === 0 ? (
                            <div className="py-10 text-center text-gray-600 border-2 border-dashed border-white/5 rounded-[2rem]">
                                No active flux detected.
                            </div>
                        ) : (
                            recentActivity.map((activity, i) => (
                                <div key={i} className="group flex items-center gap-5 pb-6 border-b border-white/[0.03] last:border-0 last:pb-0">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <span className="text-xs font-black text-gray-500">{activity.name.charAt(0)}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                                                {activity.action} <span className="text-gray-600 font-medium">@{activity.name}</span>
                                            </p>
                                            <span className="text-[9px] text-gray-600 font-mono font-bold">{activity.time}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="absolute -top-10 -right-10 w-80 h-80 bg-blue-600/[0.03] rounded-full blur-[100px] pointer-events-none" />
                </div>

                <div className="bg-[#070707] border border-white/[0.03] rounded-[3rem] p-10 relative overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl">
                    <div className="relative w-48 h-48 mb-10 group">
                        <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping opacity-20" />
                        <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="relative w-full h-full rounded-full border-2 border-dashed border-cyan-500/20 flex items-center justify-center animate-[spin_20s_linear_infinite]">
                            <Globe className="w-16 h-16 text-cyan-500/30" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl rotate-12 group-hover:rotate-0 transition-transform">
                                <Zap className="w-10 h-10 text-white" />
                            </div>
                        </div>
                    </div>

                    <h4 className="text-4xl font-black text-white tracking-tighter mb-2">99.9%</h4>
                    <p className="text-[10px] text-cyan-500 font-mono uppercase tracking-[0.4em] mb-10">Uptime Stability</p>

                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5 p-[1px] mb-10">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "99.9%" }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                        />
                    </div>

                    <div className="w-full space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">
                            <span>Telegram Stability</span>
                            <span className="text-cyan-400">Sync Active</span>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1 h-12 bg-blue-600/10 border border-blue-500/20 rounded-xl flex flex-col items-center justify-center">
                                <span className="text-[8px] text-blue-400 uppercase font-black">Transmission Array</span>
                                <span className="text-sm font-black text-white">ACTIVE</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
