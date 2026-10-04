package com.waypoint.oms.dispatcher;
import com.waypoint.oms.common.*;
import com.waypoint.oms.common.Models.*;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.*;
import static com.waypoint.oms.common.TripPlanner.bad;
@Service
public class FleetService {
  private final OrderRepo orders;
  private final VehicleRepo vehicles;
  private final LoaderRepo loaders;
  private final TripPlanner tp;
  public FleetService(OrderRepo orders, VehicleRepo vehicles, LoaderRepo loaders, TripPlanner tp) {
    this.orders = orders;
    this.vehicles = vehicles;
    this.loaders = loaders;
    this.tp = tp;
  }
  public Vehicle updateVehicleStatus(String vid, String status, String notes) {
    Vehicle v = vehicles.findById(vid).orElseThrow(() -> bad("Vehicle not found: " + vid));
    v.status = status;
    v.maintenanceNotes = notes;
    if ("in_workshop".equalsIgnoreCase(status)) {
      v.healthScore = Math.min(v.healthScore, 68);
    } else {
      v.healthScore = Math.max(v.healthScore, 95);
    }
    return vehicles.save(v);
  }
  public Vehicle updateVehicleDriver(String vid, String driver) {
    Vehicle v = vehicles.findById(vid).orElseThrow(() -> bad("Vehicle not found: " + vid));
    v.driver = driver;
    return vehicles.save(v);
  }
  public Vehicle refuelVehicle(String vid, double amountLiters) {
    Vehicle v = vehicles.findById(vid).orElseThrow(() -> bad("Vehicle not found: " + vid));
    if (amountLiters <= 0) {
      v.fuelLeft = v.fuelQuota;
    } else {
      v.fuelLeft = Math.min(v.fuelQuota, v.fuelLeft + amountLiters);
    }
    return vehicles.save(v);
  }
  public Map<String, Object> fleetAnalytics(String depot) {
    List<Vehicle> allVehicles = (depot == null || "all".equalsIgnoreCase(depot)) ? vehicles.findAll() : vehicles.findByDepot(depot);
    List<Order> allOrders = (depot == null || "all".equalsIgnoreCase(depot)) ? orders.findAll() : orders.findByDepot(depot);
    long availableCount = allVehicles.stream().filter(v -> "available".equalsIgnoreCase(v.status)).count();
    long workshopCount = allVehicles.stream().filter(v -> "in_workshop".equalsIgnoreCase(v.status)).count();
    long departedCount = allVehicles.stream().filter(v -> v.departed).count();
    long truckCount = allVehicles.stream().filter(v -> "truck".equalsIgnoreCase(v.type)).count();
    long vanCount = allVehicles.stream().filter(v -> "van".equalsIgnoreCase(v.type)).count();
    long reeferCount = allVehicles.stream().filter(v -> "reefer".equalsIgnoreCase(v.temp)).count();
    long ambientCount = allVehicles.stream().filter(v -> "ambient".equalsIgnoreCase(v.temp)).count();
    double totalWeightCap = allVehicles.stream().mapToDouble(v -> v.weightCap).sum();
    double totalVolCap = allVehicles.stream().mapToDouble(v -> v.volumeCap).sum();
    double avgHealth = allVehicles.stream().mapToInt(v -> v.healthScore).average().orElse(95.0);
    List<Map<String, Object>> roster = new ArrayList<>();
    for (Vehicle v : allVehicles) {
      List<Order> vOrders = allOrders.stream().filter(o -> v.id.equals(o.vehicleId)).collect(Collectors.toList());
      List<Map<String, Object>> trips = tp.tripsOf(v, allOrders);
      double totalDist = trips.stream().mapToDouble(t -> ((Number) t.getOrDefault("distanceKm", 0.0)).doubleValue()).sum();
      double totalFuel = trips.stream().mapToDouble(t -> ((Number) t.getOrDefault("fuelLiters", 0.0)).doubleValue()).sum();
      double totalWeight = vOrders.stream().mapToDouble(o -> o.weightKg).sum();
      double totalVol = vOrders.stream().mapToDouble(o -> o.volumeM3).sum();
      long tripCount = trips.stream().filter(t -> !((List<?>) t.get("orders")).isEmpty()).count();
      Map<String, Object> vm = new LinkedHashMap<>();
      vm.put("vehicle", v);
      vm.put("trips", trips);
      vm.put("activeTripCount", tripCount);
      vm.put("totalAllocatedWeightKg", Math.round(totalWeight));
      vm.put("totalAllocatedVolumeM3", Math.round(totalVol * 10.0) / 10.0);
      vm.put("weightUtilizationPct", v.weightCap > 0 ? (int) Math.round((totalWeight / (v.weightCap * Math.max(1, tripCount))) * 100) : 0);
      vm.put("volumeUtilizationPct", v.volumeCap > 0 ? (int) Math.round((totalVol / (v.volumeCap * Math.max(1, tripCount))) * 100) : 0);
      vm.put("totalDistanceKm", Math.round(totalDist * 10.0) / 10.0);
      vm.put("totalFuelConsumedL", Math.round(totalFuel * 10.0) / 10.0);
      vm.put("fuelRemainingL", Math.max(0.0, Math.round((v.fuelLeft - totalFuel) * 10.0) / 10.0));
      vm.put("fuelQuotaUsedPct", v.fuelQuota > 0 ? (int) Math.round((totalFuel / v.fuelQuota) * 100) : 0);
      vm.put("loader", v.loaderId != null ? loaders.findById(v.loaderId).orElse(null) : null);
      roster.add(vm);
    }
    Map<String, Object> summary = new LinkedHashMap<>();
    summary.put("totalVehicles", allVehicles.size());
    summary.put("availableVehicles", availableCount);
    summary.put("workshopVehicles", workshopCount);
    summary.put("departedVehicles", departedCount);
    summary.put("trucks", truckCount);
    summary.put("vans", vanCount);
    summary.put("reefers", reeferCount);
    summary.put("ambient", ambientCount);
    summary.put("totalWeightCapKg", Math.round(totalWeightCap));
    summary.put("totalVolumeCapM3", Math.round(totalVolCap * 10.0) / 10.0);
    summary.put("avgHealthScore", Math.round(avgHealth));
    return Map.of(
      "summary", summary,
      "roster", roster,
      "loaders", loaders.findAll()
    );
  }
}
