import React from 'react';
import { Activity, Play, LogOut, ShieldCheck, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Navbar = ({ onSimulate, isSimulating, userRole, onLogout, onOpenBias, onHandleEmergency, hasEmergency }) => {
    const { t, language, setLanguage } = useLanguage();

    return (
        <nav className="sticky top-0 z-50 px-10 py-4 flex justify-between items-center bg-white shadow-sm border-b border-slate-100 transition-all">
            {/* Branding */}
            <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tighter flex items-center">
                    <span className="text-[#00b4db]">heal</span>
                    <span className="text-[#00dfc4]">tro</span>
                </h1>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
                {['ABOUT US', 'DOCTORS', 'DEPARTMENTS', 'BLOG', 'CONTACTS'].map((link) => (
                    <a
                        key={link}
                        href={`#${link.toLowerCase().replace(' ', '-')}`}
                        className="text-[11px] font-bold text-slate-600 hover:text-[#00b4db] transition-colors tracking-wider"
                    >
                        {link}
                    </a>
                ))}
            </div>

            <div className="flex items-center gap-6">
                <button
                    onClick={() => document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-[#00dfc4] text-white px-6 py-3 rounded-full text-[12px] font-bold hover:bg-[#00c9b0] transition-all shadow-lg shadow-[#00dfc4]/20 active:scale-95"
                >
                    Make an appointment
                </button>

                {userRole === 'doctor' && (
                    <div className="flex items-center gap-3 border-l pl-6 border-slate-100">
                        <button
                            onClick={onOpenBias}
                            className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-indigo-500 transition-all"
                            title={t('fairness')}
                        >
                            <ShieldCheck className="w-5 h-5" />
                        </button>

                        <button
                            onClick={onSimulate}
                            disabled={isSimulating}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold text-[10px] uppercase tracking-widest ${isSimulating
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-[#00b4db] hover:bg-[#00a3c7] text-white shadow-lg shadow-[#00b4db]/10 active:scale-95'
                                }`}
                        >
                            <Play className={`w-3 h-3 fill-current ${isSimulating ? 'animate-pulse' : ''}`} />
                            {isSimulating ? "Simulating" : "Simulate"}
                        </button>

                        <button
                            onClick={onHandleEmergency}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold text-[10px] uppercase tracking-widest border ${hasEmergency
                                ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20'
                                : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100'
                                }`}
                        >
                            <Activity className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">Emergency</span>
                        </button>
                    </div>
                )}

                {userRole && (
                    <button
                        onClick={onLogout}
                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                        title={t('logout')}
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
