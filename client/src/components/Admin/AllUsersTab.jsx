import React from 'react';
import toast from 'react-hot-toast';
import { 
  FaUserCircle, FaTrash, FaShieldAlt, 
  FaUserGraduate, FaChalkboardTeacher, FaSearch 
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import api from "../../services/api";

const AllUsersTab = ({ users, searchTerm, refresh }) => {
  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to revoke access for ${user.name}? This action is irreversible.`)) return;

    const deletePromise = api.delete(`/users/${user._id}`);

    toast.promise(deletePromise, {
      loading: 'Revoking user access...',
      success: () => {
        refresh();
        return 'User purged from registry.';
      },
      error: (err) => err.response?.data?.message || 'Failed to delete user.'
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead className="bg-transparent text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <tr>
            <th className="px-6 py-4">Identity</th>
            <th className="px-6 py-4">System Role</th>
            <th className="px-6 py-4">Department</th>
            <th className="px-6 py-4 text-right">Registry Actions</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode='popLayout'>
            {filtered.map(u => (
              <motion.tr 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={u._id} 
                className="bg-white group hover:shadow-xl hover:shadow-slate-500/5 transition-all"
              >
                {/* User Identity */}
                <td className="px-6 py-4 rounded-l-[1.5rem] border-y border-l border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <FaUserCircle className="text-slate-200 text-4xl group-hover:text-blue-100 transition-colors" />
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        u.role === 'admin' ? 'bg-rose-500' : 'bg-emerald-500'
                      }`} />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-800 tracking-tight">{u.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{u.email}</div>
                    </div>
                  </div>
                </td>

                {/* Role Badge */}
                <td className="px-6 py-4 border-y border-slate-50">
                  <div className="flex">
                    <span className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                      u.role === 'admin' 
                        ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                        : u.role === 'teacher'
                        ? 'bg-blue-50 text-blue-600 border border-blue-100'
                        : 'bg-slate-50 text-slate-600 border border-slate-100'
                    }`}>
                      {u.role === 'admin' && <FaShieldAlt size={10} />}
                      {u.role === 'teacher' && <FaChalkboardTeacher size={10} />}
                      {u.role === 'student' && <FaUserGraduate size={10} />}
                      {u.role}
                    </span>
                  </div>
                </td>

                {/* Department Info */}
                <td className="px-6 py-4 border-y border-slate-50">
                  <span className="text-xs font-bold text-slate-500">{u.department || 'General'}</span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 rounded-r-[1.5rem] border-y border-r border-slate-50 text-right">
                  {u.role !== 'admin' ? (
                    <button 
                      onClick={() => handleDeleteUser(u)}
                      className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                      title="Purge User"
                    >
                      <FaTrash size={14} />
                    </button>
                  ) : (
                    <span className="text-[9px] font-black text-slate-200 uppercase tracking-widest mr-3">Protected</span>
                  )}
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>

      {filtered.length === 0 && (
        <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-50 mt-4">
          <FaSearch className="mx-auto text-slate-100 text-4xl mb-4" />
          <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No matching personnel found</p>
        </div>
      )}
    </div>
  );
};

export default AllUsersTab;