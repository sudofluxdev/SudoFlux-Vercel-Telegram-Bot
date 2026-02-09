"use client";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
    const { loginWithGoogle, user, isAdmin, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            if (isAdmin) {
                router.push("/dashboard");
            } else {
                // Redirecionar para página de aviso se não for admin? 
                // Por enquanto vamos deixar no dashboard e deixar o middleware/proteção agir
                router.push("/dashboard");
            }
        }
    }, [user, isAdmin, loading, router]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 overflow-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md bg-[#111] border border-[#222] p-10 rounded-3xl shadow-2xl relative z-10 backdrop-blur-xl"
            >
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6">
                        <LogIn className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">SudoFlux Bot</h1>
                    <p className="text-gray-400 text-center text-sm">
                        Command Center Premium. Faça login com sua conta administrativa.
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={loginWithGoogle}
                    className="w-full h-14 bg-white text-black font-semibold rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors"
                >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                    Entrar com Google
                </motion.button>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">
                        Authorized Access Only
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
