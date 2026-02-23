import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { FaUserGraduate, FaChalkboardTeacher } from "react-icons/fa"; 

// Modular Components
import Sidebar from "../components/Admin/Sidebar";
import StatCards from "../components/Admin/StatCards";
import ProjectReviewTab from "../components/Admin/ProjectReviewTab";
import FacultyDirectoryTab from "../components/Admin/FacultyDirectoryTab";
import StudentRecordsTab from "../components/Admin/StudentRecordsTab";
import AllUsersTab from "../components/Admin/AllUsersTab";
import DeadlinesTab from "../components/Admin/DeadlinesTab"; 
// ✅ IMPORT NOTIFICATIONS
import NotificationsTab from "../components/student/NotificationsTab";

// Modals
import AddUserModal from "../components/AddUserModal"; 
import EditUserModal from "../components/EditUserModal"; 
import AdminFeedbackModal from "../components/Admin/AdminFeedbackModal";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("allocation");
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ students: 0, teachers: 0, projects: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [modalType, setModalType] = useState("student"); 

  // Feedback Modal State
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedProjectForFeedback, setSelectedProjectForFeedback] = useState(null);

  // Get Admin Info from LocalStorage
  const userInfo = useMemo(() => {
    try {
      const raw = localStorage.getItem("userInfo");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }, []);

  // Fetch all core data in parallel
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [projRes, userRes, statsRes] = await Promise.all([
        api.get("/projects"),
        api.get("/users"),
        api.get("/admin/stats").catch(() => ({ 
          data: { counts: { students: 0, teachers: 0, projects: 0 } } 
        }))
      ]);

      setProjects(projRes.data || []);
      setUsers(userRes.data || []);
      setStats(statsRes.data?.counts || { students: 0, teachers: 0, projects: 0 });
    } catch (error) {
      console.error("Critical Dashboard Sync Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Security Check & Initial Data Load
  useEffect(() => {
    if (!userInfo || userInfo.role !== "admin") {
      navigate("/");
      return;
    }
    fetchData();
  }, [navigate, fetchData, userInfo]);

  // Open Edit Modal Logic
  const handleEditInitiated = (user) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  // Open Feedback Modal
  const handleOpenFeedback = (project) => {
    setSelectedProjectForFeedback(project);
    setIsFeedbackModalOpen(true);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50 text-blue-600 font-bold italic animate-pulse">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        Syncing FYP Nexus...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar controls activeTab */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} projects={projects} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight capitalize">
              {activeTab === "deadlines" ? "Manage Deadlines" : activeTab.replace('-', ' ')}
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              Coordinator for <span className="text-blue-600">{userInfo?.department}</span>
            </p>
          </div>
          
          {/* ✅ UI FIX: Hide buttons on Deadlines AND Notifications tabs */}
          {activeTab !== 'deadlines' && activeTab !== 'notifications' && (
            <div className="flex gap-3">
              {/* Add Faculty Button */}
              <button 
                onClick={() => { setModalType("supervisor"); setIsAddModalOpen(true); }}
                className="bg-white text-slate-700 border-2 border-slate-100 px-5 py-3 rounded-2xl font-bold hover:border-blue-200 hover:text-blue-600 transition active:scale-95 flex items-center gap-2"
              >
                <FaChalkboardTeacher /> Add Faculty
              </button>

              {/* Add Student Button */}
              <button 
                onClick={() => { setModalType("student"); setIsAddModalOpen(true); }}
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition active:scale-95 flex items-center gap-2"
              >
                <FaUserGraduate /> Add Student
              </button>
            </div>
          )}
        </header>

        {/* Hide StatCards when in Deadlines or Notifications */}
        {activeTab !== 'deadlines' && activeTab !== 'notifications' && (
           <StatCards stats={stats} projects={projects} setActiveTab={setActiveTab} setSearchTerm={setSearchTerm} />
        )}

        {/* Global Search Interface (Hide on Deadlines/Notifications) */}
        {activeTab !== 'deadlines' && activeTab !== 'notifications' && (
          <div className="relative mb-6 max-w-lg group">
            <input 
              type="text" 
              placeholder={`Filter ${activeTab} by name, email, or ID...`} 
              className="w-full pl-6 pr-4 py-4 rounded-[1.5rem] border-2 border-transparent bg-white shadow-sm outline-none focus:border-blue-100 focus:ring-4 focus:ring-blue-50/50 font-bold transition-all" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        )}

        {/* Tab-Based Content Area */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
          
          {activeTab === "allocation" && (
            <ProjectReviewTab 
              projects={projects} 
              users={users} 
              searchTerm={searchTerm} 
              refresh={fetchData} 
              onManageStatus={handleOpenFeedback} 
            />
          )}
          
          {activeTab === "teachers" && (
            <FacultyDirectoryTab 
              projects={projects} 
              users={users} 
              searchTerm={searchTerm} 
              onEdit={handleEditInitiated} 
            />
          )}
          
          {activeTab === "students" && (
            <StudentRecordsTab 
              projects={projects} 
              users={users} 
              searchTerm={searchTerm} 
              refresh={fetchData} 
              onEdit={handleEditInitiated} 
            />
          )}
          
          {activeTab === "users" && (
            <AllUsersTab users={users} searchTerm={searchTerm} refresh={fetchData} />
          )}

          {activeTab === "deadlines" && (
            <div className="p-8">
               <DeadlinesTab />
            </div>
          )}

          {/* ✅ RENDER NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="p-8">
               <NotificationsTab />
            </div>
          )}
        </div>
      </main>

      {/* --- Global Modals --- */}
      <AddUserModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        refreshData={fetchData} 
        roleType={modalType} 
      />
      
      {isEditModalOpen && editingUser && (
        <EditUserModal 
          isOpen={isEditModalOpen} 
          onClose={handleCloseEdit} 
          refreshData={fetchData} 
          user={editingUser} 
        />
      )}

      {/* Feedback Modal */}
      <AdminFeedbackModal 
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        project={selectedProjectForFeedback}
        onUpdate={fetchData} 
      />
    </div>
  );
};

export default AdminDashboard;