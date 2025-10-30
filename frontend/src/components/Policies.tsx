import { useState, useEffect } from 'react';
import { Plus, Edit2, FileText, X } from 'lucide-react';
import { api } from '../api';
import type { Policy, PolicyIn } from '../types';

export function Policies() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: '1.0',
    rawJson: '',
  });

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const data = await api.policies.list();
      setPolicies(data);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to load policies' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const openModal = (policy?: Policy) => {
    if (policy) {
      setEditingPolicy(policy);
      setFormData({
        name: policy.name,
        description: '',
        version: policy.version,
        rawJson: JSON.stringify(policy.raw, null, 2),
      });
    } else {
      setEditingPolicy(null);
      setFormData({
        name: '',
        description: '',
        version: '1.0',
        rawJson: JSON.stringify({ rules: [] }, null, 2),
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPolicy(null);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      const raw = JSON.parse(formData.rawJson);
      const policyIn: PolicyIn = {
        name: formData.name,
        description: formData.description,
        version: formData.version,
        raw,
      };

      if (editingPolicy) {
        await api.policies.update(editingPolicy.id, policyIn);
        setMessage({ type: 'success', text: 'Policy updated successfully' });
      } else {
        await api.policies.create(policyIn);
        setMessage({ type: 'success', text: 'Policy created successfully' });
      }

      loadPolicies();
      setTimeout(() => closeModal(), 1500);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save policy' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Policies</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Policy
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-500">Loading policies...</div>
        ) : policies.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No policies found. Create your first policy to get started.
          </div>
        ) : (
          policies.map((policy) => (
            <div key={policy.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">{policy.name}</h3>
                </div>
                <button
                  onClick={() => openModal(policy)}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">Version:</span> {policy.version}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Rules:</span> {policy.raw.rules?.length || 0}
                </p>
                <details className="text-xs">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
                    View Rules
                  </summary>
                  <pre className="mt-2 bg-gray-50 p-2 rounded overflow-x-auto">
                    {JSON.stringify(policy.raw, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                {editingPolicy ? 'Edit Policy' : 'Create New Policy'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {message && (
                <div
                  className={`p-4 rounded-lg ${
                    message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Policy Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Password Policy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version *
                </label>
                <input
                  type="text"
                  required
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 1.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Policy JSON *
                </label>
                <textarea
                  required
                  value={formData.rawJson}
                  onChange={(e) => setFormData({ ...formData, rawJson: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  rows={12}
                  placeholder='{"rules": [{"field": "password_length", "operator": ">=", "value": 8}]}'
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must be valid JSON with a "rules" array
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingPolicy ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
