import logging
from typing import Optional
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.Users import User

logger = logging.getLogger(__name__)


async def create(obj: User, db: AsyncSession) -> Optional[int]:
    try:
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj.id
    except Exception:
        logger.exception("[my model : create]")
        await db.rollback()
        return None


async def get_random_row(db: AsyncSession) -> Optional[User]:
    try:
        stmt = select(User).order_by(User.id.desc()).limit(1)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    except Exception:
        logger.exception("[my model : get random row]")
        return None


async def update(id: int, obj: User, db: AsyncSession) -> Optional[User]:
    try:
        stmt = select(User).where(User.id == id)
        result = await db.execute(stmt)
        item = result.scalar_one_or_none()
        if item:
            item.first_name = obj.first_name
            item.last_name = obj.last_name
            item.username = obj.username
            item.email = obj.email
            item.updated_at = datetime.now()
            await db.commit()
            await db.refresh(item)
            return item
        return None
    except Exception:
        logger.exception("[my model : update]")
        await db.rollback()
        return None


async def delete(id: int, db: AsyncSession) -> bool:
    try:
        stmt = select(User).where(User.id == id)
        result = await db.execute(stmt)
        item = result.scalar_one_or_none()
        if item:
            await db.delete(item)
            await db.commit()
            return True
        return False
    except Exception:
        logger.exception("[my model : delete]")
        await db.rollback()
        return False


async def find_by_id(id: int, db: AsyncSession) -> Optional[User]:
    try:
        stmt = select(User).where(User.id == id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    except Exception:
        logger.exception("[my model : find by id]")
        return None


async def find_by_firebase_id(firebase_id: str, db: AsyncSession) -> Optional[User]:
    try:
        stmt = select(User).where(User.firebase_id == firebase_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    except Exception:
        logger.exception("[my model : find by firebase id]")
        return None


async def find_by_email(email: str, db: AsyncSession) -> Optional[User]:
    try:
        stmt = select(User).where(User.email == email)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    except Exception:
        logger.exception("[my model : find by email]")
        return None