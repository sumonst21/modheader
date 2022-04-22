async function makeRequest(path, params = {}) {
  const response = await fetch(`${process.env.URL_BASE}${path}`, {
    mode: 'cors',
    credentials: 'include',
    ...params
  });
  if (response.ok) {
    return await response.json();
  }
  const err = new Error('Failed to make the request');
  err.statusCode = response.status;
  throw err;
}

export function getUserDetails() {
  return makeRequest(`/api/u/user-details`);
}

export function getProfile({ profileId }) {
  return makeRequest(`/api/profile/${profileId}`);
}

export function createProfile({ profile }) {
  return makeRequest(`/api/u/profile`, {
    method: 'POST',
    body: JSON.stringify({ profile })
  });
}

export function updateProfile({ profileId, profile, visibility, allowedEmails }) {
  return makeRequest(`/api/u/profile`, {
    method: 'PUT',
    body: JSON.stringify({ profileId, profile, visibility, allowedEmails })
  });
}

export function getProfileUrl({ profileId }) {
  return `${process.env.URL_BASE}/profile/${profileId}`;
}
