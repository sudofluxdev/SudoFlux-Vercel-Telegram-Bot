"use client";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Bot, Lock, ShieldCheck, Terminal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
    const { loginWithGoogle, user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!loading && user) {
            router.push("/dashboard");
        }
    }, [user, loading, router]);

    const handleMouseMove = (e) => {
        setMousePosition({
            x: e.clientX,
            y: e.clientY,
        });
    };

    return (
        <div
            className="min-h-screen bg-[#050505] flex items-center justify-center p-6 overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-200"
            onMouseMove={handleMouseMove}
        >
            {/* Dynamic Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] opacity-20" />

            {/* Ambient Glows */}
            <motion.div
                animate={{
                    x: mousePosition.x * 0.05,
                    y: mousePosition.y * 0.05,
                }}
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[128px] mix-blend-screen pointer-events-none"
            />
            <motion.div
                animate={{
                    x: mousePosition.x * -0.05,
                    y: mousePosition.y * -0.05,
                }}
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] mix-blend-screen pointer-events-none"
            />

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[420px] relative z-10"
            >
                {/* Glass Effect Container */}
                <div className="relative bg-black/40 backdrop-blur-2xl border border-white/10 p-8 rounded-[32px] overflow-hidden shadow-2xl ring-1 ring-white/5 group">

                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Header Section */}
                    <div className="flex flex-col items-center mb-12 relative z-10">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="w-20 h-20 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-6 relative group/icon"
                        >
                            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover/icon:opacity-100 transition-opacity" />
                            <Bot className="text-white w-10 h-10 drop-shadow-md" />

                            {/* Status Dot */}
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#050505] rounded-full flex items-center justify-center">
                                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                            </div>
                        </motion.div>

                        <motion.h1
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl font-bold text-white mb-2 tracking-tight text-center"
                        >
                            Sudo<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Flux</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-400 text-center text-sm font-medium tracking-wide"
                        >
                            ELITE OPERATIONS CONTROL
                        </motion.p>
                    </div>

                    {/* Action Section */}
                    <div className="space-y-6 relative z-10">
                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={loginWithGoogle}
                            className="group relative w-full h-14 bg-white text-black font-semibold rounded-xl flex items-center justify-center gap-3 overflow-hidden shadow-lg shadow-white/5 transition-all hover:bg-gray-100"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 relative z-10" />
                            <span className="relative z-10">Authenticate with Google</span>
                        </motion.button>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex items-center justify-center gap-2 text-[10px] text-gray-500 uppercase tracking-[0.2em] font-medium"
                        >
                            <Lock className="w-3 h-3" />
                            <span>Encrypted Connection</span>
                        </motion.div>
                    </div>

                    {/* Footer / Decorative Text */}
                    <div className="absolute bottom-4 right-6 opacity-20 pointer-events-none">
                        <Terminal className="w-24 h-24 text-white -rotate-12" />
                    </div>
                </div>

                {/* Bottom Text */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center mt-8 text-xs text-gray-600 font-mono"
                >
                    System v2.4.0 &middot; SudoSquad Inc.
                </motion.p>
            </motion.div>
        </div>
    );
}
