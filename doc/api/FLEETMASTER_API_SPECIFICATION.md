# FleetMaster Pro - RESTful API Specification

## Overview

This document provides comprehensive API specifications for the FleetMaster Pro backend system. The API supports complete fleet management functionality including vehicle tracking, maintenance planning, service records, and alert management.

## Base Configuration

- **Base URL**: `http://localhost:8080/api` (Development)
- **Production URL**: `https://api.yourserver.com/api`
- **Content-Type**: `application/json`
- **API Version**: `v1`

## Common Response Patterns

### Success Response Format
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { /* additional error details */ }
  }
}
```

### Pagination Response Format
```json
{
  "success": true,
  "data": { /* array of items */ },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (duplicate)
- `422 Unprocessable Entity` - Validation errors
- `500 Internal Server Error` - Server error

---

# 🚗 Cars API

## Data Model

```typescript
interface Car {
  id: string;              // Unique identifier
  name: string;            // Display name
  brand: string;           // Manufacturer
  model: string;           // Model name
  year: number;            // Manufacturing year
  vin?: string;            // Vehicle Identification Number
  plateNumber?: string;    // License plate
  mileage: number;         // Current mileage
  image?: string;          // Image URL/path
  lastService?: string;    // Last service date (ISO 8601)
  nextService?: string;    // Next service date (ISO 8601)
  createdAt: string;       // Creation timestamp (ISO 8601)
}
```

## Endpoints

### GET /cars
Retrieve all cars with optional filtering, searching, and pagination.

**Query Parameters:**
- `page` (integer, optional) - Page number (default: 1)
- `limit` (integer, optional) - Items per page (default: 20, max: 100)
- `search` (string, optional) - Search in name, brand, model, plate number
- `brand` (string, optional) - Filter by brand
- `year` (integer, optional) - Filter by year
- `minMileage` (integer, optional) - Minimum mileage filter
- `maxMileage` (integer, optional) - Maximum mileage filter
- `sortBy` (string, optional) - Sort field: name, brand, model, year, mileage, createdAt
- `sortOrder` (string, optional) - Sort order: asc, desc (default: asc)

**Example Request:**
```http
GET /api/cars?page=1&limit=10&search=Toyota&sortBy=mileage&sortOrder=desc
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "car_123",
      "name": "Транспорт #1",
      "brand": "Toyota",
      "model": "Camry",
      "year": 2020,
      "vin": "1234567890ABCDEFG",
      "plateNumber": "А123БВ177",
      "mileage": 85000,
      "image": "/uploads/cars/car_123.jpg",
      "lastService": "2024-07-15T00:00:00Z",
      "nextService": "2024-09-15T00:00:00Z",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### GET /cars/{id}
Retrieve a specific car by ID.

**Path Parameters:**
- `id` (string, required) - Car identifier

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "car_123",
    "name": "Транспорт #1",
    "brand": "Toyota",
    "model": "Camry",
    "year": 2020,
    "vin": "1234567890ABCDEFG",
    "plateNumber": "А123БВ177",
    "mileage": 85000,
    "image": "/uploads/cars/car_123.jpg",
    "lastService": "2024-07-15T00:00:00Z",
    "nextService": "2024-09-15T00:00:00Z",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "CAR_NOT_FOUND",
    "message": "Car with ID 'car_123' not found"
  }
}
```

### POST /cars
Create a new car with optional image upload.

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `name` (string, required) - Display name
- `brand` (string, required) - Manufacturer
- `model` (string, required) - Model name
- `year` (integer, required) - Manufacturing year (1900-current year)
- `vin` (string, optional) - Vehicle Identification Number
- `plateNumber` (string, optional) - License plate
- `mileage` (integer, required) - Current mileage (≥ 0)
- `lastService` (string, optional) - Last service date (ISO 8601)
- `nextService` (string, optional) - Next service date (ISO 8601)
- `image` (file, optional) - Car image (JPG, PNG, max 5MB)

**Example cURL Request:**
```bash
curl -X POST http://localhost:8080/api/cars \
  -F "name=Мой автомобиль" \
  -F "brand=Toyota" \
  -F "model=Camry" \
  -F "year=2020" \
  -F "vin=1234567890ABCDEFG" \
  -F "plateNumber=А123БВ177" \
  -F "mileage=85000" \
  -F "lastService=2024-07-15T00:00:00Z" \
  -F "image=@/path/to/car-image.jpg"
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "car_124",
    "name": "Мой автомобиль",
    "brand": "Toyota",
    "model": "Camry",
    "year": 2020,
    "vin": "1234567890ABCDEFG",
    "plateNumber": "А123БВ177",
    "mileage": 85000,
    "image": "/uploads/cars/car_124.jpg",
    "lastService": "2024-07-15T00:00:00Z",
    "nextService": null,
    "createdAt": "2024-11-04T12:45:30Z"
  },
  "message": "Car created successfully"
}
```

**Validation Error Response (422 Unprocessable Entity):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "brand": "Brand is required",
      "year": "Year must be between 1900 and 2024",
      "mileage": "Mileage must be a positive number"
    }
  }
}
```

### PUT /cars/{id}
Update an existing car with optional image upload.

**Path Parameters:**
- `id` (string, required) - Car identifier

**Content-Type:** `multipart/form-data`

**Form Fields:** (same as POST, all optional except those being updated)
- `name` (string, optional) - Display name
- `brand` (string, optional) - Manufacturer
- `model` (string, optional) - Model name
- `year` (integer, optional) - Manufacturing year
- `vin` (string, optional) - Vehicle Identification Number
- `plateNumber` (string, optional) - License plate
- `mileage` (integer, optional) - Current mileage
- `lastService` (string, optional) - Last service date (ISO 8601)
- `nextService` (string, optional) - Next service date (ISO 8601)
- `image` (file, optional) - New car image (replaces existing)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "car_123",
    "name": "Updated Car Name",
    "brand": "Toyota",
    "model": "Camry",
    "year": 2020,
    "vin": "1234567890ABCDEFG",
    "plateNumber": "А123БВ177",
    "mileage": 90000,
    "image": "/uploads/cars/car_123_updated.jpg",
    "lastService": "2024-10-15T00:00:00Z",
    "nextService": "2024-12-15T00:00:00Z",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Car updated successfully"
}
```

