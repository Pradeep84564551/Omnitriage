import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, AlertTriangle, ShieldCheck, X } from 'lucide-react';
import axios from 'axios';

const BiasDashboard = ({ onClose }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('http://localhost:8000/bias_stats');
                setStats(response.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load bias statistics.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const transformGenderData = (data) => {
        if (!data) return [];
        return Object.keys(data).map(gender => ({
            name: gender,
            High: data[gender]['High'] || 0,
            Medium: data[gender]['Medium'] || 0,
            Low: data[gender]['Low'] || 0
        }));
    };

    const transformAgeData = (data) => {
        if (!data) return [];
        return Object.keys(data).map(ageGroup => ({
            name: ageGroup,
            High: data[ageGroup]['High'] || 0,
            Medium: data[ageGroup]['Medium'] || 0,
            Low: data[ageGroup]['Low'] || 0
        }));
    };

    const COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-indigo-600" />
                            AI Fairness & Bias Analysis
                        </h2>
                        <p className="text-sm text-slate-500">Monitoring algorithmic fairness across demographics.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin w-12 h-12 text-indigo-500 mb-4" />
                        <p className="text-slate-500 font-medium">Analyzing Fairness Metrics...</p>
                    </div>
                ) : error ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-red-500">
                        <AlertTriangle className="w-12 h-12 mb-4" />
                        <p className="font-bold">{error}</p>
                    </div>
                ) : (
                    <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Gender Bias Chart */}
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                                Risk Distribution by Gender
                            </h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={transformGenderData(stats.gender_risk)}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ fill: '#f1f5f9' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="High" stackId="a" fill={COLORS.High} radius={[0, 0, 4, 4]} />
                                        <Bar dataKey="Medium" stackId="a" fill={COLORS.Medium} />
                                        <Bar dataKey="Low" stackId="a" fill={COLORS.Low} radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-xs text-slate-500 mt-4 leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
                                <strong>Insight:</strong> This chart compares the proportion of risk levels assigned to different genders. Significant disparities in "High Risk" assignments may indicate model bias.
                            </p>
                        </div>

                        {/* Age Bias Chart */}
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
                                Risk Distribution by Age Group
                            </h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={transformAgeData(stats.age_risk)}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ fill: '#f1f5f9' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="High" stackId="a" fill={COLORS.High} radius={[0, 0, 4, 4]} />
                                        <Bar dataKey="Medium" stackId="a" fill={COLORS.Medium} />
                                        <Bar dataKey="Low" stackId="a" fill={COLORS.Low} radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-xs text-slate-500 mt-4 leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
                                <strong>Insight:</strong> Breakdowns by age group (0-18, 19-35, etc.) help ensure the model isn't systematically over-diagnosing risk in specific age cohorts.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BiasDashboard;
