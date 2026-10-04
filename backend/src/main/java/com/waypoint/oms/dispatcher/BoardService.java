package com.waypoint.oms.dispatcher;
import com.waypoint.oms.common.*;
import com.waypoint.oms.common.Models.*;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.*;
import static com.waypoint.oms.common.TripPlanner.bad;
@Service
public class BoardService {
  private final OrderRepo orders;
  private final VehicleRepo vehicles;
  private final LoaderRepo loaders;
  private final DistrictRepo dist;
  private final AlertService alertService;
  private final TripPlanner tp;
  public BoardService(OrderRepo orders, VehicleRepo vehicles, LoaderRepo loaders, DistrictRepo dist, AlertService alertService, TripPlanner tp) {
    this.orders = orders;
    this.vehicles = vehicles;
    this.loaders = loaders;
    this.dist = dist;
    this.alertService = alertService;
    this.tp = tp;
  }
  public Map<String, Object> board(String depot) {
    List<Order> all = orders.findByDepot(depot);
    List<Vehicle> vs = vehicles.findByDepot(depot);
    List<Map<String, Object>> vv = new ArrayList<>();
    for (Vehicle v : vs) {
      Map<String, Object> m = new LinkedHashMap<>();
      m.put("vehicle", v);
      m.put("loader", v.loaderId == null ? null : loaders.findById(v.loaderId).orElse(null));
      m.put("trips", tp.tripsOf(v, all));
      vv.add(m);
    }
    long allocatedCount = all.stream().filter(x -> "ALLOCATED".equals(x.status)).count();
    long deferredCount = all.stream().filter(x -> "DEFERRED".equals(x.status)).count();
    long unallocatedCount = all.size() - allocatedCount - deferredCount;
    double totalWeight = all.stream().mapToDouble(x -> x.weightKg).sum();
    double totalVol = all.stream().mapToDouble(x -> x.volumeM3).sum();
    double allocatedWeight = all.stream().filter(x -> "ALLOCATED".equals(x.status)).mapToDouble(x -> x.weightKg).sum();
    double totalFleetWeightCap = vs.stream().filter(v -> "available".equals(v.status)).mapToDouble(v -> v.weightCap * 2).sum();
    int fleetCapPct = totalFleetWeightCap > 0 ? (int) Math.round((allocatedWeight / totalFleetWeightCap) * 100) : 0;
    long chilledOrders = all.stream().filter(x -> "chilled".equals(x.temp)).count();
    long workshopVehicles = vs.stream().filter(x -> "in_workshop".equals(x.status)).count();
    long availableVehicles = vs.stream().filter(x -> "available".equals(x.status)).count();
    Map<String, Object> stats = new LinkedHashMap<>();
    stats.put("total", all.size());
    stats.put("allocated", allocatedCount);
    stats.put("unallocated", unallocatedCount);
    stats.put("deferred", deferredCount);
    stats.put("chilledOrders", chilledOrders);
    stats.put("weightKg", totalWeight);
    stats.put("volumeM3", totalVol);
    stats.put("allocatedWeightKg", allocatedWeight);
    stats.put("fleetCapacityPct", fleetCapPct);
    stats.put("availableVehicles", availableVehicles);
    stats.put("workshopVehicles", workshopVehicles);
    stats.put("totalVehicles", vs.size());
    long deliveredCount = all.stream().filter(x -> "DELIVERED".equalsIgnoreCase(x.delivery)).count();
    List<Map<String, Object>> damagedOrders = all.stream()
      .filter(x -> "Damaged".equalsIgnoreCase(x.issueType) || 
                   "DAMAGED".equalsIgnoreCase(x.flag) || 
                   (x.issueType != null && x.issueType.toLowerCase().contains("damage")) ||
                   (x.claimType != null && x.claimType.toLowerCase().contains("damage")))
      .map(x -> {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("orderRef", x.orderRef);
        m.put("outletId", x.outletId);
        m.put("brand", x.brand);
        m.put("district", x.district);
        m.put("vehicleId", x.vehicleId);
        m.put("trip", x.trip);
        m.put("units", x.units);
        m.put("deliveredUnits", x.deliveredUnits != null ? x.deliveredUnits : x.units);
        m.put("issueType", x.issueType != null ? x.issueType : (x.claimType != null ? x.claimType : "Damaged"));
        m.put("deliveryNote", x.deliveryNote != null ? x.deliveryNote : (x.flagNotes != null ? x.flagNotes : ""));
        m.put("deliveryTime", x.deliveryTime);
        m.put("delivery", x.delivery);
        m.put("receipt", x.receipt);
        m.put("recipient", x.recipient);
        m.put("pod", x.signature != null && x.photo != null);
        return m;
      })
      .collect(Collectors.toList());
    List<Map<String, Object>> refusedOrders = all.stream()
      .filter(x -> "FAILED".equalsIgnoreCase(x.delivery) || 
                   "SKIPPED".equalsIgnoreCase(x.delivery) || 
                   "DISPUTED".equalsIgnoreCase(x.receipt) ||
                   (x.issueType != null && (x.issueType.toLowerCase().contains("refused") || x.issueType.toLowerCase().contains("reject"))))
      .map(x -> {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("orderRef", x.orderRef);
        m.put("outletId", x.outletId);
        m.put("brand", x.brand);
        m.put("district", x.district);
        m.put("vehicleId", x.vehicleId);
        m.put("trip", x.trip);
        m.put("units", x.units);
        m.put("issueType", x.issueType != null ? x.issueType : (x.claimType != null ? x.claimType : "Delivery Refused"));
        m.put("deliveryNote", x.deliveryNote != null ? x.deliveryNote : (x.receiptNote != null ? x.receiptNote : ""));
        m.put("deliveryTime", x.deliveryTime);
        m.put("delivery", x.delivery);
        m.put("receipt", x.receipt);
        return m;
      })
      .collect(Collectors.toList());
    stats.put("delivered", deliveredCount);
    stats.put("damaged", (long) damagedOrders.size());
    stats.put("refused", (long) refusedOrders.size());
    List<Alert> alerts = alertService.build(all, vs);
    List<Map<String, Object>> deferralHistory = all.stream()
      .filter(x -> "DEFERRED".equals(x.status) || x.deferredYesterday == 1)
      .map(x -> Map.<String, Object>of(
        "orderRef", x.orderRef,
        "outletId", x.outletId,
        "district", x.district,
        "brand", x.brand,
        "consecutiveSkips", x.skipCount + x.deferredYesterday,
        "reason", x.deferReason != null ? x.deferReason : "Vehicle capacity constraint",
        "rescheduleDate", x.rescheduleDate != null ? x.rescheduleDate : "Next Run (Tomorrow)",
        "notes", x.notes != null ? x.notes : ""
      ))
      .collect(Collectors.toList());
    Map<String, Object> res = new LinkedHashMap<>();
    res.put("orders", all.stream().filter(x -> !"ALLOCATED".equals(x.status) && !"DEFERRED".equals(x.status)).collect(Collectors.toList()));
    res.put("deferredOrders", all.stream().filter(x -> "DEFERRED".equals(x.status)).collect(Collectors.toList()));
    res.put("vehicles", vv);
    res.put("stats", stats);
    res.put("loaders", loaders.findAll().stream().filter(l -> l.depot.equalsIgnoreCase(depot)).collect(Collectors.toList()));
    res.put("districts", dist.findAll());
    res.put("alerts", alerts);
    res.put("deferralHistory", deferralHistory);
    res.put("damagedOrders", damagedOrders);
    res.put("refusedOrders", refusedOrders);
    return res;
  }
}