### DELETE /cars/{id}
Delete a car. This will also delete all associated service records, alerts, and maintenance entries.

**Path Parameters:**
- `id` (string, required) - Car identifier

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Car and all associated data deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "CAR_NOT_FOUND",
    "message": "Car with ID 'car_123' not found"
  }
}
```

### POST /cars/bulk
Create multiple cars in a single request.

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "cars": [
    {
      "name": "Автомобиль 1",
      "brand": "Toyota",
      "model": "Camry",
      "year": 2020,
      "mileage": 85000
    },
    {
      "name": "Автомобиль 2", 
      "brand": "Honda",
      "model": "Civic",
      "year": 2021,
      "mileage": 45000
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "created": [
      {
        "id": "car_125",
        "name": "Автомобиль 1",
        "brand": "Toyota",
        "model": "Camry",
        "year": 2020,
        "mileage": 85000,
        "createdAt": "2024-11-04T12:50:00Z"
      },
      {
        "id": "car_126",
        "name": "Автомобиль 2",
        "brand": "Honda", 
        "model": "Civic",
        "year": 2021,
        "mileage": 45000,
        "createdAt": "2024-11-04T12:50:01Z"
      }
    ],
    "errors": []
  },
  "message": "2 cars created successfully"
}
```

---

# 🚨 Alerts API

## Data Model

```typescript
interface Alert {
  id: string;                                    // Unique identifier
  carId: string;                                 // Associated car ID
  carName: string;                               // Car display name
  type: 'problem' | 'recommendation';            // Alert type
  priority: 'critical' | 'unclear' | 'can-wait'; // Priority level
  description: string;                           // Alert description
  location: string;                              // Problem location
  mileage: number;                               // Mileage when reported
  reportedAt: string;                            // Report timestamp (ISO 8601)
  status: 'active' | 'archived';                 // Current status
}
```

## Endpoints

### GET /alerts
Retrieve all alerts with filtering and pagination.

**Query Parameters:**
- `page` (integer, optional) - Page number (default: 1)
- `limit` (integer, optional) - Items per page (default: 20)
- `carId` (string, optional) - Filter by car ID
- `type` (string, optional) - Filter by type: problem, recommendation
- `priority` (string, optional) - Filter by priority: critical, unclear, can-wait
- `status` (string, optional) - Filter by status: active, archived (default: active)
- `search` (string, optional) - Search in description and location
- `sortBy` (string, optional) - Sort field: priority, reportedAt, mileage
- `sortOrder` (string, optional) - Sort order: asc, desc (default: desc)

**Example Request:**
```http
GET /api/alerts?carId=car_123&priority=critical&status=active&sortBy=reportedAt
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "alert_456",
      "carId": "car_123",
      "carName": "Транспорт #1",
      "type": "problem",
      "priority": "critical",
      "description": "Странный звук из двигателя при ускорении",
      "location": "Двигатель",
      "mileage": 85000,
      "reportedAt": "2024-11-01T14:30:00Z",
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### GET /alerts/{id}
Retrieve a specific alert by ID.

**Path Parameters:**
- `id` (string, required) - Alert identifier

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "alert_456",
    "carId": "car_123",
    "carName": "Транспорт #1",
    "type": "problem",
    "priority": "critical",
    "description": "Странный звук из двигателя при ускорении",
    "location": "Двигатель",
    "mileage": 85000,
    "reportedAt": "2024-11-01T14:30:00Z",
    "status": "active"
  }
}
```

### POST /alerts
Create a new alert.

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "carId": "car_123",
  "carName": "Транспорт #1",
  "type": "problem",
  "priority": "critical",
  "description": "Странный звук из двигателя при ускорении",
  "location": "Двигатель",
  "mileage": 85000
}
```

**Validation Rules:**
- `carId` - Required, must exist
- `carName` - Required, non-empty string
- `type` - Required, must be: problem, recommendation
- `priority` - Required, must be: critical, unclear, can-wait
- `description` - Required, min 10 characters, max 1000 characters
- `location` - Required, non-empty string
- `mileage` - Required, positive integer

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "alert_457",
    "carId": "car_123",
    "carName": "Транспорт #1",
    "type": "problem",
    "priority": "critical",
    "description": "Странный звук из двигателя при ускорении",
    "location": "Двигатель",
    "mileage": 85000,
    "reportedAt": "2024-11-04T15:20:30Z",
    "status": "active"
  },
  "message": "Alert created successfully"
}
```

