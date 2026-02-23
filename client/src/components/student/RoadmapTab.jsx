import React, { useState } from 'react';
import api from '../../utils/api'; // Corrected path based on your folder structure
import { toast } from 'react-toastify';

const RoadmapTab = ({ project, setProject }) => {
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [generatedRoadmap, setGeneratedRoadmap] = useState(null);
  
  const [dates, setDates] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]
  });

  // 1. Calls the generator logic (The AI/Simulation logic)
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/ai/roadmap', {
        title: project.title,
        techStack: project.technologies,
        startDate: dates.startDate,
        endDate: dates.endDate
      });
      setGeneratedRoadmap(data);
      toast.info("AI Roadmap drafted! Review the phases below.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate roadmap");
    } finally {
      setLoading(false);
    }
  };

  // 2. Calls the application logic (Saves to DB and initializes tasks/progress)
  const handleApply = async () => {
    setApplying(true);
    try {
      const { data } = await api.post('/ai/apply-roadmap', {
        projectId: project._id,
        roadmapData: generatedRoadmap 
      });

      // Update parent project state with the new roadmap, tasks, and memberProgress
      setProject(data.project); 
      setGeneratedRoadmap(null);
      toast.success("Roadmap applied! Tasks created and progress tracking enabled.");
    } catch (error) {
      toast.error("Could not save roadmap to database");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Project Roadmap</h2>
        {project.roadmap && project.roadmap.length > 0 && (
          <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-bold animate-pulse">
            Live & Tracking
          </span>
        )}
      </div>

      {/* --- 1. INITIAL SETUP (Show if no roadmap exists) --- */}
      {(!project.roadmap || project.roadmap.length === 0) && !generatedRoadmap && (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <div className="mb-4 inline-flex p-4 bg-indigo-100 rounded-full text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700">Set Project Timeline</h3>
          <p className="text-slate-500 mb-6 text-sm">AI will distribute phases between your start and end dates.</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6 max-w-md mx-auto">
            <div className="text-left w-full">
              <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Start Date</label>
              <input 
                type="date" 
                className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                value={dates.startDate}
                onChange={(e) => setDates({...dates, startDate: e.target.value})}
              />
            </div>
            <div className="text-left w-full">
              <label className="text-xs font-bold text-slate-400 ml-1 uppercase">End Date</label>
              <input 
                type="date" 
                className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                value={dates.endDate}
                onChange={(e) => setDates({...dates, endDate: e.target.value})}
              />
            </div>
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            {loading ? "Architecting Plan..." : "Generate AI Roadmap"}
          </button>
        </div>
      )}

      {/* --- 2. AI PREVIEW (Review before saving) --- */}
      {generatedRoadmap && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-amber-800 font-bold">Review AI Roadmap</p>
              <p className="text-amber-700 text-sm">Applying this will initialize tasks for all group members.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setGeneratedRoadmap(null)} className="px-4 py-2 text-slate-600 font-medium">Discard</button>
              <button 
                onClick={handleApply} 
                disabled={applying}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 shadow-md disabled:opacity-50"
              >
                {applying ? "Saving..." : "Apply to Project"}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {generatedRoadmap.map((phase, idx) => (
              <div key={idx} className="relative pl-8 border-l-2 border-indigo-100 pb-2">
                <div className="absolute -left-2 top-0 w-4 h-4 bg-indigo-500 rounded-full border-4 border-white shadow-sm" />
                <h3 className="font-bold text-slate-800">{phase.phase}</h3>
                <p className="text-xs font-bold text-indigo-500 mb-3 uppercase tracking-wider">{phase.dateRange}</p>
                <div className="flex flex-wrap gap-2">
                  {phase.tasks.map((t, i) => (
                    <span key={i} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-[10px] font-medium border border-slate-200">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- 3. LIVE ROADMAP (The Vertical Timeline) --- */}
      {project.roadmap && project.roadmap.length > 0 && (
        <div className="mt-8 space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-slate-200 before:to-transparent">
          {project.roadmap.map((phase, idx) => (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-10">
              {/* Dot */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${
                phase.status === 'Completed' ? 'bg-emerald-500 text-white' : 'bg-indigo-500 text-white'
              }`}>
                {phase.status === 'Completed' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                ) : (
                  <span className="text-xs font-black">{idx + 1}</span>
                )}
              </div>
              
              {/* Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-indigo-300 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="font-bold text-slate-800 text-lg leading-tight">{phase.phase}</div>
                  <span className="shrink-0 font-mono text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold">{phase.description}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${phase.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                  <span className="text-slate-500 text-xs font-medium uppercase tracking-tighter">
                    Status: {phase.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoadmapTab;