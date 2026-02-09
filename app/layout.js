import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR">
            <body className="antialiased">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}