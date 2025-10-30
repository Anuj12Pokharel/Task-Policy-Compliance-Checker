from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from ..database import get_session
from ..models import UserRecord
from ..import_service import import_csv, import_json_array

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/import")
async def import_users(file: UploadFile = File(...), session: Session = Depends(get_session)):
    content = await file.read()
    ct = file.content_type
    try:
        if ct in ("application/json", "text/json"):
            created = import_json_array(content, session, imported_from=file.filename)
        else:
            created = import_csv(content, session, imported_from=file.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"imported": len(created)}

@router.get("", response_model=List[dict])
def list_users(limit: int = 100, offset: int = 0, search: Optional[str] = None, session: Session = Depends(get_session)):
    q = select(UserRecord).offset(offset).limit(limit)
    if search:
        q = select(UserRecord).where(UserRecord.user_id.contains(search)).offset(offset).limit(limit)
    users = session.exec(q).all()
    return [{"id": u.id, "user_id": u.user_id, "attributes": u.attributes, "imported_from": u.imported_from, "created_at": u.created_at.isoformat()} for u in users]
