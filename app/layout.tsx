import type { Metadata } from 'next';
import './globals.css';
import WebMCP from '@/components/webmcp';
export const metadata:Metadata={title:{default:'NOVA MARKET — Find your next obsession',template:'%s | NOVA MARKET'},description:'Discover independent brands, everyday tech, streetwear and objects with personality.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}<WebMCP/></body></html>}
