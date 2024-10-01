/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cdn.jsdelivr.net",
                pathname: "/gh/jdecked/twemoji@latest/assets/**"
            }
        ]
    }
};

export default nextConfig;
