"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { MessageSquarePlus, Trash2, Edit3, Save, X, Plus, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AutomationPage() {
    const [commands, setCommands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newCommand, setNewCommand] = useState({ command: "", response: "" });

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "commands"), (snapshot) => {
            const cmdList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCommands(cmdList);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleAddCommand = async () => {
        if (!newCommand.command || !newCommand.response) return;
        try {
            await addDoc(collection(db, "commands"), {
                ...newCommand,
                createdAt: new Date(),
                command: newCommand.command.startsWith("/") ? newCommand.command : `/${newCommand.command}`
            });
            setNewCommand({ command: "", response: "" });
            setIsAdding(false);
        } catch (error) {
            console.error("Error adding command:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, "commands", id));
        } catch (error) {
            console.error("Error deleting command:", error);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Automation Manager</h1>
                    <p className="text-gray-400">Configure comandos personalizados e automações para o seu bot.</p>
                </div>

                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Novo Comando
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0a0a0a] border-2 border-dashed border-blue-500/30 p-6 rounded-3xl"
                        >
                            <div className="flex items-center gap-3 mb-6 text-blue-500">
                                <Terminal className="w-5" />
                                <span className="text-xs uppercase font-bold tracking-widest">Configurando Comando</span>
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Comando (ex: /promo)"
                                    value={newCommand.command}
                                    onChange={(e) => setNewCommand({ ...newCommand, command: e.target.value })}
                                    className="w-full bg-[#151515] border border-[#222] rounded-xl p-4 text-white focus:border-blue-500 outline-none"
                                />
                                <textarea
                                    placeholder="Resposta do bot..."
                                    rows="4"
                                    value={newCommand.response}
                                    onChange={(e) => setNewCommand({ ...newCommand, response: e.target.value })}
                                    className="w-full bg-[#151515] border border-[#222] rounded-xl p-4 text-white focus:border-blue-500 outline-none resize-none"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAddCommand}
                                        className="flex-1 bg-blue-600 py-3 rounded-xl font-bold text-sm"
                                    >
                                        Salvar
                                    </button>
                                    <button
                                        onClick={() => setIsAdding(false)}
                                        className="px-4 py-3 bg-[#151515] rounded-xl text-gray-400"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {commands.map((cmd) => (
                        <motion.div
                            key={cmd.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded-3xl group hover:border-blue-500/30 transition-all"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="px-3 py-1 bg-blue-600/10 text-blue-500 rounded-lg text-sm font-mono font-bold">
                                    {cmd.command}
                                </div>
                                <button
                                    onClick={() => handleDelete(cmd.id)}
                                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                                {cmd.response}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-bold">
                                <Edit3 className="w-3" />
                                Editar Comando
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {!loading && commands.length === 0 && !isAdding && (
                <div className="text-center py-20 bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl">
                    <MessageSquarePlus className="w-16 h-16 text-gray-800 mx-auto mb-6" />
                    <h3 className="text-xl font-bold mb-2">Nenhum comando criado</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        Comece criando comandos personalizados para automatizar o atendimento do seu bot.
                    </p>
                </div>
            )}
        </div>
    );
}
