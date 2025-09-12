import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  title: "CryptoSense - Your AI-Powered Crypto Companion",
  description: "Intelligent cryptocurrency assistant powered by AI for real-time analysis, trading insights, and market predictions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans bg-white dark:bg-slate-900 min-h-screen`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="py-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <Link href="/" className="flex items-center space-x-2">
                  <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 8H8V16H16V8Z" fill="currentColor" fillOpacity="0.2"/>
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-xl font-bold text-slate-900 dark:text-white font-heading">CryptoSense</span>
                </Link>
                
                <nav className="hidden md:flex items-center space-x-8">
                  <Link href="/" className="text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 font-medium transition-colors">
                    Home
                  </Link>
                  <Link href="/features" className="text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 font-medium transition-colors">
                    Features
                  </Link>
                  <Link href="/pricing" className="text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 font-medium transition-colors">
                    Pricing
                  </Link>
                  <Link href="/about" className="text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 font-medium transition-colors">
                    About
                  </Link>
                </nav>
                
                <div className="flex items-center space-x-4">
                  <Link href="/login" className="text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400 font-medium hidden sm:block transition-colors">
                    Login
                  </Link>
                  <Link 
                    href="/app" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm hover:shadow"
                  >
                    Get Started
                  </Link>
                  <ThemeToggle />
                  
                  <button className="md:hidden text-slate-700 dark:text-slate-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </header>
            <main>{children}</main>
            <footer className="mt-24 py-12 border-t border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <Link href="/" className="flex items-center space-x-2">
                    <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 8H8V16H16V8Z" fill="currentColor" fillOpacity="0.2"/>
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-xl font-bold text-slate-900 dark:text-white font-heading">CryptoSense</span>
                  </Link>
                  <p className="mt-4 text-slate-600 dark:text-slate-400">Your trusted AI-powered crypto companion for trading success.</p>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white mb-4">Product</h3>
                  <ul className="space-y-2">
                    <li><Link href="/features" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">Features</Link></li>
                    <li><Link href="/pricing" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">Pricing</Link></li>
                    <li><Link href="/roadmap" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">Roadmap</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white mb-4">Resources</h3>
                  <ul className="space-y-2">
                    <li><Link href="/blog" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">Blog</Link></li>
                    <li><Link href="/documentation" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">Documentation</Link></li>
                    <li><Link href="/support" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">Help Center</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white mb-4">Company</h3>
                  <ul className="space-y-2">
                    <li><Link href="/about" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">About Us</Link></li>
                    <li><Link href="/careers" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">Careers</Link></li>
                    <li><Link href="/contact" className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">Contact</Link></li>
                  </ul>
                </div>
              </div>
              <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-slate-600 dark:text-slate-400">
                <p> {new Date().getFullYear()} CryptoSense. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
