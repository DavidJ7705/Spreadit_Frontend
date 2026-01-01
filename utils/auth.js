export function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  const tokenType = localStorage.getItem('token_type') || 'bearer';

  if (!token) {
    return {
      'Content-Type': 'application/json'
    };
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `${tokenType} ${token}`
  };
}

export function isTokenExpired() {
  const token = localStorage.getItem('access_token');
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000;
    return Date.now() >= expirationTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('token_type');
  localStorage.removeItem('userId');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('isAdmin');
}

export async function authenticatedFetch(url, options = {}) {
  if (isTokenExpired()) {
    logout();
    window.location.href = '/login';
    throw new Error('Token expired. Please log in again.');
  }

  const headers = {
    ...getAuthHeaders(),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401) {
    logout();
    window.location.href = '/login';
    throw new Error('Unauthorized. Please log in again.');
  }

  return response;
}