### PUT /alerts/{id}
Update an existing alert.

**Path Parameters:**
- `id` (string, required) - Alert identifier

**Content-Type:** `application/json`

**Request Body:** (all fields optional)
```json
{
  "type": "recommendation",
  "priority": "can-wait",
  "description": "Рекомендуется проверить двигатель при следующем ТО",
  "location": "Двигатель",
  "status": "archived"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "alert_456",
    "carId": "car_123",
    "carName": "Транспорт #1",
    "type": "recommendation",
    "priority": "can-wait",
    "description": "Рекомендуется проверить двигатель при следующем ТО",
    "location": "Двигатель",
    "mileage": 85000,
    "reportedAt": "2024-11-01T14:30:00Z",
    "status": "archived"
  },
  "message": "Alert updated successfully"
}
```

### DELETE /alerts/{id}
Delete an alert.

**Path Parameters:**
- `id` (string, required) - Alert identifier

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Alert deleted successfully"
}
```

### GET /alerts/stats
Get alert statistics.

**Query Parameters:**
- `carId` (string, optional) - Filter by car ID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 15,
    "active": 12,
    "archived": 3,
    "byType": {
      "problem": 8,
      "recommendation": 7
    },
    "byPriority": {
      "critical": 3,
      "unclear": 5,
      "can-wait": 7
    },
    "byCar": [
      {
        "carId": "car_123",
        "carName": "Транспорт #1",
        "total": 5,
        "critical": 2
      }
    ]
  }
}
```

# 🔧 Service Records API

## Data Models

```typescript
interface ServiceRecord {
  id: string;                    // Unique identifier
  carId: string;                 // Associated car ID
  carName: string;               // Car display name
  date: string;                  // Service date (ISO 8601)
  mileage: number;               // Mileage at service
  serviceProvider: string;        // Service provider name
  totalCost: number;             // Total service cost
  operations: ServiceOperation[]; // List of operations performed
  notes?: string;                // Additional notes
  createdAt: string;             // Creation timestamp (ISO 8601)
}

interface ServiceOperation {
  id: string;                    // Unique identifier
  type: 'maintenance' | 'repair'; // Operation type
  description: string;           // Operation description
  cost: number;                  // Operation cost
  parts?: string[];              // Parts used (optional)
  laborCost?: number;            // Labor cost (optional)
  linkedAlertId?: string;        // Linked alert ID (optional)
  recommendations?: string;       // Post-service recommendations (optional)
}
```

## Endpoints

### GET /service-records
Retrieve all service records with filtering and pagination.

**Query Parameters:**
- `page` (integer, optional) - Page number (default: 1)
- `limit` (integer, optional) - Items per page (default: 20)
- `carId` (string, optional) - Filter by car ID
- `serviceProvider` (string, optional) - Filter by service provider
- `type` (string, optional) - Filter by operation type: maintenance, repair
- `startDate` (string, optional) - Filter from date (ISO 8601)
- `endDate` (string, optional) - Filter to date (ISO 8601)
- `minCost` (number, optional) - Minimum cost filter
- `maxCost` (number, optional) - Maximum cost filter
- `search` (string, optional) - Search in notes and operation descriptions
- `sortBy` (string, optional) - Sort field: date, totalCost, mileage, serviceProvider
- `sortOrder` (string, optional) - Sort order: asc, desc (default: desc)

**Example Request:**
```http
GET /api/service-records?carId=car_123&type=maintenance&startDate=2024-01-01&sortBy=date
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "service_789",
      "carId": "car_123",
      "carName": "Транспорт #1",
      "date": "2024-07-15T00:00:00Z",
      "mileage": 85000,
      "serviceProvider": "Автосервис Премиум",
      "totalCost": 12500,
      "operations": [
        {
          "id": "op_001",
          "type": "maintenance",
          "description": "Замена масла и фильтров",
          "cost": 4500,
          "parts": ["Масло 5W-30", "Масляный фильтр", "Воздушный фильтр"],
          "laborCost": 1500
        },
        {
          "id": "op_002",
          "type": "repair",
          "description": "Замена тормозных колодок",
          "cost": 8000,
          "parts": ["Тормозные колодки передние"],
          "laborCost": 3000,
          "linkedAlertId": "alert_456"
        }
      ],
      "notes": "Рекомендована замена свечей через 10000 км",
      "createdAt": "2024-07-15T16:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### GET /service-records/{id}
Retrieve a specific service record by ID.

**Path Parameters:**
- `id` (string, required) - Service record identifier

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "service_789",
    "carId": "car_123",
    "carName": "Транспорт #1",
    "date": "2024-07-15T00:00:00Z",
    "mileage": 85000,
    "serviceProvider": "Автосервис Премиум",
    "totalCost": 12500,
    "operations": [
      {
        "id": "op_001",
        "type": "maintenance",
        "description": "Замена масла и фильтров",
        "cost": 4500,
        "parts": ["Масло 5W-30", "Масляный фильтр", "Воздушный фильтр"],
        "laborCost": 1500
      }
    ],
    "notes": "Рекомендована замена свечей через 10000 км",
    "createdAt": "2024-07-15T16:30:00Z"
  }
}
```

