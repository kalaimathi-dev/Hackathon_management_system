import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken
        });
        
        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  login: (data) => api.post('/auth/login', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  getProfile: () => api.get('/auth/profile')
};

export const hackathonAPI = {
  create: (data) => api.post('/hackathons', data),
  getAll: (status) => api.get('/hackathons', { params: { status } }),
  getById: (id) => api.get(`/hackathons/${id}`),
  update: (id, data) => api.put(`/hackathons/${id}`, data),
  delete: (id) => api.delete(`/hackathons/${id}`),
  enroll: (id) => api.post(`/hackathons/${id}/enroll`),
  
  // NEW: Public registration methods
  getByCode: (code) => api.get(`/hackathons/public/code/${code}`),
  registerViaLink: (code, data) => api.post(`/hackathons/public/register/${code}`, data),
  regenerateCode: (id) => api.post(`/hackathons/${id}/regenerate-code`)
};

export const taskAPI = {
  create: (data) => api.post('/tasks', data),
  getByHackathon: (hackathonId) => api.get(`/tasks/hackathon/${hackathonId}`),
  getById: (id) => api.get(`/tasks/${id}`),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`)
};

export const assignmentAPI = {
  manualAssign: (data) => api.post('/assignments/assign/manual', data),
  randomAssign: (data) => api.post('/assignments/assign/random', data),
  smartAssign: (data) => api.post('/assignments/assign/smart', data),
  getByHackathon: (hackathonId) => api.get(`/assignments/hackathon/${hackathonId}`),
  getMyAssignments: () => api.get('/assignments/my-assignments'),
  reassign: (assignmentId, data) => api.put(`/assignments/${assignmentId}/reassign`, data),
  unassign: (assignmentId) => api.delete(`/assignments/${assignmentId}`)
};

export const submissionAPI = {
  create: (data) => api.post('/submissions', data),
  getByAssignment: (assignmentId) => api.get(`/submissions/assignment/${assignmentId}`),
  getMySubmissions: () => api.get('/submissions/my-submissions'),
  getByHackathon: (hackathonId) => api.get(`/submissions/hackathon/${hackathonId}`),
  update: (id, data) => api.put(`/submissions/${id}`, data)
};

export const judgeAPI = {
  evaluate: (submissionId, data) => api.post(`/judge/evaluate/${submissionId}`, data),
  getPending: (hackathonId) => api.get(`/judge/pending/${hackathonId}`),
  getEvaluated: (hackathonId) => api.get(`/judge/evaluated/${hackathonId}`),
  getLeaderboard: (hackathonId) => api.get(`/judge/leaderboard/${hackathonId}`)
};

export default api;