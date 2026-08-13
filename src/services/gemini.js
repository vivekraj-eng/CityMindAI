// Service for communicating with Gemini API
export const analyzeComplaint = async (complaintText, category) => {
  console.log("Analyzing complaint text:", complaintText);
  return {
    urgency: "Medium",
    category: category || "General",
    tags: ["maintenance", "public-safety"],
    sentiment: "Neutral",
    aiSummary: "The complaint reports a public issue requiring attention."
  };
};

export const suggestSolution = async (complaintText) => {
  return {
    solution: "Schedule maintenance or dispatch inspections."
  };
};
