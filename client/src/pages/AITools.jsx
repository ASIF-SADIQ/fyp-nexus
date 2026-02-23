import React, { useState } from "react";
import { FaMagic, FaRobot, FaLightbulb, FaCopy, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const AITools = () => {
  const navigate = useNavigate();
  const [interest, setInterest] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // --- MOCK AI GENERATOR ---
  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    setTimeout(() => {
      const mockIdeas = [
        {
          title: `Smart ${interest} Management System`,
          tech: "MERN Stack, Python, IoT",
          desc: `A comprehensive platform to automate ${interest} tasks using AI-driven analytics. Features include real-time monitoring and predictive reporting.`
        },
        {
          title: `Blockchain-Based ${interest} Verifier`,
          tech: "Solidity, React, Node.js",
          desc: `A decentralized application (DApp) that ensures transparency and security in the ${interest} sector by recording transactions on an immutable ledger.`
        },
        {
          title: `AI-Powered ${interest} Assistant`,
          tech: "TensorFlow, React Native, Firebase",
          desc: `A mobile application that uses Natural Language Processing (NLP) to help users navigate complex ${interest} challenges instantly.`
        }
      ];

      const randomIdea = mockIdeas[Math.floor(Math.random() * mockIdeas.length)];
      setResult(randomIdea);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans flex flex-col items-center">
      
      {/* Back Button */}
      <div className="w-full max-w-3xl mb-4">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium transition"
        >
          <FaArrowLeft /> Back to Dashboard
        </button>
      </div>

      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 flex justify-center items-center gap-3">
            <span className="bg-blue-100 text-blue-600 p-3 rounded-2xl"><FaRobot /></span> 
            FYP TeamUp <span className="text-blue-600">AI Wizard</span>
          </h1>
          <p className="text-gray-500 mt-3 text-lg">
            Stuck on ideas? Tell us your field, and our AI will generate a winning FYP proposal.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                What is your domain of interest?
              </label>
              <input
                type="text"
                placeholder="e.g. Healthcare, Finance, Agriculture, Education..."
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="w-full p-4 text-lg border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                loading 
                  ? "bg-blue-300 cursor-wait" 
                  : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30 hover:scale-[1.01]"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Proposal...
                </>
              ) : (
                <>
                  <FaMagic /> Generate Idea
                </>
              )}
            </button>
          </form>
        </div>

        {/* Result Section */}
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-gradient-to-br from-blue-900 to-indigo-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-blue-300 font-bold text-xs uppercase tracking-widest mb-4">
                <FaLightbulb /> AI Suggestion
              </div>
              
              <h2 className="text-3xl font-bold mb-4">{result.title}</h2>
              
              <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md mb-6 border border-white/10 text-gray-100 leading-relaxed">
                {result.desc}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-blue-300 font-bold uppercase mb-2">Recommended Tech Stack</p>
                  <div className="flex flex-wrap gap-2">
                    {result.tech.split(',').map((t, i) => (
                      <span key={i} className="px-3 py-1 bg-black/20 rounded-lg text-xs font-medium border border-white/10 text-blue-100">
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={() => navigator.clipboard.writeText(`${result.title}: ${result.desc}`)}
                  className="p-3 bg-white text-blue-900 rounded-xl hover:bg-blue-50 transition-colors self-start sm:self-center shadow-md" 
                  title="Copy to Clipboard"
                >
                  <FaCopy />
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default AITools;