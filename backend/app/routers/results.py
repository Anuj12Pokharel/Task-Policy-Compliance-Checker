from fastapi import APIRouter, Depends
from typing import Optional, List
from sqlmodel import Session, select
from ..database import get_session
from ..models import EvaluationResult

router = APIRouter(prefix="/results", tags=["results"])

@router.get("", response_model=List[dict])
def get_results(
    user_id: Optional[str] = None,
    policy_id: Optional[int] = None,
    passed: Optional[bool] = None,
    sort_by: Optional[str] = "evaluated_at",
    sort_desc: Optional[bool] = True,
    limit: int = 100,
    offset: int = 0,
    session: Session = Depends(get_session),
):
    q = select(EvaluationResult)
    if user_id:
        q = q.where(EvaluationResult.user_id == user_id)
    if policy_id:
        q = q.where(EvaluationResult.policy_id == policy_id)
    if passed is not None:
        q = q.where(EvaluationResult.passed == passed)

    order_col = EvaluationResult.evaluated_at
    if sort_by == "user_id":
        order_col = EvaluationResult.user_id
    if sort_by == "policy_id":
        order_col = EvaluationResult.policy_id

    if sort_desc:
        q = q.order_by(order_col.desc())
    else:
        q = q.order_by(order_col.asc())

    q = q.offset(offset).limit(limit)
    items = session.exec(q).all()
    return [{
        "id": it.id,
        "user_id": it.user_id,
        "policy_id": it.policy_id,
        "passed": it.passed,
        "details": it.details,
        "evaluated_at": it.evaluated_at.isoformat(),
    } for it in items]
