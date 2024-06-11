/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    optimizeFonts:true,
    images:{
        remotePatterns:[
            {
                protocol:'https',
                hostname:'static.alchemyapi.io',
                port:'',
                pathname:'/images/**',
            },
            {
                protocol:'https',
                hostname:'picsum.photos',
                port:'',
                pathname:'/**'
            }
        ]
    }
};

export default nextConfig;
