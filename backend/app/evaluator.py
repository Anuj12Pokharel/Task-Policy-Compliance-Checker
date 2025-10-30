from typing import Dict, Any, Tuple, List
import re

def op_eq(a, b): return a == b
def op_ne(a, b): return a != b
def op_gt(a, b):
    try: return float(a) > float(b)
    except: return False
def op_lt(a, b):
    try: return float(a) < float(b)
    except: return False
def op_ge(a, b):
    try: return float(a) >= float(b)
    except: return False
def op_le(a, b):
    try: return float(a) <= float(b)
    except: return False
def op_in(a, b):
    if a is None: return False
    if isinstance(b, str):
        b_list = [v.strip() for v in b.split(",")]
    elif isinstance(b, list):
        b_list = b
    else:
        b_list = [b]
    return a in b_list
def op_not_in(a, b): return not op_in(a, b)
def op_regex(a, b):
    if a is None: return False
    try: return re.search(b, str(a)) is not None
    except re.error: return False
def op_exists(a, _b): return a is not None
def op_not_exists(a, _b): return a is None
def op_contains(a, b):
    if a is None: return False
    try: return b in a
    except: return False

OPERATORS = {
    "==": op_eq, "eq": op_eq, "=": op_eq,
    "!=": op_ne, "ne": op_ne,
    ">": op_gt, "<": op_lt, ">=": op_ge, "<=": op_le,
    "in": op_in, "not_in": op_not_in,
    "regex": op_regex, "exists": op_exists, "not_exists": op_not_exists, "contains": op_contains
}

def get_nested_attr(d: Dict[str, Any], key: str):
    if d is None: return None
    parts = key.split(".")
    cur = d
    for p in parts:
        if isinstance(cur, dict) and p in cur:
            cur = cur[p]
        else:
            return None
    return cur

def evaluate_rule(user_attrs: Dict[str, Any], rule: Dict[str, Any]) -> Dict[str, Any]:
    attr = rule.get("attribute")
    op = rule.get("operator")
    expected = rule.get("value")
    msg = rule.get("message")
    observed = get_nested_attr(user_attrs, attr) if attr else None
    if op not in OPERATORS:
        return {"rule_id": rule.get("id"), "passed": False, "message": f"Unsupported operator '{op}'", "observed": observed}
    passed = OPERATORS[op](observed, expected)
    return {"rule_id": rule.get("id"), "passed": bool(passed), "message": msg, "observed": observed, "operator": op, "expected": expected}

def evaluate_policy_for_user(policy_raw: Dict[str, Any], user_attrs: Dict[str, Any]) -> Tuple[bool, List[Dict[str, Any]]]:
    rules = policy_raw.get("rules", [])
    mode = policy_raw.get("mode", "all_of")
    rule_results = [evaluate_rule(user_attrs, r) for r in rules]
    if mode == "any_of":
        overall = any(r["passed"] for r in rule_results)
    else:
        overall = all(r["passed"] for r in rule_results)
    return overall, rule_results