### POST /service-records
Create a new service record.

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "carId": "car_123",
  "carName": "Транспорт #1",
  "date": "2024-11-04T00:00:00Z",
  "mileage": 90000,
  "serviceProvider": "Автосервис Центр",
  "operations": [
    {
      "type": "maintenance",
      "description": "Плановое ТО",
      "cost": 8000,
      "parts": ["Масло", "Фильтры"],
      "laborCost": 3000
    }
  ],
  "notes": "Все в порядке"
}
```

**Validation Rules:**
- `carId` - Required, must exist
- `carName` - Required, non-empty string
- `date` - Required, valid ISO 8601 date
- `mileage` - Required, positive integer
- `serviceProvider` - Required, non-empty string
- `operations` - Required, array with at least 1 operation
- `operations[].type` - Required, must be: maintenance, repair
- `operations[].description` - Required, min 5 characters
- `operations[].cost` - Required, positive number

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "service_790",
    "carId": "car_123",
    "carName": "Транспорт #1",
    "date": "2024-11-04T00:00:00Z",
    "mileage": 90000,
    "serviceProvider": "Автосервис Центр",
    "totalCost": 11000,
    "operations": [
      {
        "id": "op_003",
        "type": "maintenance",
        "description": "Плановое ТО",
        "cost": 8000,
        "parts": ["Масло", "Фильтры"],
        "laborCost": 3000
      }
    ],
    "notes": "Все в порядке",
    "createdAt": "2024-11-04T18:15:00Z"
  },
  "message": "Service record created successfully"
}
```

### PUT /service-records/{id}
Update an existing service record.

**Path Parameters:**
- `id` (string, required) - Service record identifier

**Content-Type:** `application/json`

**Request Body:** (all fields optional)
```json
{
  "date": "2024-11-04T00:00:00Z",
  "mileage": 90500,
  "serviceProvider": "Новый Автосервис",
  "operations": [
    {
      "id": "op_003",
      "type": "maintenance",
      "description": "Обновленное ТО",
      "cost": 9000,
      "parts": ["Масло премиум", "Фильтры"],
      "laborCost": 3500
    }
  ],
  "notes": "Обновленные заметки"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "service_790",
    "carId": "car_123",
    "carName": "Транспорт #1",
    "date": "2024-11-04T00:00:00Z",
    "mileage": 90500,
    "serviceProvider": "Новый Автосервис",
    "totalCost": 12500,
    "operations": [
      {
        "id": "op_003",
        "type": "maintenance",
        "description": "Обновленное ТО",
        "cost": 9000,
        "parts": ["Масло премиум", "Фильтры"],
        "laborCost": 3500
      }
    ],
    "notes": "Обновленные заметки",
    "createdAt": "2024-11-04T18:15:00Z"
  },
  "message": "Service record updated successfully"
}
```

### DELETE /service-records/{id}
Delete a service record.

**Path Parameters:**
- `id` (string, required) - Service record identifier

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Service record deleted successfully"
}
```

### GET /service-records/stats
Get service record statistics.

**Query Parameters:**
- `carId` (string, optional) - Filter by car ID
- `startDate` (string, optional) - Filter from date
- `endDate` (string, optional) - Filter to date

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "totalCost": 287500,
    "averageCost": 11500,
    "byType": {
      "maintenance": {
        "count": 18,
        "totalCost": 189000
      },
      "repair": {
        "count": 7,
        "totalCost": 98500
      }
    },
    "byCar": [
      {
        "carId": "car_123",
        "carName": "Транспорт #1",
        "count": 8,
        "totalCost": 96000,
        "averageCost": 12000
      }
    ],
    "byMonth": [
      {
        "month": "2024-10",
        "count": 3,
        "totalCost": 34500
      }
    ]
  }
}
```

---

# 🔧 Maintenance API

## Data Models

```typescript
interface MaintenanceEntry {
  id: string;                     // Unique identifier
  carId: string;                  // Associated car ID
  carName: string;                // Car display name
  enteredAt: string;              // Entry timestamp (ISO 8601)
  reason: string;                 // Maintenance reason
  estimatedCompletion?: string;   // Estimated completion date (ISO 8601)
}

interface MaintenancePlan {
  id: string;                     // Unique identifier
  carId: string;                  // Associated car ID
  carName: string;                // Car display name
  status: 'draft' | 'scheduled' | 'in-progress' | 'completed'; // Plan status
  plannedDate: string;            // Planned start date (ISO 8601)
  plannedCompletionDate: string;  // Planned completion date (ISO 8601)
  plannedMileage?: string;        // Planned mileage (optional)
  periodicOperations: MaintenanceOperation[]; // Scheduled operations
  repairOperations: MaintenanceOperation[];   // Repair operations
  totalEstimatedCost: number;     // Total estimated cost
  serviceProvider?: string;       // Service provider (optional)
  notes?: string;                 // Additional notes (optional)
  createdAt: string;              // Creation timestamp (ISO 8601)
  updatedAt: string;              // Last update timestamp (ISO 8601)
}

interface MaintenanceOperation {
  id: string;                     // Unique identifier
  operation: string;              // Operation name
  mileage: number;                // Recommended mileage
  period: number;                 // Period in months
  notes: string;                  // Operation notes
  estimatedCost?: number;         // Estimated cost (optional)
  completed?: boolean;            // Completion status (optional)
}
```

