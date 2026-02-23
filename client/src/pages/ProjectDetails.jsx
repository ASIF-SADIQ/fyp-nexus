import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api'; // Changed to use your standard api utility
import RoadmapTab from '../components/student/RoadmapTab';
import { toast } from 'react-toastify';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data } = await api.get(`/projects/${id}`);
        setProject(data);
      } catch (err) {
        toast.error("Failed to load project details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) return <div className="p-10 text-center animate-pulse font-bold">Loading Project Data...</div>;
  if (!project) return <div className="p-10 text-center text-red-500">Project not found.</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{project.title}</h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
            {project.domain}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
            project.status === 'Ongoing' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {project.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT & CENTER: Main Content (Tabs) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex space-x-6 border-b border-gray-200">
            {['overview', 'roadmap', 'tasks'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-2 capitalize transition-all ${
                  activeTab === tab 
                  ? 'border-b-2 border-blue-600 text-blue-600 font-bold' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[450px]">
            {activeTab === 'overview' && (
              <div className="animate-in fade-in duration-500">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Project Abstract</h2>
                <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                  {project.description}
                </p>
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-2">Technologies Used</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.split(',').map((tech, i) => (
                      <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm border border-gray-200">
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'roadmap' && (
              <RoadmapTab project={project} setProject={setProject} />
            )}

            {activeTab === 'tasks' && (
              <div className="text-center py-20">
                <p className="text-gray-400">Task Management coming in the next module...</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: Group Progress Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
              Group Progress
            </h3>
            
            <div className="space-y-8">
              {project.memberProgress && project.memberProgress.length > 0 ? (
                project.memberProgress.map((stat, index) => {
                  // Find the member details from either the members array OR the leader object
                  const isLeader = project.leader._id === stat.memberId;
                  const memberObj = isLeader 
                    ? project.leader 
                    : project.members.find(m => m._id === stat.memberId);
                  
                  return (
                    <div key={index} className="group">
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                            {memberObj?.name || 'Student'}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                            {isLeader ? 'Project Leader' : 'Team Member'}
                          </p>
                        </div>
                        <span className="text-sm font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {stat.percentage}%
                        </span>
                      </div>

                      {/* Dynamic Progress Bar */}
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-50">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
                            stat.percentage === 100 ? 'bg-green-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${stat.percentage}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between mt-2 text-[10px] font-medium text-gray-400">
                        <span>{stat.tasksDone} Tasks Done</span>
                        <span>{stat.totalTasksAssigned} Total</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 text-xs italic px-4">
                    Apply an AI Roadmap to start tracking contributions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProjectDetails;