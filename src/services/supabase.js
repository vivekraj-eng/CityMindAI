// PostgREST lightweight HTTP client for Supabase database operations
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = !!(supabaseUrl && supabaseAnonKey);

const getHeaders = () => ({
  'apikey': supabaseAnonKey,
  'Authorization': `Bearer ${supabaseAnonKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
});

export const fetchComplaints = async () => {
  if (!isConfigured) {
    console.warn("Supabase credentials missing. Using local memory mock complaints.");
    return null;
  }
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/complaints?select=*&order=created_at.desc`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (!response.ok) {
      throw new Error(`Supabase REST fetch error: ${response.status}`);
    }
    const data = await response.json();
    return data.map(dbToComplaint);
  } catch (error) {
    console.error("Failed to retrieve complaints from Supabase:", error);
    return null;
  }
};

export const insertComplaint = async (complaint) => {
  if (!isConfigured) return complaint;
  try {
    const dbObj = complaintToDb(complaint);
    const response = await fetch(`${supabaseUrl}/rest/v1/complaints`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(dbObj)
    });
    if (!response.ok) {
      throw new Error(`Supabase REST insert error: ${response.status}`);
    }
    const data = await response.json();
    return dbToComplaint(data[0]);
  } catch (error) {
    console.error("Failed to insert complaint into Supabase:", error);
    return complaint;
  }
};

export const updateComplaint = async (id, updates) => {
  if (!isConfigured) return null;
  try {
    const dbUpdates = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.urgency !== undefined) dbUpdates.urgency = updates.urgency;
    if (updates.priority !== undefined) dbUpdates.urgency = updates.priority;
    if (updates.department !== undefined) dbUpdates.category = updates.department;
    dbUpdates.updated_at = new Date().toISOString();

    const response = await fetch(`${supabaseUrl}/rest/v1/complaints?id=eq.${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(dbUpdates)
    });
    if (!response.ok) {
      throw new Error(`Supabase REST update error: ${response.status}`);
    }
    const data = await response.json();
    return data && data[0] ? dbToComplaint(data[0]) : null;
  } catch (error) {
    console.error("Failed to update complaint in Supabase:", error);
    return null;
  }
};

// Data Translators
const complaintToDb = (c) => {
  const dbObj = {
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.department || c.category,
    location: c.location,
    urgency: c.priority || c.urgency,
    status: c.status,
    ai_summary: c.aiSummary,
    tags: c.tags,
    sentiment: c.sentiment,
    detected_issue: c.detectedIssue,
    recommended_action: c.recommendedAction,
    confidence: c.confidence,
    created_at: c.createdAt || new Date().toISOString(),
    updated_at: c.updatedAt || new Date().toISOString()
  };
  if (c.latitude !== undefined && c.latitude !== null) {
    dbObj.latitude = c.latitude;
  }
  if (c.longitude !== undefined && c.longitude !== null) {
    dbObj.longitude = c.longitude;
  }
  return dbObj;
};

const dbToComplaint = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category,
  location: row.location,
  urgency: row.urgency,
  priority: row.urgency,
  department: row.category,
  status: row.status,
  aiSummary: row.ai_summary,
  tags: row.tags,
  sentiment: row.sentiment,
  detectedIssue: row.detected_issue,
  recommendedAction: row.recommended_action,
  confidence: row.confidence,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  latitude: row.latitude !== undefined ? row.latitude : null,
  longitude: row.longitude !== undefined ? row.longitude : null
});
