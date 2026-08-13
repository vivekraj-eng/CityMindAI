// Service for communicating with Gemini API using fetch directly
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const getApiKey = () => {
  // Vite environment variable configuration
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

const getMockAnalysis = (categoryPreference) => {
  return {
    detectedIssue: "Triage Fallback Node",
    category: categoryPreference || "Roads & Infrastructure",
    urgency: "Medium",
    tags: ["offline-fallback", "maintenance"],
    sentiment: "Negative",
    aiSummary: "Gemini API offline or key not provided. System activated mock triage fallback.",
    recommendedAction: "Schedule dispatch to inspect coordinates and report scope of work.",
    confidence: "80%"
  };
};

export const analyzeComplaint = async (title, description, location, categoryPreference = null) => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.warn("VITE_GEMINI_API_KEY not configured. Falling back to Mock Triage.");
    // Simulate short network delay for fallback visual consistency
    await new Promise(resolve => setTimeout(resolve, 800));
    return getMockAnalysis(categoryPreference);
  }

  const prompt = `
You are an expert municipal triage assistant for a smart city grievance system.
Analyze the following citizen complaint submission:
- Title: "${title}"
- Location: "${location}"
- Description: "${description}"
${categoryPreference ? `- User Selected Category Preference: "${categoryPreference}"` : ''}

Evaluate the issue and return a JSON object with the following fields:
{
  "detectedIssue": "Short specific name of the issue (e.g. Water Main Leak, Illegal Waste Dump)",
  "category": "Must be exactly one of: 'Roads & Infrastructure', 'Water & Sanitation', 'Public Safety', 'Waste Management', 'Lighting & Electricity'",
  "urgency": "Must be exactly one of: 'High', 'Medium', 'Low'",
  "tags": ["3-4 relevant tags (e.g. drainage, pothole, sanitation, danger)"],
  "sentiment": "Must be exactly one of: 'Negative', 'Neutral', 'Positive'",
  "aiSummary": "A concise 1-2 sentence explanation of what is reported and why it requires attention.",
  "recommendedAction": "Recommended action for municipal crews (e.g. Dispatch sanitation crew to clear blockages, inspect electrical box safety)."
}
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API responded with status ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) {
      throw new Error("Empty response from Gemini API candidates.");
    }

    const parsed = JSON.parse(resultText);
    return {
      detectedIssue: parsed.detectedIssue || title,
      category: parsed.category || categoryPreference || "Roads & Infrastructure",
      urgency: parsed.urgency || "Medium",
      tags: parsed.tags || ["general-maintenance"],
      sentiment: parsed.sentiment || "Negative",
      aiSummary: parsed.aiSummary || "Citizen report triaged by operations.",
      recommendedAction: parsed.recommendedAction || "Inspect site and coordinate resolutions.",
      confidence: "95%"
    };
  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    // Graceful fallback to mock behavior
    return getMockAnalysis(categoryPreference);
  }
};

export const suggestSolution = async (complaintText) => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return {
      solution: "Fallback Directives: Dispatch inspection crew to assess location coordinates and determine appropriate repair operations."
    };
  }

  const prompt = `
You are a municipal response coordinator. Suggest a direct, actionable resolution directive for this issue:
"${complaintText}"

Provide a concise 1-2 sentence operational solution instruction for municipal crews.
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API suggestSolution error: ${response.status}`);
    }

    const data = await response.json();
    const solution = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return {
      solution: solution ? solution.trim() : "Schedule standard dispatch response."
    };
  } catch (error) {
    console.error("Error in suggestSolution:", error);
    return {
      solution: "Fallback Directives: Dispatch inspection crew to assess location coordinates and determine appropriate repair operations."
    };
  }
};
