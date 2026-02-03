import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { ToastProvider } from "./context/ToastContext";
import { axiosInstance } from "./utils/api";
import { Navbar } from "./components/Navbar";
import { NeuroEduBot } from "./components/NeuroEduBot";
import LoginPage from "./pages/LoginPage";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDetail from "./pages/PatientDetail";
import AnalysisPage from "./pages/AnalysisPage";
import FederatedDashboard from "./pages/FederatedDashboard";
import LearningLabPage from "./pages/LearningLabPage";
import BrainAnatomyPage from "./pages/BrainAnatomyPage";
import TumorLibraryPage from "./pages/TumorLibraryPage";
import AiArchitecturePage from "./pages/AiArchitecturePage";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function AppContent() {
  const [currentPage, setCurrentPage] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPatientId, setCurrentPatientId] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("accessToken"));

  useEffect(() => {
    if (token) {
      axiosInstance.get("/auth/users/me")
        .then((res) => {
          setCurrentUser(res.data);
          if (currentPage === "login") {
            if (res.data.role === "doctor") setCurrentPage("dashboard");
            else if (res.data.role === "student") setCurrentPage("learningLab");
          }
        })
        .catch(() => handleLogout());
    }
  }, [token]);

  const handleLogin = (newToken, user) => {
    localStorage.setItem("accessToken", newToken);
    setToken(newToken);
    setCurrentUser(user);
    if (user.role === "doctor") setCurrentPage("dashboard");
    else setCurrentPage("learningLab");
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setToken(null);
    setCurrentUser(null);
    setCurrentPage("login");
  };

  const navigateTo = (page, id = null) => {
    setCurrentPatientId(id);
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950" />
        <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar currentUser={currentUser} handleLogout={handleLogout} navigateTo={navigateTo} />

        <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
          {currentPage === "login" && <LoginPage onLogin={handleLogin} />}

          {currentUser?.role === "doctor" && (
            <>
              {currentPage === "dashboard" && <DoctorDashboard navigateTo={navigateTo} />}
              {currentPage === "patientDetail" && <PatientDetail patientId={currentPatientId} navigateTo={navigateTo} />}
              {currentPage === "analyze" && <AnalysisPage navigateTo={navigateTo} />}
              {/* FEDERATED ROUTE */}
              {currentPage === "federated" && <FederatedDashboard navigateTo={navigateTo} />}
            </>
          )}

          {currentUser?.role === "student" && (
            <>
              {currentPage === "learningLab" && <LearningLabPage navigateTo={navigateTo} />}
              {currentPage === "learning_anatomy" && <BrainAnatomyPage navigateTo={navigateTo} />}
              {currentPage === "learning_tumors" && <TumorLibraryPage navigateTo={navigateTo} />}
              {currentPage === "learning_ai" && <AiArchitecturePage navigateTo={navigateTo} />}
            </>
          )}
        </main>

        {currentUser && <NeuroEduBot />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}