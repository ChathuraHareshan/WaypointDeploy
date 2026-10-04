# Waypoint OMS – Dispatcher Order Allocation
React + Tailwind (Vite) · Spring Boot 3 · MongoDB. Seed data comes from the competition CSVs (`backend/src/main/resources/seed`, auto-loaded on first start).

## Run
`docker compose up --build` → http://localhost:5173/dispatcher
Dev: `mongod`; `cd backend && mvn spring-boot:run`; `cd frontend && npm i && npm run dev` (proxy → :8080).

## Flow
1. `/store-manager` – place an order → lands in MongoDB as CONFIRMED.
2. `/dispatcher` – left: unallocated orders (filter by brand). Right: available vehicles with Trip 1 / Trip 2 slots (workshop vehicles greyed). Drag an order onto a slot.
3. The server validates all 7 feasibility rules (brand+district per trip, reefer, van-only, home depot, weight/volume, max 2 trips, 270/480 min budgets using district_travel + service_allowance). Violations show a red message and the drop is rejected.
4. Assigned orders leave the queue (shown inside the trip; "Unassign" returns them). "Defer" records a reason.
5. Click a vehicle / "Route & Map" → dialog with Leaflet map (depot → stops, truck marker, progress slider), trip time/load, and loader selection (one loader per vehicle, same depot). Driver is shown per vehicle.

## API
GET /api/board · POST /api/allocations · DELETE /api/allocations/{ref} · POST /api/orders/{ref}/defer · PUT /api/vehicles/{id}/loader · GET/POST /api/orders|outlets

## All four roles (login at http://localhost:5173)
| Role | Username / password | Screen |
|---|---|---|
| Dispatcher | `dispatcher` / `dispatch123` | `/dispatcher` |
| Loader | `loader01`…`loader12` (Peliyagoda) / `loader123` | `/loader` |
| Driver | `driver003` (= VEH003) … / `driver123` | `/driver` |
| Store manager | `out001`…`out120` / `store123` | `/store-manager` |

### End-to-end walkthrough
1. Store manager (`out001`) → Place order.
2. Dispatcher → drag orders onto a vehicle's Trip slot (try VEH003 with OUT001's orders) → pick a loader (e.g. loader01 / LDR01) on that vehicle.
3. Loader (`loader01`) → sees that vehicle's run, ticks items (last stop first), can Flag items → Confirm Load Complete.
4. Driver (`driver003`, same vehicle) → sees the run → I've Arrived → Complete Delivery (POD). Turn the backend off to see offline queueing; it syncs on reconnect.
5. Store manager → tracks ETA and status, then Confirm Receipt or Report Issue. Dispatcher's vehicle card shows loading and delivery progress and flagged items.

Demo note: passwords are plain text and RBAC is enforced by the frontend route guards only. Add JWT + backend role checks before production.

---
## Architecture update
See `docs/ARCHITECTURE.md`. Highlights: backend split into role packages (`dispatcher`, `loader`, `driver`, `storemanager`, `auth`, `common`), API namespaced per role,
dispatcher UI split into route-based tab modules, Route Management and Reports implemented, real alerts, fuel-aware allocation, planner-based auto-allocation with deferral reasons.
**After upgrading run once:** `curl -X POST http://localhost:8080/api/dispatcher/seed/reset` (outlets gained coordinates and names).
Frontend: `cd frontend && npm install && npm run dev` (`@vitejs/plugin-react` is now `^6` to match Vite 8).

### UI fixes (latest)
- Route & Map and Defer dialogs restored in `DispatcherLayout` (Order Allocation, Fleet and Live Dispatch buttons all use them).
- Tailwind now uses `darkMode: "class"`; the theme follows the clock (Morning 3:30 AM to 11:59 AM, Evening otherwise) until you click the toggle. The **Auto** pill returns to clock mode.
- App shell is a fixed viewport: header and sidebar never move, only the content area scrolls.
- Header fleet badge and the notification bell use live data instead of fixed text.


### Loader App & Digital Loading Manifest (`/loader`)
Access with 1-click quick demo login (`loader01` / `loader123`), via sidebar "Warehouse Dock → Loading Operations", or directly at `/loader`.
- **Shift Summary (`/loader/summary`)**: Overview of active runs, items handled, loaded stops, verification accuracy, and dock telemetry.
- **Digital Manifest (`/loader/manifest/:runId`)**: Run checklist with van/dock badges, vehicle capacity bar, stop progress counter, and locked states.
- **Stop Sequencing (`/loader/run/:runId/stops`)**: LIFO (Last-In First-Out) reverse delivery loading order for efficient truck packout.
- **Item Barcode Scanner (`/loader/run/:runId/stop/:stopId`)**: Fast-tap SKU verifier with audio haptics, zone tags (Rear, Mid, Front), and discrepancy alerts.
- **Exception Reporting (`/loader/run/:runId/flag/:stopId`, `/loader/run/:runId/exceptions`)**: Flag damaged/missing inventory with photos and dispatch notification.
- **Sign-off (`/loader/run/:runId/signoff`)**: PIN verification with store manager departure sign-off and dispatch release.
- **Warehouse Loading Dock (`/loader/dock`)**: Original warehouse dock board toggleable directly from the manifest header.

### Store Manager Portal (`/store-manager` or `/sm`)
Access with 1-click quick demo login (`out001` / `store123`), via sidebar "Store Portal → Store Manager Portal", or directly at `/store-manager`.
- **Dashboard (`/store-manager/dashboard`)**: KPIs (weekly orders, deferred orders, issues reported, on-time rate), live delivery tracker with ETA, cutoff countdown, and quick actions.
- **Place Order (`/store-manager/place-order`)**: Catalog item picker with ambient/chilled temperature badges, live quantity adjustments, and cutoff enforcement.
- **My Orders (`/store-manager/orders`)**: Comprehensive order history filterable by status (`Placed`, `Confirmed`, `Deferred`, `Delivery`, `Issue reported`).
- **Incoming Delivery (`/store-manager/incoming`)**: Real-time delivery tracking with vehicle and driver info, stops ahead, item manifest, and deferral acknowledgements.
- **Receiving (`/store-manager/receiving`)**: Digital checklist for checking off unloaded goods, flagging discrepancies, and signing off with driver.
- **Reports (`/store-manager/reports`)**: On-time delivery performance charts and deferral audit log with reasons and rescheduling options.
- **Waypoint Assist (ChatBot)**: Intelligent floating assistant helping store managers track orders, check cutoff times, and submit claims.
