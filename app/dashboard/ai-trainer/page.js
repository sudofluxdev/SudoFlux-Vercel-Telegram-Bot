"use client";
import { useState, useEffect } from "react";
import { Save, Activity, BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/context/ToastContext";

export default function AITrainer() {
    const { showToast } = useToast() || { showToast: () => { } };
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        bot_name: "Assistant",
        niche: "General",
        tone: "Professional & Helpful",
        company_mission: "",
        target_audience: "",
        main_products: "",
        do_not_discuss: "",
        auto_attendance: true,
        ai_scope: "global",
        ai_summary: ""
    });

    useEffect(() => {
        const fetchSettings = async () => {
            const res = await fetch("/api/ai-test");
            const data = await res.json();
            if (data && !data.error) {
                setSettings({
                    bot_name: data.bot_name || "Assistant",
                    niche: data.niche || "General",
                    tone: data.tone || "Professional & Helpful",
                    company_mission: data.company_mission || "",
                    target_audience: data.target_audience || "",
                    main_products: data.main_products || "",
                    do_not_discuss: data.do_not_discuss || "",
                    auto_attendance: data.auto_attendance !== undefined ? data.auto_attendance : true,
                    ai_scope: data.ai_scope || "global",
                    ai_summary: data.ai_summary || ""
                });
            }
        };
        fetchSettings();
    }, []);

    const saveSettings = async (silent = false) => {
        setLoading(true);
        try {
            await fetch("/api/ai-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });
            if (!silent) showToast("Neural parameters updated!", "success");
        } catch (e) {
            if (!silent) showToast("Failed to sync AI configuration.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5 relative">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500 tracking-tighter">
                            Smart Brain Lab
                        </h1>
                        <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-bold text-amber-500 uppercase tracking-widest animate-pulse">
                            Em breve
                        </span>
                    </div>
                    <p className="text-gray-400 mt-2 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em]">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.4)] animate-pulse" />
                        AI Core Status: [ENHANCED BEYOND LIMITS]
                    </p>
                </div>
                <button
                    onClick={() => saveSettings()}
                    disabled={true}
                    className="px-8 py-4 bg-white/5 text-gray-500 cursor-not-allowed rounded-2xl text-sm font-bold border border-white/5 transition-all flex items-center gap-2 group"
                >
                    <Save size={16} />
                    Sync Brain Data
                </button>
            </div>

            <div className="relative">
                {/* Overlay coming soon */}
                <div className="absolute inset-x-0 inset-y-0 z-50 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/40 backdrop-blur-sm border border-white/10 p-10 rounded-[3rem] text-center shadow-2xl relative overflow-hidden group pointer-events-auto">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-50" />
                        <BrainCircuit className="w-16 h-16 text-cyan-400 mx-auto mb-6 animate-bounce" />
                        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Neural Module Under Construction</h2>
                        <p className="text-sm text-gray-400 max-w-xs mx-auto mb-8">We are fine-tuning the biological synchronization protocols. This lab will be fully operational soon.</p>
                        <div className="px-6 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] font-bold text-cyan-400 uppercase tracking-[0.3em]">
                            Coming Soon / Em breve
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start opacity-20 pointer-events-none grayscale blur-[2px]">
                    {/* Column 1: Identity & Scope */}
                    <div className="space-y-6">
                        <div className="bg-[#070707] border border-white/[0.03] p-8 rounded-[2rem] relative overflow-hidden shadow-2xl">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                                    <Activity className="w-5 h-5 text-cyan-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white tracking-tight">Identity & Scope</h3>
                            </div>

                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Bot Identity */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest pl-1">Name</label>
                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-cyan-500/5 rounded-xl blur group-focus-within:bg-cyan-500/10 transition-all" />
                                            <input
                                                className="relative w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/30 transition-all"
                                                value={settings.bot_name}
                                                onChange={(e) => setSettings({ ...settings, bot_name: e.target.value })}
                                                placeholder="Ex: SudoHelper"
                                            />
                                        </div>
                                    </div>

                                    {/* Operation Scope */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest pl-1">Operation Scope</label>
                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-cyan-500/5 rounded-xl blur group-focus-within:bg-cyan-500/10 transition-all" />
                                            <select
                                                className="relative w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/30 transition-all appearance-none cursor-pointer"
                                                value={settings.ai_scope}
                                                onChange={(e) => setSettings({ ...settings, ai_scope: e.target.value })}
                                            >
                                                <option value="global">🌐 Global (Tudo)</option>
                                                <option value="private">👤 Privado (DM)</option>
                                                <option value="group">👥 Grupos</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Business Niche */}
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest pl-1">Business Niche</label>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-cyan-500/5 rounded-xl blur group-focus-within:bg-cyan-500/10 transition-all" />
                                        <textarea
                                            className="relative w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/30 transition-all h-24 resize-none"
                                            value={settings.niche}
                                            onChange={(e) => setSettings({ ...settings, niche: e.target.value })}
                                            placeholder="Describe what your bot does..."
                                        />
                                    </div>
                                </div>

                                {/* Tone of Voice */}
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest pl-1">Tone of Voice</label>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-cyan-500/5 rounded-xl blur group-focus-within:bg-cyan-500/10 transition-all" />
                                        <select
                                            className="relative w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/30 transition-all appearance-none cursor-pointer"
                                            value={settings.tone}
                                            onChange={(e) => setSettings({ ...settings, tone: e.target.value })}
                                        >
                                            <option>Professional & Helpful</option>
                                            <option>Casual & Friendly</option>
                                            <option>Direct & Technical</option>
                                            <option>Sales Focused</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyan-600/[0.03] rounded-full blur-[60px] pointer-events-none" />
                        </div>

                        {/* AI Behavioral Summary (Descriptive List) */}
                        <div className="bg-[#070707] border border-white/[0.03] p-8 rounded-[2rem] relative overflow-hidden shadow-2xl">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
                                    <Activity className="w-5 h-5 text-amber-500" />
                                </div>
                                <h3 className="text-lg font-bold text-white tracking-tight">AI Summary (Editable)</h3>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest pl-1">Refined Behavior</label>
                                <textarea
                                    className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-amber-500/30 transition-all h-40 resize-none font-mono"
                                    value={settings.ai_summary}
                                    onChange={(e) => setSettings({ ...settings, ai_summary: e.target.value })}
                                    placeholder="Example:
• Operates primarily as a sales agent.
• Focuses on 'Websites' and 'Bots'.
• Always mentions the Vercel partnership.
• Friendly but firm on pricing."
                                />
                            </div>
                        </div>

                        {/* Stats / Status Display */}
                        <div className="bg-[#070707] border border-white/[0.03] rounded-[2rem] p-8 relative overflow-hidden shadow-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[10px] text-cyan-500 font-mono uppercase tracking-[0.4em]">Core Stability</h4>
                                <span className="text-[10px] text-gray-500 font-bold">98% SYNC</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden border border-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "98%" }}
                                    transition={{ duration: 1.5 }}
                                    className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Smart Knowledge Base */}
                    <div className="space-y-6 h-full">
                        <div className="bg-[#070707] border border-white/[0.03] p-8 rounded-[2rem] relative overflow-hidden shadow-2xl">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                                    <BrainCircuit className="w-5 h-5 text-purple-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white tracking-tight">Knowledge Base</h3>
                            </div>

                            <div className="space-y-6">
                                {/* Mission */}
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest pl-1">Company Mission (Where & How)</label>
                                    <textarea
                                        className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-purple-500/30 transition-all h-24 resize-none font-sans"
                                        value={settings.company_mission}
                                        onChange={(e) => setSettings({ ...settings, company_mission: e.target.value })}
                                        placeholder="Define WHERE you operate and HOW you deliver value..."
                                    />
                                </div>

                                {/* Audience */}
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest pl-1">Target Audience</label>
                                    <input
                                        className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-purple-500/30 transition-all"
                                        value={settings.target_audience}
                                        onChange={(e) => setSettings({ ...settings, target_audience: e.target.value })}
                                        placeholder="Who are your customers?"
                                    />
                                </div>

                                {/* Products */}
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest pl-1">Main Products / Services</label>
                                    <textarea
                                        className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-purple-500/30 transition-all h-32 resize-none"
                                        value={settings.main_products}
                                        onChange={(e) => setSettings({ ...settings, main_products: e.target.value })}
                                        placeholder="List your key offerings... Focus on HOW they solve problems."
                                    />
                                </div>

                                {/* Restricted */}
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-500 font-mono uppercase tracking-widest pl-1">Restricted Topics</label>
                                    <input
                                        className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-rose-500/30 transition-all"
                                        value={settings.do_not_discuss}
                                        onChange={(e) => setSettings({ ...settings, do_not_discuss: e.target.value })}
                                        placeholder="Topics to avoid..."
                                    />
                                </div>

                                {/* Toggle */}
                                <div className="flex items-center justify-between p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10">
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-bold text-gray-200">Auto-attendance Loop</p>
                                        <p className="text-[10px] text-gray-500 font-mono uppercase">Neural Optimization</p>
                                    </div>
                                    <button
                                        onClick={() => setSettings({ ...settings, auto_attendance: !settings.auto_attendance })}
                                        className={`w-10 h-5 rounded-full relative transition-colors ${settings.auto_attendance ? 'bg-purple-600' : 'bg-gray-800'}`}
                                    >
                                        <motion.div
                                            animate={{ x: settings.auto_attendance ? 22 : 2 }}
                                            className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-lg"
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
