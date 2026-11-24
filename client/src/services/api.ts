import axios from "axios";

const baseUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000/api/' : '/api/');

export const api = axios.create({
  baseURL: baseUrl,
});

// Auto-attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // If unauthorized and not already on login, we can let route guards handle redirect
    }
    return Promise.reject(error);
  }
);

// ── Types ──
export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  _count?: { monitors: number };
}

export interface MonitorResult {
  id?: string;
  responseTime: number;
  statusCode: number | null;
  success: boolean;
  checkedAt: string;
}

export interface Incident {
  id: string;
  monitorId: string;
  startedAt: string;
  resolvedAt: string | null;
  duration: number | null;
  status: 'ONGOING' | 'RESOLVED';
  cause?: string | null;
  monitor?: Monitor;
}

export interface MonitorLog {
  id: string;
  monitorId: string;
  requestDetails?: any;
  error?: string | null;
  executionResult: string;
  createdAt: string;
  monitor?: Monitor;
}

export interface Monitor {
  id: string;
  projectId: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';
  interval: number;
  status: 'UP' | 'DOWN' | 'PENDING' | 'PAUSED';
  createdAt?: string;
  updatedAt?: string;
  results?: MonitorResult[];
  incidents?: Incident[];
  logs?: MonitorLog[];
  project?: {
    id: string;
    name: string;
  };
}

// ── API Service Calls ──
export const monitoringApi = {
  // Projects
  getProjects: async (): Promise<Project[]> => {
    const res = await api.get('/projects');
    return res.data.projects || [];
  },
  createProject: async (name: string, description?: string): Promise<Project> => {
    const res = await api.post('/projects', { name, description });
    return res.data.project;
  },
  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  // Monitors
  getMonitors: async (projectId?: string): Promise<Monitor[]> => {
    const url = projectId ? `/monitors?projectId=${projectId}` : '/monitors';
    const res = await api.get(url);
    return res.data.monitors || [];
  },
  getMonitorById: async (id: string): Promise<Monitor> => {
    const res = await api.get(`/monitors/${id}`);
    return res.data.monitor;
  },
  createMonitor: async (data: {
    projectId: string;
    url: string;
    method?: string;
    interval?: number;
  }): Promise<Monitor> => {
    const res = await api.post('/monitors', data);
    return res.data.monitor;
  },
  updateMonitor: async (
    id: string,
    data: {
      url?: string;
      method?: string;
      interval?: number;
      status?: string;
    }
  ): Promise<Monitor> => {
    const res = await api.patch(`/monitors/${id}`, data);
    return res.data.monitor;
  },
  pauseMonitor: async (id: string): Promise<Monitor> => {
    const res = await api.patch(`/monitors/${id}/pause`);
    return res.data.monitor;
  },
  resumeMonitor: async (id: string, interval?: number): Promise<Monitor> => {
    const res = await api.patch(`/monitors/${id}/resume`, { interval });
    return res.data.monitor;
  },
  deleteMonitor: async (id: string): Promise<void> => {
    await api.delete(`/monitors/${id}`);
  },
  testMonitor: async (id: string): Promise<any> => {
    const res = await api.post(`/monitors/${id}/test`);
    return res.data;
  },
  getIncidents: async (): Promise<Incident[]> => {
    const res = await api.get('/monitors/incidents');
    return res.data.incidents || [];
  },
  acknowledgeIncident: async (id: string): Promise<Incident> => {
    const res = await api.patch(`/monitors/incidents/${id}/acknowledge`);
    return res.data.incident;
  },
  getLogs: async (): Promise<MonitorLog[]> => {
    const res = await api.get('/monitors/logs');
    return res.data.logs || [];
  },
};
