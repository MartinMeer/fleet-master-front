# FleetMaster Pro API Documentation

This directory contains comprehensive API documentation for the FleetMaster Pro backend system.

## 📋 Documentation Overview

### 📖 Main API Specification
- **[FLEETMASTER_API_SPECIFICATION.md](./FLEETMASTER_API_SPECIFICATION.md)** - Complete RESTful API documentation with examples, validation rules, and implementation guidelines

### 🔧 OpenAPI/Swagger Specification  
- **[fleetmaster-openapi.yaml](./fleetmaster-openapi.yaml)** - Machine-readable OpenAPI 3.0 specification for interactive documentation and code generation

## 🚀 Quick Start for Backend Developers

### 1. API Overview
FleetMaster Pro requires a RESTful API backend with the following core resources:
- **Cars** - Vehicle management with image upload support
- **Alerts** - Problem and recommendation tracking
- **Service Records** - Maintenance history with operations
- **Maintenance** - In-progress maintenance and planning

### 2. Key Features Required
- ✅ Full CRUD operations for all resources
- ✅ Advanced search and filtering capabilities
- ✅ Pagination support (consistent across all endpoints)
- ✅ File upload handling for car images
- ✅ Comprehensive error handling with proper HTTP status codes
- ✅ Input validation and sanitization
- ✅ Bulk operations for efficiency

### 3. Development Environment
```bash
# Expected API Base URL
Development: http://localhost:8080/api
Production: https://api.yourserver.com/api

# Content Types
JSON: application/json
File Upload: multipart/form-data
```

### 4. Quick Implementation Checklist

#### Database Setup
- [ ] Create tables for: cars, alerts, service_records, service_operations, maintenance_entries, maintenance_plans
- [ ] Set up proper foreign key relationships with cascade deletes
- [ ] Add database indexes for filtering/sorting performance
- [ ] Implement audit trails for data changes

#### API Endpoints (26 total)
**Cars API (6 endpoints)**
- [ ] `GET /cars` - List with filtering/pagination
- [ ] `GET /cars/{id}` - Get specific car
- [ ] `POST /cars` - Create car (multipart/form-data for image)
- [ ] `PUT /cars/{id}` - Update car (multipart/form-data for image)
- [ ] `DELETE /cars/{id}` - Delete car and cascade data
- [ ] `POST /cars/bulk` - Bulk create cars

**Alerts API (6 endpoints)**
- [ ] `GET /alerts` - List with filtering/pagination
- [ ] `GET /alerts/{id}` - Get specific alert
- [ ] `POST /alerts` - Create alert
- [ ] `PUT /alerts/{id}` - Update alert
- [ ] `DELETE /alerts/{id}` - Delete alert
- [ ] `GET /alerts/stats` - Get alert statistics

**Service Records API (6 endpoints)**
- [ ] `GET /service-records` - List with filtering/pagination
- [ ] `GET /service-records/{id}` - Get specific service record
- [ ] `POST /service-records` - Create service record
- [ ] `PUT /service-records/{id}` - Update service record
- [ ] `DELETE /service-records/{id}` - Delete service record
- [ ] `GET /service-records/stats` - Get service statistics

**Maintenance API (8 endpoints)**
- [ ] `GET /maintenance` - List maintenance entries
- [ ] `POST /maintenance` - Create maintenance entry
- [ ] `DELETE /maintenance/car/{carId}` - Remove maintenance entry
- [ ] `GET /maintenance-plans` - List maintenance plans
- [ ] `POST /maintenance-plans` - Create maintenance plan
- [ ] `PUT /maintenance-plans/{id}` - Update maintenance plan

#### Advanced Features
- [ ] Implement pagination (page, limit, total, hasNext, hasPrev)
- [ ] Add search functionality across relevant text fields
- [ ] Implement filtering by categories, dates, numeric ranges
- [ ] Add sorting capabilities (sortBy, sortOrder parameters)
- [ ] File upload validation and security (5MB limit, image types only)
- [ ] Comprehensive error handling with proper HTTP status codes
- [ ] Input validation and sanitization
- [ ] Rate limiting protection

#### Security & Performance
- [ ] Input validation for all endpoints
- [ ] File upload security (type validation, size limits, virus scanning)
- [ ] SQL injection protection
- [ ] Request size limits
- [ ] Rate limiting (1000 requests/hour general, 20 uploads/hour)
- [ ] CORS configuration for frontend domains
- [ ] Database query optimization
- [ ] Response caching where appropriate

## 📚 Documentation Sections

### Core API Documentation
The main specification includes:

