# Agroflow API Documentation

**Base URL:** `/v1`  
**Authentication:** Bearer JWT Token (except register/login)  
**Content-Type:** `application/json`

## Authentication Endpoints

### POST /v1/users/register

**Purpose:** Register a new user  
**Auth:** None required  
**Request Body:**

```json
{
  "first_name": "string (required, max 128 chars, no emojis/numbers)",
  "last_name": "string (required, max 128 chars, no emojis/numbers)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars)"
}
```

**Success Response (201):**

```json
{
  "data": {
    "id": "ulid",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "role": "USER|ADMIN",
    "created_at": "datetime",
    "updated_at": "datetime"
  },
  "code": 201
}
```

**Errors:** 400 (validation), 409 (email exists), 500 (server error)

### POST /v1/auth/login

**Purpose:** Login user  
**Auth:** None required  
**Request Body:**

```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response (200):**

```json
{
  "data": {
    "id": "ulid",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "role": "USER|ADMIN",
    "created_at": "datetime",
    "updated_at": "datetime",
    "access_token": "string"
  },
  "code": 200
}
```

**Response Headers:**

- `Set-Cookie: refresh_token=<jwt>; HttpOnly; Secure; SameSite=Strict; Path=/v1/auth/refresh; Max-Age=2592000`

**Errors:** 401 (invalid credentials), 500 (server error)

### POST /v1/auth/logout

**Purpose:** Logout user  
**Auth:** None required  
**Request Body:** None  
**Success Response (204):** No content  
**Errors:** 500 (server error)

### POST /v1/auth/refresh

**Purpose:** Refresh access token  
**Auth:** Cookie with refresh_token  
**Request Body:** None  
**Success Response (200):**

```json
{
  "data": {
    "id": "ulid",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "role": "USER|ADMIN",
    "created_at": "datetime",
    "updated_at": "datetime",
    "access_token": "string"
  },
  "code": 200
}
```

**Response Headers:**

- `Set-Cookie: refresh_token=<new_jwt>; HttpOnly; Secure; SameSite=Strict; Path=/v1/auth/refresh; Max-Age=2592000`

**Errors:** 401 (invalid/expired token), 500 (server error)

## User Endpoints

### GET /v1/users/me

**Purpose:** Get current user details  
**Auth:** Bearer token required  
**Request Body:** None  
**Success Response (200):**

```json
{
  "data": {
    "id": "ulid",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "role": "USER|ADMIN",
    "created_at": "datetime",
    "updated_at": "datetime"
  },
  "code": 200
}
```

**Errors:** 401 (unauthorized), 500 (server error)

## Project Endpoints

### POST /v1/projects

**Purpose:** Create new project  
**Auth:** Bearer token required  
**Request Body:**

```json
{
  "project_name": "string (required, no emojis)",
  "budget": "integer (required, min 0)",
  "project_status": "PLANNING|IN_PROGRESS|COMPLETED (default: PLANNING)",
  "start_date": "datetime (optional, default: now)",
  "target_date": "datetime (required)",
  "description": "string (optional, max 1000 chars)"
}
```

**Success Response (201):**

```json
{
  "data": {
    "id": "ulid",
    "user_id": "ulid",
    "project_name": "string",
    "budget": "integer",
    "project_status": "enum",
    "start_date": "datetime",
    "target_date": "datetime",
    "actual_end_date": "datetime|null",
    "description": "string|null",
    "created_at": "datetime",
    "updated_at": "datetime"
  },
  "code": 201
}
```

**Errors:** 400 (validation), 401 (unauthorized), 500 (server error)

### GET /v1/projects

**Purpose:** Get user's projects with pagination  
**Auth:** Bearer token required  
**Query Parameters:**

- `skip`: integer (optional, min 0, default 0) - records to skip
- `take`: integer (optional, min 1, max 20, default 5) - max records to return  
  **Request Body:** None  
  **Success Response (200):**

```json
{
  "data": [
    {
      "id": "ulid",
      "user_id": "ulid",
      "project_name": "string",
      "budget": "integer",
      "project_status": "enum",
      "start_date": "datetime",
      "target_date": "datetime",
      "actual_end_date": "datetime|null",
      "description": "string|null",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ],
  "code": 200
}
```

**Errors:** 401 (unauthorized), 500 (server error)

### GET /v1/projects/{projectId}

**Purpose:** Get project by ID  
**Auth:** Bearer token required  
**Path Parameters:** `projectId` (ulid, required)  
**Request Body:** None  
**Success Response (200):** Same as POST /projects  
**Errors:** 401 (unauthorized), 404 (not found), 500 (server error)

### PATCH /v1/projects/{projectId}

**Purpose:** Update project  
**Auth:** Bearer token required  
**Path Parameters:** `projectId` (ulid, required)  
**Request Body:** Same as POST but all fields optional  
**Success Response (200):** Same as POST /projects  
**Errors:** 400 (validation), 401 (unauthorized), 404 (not found), 500 (server error)

### DELETE /v1/projects/{projectId}

**Purpose:** Delete project  
**Auth:** Bearer token required  
**Path Parameters:** `projectId` (ulid, required)  
**Request Body:** None  
**Success Response (200):**

```json
{
  "data": {
    "message": "project deleted"
  },
  "code": 200
}
```

**Errors:** 401 (unauthorized), 404 (not found), 500 (server error)

## Farm Endpoints

### POST /v1/projects/{projectId}/farms

**Purpose:** Create new farm  
**Auth:** Bearer token required  
**Path Parameters:** `projectId` (ulid, required)  
**Request Body:**

```json
{
  "project_id": "ulid (required, 26 chars)",
  "farm_name": "string (required, no emojis)",
  "location": "string (required)",
  "land_size": "number (required, positive) - hectares",
  "product_price": "integer (required, positive) - price per kg",
  "comodity": "string (required) - crop type",
  "farm_status": "ACTIVE|HARVESTED (default: ACTIVE)",
  "soil_type": "ORGANOSOL|ANDOSOL|LITOSOL|REGOSOL|VERTISOL|ALUVIAL|MEDISOL|PODZOLIK|GRUMUSOL|KAMBISOL (default: ORGANOSOL)",
  "planted_at": "datetime (default: now)",
  "target_harvest_date": "datetime (required)",
  "actual_harvest_date": "datetime (optional)",
  "total_harvest": "number (optional, positive) - kg harvested",
  "description": "string (optional, max 1000 chars)"
}
```

**Success Response (201):**

```json
{
  "data": {
    "id": "ulid",
    "project_id": "ulid",
    "farm_name": "string",
    "location": "string",
    "land_size": "number",
    "product_price": "integer",
    "comodity": "string",
    "farm_status": "enum",
    "soil_type": "enum",
    "planted_at": "datetime",
    "target_harvest_date": "datetime",
    "actual_harvest_date": "datetime|null",
    "total_harvest": "number|null",
    "description": "string|null",
    "created_at": "datetime",
    "updated_at": "datetime"
  },
  "code": 201
}
```

**Errors:** 400 (validation), 401 (unauthorized), 404 (project not found), 500 (server error)

### GET /v1/projects/{projectId}/farms

**Purpose:** Get farms by project with pagination  
**Auth:** Bearer token required  
**Path Parameters:** `projectId` (ulid, required)  
**Query Parameters:**

- `skip`: integer (optional, min 0, default 0) - records to skip
- `take`: integer (optional, min 1, max 20, default 5) - max records to return  
  **Request Body:** None  
  **Success Response (200):**

```json
{
  "data": [
    {
      "id": "ulid",
      "project_id": "ulid",
      "farm_name": "string",
      "location": "string",
      "land_size": "number",
      "product_price": "integer",
      "comodity": "string",
      "farm_status": "enum",
      "soil_type": "enum",
      "planted_at": "datetime",
      "target_harvest_date": "datetime",
      "actual_harvest_date": "datetime|null",
      "total_harvest": "number|null",
      "description": "string|null",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ],
  "code": 200
}
```

**Errors:** 401 (unauthorized), 404 (project not found), 500 (server error)

### GET /v1/projects/{projectId}/farms/{farmId}

**Purpose:** Get farm by ID  
**Auth:** Bearer token required  
**Path Parameters:** `projectId` (ulid, required), `farmId` (ulid, required)  
**Request Body:** None  
**Success Response (200):** Same as POST /farms  
**Errors:** 401 (unauthorized), 404 (farm/project not found), 500 (server error)

### PATCH /v1/projects/{projectId}/farms/{farmId}

**Purpose:** Update farm  
**Auth:** Bearer token required  
**Path Parameters:** `projectId` (ulid, required), `farmId` (ulid, required)  
**Request Body:** Same as POST but all fields optional except project_id (omitted)  
**Success Response (200):** Same as POST /farms  
**Errors:** 400 (validation), 401 (unauthorized), 404 (farm/project not found), 500 (server error)

### DELETE /v1/projects/{projectId}/farms/{farmId}

**Purpose:** Delete farm  
**Auth:** Bearer token required  
**Path Parameters:** `projectId` (ulid, required), `farmId` (ulid, required)  
**Request Body:** None  
**Success Response (200):**

```json
{
  "data": {
    "message": "farm deleted"
  },
  "code": 200
}
```

**Errors:** 401 (unauthorized), 404 (farm/project not found), 500 (server error)

## Data Types & Enums

### User Roles

- `USER` - Regular user
- `ADMIN` - Administrator

### Project Status

- `PLANNING` - Project in planning phase
- `IN_PROGRESS` - Project currently active
- `COMPLETED` - Project finished

### Farm Status

- `ACTIVE` - Farm currently growing crops
- `HARVESTED` - Farm completed harvest

### Soil Types

- `ORGANOSOL` - Organic soil
- `ANDOSOL` - Volcanic soil
- `LITOSOL` - Shallow rocky soil
- `REGOSOL` - Young soil
- `VERTISOL` - Clay-rich soil
- `ALUVIAL` - Alluvial soil
- `MEDISOL` - Mediterranean soil
- `PODZOLIK` - Acidic soil
- `GRUMUSOL` - Dark clay soil
- `KAMBISOL` - Cambic soil

## Common Error Responses

- **400 Bad Request:** Validation error, malformed request
- **401 Unauthorized:** Missing/invalid authentication token
- **404 Not Found:** Resource not found
- **409 Conflict:** Resource already exists (e.g., email)
- **500 Internal Server Error:** Server-side error

## Authentication Notes

- /v1/auth/login and /v1/auth/refresh returns user info and access_token in json format
- Use `Authorization: Bearer <token>` header for authenticated endpoints
- Refresh token is stored in HTTP-only cookie named `refresh_token`
- Access tokens expire and need refresh using `/v1/auth/refresh`
- All endpoints except register/login require authentication
