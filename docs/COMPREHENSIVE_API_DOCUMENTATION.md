# Reyada Homecare Platform - Comprehensive API Documentation

## Overview

The Reyada Homecare Platform provides a comprehensive RESTful API for managing healthcare operations, compliance, and administrative functions. This documentation covers all endpoints, authentication, data models, and integration patterns.

## Base Configuration

### Base URLs
- **Production**: `https://api.reyadahomecare.ae/v1`
- **Staging**: `https://staging-api.reyadahomecare.ae/v1`
- **Development**: `http://localhost:3001/api/v1`

### Authentication

All API endpoints require JWT authentication:

```http
Authorization: Bearer <jwt_token>
```

#### Authentication Flow

1. **Login**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@reyadahomecare.ae",
  "password": "secure_password",
  "role": "physician|nurse|administrator"
}
```

2. **Response**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "user": {
      "id": "user_123",
      "email": "user@reyadahomecare.ae",
      "role": "physician",
      "permissions": ["read:patients", "write:clinical_notes"]
    }
  }
}
```

3. **Token Refresh**
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Core API Modules

### 1. Patient Management API

#### Get Patients
```http
GET /patients
```

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20, max: 100)
- `search` (string): Search by name, Emirates ID, or MRN
- `status` (string): Filter by status (active|inactive|discharged)
- `insurance_provider` (string): Filter by insurance provider
- `date_from` (string): Filter by registration date (YYYY-MM-DD)
- `date_to` (string): Filter by registration date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pat_123",
      "mrn": "MRN-2024-001",
      "emirates_id": "784-1234-5678901-2",
      "personal_info": {
        "first_name": "Ahmed",
        "last_name": "Al Mansouri",
        "date_of_birth": "1980-05-15",
        "gender": "male",
        "nationality": "UAE",
        "phone": "+971501234567",
        "email": "ahmed.almansouri@email.com"
      },
      "address": {
        "street": "Sheikh Zayed Road",
        "city": "Dubai",
        "emirate": "Dubai",
        "postal_code": "12345"
      },
      "insurance": {
        "provider": "Daman",
        "policy_number": "POL-123456",
        "coverage_type": "comprehensive",
        "expiry_date": "2024-12-31"
      },
      "medical_info": {
        "allergies": ["Penicillin", "Shellfish"],
        "chronic_conditions": ["Diabetes Type 2", "Hypertension"],
        "current_medications": [
          {
            "name": "Metformin",
            "dosage": "500mg",
            "frequency": "twice daily"
          }
        ]
      },
      "status": "active",
      "created_at": "2024-01-15T08:00:00Z",
      "updated_at": "2024-01-15T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### Create Patient
```http
POST /patients
Content-Type: application/json

{
  "emirates_id": "784-1234-5678901-2",
  "personal_info": {
    "first_name": "Ahmed",
    "last_name": "Al Mansouri",
    "date_of_birth": "1980-05-15",
    "gender": "male",
    "nationality": "UAE",
    "phone": "+971501234567",
    "email": "ahmed.almansouri@email.com"
  },
  "address": {
    "street": "Sheikh Zayed Road",
    "city": "Dubai",
    "emirate": "Dubai",
    "postal_code": "12345"
  },
  "insurance": {
    "provider": "Daman",
    "policy_number": "POL-123456",
    "coverage_type": "comprehensive"
  },
  "emergency_contact": {
    "name": "Fatima Al Mansouri",
    "relationship": "spouse",
    "phone": "+971501234568"
  }
}
```

#### Update Patient
```http
PUT /patients/{patient_id}
Content-Type: application/json

{
  "personal_info": {
    "phone": "+971501234567",
    "email": "newemail@email.com"
  },
  "address": {
    "street": "New Address Street",
    "city": "Abu Dhabi",
    "emirate": "Abu Dhabi"
  }
}
```

#### Get Patient Details
```http
GET /patients/{patient_id}
```

#### Patient Episodes
```http
GET /patients/{patient_id}/episodes
POST /patients/{patient_id}/episodes
PUT /patients/{patient_id}/episodes/{episode_id}
```

### 2. Clinical Documentation API

#### Clinical Forms

##### Initial Assessment
```http
POST /clinical/assessments/initial
Content-Type: application/json

{
  "patient_id": "pat_123",
  "episode_id": "ep_456",
  "assessment_date": "2024-01-15T10:00:00Z",
  "vital_signs": {
    "blood_pressure": {
      "systolic": 120,
      "diastolic": 80
    },
    "heart_rate": 72,
    "temperature": 36.5,
    "respiratory_rate": 16,
    "oxygen_saturation": 98,
    "weight": 75.5,
    "height": 175
  },
  "chief_complaint": "Shortness of breath and chest pain",
  "history_present_illness": "Patient reports...",
  "past_medical_history": ["Diabetes", "Hypertension"],
  "medications": [
    {
      "name": "Metformin",
      "dosage": "500mg",
      "frequency": "BID",
      "route": "oral"
    }
  ],
  "allergies": ["Penicillin"],
  "social_history": {
    "smoking": "never",
    "alcohol": "occasional",
    "exercise": "moderate"
  },
  "physical_examination": {
    "general": "Alert and oriented",
    "cardiovascular": "Regular rate and rhythm",
    "respiratory": "Clear to auscultation",
    "neurological": "Grossly intact"
  },
  "assessment_plan": "Continue current medications...",
  "clinician_id": "doc_789",
  "digital_signature": {
    "signature_data": "base64_encoded_signature",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

##### Vital Signs
```http
POST /clinical/vital-signs
Content-Type: application/json

{
  "patient_id": "pat_123",
  "episode_id": "ep_456",
  "measurement_time": "2024-01-15T14:00:00Z",
  "vital_signs": {
    "blood_pressure": {
      "systolic": 125,
      "diastolic": 82,
      "position": "sitting",
      "arm": "left"
    },
    "heart_rate": 75,
    "temperature": {
      "value": 36.8,
      "method": "oral"
    },
    "respiratory_rate": 18,
    "oxygen_saturation": {
      "value": 97,
      "on_oxygen": false
    },
    "pain_scale": 3,
    "glucose": {
      "value": 140,
      "method": "fingerstick",
      "timing": "post_meal"
    }
  },
  "notes": "Patient reports feeling better",
  "measured_by": "nurse_456"
}
```

##### Medication Administration
```http
POST /clinical/medications/administration
Content-Type: application/json

{
  "patient_id": "pat_123",
  "episode_id": "ep_456",
  "medication": {
    "name": "Metformin",
    "dosage": "500mg",
    "route": "oral",
    "frequency": "BID"
  },
  "administration": {
    "administered_time": "2024-01-15T08:00:00Z",
    "administered_by": "nurse_456",
    "witnessed_by": "nurse_789",
    "method": "oral",
    "site": null,
    "patient_response": "tolerated well"
  },
  "notes": "Patient took medication without issues"
}
```

### 3. DOH Compliance API

#### Nine Domains Assessment
```http
POST /compliance/doh/nine-domains
Content-Type: application/json

{
  "patient_id": "pat_123",
  "episode_id": "ep_456",
  "assessment_date": "2024-01-15T10:00:00Z",
  "domains": {
    "domain_1_patient_safety": {
      "score": 85,
      "indicators": [
        {
          "indicator": "Medication reconciliation completed",
          "status": "compliant",
          "evidence": "Documented in clinical notes"
        }
      ]
    },
    "domain_2_clinical_effectiveness": {
      "score": 90,
      "indicators": [
        {
          "indicator": "Evidence-based care protocols followed",
          "status": "compliant",
          "evidence": "Care plan follows DOH guidelines"
        }
      ]
    },
    "domain_3_patient_experience": {
      "score": 88,
      "indicators": [
        {
          "indicator": "Patient satisfaction survey completed",
          "status": "compliant",
          "evidence": "Survey score: 4.5/5"
        }
      ]
    }
  },
  "overall_score": 87.7,
  "compliance_status": "compliant",
  "assessor_id": "qa_123"
}
```

#### JAWDA KPI Submission
```http
POST /compliance/jawda/kpi
Content-Type: application/json

{
  "reporting_period": "2024-01",
  "facility_id": "RHC-001",
  "kpis": [
    {
      "kpi_code": "PS-001",
      "kpi_name": "Patient Safety Incidents",
      "target_value": 0,
      "actual_value": 0,
      "measurement_unit": "incidents",
      "data_source": "Incident Management System",
      "compliance_status": "achieved"
    },
    {
      "kpi_code": "CE-002",
      "kpi_name": "Clinical Effectiveness Score",
      "target_value": 85,
      "actual_value": 87.5,
      "measurement_unit": "percentage",
      "data_source": "Clinical Assessment System",
      "compliance_status": "exceeded"
    }
  ],
  "submitted_by": "qa_manager_123",
  "submission_date": "2024-02-01T09:00:00Z"
}
```

### 4. Daman Integration API

#### Authorization Request
```http
POST /insurance/daman/authorization
Content-Type: application/json

{
  "patient_id": "pat_123",
  "policy_number": "POL-123456",
  "service_request": {
    "service_type": "home_nursing",
    "service_codes": ["HN-001", "HN-002"],
    "requested_sessions": 10,
    "duration_weeks": 4,
    "frequency": "daily",
    "clinical_justification": "Patient requires daily wound care and medication management post-surgery"
  },
  "clinical_information": {
    "diagnosis_codes": ["Z51.11", "Z48.00"],
    "diagnosis_description": "Post-surgical care, wound management",
    "physician_notes": "Patient recovering from abdominal surgery...",
    "supporting_documents": [
      {
        "type": "discharge_summary",
        "document_id": "doc_789"
      }
    ]
  },
  "requesting_physician": {
    "id": "doc_123",
    "name": "Dr. Sarah Ahmed",
    "license_number": "DOH-12345",
    "specialty": "Internal Medicine"
  },
  "urgency": "routine"
}
```

#### Authorization Status Check
```http
GET /insurance/daman/authorization/{authorization_id}/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "authorization_id": "AUTH-789",
    "status": "approved",
    "approved_sessions": 8,
    "approved_duration": "3 weeks",
    "conditions": [
      "Weekly progress reports required",
      "Re-assessment after 2 weeks"
    ],
    "valid_from": "2024-01-15",
    "valid_until": "2024-02-05",
    "reference_number": "DAMAN-REF-123456"
  }
}
```

### 5. Revenue Management API

#### Claims Submission
```http
POST /revenue/claims
Content-Type: application/json

{
  "patient_id": "pat_123",
  "episode_id": "ep_456",
  "insurance_provider": "Daman",
  "authorization_number": "AUTH-789",
  "claim_items": [
    {
      "service_code": "HN-001",
      "service_description": "Home Nursing Visit",
      "quantity": 5,
      "unit_price": 150.00,
      "total_amount": 750.00,
      "service_dates": [
        "2024-01-15",
        "2024-01-16",
        "2024-01-17",
        "2024-01-18",
        "2024-01-19"
      ]
    }
  ],
  "total_claim_amount": 750.00,
  "supporting_documents": [
    {
      "type": "clinical_notes",
      "document_ids": ["note_123", "note_124"]
    },
    {
      "type": "authorization",
      "document_ids": ["auth_789"]
    }
  ],
  "submitted_by": "billing_clerk_456"
}
```

#### Payment Reconciliation
```http
POST /revenue/payments/reconciliation
Content-Type: application/json

{
  "payment_batch_id": "BATCH-2024-001",
  "insurance_provider": "Daman",
  "payment_date": "2024-01-30",
  "total_payment_amount": 1250.00,
  "claim_payments": [
    {
      "claim_id": "claim_123",
      "approved_amount": 750.00,
      "paid_amount": 675.00,
      "adjustment_amount": 75.00,
      "adjustment_reason": "Contractual adjustment",
      "status": "paid"
    }
  ]
}
```

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "emirates_id",
      "issue": "Invalid format",
      "expected_format": "XXX-XXXX-XXXXXXX-X"
    },
    "request_id": "req_123456789",
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

## Rate Limiting

### Rate Limits by Endpoint Category

| Category | Requests per Minute | Burst Limit |
|----------|--------------------|--------------|
| Authentication | 10 | 20 |
| Patient Management | 100 | 200 |
| Clinical Documentation | 200 | 400 |
| Compliance Reporting | 50 | 100 |
| Insurance Integration | 30 | 60 |
| Revenue Management | 50 | 100 |

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642680000
X-RateLimit-Retry-After: 60
```

## Webhooks

### Webhook Events

#### Patient Events
- `patient.created`
- `patient.updated`
- `patient.episode.started`
- `patient.episode.completed`

#### Clinical Events
- `assessment.completed`
- `medication.administered`
- `vital_signs.recorded`

#### Compliance Events
- `doh.assessment.submitted`
- `jawda.kpi.reported`
- `audit.completed`

#### Insurance Events
- `authorization.approved`
- `authorization.denied`
- `claim.submitted`
- `payment.received`

### Webhook Payload Example
```json
{
  "event": "patient.created",
  "timestamp": "2024-01-15T10:00:00Z",
  "data": {
    "patient_id": "pat_123",
    "mrn": "MRN-2024-001",
    "created_by": "user_456"
  },
  "webhook_id": "wh_789",
  "signature": "sha256=abc123..."
}
```

## SDK and Integration Examples

### JavaScript/Node.js
```javascript
const ReyadaAPI = require('@reyada/api-client');

const client = new ReyadaAPI({
  apiKey: 'your_api_key',
  baseURL: 'https://api.reyadahomecare.ae/v1'
});

// Create a patient
const patient = await client.patients.create({
  emirates_id: '784-1234-5678901-2',
  personal_info: {
    first_name: 'Ahmed',
    last_name: 'Al Mansouri',
    // ... other fields
  }
});

// Submit clinical assessment
const assessment = await client.clinical.assessments.create({
  patient_id: patient.id,
  assessment_type: 'initial',
  // ... assessment data
});
```

### Python
```python
from reyada_api import ReyadaClient

client = ReyadaClient(
    api_key='your_api_key',
    base_url='https://api.reyadahomecare.ae/v1'
)

# Create patient
patient = client.patients.create({
    'emirates_id': '784-1234-5678901-2',
    'personal_info': {
        'first_name': 'Ahmed',
        'last_name': 'Al Mansouri'
    }
})

# Submit Daman authorization
authorization = client.insurance.daman.authorize({
    'patient_id': patient['id'],
    'service_type': 'home_nursing',
    'requested_sessions': 10
})
```

## Testing and Development

### Sandbox Environment
- **Base URL**: `https://sandbox-api.reyadahomecare.ae/v1`
- **Test Credentials**: Provided upon request
- **Test Data**: Pre-populated with sample patients and episodes

### Postman Collection
Download our comprehensive Postman collection:
- [Reyada API Collection](https://api.reyadahomecare.ae/docs/postman-collection.json)

### OpenAPI Specification
Access our OpenAPI 3.0 specification:
- [OpenAPI Spec](https://api.reyadahomecare.ae/docs/openapi.json)
- [Swagger UI](https://api.reyadahomecare.ae/docs/swagger)

## Support and Resources

### Documentation
- [API Reference](https://docs.reyadahomecare.ae/api)
- [Integration Guides](https://docs.reyadahomecare.ae/guides)
- [Troubleshooting](https://docs.reyadahomecare.ae/troubleshooting)

### Support Channels
- **Technical Support**: api-support@reyadahomecare.ae
- **Business Inquiries**: partnerships@reyadahomecare.ae
- **Emergency Support**: +971-4-XXX-XXXX (24/7)

### Status Page
- [System Status](https://status.reyadahomecare.ae)
- [Maintenance Schedule](https://status.reyadahomecare.ae/maintenance)

---

*Last Updated: January 2024*
*Version: 1.0.0*
