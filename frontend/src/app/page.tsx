'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useAnimation, useInView } from 'framer-motion';

// Animation variants for fade-in effects
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const featureVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5 }
  }
};

// Define types for our components
interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
}

interface TestimonialProps {
  text: string;
  author: string;
  role: string;
  image: string;
}

// Feature card component
const FeatureCard = ({ icon, title, description, delay = 0 }: FeatureCardProps) => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);
  
  return (
    <motion.div
      ref={ref}
      variants={featureVariants}
      initial="hidden"
      animate={controls}
      className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-700"
    >
      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-6">
        <div className="text-blue-600 dark:text-blue-400 w-8 h-8">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-300">{description}</p>
    </motion.div>
  );
};

// Testimonial component
const Testimonial = ({ text, author, role, image }: TestimonialProps) => (
  <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
    <div className="flex items-center mb-4">
      <div className="w-10 h-10 relative mr-4">
        <Image
          src={image}
          alt={author}
          fill
          className="rounded-full object-cover"
        />
      </div>
      <div>
        <h4 className="font-medium text-slate-900 dark:text-white">{author}</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400">{role}</p>
      </div>
    </div>
    <p className="text-slate-600 dark:text-slate-300 italic">"{text}"</p>
  </div>
);

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const heroControls = useAnimation();
  const heroInView = useInView(heroRef, { once: true });
  
  const featuresRef = useRef<HTMLDivElement>(null);
  const featuresControls = useAnimation();
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });
  
  const statsRef = useRef<HTMLElement>(null);
  const statsControls = useAnimation();
  const statsInView = useInView(statsRef, { once: true, amount: 0.5 });
  
  const [cryptoPrice, setCryptoPrice] = useState({ btc: 0, eth: 0 });
  const [priceUpdate, setPriceUpdate] = useState(false);
  
  useEffect(() => {
    if (heroInView) {
      heroControls.start("visible");
    }
  }, [heroControls, heroInView]);
  
  useEffect(() => {
    if (featuresInView) {
      featuresControls.start("visible");
    }
  }, [featuresControls, featuresInView]);
  
  useEffect(() => {
    if (statsInView) {
      statsControls.start("visible");
    }
  }, [statsControls, statsInView]);
  
  // Simulated crypto price updates
  useEffect(() => {
    // Initial prices
    setCryptoPrice({
      btc: 64387 + Math.random() * 1000,
      eth: 3452 + Math.random() * 100,
    });
    
    // Update prices every 3 seconds to simulate live data
    const interval = setInterval(() => {
      setCryptoPrice(prev => ({
        btc: prev.btc + (Math.random() - 0.5) * 200,
        eth: prev.eth + (Math.random() - 0.5) * 50,
      }));
      
      // Flash animation for price update
      setPriceUpdate(true);
      setTimeout(() => setPriceUpdate(false), 500);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="pb-20">
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        initial="hidden"
        animate={heroControls}
        variants={staggerContainer}
        className="py-20 md:py-28"
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div variants={fadeInUp}>
            <span className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full inline-block mb-6">AI-Powered Crypto Trading Assistant</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-slate-900 dark:text-white leading-tight mb-6">
              Make smarter <span className="text-blue-600 dark:text-blue-400">crypto decisions</span> with AI
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 md:pr-12">
              CryptoSense combines real-time market data with advanced AI to help you trade smarter, faster, and with confidence.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/app" 
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl hover:shadow-blue-600/20"
              >
                Get Started — It's Free
              </Link>
              <Link 
                href="/demo" 
                className="px-8 py-4 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-lg font-medium border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Watch Demo
              </Link>
            </div>
          </motion.div>
          <motion.div 
            variants={fadeInUp}
            className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-600/20 to-indigo-600/20 dark:from-blue-900/40 dark:to-indigo-900/40">
              <div className="w-full max-w-sm bg-white/95 dark:bg-slate-800/95 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-6 transform -rotate-1">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Live Market Update</h3>
                  <div className="space-y-4">
                    <div className={`flex justify-between items-center transition-colors ${priceUpdate ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mr-3">
                          <span className="text-orange-600 font-bold text-xs">₿</span>
                        </div>
                        <span className="font-medium">Bitcoin</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${cryptoPrice.btc.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                        <div className="text-xs text-green-600 dark:text-green-400">+2.4%</div>
                      </div>
                    </div>
                    <div className={`flex justify-between items-center transition-colors ${priceUpdate ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-bold text-xs">Ξ</span>
                        </div>
                        <span className="font-medium">Ethereum</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${cryptoPrice.eth.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                        <div className="text-xs text-green-600 dark:text-green-400">+1.8%</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border border-slate-200 dark:border-slate-700 p-4 rounded-lg bg-white dark:bg-slate-800">
                  <div className="text-sm text-slate-700 dark:text-slate-300 mb-2">AI Trading Insight:</div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    Bitcoin is showing strong bullish momentum with key resistance at $65,200. Consider setting buy orders if it breaks through.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Floating badges */}
        <div className="mt-16 flex flex-wrap justify-center gap-4 md:gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-white dark:bg-slate-800 px-6 py-3 rounded-full shadow-md flex items-center gap-2 border border-slate-100 dark:border-slate-700"
          >
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-slate-800 dark:text-white">Real-time Data</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="bg-white dark:bg-slate-800 px-6 py-3 rounded-full shadow-md flex items-center gap-2 border border-slate-100 dark:border-slate-700"
          >
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-slate-800 dark:text-white">AI Predictions</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="bg-white dark:bg-slate-800 px-6 py-3 rounded-full shadow-md flex items-center gap-2 border border-slate-100 dark:border-slate-700"
          >
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-slate-800 dark:text-white">Portfolio Management</span>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Features Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl my-12">
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full inline-block mb-4"
          >
            Powerful Features
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6 font-heading"
          >
            Everything you need to succeed in crypto
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto"
          >
            CryptoSense provides the tools and insights you need to navigate the complex world of cryptocurrency trading.
          </motion.p>
        </div>
        
        <motion.div 
          ref={featuresRef}
          variants={staggerContainer}
          initial="hidden"
          animate={featuresControls}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 px-4"
        >
          <FeatureCard 
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            }
            title="Real-time Market Analytics"
            description="Track and analyze cryptocurrency markets with real-time data, custom charts, and historical trends."
          />
          
          <FeatureCard 
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
            title="AI Trading Insights"
            description="Get intelligent trade recommendations, entry/exit points, and risk assessments powered by our advanced AI."
          />
          
          <FeatureCard 
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            title="Trading Calendars & Alerts"
            description="Stay ahead with customizable alerts for price movements, market events, and trading opportunities."
          />
          
          <FeatureCard 
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            title="Portfolio Tracking"
            description="Monitor your portfolio performance, track gains and losses, and get AI-driven optimization suggestions."
          />
          
          <FeatureCard 
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
            title="Security & Privacy"
            description="Your data is safe with end-to-end encryption, two-factor authentication, and zero data sharing."
          />
          
          <FeatureCard 
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            }
            title="Expert Community"
            description="Connect with a community of crypto traders to share insights, strategies, and learn from the best."
          />
        </motion.div>
      </section>
      
      {/* Stats Section */}
      <motion.section 
        ref={statsRef}
        variants={staggerContainer}
        initial="hidden"
        animate={statsControls}
        className="py-20"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          <motion.div 
            variants={fadeInUp}
            className="text-center"
          >
            <h3 className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">+50K</h3>
            <p className="text-slate-600 dark:text-slate-300">Active Users</p>
          </motion.div>
          
          <motion.div 
            variants={fadeInUp}
            className="text-center"
          >
            <h3 className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">98%</h3>
            <p className="text-slate-600 dark:text-slate-300">Prediction Accuracy</p>
          </motion.div>
          
          <motion.div 
            variants={fadeInUp}
            className="text-center"
          >
            <h3 className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">200+</h3>
            <p className="text-slate-600 dark:text-slate-300">Supported Coins</p>
          </motion.div>
          
          <motion.div 
            variants={fadeInUp}
            className="text-center"
          >
            <h3 className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">24/7</h3>
            <p className="text-slate-600 dark:text-slate-300">Market Monitoring</p>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Testimonials Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl my-12">
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full inline-block mb-4"
          >
            Testimonials
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6 font-heading"
          >
            What our users say
          </motion.h2>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 px-4"
        >
          <Testimonial 
            text="CryptoSense has completely transformed my trading strategy. The AI insights have helped me make profitable trades I would have otherwise missed."
            author="Alex Thompson"
            role="Cryptocurrency Trader"
            image="/avatar1.jpg"
          />
          
          <Testimonial 
            text="The real-time alerts and detailed analytics have given me an edge in the market. I've seen a 32% increase in my portfolio since I started using CryptoSense."
            author="Sophia Chen"
            role="Investor"
            image="/avatar2.jpg"
          />
          
          <Testimonial 
            text="As someone new to crypto, CryptoSense made it easy to understand market trends and make informed decisions. The UI is beautiful and intuitive."
            author="Michael Donovan"
            role="Beginner Trader"
            image="/avatar3.jpg"
          />
        </motion.div>
      </section>
      
      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="py-16 my-12 text-center"
      >
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6 font-heading">
            Ready to transform your crypto trading?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
            Join thousands of traders who are already leveraging AI to make smarter crypto decisions.
          </p>
          <Link 
            href="/app" 
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl hover:shadow-blue-600/20 text-lg"
          >
            Get Started For Free
          </Link>
          <p className="mt-4 text-slate-500 dark:text-slate-400">
            No credit card required • Free 14-day trial
          </p>
        </div>
      </motion.section>
    </div>
  );
}
