import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import "./globals.css";

export const metadata = {
    title: "SudoFlux | Command Center",
    description: "Next-generation Telegram Automation Hub",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="antialiased bg-black">
                <AuthProvider>
                    <ToastProvider>
                        {children}
                    </ToastProvider>
                </AuthProvider>
            </body>
        </html>
    );
}