## Maintenance Entries Endpoints

### GET /maintenance
Retrieve all maintenance entries with filtering and pagination.

**Query Parameters:**
- `page` (integer, optional) - Page number (default: 1)
- `limit` (integer, optional) - Items per page (default: 20)
- `carId` (string, optional) - Filter by car ID
- `search` (string, optional) - Search in reason
- `sortBy` (string, optional) - Sort field: enteredAt, estimatedCompletion
- `sortOrder` (string, optional) - Sort order: asc, desc (default: desc)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "maintenance_101",
      "carId": "car_123",
      "carName": "Транспорт #1",
      "enteredAt": "2024-11-01T10:00:00Z",
      "reason": "Замена тормозной системы",
      "estimatedCompletion": "2024-11-05T18:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### POST /maintenance
Create a new maintenance entry.

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "carId": "car_123",
  "carName": "Транспорт #1",
  "reason": "Замена тормозной системы",
  "estimatedCompletion": "2024-11-05T18:00:00Z"
}
```

### DELETE /maintenance/car/{carId}
Remove a maintenance entry for a specific car.

**Path Parameters:**
- `carId` (string, required) - Car identifier

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Maintenance entry removed successfully"
}
```

## Maintenance Plans Endpoints

### GET /maintenance-plans
Retrieve all maintenance plans with filtering and pagination.

**Query Parameters:**
- `page` (integer, optional) - Page number (default: 1)
- `limit` (integer, optional) - Items per page (default: 20)
- `carId` (string, optional) - Filter by car ID
- `status` (string, optional) - Filter by status: draft, scheduled, in-progress, completed
- `search` (string, optional) - Search in notes and service provider
- `sortBy` (string, optional) - Sort field: plannedDate, createdAt, totalEstimatedCost
- `sortOrder` (string, optional) - Sort order: asc, desc (default: desc)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "plan_201",
      "carId": "car_123",
      "carName": "Транспорт #1",
      "status": "scheduled",
      "plannedDate": "2024-11-10T09:00:00Z",
      "plannedCompletionDate": "2024-11-12T17:00:00Z",
      "plannedMileage": "95000",
      "periodicOperations": [
        {
          "id": "op_periodic_1",
          "operation": "Замена масла",
          "mileage": 95000,
          "period": 6,
          "notes": "Синтетическое масло 5W-30",
          "estimatedCost": 4500
        }
      ],
      "repairOperations": [
        {
          "id": "op_repair_1", 
          "operation": "Ремонт тормозов",
          "mileage": 95000,
          "period": 0,
          "notes": "Замена колодок и дисков",
          "estimatedCost": 12000
        }
      ],
      "totalEstimatedCost": 16500,
      "serviceProvider": "Автосервис Премиум",
      "notes": "Комплексное ТО с ремонтом",
      "createdAt": "2024-11-01T14:00:00Z",
      "updatedAt": "2024-11-02T10:30:00Z"
    }
  ]
}
```

### POST /maintenance-plans
Create a new maintenance plan.

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "carId": "car_123",
  "carName": "Транспорт #1",
  "status": "draft",
  "plannedDate": "2024-11-15T09:00:00Z",
  "plannedCompletionDate": "2024-11-17T17:00:00Z",
  "plannedMileage": "100000",
  "periodicOperations": [
    {
      "operation": "Замена масла и фильтров",
      "mileage": 100000,
      "period": 6,
      "notes": "Полусинтетическое масло",
      "estimatedCost": 5000
    }
  ],
  "repairOperations": [],
  "totalEstimatedCost": 5000,
  "serviceProvider": "Быстрый Сервис",
  "notes": "Плановое ТО"
}
```

### PUT /maintenance-plans/{id}
Update an existing maintenance plan.

**Path Parameters:**
- `id` (string, required) - Maintenance plan identifier

**Content-Type:** `application/json`

**Request Body:** (all fields optional)
```json
{
  "status": "scheduled",
  "plannedDate": "2024-11-20T09:00:00Z",
  "totalEstimatedCost": 6500,
  "notes": "Обновленный план"
}
```

---

# 📊 Advanced Features

## Pagination

All list endpoints support consistent pagination with the following query parameters:

- `page` (integer, optional) - Page number, starts from 1 (default: 1)
- `limit` (integer, optional) - Items per page (default: 20, max: 100)

**Pagination Response:**
```json
{
  "pagination": {
    "page": 1,           // Current page number
    "limit": 20,         // Items per page
    "total": 150,        // Total number of items
    "totalPages": 8,     // Total number of pages
    "hasNext": true,     // Has next page
    "hasPrev": false     // Has previous page
  }
}
```

## Search and Filtering

### Global Search
Most endpoints support a `search` parameter that searches across multiple relevant fields:

**Cars:** `name`, `brand`, `model`, `plateNumber`
**Alerts:** `description`, `location`
**Service Records:** `notes`, operation descriptions
**Maintenance Plans:** `notes`, `serviceProvider`

### Specific Filters
Each endpoint supports specific filters relevant to its data model:

**Date Range Filtering:**
```http
GET /api/service-records?startDate=2024-01-01&endDate=2024-12-31
```

**Numeric Range Filtering:**
```http
GET /api/cars?minMileage=50000&maxMileage=100000
GET /api/service-records?minCost=5000&maxCost=20000
```

