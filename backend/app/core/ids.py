"""
문서 _id 생성 유틸. 4장 예시(u_123, hp_u_123, m_001 등)처럼
접두사 + uuid 짧은 조합으로 사람이 식별 가능한 id를 만든다.
"""
import uuid


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:10]}"
