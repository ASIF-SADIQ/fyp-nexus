import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FaInbox,
  FaProjectDiagram,
  FaFileAlt,
  FaSpinner,
  FaUsers,
  FaGraduationCap,
  FaClock,
  FaExternalLinkAlt,
  FaUserCheck,
  
  FaUserTimes,
} from "react-icons/fa";
import api from "../../services/api";

const SupervisionRequests = ({ userInfo, refreshDashboard }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/projects/supervisor/dashboard");
      setRequests(data.pendingRequests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to fetch supervision requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (projectId, action) => {
    try {
      setProcessingId(projectId);

      const response = await api.put(
        `/projects/${projectId}/respond-request`,
        { action }
      );

      if (response.status === 200) {
        toast.success(
          action === "Accept"
            ? "Group accepted successfully!"
            : "Invitation declined."
        );

        setRequests((prev) =>
          prev.filter((project) => project._id !== projectId)
        );

        if (refreshDashboard) refreshDashboard();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <FaSpinner className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading supervision requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Supervision Requests
          </h2>
          <p className="text-gray-600 mt-1">
            Review and respond to student project proposals
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl">
          <FaInbox className="text-blue-600" />
          <span className="text-sm font-bold text-blue-600">
            {requests.length} pending
          </span>
        </div>
      </div>

      {/* Empty State */}
      {requests.length === 0 ? (
        <div className="bg-white p-16 rounded-xl border text-center shadow">
          <FaInbox className="text-6xl text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No Pending Requests
          </h3>
          <p className="text-gray-600">
            All caught up! No new supervision requests at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {requests.map((request, index) => (
            <motion.div
              key={request._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-xl border shadow hover:shadow-lg transition"
            >
              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {request.title}
              </h3>

              <div className="flex items-center gap-3 mb-4 text-sm text-gray-500">
                <FaClock />
                {new Date(request.createdAt).toLocaleDateString()}
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-6">
                {request.description || "No description provided."}
              </p>

              {/* Domain & Tech */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1 text-blue-700 text-xs font-bold uppercase">
                    <FaGraduationCap />
                    Domain
                  </div>
                  <p className="text-sm font-semibold text-blue-900">
                    {request.domain || "N/A"}
                  </p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1 text-green-700 text-xs font-bold uppercase">
                    <FaProjectDiagram />
                    Technologies
                  </div>
                  <p className="text-sm font-semibold text-green-900">
                    {request.technologies || "N/A"}
                  </p>
                </div>
              </div>

              {/* Proposal Document */}
              {request.proposalDocument && (
                <a
                  href={request.proposalDocument}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg mb-6 transition"
                >
                  <FaFileAlt />
                  <span className="text-sm font-semibold">
                    View Proposal
                  </span>
                  <FaExternalLinkAlt size={12} />
                </a>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction(request._id, "Accept")}
                  disabled={processingId === request._id}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processingId === request._id ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <>
                      <FaUserCheck />
                      Accept
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleAction(request._id, "Decline")}
                  disabled={processingId === request._id}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processingId === request._id ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <>
                      <FaUserTimes />
                      Decline
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupervisionRequests;