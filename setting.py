"""
settings.py — BloodLink Django Configuration
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# ── SECURITY ─────────────────────────────────────────────────────────────────
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'change-me-in-production-use-env-var')
DEBUG      = os.environ.get('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost 127.0.0.1').split()

# ── APPS ─────────────────────────────────────────────────────────────────────
INSTALLED_APPS = [
    'django.contrib.staticfiles',
    'django.contrib.sessions',
    'corsheaders',         # pip install django-cors-headers
    'bloodlink',           # your app name
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'bloodlink.urls'

# ── MONGODB via MongoEngine ───────────────────────────────────────────────────
# pip install mongoengine
import mongoengine
mongoengine.connect(
    db      = os.environ.get('MONGO_DB',   'bloodlink'),
    host    = os.environ.get('MONGO_HOST', 'localhost'),
    port    = int(os.environ.get('MONGO_PORT', 27017)),
    # For Atlas:
    # host = 'mongodb+srv://user:pass@cluster.mongodb.net/bloodlink'
)

# Django needs *some* database even with MongoEngine (for sessions)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'session.sqlite3',   # used only for sessions
    }
}

# ── SESSIONS ─────────────────────────────────────────────────────────────────
SESSION_ENGINE  = 'django.contrib.sessions.backends.db'
SESSION_COOKIE_AGE      = 86400   # 1 day
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE   = not DEBUG

# ── CORS (allow frontend to call API) ────────────────────────────────────────
CORS_ALLOW_ALL_ORIGINS   = DEBUG
CORS_ALLOWED_ORIGINS     = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
]
CORS_ALLOW_CREDENTIALS   = True

# ── STATIC / TEMPLATES ───────────────────────────────────────────────────────
STATIC_URL  = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [BASE_DIR / 'frontend'],
    'APP_DIRS': False,
    'OPTIONS': {'context_processors': [
        'django.template.context_processors.request',
    ]},
}]

# ── MISC ─────────────────────────────────────────────────────────────────────
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
LANGUAGE_CODE = 'en-us'
TIME_ZONE     = 'Africa/Nairobi'
USE_I18N      = True
USE_TZ        = True