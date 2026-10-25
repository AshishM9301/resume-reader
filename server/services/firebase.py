import os
import firebase_admin
from firebase_admin import credentials, auth

_initialized = False


def init():
    global _initialized
    if _initialized:
        return
    try:
        firebase_admin.get_app()
        _initialized = True
        return
    except ValueError:
        pass
    cred_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "./service-account.json")
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
    _initialized = True


def verify_token(id_token: str):
    return auth.verify_id_token(id_token)


def create_user(email: str, password: str):
    return auth.create_user(email=email, password=password)


def get_user_by_email(email: str):
    return auth.get_user_by_email(email)