**Enum/Category Filtering:**
```http
GET /api/alerts?type=problem&priority=critical
GET /api/maintenance-plans?status=scheduled
```

## Sorting

All list endpoints support sorting with:
- `sortBy` - Field name to sort by
- `sortOrder` - `asc` (ascending) or `desc` (descending, default)

**Examples:**
```http
GET /api/cars?sortBy=mileage&sortOrder=desc
GET /api/service-records?sortBy=date&sortOrder=asc
GET /api/alerts?sortBy=priority&sortOrder=desc
```

## Bulk Operations

### Bulk Create Cars
```http
POST /api/cars/bulk
Content-Type: application/json

{
  "cars": [
    { "name": "Car 1", "brand": "Toyota", "model": "Camry", "year": 2020, "mileage": 50000 },
    { "name": "Car 2", "brand": "Honda", "model": "Civic", "year": 2021, "mileage": 30000 }
  ]
}
```

### Bulk Update
```http
PUT /api/cars/bulk
Content-Type: application/json

{
  "updates": [
    { "id": "car_123", "mileage": 55000 },
    { "id": "car_124", "mileage": 32000 }
  ]
}
```

### Bulk Delete
```http
DELETE /api/cars/bulk
Content-Type: application/json

{
  "ids": ["car_123", "car_124", "car_125"]
}
```

## File Upload Specifications

### Car Image Upload
- **Supported formats:** JPG, JPEG, PNG, WebP
- **Maximum file size:** 5MB
- **Recommended dimensions:** 800x600px or higher
- **Content-Type:** `multipart/form-data`

**Upload Process:**
1. Client sends multipart form with image file
2. Server validates file type and size
3. Server stores image in `/uploads/cars/` directory
4. Server returns image URL in response

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "car_123",
    "image": "/uploads/cars/car_123_1699123456.jpg"
  }
}
```

---

# 🚫 Error Handling

## Error Response Format

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { /* Additional error context */ }
  }
}
```

## HTTP Status Codes

### Success Codes
- `200 OK` - Request successful, data returned
- `201 Created` - Resource created successfully
- `204 No Content` - Request successful, no data returned

### Client Error Codes
- `400 Bad Request` - Invalid request format or parameters
- `401 Unauthorized` - Authentication required or failed
- `403 Forbidden` - Access to resource denied
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists or conflict
- `422 Unprocessable Entity` - Validation errors
- `429 Too Many Requests` - Rate limit exceeded

### Server Error Codes
- `500 Internal Server Error` - Server error
- `502 Bad Gateway` - Upstream service error
- `503 Service Unavailable` - Service temporarily unavailable

## Common Error Codes

### Validation Errors (422)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "brand": "Brand is required",
      "year": "Year must be between 1900 and 2024",
      "mileage": "Mileage must be a positive number"
    }
  }
}
```

### Resource Not Found (404)
```json
{
  "success": false,
  "error": {
    "code": "CAR_NOT_FOUND",
    "message": "Car with ID 'car_123' not found"
  }
}
```

### Conflict Errors (409)
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_VIN", 
    "message": "A car with this VIN already exists",
    "details": {
      "vin": "1234567890ABCDEFG",
      "existingCarId": "car_456"
    }
  }
}
```

### File Upload Errors (422)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE",
    "message": "File upload validation failed",
    "details": {
      "file": "File size exceeds 5MB limit",
      "type": "Only JPG, PNG files are allowed"
    }
  }
}
```

### Rate Limiting (429)
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "limit": 100,
      "window": "1 hour",
      "retryAfter": 3600
    }
  }
}
```

## Error Code Categories

### CAR_* Errors
- `CAR_NOT_FOUND` - Car does not exist
- `CAR_DUPLICATE_VIN` - VIN already exists
- `CAR_INVALID_YEAR` - Invalid manufacturing year
- `CAR_IMAGE_UPLOAD_FAILED` - Image upload error

### ALERT_* Errors
- `ALERT_NOT_FOUND` - Alert does not exist
- `ALERT_INVALID_PRIORITY` - Invalid priority value
- `ALERT_INVALID_TYPE` - Invalid alert type

### SERVICE_* Errors
- `SERVICE_RECORD_NOT_FOUND` - Service record does not exist
- `SERVICE_INVALID_DATE` - Invalid service date
- `SERVICE_INVALID_COST` - Invalid cost value

### MAINTENANCE_* Errors
- `MAINTENANCE_NOT_FOUND` - Maintenance entry/plan not found
- `MAINTENANCE_INVALID_STATUS` - Invalid maintenance status
- `MAINTENANCE_PLAN_CONFLICT` - Plan scheduling conflict

### FILE_* Errors
- `FILE_TOO_LARGE` - File exceeds size limit
- `FILE_INVALID_TYPE` - Unsupported file type
- `FILE_UPLOAD_FAILED` - Upload process failed

---

# 🔐 Security Considerations

## Input Validation

### Required Validations
1. **String Fields:** Non-empty, length limits, allowed characters
2. **Numeric Fields:** Range validation, positive values where applicable
3. **Date Fields:** Valid ISO 8601 format, reasonable date ranges
4. **Enum Fields:** Valid enum values only
5. **File Uploads:** Type, size, content validation

