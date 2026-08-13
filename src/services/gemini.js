// Service for communicating with Gemini API using fetch directly
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const getApiKey = () => {
  // Vite environment variable configuration
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

const getMockAnalysis = (categoryPreference, description) => {
  const desc = description.toLowerCase();
  let category = categoryPreference || "Roads & Infrastructure";
  let priority = "Medium";
  let department = "Roads Dept";
  let incidentTitle = "Civic Incident";
  let recommendedAction = "Schedule dispatch to inspect coordinates and report scope of work.";

  if (desc.includes('pothole') || desc.includes('road') || desc.includes('asphalt')) {
    category = 'Roads & Infrastructure';
    department = 'Roads Dept';
    incidentTitle = 'Road Pothole';
    priority = (desc.includes('huge') || desc.includes('accident') || desc.includes('danger')) ? 'Critical' : 'Medium';
    recommendedAction = 'Dispatch maintenance crew for asphalt patching.';
  } else if (desc.includes('streetlight') || desc.includes('light') || desc.includes('lamp')) {
    category = 'Lighting & Electricity';
    department = 'Electricity Dept';
    incidentTitle = 'Streetlight Outage';
    priority = (desc.includes('exposed') || desc.includes('wire') || desc.includes('live')) ? 'Critical' : 'Medium';
    recommendedAction = 'Dispatch electrical crew to replace bulb/fixture.';
  } else if (desc.includes('sewage') || desc.includes('sanitation') || desc.includes('overflow')) {
    category = 'Water & Sanitation';
    department = 'Water & Sewerage Dept';
    incidentTitle = 'Sewage Overflow';
    priority = desc.includes('homes') || desc.includes('overflowing') ? 'High' : 'Medium';
    recommendedAction = 'Dispatch water/sewage crews to resolve blockages.';
  } else if (desc.includes('garbage') || desc.includes('trash') || desc.includes('waste') || desc.includes('dump')) {
    category = 'Waste Management';
    department = 'Sanitation Dept';
    incidentTitle = 'Uncollected Waste';
    priority = 'Medium';
    recommendedAction = 'Dispatch sanitation truck for immediate collection.';
  } else if (desc.includes('wire') || desc.includes('electrical')) {
    category = 'Lighting & Electricity';
    department = 'Electricity Dept';
    incidentTitle = 'Exposed Wire Hazard';
    priority = 'Critical';
    recommendedAction = 'Cordon off area immediately and dispatch emergency repairs.';
  } else if (desc.includes('drain') || desc.includes('gutter') || desc.includes('drainage')) {
    category = 'Drainage';
    department = 'Drainage Dept';
    incidentTitle = 'Blocked Gutter';
    priority = desc.includes('flood') ? 'High' : 'Medium';
    recommendedAction = 'Dispatch crew to clean culvert and clear drainage blockages.';
  } else if (desc.includes('signal') || desc.includes('traffic')) {
    category = 'Traffic & Signals';
    department = 'Traffic Dept';
    incidentTitle = 'Traffic Light Outage';
    priority = 'High';
    recommendedAction = 'Dispatch traffic electronics engineer for signal restoration.';
  } else if (desc.includes('park') || desc.includes('space') || desc.includes('playground')) {
    category = 'Public Spaces';
    department = 'Parks & Recreation Dept';
    incidentTitle = 'Public Space Damage';
    priority = 'Low';
    recommendedAction = 'Inspect park facilities and schedule maintenance crew.';
  }

  return {
    validComplaint: true,
    incidentTitle,
    category,
    urgency: priority,
    priority,
    confidence: 95,
    department,
    locationMentioned: "Reported Location",
    problemSummary: description,
    recommendedAction,
    tags: ["mock-analysis", category.toLowerCase().replace(' & ', '-')],
    sentiment: "Negative"
  };
};

export const checkLocalCivicValidity = (description) => {
  const d = description.trim().toLowerCase();
  
  if (d.length < 10) {
    return false;
  }
  
  if (/^\d+$/.test(d)) {
    return false;
  }
  
  if (/^[a-z]\1+$/.test(d) || d.includes('asdf') || d.includes('qwerty') || d.includes('zxcv')) {
    return false;
  }
  
  const blocklist = [
    'hello', 'hi', 'test', 'asdfgh', 'what is the weather', 'i like pizza', 
    'tell me a joke', 'random text', '123456', 'weather', 'pizza', 'joke', 'testing'
  ];
  if (blocklist.some(phrase => d === phrase || d.startsWith(phrase + ' ') || d.includes('weather') || d.includes('pizza') || d.includes('joke'))) {
    return false;
  }

  const civicKeywords = [
    'pothole', 'street', 'road', 'light', 'lamp', 'wire', 'leak', 'water', 'sewage', 'overflow',
    'garbage', 'waste', 'trash', 'drain', 'flood', 'traffic', 'signal', 'park', 'pipe', 'rupture',
    'break', 'accident', 'damage', 'hazard', 'safety', 'electricity', 'blackout', 'power', 'public',
    'collect', 'infrastructure', 'sidewalk', 'curb', 'tree', 'block', 'clog', 'stench', 'dump',
    'facility', 'danger', 'exposed', 'construction', 'sign', 'broken', 'repair', 'work', 'maintenance'
  ];
  
  const hasKeyword = civicKeywords.some(kw => d.includes(kw));
  if (!hasKeyword) {
    if (d.length < 25) {
      return false;
    }
  }

  return true;
};

export const checkAmbiguity = (description) => {
  const d = description.trim().toLowerCase();
  const ambiguousPhrases = [
    'there is a problem',
    'there is a problem.',
    'something is broken',
    'something is broken.',
    'please help',
    'please help.',
    'issue reported near the road',
    'issue reported near the road.',
    'there is an issue',
    'there is an issue.'
  ];
  
  if (ambiguousPhrases.includes(d) || d === 'problem' || d === 'issue' || (d.length < 22 && (d.includes('problem') || d.includes('broken') || d.includes('issue')))) {
    return true;
  }
  return false;
};

export const analyzeComplaint = async (title, description, location, categoryPreference = null, imageData = null) => {
  const apiKey = getApiKey();
  
  // Local validation checks
  const isLocalValid = checkLocalCivicValidity(description);
  const isLocalAmbiguous = checkAmbiguity(description);

  if (isLocalAmbiguous) {
    return {
      validComplaint: false,
      clarificationRequired: true,
      errorMsg: "Could you describe the specific problem?"
    };
  }

  if (!isLocalValid) {
    return {
      validComplaint: false,
      errorMsg: "This doesn't appear to be a civic complaint. Please describe a public issue such as a road, water, sanitation, lighting, safety, drainage, or other public-service problem."
    };
  }

  if (!apiKey) {
    console.warn("VITE_GEMINI_API_KEY not configured. Falling back to Mock Triage.");
    await new Promise(resolve => setTimeout(resolve, 800));
    return getMockAnalysis(categoryPreference, description);
  }

  const prompt = `
You are an expert municipal triage assistant for a smart city grievance system.
Evaluate the following citizen complaint submission:
- Title: "${title}"
- Location: "${location}"
- Description: "${description}"
${categoryPreference ? `- User Selected Category Preference: "${categoryPreference}"` : ''}

Determine whether the input is actually a legitimate civic/public-service complaint.
A civic complaint is a report about public infrastructure or services.

If the submission is NOT a civic complaint (e.g. conversational chit-chat like "hello", "tell me a joke", "what is the weather", "I like pizza", or gibberish/meaningless text), return EXACTLY:
{
  "validComplaint": false
}

If the submission is valid, evaluate it and return a JSON object with the following fields:
{
  "validComplaint": true,
  "incidentTitle": "Short specific name of the issue (e.g. Water Main Leak, Illegal Waste Dump)",
  "category": "Must be exactly one of: 'Roads & Infrastructure', 'Water & Sanitation', 'Public Safety', 'Lighting & Electricity', 'Waste Management', 'Drainage', 'Traffic & Signals', 'Public Spaces'",
  "subcategory": "A specific subcategory string",
  "priority": "Must be exactly one of: 'Critical', 'High', 'Medium', 'Low'. Assess severity carefully.",
  "confidence": 95,
  "department": "The municipal department mapped to category. E.g. 'Roads Dept', 'Water & Sewerage Dept', 'Electricity Dept', 'Sanitation Dept', 'Traffic Dept', 'Parks & Recreation Dept'",
  "locationMentioned": "The parsed location name or address",
  "problemSummary": "A concise 1-2 sentence explanation of what is reported.",
  "recommendedAction": "Recommended action for municipal crews."
}
`;

  try {
    const parts = [{ text: prompt }];

    if (imageData) {
      parts.push({
        inlineData: {
          mimeType: imageData.mimeType,
          data: imageData.base64Data
        }
      });
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: parts }],
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
    
    if (parsed.validComplaint === false) {
      return {
        validComplaint: false,
        errorMsg: "This doesn't appear to be a civic complaint. Please describe a public issue such as a road, water, sanitation, lighting, safety, drainage, or other public-service problem."
      };
    }

    const category = parsed.category || categoryPreference || "Roads & Infrastructure";
    const deptMapping = {
      "Roads & Infrastructure": "Roads Dept",
      "Water & Sanitation": "Water & Sewerage Dept",
      "Public Safety": "Public Safety Dept",
      "Lighting & Electricity": "Electricity Dept",
      "Waste Management": "Sanitation Dept",
      "Drainage": "Drainage Dept",
      "Traffic & Signals": "Traffic Dept",
      "Public Spaces": "Parks & Recreation Dept"
    };
    const department = parsed.department || deptMapping[category] || "General Operations Dept";

    return {
      validComplaint: true,
      detectedIssue: parsed.incidentTitle || parsed.detectedIssue || title,
      category: category,
      urgency: parsed.priority || parsed.urgency || "Medium",
      priority: parsed.priority || parsed.urgency || "Medium",
      tags: parsed.tags || ["general-maintenance"],
      sentiment: parsed.sentiment || "Negative",
      aiSummary: parsed.problemSummary || parsed.aiSummary || "Citizen report triaged by operations.",
      recommendedAction: parsed.recommendedAction || "Inspect site and coordinate resolutions.",
      confidence: parsed.confidence ? `${parsed.confidence}%` : "95%",
      department: department,
      locationMentioned: parsed.locationMentioned || location
    };
  } catch (error) {
    console.error("Error communicating with Gemini API:", error);
    return getMockAnalysis(categoryPreference, description);
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

export const generateCopilotSummary = async (complaintsList) => {
  const apiKey = getApiKey();
  
  // Prepare a text representation of active complaints
  const activeComplaintsText = complaintsList
    .filter(c => c.status !== 'Resolved')
    .map(c => `- Title: "${c.title}", Location: "${c.location}", Department: "${c.category}", Urgency: "${c.urgency}"`)
    .join('\n');
    
  if (!activeComplaintsText) {
    return {
      majorIssue: "No active municipal grievances.",
      criticalCount: 0,
      hotspot: "None",
      busiestDepartment: "None",
      recommendedPriority: "Monitor municipal workspace queues."
    };
  }

  const prompt = `
You are the AI Command Co-pilot for CityMindAI, a municipal intelligence system.
Analyze the following list of active city complaints and provide a direct summary.

Active Complaints:
${activeComplaintsText}

Return a JSON object containing exactly these fields. Ensure you calculate these based strictly on the provided list:
{
  "majorIssue": "Single most prominent or frequent issue observed across reports",
  "criticalCount": integer count of issues marked 'Critical' or 'High',
  "hotspot": "Primary location or cluster area experiencing multiple complaints",
  "busiestDepartment": "The category/department with the highest number of unresolved reports",
  "recommendedPriority": "Direct operational focus recommendations (e.g. Roads infrastructure repairs or water dispatch validation)"
}
`;

  if (!apiKey) {
    // Return a locally computed fallback summary if Gemini API key is missing (Do not invent/fake data!)
    const active = complaintsList.filter(c => c.status !== 'Resolved');
    
    // Group categories
    const catCounts = {};
    active.forEach(c => { catCounts[c.category] = (catCounts[c.category] || 0) + 1; });
    let busiest = "None";
    let max = 0;
    Object.entries(catCounts).forEach(([cat, val]) => {
      if (val > max) { max = val; busiest = cat; }
    });

    // Group locations
    const locCounts = {};
    active.forEach(c => { locCounts[c.location] = (locCounts[c.location] || 0) + 1; });
    let hotspot = "None";
    let maxLoc = 0;
    Object.entries(locCounts).forEach(([loc, val]) => {
      if (val > maxLoc) { maxLoc = val; hotspot = loc; }
    });

    const critical = active.filter(c => ['high', 'critical'].includes(c.urgency?.toLowerCase())).length;

    return {
      majorIssue: active[0]?.title || "Infrastructure Maintenance",
      criticalCount: critical,
      hotspot: hotspot,
      busiestDepartment: busiest,
      recommendedPriority: busiest !== "None" ? `Prioritize dispatch responses to ${busiest}.` : "Monitor municipal workspace queues."
    };
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API generateCopilotSummary error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(text);
  } catch (error) {
    console.error("Error in generateCopilotSummary:", error);
    
    const active = complaintsList.filter(c => c.status !== 'Resolved');
    const catCounts = {};
    active.forEach(c => { catCounts[c.category] = (catCounts[c.category] || 0) + 1; });
    let busiest = "None";
    let max = 0;
    Object.entries(catCounts).forEach(([cat, val]) => {
      if (val > max) { max = val; busiest = cat; }
    });

    return {
      majorIssue: active[0]?.title || "Infrastructure Maintenance",
      criticalCount: complaintsList.filter(c => ['high', 'critical'].includes(c.urgency?.toLowerCase()) && c.status !== 'Resolved').length,
      hotspot: active[0]?.location || "Main Street & 5th Ave",
      busiestDepartment: busiest,
      recommendedPriority: "Focus dispatch resources on resolving critical roadway pothole hazards."
    };
  }
};
