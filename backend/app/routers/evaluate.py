from fastapi import APIRouter, Depends
from sqlmodel import Session, select, col
from typing import List
from ..database import get_session
from ..schemas import EvalRequest
from ..models import UserRecord, Policy, EvaluationResult
from ..evaluator import evaluate_policy_for_user

router = APIRouter(prefix="/evaluate", tags=["evaluate"])

@router.post("", response_model=dict)
def evaluate(req: EvalRequest, session: Session = Depends(get_session)):
    if req.evaluate_all_users or not req.user_ids:
        users = session.exec(select(UserRecord)).all()
    else:
        users = session.exec(select(UserRecord).where(col(UserRecord.user_id).in_(req.user_ids))).all()
    if not users:
        return {"evaluated": 0, "results": []}

    if req.evaluate_all_policies or not req.policy_ids:
        policies = session.exec(select(Policy)).all()
    else:
        policies = []
        for pid in (req.policy_ids or []):
            p = session.get(Policy, pid)
            if p:
                policies.append(p)

    results_out = []
    for user in users:
        for policy in policies:
            passed, rule_results = evaluate_policy_for_user(policy.raw, user.attributes or {})
            er = EvaluationResult(user_id=user.user_id, policy_id=policy.id, passed=passed, details={"rules": rule_results})
            session.add(er)
            session.commit()
            session.refresh(er)
            results_out.append({
                "user_id": er.user_id,
                "policy_id": er.policy_id,
                "passed": er.passed,
                "details": er.details,
                "evaluated_at": er.evaluated_at.isoformat(),
            })
    return {"evaluated": len(results_out), "results": results_out}
