"""
models.py — Blood Donation System
MongoDB documents via MongoEngine
"""
from mongoengine import (
    Document, StringField, IntField, BooleanField,
    DateTimeField, ReferenceField, ListField, FloatField
)
from datetime import datetime


class Admin(Document):
    """Single admin user for the system."""
    username   = StringField(required=True, unique=True, max_length=50)
    password   = StringField(required=True)          # store hashed with bcrypt
    email      = StringField(required=True, unique=True)
    first_name = StringField(max_length=50)
    last_name  = StringField(max_length=50)
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'admins'}

    def __str__(self):
        return self.username


class Donor(Document):
    """Blood donor profile."""
    BLOOD_GROUPS = ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')
    GENDERS      = ('Male', 'Female', 'Other')
    STATUS       = ('Available', 'Busy', 'Inactive')

    first_name    = StringField(required=True, max_length=60)
    last_name     = StringField(required=True, max_length=60)
    blood_group   = StringField(required=True, choices=BLOOD_GROUPS)
    age           = IntField(required=True, min_value=18, max_value=65)
    gender        = StringField(required=True, choices=GENDERS)
    phone         = StringField(required=True, max_length=30)
    location      = StringField(required=True, max_length=120)
    availability  = StringField(default='Available', choices=STATUS)
    last_donation = DateTimeField(null=True, blank=True)
    notes         = StringField(max_length=500, default='')
    created_at    = DateTimeField(default=datetime.utcnow)
    updated_at    = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'donors',
        'indexes': ['blood_group', 'availability', 'location']
    }

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.blood_group})"

    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)


class Hospital(Document):
    """Registered hospital/clinic."""
    TYPES = ('Public', 'Private', 'NGO')

    name           = StringField(required=True, max_length=150, unique=True)
    hospital_type  = StringField(required=True, choices=TYPES, default='Public')
    city           = StringField(required=True, max_length=80)
    address        = StringField(max_length=250, default='')
    contact_person = StringField(max_length=100, default='')
    phone          = StringField(max_length=30)
    email          = StringField(max_length=120, default='')
    is_active      = BooleanField(default=True)
    created_at     = DateTimeField(default=datetime.utcnow)
    updated_at     = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'hospitals',
        'indexes': ['city', 'hospital_type']
    }

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)


class BloodRequest(Document):
    """A blood request submitted by a hospital."""
    BLOOD_GROUPS = ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')
    URGENCY_LEVELS = ('Standard', 'Urgent', 'Emergency')
    STATUSES = ('Pending', 'Approved', 'Completed', 'Urgent', 'Rejected')

    hospital    = ReferenceField(Hospital, required=True)
    blood_group = StringField(required=True, choices=BLOOD_GROUPS)
    units       = IntField(required=True, min_value=1, max_value=50)
    urgency     = StringField(required=True, choices=URGENCY_LEVELS, default='Standard')
    status      = StringField(required=True, choices=STATUSES, default='Pending')
    notes       = StringField(max_length=500, default='')
    created_at  = DateTimeField(default=datetime.utcnow)
    updated_at  = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'blood_requests',
        'indexes': ['status', 'blood_group', 'urgency', '-created_at']
    }

    def __str__(self):
        return f"{self.blood_group} × {self.units} — {self.hospital}"

    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)