
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const registerCandidate = async ({
  name,
  email,
  password,
  jobRole,
}) => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      jobRole: jobRole.trim(),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
};

export const loginUser = async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed");
    }

    return data;
};
export const getMyHistory = async (token) => {
  const response = await fetch(
    `${API_URL}/api/candidates/me/history`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch status history");
  }

  return data;
};
export const getCandidates = async (token, filters = {}) => {
  const queryParams = new URLSearchParams();

  if (filters.search) {
    queryParams.append("search", filters.search);
  }

  if (filters.status) {
    queryParams.append("status", filters.status);
  }

  if (filters.page) {
    queryParams.append("page", filters.page);
  }

  const response = await fetch(
    `${API_URL}/api/candidates?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch candidates");
  }

  return data;
};


export const updateCandidateStatus = async (
  token,
  candidateId,
  newStatus,
  remarks
) => {
  const response = await fetch(
    `${API_URL}/api/candidates/${candidateId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: newStatus,
        remarks,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update candidate status");
  }

  return data;
};


export const getCandidateHistory = async (token, candidateId) => {
  const response = await fetch(
    `${API_URL}/api/candidates/${candidateId}/history`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch candidate history");
  }

  return data;
};
