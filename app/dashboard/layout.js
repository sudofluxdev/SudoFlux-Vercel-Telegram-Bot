
"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
    LayoutDashboard,
    Send,
    Users,
    Settings,
    LogOut,
    Zap,
    Command,
    Bell,
    CheckCircle,
    Trash2,
    Clock,
    UserPlus,
    X
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebaseClient";
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, writeBatch, getDocs } from "firebase/firestore";

export default function DashboardLayout({ children }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const [notifications, setNotifications] = useState([]);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    // Notification Listener
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "notifications"), orderBy("created_at", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotifications(notifs);
        });
        return () => unsubscribe();
    }, [user]);

    // Close notif on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const clearAllNotifications = async () => {
        try {
            const batch = writeBatch(db);
            const snapshot = await getDocs(collection(db, "notifications"));
            snapshot.docs.forEach((doc) => batch.delete(doc.ref));
            await batch.commit();
            setIsNotifOpen(false);
        } catch (e) { console.error(e); }
    };

    const deleteNotification = async (id) => {
        try {
            await deleteDoc(doc(db, "notifications", id));
        } catch (e) { console.error(e); }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const menuItems = [
        { name: "Overview", icon: LayoutDashboard, path: "/dashboard" },
        { name: "Broadcast", icon: Send, path: "/dashboard/broadcast" },
        { name: "Bot Commands", icon: Command, path: "/dashboard/automation" },
        { name: "Groups", icon: Users, path: "/dashboard/groups" },
        { name: "Leads", icon: Users, path: "/dashboard/leads" },
        { name: "Settings", icon: Settings, path: "/dashboard/settings" },
    ];

    const unreadCount = notifications.length;

    return (
        <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] opacity-20" />
            </div>

            {/* Sidebar */}
            <aside className="w-72 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col p-6 relative z-20">
                <div className="flex items-center gap-3 mb-12 px-2">
                    <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="text-lg font-bold tracking-tight block leading-tight">SudoFlux</span>
                        <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Command Center</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link key={item.name} href={item.path}>
                                <div className={`
                                    relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden
                                    ${isActive ? 'bg-white/5 text-white shadow-inner shadow-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                                `}>
                                    {isActive && (
                                        <motion.div layoutId="activeTab" className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 rounded-full" />
                                    )}
                                    <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                                    <span className="font-medium text-sm tracking-wide">{item.name}</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="pt-6 mt-6 border-t border-white/5">
                    <button onClick={logout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group">
                        <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        <span className="font-medium text-sm">Logout</span>
                        <div className="ml-auto text-xs px-2 py-0.5 rounded bg-white/5 font-mono text-gray-600 group-hover:bg-red-500/10 group-hover:text-red-400">ESC</div>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative z-10 flex flex-col">
                <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between sticky top-0 bg-[#050505]/80 backdrop-blur-md z-50">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-widest flex items-center gap-2">
                            <Command className="w-4 h-4 text-cyan-500" />
                            {menuItems.find(i => i.path === pathname)?.name || "Dashboard"}
                        </h2>
                    </div>

                    <div className="flex items-center gap-5">
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
                            >
                                <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-black shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                                )}
                            </button>

                            <AnimatePresence>
                                {isNotifOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-4 w-[350px] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 shadow-black/50"
                                    >
                                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-bold text-gray-200">System Logs</h3>
                                                <span className="bg-cyan-500/10 text-cyan-400 text-[10px] px-1.5 py-0.5 rounded font-mono uppercase">{unreadCount} active</span>
                                            </div>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={clearAllNotifications}
                                                    className="text-[10px] font-bold text-gray-500 hover:text-rose-400 transition-colors uppercase flex items-center gap-1"
                                                >
                                                    <Trash2 className="w-3 h-3" /> Clear All
                                                </button>
                                            )}
                                        </div>

                                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                            {notifications.length === 0 ? (
                                                <div className="p-10 flex flex-col items-center justify-center text-center">
                                                    <div className="p-4 bg-white/5 rounded-full mb-3">
                                                        <CheckCircle className="w-6 h-6 text-gray-600" />
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-medium">Frequency Clear. No anomalies detected.</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-white/5">
                                                    {notifications.map((notif) => (
                                                        <div key={notif.id} className="p-4 hover:bg-white/[0.03] transition-colors group relative">
                                                            <div className="flex gap-3">
                                                                <div className={`mt-0.5 p-2 rounded-lg ${notif.type === 'lead' ? 'bg-cyan-500/10' : 'bg-gray-500/10'}`}>
                                                                    {notif.type === 'lead' ? <UserPlus className="w-3.5 h-3.5 text-cyan-400" /> : <Clock className="w-3.5 h-3.5 text-gray-400" />}
                                                                </div>
                                                                <div className="flex-1 space-y-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="text-xs font-bold text-gray-200 tracking-tight">{notif.title}</p>
                                                                        <p className="text-[10px] text-gray-600 font-mono">
                                                                            {notif.created_at?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </p>
                                                                    </div>
                                                                    <p className="text-[11px] text-gray-400 leading-relaxed">{notif.message}</p>
                                                                </div>
                                                                <button
                                                                    onClick={() => deleteNotification(notif.id)}
                                                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-rose-400 transition-all absolute top-2 right-2"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-3 bg-white/[0.01] border-t border-white/5 text-center">
                                            <p className="text-[9px] text-gray-600 font-mono tracking-widest uppercase italic">Neural Sync Active</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="h-8 w-px bg-white/10 mx-1" />

                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-white">{user.displayName}</p>
                                <p className="text-[10px] text-cyan-500 font-mono uppercase tracking-wider">Super Admin</p>
                            </div>
                            <div className="relative group cursor-pointer">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500" />
                                <img
                                    src={user.photoURL}
                                    alt="Profile"
                                    className="relative w-10 h-10 rounded-full border-2 border-[#111] object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 flex-1">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
