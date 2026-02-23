import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  FaMagic, FaPenFancy, FaFilePdf, FaCopy, FaArrowLeft, FaRobot, FaCheck 
} from "react-icons/fa";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProposalGenerator = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: "", techStack: "" });
  const [generatedProposal, setGeneratedProposal] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedProposal(""); // Clear previous

    try {
      const response = await fetch("http://localhost:5000/api/ai/proposal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setGeneratedProposal(data.proposal);
      } else {
        toast.error("AI Generation Failed: " + (data.message || "Unknown Error"));
      }
    } catch (error) {
      toast.error("Server Error. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedProposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

const handleExportPDF = () => {
  if (!generatedProposal) return;

  const doc = new jsPDF();
  
  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(formData.title || "Project Proposal", 20, 20);

  // Tech Stack
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Tech Stack: ${formData.techStack}`, 20, 30);

  // Main Content (Auto-wrapping text)
  doc.setTextColor(0);
  doc.setFont("times", "normal");
  doc.setFontSize(12);
  
  // This splits the long text so it fits within the page width (170mm)
  const splitText = doc.splitTextToSize(generatedProposal, 170);
  doc.text(splitText, 20, 50);

  doc.save("FYP_Proposal.pdf");
};

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/dashboard")} 
            className="p-2 rounded-full hover:bg-gray-100 transition text-gray-500 hover:text-blue-600"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 p-2 rounded-lg"><FaRobot /></span> 
            AI Proposal Architect
          </h1>
        </div>
        <div className="text-sm font-bold text-gray-400 hidden sm:block uppercase tracking-wider">
          FYP TeamUp Intelligence
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        
        {/* LEFT COLUMN: Input Control Center */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl shadow-blue-100 border border-white p-8 sticky top-28"
          >
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaPenFancy className="text-blue-600" /> Project Details
              </h2>
              <p className="text-xs text-gray-400 mt-1 font-medium">
                Provide key details to generate a professional dissertation proposal.
              </p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g. Blockchain Voting System"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-medium"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tech Stack</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Solidity, React.js, Node.js, Ganache"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none font-medium"
                  value={formData.techStack}
                  onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                  loading 
                    ? "bg-blue-300 cursor-wait" 
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30 hover:scale-[1.02]"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FaMagic /> Generate Proposal
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: The Document View */}
        <div className="lg:col-span-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col h-full"
          >
            {/* Toolbar */}
            <div className="flex justify-end items-center gap-3 mb-4 min-h-[40px]">
              {generatedProposal && (
                <>
                  <button 
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition shadow-sm"
                  >
                    {copied ? <FaCheck className="text-green-500" /> : <FaCopy />} 
                    {copied ? "Copied!" : "Copy Text"}
                  </button>
                 <button 
  onClick={handleExportPDF} // 👈 ADD THIS LINE
  className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-100 transition shadow-sm"
>
  <FaFilePdf /> Export PDF
</button>
                </>
              )}
            </div>

            {/* A4 Paper Effect */}
            <div className="bg-white min-h-[800px] shadow-2xl shadow-gray-200 rounded-lg border border-gray-100 p-12 relative overflow-hidden">
              
              {/* Top Decorative bar */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

              {loading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6 animate-pulse mt-20">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                    <FaMagic className="text-blue-400 text-3xl animate-bounce" />
                  </div>
                  <div className="space-y-3 w-full max-w-md">
                    <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto" />
                    <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto" />
                    <div className="h-4 bg-gray-100 rounded w-5/6 mx-auto" />
                  </div>
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Drafting Proposal...</p>
                </div>
              ) : generatedProposal ? (
                <article className="prose prose-slate max-w-none prose-headings:text-blue-900 prose-headings:font-bold prose-p:text-gray-600 prose-p:leading-loose">
                  {/* Render plain text with whitespace preservation */}
                  <div className="whitespace-pre-wrap font-serif text-lg text-gray-800 leading-relaxed">
                    {generatedProposal}
                  </div>
                </article>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-300 mt-20">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <FaFilePdf className="text-4xl text-gray-200" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-400">Ready to Write</h3>
                  <p className="max-w-sm mt-2 text-gray-400">Enter your project details on the left, and our AI will draft a complete university-standard proposal for you.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ProposalGenerator;