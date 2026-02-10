"use client";
import { useState, createContext, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, Bell } from "lucide-react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = "success") => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                            className={`
                                pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl min-w-[300px]
                                ${toast.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                    toast.type === "error" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                                        "bg-blue-500/10 border-blue-500/20 text-blue-400"}
                            `}
                        >
                            {toast.type === "success" && <CheckCircle className="w-5 h-5" />}
                            {toast.type === "error" && <AlertCircle className="w-5 h-5" />}
                            {toast.type === "info" && <Info className="w-5 h-5" />}

                            <div className="flex-1">
                                <p className="text-sm font-bold tracking-wide">{toast.message}</p>
                            </div>

                            <button
                                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                                className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4 opacity-50" />
                            </button>

                            {/* Progress Bar */}
                            <motion.div
                                initial={{ width: "100%" }}
                                animate={{ width: "0%" }}
                                transition={{ duration: 4, ease: "linear" }}
                                className={`absolute bottom-0 left-0 h-1 rounded-full ${toast.type === "success" ? "bg-emerald-500" :
                                        toast.type === "error" ? "bg-rose-500" : "bg-blue-500"
                                    }`}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);
