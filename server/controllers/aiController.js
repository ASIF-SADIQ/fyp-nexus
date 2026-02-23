const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');

// 🔥 IMPORT THE NEW 2026 SDK
const { GoogleGenAI } = require('@google/genai');

const ai = process.env.GEMINI_API_KEY 
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) 
  : null;

// Helper function to format dates
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * @desc    INTERACTIVE CHATBOT: Refine roadmap through conversation
 * @route   POST /api/ai/chat-roadmap
 */
const chatRoadmap = asyncHandler(async (req, res) => {
  const { messages } = req.body;

  if (!ai) {
    return res.status(500).json({ message: "GEMINI_API_KEY not configured." });
  }

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ message: "Invalid message format." });
  }

  try {
    let fullPrompt = `You are an expert technical Project Manager helping a student with their Final Year Project.

Rules:
1. Be conversational.
2. When user asks for final roadmap, output JSON wrapped in JSON_START and JSON_END.
3. JSON format:
[{"phase":"Name","dateRange":"Start - End","tasks":["Task 1"]}]

--- CHAT HISTORY ---
`;

    messages.forEach((msg) => {
      const speaker = msg.role === 'user' ? 'Student' : 'Nexus AI';
      fullPrompt += `\n${speaker}: ${msg.content}`;
    });

    fullPrompt += `\n--- END CHAT ---\n\nNexus AI:`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    // ✅ SAFE TEXT EXTRACTION
    const reply =
      result?.candidates?.[0]?.content?.parts?.[0]?.text ||
      result?.text ||
      "No response generated.";

    return res.json({ reply });

  } catch (error) {
    console.error("🔥 Gemini Chat FULL Error:", error);
    return res.status(500).json({
      message: error.message || "AI failed to respond."
    });
  }
});

/**
 * @desc    Generate a MASSIVE Project Proposal
 * @route   POST /api/ai/proposal
 */
const generateProposal = asyncHandler(async (req, res) => {
  const { title, techStack } = req.body;

  if (ai) {
    try {
      const prompt = `You are a PhD professor. Write an extensive, multi-page Final Year Project proposal for "${title}" using "${techStack}". Include: Abstract, Introduction, Literature Review, Methodology, Feasibility, Tech Justification, Timeline, Outcomes, and Conclusion.`;
      
      // 🔥 NEW SDK SYNTAX
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
      });
      return res.json({ proposal: response.text });
    } catch (error) {
      console.log("Gemini Error, falling back to simulation.", error);
    }
  }

  const mockProposal = `
# PROJECT PROPOSAL: ${title.toUpperCase()}
## 1. ABSTRACT
This project explores the implementation of ${title} using ${techStack}...
(Simulated Content for Development Mode)
`;
  res.json({ proposal: mockProposal });
});

/**
 * @desc    Generate an Initial Roadmap (One-click Version)
 * @route   POST /api/ai/roadmap
 */
const generateRoadmap = asyncHandler(async (req, res) => {
  const { title, techStack, startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    res.status(400);
    throw new Error("Start Date and End Date are required");
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDuration = end - start;
  const daysTotal = totalDuration / (1000 * 60 * 60 * 24);

  if (daysTotal < 7) {
    res.status(400);
    throw new Error("Project duration must be at least 1 week.");
  }

  if (ai) {
    try {
      const prompt = `Create a technical roadmap for "${title}" using "${techStack}" from ${startDate} to ${endDate}. Return a JSON array EXACTLY like this: [{"phase": "Phase Name", "dateRange": "Start - End", "tasks": ["Task 1", "Task 2"]}]`;
      
      // 🔥 NEW SDK SYNTAX with JSON configuration
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: "application/json" }
      });
      
      const responseData = JSON.parse(response.text);
      return res.json(responseData.roadmap || responseData.phases || responseData);
    } catch (error) {
      console.log("AI Error, using simulation engine.", error);
    }
  }

  const phases = [
    { title: "Requirement Analysis", weight: 0.1, tasks: ["Problem Statement", "Feasibility Study"] },
    { title: "UI/UX Design", weight: 0.15, tasks: ["Wireframing", "Prototyping"] },
    { title: "Core Development", weight: 0.45, tasks: ["Backend Setup", "Frontend Integration"] },
    { title: "Testing & Review", weight: 0.3, tasks: ["Unit Testing", "Final Defense"] }
  ];

  let currentCursor = new Date(start);
  const calculatedRoadmap = phases.map((phase) => {
    const phaseDays = Math.floor(daysTotal * phase.weight);
    const phaseStart = new Date(currentCursor);
    const phaseEnd = new Date(currentCursor);
    phaseEnd.setDate(phaseEnd.getDate() + phaseDays);
    currentCursor = new Date(phaseEnd);
    currentCursor.setDate(currentCursor.getDate() + 1);

    return {
      phase: phase.title,
      dateRange: `${formatDate(phaseStart)} - ${formatDate(phaseEnd)}`,
      tasks: phase.tasks
    };
  });

  res.json(calculatedRoadmap);
});

/**
 * @desc    Apply Finalized Roadmap to Database
 * @route   POST /api/ai/apply-roadmap
 */
const applyRoadmap = asyncHandler(async (req, res) => {
  const { projectId, roadmapData } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  project.roadmap = [];
  project.tasks = [];

  roadmapData.forEach(item => {
    project.roadmap.push({
      phase: item.phase,
      description: item.dateRange,
      status: 'Pending'
    });

    item.tasks.forEach(taskTitle => {
      project.tasks.push({
        title: taskTitle,
        status: 'To Do',
        priority: 'Medium',
        assignedTo: null,
        dueDate: null
      });
    });
  });

  const allStudentIds = [
    project.leader.toString(), 
    ...project.members.map(m => m.toString())
  ];

  project.memberProgress = allStudentIds.map(studentId => ({
    memberId: studentId,
    percentage: 0,
    tasksDone: 0,
    totalTasksAssigned: 0
  }));

  await project.save();

  res.status(200).json({ 
    message: "Success! Tracker and Roadmap updated.", 
    project 
  });
});

module.exports = { 
  chatRoadmap,
  generateProposal, 
  generateRoadmap, 
  applyRoadmap 
};