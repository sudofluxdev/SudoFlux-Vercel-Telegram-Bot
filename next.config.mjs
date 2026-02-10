/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Cross-Origin-Opener-Policy",
                        value: "same-origin-allow-popups",
                    },
                    {
                        key: "Cross-Origin-Embedder-Policy",
                        value: "unsafe-none", // Reduced strictness for popups
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
