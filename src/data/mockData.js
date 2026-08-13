// Mock data for complaints and city analytics
export const mockComplaints = [
  {
    id: 1,
    title: "Large Pothole on Main Street",
    description: "There is a deep pothole on Main Street near the crossroads, causing traffic issues.",
    category: "Roads & Infrastructure",
    location: "Main Street & 5th Ave",
    status: "Pending",
    urgency: "High",
    createdAt: "2026-08-13T10:00:00Z"
  },
  {
    id: 2,
    title: "Broken Streetlight on Elm Street",
    description: "Streetlight is out, making the corner dark and unsafe at night.",
    category: "Public Lighting",
    location: "Elm Street",
    status: "In Progress",
    urgency: "Medium",
    createdAt: "2026-08-13T11:00:00Z"
  }
];

export const mockStats = {
  totalComplaints: 2,
  resolvedComplaints: 0,
  pendingComplaints: 2
};
