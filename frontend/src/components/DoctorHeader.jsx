import React, { useState } from 'react';
import { UserCog, Power, Bell, ClipboardList, ChevronRight, ChevronDown, Video } from 'lucide-react';
import axios from 'axios';

const DoctorHeader = ({ doctor, notifications = [], myPatients = [], onSelectPatient }) => {
    const [status, setStatus] = useState('Available');
    const [loading, setLoading] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showMyPatients, setShowMyPatients] = useState(false);

    const toggleAvailability = async () => {
        setLoading(true);
        const newStatus = status === 'Available' ? 'Busy' : 'Available';
        try {
            await axios.post('http://localhost:8000/toggle_availability', {
                doctor_name: doctor.name,
                status: newStatus
            });
            setStatus(newStatus);
        } catch (err) {
            console.error("Failed to update status", err);
        } finally {
            setLoading(false);
        }
    };

    const getAvatar = (name) => {
        const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'DR';
        const colors = [
            'bg-red-100 text-red-600', 'bg-green-100 text-green-600', 'bg-blue-100 text-blue-600',
            'bg-yellow-100 text-yellow-600', 'bg-purple-100 text-purple-600', 'bg-pink-100 text-pink-600',
            'bg-indigo-100 text-indigo-600', 'bg-teal-100 text-teal-600'
        ];
        const colorIndex = name ? name.length % colors.length : 0;
        return (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${colors[colorIndex]}`}>
                {initials}
            </div>
        );
    };

    return (
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center relative z-20">
            <div className="relative">
                <button
                    onClick={() => setShowMyPatients(!showMyPatients)}
                    className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-lg transition-colors outline-none text-left"
                >
                    {getAvatar(doctor.name)}
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">{doctor.name}</h2>
                        <p className="text-xs text-slate-500">{doctor.dept}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showMyPatients ? 'rotate-180' : ''}`} />
                </button>

                {/* My Patients Dropdown */}
                {showMyPatients && (
                    <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">My Assigned Patients</span>
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                {myPatients.length} Active
                            </span>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto">
                            {myPatients.length === 0 ? (
                                <div className="p-8 text-center text-slate-400">
                                    <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-xs">No patients assigned yet.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {myPatients.map((p, i) => (
                                        <div
                                            key={i}
                                            onClick={() => {
                                                onSelectPatient(p);
                                                setShowMyPatients(false);
                                            }}
                                            className="p-3 hover:bg-blue-50/50 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                                                    {p.Name || "Unknown Patient"}
                                                </span>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${(p.Predicted_Risk === 'High' || p.Risk_Level === 'High')
                                                    ? 'bg-red-50 text-red-600 border-red-100'
                                                    : (p.Predicted_Risk === 'Medium' || p.Risk_Level === 'Medium')
                                                        ? 'bg-yellow-50 text-yellow-600 border-yellow-100'
                                                        : 'bg-green-50 text-green-600 border-green-100'
                                                    }`}>
                                                    {p.Predicted_Risk || p.Risk_Level || 'Low'} Risk
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                                                <span>#{String(p.Patient_ID).slice(0, 6)}</span>
                                                <span>•</span>
                                                <span>{p.Age} yrs</span>
                                                <span>•</span>
                                                <span>{p.Gender}</span>
                                            </div>

                                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const roomName = `Omnitriage-${p.Patient_ID}`;
                                                        window.open(`https://meet.jit.si/${roomName}`, '_blank');
                                                    }}
                                                    className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold hover:bg-blue-100 transition-colors"
                                                >
                                                    <Video className="w-3 h-3" />
                                                    Video Call
                                                </button>
                                                <span className="text-[9px] text-slate-400">ID: #{String(p.Patient_ID).slice(0, 6)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-6">
                {/* Notification Badge */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-1 hover:bg-slate-100 rounded-full transition-colors outline-none"
                    >
                        <Bell className={`w-6 h-6 text-slate-400 ${notifications.length > 0 ? 'animate-pulse text-blue-500' : ''}`} />
                        {notifications.length > 0 && (
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white animate-bounce">
                                {notifications.length}
                            </span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && notifications.length > 0 && (
                        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-600">High Risk Alerts</span>
                                <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">{notifications.length} New</span>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.map((p, i) => (
                                    <div
                                        key={i}
                                        onClick={() => {
                                            onSelectPatient(p);
                                            setShowNotifications(false);
                                        }}
                                        className="p-3 border-b border-slate-50 hover:bg-blue-50 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-blue-100 text-blue-600 p-1 rounded-md">
                                                    <ClipboardList className="w-3 h-3" />
                                                </span>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-800">{p.Name || `Patient #${String(p.Patient_ID).slice(0, 8)}`}</span>
                                                    <span className="text-[9px] text-slate-400">#{String(p.Patient_ID).slice(0, 8)}</span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-red-600 uppercase bg-red-50 px-1.5 py-0.5 rounded border border-red-100">Critical</span>
                                        </div>
                                        <div className="mt-1 pl-7">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Reason for Alert</p>
                                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                                {p.explanation && p.explanation.length > 0 ? p.explanation.join(', ') : (p.Symptoms || "High Risk Factors Detected")}
                                            </p>
                                        </div>
                                        <div className="mt-2 flex justify-end">
                                            <span className="text-[10px] text-blue-600 font-bold group-hover:underline flex items-center gap-0.5">
                                                View Patient <ChevronRight className="w-3 h-3" />
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-6 w-px bg-slate-200"></div>

                <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold uppercase tracking-wide ${status === 'Available' ? 'text-green-600' : 'text-slate-400'}`}>
                        {status}
                    </span>
                    <button
                        onClick={toggleAvailability}
                        disabled={loading}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${status === 'Available' ? 'bg-green-500' : 'bg-slate-200'
                            }`}
                    >
                        <span
                            className={`${status === 'Available' ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                    </button>
                </div>
            </div>
        </div >
    );
};

export default DoctorHeader;
