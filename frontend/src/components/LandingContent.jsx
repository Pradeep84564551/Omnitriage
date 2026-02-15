import React from 'react';
import { Activity, Users, Building, FileText, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const LandingContent = () => {
    return (
        <div className="bg-slate-50">
            {/* About Us Section */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                id="about-us"
                className="py-20 px-6 container mx-auto"
            >
                <div className="flex flex-col md:flex-row gap-12 items-center">
                    <div className="md:w-1/2">
                        <span className="text-teal-500 font-bold tracking-widest text-xs uppercase mb-2 block">Our Mission</span>
                        <h2 className="text-4xl font-black text-slate-800 mb-6 leading-tight">
                            Redefining <span className="text-[#00b4db]">Emergency Triage</span> with AI Precision.
                        </h2>
                        <p className="text-slate-500 text-lg leading-relaxed mb-6">
                            Healtro integrates advanced machine learning with real-time vitals monitoring to prioritize patient care instantly. We bridge the gap between patient intake and doctor availability.
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="text-3xl font-bold text-[#00b4db] mb-1">98%</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accuracy Rate</p>
                            </div>
                            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="text-3xl font-bold text-[#00dfc4] mb-1">24/7</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Uptime</p>
                            </div>
                        </div>
                    </div>
                    <div className="md:w-1/2 relative">
                        <div className="w-full h-80 bg-gradient-to-tr from-slate-200 to-slate-100 rounded-3xl overflow-hidden relative">
                            <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                <Activity className="w-24 h-24 opacity-20" />
                            </div>
                        </div>
                        <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-50">
                            <div className="flex items-center gap-4">
                                <div className="bg-teal-500/10 p-3 rounded-full text-teal-500">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">HIPAA Compliant</p>
                                    <p className="text-xs text-slate-400">Secure Data Handling</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Departments Section */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                id="departments"
                className="py-20 bg-white"
            >
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-[#00b4db] font-bold tracking-widest text-xs uppercase mb-2 block">Specialized Care</span>
                        <h2 className="text-4xl font-black text-slate-800">Our Departments</h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { icon: Activity, title: 'Cardiology', desc: 'Heart health & monitoring' },
                            { icon: Users, title: 'Pediatrics', desc: 'Specialized care for children' },
                            { icon: Activity, title: 'Neurology', desc: 'Brain & nervous system' },
                            { icon: Building, title: 'Urgent Care', desc: 'Immediate emergency services' }
                        ].map((dept, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-xl border border-slate-100 transition-all group cursor-pointer">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                    <dept.icon className="w-6 h-6 text-[#00b4db]" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 mb-2">{dept.title}</h3>
                                <p className="text-sm text-slate-500">{dept.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Doctors Section */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                id="doctors"
                className="py-20 px-6 container mx-auto"
            >
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <span className="text-[#00dfc4] font-bold tracking-widest text-xs uppercase mb-2 block">The Team</span>
                        <h2 className="text-4xl font-black text-slate-800">Meet Our Specialists</h2>
                    </div>
                    <button className="hidden md:flex items-center gap-2 text-[#00b4db] font-bold hover:gap-4 transition-all">
                        View All Doctors <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { name: "Dr. Sarah Jensen", role: "Chief Cardiologist", img: "/assets/dr_sarah.png", color: "text-teal-500", hover: "hover:bg-[#00dfc4]" },
                        { name: "Dr. James Wilson", role: "Head of Pediatrics", img: "/assets/dr_james.png", color: "text-[#00b4db]", hover: "hover:bg-[#00b4db]" },
                        { name: "Dr. Emily Chen", role: "Neurology Specialist", img: "/assets/dr_emily.png", color: "text-indigo-500", hover: "hover:bg-indigo-500" }
                    ].map((doctor, index) => (
                        <div key={index} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 group">
                            <div className="h-80 bg-slate-100 relative overflow-hidden">
                                <img
                                    src={doctor.img}
                                    alt={doctor.name}
                                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="p-6 relative">
                                <h3 className="font-bold text-xl text-slate-800">{doctor.name}</h3>
                                <p className={`${doctor.color} text-sm font-bold mb-4 uppercase tracking-wider`}>{doctor.role}</p>
                                <div className="flex gap-2">
                                    <button className={`flex-1 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold ${doctor.hover} hover:text-white transition-colors`}>Profile</button>
                                    <button className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-800 hover:text-white transition-colors">Book</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.section>

            {/* Blog Section */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                id="blog"
                className="py-20 bg-slate-900 text-white"
            >
                <div className="container mx-auto px-6">
                    <div className="flex justify-between items-center mb-12">
                        <h2 className="text-3xl font-black">Latest Medical Insights</h2>
                        <button className="text-[#00dfc4] text-sm font-bold uppercase tracking-widest">Read Blog</button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="flex gap-6 items-start group cursor-pointer">
                            <div className="w-24 h-24 bg-slate-800 rounded-2xl flex-shrink-0 flex items-center justify-center group-hover:bg-[#00b4db] transition-colors">
                                <FileText className="w-8 h-8 text-slate-600 group-hover:text-white" />
                            </div>
                            <div>
                                <span className="text-[#00dfc4] text-xs font-bold uppercase tracking-widest mb-2 block">Research</span>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-[#00b4db] transition-colors">AI in Emergency Triage: A 2026 Perspective</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">How machine learning is reducing wait times by 40% in urban hospitals.</p>
                            </div>
                        </div>
                        <div className="flex gap-6 items-start group cursor-pointer">
                            <div className="w-24 h-24 bg-slate-800 rounded-2xl flex-shrink-0 flex items-center justify-center group-hover:bg-[#00dfc4] transition-colors">
                                <Activity className="w-8 h-8 text-slate-600 group-hover:text-white" />
                            </div>
                            <div>
                                <span className="text-[#00dfc4] text-xs font-bold uppercase tracking-widest mb-2 block">Technology</span>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-[#00dfc4] transition-colors">Remote Vitals Monitoring</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">The future of continuous patient care beyond the hospital walls.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Contact Section */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                id="contacts"
                className="py-20 bg-white"
            >
                <div className="container mx-auto px-6 text-center max-w-2xl">
                    <span className="text-[#00b4db] font-bold tracking-widest text-xs uppercase mb-2 block">Get in Touch</span>
                    <h2 className="text-4xl font-black text-slate-800 mb-8">Need Immediate Assistance?</h2>

                    <div className="flex justify-center gap-8 mb-12">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-[#00dfc4]">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-slate-400 font-bold uppercase">Emergency</p>
                                <p className="font-bold text-slate-800">911 / 112</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-[#00b4db]">
                                <Building className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-slate-400 font-bold uppercase">Support</p>
                                <p className="font-bold text-slate-800">+1 (555) 012-3456</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>
        </div>
    );
};

export default LandingContent;
