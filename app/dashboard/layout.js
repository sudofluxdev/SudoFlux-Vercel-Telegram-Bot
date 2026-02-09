"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import {
    LayoutDashboard,
    Send,
    MessageSquarePlus,
    Users,
    Settings,
    LogOut,
    Zap
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardLayout({ children }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const menuItems = [
        { name: "Overview", icon: LayoutDashboard, path: "/dashboard" },
        { name: "Broadcast", icon: Send, path: "/dashboard/broadcast" },
        { name: "Auto-DM", icon: MessageSquarePlus, path: "/dashboard/automation" },
        { name: "Leads", icon: Users, path: "/dashboard/leads" },
        { name: "Settings", icon: Settings, path: "/dashboard/settings" },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white flex">
            {/* Sidebar */}
            <aside className="w-72 bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col p-6 sticky top-0 h-screen">
                <div className="flex items-center gap-3 mb-12 px-2">
                    <div className="p-2 bg-blue-600 rounded-lg">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">SudoFlux</span>
                </div>

                <nav className="flex-1 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link key={item.name} href={item.path}>
                                <div className={`
                  flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive ? 'bg-blue-600 font-semibold shadow-lg shadow-blue-500/20' : 'hover:bg-[#151515] text-gray-400 hover:text-white'}
                `}>
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-blue-400'}`} />
                                    <span>{item.name}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="pt-6 border-t border-[#1a1a1a]">
                    <button
                        onClick={logout}
                        className="flex items-center gap-4 px-4 py-3 w-full rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="h-20 border-b border-[#1a1a1a] px-10 flex items-center justify-between sticky top-0 bg-[#050505]/80 backdrop-blur-md z-20">
                    <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest">
                        {menuItems.find(i => i.path === pathname)?.name || "Dashboard"}
                    </h2>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-medium">{user.displayName}</p>
                            <p className="text-xs text-gray-500">Admin</p>
                        </div>
                        <img
                            src={user.photoURL}
                            alt="Profile"
                            className="w-10 h-10 rounded-full border border-[#1a1a1a]"
                        />
                    </div>
                </header>

                <div className="p-10">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
