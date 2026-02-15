import React, { useState } from 'react';
import TriageForm from './TriageForm';
import PatientCard from './PatientCard';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const PatientView = () => {
    const [result, setResult] = useState(null);

    const handleTriageResult = (patientData) => {
        setResult(patientData);
    };

    const handleReset = () => {
        setResult(null);
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Patient Self-Assessment</h1>
                <p className="text-slate-500">Please provide your details for immediate AI triage.</p>
            </div>

            {!result ? (
                <div className="shadow-lg rounded-xl">
                    <TriageForm onTriageResult={handleTriageResult} className="rounded-xl" />
                </div>
            ) : (
                <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-start gap-4">
                        <div className="bg-green-100 p-2 rounded-full">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-green-800">Assessment Complete</h3>
                            <p className="text-sm font-semibold text-green-700">ID: {result.Patient_ID}</p>
                            <p className="text-green-700 mt-1">
                                Your data has been analyzed. <strong>{result.Assigned_Doctor}</strong> ({result.Department}) has been notified and sent your complete <strong>EHR Packet</strong>.
                            </p>
                        </div>
                    </div>

                    <div className="max-w-md mx-auto">
                        {/* Pass a dummy explanation if needed or rely on what's returned */}
                        <PatientCard patient={result} />
                    </div>

                    {/* Full Profile Details */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                        <h4 className="text-sm font-bold text-slate-800 uppercase mb-3">Your Medical Profile</h4>
                        <div className="space-y-4">
                            <div>
                                <h5 className="text-xs font-semibold text-slate-500 mb-1">Reported Symptoms</h5>
                                <p className="text-sm text-slate-700 font-medium">{result.Symptoms || "None reported"}</p>
                            </div>

                            {result.Pre_Existing_Conditions && (
                                <div>
                                    <h5 className="text-xs font-semibold text-slate-500 mb-1">Pre-Existing Conditions</h5>
                                    <p className="text-sm text-slate-700 font-medium">{result.Pre_Existing_Conditions}</p>
                                </div>
                            )}



                            {result.Medical_Notes && (
                                <div>
                                    <h5 className="text-xs font-semibold text-slate-500 mb-1">Medical Notes / EHR Data</h5>
                                    <div className="bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-600 font-mono whitespace-pre-wrap">
                                        {result.Medical_Notes}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h5 className="text-xs font-semibold text-slate-500 mb-1">Vitals Summary</h5>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <div className="bg-white p-2 rounded border border-slate-200">
                                        <span className="text-[10px] text-slate-400 block">BP</span>
                                        <span className="text-sm font-bold text-slate-700">{result.BP_Systolic}/{result.BP_Diastolic}</span>
                                    </div>
                                    <div className="bg-white p-2 rounded border border-slate-200">
                                        <span className="text-[10px] text-slate-400 block">Heart Rate</span>
                                        <span className="text-sm font-bold text-slate-700">{result.Heart_Rate}</span>
                                    </div>
                                    <div className="bg-white p-2 rounded border border-slate-200">
                                        <span className="text-[10px] text-slate-400 block">Temp</span>
                                        <span className="text-sm font-bold text-slate-700">{result.Temperature}°C</span>
                                    </div>
                                    <div className="bg-white p-2 rounded border border-slate-200">
                                        <span className="text-[10px] text-slate-400 block">O2 Sat</span>
                                        <span className="text-sm font-bold text-slate-700">{result.O2_Saturation}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center pt-4">
                        <button
                            onClick={handleReset}
                            className="text-slate-500 hover:text-blue-600 font-medium flex items-center justify-center gap-2 mx-auto transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Submit Another Assessment
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientView;
