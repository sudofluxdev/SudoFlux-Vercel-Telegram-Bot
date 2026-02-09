"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { Users, Search, Filter, MoreVertical, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export default function LeadsPage() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
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

    const filteredLeads = leads.filter(lead =>
        lead.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.id?.includes(searchTerm) ||
        lead.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Leads Management</h1>
                    <p className="text-gray-400">Visualize e organize todos os usuários capturados pelo bot.</p>
                </div>

                <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-blue-500/20">
                    <Users className="w-5 h-5" />
                    {leads.length} Total Leads
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, @username ou ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
                <button className="bg-[#0a0a0a] border border-[#1a1a1a] px-6 py-4 rounded-2xl flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <Filter className="w-5 h-5" />
                    Filtros
                </button>
            </div>

            {/* Table */}
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#1a1a1a] bg-[#0c0c0c]">
                                <th className="p-6 text-sm font-bold text-gray-400 uppercase tracking-widest">Usuário</th>
                                <th className="p-6 text-sm font-bold text-gray-400 uppercase tracking-widest">Username</th>
                                <th className="p-6 text-sm font-bold text-gray-400 uppercase tracking-widest">ID Telegram</th>
                                <th className="p-6 text-sm font-bold text-gray-400 uppercase tracking-widest">Data de Entrada</th>
                                <th className="p-6 text-sm font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1a1a1a]">
                            {loading ? (
                                <tr><td colSpan="5" className="p-20 text-center text-gray-500 animate-pulse">Carregando leads...</td></tr>
                            ) : filteredLeads.length === 0 ? (
                                <tr><td colSpan="5" className="p-20 text-center text-gray-500">Nenhum lead encontrado.</td></tr>
                            ) : filteredLeads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-[#0c0c0c] transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
                                                {lead.first_name?.charAt(0)}
                                            </div>
                                            <span className="font-medium">{lead.first_name}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className="text-blue-500">@{lead.username || "n/a"}</span>
                                    </td>
                                    <td className="p-6 text-gray-400 font-mono text-sm">{lead.id}</td>
                                    <td className="p-6 text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {lead.data_entrada?.toDate ? lead.data_entrada.toDate().toLocaleDateString() : "n/a"}
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors">
                                            <MoreVertical className="w-5 h-5 text-gray-500" />
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
