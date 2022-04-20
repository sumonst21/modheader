async function makeRequest(path, params = {}) {
  const response = await fetch(`${process.env.URL_BASE}${path}`, {
    mode: 'cors',
    credentials: 'include',
    ...params
  });
  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to get signed in user');
}

export function getUserDetails() {
  return makeRequest(`/api/u/user-details`);
}

export function createProfile({ profile }) {
  return makeRequest(`/api/u/profile`, {
    method: 'POST',
    body: JSON.stringify({ profile })
  });
}

export function updateProfile({ profile, visibility, allowedEmails }) {
  return makeRequest(`/api/u/profile`, {
    method: 'PUT',
    body: JSON.stringify({ profile, visibility, allowedEmails })
  });
}
