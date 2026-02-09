"use client";
import { useState } from "react";
import { Send, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BroadcastPage() {
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState("idle"); // idle, loading, success, error
    const [result, setResult] = useState(null);

    const handleBroadcast = async () => {
        if (!message) return;
        setStatus("loading");

        try {
            // Usando a API que já configuramos
            const res = await fetch("/api/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: message, password: "admin123" }), // Por enquanto mantendo a senha do backend
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setResult(data.count);
                setMessage("");
            } else {
                setStatus("error");
                setResult(data.error);
            }
        } catch (error) {
            setStatus("error");
            setResult("Erro de conexão");
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl font-bold mb-2">Mass Broadcast</h1>
                <p className="text-gray-400">Envie mensagens para todos os seus leads instantaneamente.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-3xl">
                        <label className="block text-sm font-medium text-gray-400 mb-4 uppercase tracking-widest">
                            Sua Mensagem
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Escreva algo impactante..."
                            rows="8"
                            className="w-full bg-[#151515] border border-[#222] rounded-2xl p-6 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none mb-6"
                        />

                        <button
                            onClick={handleBroadcast}
                            disabled={status === "loading" || !message}
                            className={`
                w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all
                ${status === "loading" ? 'bg-gray-800' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20'}
                ${!message && 'opacity-50 cursor-not-allowed'}
              `}
                        >
                            {status === "loading" ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Disparar Mensagem
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-3xl">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-[#1a1a1a] pb-4">
                            Status do Envio
                        </h3>

                        <AnimatePresence mode="wait">
                            {status === "idle" && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="text-center py-10"
                                >
                                    <Send className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                                    <p className="text-gray-500 text-sm">Pronto para iniciar.</p>
                                </motion.div>
                            )}

                            {status === "success" && (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                    className="text-center py-10"
                                >
                                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                    <p className="text-white font-bold mb-1">Sucesso!</p>
                                    <p className="text-gray-500 text-sm">{result} leads notificados.</p>
                                    <button
                                        onClick={() => setStatus("idle")}
                                        className="mt-6 text-blue-500 text-sm font-medium hover:underline"
                                    >
                                        Novo Envio
                                    </button>
                                </motion.div>
                            )}

                            {status === "error" && (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                    className="text-center py-10"
                                >
                                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                    <p className="text-white font-bold mb-1">Falha no Envio</p>
                                    <p className="text-gray-500 text-sm">{result}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="bg-blue-600/5 border border-blue-500/20 p-6 rounded-3xl">
                        <p className="text-xs text-blue-400 font-medium mb-2 uppercase">Dica Pro</p>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Use emojis e chamadas para ação claras para aumentar o engajamento dos seus leads em até 40%.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
