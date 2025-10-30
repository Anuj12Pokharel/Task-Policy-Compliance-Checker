export interface UserRecord {
  id: number;
  user_id: string;
  attributes: Record<string, any>;
  imported_from?: string;
  created_at: string;
}

export interface Policy {
  id: number;
  name: string;
  version: string;
  raw: {
    rules: PolicyRule[];
    [key: string]: any;
  };
}

export interface PolicyRule {
  field: string;
  operator: string;
  value: any;
  description?: string;
}

export interface EvaluationResult {
  id?: number;
  user_id: string;
  policy_id: number;
  passed: boolean;
  details: {
    rules: Array<{
      field: string;
      operator: string;
      value: any;
      user_value: any;
      passed: boolean;
    }>;
  };
  evaluated_at: string;
}

export interface EvalRequest {
  user_ids?: string[];
  policy_ids?: number[];
  evaluate_all_users?: boolean;
  evaluate_all_policies?: boolean;
}

export interface PolicyIn {
  name: string;
  description?: string;
  version: string;
  raw: {
    rules: PolicyRule[];
    [key: string]: any;
  };
}
