const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function createProfile(profileData) {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  })

  if (!response.ok) {
    throw new Error('Failed to create profile')
  }

  return response.json()
}

export async function getProfile(profileId) {
  const response = await fetch(`${API_BASE_URL}/profile/${profileId}`)

  if (!response.ok) {
    throw new Error('Failed to get profile')
  }

  return response.json()
}

export async function fetchJobs() {
  const response = await fetch(`${API_BASE_URL}/jobs/fetch`, {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch jobs')
  }

  return response.json()
}

export async function matchJobs(userId) {
  const response = await fetch(`${API_BASE_URL}/match/${userId}`, {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Failed to match jobs')
  }

  return response.json()
}

export async function getHealthCheck() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    return response.ok
  } catch {
    return false
  }
}
