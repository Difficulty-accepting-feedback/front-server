import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // 타입스크립트 에러 무시
    typescript: {
        ignoreBuildErrors: true,
    },
    // ESLint 에러 무시
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;