### Validation Rules by Field Type

**Car Fields:**
- `name`: Required, 1-100 characters
- `brand`: Required, 1-50 characters, alphabetic + spaces
- `model`: Required, 1-50 characters
- `year`: Required, 1900 ≤ year ≤ current year
- `vin`: Optional, 17 characters, alphanumeric
- `plateNumber`: Optional, 1-20 characters
- `mileage`: Required, ≥ 0, integer

**Alert Fields:**
- `description`: Required, 10-1000 characters
- `location`: Required, 1-100 characters
- `priority`: Required, enum: critical|unclear|can-wait
- `type`: Required, enum: problem|recommendation

## Data Sanitization

### Input Sanitization
- Remove/escape HTML tags from text inputs
- Trim whitespace from string fields
- Normalize Unicode characters
- Validate numeric precision and range

### Output Sanitization
- Escape special characters in API responses
- Validate URLs before returning image paths
- Sanitize user-generated content in descriptions/notes

## File Upload Security

### File Validation
```javascript
// Pseudo-code for file validation
function validateCarImage(file) {
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('FILE_TOO_LARGE');
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('FILE_INVALID_TYPE');
  }
  
  // Validate file header (magic bytes)
  const fileHeader = file.buffer.slice(0, 4);
  if (!isValidImageHeader(fileHeader)) {
    throw new Error('FILE_INVALID_CONTENT');
  }
}
```

### Storage Security
- Store uploaded files outside the web root
- Use random filenames to prevent path traversal
- Implement virus scanning for uploaded files
- Set appropriate file permissions
- Use Content-Disposition headers for downloads

## Rate Limiting

### Recommended Limits
- **General API calls:** 1000 requests per hour per IP
- **File uploads:** 20 uploads per hour per IP
- **Bulk operations:** 10 operations per hour per IP
- **Search queries:** 200 requests per hour per IP

---

# 📚 Implementation Guidelines

## Backend Implementation Checklist

### Database Design
- [ ] Create tables for all data models
- [ ] Implement proper foreign key relationships
- [ ] Add database indexes for filtering/sorting fields
- [ ] Set up soft delete for cars (cascade to related data)
- [ ] Implement audit trails for data changes

### API Implementation
- [ ] Implement all CRUD endpoints for each resource
- [ ] Add comprehensive input validation
- [ ] Implement pagination for all list endpoints
- [ ] Add search and filtering capabilities
- [ ] Implement file upload handling for car images
- [ ] Add proper error handling and logging

### Security Implementation
- [ ] Implement input sanitization
- [ ] Add file upload security measures
- [ ] Implement rate limiting
- [ ] Add API request logging
- [ ] Set up proper CORS headers
- [ ] Implement request size limits

### Performance Optimization
- [ ] Database query optimization
- [ ] Response caching where appropriate
- [ ] Image optimization and thumbnail generation
- [ ] Implement database connection pooling
- [ ] Add response compression

### Testing
- [ ] Unit tests for all API endpoints
- [ ] Integration tests for data relationships
- [ ] Load testing for performance validation
- [ ] Security testing for file uploads
- [ ] End-to-end testing with frontend

## Deployment Considerations

### Environment Configuration
```bash
# Example environment variables
API_PORT=8080
DATABASE_URL=postgresql://user:pass@localhost:5432/fleetmaster
UPLOAD_PATH=/var/uploads/fleetmaster
MAX_FILE_SIZE=5242880  # 5MB in bytes
CORS_ORIGINS=http://localhost:3001,https://yourdomain.com
RATE_LIMIT_WINDOW=3600  # 1 hour in seconds
RATE_LIMIT_MAX=1000     # requests per window
```

### Production Setup
- Use HTTPS in production
- Configure reverse proxy (Nginx/Apache)
- Set up database backups
- Implement log rotation
- Configure monitoring and alerting
- Set up proper firewall rules

---

# 📖 API Testing Guide

## Testing with cURL

### Create a Car with Image
```bash
curl -X POST http://localhost:8080/api/cars \
  -F "name=Test Car" \
  -F "brand=Toyota" \
  -F "model=Camry" \
  -F "year=2020" \
  -F "mileage=50000" \
  -F "image=@car-photo.jpg"
```

### Get Cars with Filtering
```bash
curl "http://localhost:8080/api/cars?page=1&limit=10&brand=Toyota&sortBy=mileage"
```

### Create Service Record
```bash
curl -X POST http://localhost:8080/api/service-records \
  -H "Content-Type: application/json" \
  -d '{
    "carId": "car_123",
    "carName": "Test Car",
    "date": "2024-11-04T00:00:00Z",
    "mileage": 55000,
    "serviceProvider": "Test Service",
    "operations": [
      {
        "type": "maintenance",
        "description": "Oil change",
        "cost": 5000
      }
    ]
  }'
```

## Frontend Integration Examples

### JavaScript Fetch API
```javascript
// Get cars with pagination
const getCars = async (page = 1, limit = 20) => {
  const response = await fetch(`/api/cars?page=${page}&limit=${limit}`);
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error.message);
  }
  
  return result.data;
};

// Create car with image
const createCar = async (carData, imageFile) => {
  const formData = new FormData();
  
  // Add car data
  Object.keys(carData).forEach(key => {
    formData.append(key, carData[key]);
  });
  
  // Add image file
  if (imageFile) {
    formData.append('image', imageFile);
  }
  
  const response = await fetch('/api/cars', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error.message);
  }
  
  return result.data;
};
```

