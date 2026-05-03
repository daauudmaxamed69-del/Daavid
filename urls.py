"""
urls.py — BloodLink URL routing
"""
from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('api/auth/login/',   views.login,   name='login'),
    path('api/auth/logout/',  views.logout,  name='logout'),

    # Donors  (CRUD)
    path('api/donors/',          views.donors,       name='donors-list'),
    path('api/donors/<str:donor_id>/',  views.donor_detail, name='donor-detail'),

    # Hospitals  (CRUD)
    path('api/hospitals/',               views.hospitals,        name='hospitals-list'),
    path('api/hospitals/<str:hospital_id>/', views.hospital_detail,  name='hospital-detail'),

    # Blood Requests  (CRUD)
    path('api/requests/',                 views.blood_requests,   name='requests-list'),
    path('api/requests/<str:request_id>/', views.request_detail,   name='request-detail'),

    # Dashboard stats
    path('api/stats/',  views.stats,  name='stats'),
]