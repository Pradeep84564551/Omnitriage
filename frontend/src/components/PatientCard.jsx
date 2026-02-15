import React from 'react';
import { Heart, Activity as HeartRate, Thermometer, Info, Wind, CheckCircle, Bell, Video } from 'lucide-react';

const PatientCard = ({ patient, onDoctorClick }) => {
    // Prioritize AI Prediction (Predicted_Risk) over User Input (Risk_Level)
    const risk = patient.Predicted_Risk || patient.Risk_Level;
    const { Age, Gender, Symptoms } = patient;

    const riskConfig = {
        High: {
            border: 'border-red-500/50',
            bg: 'bg-red-500/5',
            badge: 'bg-red-500/20 text-red-400 border-red-500/30',
            icon: 'text-red-400',
            glow: 'neon-glow-red'
        },
        Medium: {
            border: 'border-amber-500/50',
            bg: 'bg-amber-500/5',
            badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            icon: 'text-amber-400',
            glow: ''
        },
        Low: {
            border: 'border-emerald-500/50',
            bg: 'bg-emerald-500/5',
            badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            icon: 'text-emerald-400',
            glow: ''
        },
    };

    const normalizedRisk = risk ? risk.charAt(0).toUpperCase() + risk.slice(1).toLowerCase() : 'Low';
    const config = riskConfig[normalizedRisk] || riskConfig.Low;

    return (
        <div className={`bg-slate-900/40 border ${config.border} rounded-2xl p-5 hover:bg-slate-900/60 transition-all duration-300 group relative flex flex-col h-full animate-in fade-in slide-in-from-bottom-2`}>
            {/* Top Section */}
            <div className="flex justify-between items-start mb-5">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold font-mono text-slate-600 tracking-tighter bg-white/5 px-2 py-0.5 rounded">
                            #{String(patient.Patient_ID).slice(-6)}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors uppercase">
                        {patient.Name || "Anonymous"}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                        {Gender || 'U'} &bull; {Age || '--'} YRS
                    </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${config.badge}`}>
                        {normalizedRisk}
                    </span>
                    {patient.Risk_Confidence && (
                        <div className="w-16 bg-white/5 h-1 rounded-full overflow-hidden mt-1">
                            <div className={`h-full transition-all duration-1000 ${normalizedRisk === 'High' ? 'bg-red-500' : normalizedRisk === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${patient.Risk_Confidence}%` }}></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Vitals Mesh */}
            <div className="grid grid-cols-2 gap-2 mb-5">
                <div className="bg-slate-800/50 border border-white/5 p-2.5 rounded-xl flex items-center gap-2.5">
                    <HeartRate className="w-3.5 h-3.5 text-red-500 opacity-70" />
                    <div>
                        <span className="block text-[8px] font-bold text-slate-600 uppercase tracking-tight">HR</span>
                        <span className="text-xs font-bold text-white leading-none">{patient.Heart_Rate}<span className="text-[9px] text-slate-600 ml-0.5">BPM</span></span>
                    </div>
                </div>
                <div className="bg-slate-800/50 border border-white/5 p-2.5 rounded-xl flex items-center gap-2.5">
                    <Heart className="w-3.5 h-3.5 text-blue-500 opacity-70" />
                    <div>
                        <span className="block text-[8px] font-bold text-slate-600 uppercase tracking-tight">BP</span>
                        <span className="text-xs font-bold text-white leading-none">{patient.BP_Systolic}/{patient.BP_Diastolic}</span>
                    </div>
                </div>
                <div className="bg-slate-800/50 border border-white/5 p-2.5 rounded-xl flex items-center gap-2.5">
                    <Thermometer className="w-3.5 h-3.5 text-amber-500 opacity-70" />
                    <div>
                        <span className="block text-[8px] font-bold text-slate-600 uppercase tracking-tight">TEMP</span>
                        <span className="text-xs font-bold text-white leading-none">{patient.Temperature}°C</span>
                    </div>
                </div>
                <div className="bg-slate-800/50 border border-white/5 p-2.5 rounded-xl flex items-center gap-2.5">
                    <Wind className="w-3.5 h-3.5 text-emerald-500 opacity-70" />
                    <div>
                        <span className="block text-[8px] font-bold text-slate-600 uppercase tracking-tight">O2</span>
                        <span className="text-xs font-bold text-white leading-none">{patient.O2_Saturation}%</span>
                    </div>
                </div>
            </div>

            {/* Symptoms Tags */}
            <div className="mb-5 flex-grow">
                <div className="flex flex-wrap gap-1.5">
                    {Symptoms ? Symptoms.split(',').slice(0, 4).map((s, i) => (
                        <span key={i} className="text-[9px] font-bold bg-white/5 text-slate-500 px-2 py-0.5 rounded border border-white/5 uppercase tracking-tight">
                            {s.trim()}
                        </span>
                    )) : <span className="text-[9px] text-slate-700 font-bold uppercase tracking-widest italic">Stable</span>}
                </div>
            </div>

            {/* Footer Operations */}
            <div className="pt-3 border-t border-white/5 mt-auto">
                {normalizedRisk === 'High' && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const roomName = `Omnitriage-${patient.Patient_ID}`;
                            window.open(`https://meet.jit.si/${roomName}`, '_blank');
                        }}
                        className="w-full mb-3 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/10 active:scale-95 transition-all"
                    >
                        <Video className="w-3.5 h-3.5" />
                        Quick Connect
                    </button>
                )}

                {patient.Assigned_Doctor && (
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onDoctorClick) onDoctorClick(patient.Assigned_Doctor);
                        }}
                        className="flex justify-between items-center p-2 rounded-xl bg-slate-800/40 border border-white/5 hover:border-blue-500/20 transition-all cursor-pointer"
                    >
                        <div className="flex flex-col">
                            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-none">Specialist</span>
                            <span className="text-xs font-bold text-slate-300 mt-0.5">{patient.Assigned_Doctor}</span>
                        </div>
                        <div className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${normalizedRisk === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {normalizedRisk === 'High' ? 'Alerted' : 'Assigned'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientCard;