---

# 📋 Appendix

## Complete API Endpoint Summary

### Cars API
- `GET /cars` - List cars with filtering/pagination
- `GET /cars/{id}` - Get specific car
- `POST /cars` - Create car (with image upload)
- `PUT /cars/{id}` - Update car (with image upload) 
- `DELETE /cars/{id}` - Delete car
- `POST /cars/bulk` - Bulk create cars

### Alerts API
- `GET /alerts` - List alerts with filtering/pagination
- `GET /alerts/{id}` - Get specific alert
- `POST /alerts` - Create alert
- `PUT /alerts/{id}` - Update alert
- `DELETE /alerts/{id}` - Delete alert
- `GET /alerts/stats` - Get alert statistics

### Service Records API
- `GET /service-records` - List service records with filtering/pagination
- `GET /service-records/{id}` - Get specific service record
- `POST /service-records` - Create service record
- `PUT /service-records/{id}` - Update service record
- `DELETE /service-records/{id}` - Delete service record
- `GET /service-records/stats` - Get service record statistics

### Maintenance API
- `GET /maintenance` - List maintenance entries
- `POST /maintenance` - Create maintenance entry
- `DELETE /maintenance/car/{carId}` - Remove maintenance entry
- `GET /maintenance-plans` - List maintenance plans
- `POST /maintenance-plans` - Create maintenance plan
- `PUT /maintenance-plans/{id}` - Update maintenance plan

## Database Schema Recommendations

### Tables Structure
```sql
-- Cars table
CREATE TABLE cars (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  brand VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE)),
  vin VARCHAR(17) UNIQUE,
  plate_number VARCHAR(20),
  mileage INTEGER NOT NULL CHECK (mileage >= 0),
  image_url VARCHAR(500),
  last_service DATE,
  next_service DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alerts table
CREATE TABLE alerts (
  id VARCHAR(255) PRIMARY KEY,
  car_id VARCHAR(255) NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  car_name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('problem', 'recommendation')),
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('critical', 'unclear', 'can-wait')),
  description TEXT NOT NULL,
  location VARCHAR(100) NOT NULL,
  mileage INTEGER NOT NULL,
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived'))
);

-- Service records table
CREATE TABLE service_records (
  id VARCHAR(255) PRIMARY KEY,
  car_id VARCHAR(255) NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  car_name VARCHAR(100) NOT NULL,
  service_date DATE NOT NULL,
  mileage INTEGER NOT NULL,
  service_provider VARCHAR(200) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service operations table
CREATE TABLE service_operations (
  id VARCHAR(255) PRIMARY KEY,
  service_record_id VARCHAR(255) NOT NULL REFERENCES service_records(id) ON DELETE CASCADE,
  operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN ('maintenance', 'repair')),
  description TEXT NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  labor_cost DECIMAL(10,2),
  parts JSONB,
  linked_alert_id VARCHAR(255) REFERENCES alerts(id),
  recommendations TEXT
);

-- Maintenance entries table
CREATE TABLE maintenance_entries (
  id VARCHAR(255) PRIMARY KEY,
  car_id VARCHAR(255) NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  car_name VARCHAR(100) NOT NULL,
  entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reason TEXT NOT NULL,
  estimated_completion TIMESTAMP
);

-- Maintenance plans table  
CREATE TABLE maintenance_plans (
  id VARCHAR(255) PRIMARY KEY,
  car_id VARCHAR(255) NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  car_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'in-progress', 'completed')),
  planned_date TIMESTAMP NOT NULL,
  planned_completion_date TIMESTAMP NOT NULL,
  planned_mileage VARCHAR(10),
  total_estimated_cost DECIMAL(10,2) DEFAULT 0,
  service_provider VARCHAR(200),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes for Performance
```sql
-- Cars indexes
CREATE INDEX idx_cars_brand ON cars(brand);
CREATE INDEX idx_cars_year ON cars(year);
CREATE INDEX idx_cars_mileage ON cars(mileage);

-- Alerts indexes
CREATE INDEX idx_alerts_car_id ON alerts(car_id);
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_priority ON alerts(priority);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_reported_at ON alerts(reported_at);

-- Service records indexes
CREATE INDEX idx_service_records_car_id ON service_records(car_id);
CREATE INDEX idx_service_records_date ON service_records(service_date);
CREATE INDEX idx_service_records_provider ON service_records(service_provider);

-- Maintenance indexes
CREATE INDEX idx_maintenance_entries_car_id ON maintenance_entries(car_id);
CREATE INDEX idx_maintenance_plans_car_id ON maintenance_plans(car_id);
CREATE INDEX idx_maintenance_plans_status ON maintenance_plans(status);
CREATE INDEX idx_maintenance_plans_planned_date ON maintenance_plans(planned_date);
```

---

**Document Version:** 1.0  
**Last Updated:** November 4, 2024  
**Frontend Repository:** FleetMaster Pro Frontend  
**Target Backend:** Java Spring Boot (recommended)  

This specification provides complete API documentation for implementing the FleetMaster Pro backend system. All endpoints include request/response examples, validation rules, error handling, and advanced features for a production-ready implementation.
