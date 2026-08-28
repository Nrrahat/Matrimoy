# app/models/__init__.py
from app.models.users import User

# This explicitly registers your model into the global namespace
__all__ = ["User"]