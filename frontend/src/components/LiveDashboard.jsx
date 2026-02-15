import React, { useState, useEffect, useRef } from 'react';
import PatientCard from './PatientCard';
import { Users, Filter, X, Video, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const PatientDetailModal = ({ patient, history, onClose }) => {
    if (!patient) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative shadow-2xl">
                {/* Modal Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div className="flex items-center gap-5">
                        <div className={`p-3.5 rounded-xl border ${patient.Risk_Level === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">{patient.Name || "Patient Record"}</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-bold font-mono text-slate-500 tracking-wider">ID: {String(patient.Patient_ID).slice(-10)}</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{patient.Age}Y &bull; {patient.Gender}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/5">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-thin">
                    {/* Assessment Overview */}
                    <div className={`p-5 rounded-xl border ${patient.Risk_Level === 'High'
                        ? 'bg-red-500/5 border-red-500/10 text-red-400'
                        : 'bg-blue-500/5 border-blue-500/10 text-blue-400'
                        }`}>
                        <h3 className="text-[9px] font-bold uppercase tracking-widest mb-2 opacity-60">AI Clinical Assessment</h3>
                        <p className="text-lg font-bold mb-1 tracking-tight">
                            Status: <span className="uppercase">{patient.Predicted_Risk || patient.Risk_Level}</span> Risk
                        </p>
                        <p className="text-xs font-medium text-slate-400 leading-relaxed">
                            {patient.explanation && patient.explanation.length > 0
                                ? `Contributing factors: ${patient.explanation.join(', ')}.`
                                : "Continuous monitoring recommended based on triage protocols."}
                        </p>
                    </div>

                    {/* Vitals Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: 'Heart Rate', val: patient.Heart_Rate, unit: 'BPM', color: 'text-red-400' },
                            { label: 'Blood Pressure', val: `${patient.BP_Systolic}/${patient.BP_Diastolic}`, unit: 'mmHg', color: 'text-blue-400' },
                            { label: 'Oxygen Level', val: patient.O2_Saturation, unit: '%', color: 'text-emerald-400' },
                            { label: 'Temperature', val: patient.Temperature, unit: '°C', color: 'text-amber-400' }
                        ].map((vital, i) => (
                            <div key={i} className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
                                <span className="block text-[8px] font-bold text-slate-600 uppercase tracking-widest mb-2">{vital.label}</span>
                                <p className="text-xl font-bold text-white tracking-tight">
                                    {vital.val || '--'}
                                    <span className="text-[9px] font-bold text-slate-600 ml-1">{vital.unit}</span>
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Trending Charts */}
                    {history && history.length > 0 && (
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-slate-800/40 p-5 rounded-xl border border-white/5">
                                <h4 className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                                    <Activity className="w-3 h-3 text-red-500" /> Heart Rate Trend
                                </h4>
                                <div className="h-32">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={history}>
                                            <Line type="monotone" dataKey="Heart_Rate" stroke="#ef4444" strokeWidth={2} dot={false} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', fontSize: '10px' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="bg-slate-800/40 p-5 rounded-xl border border-white/5">
                                <h4 className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                                    <Activity className="w-3 h-3 text-amber-500" /> Temperature Trend
                                </h4>
                                <div className="h-32">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={history}>
                                            <Line type="monotone" dataKey="Temperature" stroke="#f59e0b" strokeWidth={2} dot={false} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', fontSize: '10px' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Observations */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-5">
                            <div>
                                <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Patient Presentation</h3>
                                <div className="bg-slate-800/20 p-4 rounded-lg border border-white/5">
                                    <p className="text-[8px] font-bold text-slate-600 mb-1 uppercase tracking-tight">Reported Symptoms</p>
                                    <p className="text-xs text-slate-300 font-medium">{patient.Symptoms || "No symptoms logged"}</p>
                                </div>
                            </div>
                            <div className="bg-slate-800/20 p-4 rounded-lg border border-white/5">
                                <p className="text-[8px] font-bold text-slate-600 mb-1 uppercase tracking-tight">Comorbidities</p>
                                <p className="text-xs text-slate-300 font-medium">{patient.Pre_Existing_Conditions || "No significant history"}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Clinical Documentation</h3>
                            <div className="bg-slate-900 border border-white/5 rounded-xl p-4 text-[11px] text-slate-400 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed scrollbar-thin">
                                {patient.Medical_Notes || "// No digital health records linked."}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 flex gap-3 bg-white/5">
                    <button
                        onClick={() => {
                            const roomName = `Omnitriage-${patient.Patient_ID}`;
                            window.open(`https://meet.jit.si/${roomName}`, '_blank');
                        }}
                        className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-blue-500/10"
                    >
                        <Video className="w-4 h-4" />
                        Video Consultation
                    </button>
                    <button
                        onClick={() => {
                            alert("Subject marked as resolved.");
                            onClose();
                        }}
                        className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all border border-white/5 active:scale-95"
                    >
                        Mark Resolved
                    </button>
                </div>
            </div>
        </div>
    );
};

const LiveDashboard = ({ patients, currentDoctor, selectedPatient, onSelectPatient }) => {
    const [activeTab, setActiveTab] = useState('my_queue'); // 'my_queue' | 'all'
    const [filterDoctor, setFilterDoctor] = useState(null); // Filter by clicked doctor

    const [livePatients, setLivePatients] = useState(patients);
    const [vitalsHistory, setVitalsHistory] = useState({});
    const ws = useRef(null);

    useEffect(() => {
        setLivePatients(patients);
    }, [patients]);

    // WebSocket Connection
    useEffect(() => {
        ws.current = new WebSocket("ws://localhost:8000/ws/vitals");
        ws.current.onmessage = (event) => {
            try {
                const updatedPatients = JSON.parse(event.data);
                if (Array.isArray(updatedPatients)) {
                    setLivePatients(updatedPatients);
                    setVitalsHistory(prevHistory => {
                        const newHistory = { ...prevHistory };
                        const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                        updatedPatients.forEach(p => {
                            // Deep copy the array to avoid mutating state
                            const currentHistory = newHistory[p.Patient_ID] ? [...newHistory[p.Patient_ID]] : [];
                            currentHistory.push({ time: timestamp, Heart_Rate: p.Heart_Rate, Temperature: p.Temperature, O2_Saturation: p.O2_Saturation, BP_Systolic: p.BP_Systolic });
                            if (currentHistory.length > 20) currentHistory.shift();
                            newHistory[p.Patient_ID] = currentHistory;
                        });
                        return newHistory;
                    });
                }
            } catch (err) { console.error("Error parsing WS message:", err); }
        };
        return () => { if (ws.current) ws.current.close(); };
    }, []);

    const [itemsPerPage] = useState(9); // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Filter Logic
    let displayPatients = livePatients;
    if (filterDoctor) {
        displayPatients = livePatients.filter(p => p.Assigned_Doctor === filterDoctor);
    } else if (activeTab === 'my_queue' && currentDoctor) {
        displayPatients = livePatients.filter(p => p.Assigned_Doctor === currentDoctor.name);
    }

    displayPatients = [...displayPatients].sort((a, b) => {
        const getRiskVal = (p) => {
            const r = p.Predicted_Risk || p.Risk_Level || 'Low';
            if (r === 'High') return 0;
            if (r === 'Medium') return 1;
            return 2;
        };
        return getRiskVal(a) - getRiskVal(b);
    });

    const totalPages = Math.ceil(displayPatients.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentPatients = displayPatients.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
    };

    const handleDoctorClick = (doctorName) => {
        setFilterDoctor(doctorName);
        setCurrentPage(1);
    };

    return (
        <div className="h-full flex flex-col pt-2">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-5">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-600/10 p-2.5 rounded-xl border border-blue-500/20">
                            <Users className="w-6 h-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                            {filterDoctor ? `Clinician: ${filterDoctor}` : 'Patient Triage Stream'}
                        </h2>
                    </div>

                    {filterDoctor ? (
                        <button
                            onClick={() => setFilterDoctor(null)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all"
                        >
                            <X className="w-3 h-3" /> Clear Filter
                        </button>
                    ) : (
                        currentDoctor && (
                            <div className="flex bg-slate-800/40 p-1 rounded-xl border border-white/5 ml-2">
                                <button
                                    onClick={() => { setActiveTab('my_queue'); setCurrentPage(1); }}
                                    className={`px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'my_queue' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    My Queue ({Array.isArray(patients) ? patients.filter(p => p.Assigned_Doctor === currentDoctor.name).length : 0})
                                </button>
                                <button
                                    onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
                                    className={`px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'all' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    All Patients ({Array.isArray(patients) ? patients.length : 0})
                                </button>
                            </div>
                        )
                    )}
                </div>

                <div className="flex gap-4 text-[9px] font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-2 text-slate-400"><span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></span> High Risk</span>
                    <span className="flex items-center gap-2 text-slate-400"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Medium</span>
                    <span className="flex items-center gap-2 text-slate-400"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Stable</span>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto pr-4 pb-12 scrollbar-thin">
                {currentPatients.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-white/10 rounded-[3rem] bg-white/2">
                        <Users className="w-20 h-20 mb-6 opacity-20" />
                        <p className="font-black uppercase tracking-[0.3em] text-sm">No Active Subjects Detected</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {currentPatients.map((patient, index) => (
                            <div key={patient.Patient_ID || index} onClick={() => onSelectPatient(patient)} className="cursor-pointer">
                                <PatientCard patient={patient} onDoctorClick={handleDoctorClick} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-between items-center py-8 px-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        Previous Node
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Sector <span className="text-white text-sm">{currentPage}</span> / {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        Next Node
                    </button>
                </div>
            )}

            <PatientDetailModal
                patient={selectedPatient ? livePatients.find(p => p.Patient_ID === selectedPatient.Patient_ID) : null}
                history={selectedPatient ? vitalsHistory[selectedPatient.Patient_ID] : []}
                onClose={() => onSelectPatient(null)}
            />
        </div>
    );
};

export default LiveDashboard;
