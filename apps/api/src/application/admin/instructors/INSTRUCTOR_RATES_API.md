# Instructor Rates API Documentation

## Overview

This API provides endpoints for managing instructor hourly rates and calculating instructor salaries. The system supports default rates, course-specific rates, and class-specific rates with a hierarchical priority system.

## Base URLs

- **Admin API**: `/admin/instructors`
- **Student API**: `/student/instructors`

## Authentication

All endpoints require authentication using Bearer tokens.

## Admin Endpoints

### 1. Create Instructor Rate

**POST** `/admin/instructors/:userRoleId/rates`

Creates a new hourly rate for an instructor.

**Request Body:**

```json
{
  "userRoleId": 123,
  "courseId": 456, // Optional - for course-specific rates
  "classIds": [1, 2, 3], // Optional - for class-specific rates
  "hourlyRate": 350.0,
  "isDefaultRate": false, // Optional - defaults to false
  "isActive": true, // Optional - defaults to true
  "effectiveUntil": "2024-12-31T23:59:59Z" // Optional
}
```

**Response:**

```json
{
  "id": 1,
  "userRoleId": 123,
  "courseId": 456,
  "classIds": [1, 2, 3],
  "hourlyRate": 350.0,
  "isDefaultRate": false,
  "isActive": true,
  "effectiveUntil": "2024-12-31T23:59:59Z",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "user": {
    "id": 123,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  },
  "course": {
    "id": 456,
    "name": "Mathematics"
  },
  "classes": [
    {
      "id": 1,
      "name": "Class A"
    }
  ]
}
```

### 2. Get Instructor Rates

**GET** `/admin/instructors/:userRoleId/rates`

Retrieves all rates for a specific instructor.

**Response:**

```json
[
  {
    "id": 1,
    "userRoleId": 123,
    "courseId": null,
    "classIds": null,
    "hourlyRate": 350.00,
    "isDefaultRate": true,
    "isActive": true,
    "effectiveUntil": null,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "user": { ... },
    "course": null,
    "classes": null
  },
  {
    "id": 2,
    "userRoleId": 123,
    "courseId": 456,
    "classIds": null,
    "hourlyRate": 400.00,
    "isDefaultRate": false,
    "isActive": true,
    "effectiveUntil": null,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "user": { ... },
    "course": { ... },
    "classes": null
  }
]
```

### 3. Update Instructor Rate

**PUT** `/admin/instructors/:userRoleId/rates/:rateId`

Updates an existing instructor rate.

**Request Body:**

```json
{
  "hourlyRate": 375.0,
  "isActive": false
}
```

### 4. Delete Instructor Rate

**DELETE** `/admin/instructors/:userRoleId/rates/:rateId`

Soft deletes an instructor rate.

### 5. Bulk Update Instructor Rates

**PUT** `/admin/instructors/:userRoleId/rates`

Updates multiple rates at once (useful for the modal UI).

**Request Body:**

```json
[
  {
    "id": 1,
    "hourlyRate": 350.0
  },
  {
    "id": 2,
    "hourlyRate": 400.0
  },
  {
    "userRoleId": 123,
    "courseId": 789,
    "classIds": [4, 5],
    "hourlyRate": 450.0,
    "isDefaultRate": false
  }
] 
```

### 7. Export Instructor Salary
**GET** `/admin/instructors/:userId/salary/export`

Same as salary calculation but intended for CSV export functionality.

## Student Endpoints (For Instructors)

### 1. Get My Rates
**GET** `/student/instructors/my/rates`

Instructors can view their own rates.

### 2. Calculate My Salary
**GET** `/student/instructors/my/salary`

Instructors can calculate their own salary.

## Rate Hierarchy Logic

The system applies rates in the following priority order:

1. **Class-Specific Rate** (highest priority)
   - `courseId` = specific course
   - `classIds` = specific classes
   - `isDefaultRate` = false

2. **Course-Specific Rate** (medium priority)
   - `courseId` = specific course
   - `classIds` = null
   - `isDefaultRate` = false

3. **Default Rate** (lowest priority)
   - `courseId` = null
   - `classIds` = null
   - `isDefaultRate` = true

## Frontend Integration Examples

### 1. Manage Hourly Rates Modal

```javascript
// Get instructor rates for modal
const getInstructorRates = async (userId) => {
  const response = await fetch(`/admin/instructors/${userId}/rates`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Save changes from modal
const saveInstructorRates = async (userId, rates) => {
  const response = await fetch(`/admin/instructors/${userId}/rates`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(rates)
  });
  return response.json();
};
````

### 2. Salary Calculation Page

```javascript
// Get salary data with filters
const getInstructorSalary = async (userId, filters) => {
  const params = new URLSearchParams(filters)
  const response = await fetch(`/admin/instructors/${userId}/salary?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.json()
}

// Export salary data
const exportInstructorSalary = async (userId, filters) => {
  const params = new URLSearchParams(filters)
  const response = await fetch(`/admin/instructors/${userId}/salary/export?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.json()
}
```

### 3. Instructor Self-Service

```javascript
// Instructor views their own rates
const getMyRates = async () => {
  const response = await fetch('/student/instructors/my/rates', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.json()
}

// Instructor calculates their own salary
const getMySalary = async (filters) => {
  const params = new URLSearchParams(filters)
  const response = await fetch(`/student/instructors/my/salary?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.json()
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

Error responses include a message field:

```json
{
  "message": "Instructor rate with ID 123 not found",
  "statusCode": 404
}
```

## Notes

1. **Rate Validation**: The system ensures that only one rate exists per instructor/course/class combination.
2. **Effective Dates**: Rates can have effective dates to support rate changes over time.
3. **Soft Delete**: Deleted rates are soft-deleted and can be restored if needed.
4. **Multi-tenancy**: All endpoints are scoped to the current institution and site.
5. **Permissions**: Admin endpoints require admin authentication, student endpoints require instructor authentication.
