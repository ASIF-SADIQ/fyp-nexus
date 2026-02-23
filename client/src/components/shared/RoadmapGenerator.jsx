import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FaPaperPlane, FaRobot, FaCheckCircle, FaUser } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';

const RoadmapGenerator = ({ projectId, onRefresh }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm Nexus AI. Tell me about your project, tech stack, and timeline. We'll build the perfect roadmap together!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stagedRoadmap, setStagedRoadmap] = useState(null);
  const scrollRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleChat = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    const newHistory = [...messages, userMsg];
    
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat-roadmap', { messages: newHistory });
      const aiReply = data.reply;

      // 🔍 Regex to detect JSON Roadmap in AI response
      const jsonRegex = /JSON_START([\s\S]*?)JSON_END/;
      const match = aiReply.match(jsonRegex);
      
      if (match) {
        try {
          const parsed = JSON.parse(match[1].trim());
          setStagedRoadmap(parsed);
        } catch (e) {
          console.error("JSON Parsing Error", e);
        }
      }

      setMessages([...newHistory, { role: 'assistant', content: aiReply }]);
    } catch (err) {
      toast.error("Connection to AI failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToTracker = async () => {
    try {
      await api.post('/ai/apply-roadmap', { projectId, roadmapData: stagedRoadmap });
      toast.success("Roadmap applied! Switch to the Tracker tab to see your tasks.");
      setStagedRoadmap(null); // Clear stage after success
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error("Failed to update database.");
    }
  };

  // Utility to hide the JSON block from the chat UI
  const cleanMessage = (text) => {
    return text.replace(/JSON_START[\s\S]*?JSON_END/g, '').trim();
  };

  return (
    <div className="flex flex-col h-[650px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
      {/* AI Header */}
      <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <FaRobot size={24} />
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-widest">Nexus AI Advisor</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Iterative Roadmap Chat</p>
          </div>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          return (
            <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                  isUser ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {isUser ? <FaUser /> : <FaRobot />}
                </div>
                
                <div className={`p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm overflow-hidden ${
                  isUser ? 'bg-blue-600 text-white font-medium rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                }`}>
                  {isUser ? (
                    msg.content
                  ) : (
                    /* 🔥 FIX: Wrapped ReactMarkdown in a div to hold the className */
                    <div className="markdown-body space-y-2">
                      <ReactMarkdown 
                        components={{
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc ml-5 mb-2 space-y-1" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal ml-5 mb-2 space-y-1" {...props} />,
                          li: ({node, ...props}) => <li className="" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-slate-900" {...props} />,
                          h3: ({node, ...props}) => <h3 className="font-bold text-slate-900 mt-3 mb-1" {...props} />,
                        }}
                      >
                        {cleanMessage(msg.content)}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {loading && <div className="text-[10px] font-black text-slate-400 animate-pulse ml-12">NEXUS IS THINKING...</div>}
        <div ref={scrollRef} />
      </div>

      {/* Roadmap Staging Area */}
      {stagedRoadmap && (
        <div className="mx-6 mb-4 p-5 bg-emerald-50 border border-emerald-100 rounded-3xl animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Roadmap Ready</p>
              <h4 className="text-sm font-bold text-slate-800">{stagedRoadmap.length} Phases Generated</h4>
            </div>
            <button 
              onClick={handleApplyToTracker}
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2"
            >
              <FaCheckCircle /> Apply to Tracker
            </button>
          </div>
        </div>
      )}

      {/* Input Field */}
      <div className="p-6 bg-white border-t border-slate-100 flex gap-3">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., 'Make Phase 1 longer' or 'I use Flutter'..."
          className="flex-1 bg-slate-100 border-none rounded-2xl px-6 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleChat()}
        />
        <button 
          onClick={handleChat}
          disabled={loading}
          className="bg-slate-900 text-white p-5 rounded-2xl hover:bg-blue-600 transition-all shadow-lg hover:shadow-blue-200 disabled:opacity-50 flex items-center justify-center"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default RoadmapGenerator;