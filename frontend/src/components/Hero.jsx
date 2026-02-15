import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const quotes = [
    { text: "Medicine is a science of uncertainty and an art of probability.", author: "William Osler" },
    { text: "The good physician treats the disease; the great physician treats the patient who has the disease.", author: "William Osler" },
    { text: "Wherever the art of Medicine is loved, there is also a love of Humanity.", author: "Hippocrates" }
];

const Hero = () => {
    const [currentQuote, setCurrentQuote] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentQuote((prev) => (prev + 1) % quotes.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-[700px] bg-gradient-to-r from-[#00b4db] to-[#00dfc4] overflow-hidden flex items-center justify-center">
            {/* Animated Background Elements */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 }}
                transition={{ duration: 1 }}
                className="absolute inset-0"
            >
                <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-200 rounded-full blur-3xl" />
            </motion.div>

            <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between h-full relative z-10">
                {/* Left Navigation Arrow */}
                <button className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full items-center justify-center text-white transition-all z-20">
                    <ArrowLeft className="w-6 h-6" />
                </button>

                {/* Doctor Image - Left Side (Restored Layout) */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="hidden md:block w-1/2 h-full relative"
                >
                    <img
                        src="/assets/doctor_hero.png" // Local asset path
                        alt="Doctor"
                        className="absolute bottom-0 left-0 h-[95%] w-auto object-contain drop-shadow-2xl z-10"
                    />
                </motion.div>

                {/* Text Content - Right Side */}
                <div className="w-full md:w-1/2 text-white z-20 pt-10 md:pt-0 pl-10">
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h2 className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight text-right md:text-left">
                            Have access to <br />
                            <span className="font-extrabold text-teal-50 drop-shadow-sm">a health professional</span> <br />
                            at any time
                        </h2>
                    </motion.div>

                    {/* Quote Section with Transition */}
                    <div className="mt-12 relative flex justify-end md:justify-start">
                        <div className="max-w-md">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentQuote}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div className="flex gap-4 items-start">
                                        <Quote className="w-8 h-8 text-white/40 rotate-180 flex-shrink-0" />
                                        <div>
                                            <p className="text-xl font-light italic text-white/90 mb-2">"{quotes[currentQuote].text}"</p>
                                            <p className="text-sm font-bold text-white/60 uppercase tracking-widest">— {quotes[currentQuote].author}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Dots indicating carousel state */}
                    <div className="flex justify-end md:justify-start gap-3 mt-8">
                        {quotes.map((_, idx) => (
                            <div
                                key={idx}
                                onClick={() => setCurrentQuote(idx)}
                                className={`w-3 h-3 rounded-full cursor-pointer transition-all ${currentQuote === idx ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/60'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Navigation Arrow */}
                <button className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full items-center justify-center text-white transition-all z-20">
                    <ArrowRight className="w-6 h-6" />
                </button>

            </div>
        </div>
    );
};

export default Hero;
