import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudentDashboard from "./StudentDashboard"; // Renders the file you just pasted

const Dashboard = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    if (!userInfo) {
      navigate("/"); 
    } else {
      if (userInfo.role === "admin") navigate("/admin-dashboard");
      else if (userInfo.role === "supervisor") navigate("/supervisor-dashboard");
    }
  }, [navigate, userInfo]);

  // Only render Student Dashboard if role is student
  if (userInfo && userInfo.role === "student") {
      return <StudentDashboard />;
  }

  return <div className="p-10 text-center animate-pulse">Redirecting...</div>;
};

export default Dashboard;