1. **Complete Endpoint Documentation** - All 26 API endpoints with request/response examples
2. **Data Models** - TypeScript interfaces for all data structures
3. **Advanced Features** - Pagination, search, filtering, sorting, bulk operations
4. **Error Handling** - Comprehensive error codes and HTTP status patterns
5. **Security Guidelines** - Input validation, file upload security, rate limiting
6. **Implementation Guide** - Step-by-step backend implementation checklist
7. **Testing Examples** - cURL commands and JavaScript integration examples
8. **Database Schema** - Complete SQL schema with indexes and constraints

### OpenAPI Specification
The Swagger/OpenAPI file provides:

- Machine-readable API specification
- Interactive documentation capability
- Schema definitions for request/response validation
- Code generation support for client libraries
- API testing interface

## 🔗 Integration with Frontend

### Environment Configuration
The frontend is already configured to switch between development and production API endpoints:

```javascript
// Frontend configuration
development: {
  API_URL: 'http://localhost:8080/api'
},
production: {
  API_URL: 'https://api.yourserver.com/api'
}
```

### Data Service Integration
The frontend includes a `DataService` class that automatically handles:
- API vs localStorage switching based on environment
- Authentication headers (Bearer tokens)
- Error handling and response parsing
- File upload with form data
- Consistent request/response patterns

## 🛠️ Recommended Technology Stack

### Backend Framework
- **Java Spring Boot** (recommended) - Enterprise-grade, extensive ecosystem
- **Node.js + Express** - JavaScript consistency with frontend
- **Python FastAPI** - High performance, automatic API docs
- **ASP.NET Core** - Microsoft stack integration

### Database
- **PostgreSQL** (recommended) - Advanced features, JSON support, full-text search
- **MySQL** - Reliable, widely supported
- **SQLite** - Development/testing simplicity

### File Storage
- **Local filesystem** - Simple development setup
- **AWS S3** - Production scalability
- **Google Cloud Storage** - Alternative cloud option
- **Azure Blob Storage** - Microsoft ecosystem

### Additional Tools
- **Docker** - Containerization for consistent deployment
- **Swagger UI** - Interactive API documentation
- **Redis** - Caching and rate limiting
- **nginx** - Reverse proxy and static file serving

## 📖 Usage Instructions

### For Backend Developers

1. **Start with the Database Schema** (Appendix section)
   - Use the provided SQL scripts to create tables
   - Add the recommended indexes for performance
   - Set up foreign key constraints with cascade deletes

2. **Implement Core CRUD Operations**
   - Start with Cars API (simplest, includes file upload pattern)
   - Add Alerts API (demonstrates enums and validation)
   - Implement Service Records API (complex nested operations)
   - Complete with Maintenance APIs (scheduling and status management)

3. **Add Advanced Features**
   - Implement pagination consistently across all list endpoints
   - Add search and filtering capabilities
   - Include sorting options
   - Add statistics endpoints for dashboard functionality

4. **Security and Validation**
   - Implement input validation using the provided rules
   - Add file upload security measures
   - Set up rate limiting
   - Configure CORS for frontend domains

5. **Testing and Documentation**
   - Use the provided cURL examples for testing
   - Set up the OpenAPI specification for interactive docs
   - Test with the frontend application
   - Add logging and monitoring

### For Frontend Integration

The frontend is already prepared for backend integration:

1. **Configure API URLs** in `apps/main-app/src/config/app.config.js`
2. **Test connection** using the DevTools panel (⚙️ button)
3. **Switch to backend mode** using "Use Backend API" toggle
4. **Verify all operations** work with real API endpoints

### For API Testing

Use the provided testing examples:

```bash
# Test car creation with image
curl -X POST http://localhost:8080/api/cars \
  -F "name=Test Car" \
  -F "brand=Toyota" \
  -F "model=Camry" \
  -F "year=2020" \
  -F "mileage=50000" \
  -F "image=@car-photo.jpg"

# Test filtering and pagination
curl "http://localhost:8080/api/cars?page=1&limit=10&brand=Toyota&sortBy=mileage"
```

## 📞 Support and Resources

### Documentation Files
- **Main API Spec**: Comprehensive documentation with examples
- **OpenAPI YAML**: Machine-readable specification for tools
- **Database Schema**: Complete SQL setup scripts
- **Implementation Guide**: Step-by-step development checklist

### Frontend Resources
- **DataService.ts**: Reference implementation for API calls
- **Config files**: Environment configuration examples
- **Component examples**: See how frontend consumes the API

### Additional Help
- **GitHub Issues**: Report problems or request clarifications
- **Implementation examples**: Check existing frontend service layer
- **Testing guidance**: Use provided cURL and JavaScript examples

---

**Last Updated**: November 4, 2024  
**API Version**: 1.0  
**Frontend Compatibility**: FleetMaster Pro v1.0+

This documentation provides everything needed to implement a production-ready backend for the FleetMaster Pro fleet management system.
