import type { UserRecord, Policy, EvaluationResult, EvalRequest, PolicyIn } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const api = {
  users: {
    async import(file: File): Promise<{ imported: number }> {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/users/import`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Import failed');
      }
      return res.json();
    },

    async list(params?: { limit?: number; offset?: number; search?: string }): Promise<UserRecord[]> {
      const query = new URLSearchParams();
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.offset) query.set('offset', String(params.offset));
      if (params?.search) query.set('search', params.search);
      const res = await fetch(`${API_BASE}/users?${query}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
  },

  policies: {
    async create(policy: PolicyIn): Promise<{ id: number; name: string; version: string }> {
      const res = await fetch(`${API_BASE}/policies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Failed to create policy');
      }
      return res.json();
    },

    async list(): Promise<Policy[]> {
      const res = await fetch(`${API_BASE}/policies`);
      if (!res.ok) throw new Error('Failed to fetch policies');
      return res.json();
    },

    async get(id: number): Promise<Policy> {
      const res = await fetch(`${API_BASE}/policies/${id}`);
      if (!res.ok) throw new Error('Failed to fetch policy');
      return res.json();
    },

    async update(id: number, policy: PolicyIn): Promise<{ id: number; name: string; version: string }> {
      const res = await fetch(`${API_BASE}/policies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Failed to update policy');
      }
      return res.json();
    },
  },

  evaluate: {
    async run(request: EvalRequest): Promise<{ evaluated: number; results: EvaluationResult[] }> {
      const res = await fetch(`${API_BASE}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Evaluation failed');
      }
      return res.json();
    },
  },

  results: {
    async list(params?: {
      user_id?: string;
      policy_id?: number;
      passed?: boolean;
      sort_by?: string;
      sort_desc?: boolean;
      limit?: number;
      offset?: number;
    }): Promise<EvaluationResult[]> {
      const query = new URLSearchParams();
      if (params?.user_id) query.set('user_id', params.user_id);
      if (params?.policy_id !== undefined) query.set('policy_id', String(params.policy_id));
      if (params?.passed !== undefined) query.set('passed', String(params.passed));
      if (params?.sort_by) query.set('sort_by', params.sort_by);
      if (params?.sort_desc !== undefined) query.set('sort_desc', String(params.sort_desc));
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.offset) query.set('offset', String(params.offset));
      const res = await fetch(`${API_BASE}/results?${query}`);
      if (!res.ok) throw new Error('Failed to fetch results');
      return res.json();
    },
  },
};
