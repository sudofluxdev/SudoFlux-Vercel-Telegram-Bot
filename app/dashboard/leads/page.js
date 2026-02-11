"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { Users, Search, Filter, Trash2, Calendar, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/context/ToastContext";

/**
 * BotFlux V1.5 - Neural Lead Archive
 * 👥 [PT] Gestão de leads e histórico de interações
 * 👥 [EN] Lead management and interaction history
 */

export default function LeadsPage() {
    const { showToast } = useToast();
    const [leads, setLeads] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) return;
        /**
         * [PT] Monitoramento em tempo real da captura de novos leads
         * [EN] Real-time monitoring of new lead capture
         */
        const q = query(collection(db, "leads"), orderBy("data_entrada", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const leadsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setLeads(leadsList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const deleteLead = async (id) => {
        if (!confirm("Are you sure you want to eliminate this lead?")) return;
        try {
            await deleteDoc(doc(db, "leads", id));
            showToast("Lead removed from the matrix.", "info");
        } catch (err) {
            showToast("Failed to remove lead.", "error");
        }
    };

    const filteredLeads = leads.filter(lead =>
        lead.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.id?.includes(searchTerm) ||
        lead.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black mb-2 flex items-center gap-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-500 tracking-tighter">
                        Neural Lead Archive
                    </h1>
                    <p className="text-gray-500 text-xs font-mono uppercase tracking-[0.3em]">Managed and analyze biological users captured by the system.</p>
                </div>

                <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-blue-500/20 tracking-tight">
                    <Users className="w-5 h-5" />
                    {leads.length} Total Registered
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                    <input
                        type="text"
                        placeholder="Search by name, @username or system ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-blue-500 transition-all shadow-inner"
                    />
                </div>
                <button className="bg-[#0a0a0a] border border-white/5 px-6 py-4 rounded-2xl flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <Filter className="w-4 h-4" />
                    Advanced Filters
                </button>
            </div>

            {/* Table */}
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="p-8 text-xs font-bold text-gray-500 uppercase tracking-widest">Target</th>
                                <th className="p-8 text-xs font-bold text-gray-500 uppercase tracking-widest">Username</th>
                                <th className="p-8 text-xs font-bold text-gray-500 uppercase tracking-widest">System ID</th>
                                <th className="p-8 text-xs font-bold text-gray-500 uppercase tracking-widest">Detection Date</th>
                                <th className="p-8 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="5" className="p-20 text-center text-gray-600 font-mono tracking-widest animate-pulse">SYNCHRONIZING RECORDS...</td></tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr><td colSpan="5" className="p-20 text-center text-gray-500">No leads found in the database.</td></tr>
                            ) : filteredLeads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-white/[0.01] transition-colors group">
                                    <td className="p-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-sm shadow-lg group-hover:scale-110 transition-transform">
                                                {lead.first_name?.charAt(0)}
                                            </div>
                                            <span className="font-bold tracking-tight text-white">{lead.first_name}</span>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <span className="text-blue-400 font-medium">@{lead.username || "restricted_access"}</span>
                                    </td>
                                    <td className="p-8 text-gray-500 font-mono text-xs">{lead.id}</td>
                                    <td className="p-8 text-gray-400">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            {lead.data_entrada?.toDate ? lead.data_entrada.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "pending"}
                                        </div>
                                    </td>
                                    <td className="p-8 text-right flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => window.location.href = `/dashboard/leads/${lead.id}`}
                                            className="p-3 hover:bg-cyan-500/10 rounded-2xl transition-all group/chat border border-transparent hover:border-cyan-500/20 flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-cyan-400"
                                        >
                                            <MessageSquare className="w-4 h-4" /> VIEW CHAT
                                        </button>
                                        <button
                                            onClick={() => deleteLead(lead.id)}
                                            className="p-3 hover:bg-rose-500/10 rounded-2xl transition-all group/del border border-transparent hover:border-rose-500/20"
                                        >
                                            <Trash2 className="w-5 h-5 text-gray-600 group-hover/del:text-rose-500" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
