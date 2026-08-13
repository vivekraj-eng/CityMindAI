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

// Mock user store helper
const getMockUsers = () => {
  const local = localStorage.getItem('citymind_registered_users');
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {}
  }
  return [
    { email: 'guest@citymind.ai', password: 'guest', name: 'Guest Citizen', role: 'Citizen' },
    { email: 'admin@citymind.ai', password: 'admin', name: 'City Admin', role: 'Authority' }
  ];
};

const mockSignIn = (email, password) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Please enter a valid email address.');
  }
  const list = getMockUsers();
  const found = list.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!found) {
    throw new Error('No account found with this email.');
  }
  if (found.password !== password) {
    throw new Error('Incorrect password. Please try again.');
  }
  return {
    user: { name: found.name, email: found.email, role: found.role }
  };
};

// Supabase Auth Integration
export const signInWithEmail = async (email, password) => {
  if (!isConfigured) {
    return mockSignIn(email, password);
  }
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      let msg = '';
      try {
        const text = await response.text();
        if (text) {
          try {
            const errData = JSON.parse(text);
            msg = errData.error_description || errData.error || errData.msg || '';
          } catch (e) {}
        }
      } catch (e) {}

      if (msg.toLowerCase().includes('invalid login credentials') || msg.toLowerCase().includes('invalid credentials')) {
        throw new Error('Incorrect password. Please try again.');
      }
      throw new Error(msg || 'Unable to sign in right now. Please try again.');
    }
    
    const data = await response.json();
    return {
      token: data.access_token,
      user: {
        id: data.user.id,
        name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
        email: data.user.email,
        role: data.user.user_metadata?.role || (data.user.email.includes('admin') ? 'Authority' : 'Citizen')
      }
    };
  } catch (error) {
    console.error("Supabase Auth email signin failed:", error);
    if (error.message && (
      error.message.includes('Incorrect password') || 
      error.message.includes('No account found') || 
      error.message.includes('Please enter a valid email address')
    )) {
      throw error;
    }
    throw new Error('Unable to sign in right now. Please try again.');
  }
};

export const signUpWithEmail = async (fullName, email, password, role = 'Citizen') => {
  if (!isConfigured) {
    const list = getMockUsers();
    if (list.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const newUser = { email, password, name: fullName, role };
    list.push(newUser);
    localStorage.setItem('citymind_registered_users', JSON.stringify(list));
    return { user: newUser };
  }
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      })
    });
    
    if (!response.ok) {
      let msg = '';
      try {
        const text = await response.text();
        if (text) {
          try {
            const errData = JSON.parse(text);
            msg = errData.msg || errData.error_description || errData.error || '';
          } catch (e) {}
        }
      } catch (e) {}
      throw new Error(msg || 'Unable to sign up right now. Please try again.');
    }
    
    const data = await response.json();
    return {
      user: {
        id: data.id || data.user?.id,
        name: fullName,
        email,
        role
      }
    };
  } catch (error) {
    console.error("Supabase Auth email signup failed:", error);
    if (error.message && error.message.includes('already exists')) {
      throw error;
    }
    throw new Error('Unable to sign up right now. Please try again.');
  }
};

export const signInWithGoogle = () => {
  if (!isConfigured) {
    alert("Supabase is not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in production environment.");
    return;
  }
  const redirectTo = window.location.origin + '/reports';
  window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;
};

export const getCurrentUser = async (token) => {
  if (!isConfigured || !token) return null;
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) return null;
    const data = await response.json();
    return {
      id: data.id,
      name: data.user_metadata?.full_name || data.email.split('@')[0],
      email: data.email,
      role: data.user_metadata?.role || (data.email.includes('admin') ? 'Authority' : 'Citizen')
    };
  } catch (err) {
    console.error("Failed to fetch current auth user:", err);
    return null;
  }
};
