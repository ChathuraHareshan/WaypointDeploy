# Waypoint OMS: architecture

## Backend (Spring Boot 3, MongoDB), package-by-role
```
com.waypoint.oms
├── OmsApplication
├── config/        CorsConfig, SeedService (seeds on first start, reset() restores demo data)
├── common/        Models, *Repo, TripPlanner (trip minutes, round-trip km, stop sequence, ETA, late flags), ApiExceptionHandler
├── auth/          AuthController
├── dispatcher/    AllocationController, FleetController, AnalyticsController
│                  AllocationService (rules), AutoAllocationService (planner), BoardService, AlertService,
│                  FleetService, CapacityService, FuelService, ReportService
├── loader/        LoaderController + LoaderService
├── driver/        DriverController + DriverService
└── storemanager/  StoreManagerController + StoreManagerService
```
Rules: controllers only translate HTTP; services hold business logic; anything shared by several roles lives in `common`.
Every error is returned as `{ "status": 409, "message": "..." }`, so the UI shows the exact rule that was broken.

| Prefix | Role |
|---|---|
| `/api/auth` | login |
| `/api/dispatcher` | board, allocations (manual, `/auto`, `/reset`), defer, loader, `trips/{v}/{t}/sequence`, fleet, vehicle status/driver/refuel, capacity, fuel, reports, `seed/reset` |
| `/api/loader` | runs, load, flag, depart |
| `/api/driver` | run, delivery |
| `/api/store` | outlets, place order, my orders, receipt |

## Allocation rules (enforced on every manual drop and by the planner)
depot match · refrigeration · van-only access · one brand + district per trip · weight and volume per trip · max two trips per vehicle ·
time budget (Fresh 270 min, Style/Tech 480 min) · weekly fuel quota (round-trip km / km per litre).
Delivery-window conflicts are shown as *late stops* (warning, re-sequence in Route Management) rather than blocking.

## Auto-allocation (`AutoAllocationService`)
In-memory greedy planner (one read, one write). Priority: outlets skipped before, longest unserved, Fresh first. Each order goes to the feasible trip that
consolidates its district and wastes the least capacity; reefers are kept for chilled orders where possible. Unplaceable orders are deferred with a stated reason.
It is a heuristic, not an optimiser.

## Frontend (React, Tailwind, Vite), routed by role
```
src/pages/auth | loader | driver | store-manager
src/pages/dispatcher
├── DispatcherLayout.jsx    shell, banners, modals, <Outlet/>
├── DispatcherContext.jsx   board polling, depot, every allocation action
└── tabs/                   Allocation, Dashboard, LiveDispatch, Fleet, Capacity, Routes, Fuel, Deferrals, Reports
```
Dispatcher URLs: `/dispatcher/allocation | dashboard | dispatch | fleet | capacity | routes | fuel | deferrals | reports` (refresh and back/forward work).
All HTTP calls are in `src/api.js`, grouped by backend role.

## Resetting demo data
Seeding only fills empty collections. After upgrading (outlets now have coordinates) reset once:
`curl -X POST http://localhost:8080/api/dispatcher/seed/reset`


## Driver module
**Backend (`driver/`)**: `GET /api/driver/{vehicle}/run` (trips, stops, summary, contacts, `version` for change detection) · `POST /api/driver/{vehicle}/sync` (batch of actions) · `GET /api/driver/orders/{ref}/pod` (signature + photo).
Actions: `ARRIVE`, `DELIVER` (recipient, signature, photo, delivered units, issue, note), `FAIL` (reason), `INCIDENT` / `INCIDENT_CLEAR`, `RETURN`, `LOCATION`.
Every action carries a client id (idempotent replays) and a client timestamp (applied in the order the driver acted, stored in Colombo time). Rules are checked per action and each gets its own result, so one conflict
never blocks the rest: order re-routed to another vehicle, stop already final, run not departed, missing proof of delivery, units above ordered, pending stops on return.
Signature and photo are `@JsonIgnore`d on `Order`, so polled JSON (driver run, dispatcher board) stays small; images are served from the `/pod` endpoint.
Driver incidents surface as dispatcher alerts; GPS reports update the vehicle and appear as a marker in the dispatcher's Route & Map dialog.

**Frontend (`pages/driver/`)**
```
Driver.jsx           screen state machine (Navigate / Stops / Help tabs)
hooks/useDriverSync  offline-first queue: write-ahead localStorage, optimistic UI, batch sync, conflicts, route-change detection
hooks/useGeo         phone GPS + speed, or a simulated truck for demos
hooks/useReminders   15 min / 5 min / late stop-window warnings (banner, chime, speech)
hooks/useClock       clock with an override for demos
components/          RunMap, NextStopSheet (drive mode), DeliverySheet, SignaturePad, PhotoCapture, StopsList, HelpPanel, Banners, ConflictSheet, RunSummary
```
Drive mode: above 8 km/h the sheet collapses to one strip with only "Call dispatcher"; delivery controls are locked and reminders are read aloud.
