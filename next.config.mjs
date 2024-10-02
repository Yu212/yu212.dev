import withExportImages from "next-export-optimize-images";

/** @type {import('next').NextConfig} */
const nextConfig = withExportImages({
    output: "export",
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cdn.jsdelivr.net",
                pathname: "/gh/jdecked/twemoji@latest/assets/**"
            }
        ]
    }
});

export default nextConfig;
