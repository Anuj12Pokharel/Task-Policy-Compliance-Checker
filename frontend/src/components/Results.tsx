import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { api } from '../api';
import type { EvaluationResult, Policy } from '../types';

export function Results() {
  const [results, setResults] = useState<EvaluationResult[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedResults, setExpandedResults] = useState<Set<number>>(new Set());

  const [filters, setFilters] = useState({
    userId: '',
    policyId: '',
    passed: '',
    sortBy: 'evaluated_at',
    sortDesc: true,
  });

  const loadResults = async () => {
    setLoading(true);
    try {
      const params: any = {
        sort_by: filters.sortBy,
        sort_desc: filters.sortDesc,
        limit: 100,
      };

      if (filters.userId) params.user_id = filters.userId;
      if (filters.policyId) params.policy_id = parseInt(filters.policyId);
      if (filters.passed !== '') params.passed = filters.passed === 'true';

      const data = await api.results.list(params);
      setResults(data);
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPolicies = async () => {
    try {
      const data = await api.policies.list();
      setPolicies(data);
    } catch (error) {
      console.error('Failed to load policies:', error);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  useEffect(() => {
    loadResults();
  }, [filters]);

  const toggleExpand = (id: number) => {
    setExpandedResults((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getPolicyName = (policyId: number) => {
    const policy = policies.find((p) => p.id === policyId);
    return policy ? `${policy.name} (v${policy.version})` : `Policy #${policyId}`;
  };

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Evaluation Results</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-gray-700">Passed: {passedCount}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="text-gray-700">Failed: {failedCount}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">User ID</label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Policy</label>
            <select
              value={filters.policyId}
              onChange={(e) => setFilters({ ...filters, policyId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Policies</option>
              {policies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (v{p.version})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.passed}
              onChange={(e) => setFilters({ ...filters, passed: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All</option>
              <option value="true">Passed</option>
              <option value="false">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="evaluated_at">Date</option>
              <option value="user_id">User ID</option>
              <option value="policy_id">Policy</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Order</label>
            <select
              value={filters.sortDesc ? 'desc' : 'asc'}
              onChange={(e) => setFilters({ ...filters, sortDesc: e.target.value === 'desc' })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading results...</div>
        ) : results.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No results found. Run an evaluation to see results here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Policy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Evaluated At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.map((result) => {
                  const isExpanded = expandedResults.has(result.id!);
                  return (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {result.user_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getPolicyName(result.policy_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {result.passed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
                            <XCircle className="w-3 h-3" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(result.evaluated_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => toggleExpand(result.id!)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Show
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {results.map((result) => {
              const isExpanded = expandedResults.has(result.id!);
              if (!isExpanded) return null;

              return (
                <div key={`details-${result.id}`} className="border-t border-gray-200 bg-gray-50 p-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Rule Results</h4>
                  <div className="space-y-3">
                    {result.details.rules.map((rule, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-start gap-3">
                          {rule.passed ? (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 text-sm">
                            <p className="font-medium text-gray-900">
                              {rule.field} {rule.operator} {JSON.stringify(rule.value)}
                            </p>
                            <p className="text-gray-600 mt-1">
                              User value: <span className="font-mono">{JSON.stringify(rule.user_value)}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
