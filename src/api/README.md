# Reyada Homecare API Documentation

## Referral API Endpoints

### Base URL
`/api/referrals`

### Endpoints

#### Get All Referrals
- **URL**: `/`
- **Method**: `GET`
- **Description**: Retrieves all referrals
- **Response**: Array of referral objects

#### Get Referral by ID
- **URL**: `/:id`
- **Method**: `GET`
- **Description**: Retrieves a specific referral by ID
- **Response**: Referral object

#### Create New Referral
- **URL**: `/`
- **Method**: `POST`
- **Description**: Creates a new referral
- **Request Body**: Referral object without ID
- **Response**: Created referral object with ID

#### Update Referral
- **URL**: `/:id`
- **Method**: `PUT`
- **Description**: Updates an existing referral
- **Request Body**: Partial referral object
- **Response**: Updated referral object

#### Delete Referral
- **URL**: `/:id`
- **Method**: `DELETE`
- **Description**: Deletes a referral
- **Response**: No content (204)

#### Acknowledge Referral
- **URL**: `/:id/acknowledge`
- **Method**: `PATCH`
- **Description**: Acknowledges a referral
- **Request Body**: `{ "acknowledgedBy": "username" }`
- **Response**: Updated referral object

#### Assign Staff to Referral
- **URL**: `/:id/assign`
- **Method**: `PATCH`
- **Description**: Assigns staff to a referral
- **Request Body**: `{ "nurseSupervisor": "name", "chargeNurse": "name", "caseCoordinator": "name", "assessmentDate": "2023-06-01" }`
- **Response**: Updated referral object

#### Update Referral Status
- **URL**: `/:id/status`
- **Method**: `PATCH`
- **Description**: Updates the status of a referral
- **Request Body**: `{ "referralStatus": "In Progress", "statusNotes": "Optional notes" }`
- **Response**: Updated referral object

#### Mark Initial Contact as Completed
- **URL**: `/:id/contact`
- **Method**: `PATCH`
- **Description**: Marks initial contact as completed
- **Request Body**: `{ "initialContactCompleted": true }`
- **Response**: Updated referral object

#### Mark Documentation as Prepared
- **URL**: `/:id/documentation`
- **Method**: `PATCH`
- **Description**: Marks documentation as prepared
- **Request Body**: `{ "documentationPrepared": true }`
- **Response**: Updated referral object

#### Get Referrals by Status
- **URL**: `/status/:status`
- **Method**: `GET`
- **Description**: Retrieves referrals by status
- **Response**: Array of referral objects

#### Get Referrals by Source
- **URL**: `/source/:source`
- **Method**: `GET`
- **Description**: Retrieves referrals by source
- **Response**: Array of referral objects

#### Get Referrals by Date Range
- **URL**: `/date-range`
- **Method**: `GET`
- **Query Parameters**: `startDate`, `endDate`
- **Description**: Retrieves referrals within a date range
- **Response**: Array of referral objects

## Database Schema

### Referral Collection

```json
{
  "_id": "ObjectId",
  "referralDate": "Date",
  "referralSource": "String",
  "referralSourceContact": "String",
  "patientName": "String",
  "patientContact": "String",
  "preliminaryNeeds": "String",
  "insuranceInfo": "String",
  "geographicLocation": "String",
  "acknowledgmentStatus": "Enum['Pending', 'Acknowledged', 'Processed']",
  "acknowledgmentDate": "Date (optional)",
  "acknowledgedBy": "String (optional)",
  "assignedNurseSupervisor": "String (optional)",
  "assignedChargeNurse": "String (optional)",
  "assignedCaseCoordinator": "String (optional)",
  "assessmentScheduledDate": "Date (optional)",
  "initialContactCompleted": "Boolean",
  "documentationPrepared": "Boolean",
  "referralStatus": "Enum['New', 'In Progress', 'Accepted', 'Declined']",
  "statusNotes": "String (optional)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Offline Support

The API includes offline support through IndexedDB. When the API is unavailable, the system will:

1. Store operations locally
2. Sync with the server when connectivity is restored
3. Provide seamless user experience regardless of connection status

## Error Handling

All endpoints include proper error handling with appropriate HTTP status codes:

- 200: Success
- 201: Created
- 204: No Content (successful deletion)
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

## Authentication and Authorization

All API endpoints require authentication. Users can only access resources based on their role permissions.
