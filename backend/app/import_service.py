from typing import List
import csv, io, json
from datetime import datetime
from sqlmodel import Session
from .models import UserRecord

def normalize_value(val: str):
    if val is None: return None
    v = val.strip()
    if v == "": return None
    low = v.lower()
    if low in ("true","yes","y","1"): return True
    if low in ("false","no","n","0"): return False
    try:
        if "." in v: return float(v)
        return int(v)
    except:
        return v

def import_csv(file_bytes: bytes, session: Session, imported_from: str = "uploaded_csv") -> List[UserRecord]:
    text = file_bytes.decode("utf-8-sig")
    f = io.StringIO(text)
    reader = csv.DictReader(f)
    created = []
    for row in reader:
        user_id = row.get("user_id") or row.get("id") or row.get("email")
        if not user_id:
            user_id = f"anon-{datetime.utcnow().timestamp()}"
        attributes = {k: normalize_value(v) for k, v in row.items()}
        user = UserRecord(user_id=str(user_id), attributes=attributes, imported_from=imported_from)
        session.add(user)
        created.append(user)
    session.commit()
    for u in created:
        session.refresh(u)
    return created

def import_json_array(content: bytes, session: Session, imported_from: str = "uploaded_json") -> List[UserRecord]:
    parsed = json.loads(content.decode("utf-8"))
    if not isinstance(parsed, list):
        raise ValueError("JSON must be an array of objects (users).")
    created = []
    for obj in parsed:
        user_id = obj.get("user_id") or obj.get("id") or obj.get("email")
        if not user_id:
            user_id = f"anon-{datetime.utcnow().timestamp()}"
        user = UserRecord(user_id=str(user_id), attributes=obj, imported_from=imported_from)
        session.add(user)
        created.append(user)
    session.commit()
    for u in created:
        session.refresh(u)
    return created
