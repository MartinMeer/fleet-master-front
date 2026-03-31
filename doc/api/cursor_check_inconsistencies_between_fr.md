# Check inconsistencies between frontend and API
_Exported on 11/12/2025 at 23:31:39 GMT+3 from Cursor (1.7.54)_

---

**User**

pls check any inconsistencies between real frontetnd calls and api specification

---

**Cursor**

## Plan
- `// Step 1: Open doc/api/FLEETMASTER_API_SPECIFICATION.md and note response envelopes, pagination, field types for each endpoint`
- `// Step 2: Review apps/main-app/src/services/DataService.ts to see how each frontend call hits the API and what shapes it expects`
- `// Step 3: Trace key feature flows (cars, alerts, service records, maintenance plans) in pages/ to inspect the payloads they assemble`
- `// Step 4: Compare each frontend expectation/payload with the spec, marking every mismatch in structure, types, and formatting`
- `// Step 5: Summarise the inconsistencies with code references plus quick remediation hints`

## Findings
- **Response envelope & pagination ignored** – Every `DataService` fetch assumes the backend returns raw arrays or entities, but the spec wraps data in `{ success, data, pagination }`. For example, `getCars()` just returns `apiCall<Car[]>('/cars')`, so `Home` will try to call `.map` on the whole response object once the backend follows the spec. Same issue for cars, alerts, service records, maintenance entries/plans, and all CRUD methods because `apiCall` never unwraps `.data`.
```164:200:apps/main-app/src/services/DataService.ts
static async getCars(): Promise<Car[]> {
  if (this.useBackend) {
    return await this.apiCall<Car[]>('/cars');
  } else {
    return this.getFromStorage<Car[]>('cars', []);
  }
}
```
```121:137:apps/main-app/src/services/DataService.ts
private static async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${this.config.API_URL}${endpoint}`, { ...options, headers: { ...this.getAuthHeaders(), ...options.headers } });
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}
```
```122:147:doc/api/FLEETMASTER_API_SPECIFICATION.md
{
  "success": true,
  "data": [
    {
      "id": "car_123",
      "name": "Toyota Camry",
      "nickname": "Sweety",
      ...
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

- **Service record payload mismatches** – The Add Service Record form ships the mileage as a string and keeps the date in Russian format (`ДД.ММ.ГГГГ`), while the API needs an ISO date and numeric mileage. The operations array also contains objects with `name`, `parts[{name,quantity,cost}]`, and `laborCost`, matching the spec, but `DataService`’s TypeScript model still expects a `cost` number and `parts?: string[]`, so the shapes disagree.
```269:278:apps/main-app/src/pages/AddServiceRecord.tsx
const serviceRecordData = {
  carId: formData.carId,
  carName: cars.find(c => c.id === formData.carId)?.name || 'Неизвестный автомобиль',
  date: formData.date,
  mileage: formData.mileage,
  serviceProvider: formData.serviceProvider,
  totalCost: calculateTotalCost(),
  operations,
  notes: formData.notes
}
```
```28:35:apps/main-app/src/lib/utils.ts
getCurrentRussianDate: (): string => {
  const today = new Date()
  const day = today.getDate().toString().padStart(2, '0')
  const month = (today.getMonth() + 1).toString().padStart(2, '0')
  const year = today.getFullYear()
  return `${day}.${month}.${year}`
},
```
```818:867:doc/api/FLEETMASTER_API_SPECIFICATION.md
"date": "2024-11-04T00:00:00Z",
"mileage": 90000,
"serviceProvider": "Автосервис Центр",
"operations": [
  {
    "id": "op_001",
    "type": "periodical",
    "name": "Замена масла и фильтров",
    "description": "Плановое ТО",
    "parts": [
      { "name": "Масло 5W-30", "quantity": 1, "cost": 3000 }
    ],
    "laborCost": 3000,
    "linkedAlertId": null,
    "recommendations": "Следующая замена через 10000 км"
  }
]
```
```49:55:apps/main-app/src/services/DataService.ts
export interface ServiceOperation {
  id: string;
  type: 'maintenance' | 'repair';
  description: string;
  cost: number;
  parts?: string[];
}
```

- **Maintenance plans use non-ISO dates** – The planner persists `plannedDate` and `plannedCompletionDate` in Russian format before calling the API. The backend examples (and filtering logic) expect ISO timestamps, so this will fail validation or sorting once the real API is in place.
```464:488:apps/main-app/src/pages/MaintenancePlanning.tsx
const planData = {
  carId: selectedCarId,
  carName: selectedCar?.name || 'Неизвестный автомобиль',
  plannedDate,
  plannedCompletionDate,
  plannedMileage,
  periodicOperations: selectedPeriodicOps.map(item => ({
    operation: item.operation,
    selected: true,
    priority: item.priority,
    estimatedCost: item.estimatedCost || 0,
    notes: item.planNotes || item.notes || ''
  })),
  repairOperations: selectedRepairOps.map(item => ({
    alertId: item.alertId,
    description: item.description,
    priority: item.priority,
    estimatedCost: item.estimatedCost || 0,
    notes: item.planNotes || item.notes || ''
  })),
  totalEstimatedCost: calculateTotalCost(),
  serviceProvider,
  notes: planNotes,
  status: 'draft' as const
}
```
```1148:1193:doc/api/FLEETMASTER_API_SPECIFICATION.md
"plannedDate": "2024-11-10T09:00:00Z",
"plannedCompletionDate": "2024-11-12T17:00:00Z",
"plannedMileage": "95000",
"periodicOperations": [
  {
    "operation": "Замена масла",
    "selected": true,
    "priority": "high",
    "estimatedCost": 4500,
    "notes": "Синтетическое масло 5W-30"
  }
],
"repairOperations": [
  {
    "alertId": "alert_456",
    "description": "Ремонт тормозов",
    "priority": "critical",
    "estimatedCost": 12000,
    "notes": "Замена колодок и дисков"
  }
],
"totalEstimatedCost": 16500,
"serviceProvider": "Автосервис Премиум",
"notes": "Комплексное ТО с ремонтом"
```

### Next Steps
- Update `DataService.apiCall` to unwrap `{ success, data }` and expose pagination where needed, then adjust callers (`getCars`, `getAlerts`, etc.) to work with the new shape.
- Normalize dates to ISO strings before sending to the API (service records and maintenance plans) and convert back to Russian format only for display.
- Align the `ServiceOperation` interface with the spec (`type: 'periodical' | 'repair'`, include `name`, `parts` objects, `laborCost`) so TS catches payload issues.
- Once shapes are fixed, retest flows (add/edit car, add service record, maintenance planning) against the backend, verifying the API accepts payloads and the UI reads the wrapped responses correctly.

```typescript
static async getCars(): Promise<Car[]> {
  if (this.useBackend) {
    return await this.apiCall<Car[]>('/cars');
  } else {
    return this.getFromStorage<Car[]>('cars', []);
  }
}
```

```typescript
private static async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${this.config.API_URL}${endpoint}`, { ...options, headers: { ...this.getAuthHeaders(), ...options.headers } });
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}
```

```plaintext
{
  "success": true,
  "data": [
    {
      "id": "car_123",
      "name": "Toyota Camry",
      "nickname": "Sweety",
      ...
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

```typescriptreact
const serviceRecordData = {
  carId: formData.carId,
  carName: cars.find(c => c.id === formData.carId)?.name || 'Неизвестный автомобиль',
  date: formData.date,
  mileage: formData.mileage,
  serviceProvider: formData.serviceProvider,
  totalCost: calculateTotalCost(),
  operations,
  notes: formData.notes
}
```

```typescript
getCurrentRussianDate: (): string => {
  const today = new Date()
  const day = today.getDate().toString().padStart(2, '0')
  const month = (today.getMonth() + 1).toString().padStart(2, '0')
  const year = today.getFullYear()
  return `${day}.${month}.${year}`
},
```

```plaintext
"date": "2024-11-04T00:00:00Z",
"mileage": 90000,
"serviceProvider": "Автосервис Центр",
"operations": [
  {
    "id": "op_001",
    "type": "periodical",
    "name": "Замена масла и фильтров",
    "description": "Плановое ТО",
    "parts": [
      { "name": "Масло 5W-30", "quantity": 1, "cost": 3000 }
    ],
    "laborCost": 3000,
    "linkedAlertId": null,
    "recommendations": "Следующая замена через 10000 км"
  }
]
```

```typescript
export interface ServiceOperation {
  id: string;
  type: 'maintenance' | 'repair';
  description: string;
  cost: number;
  parts?: string[];
}
```

```typescriptreact
const planData = {
  carId: selectedCarId,
  carName: selectedCar?.name || 'Неизвестный автомобиль',
  plannedDate,
  plannedCompletionDate,
  plannedMileage,
  periodicOperations: selectedPeriodicOps.map(item => ({
    operation: item.operation,
    selected: true,
    priority: item.priority,
    estimatedCost: item.estimatedCost || 0,
    notes: item.planNotes || item.notes || ''
  })),
  repairOperations: selectedRepairOps.map(item => ({
    alertId: item.alertId,
    description: item.description,
    priority: item.priority,
    estimatedCost: item.estimatedCost || 0,
    notes: item.planNotes || item.notes || ''
  })),
  totalEstimatedCost: calculateTotalCost(),
  serviceProvider,
  notes: planNotes,
  status: 'draft' as const
}
```

```plaintext
"plannedDate": "2024-11-10T09:00:00Z",
"plannedCompletionDate": "2024-11-12T17:00:00Z",
"plannedMileage": "95000",
"periodicOperations": [
  {
    "operation": "Замена масла",
    "selected": true,
    "priority": "high",
    "estimatedCost": 4500,
    "notes": "Синтетическое масло 5W-30"
  }
],
"repairOperations": [
  {
    "alertId": "alert_456",
    "description": "Ремонт тормозов",
    "priority": "critical",
    "estimatedCost": 12000,
    "notes": "Замена колодок и дисков"
  }
],
"totalEstimatedCost": 16500,
"serviceProvider": "Автосервис Премиум",
"notes": "Комплексное ТО с ремонтом"
```

---

**User**

Ok, make it

---

**Cursor**

Here’s the detailed plan before I start coding—please confirm it looks good:

```
// Overall Strategy
//   Align frontend payloads and response handling with the documented REST spec.
//   Keep localStorage (dev) flow working while adding proper conversions for backend mode.


// Step A: DataService response & type refactor
//   - Introduce ApiResponse<T> and Pagination types that mirror the spec.
//   - Update apiCall:
//       call fetch
//       parse json
//       if success false -> throw with error.message
//       return ApiResponse<T>
//   - Update each DataService public method that hits the backend:
//       const { data } = await apiCall<ApiPayload>('/endpoint')
//       return data
//       (store pagination if needed – for now discard but keep hook for future)
//   - Adjust ServiceRecord/ServiceOperation interfaces:
//       ServiceOperation: { id, type: 'periodical' | 'repair', name, description, parts[{name,quantity,cost}], laborCost, linkedAlertId?, recommendations? }
//       ServiceRecord operations to use new interface and mileage:number
//   - Ensure localStorage paths still work: when useBackend false, keep current behavior, but honor new interfaces.


// Step B: Service record submission fixes
//   - In AddServiceRecord.handleSubmit:
//       convert formData.date (Russian) -> isoDate = new Date(`${dateUtils.russianToISO(date)}T00:00:00Z`).toISOString()
//       convert mileage -> parseInt
//       build payload with updated operations (ensuring numbers in parts)
//       call DataService.saveServiceRecord(payload)
//   - For local path: store same ISO date so data model consistent
//   - Update ServiceHistory rendering:
//       when showing record.date -> display dateUtils.isoToRussian if string matches ISO pattern else keep original
//   - Guard sort to handle both ISO and Russian dates (fallback).


// Step C: Maintenance plan payloads
//   - In MaintenancePlanning savePlanData:
//       before sending:
//         const isoPlannedDate = convert to ISO (russianToISO + T00:00:00Z + toISOString())
//         same for plannedCompletionDate
//       build payload with iso values
//       if not useBackend (local storage), consider storing iso for consistency
//   - When loading plans into form (both backend responses and local storage):
//       convert ISO date strings back to Russian format before setting state
//   - Ensure any UI display (Home dialog, InMaintenance page) uses isoToRussian fallback when showing dates.


// Step D: Regression checks
//   - Run lint (read_lints) for touched files.
//   - Smoke-test flows mentally: AddServiceRecord, ServiceHistory, MaintenancePlanning, Home stats, InMaintenance.
//   - Update TODO statuses.
```

Let me know if you’d like any changes to this plan; once approved I’ll implement it.

```plaintext
// Overall Strategy
//   Align frontend payloads and response handling with the documented REST spec.
//   Keep localStorage (dev) flow working while adding proper conversions for backend mode.


// Step A: DataService response & type refactor
//   - Introduce ApiResponse<T> and Pagination types that mirror the spec.
//   - Update apiCall:
//       call fetch
//       parse json
//       if success false -> throw with error.message
//       return ApiResponse<T>
//   - Update each DataService public method that hits the backend:
//       const { data } = await apiCall<ApiPayload>('/endpoint')
//       return data
//       (store pagination if needed – for now discard but keep hook for future)
//   - Adjust ServiceRecord/ServiceOperation interfaces:
//       ServiceOperation: { id, type: 'periodical' | 'repair', name, description, parts[{name,quantity,cost}], laborCost, linkedAlertId?, recommendations? }
//       ServiceRecord operations to use new interface and mileage:number
//   - Ensure localStorage paths still work: when useBackend false, keep current behavior, but honor new interfaces.


// Step B: Service record submission fixes
//   - In AddServiceRecord.handleSubmit:
//       convert formData.date (Russian) -> isoDate = new Date(`${dateUtils.russianToISO(date)}T00:00:00Z`).toISOString()
//       convert mileage -> parseInt
//       build payload with updated operations (ensuring numbers in parts)
//       call DataService.saveServiceRecord(payload)
//   - For local path: store same ISO date so data model consistent
//   - Update ServiceHistory rendering:
//       when showing record.date -> display dateUtils.isoToRussian if string matches ISO pattern else keep original
//   - Guard sort to handle both ISO and Russian dates (fallback).


// Step C: Maintenance plan payloads
//   - In MaintenancePlanning savePlanData:
//       before sending:
//         const isoPlannedDate = convert to ISO (russianToISO + T00:00:00Z + toISOString())
//         same for plannedCompletionDate
//       build payload with iso values
//       if not useBackend (local storage), consider storing iso for consistency
//   - When loading plans into form (both backend responses and local storage):
//       convert ISO date strings back to Russian format before setting state
//   - Ensure any UI display (Home dialog, InMaintenance page) uses isoToRussian fallback when showing dates.


// Step D: Regression checks
//   - Run lint (read_lints) for touched files.
//   - Smoke-test flows mentally: AddServiceRecord, ServiceHistory, MaintenancePlanning, Home stats, InMaintenance.
//   - Update TODO statuses.
```

---

**User**

Pls don't code, write a comprehencive plan instead

---

**Cursor**

## Backend Alignment Plan (No Code Yet)

### 1. Response Handling & Typing in `DataService`
- **Define shared types**
  - `ApiResponse<T>` representing `{ success, data, message?, pagination? }`
  - `Pagination` interface to mirror spec structure (page, limit, total, …)
  - Centralize in `types/api.ts` (new file) or near `DataService` for now.
- **Refactor `apiCall`**
  - Parse JSON once, assert `success === true`
  - On `success === false`, surface `error.message` (throw) so callers can show useful feedback.
  - Keep backward compatibility for localStorage mode.
- **Adjust CRUD helpers**
  - `getCars`, `getAlerts`, `getServiceRecords`, `getMaintenanceEntries`, `getMaintenancePlans`, etc. now return `apiResult.data`.
  - Consider returning `{ items, pagination }` for list endpoints; for now, keep `data` but leave TODO-ready placeholder.
- **Data models & conversions**
  - Update `ServiceOperation` interface to spec (type union, `name`, `parts` as array of objects, `laborCost`, optional `linkedAlertId` / `recommendations`).
  - Ensure `MaintenancePlan.periodicOperations` / `repairOperations` use typed arrays (no `any[]`).
  - Keep localStorage data in sync: when storing offline, follow the same shape so switching modes doesn’t break.

### 2. Service Record Form Compliance
- **Date normalization**
  - Convert UI date (Russian) → ISO before constructing payload (`russianToISO` + `T00:00:00Z`, `Date(...).toISOString()`).
  - When loading data (ServiceHistory, edit flows), render ISO back to Russian using `isoToRussian`.
- **Mileage & number fields**
  - Parse mileage to `number` before submit (`parseInt`, fallback to `0`).
  - Ensure operation parts (`quantity`, `cost`) remain numbers (use `Number` parsing where user can type strings).
- **ServiceHistory display**
  - Sorting by date should guard against non-ISO strings; prefer `new Date(value).getTime()`; fallback if parse fails.
  - Show “Дата” using localized format: if ISO -> `isoToRussian`, else original string.

### 3. Maintenance Plan Payloads
- **Submission path (`savePlanData`)**
  - Convert `plannedDate` / `plannedCompletionDate` to ISO (same approach as service records).
  - Keep `plannedMileage` as string? Spec says optional string; confirm and convert only if backend expects numeric.
  - When sending to backend, ensure operations arrays match spec (`selected`, `priority`, `estimatedCost`, `notes`).
- **Loading & editing**
  - When receiving ISO strings from backend/localStorage, convert to Russian before writing form state.
  - Ensure auto-save writes ISO values so subsequent manual saves remain consistent.
- **Dependent flows**
  - `Home` dialog & `InMaintenance` page should read plan dates using `isoToRussian` for display.
  - When adding maintenance entries (send to local storage or eventual backend), convert dates to ISO too.

### 4. Alerts & Cars (Consistency Check)
- **Car details**
  - Confirm create/update paths already match spec (name auto-generation present; ensure optional fields remain optional).
  - For car images, spec expects base64 string; UI already provides; keep as-is.
- **Alerts**
  - Verify `AlertService.createAlert` payload matches spec; adjust if new fields (e.g., `reportedAt`) should be omitted/derived by backend.
  - In `AlertList`, ensure editing and archiving use API once backend is active (currently localStorage only)—call out as future task.

### 5. Shared Utilities & Helpers
- **Date utilities**
  - Possibly add `toIsoDateAtMidnight(russianDate: string): string` helper to avoid duplicate conversion logic.
  - Extend utils to safely detect ISO vs Russian formats.
- **Error handling**
  - Provide a helper to convert API errors to user-friendly alerts (extract `error.message` from spec).

### 6. Testing & Validation
- **Manual smoke checks**
  - Add car (no backend changes needed but ensures nothing regressed).
  - Add service record, verify backend payload via network tab (if backend available) or console log.
  - Create maintenance plan, inspect saved data (localStorage/offline mode) to confirm ISO storage.
- **Automated checks (future)**
  - Consider adding unit tests for new conversion helpers.
  - Potential integration tests for DataService once backend stubs exist.

### 7. Rollout & Communication
- **Flag-breaking changes**
  - Document requirement: backend must now return spec envelope; highlight for backend team.
  - Inform QA about date format changes so they update fixtures.
- **Future Enhancements**
  - Add pagination support to UI once backend lists are live.
  - Replace remaining localStorage-mocked flows (alerts, maintenance entries) with real API calls when endpoints ready.

Let me know if this plan captures everything you wanted or if we should tweak/extend any section before implementation.

