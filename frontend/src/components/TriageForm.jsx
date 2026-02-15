import React, { useState } from 'react';
import { Upload, FileText, Check, AlertCircle, Loader2, Mic, MicOff } from 'lucide-react';
import axios from 'axios';

const TriageForm = ({ onTriageResult, className = "" }) => {
    const [formData, setFormData] = useState({
        Age: '',
        Gender: 'Male',
        BP_Systolic: '',
        BP_Diastolic: '',
        Heart_Rate: '',
        Temperature: '',
        O2_Saturation: '',
        Symptoms: '',
        Medical_Notes: '', // Store full text from PDF
        Pre_Existing_Conditions: ''
    });

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [listening, setListening] = useState(false);

    const [successMessage, setSuccessMessage] = useState(null);

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Browser does not support speech recognition.");
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onstart = () => setListening(true);
        recognition.onend = () => setListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setFormData(prev => ({
                ...prev,
                Symptoms: prev.Symptoms ? `${prev.Symptoms}, ${transcript}` : transcript
            }));
        };

        recognition.start();
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // Validate numbers
            const payload = {
                Age: parseInt(formData.Age),
                Gender: formData.Gender,
                BP_Systolic: parseInt(formData.BP_Systolic),
                BP_Diastolic: parseInt(formData.BP_Diastolic),
                Heart_Rate: parseInt(formData.Heart_Rate),
                Temperature: parseFloat(formData.Temperature),
                O2_Saturation: parseInt(formData.O2_Saturation),
                Symptoms: formData.Symptoms,
                Medical_Notes: formData.Medical_Notes,
                Pre_Existing_Conditions: formData.Pre_Existing_Conditions
            };

            const response = await axios.post('http://localhost:8000/predict', payload);

            // Combine input data with result for the card
            const patientResult = {
                ...payload,
                Patient_ID: Date.now().toString(), // Helper ID
                ...response.data
            };

            onTriageResult(patientResult);

            // Clear Form
            setFormData({
                Age: '',
                Gender: 'Male',
                BP_Systolic: '',
                BP_Diastolic: '',
                Heart_Rate: '',
                Temperature: '',
                O2_Saturation: '',
                Symptoms: '',
                Medical_Notes: '',
                Pre_Existing_Conditions: ''
            });

            // Show Success Message
            setSuccessMessage(`Patient Triaged: ${response.data.Predicted_Risk} Risk. Assigned to ${response.data.Assigned_Doctor}.`);

            // Clear success message after 5 seconds
            setTimeout(() => setSuccessMessage(null), 5000);

        } catch (err) {
            console.error(err);
            setError("Failed to process triage. Check backend connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setError("Please upload a PDF file.");
            return;
        }

        setUploading(true);
        setError(null);

        const formDataUpload = new FormData();
        formDataUpload.append('file', file);

        try {
            const response = await axios.post('http://localhost:8000/upload_doc', formDataUpload, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const extracted = response.data.extracted_data;
            const fullText = response.data.medical_notes;

            // Merge extracted data into form
            setFormData(prev => ({
                ...prev,
                ...extracted,
                Medical_Notes: fullText
            }));

        } catch (err) {
            console.error(err);
            setError("Failed to extract data from document.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={`bg-white border border-slate-100 rounded-2xl p-6 ${className} relative overflow-hidden shadow-xl`}>
            {/* Background enhancement */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />

            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between tracking-tight">
                <span className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg border border-blue-100 text-blue-600">
                        <FileText className="w-5 h-5" />
                    </div>
                    New Patient Entry
                </span>
                {formData.Medical_Notes && (
                    <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest flex items-center gap-1">
                        <Check className="w-3 h-3" /> EHR Linked
                    </span>
                )}
            </h2>

            {/* File Upload Area */}
            <div className="mb-6">
                <label
                    className="group block w-full border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer relative"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleFileUpload({ target: { files: e.dataTransfer.files } });
                        }
                    }}
                >
                    <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 rounded-full bg-slate-100 group-hover:bg-blue-50 transition-colors">
                            {uploading ? (
                                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                            ) : (
                                <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
                            )}
                        </div>
                        <div>
                            <span className="block text-xs font-bold text-slate-600 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                                {uploading ? "Analyzing Records..." : "Source EMR PDF"}
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-0.5 block">
                                Auto-fill vitals from documentation
                            </span>
                        </div>
                    </div>
                </label>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-red-50 text-red-600 border border-red-100 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        {successMessage}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Age</label>
                        <input
                            type="number" name="Age" value={formData.Age} onChange={handleChange} required
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-sm"
                            placeholder="00"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Gender</label>
                        <select
                            name="Gender" value={formData.Gender} onChange={handleChange}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold appearance-none cursor-pointer text-sm"
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">BP (Systolic)</label>
                        <input
                            type="number" name="BP_Systolic" value={formData.BP_Systolic} onChange={handleChange} required
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-sm"
                            placeholder="120"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">BP (Diastolic)</label>
                        <input
                            type="number" name="BP_Diastolic" value={formData.BP_Diastolic} onChange={handleChange} required
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-sm"
                            placeholder="80"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 text-center">HR</label>
                        <input
                            type="number" name="Heart_Rate" value={formData.Heart_Rate} onChange={handleChange} required
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2.5 text-slate-900 text-center focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 text-center">Temp</label>
                        <input
                            type="number" step="0.1" name="Temperature" value={formData.Temperature} onChange={handleChange} required
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2.5 text-slate-900 text-center focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1 text-center">O2</label>
                        <input
                            type="number" name="O2_Saturation" value={formData.O2_Saturation} onChange={handleChange} required
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2.5 text-slate-900 text-center focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-sm"
                        />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2 px-1">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Symptoms</label>
                        <button
                            type="button"
                            onClick={startListening}
                            className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md transition-all border ${listening
                                ? 'bg-red-50 text-red-500 border-red-200'
                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-blue-600 hover:border-blue-200'
                                }`}
                        >
                            {listening ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                            {listening ? 'Active' : 'Voice'}
                        </button>
                    </div>
                    <textarea
                        name="Symptoms" value={formData.Symptoms} onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white outline-none transition-all h-20 resize-none font-medium text-xs scrollbar-thin"
                        placeholder="Describe patient condition..."
                    />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest flex justify-center items-center gap-2 border ${loading
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-transparent'
                            : 'bg-blue-500 hover:bg-blue-600 text-white border-blue-600/20 shadow-lg shadow-blue-500/20 active:scale-95'
                            }`}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Run Triage Analysis
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TriageForm;
