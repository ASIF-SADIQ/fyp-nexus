import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie
} from 'recharts';
import { 
  FaCheckCircle, FaTasks, FaPlus, FaUserCircle, 
  FaChartPie, FaChartBar, FaCommentDots 
} from 'react-icons/fa';
import api from "../../services/api";
import { toast } from 'react-toastify';

const ProjectAnalytics = ({ project, onRefresh }) => {
  const [newTask, setNewTask] = useState({ title: '', assignedTo: '', priority: 'Medium' });
  const [isAdding, setIsAdding] = useState(false);

  // Modal state for Supervisor Feedback
  const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, taskId: null, currentFeedback: '' });

  // 🔐 Check who is currently logged in
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
  const isSupervisor = userInfo.role === 'supervisor' || userInfo.role === 'teacher';

  // Stats calculation logic
  const stats = useMemo(() => {
    if (!project?.tasks) return { total: 0, completed: 0, progress: 0, memberStats: [] };

    const total = project.tasks.length;
    const completed = project.tasks.filter(t => t.status === 'Done').length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    const memberMap = {};
    const allMembers = [project.leader, ...(project.members || [])];
    
    allMembers.forEach(m => {
      if (m?._id) {
        memberMap[m._id] = { name: m.name.split(' ')[0], completed: 0, pending: 0 };
      }
    });

    project.tasks.forEach(t => {
      const assigneeId = t.assignedTo?._id || t.assignedTo; 
      if (assigneeId && memberMap[assigneeId]) {
        if (t.status === 'Done') memberMap[assigneeId].completed += 1;
        else memberMap[assigneeId].pending += 1;
      }
    });

    return { total, completed, progress, memberStats: Object.values(memberMap) };
  }, [project]);

  // Loading guard to prevent Recharts from crashing when project data is missing
  if (!project || !project.tasks) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-400 bg-white rounded-[2.5rem] border border-slate-100">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
        <p className="font-black text-[10px] uppercase tracking-widest">Initialising Analytics...</p>
      </div>
    );
  }

  // Handle manual task addition
  const handleAddTask = async () => {
    if (!newTask.title || !newTask.assignedTo) return toast.warning("Please fill all fields");
    try {
      await api.post(`/projects/${project._id}/tasks`, newTask);
      setNewTask({ title: '', assignedTo: '', priority: 'Medium' });
      setIsAdding(false);
      onRefresh();
      toast.success("Task added to backlog");
    } catch (err) { 
      toast.error("Failed to add task"); 
    }
  };

  // Toggle task status
  const toggleTaskStatus = async (taskId, currentStatus) => {
    if (isSupervisor) return; 
    try {
      const newStatus = currentStatus === 'Done' ? 'To Do' : 'Done';
      await api.patch(`/projects/${project._id}/tasks/${taskId}`, { status: newStatus });
      onRefresh();
    } catch (err) { 
      toast.error("Status update failed"); 
    }
  };

  // Submit Supervisor Feedback
  const submitFeedback = async () => {
    const pId = project?._id || project?.id;
    const tId = feedbackModal.taskId;

    if (!pId || !tId) {
      return toast.error("Technical Error: Missing IDs. Please refresh.");
    }

    try {
      const { data } = await api.patch(`/projects/${pId}/tasks/${tId}/feedback`, { 
        feedback: feedbackModal.currentFeedback 
      });
      
      toast.success("Feedback saved successfully!");
      setFeedbackModal({ isOpen: false, taskId: null, currentFeedback: '' });
      
      if (onRefresh) {
        onRefresh(); 
      }
    } catch (err) {
      console.error("Save failed:", err);
      toast.error(err.response?.data?.message || "Error saving feedback");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* 📊 VISUAL DASHBOARD SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center relative min-h-[400px]">
           <div className="absolute top-6 left-8 flex items-center gap-2">
              <FaChartPie className="text-blue-500" />
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Completion</h3>
           </div>
           
           <div className="w-full h-64 relative mt-4">
             <ResponsiveContainer width="100%" height="100%" minWidth={0}>
               <PieChart>
                 <Pie
                   data={[
                     { name: 'Done', value: stats.completed },
                     { name: 'Remaining', value: stats.total - stats.completed }
                   ]}
                   cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none"
                 >
                   <Cell key="cell-0" fill="#10B981" />
                   <Cell key="cell-1" fill="#F1F5F9" />
                 </Pie>
                 <Tooltip cornerRadius={12} contentStyle={{ border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black text-slate-800">{stats.progress}%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Progress</span>
             </div>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative min-h-[400px]">
           <div className="flex items-center gap-2 mb-6">
              <FaChartBar className="text-indigo-500" />
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workload Distribution</h3>
           </div>
           
           <div className="w-full h-64">
             <ResponsiveContainer width="100%" height="100%" minWidth={0}>
               <BarChart data={stats.memberStats} barSize={32}>
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} />
                 <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                 <Bar dataKey="completed" name="Completed" stackId="a" fill="#3B82F6" radius={[0, 0, 4, 4]} />
                 <Bar dataKey="pending" name="In Progress" stackId="a" fill="#E2E8F0" radius={[6, 6, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* 📋 TASK MANAGEMENT SECTION */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner"><FaTasks size={20} /></div>
              <div>
                <h3 className="text-lg font-black text-slate-800">Project Backlog</h3>
                <p className="text-xs text-slate-400 font-medium">
                  {isSupervisor ? "Monitor team task completion" : "Manage tasks generated by AI"}
                </p>
              </div>
           </div>
           
           {!isSupervisor && (
             <button 
               onClick={() => setIsAdding(!isAdding)}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 isAdding ? 'bg-red-50 text-red-500' : 'bg-slate-900 text-white hover:shadow-lg'
               }`}
             >
               {isAdding ? 'Cancel' : <><FaPlus /> Create Manual Task</>}
             </button>
           )}
        </div>

        {isAdding && !isSupervisor && (
          <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 animate-in slide-in-from-top-4">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                  type="text" placeholder="Task description..." 
                  className="p-4 bg-white rounded-2xl border-none text-sm font-bold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                />
                <select 
                  className="p-4 bg-white rounded-2xl border-none text-sm font-bold shadow-sm outline-none"
                  value={newTask.assignedTo}
                  onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}
                >
                   <option value="">Select Member...</option>
                   {[project.leader, ...(project.members || [])].map(m => (
                     <option key={m?._id} value={m?._id}>{m?.name}</option>
                   ))}
                </select>
                <button onClick={handleAddTask} className="bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all">
                  Add to List
                </button>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
           {project.tasks?.length > 0 ? [...project.tasks].reverse().map((task, i) => (
             <div key={task._id || i} className="group flex flex-col p-5 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 transition-all">
                
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                     <button 
                       onClick={() => toggleTaskStatus(task._id, task.status)}
                       disabled={isSupervisor} 
                       className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                         task.status === 'Done' ? 'bg-emerald-500 border-emerald-500 text-white' : 
                         isSupervisor ? 'border-slate-200 text-transparent cursor-not-allowed' : 
                         'border-slate-200 text-transparent hover:border-blue-400'
                       }`}
                     >
                       <FaCheckCircle size={14} />
                     </button>
                     <div>
                        <p className={`text-sm font-bold transition-all ${task.status === 'Done' ? 'text-slate-300 line-through' : 'text-slate-800'}`}>
                          {task.title}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-1">
                           {task.assignedTo ? (
                             <span className="flex items-center gap-1 text-[9px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md uppercase">
                               <FaUserCircle /> {task.assignedTo.name || 'Member'}
                             </span>
                           ) : (
                             <span className="flex items-center gap-1 text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md uppercase">
                               Unassigned
                             </span>
                           )}
                           <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${
                             task.status === 'Done' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                           }`}>
                             {task.status}
                           </span>
                        </div>
                     </div>
                  </div>

                  {isSupervisor && (
                    <button 
                    onClick={() => setFeedbackModal({ 
                        isOpen: true, 
                        taskId: task._id, 
                        currentFeedback: task.feedback || '' 
                         })}
                        className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-purple-100 transition-all opacity-0 group-hover:opacity-100"
                         >
                    <FaCommentDots /> {task.feedback ? 'Edit Note' : 'Add Note'}
                       </button>
                  )}
                </div>

                {/* Feedback Display - Simplified for reliability */}
                {task.feedback && (
                  <div className="mt-4 ml-11 p-4 bg-purple-50 border border-purple-100 rounded-2xl text-[13px] text-purple-900 font-medium relative shadow-sm">
                    <div className="absolute -top-1.5 left-4 w-3 h-3 bg-purple-50 border-t border-l border-purple-100 rotate-45"></div>
                    <div className="flex items-center gap-2 mb-1">
                        <strong className="font-black uppercase tracking-widest text-[9px] text-purple-600">Supervisor Note</strong>
                        <div className="h-px flex-1 bg-purple-100"></div>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{String(task.feedback)}</p>
                  </div>
                )}
             </div>
           )) : (
             <div className="text-center py-16 text-slate-400 font-bold italic text-sm">
               {isSupervisor ? "No tasks generated yet. Waiting on the student team." : "No tasks available. Use the Roadmap tab to generate them with AI!"}
             </div>
           )}
        </div>
      </div>

      {/* 🌟 FEEDBACK MODAL */}
      {feedbackModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <FaCommentDots size={22} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Supervisor Feedback</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Update task guidance</p>
              </div>
            </div>
            
            <textarea
              className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-sm font-semibold outline-none focus:border-purple-500 focus:bg-white transition-all min-h-[180px] resize-none"
              placeholder="What should the students know about this task?..."
              value={feedbackModal.currentFeedback}
              onChange={(e) => setFeedbackModal({...feedbackModal, currentFeedback: e.target.value})}
            ></textarea>
            
            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => setFeedbackModal({ isOpen: false, taskId: null, currentFeedback: '' })} 
                className="px-8 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={submitFeedback} 
                className="px-10 py-4 bg-purple-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-700 transition-all shadow-xl shadow-purple-200 active:scale-95"
              >
                Publish Feedback
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProjectAnalytics;