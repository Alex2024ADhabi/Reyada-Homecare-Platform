# Administrative Modules API Documentation

## Base URL
```
https://api.reyadahomecare.ae/v1
```

## Authentication
All endpoints require JWT authentication via Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Attendance Management

### Get Attendance Records
```http
GET /attendance/records
```

**Query Parameters:**
- `employee_id` (optional): Filter by employee
- `department` (optional): Filter by department
- `date_from` (optional): Start date (YYYY-MM-DD)
- `date_to` (optional): End date (YYYY-MM-DD)
- `status` (optional): Filter by status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012345",
      "employee_id": "EMP001",
      "employee_name": "Ahmed Al Mansouri",
      "date": "2024-01-15",
      "shift": "Morning",
      "actual_start": "08:00",
      "actual_end": "16:00",
      "total_hours": 8,
      "status": "present",
      "supervisor_approval": "approved"
    }
  ],
  "total": 1
}
```

### Clock In
```http
POST /attendance/clock-in
```

**Request Body:**
```json
{
  "employee_id": "EMP001",
  "location": "Main Office",
  "notes": "On time arrival"
}
```

### Clock Out
```http
POST /attendance/clock-out
```

**Request Body:**
```json
{
  "employee_id": "EMP001",
  "notes": "Completed all tasks"
}
```

### Get Attendance Analytics
```http
GET /attendance/analytics
```

**Query Parameters:**
- `department` (optional): Filter by department
- `date_from` (optional): Start date
- `date_to` (optional): End date

## Daily Planning

### Get Daily Plans
```http
GET /daily-planning/plans
```

**Query Parameters:**
- `date_from` (optional): Start date
- `date_to` (optional): End date
- `status` (optional): Plan status
- `team_lead` (optional): Filter by team lead

### Create Daily Plan
```http
POST /daily-planning/plans
```

**Request Body:**
```json
{
  "date": "2024-01-15",
  "shift": "Morning",
  "team_lead": "Dr. Sarah Ahmed",
  "department": "Nursing",
  "total_patients": 25,
  "high_priority_patients": 5,
  "staff_assigned": [
    {
      "employee_id": "EMP001",
      "name": "Ahmed Al Mansouri",
      "role": "Nurse",
      "patients_assigned": 8,
      "specialization": "General Care"
    }
  ],
  "objectives": [
    "Complete all scheduled visits",
    "Ensure medication compliance"
  ]
}
```

### Submit Daily Update
```http
POST /daily-planning/updates
```

**Request Body:**
```json
{
  "plan_id": "PLAN-20240115-001",
  "update_type": "progress",
  "patients_completed": 15,
  "patients_remaining": 10,
  "performance_metrics": {
    "efficiency_rate": 85,
    "quality_score": 92,
    "patient_satisfaction": 88,
    "safety_incidents": 0
  }
}
```

## Incident Management

### Get Incident Reports
```http
GET /incident-management/reports
```

**Query Parameters:**
- `incident_type` (optional): Type of incident
- `severity` (optional): Severity level
- `status` (optional): Report status
- `date_from` (optional): Start date
- `date_to` (optional): End date

### Create Incident Report
```http
POST /incident-management/reports
```

**Request Body:**
```json
{
  "incident_type": "safety",
  "severity": "medium",
  "incident_date": "2024-01-15",
  "incident_time": "14:30",
  "location": "Patient Home - Villa 123",
  "description": "Patient slipped in bathroom",
  "immediate_actions": "Assisted patient, checked for injuries",
  "patient_id": "PAT001",
  "reported_by": "Dr. Sarah Ahmed"
}
```

### Approve Incident Report
```http
PUT /incident-management/reports/{id}/approve
```

**Request Body:**
```json
{
  "approved_by": "Dr. Sarah Ahmed",
  "comments": "Incident properly documented and handled"
}
```

### Add Corrective Action
```http
POST /incident-management/corrective-actions
```

**Request Body:**
```json
{
  "incident_id": "64a1b2c3d4e5f6789012345",
  "description": "Install grab bars in bathroom",
  "assigned_to": "Maintenance Team",
  "due_date": "2024-01-22",
  "status": "pending"
}
```

## Quality Management

### Get Quality Initiatives
```http
GET /quality-management/initiatives
```

**Query Parameters:**
- `quality_type` (optional): Type of quality initiative
- `status` (optional): Initiative status
- `priority` (optional): Priority level
- `department` (optional): Department filter

### Create Quality Initiative
```http
POST /quality-management/initiatives
```

**Request Body:**
```json
{
  "quality_type": "patient_safety",
  "title": "Medication Error Reduction Program",
  "description": "Implement double-check system for medications",
  "department": "Nursing",
  "priority": "high",
  "responsible_person": "Dr. Sarah Ahmed",
  "start_date": "2024-01-15",
  "target_completion_date": "2024-03-15",
  "quality_metrics": {
    "baseline_value": 5,
    "target_value": 1,
    "measurement_unit": "errors per month"
  }
}
```

### Get JAWDA KPI Records
```http
GET /jawda-kpi/records
```

### Create JAWDA KPI Record
```http
POST /jawda-kpi/records
```

**Request Body:**
```json
{
  "kpi_name": "Patient Satisfaction Rate",
  "kpi_category": "patient_experience",
  "measurement_period": "2024-01",
  "target_value": 90,
  "actual_value": 92,
  "data_source": "Patient Surveys",
  "responsible_department": "Quality Assurance"
}
```

## Reporting

### Get Report Templates
```http
GET /reporting/templates
```

**Query Parameters:**
- `category` (optional): Report category

### Create Report Template
```http
POST /reporting/templates
```

**Request Body:**
```json
{
  "name": "Monthly Attendance Report",
  "description": "Comprehensive attendance analysis",
  "category": "operational",
  "data_sources": ["staff_attendance", "timesheet_summary"],
  "parameters": [
    {
      "name": "month",
      "type": "date",
      "required": true
    },
    {
      "name": "department",
      "type": "select",
      "required": false,
      "options": ["Nursing", "Therapy", "Administration"]
    }
  ],
  "template_config": {
    "format": "pdf",
    "layout": "dashboard"
  }
}
```

### Generate Report
```http
POST /reporting/generate
```

**Request Body:**
```json
{
  "template_id": "64a1b2c3d4e5f6789012345",
  "parameters": {
    "month": "2024-01",
    "department": "Nursing"
  },
  "generated_by": "Dr. Sarah Ahmed"
}
```

### Get Report Schedules
```http
GET /reporting/schedules
```

### Create Report Schedule
```http
POST /reporting/schedules
```

**Request Body:**
```json
{
  "template_id": "64a1b2c3d4e5f6789012345",
  "name": "Monthly Attendance Auto-Report",
  "frequency": "monthly",
  "schedule_config": {
    "day_of_month": 1,
    "time": "08:00",
    "timezone": "Asia/Dubai"
  },
  "recipients": ["manager@reyadahomecare.ae"],
  "parameters": {
    "department": "All"
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "employee_id",
      "issue": "Required field missing"
    }
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Invalid request data
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource already exists
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

- **Standard endpoints**: 100 requests per 15 minutes
- **Administrative endpoints**: 200 requests per 5 minutes
- **Reporting endpoints**: 50 requests per hour

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```
