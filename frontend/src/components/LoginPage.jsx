import React, { useState, useEffect } from 'react';
import { UserCog, User, Activity, ChevronRight, ArrowLeft, Stethoscope, Users } from 'lucide-react';
import axios from 'axios';

const LoginPage = ({ onLogin }) => {
    const [step, setStep] = useState(1); // 1: Role Selection, 2: Doctor Profile Selection
    const [stats, setStats] = useState({});
    const [doctors, setDoctors] = useState({});
    const [selectedDept, setSelectedDept] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, doctorsRes] = await Promise.all([
                    axios.get('http://localhost:8000/get_department_stats'),
                    axios.get('http://localhost:8000/get_doctor_list')
                ]);
                setStats(statsRes.data);
                setDoctors(doctorsRes.data);
            } catch (err) {
                console.error("Failed to fetch data", err);
            }
        };
        fetchData();
    }, []);

    const handleDoctorRoleClick = () => {
        setStep(2);
    };

    const handleDoctorSelect = (doc) => {
        onLogin('doctor', { name: doc.name, dept: doc.dept, id: doc.id });
    };

    return (
        <div className="min-h-[600px] bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-[#00b4db]/5 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-[#00dfc4]/5 rounded-full blur-[80px]"></div>

            <div className="mb-10 text-center z-10 animate-in fade-in duration-700">
                <div className="bg-[#00b4db] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#00b4db]/20">
                    <Activity className="text-white w-10 h-10" />
                </div>
                <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tighter">
                    Omni<span className="text-[#00b4db]">Triage</span> AI
                </h1>
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                    {step === 1 ? 'Select access portal' : 'Departmental Secure Access'}
                </p>
            </div>

            {step === 1 ? (
                <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl z-10 animate-in slide-in-from-bottom-4 duration-500">
                    {/* Doctor Login */}
                    <button
                        onClick={handleDoctorRoleClick}
                        className="group bg-white border border-slate-200 p-8 rounded-3xl hover:border-[#00b4db]/50 hover:shadow-xl hover:shadow-[#00b4db]/10 transition-all text-left flex flex-col items-start relative overflow-hidden active:scale-[0.98]"
                    >
                        <div className="p-3 bg-[#00b4db]/10 text-[#00b4db] rounded-xl mb-4 group-hover:scale-105 transition-transform">
                            <UserCog className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">Medical Staff</h2>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            Access the live triage dashboard and manage diagnostic flows.
                        </p>
                        <div className="mt-6 flex items-center gap-2 text-[#00b4db] font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                            Enter Portal <ChevronRight className="w-3 h-3" />
                        </div>
                    </button>

                    {/* Patient Login */}
                    <button
                        onClick={() => onLogin('patient')}
                        className="group bg-white border border-slate-200 p-8 rounded-3xl hover:border-[#00dfc4]/50 hover:shadow-xl hover:shadow-[#00dfc4]/10 transition-all text-left flex flex-col items-start relative overflow-hidden active:scale-[0.98]"
                    >
                        <div className="p-3 bg-[#00dfc4]/10 text-[#00dfc4] rounded-xl mb-4 group-hover:scale-105 transition-transform">
                            <User className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">Patient Entry</h2>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            Initialize emergency check-in and symptom prioritization.
                        </p>
                        <div className="mt-6 flex items-center gap-2 text-[#00dfc4] font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                            Start Check-in <ChevronRight className="w-3 h-3" />
                        </div>
                    </button>
                </div>
            ) : (
                <div className="w-full max-w-4xl z-10 animate-in fade-in duration-400">
                    <button
                        onClick={() => { setStep(1); setSelectedDept(null); }}
                        className="flex items-center gap-2 text-slate-400 hover:text-[#00b4db] mb-6 text-[10px] font-black uppercase tracking-widest transition-colors"
                    >
                        <ArrowLeft className="w-3 h-3" /> System Roles
                    </button>

                    {!selectedDept ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(stats).map(([dept, data]) => (
                                <button
                                    key={dept}
                                    onClick={() => setSelectedDept(dept)}
                                    className="bg-white border border-slate-200 p-5 rounded-2xl hover:border-[#00b4db]/50 hover:shadow-lg hover:shadow-[#00b4db]/5 transition-all text-left group active:scale-[0.98]"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-bold text-slate-800 tracking-tight group-hover:text-[#00b4db] text-sm">{dept}</h3>
                                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${data.available > 0
                                            ? 'bg-[#00dfc4]/10 text-[#00dfc4] border-[#00dfc4]/20'
                                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                                            }`}>
                                            {data.available}/{data.total}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 opacity-60">
                                        {data.specs.slice(0, 2).map((spec, i) => (
                                            <span key={i} className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden max-w-2xl mx-auto shadow-xl">
                            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-4">
                                <button onClick={() => setSelectedDept(null)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                                </button>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">{selectedDept}</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Select Access Profile</p>
                                </div>
                            </div>
                            <div className="p-2">
                                {doctors[selectedDept] && doctors[selectedDept].map(doc => (
                                    <button
                                        key={doc.id}
                                        onClick={() => handleDoctorSelect(doc)}
                                        className="w-full text-left px-5 py-4 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-between group"
                                    >
                                        <div>
                                            <div className="text-md font-bold text-slate-700 tracking-tight group-hover:text-[#00b4db] uppercase text-sm">{doc.name}</div>
                                            <div className="text-[9px] text-slate-400 font-black uppercase tracking-[0.1em] mt-0.5">{doc.spec}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${doc.status === 'Available'
                                                ? 'bg-[#00dfc4]/10 text-[#00dfc4] border-[#00dfc4]/20'
                                                : 'bg-slate-100 text-slate-400 border-slate-200'
                                                }`}>
                                                {doc.status}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#00b4db] transition-all" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <p className="mt-12 text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em] z-10 opacity-60">
                &copy; 2026 OmniTriage AI &bull; Secure Protocol
            </p>
        </div>
    );
};

export default LoginPage;
