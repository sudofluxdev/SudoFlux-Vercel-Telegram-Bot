"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ShieldCheck, ShieldAlert, Trash2, Search, RefreshCw, MessageSquare, Globe, Ban, CheckCircle } from "lucide-react";
import { db } from "@/lib/firebaseClient";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/context/ToastContext";

export default function GroupsPage() {
    const { showToast } = useToast() || { showToast: () => { } };
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "groups"), (snapshot) => {
            const groupsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGroups(groupsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const toggleGroupStatus = async (groupId, currentStatus) => {
        try {
            await updateDoc(doc(db, "groups", groupId), {
                authorized: !currentStatus
            });
            showToast(currentStatus ? "Group Unauthorized" : "Group Authorized", "info");
        } catch (e) { showToast("Action failed.", "error"); }
    };

    const removeGroup = async (groupId) => {
        if (!confirm("Remove this group from the list? (This won't eject the bot, just stop tracking it until it's added again)")) return;
        try {
            await deleteDoc(doc(db, "groups", groupId));
            showToast("Group entry removed.", "info");
        } catch (e) { showToast("Deletion failed.", "error"); }
    };

    const filteredGroups = groups.filter(g =>
        (g.title || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center text-gray-500 font-mono animate-pulse uppercase tracking-widest">Scanning Group Frequency...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 p-2">
                <div>
                    <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500 tracking-tighter">
                        Group Control
                    </h1>
                    <p className="text-gray-400 mt-2 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em]">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.4)] animate-pulse" />
                        Peripheral Sync : [ACTIVE]
                    </p>
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search Signals..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm text-white focus:border-cyan-500/50 outline-none w-full md:w-80 transition-all backdrop-blur-md"
                    />
                </div>
            </div>

            {/* Privacy Mode Warning */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-[2rem] p-6 flex items-center gap-6">
                <div className="p-3 bg-amber-500/10 rounded-xl">
                    <ShieldAlert className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-1">Telegram Privacy Protocol</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        If the bot is not responding to non-slash commands in groups, ensure <b>Privacy Mode</b> is <b>Disabled</b> in BotFather or make the bot an <b>Admin</b> in the group.
                    </p>
                </div>
            </div>

            {/* Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.length === 0 ? (
                    <div className="md:col-span-3 py-20 bg-white/[0.02] border border-dashed border-white/5 rounded-[3rem] text-center">
                        <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <h3 className="text-gray-500 font-bold uppercase tracking-widest text-sm">No external groups detected</h3>
                        <p className="text-xs text-gray-600 mt-2">The bot hasn't been added to any groups yet.</p>
                    </div>
                ) : (
                    filteredGroups.map((group, idx) => (
                        <motion.div
                            key={group.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="relative group bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-6 hover:border-white/10 transition-all overflow-hidden"
                        >
                            {/* Status Gradient */}
                            <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-20 -z-10 ${group.authorized ? 'bg-emerald-500' : 'bg-rose-500'}`} />

                            <div className="flex items-start justify-between mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center shadow-2xl relative">
                                    <Globe className="w-6 h-6 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-lg flex items-center justify-center border border-black ${group.authorized ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                        {group.authorized ? <CheckCircle className="w-2.5 h-2.5 text-white" /> : <Ban className="w-2.5 h-2.5 text-white" />}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleGroupStatus(group.id, group.authorized)}
                                        className={`p-2 rounded-xl border transition-all ${group.authorized ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/20' : 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/20'}`}
                                        title={group.authorized ? "Revoke Access" : "Grant Access"}
                                    >
                                        {group.authorized ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => removeGroup(group.id)}
                                        className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-600 hover:text-rose-500 hover:border-rose-500/20 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white truncate group-hover:text-cyan-400 transition-colors">{group.title || "Unknown Group"}</h3>
                                    <p className="text-[10px] text-gray-600 font-mono tracking-widest uppercase mt-1">ID: {group.id}</p>
                                </div>

                                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-gray-600 font-bold uppercase tracking-wider">Access Status</span>
                                        <span className={`text-xs font-bold uppercase mt-0.5 ${group.authorized ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {group.authorized ? "Authorized Protocol" : "Access Restricted"}
                                        </span>
                                    </div>
                                    <div className="ml-auto flex flex-col items-end">
                                        <span className="text-[9px] text-gray-600 font-bold uppercase tracking-wider">Last Sync</span>
                                        <span className="text-xs text-white font-mono mt-0.5">{group.data_active?.toDate?.()?.toLocaleDateString() || "Unknown"}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
