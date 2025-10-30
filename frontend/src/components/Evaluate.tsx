import { useState, useEffect } from 'react';
import { Play, RefreshCw } from 'lucide-react';
import { api } from '../api';
import type { UserRecord, Policy, EvalRequest } from '../types';

export function Evaluate() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedPolicies, setSelectedPolicies] = useState<number[]>([]);
  const [evaluateAllUsers, setEvaluateAllUsers] = useState(true);
  const [evaluateAllPolicies, setEvaluateAllPolicies] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, policiesData] = await Promise.all([
          api.users.list({ limit: 1000 }),
          api.policies.list(),
        ]);
        setUsers(usersData);
        setPolicies(policiesData);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to load data' });
      }
    };
    loadData();
  }, []);

  const handleEvaluate = async () => {
    setEvaluating(true);
    setMessage(null);

    const request: EvalRequest = {
      evaluate_all_users: evaluateAllUsers,
      evaluate_all_policies: evaluateAllPolicies,
    };

    if (!evaluateAllUsers && selectedUsers.length > 0) {
      request.user_ids = selectedUsers;
    }

    if (!evaluateAllPolicies && selectedPolicies.length > 0) {
      request.policy_ids = selectedPolicies;
    }

    try {
      const result = await api.evaluate.run(request);
      setMessage({
        type: 'success',
        text: `Successfully evaluated ${result.evaluated} user-policy combinations`,
      });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Evaluation failed' });
    } finally {
      setEvaluating(false);
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const togglePolicy = (policyId: number) => {
    setSelectedPolicies((prev) =>
      prev.includes(policyId) ? prev.filter((id) => id !== policyId) : [...prev, policyId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Evaluate Compliance</h2>
        <button
          onClick={handleEvaluate}
          disabled={evaluating || users.length === 0 || policies.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {evaluating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {evaluating ? 'Evaluating...' : 'Run Evaluation'}
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {users.length === 0 || policies.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 font-medium">
            {users.length === 0 && policies.length === 0
              ? 'You need to import users and create policies before evaluation'
              : users.length === 0
              ? 'Import users before running evaluation'
              : 'Create policies before running evaluation'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Users</h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={evaluateAllUsers}
                  onChange={(e) => {
                    setEvaluateAllUsers(e.target.checked);
                    if (e.target.checked) setSelectedUsers([]);
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Evaluate All</span>
              </label>
            </div>

            {!evaluateAllUsers && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {users.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.user_id)}
                      onChange={() => toggleUser(user.user_id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900">{user.user_id}</span>
                  </label>
                ))}
              </div>
            )}

            <p className="mt-4 text-sm text-gray-500">
              {evaluateAllUsers
                ? `All ${users.length} users will be evaluated`
                : `${selectedUsers.length} user(s) selected`}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Policies</h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={evaluateAllPolicies}
                  onChange={(e) => {
                    setEvaluateAllPolicies(e.target.checked);
                    if (e.target.checked) setSelectedPolicies([]);
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Evaluate All</span>
              </label>
            </div>

            {!evaluateAllPolicies && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {policies.map((policy) => (
                  <label
                    key={policy.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPolicies.includes(policy.id)}
                      onChange={() => togglePolicy(policy.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">{policy.name}</span>
                      <span className="text-xs text-gray-500 ml-2">v{policy.version}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <p className="mt-4 text-sm text-gray-500">
              {evaluateAllPolicies
                ? `All ${policies.length} policies will be evaluated`
                : `${selectedPolicies.length} policy(ies) selected`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
