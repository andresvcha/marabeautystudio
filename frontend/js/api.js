const API_URL = 'http://localhost:3000/api';

function getToken() {
    return localStorage.getItem('mara_token');
}

async function apiFetch(path, options = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${path}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw { status: res.status, message: data.message || 'Error en la solicitud.' };
    return data;
}
