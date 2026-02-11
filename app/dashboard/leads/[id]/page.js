"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebaseClient";
import { doc, getDoc, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { MessageSquare, ArrowLeft, Bot, User, Clock, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LeadChatPage() {
    const { id } = useParams();
    const router = useRouter();
    const [lead, setLead] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (!id) return;

        // Fetch Lead Info
        const fetchLead = async () => {
            const leadDoc = await getDoc(doc(db, "leads", id));
            if (leadDoc.exists()) {
                setLead(leadDoc.data());
            }
        };
        fetchLead();

        // Listen to Messages
        const q = query(
            collection(db, "chats", id, "messages"),
            orderBy("created_at", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
            setLoading(false);

            // Auto scroll
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            }, 100);
        });

        return () => unsubscribe();
    }, [id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest animate-pulse">Synchronizing Chat Data...</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto h-full flex flex-col pb-10">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors text-gray-400"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            {lead?.first_name || "Biological Target"}
                            <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded-lg border border-cyan-500/20 font-mono tracking-tighter uppercase">ID: {id}</span>
                        </h1>
                        <p className="text-gray-500 text-sm">@{lead?.username || "restricted_name"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase font-mono tracking-widest">Live Link Established</span>
                </div>
            </div>

            {/* CHAT CONTAINER */}
            <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col min-h-[600px] max-h-[70vh]">
                <div className="p-6 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Neural Memory Log</span>
                    </div>
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-500 font-mono italic">
                        {messages.length} messages captured
                    </span>
                </div>

                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar"
                >
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-white/5 rounded-[2rem] opacity-50">
                            <Bot className="w-12 h-12 mb-4" />
                            <p className="text-sm font-medium tracking-tight">No verbal interactions recorded yet.</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => {
                            const isBot = msg.role === 'model' || msg.role === 'bot';
                            return (
                                <motion.div
                                    initial={{ opacity: 0, x: isBot ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={msg.id || i}
                                    className={`flex ${isBot ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] group flex flex-col ${isBot ? 'items-end' : 'items-start'}`}>
                                        <div className={`
                                            p-4 rounded-[1.5rem] shadow-lg relative
                                            ${isBot
                                                ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-tr-none'
                                                : 'bg-[#151515] text-gray-200 border border-white/5 rounded-tl-none'}
                                        `}>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                        </div>
                                        <div className={`flex items-center gap-2 mt-2 px-1 text-[9px] font-mono text-gray-600 uppercase tracking-widest`}>
                                            {isBot ? <Zap className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                            {isBot ? 'Neural Reply' : 'User Prompt'}
                                            <span>•</span>
                                            {msg.created_at?.toDate ? msg.created_at.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just Now"}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
