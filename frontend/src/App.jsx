import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import TriageForm from './components/TriageForm';
import LiveDashboard from './components/LiveDashboard';
import LoginPage from './components/LoginPage';
import PatientView from './components/PatientView';
import DoctorHeader from './components/DoctorHeader';
import axios from 'axios';
import BiasDashboard from './components/BiasDashboard';
import Hero from './components/Hero';
import LandingContent from './components/LandingContent';
import { Activity } from 'lucide-react';
import Chatbot from './components/Chatbot';

// Simple Error Boundary Component
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg m-4">
          <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
          <details className="whitespace-pre-wrap text-sm opacity-80">
            {this.state.error && this.state.error.toString()}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showBias, setShowBias] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('http://localhost:8000/patients');
        const data = await response.json();
        if (Array.isArray(data)) {
          setPatients(data);
        } else {
          console.error("Received non-array patients data:", data);
        }
      } catch (err) {
        console.error("Failed to fetch patients:", err);
      }
    };
    fetchPatients();
  }, []);

  const handleLogin = (role, name, doctorData) => {
    setUserRole(role);
    setUserName(name);
    if (doctorData) setCurrentDoctor(doctorData);
  };

  const handleLogout = () => {
    setUserRole(null);
    setUserName('');
    setCurrentDoctor(null);
    setSelectedPatient(null);
  };

  const handleTriageResult = (newPatient) => {
    setPatients(prev => [newPatient, ...prev]);
    setNotification(`New Patient Triage: ${newPatient.Name || 'Anonymous'}`);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSimulate = async () => {
    setIsSimulating(!isSimulating);
  };

  const handleEmergency = (patient) => {
    setNotification(`CRITICAL: Emergency Alert for ${patient.Name}!`);
    setSelectedPatient(patient);
    setTimeout(() => setNotification(null), 8000);
  };

  useEffect(() => {
    let interval;
    if (isSimulating) {
      interval = setInterval(async () => {
        try {
          const response = await fetch('http://localhost:8000/simulate_arrival', { method: 'POST' });
          const newPatient = await response.json();
          handleTriageResult(newPatient);
        } catch (err) {
          console.error("Simulation error:", err);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-teal-500/20 overflow-x-hidden">
      <Navbar
        onSimulate={handleSimulate}
        isSimulating={isSimulating}
        userRole={userRole}
        onLogout={handleLogout}
        onOpenBias={() => setShowBias(true)}
        onHandleEmergency={() => {
          if (!Array.isArray(patients)) return;
          const highRisk = patients.find(p => p.Risk_Level === 'High' || p.Predicted_Risk === 'High');
          if (highRisk) handleEmergency(highRisk);
          else alert("No critical patients at the moment.");
        }}
        hasEmergency={Array.isArray(patients) && patients.some(p => p.Risk_Level === 'High' || p.Predicted_Risk === 'High')}
      />

      <AnimatePresence mode="wait">
        {!userRole ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full flex-grow flex flex-col"
          >
            <Hero />
            <div id="get-started" className="py-10 bg-slate-50">
              <LoginPage onLogin={handleLogin} />
            </div>
            <LandingContent />
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col flex-grow bg-slate-50"
          >
            {showBias && <BiasDashboard onClose={() => setShowBias(false)} />}

            {userRole === 'doctor' && currentDoctor && (
              <DoctorHeader
                doctor={currentDoctor}
                notifications={patients.filter(p =>
                  p.Assigned_Doctor === currentDoctor.name &&
                  (p.Risk_Level === 'High' || p.Predicted_Risk === 'High')
                )}
                myPatients={patients.filter(p => p.Assigned_Doctor === currentDoctor.name)}
                onSelectPatient={setSelectedPatient}
              />
            )}

            <main className="flex-grow container mx-auto px-6 py-10">
              {userRole === 'doctor' && (
                <div className="flex flex-col lg:flex-row gap-10">
                  <aside className="lg:w-1/3">
                    <div className="sticky top-24">
                      <TriageForm onTriageResult={handleTriageResult} />
                    </div>
                  </aside>
                  <section className="lg:w-2/3">
                    <LiveDashboard
                      patients={patients}
                      currentDoctor={currentDoctor}
                      selectedPatient={selectedPatient}
                      onSelectPatient={setSelectedPatient}
                    />
                  </section>
                </div>
              )}

              {userRole === 'patient' && (
                <div className="h-full overflow-y-auto max-w-4xl mx-auto">
                  <ErrorBoundary>
                    <PatientView />
                  </ErrorBoundary>
                </div>
              )}
            </main>

            <footer className="py-8 text-center text-slate-400 border-t border-slate-200">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                &copy; 2026 OmniTriage AI &bull; Professional Triage Ecosystem
              </p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed bottom-8 right-8 z-[100]"
          >
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex items-center gap-4 shadow-2xl">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Activity className="text-white w-4 h-4" />
              </div>
              <p className="text-sm font-semibold text-white">{notification}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Chatbot />
    </div>
  );
}

export default App;
