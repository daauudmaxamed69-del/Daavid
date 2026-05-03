"""
views.py — REST API views for Blood Donation Management System
All responses are JSON. Admin login required via session.
"""
import json
import bcrypt
from datetime import datetime
from functools import wraps

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import Admin, Donor, Hospital, BloodRequest


# ── AUTH DECORATOR ──────────────────────────────────────────────────────────

def login_required(view_func):
    """Decorator: reject requests that don't have an active admin session."""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.session.get('admin_id'):
            return JsonResponse({'error': 'Unauthorized'}, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper


def json_body(request):
    """Parse JSON request body safely."""
    try:
        return json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return {}


# ── AUTH VIEWS ───────────────────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(['POST'])
def login(request):
    """POST /api/auth/login  { username, password }"""
    data = json_body(request)
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return JsonResponse({'error': 'Username and password required'}, status=400)

    try:
        admin = Admin.objects.get(username=username)
    except Admin.DoesNotExist:
        return JsonResponse({'error': 'Invalid credentials'}, status=401)

    if not bcrypt.checkpw(password.encode(), admin.password.encode()):
        return JsonResponse({'error': 'Invalid credentials'}, status=401)

    request.session['admin_id'] = str(admin.id)
    return JsonResponse({
        'message': 'Login successful',
        'admin': {'id': str(admin.id), 'username': admin.username, 'email': admin.email}
    })


@csrf_exempt
@require_http_methods(['POST'])
@login_required
def logout(request):
    """POST /api/auth/logout"""
    request.session.flush()
    return JsonResponse({'message': 'Logged out'})


# ── DONOR VIEWS ──────────────────────────────────────────────────────────────

@csrf_exempt
@login_required
def donors(request):
    """
    GET  /api/donors/         — list donors (with optional filters)
    POST /api/donors/         — create donor
    """
    if request.method == 'GET':
        qs = Donor.objects.all()

        # Filtering
        blood   = request.GET.get('blood_group')
        avail   = request.GET.get('availability')
        gender  = request.GET.get('gender')
        search  = request.GET.get('q', '').strip()

        if blood:
            qs = qs.filter(blood_group=blood)
        if avail:
            qs = qs.filter(availability=avail)
        if gender:
            qs = qs.filter(gender=gender)
        if search:
            # MongoEngine supports __icontains for regex search
            qs = qs.filter(first_name__icontains=search) | \
                 Donor.objects.filter(last_name__icontains=search) | \
                 Donor.objects.filter(location__icontains=search)

        result = [_donor_dict(d) for d in qs.order_by('-created_at')]
        return JsonResponse({'donors': result, 'count': len(result)})

    elif request.method == 'POST':
        data = json_body(request)
        try:
            donor = Donor(
                first_name   = data['first_name'],
                last_name    = data['last_name'],
                blood_group  = data['blood_group'],
                age          = int(data['age']),
                gender       = data['gender'],
                phone        = data.get('phone', ''),
                location     = data['location'],
                availability = data.get('availability', 'Available'),
                notes        = data.get('notes', ''),
            )
            if data.get('last_donation'):
                donor.last_donation = datetime.fromisoformat(data['last_donation'])
            donor.save()
            return JsonResponse({'donor': _donor_dict(donor)}, status=201)
        except KeyError as e:
            return JsonResponse({'error': f'Missing field: {e}'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
@login_required
def donor_detail(request, donor_id):
    """
    GET    /api/donors/<id>/  — retrieve single donor
    PUT    /api/donors/<id>/  — update donor
    DELETE /api/donors/<id>/  — delete donor
    """
    try:
        donor = Donor.objects.get(id=donor_id)
    except Donor.DoesNotExist:
        return JsonResponse({'error': 'Donor not found'}, status=404)

    if request.method == 'GET':
        return JsonResponse({'donor': _donor_dict(donor)})

    elif request.method == 'PUT':
        data = json_body(request)
        updatable = ['first_name', 'last_name', 'blood_group', 'age', 'gender',
                     'phone', 'location', 'availability', 'notes']
        for field in updatable:
            if field in data:
                setattr(donor, field, data[field])
        if data.get('last_donation'):
            donor.last_donation = datetime.fromisoformat(data['last_donation'])
        donor.save()
        return JsonResponse({'donor': _donor_dict(donor)})

    elif request.method == 'DELETE':
        donor.delete()
        return JsonResponse({'message': 'Donor deleted'})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


def _donor_dict(d):
    return {
        'id': str(d.id),
        'first_name': d.first_name,
        'last_name': d.last_name,
        'blood_group': d.blood_group,
        'age': d.age,
        'gender': d.gender,
        'phone': d.phone,
        'location': d.location,
        'availability': d.availability,
        'last_donation': d.last_donation.date().isoformat() if d.last_donation else None,
        'notes': d.notes,
        'created_at': d.created_at.isoformat(),
    }


# ── HOSPITAL VIEWS ───────────────────────────────────────────────────────────

@csrf_exempt
@login_required
def hospitals(request):
    """
    GET  /api/hospitals/  — list hospitals
    POST /api/hospitals/  — create hospital
    """
    if request.method == 'GET':
        qs = Hospital.objects.all()
        h_type = request.GET.get('type')
        search = request.GET.get('q', '').strip()
        if h_type:
            qs = qs.filter(hospital_type=h_type)
        if search:
            qs = qs.filter(name__icontains=search)
        result = [_hospital_dict(h) for h in qs.order_by('name')]
        return JsonResponse({'hospitals': result, 'count': len(result)})

    elif request.method == 'POST':
        data = json_body(request)
        try:
            hospital = Hospital(
                name           = data['name'],
                hospital_type  = data.get('type', 'Public'),
                city           = data['city'],
                address        = data.get('address', ''),
                contact_person = data.get('contact_person', ''),
                phone          = data.get('phone', ''),
                email          = data.get('email', ''),
            )
            hospital.save()
            return JsonResponse({'hospital': _hospital_dict(hospital)}, status=201)
        except KeyError as e:
            return JsonResponse({'error': f'Missing field: {e}'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
@login_required
def hospital_detail(request, hospital_id):
    """
    GET    /api/hospitals/<id>/
    PUT    /api/hospitals/<id>/
    DELETE /api/hospitals/<id>/
    """
    try:
        hospital = Hospital.objects.get(id=hospital_id)
    except Hospital.DoesNotExist:
        return JsonResponse({'error': 'Hospital not found'}, status=404)

    if request.method == 'GET':
        return JsonResponse({'hospital': _hospital_dict(hospital)})

    elif request.method == 'PUT':
        data = json_body(request)
        for field in ['name', 'city', 'address', 'contact_person', 'phone', 'email']:
            if field in data:
                setattr(hospital, field, data[field])
        if 'type' in data:
            hospital.hospital_type = data['type']
        if 'is_active' in data:
            hospital.is_active = bool(data['is_active'])
        hospital.save()
        return JsonResponse({'hospital': _hospital_dict(hospital)})

    elif request.method == 'DELETE':
        hospital.delete()
        return JsonResponse({'message': 'Hospital deleted'})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


def _hospital_dict(h):
    return {
        'id': str(h.id),
        'name': h.name,
        'type': h.hospital_type,
        'city': h.city,
        'address': h.address,
        'contact_person': h.contact_person,
        'phone': h.phone,
        'email': h.email,
        'is_active': h.is_active,
        'created_at': h.created_at.isoformat(),
    }


# ── BLOOD REQUEST VIEWS ──────────────────────────────────────────────────────

@csrf_exempt
@login_required
def blood_requests(request):
    """
    GET  /api/requests/  — list requests (filter by status, blood_group)
    POST /api/requests/  — create request
    """
    if request.method == 'GET':
        qs = BloodRequest.objects.all()
        status      = request.GET.get('status')
        blood_group = request.GET.get('blood_group')
        if status:
            qs = qs.filter(status=status)
        if blood_group:
            qs = qs.filter(blood_group=blood_group)
        result = [_request_dict(r) for r in qs.order_by('-created_at')]
        return JsonResponse({'requests': result, 'count': len(result)})

    elif request.method == 'POST':
        data = json_body(request)
        try:
            hospital = Hospital.objects.get(id=data['hospital_id'])
            req = BloodRequest(
                hospital    = hospital,
                blood_group = data['blood_group'],
                units       = int(data['units']),
                urgency     = data.get('urgency', 'Standard'),
                status      = data.get('status', 'Pending'),
                notes       = data.get('notes', ''),
            )
            req.save()
            return JsonResponse({'request': _request_dict(req)}, status=201)
        except Hospital.DoesNotExist:
            return JsonResponse({'error': 'Hospital not found'}, status=404)
        except KeyError as e:
            return JsonResponse({'error': f'Missing field: {e}'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
@login_required
def request_detail(request, request_id):
    """
    GET    /api/requests/<id>/
    PUT    /api/requests/<id>/
    DELETE /api/requests/<id>/
    """
    try:
        req = BloodRequest.objects.get(id=request_id)
    except BloodRequest.DoesNotExist:
        return JsonResponse({'error': 'Request not found'}, status=404)

    if request.method == 'GET':
        return JsonResponse({'request': _request_dict(req)})

    elif request.method == 'PUT':
        data = json_body(request)
        for field in ['blood_group', 'units', 'urgency', 'status', 'notes']:
            if field in data:
                setattr(req, field, data[field])
        if 'hospital_id' in data:
            try:
                req.hospital = Hospital.objects.get(id=data['hospital_id'])
            except Hospital.DoesNotExist:
                return JsonResponse({'error': 'Hospital not found'}, status=404)
        req.save()
        return JsonResponse({'request': _request_dict(req)})

    elif request.method == 'DELETE':
        req.delete()
        return JsonResponse({'message': 'Request deleted'})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


def _request_dict(r):
    return {
        'id': str(r.id),
        'hospital': _hospital_dict(r.hospital) if r.hospital else None,
        'blood_group': r.blood_group,
        'units': r.units,
        'urgency': r.urgency,
        'status': r.status,
        'notes': r.notes,
        'created_at': r.created_at.isoformat(),
    }


# ── DASHBOARD STATS ──────────────────────────────────────────────────────────

@login_required
def stats(request):
    """GET /api/stats/  — dashboard summary numbers"""
    blood_dist = {}
    for group in ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'):
        blood_dist[group] = Donor.objects(blood_group=group).count()

    return JsonResponse({
        'total_donors':      Donor.objects.count(),
        'available_donors':  Donor.objects(availability='Available').count(),
        'total_hospitals':   Hospital.objects.count(),
        'active_requests':   BloodRequest.objects(status__in=['Pending', 'Urgent']).count(),
        'completed':         BloodRequest.objects(status='Completed').count(),
        'blood_distribution': blood_dist,
    })