"use client";
import { Users, UserCheck, MessageSquare, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
    const stats = [
        { name: "Total Leads", value: "2,543", icon: Users, change: "+12%", color: "blue" },
        { name: "Active Users", value: "1,892", icon: UserCheck, change: "+5%", color: "green" },
        { name: "Total Messages", value: "48.2k", icon: MessageSquare, change: "+18%", color: "purple" },
        { name: "Conv. Rate", value: "24.5%", icon: TrendingUp, change: "+3.2%", color: "orange" },
    ];

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-[#0a0a0a] border border-[#1a1a1a] p-6 rounded-3xl hover:border-[#2a2a2a] transition-colors"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl bg-${stat.color}-600/10`}>
                                <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                            </div>
                            <span className="text-green-500 text-sm font-medium">{stat.change}</span>
                        </div>
                        <h3 className="text-gray-400 text-sm mb-1">{stat.name}</h3>
                        <p className="text-2xl font-bold">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-3xl min-h-[400px]">
                    <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
                    <div className="space-y-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-4 pb-6 border-b border-[#1a1a1a] last:border-0 last:pb-0">
                                <div className="w-10 h-10 rounded-full bg-gray-800" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Novo lead capturado: @user{i}</p>
                                    <p className="text-xs text-gray-500">Há {i * 15} minutos</p>
                                </div>
                                <div className="px-3 py-1 bg-blue-600/10 text-blue-500 text-xs rounded-full font-medium">
                                    Novo
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-3xl flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mb-6">
                        <TrendingUp className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Power Analysis</h3>
                    <p className="text-gray-400 max-w-sm">
                        Aqui serão exibidos gráficos de crescimento e engajamento do seu bot em tempo real.
                    </p>
                </div>
            </div>
        </div>
    );
}
