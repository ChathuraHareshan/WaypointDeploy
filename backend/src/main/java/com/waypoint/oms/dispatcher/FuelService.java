package com.waypoint.oms.dispatcher;
import com.waypoint.oms.common.*;
import com.waypoint.oms.common.Models.*;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.*;
import static com.waypoint.oms.common.TripPlanner.bad;
@Service
public class FuelService {
  private final OrderRepo orders;
  private final VehicleRepo vehicles;
  private final TripPlanner tp;
  public FuelService(OrderRepo orders, VehicleRepo vehicles, TripPlanner tp) {
    this.orders = orders;
    this.vehicles = vehicles;
    this.tp = tp;
  }
  public Map<String, Object> fuelAnalytics(String depot) {
    List<Vehicle> vs = (depot == null || "all".equalsIgnoreCase(depot)) ? vehicles.findAll() : vehicles.findByDepot(depot);
    List<Order> os = (depot == null || "all".equalsIgnoreCase(depot)) ? orders.findAll() : orders.findByDepot(depot);
    double totalWeeklyQuota = vs.stream().mapToDouble(v -> v.fuelQuota).sum();
    double totalPlannedFuel = 0.0;
    double totalPlannedDistKm = 0.0;
    double totalPlannedCostLkr = 0.0;
    double totalCo2Kg = 0.0;
    Map<String, Double> fuelByBrand = new LinkedHashMap<>();
    fuelByBrand.put("Fresh", 0.0);
    fuelByBrand.put("Style", 0.0);
    fuelByBrand.put("Tech", 0.0);
    Map<String, Double> fuelByDistrict = new LinkedHashMap<>();
    List<Map<String, Object>> roster = new ArrayList<>();
    int highConsumptionAlerts = 0;
    for (Vehicle v : vs) {
      List<Map<String, Object>> trips = tp.tripsOf(v, os);
      double vDist = 0.0;
      double vFuel = 0.0;
      for (Map<String, Object> t : trips) {
        double d = ((Number) t.getOrDefault("distanceKm", 0.0)).doubleValue();
        double f = ((Number) t.getOrDefault("fuelLiters", 0.0)).doubleValue();
        String brand = (String) t.get("brand");
        String district = (String) t.get("district");
        vDist += d;
        vFuel += f;
        if (brand != null && fuelByBrand.containsKey(brand)) {
          fuelByBrand.put(brand, fuelByBrand.get(brand) + f);
        }
        if (district != null) {
          fuelByDistrict.put(district, fuelByDistrict.getOrDefault(district, 0.0) + f);
        }
      }
      totalPlannedFuel += vFuel;
      totalPlannedDistKm += vDist;
      totalPlannedCostLkr += (vFuel * 370.0);
      totalCo2Kg += (vFuel * 2.68);
      double quotaPct = v.fuelQuota > 0 ? ((vFuel / v.fuelQuota) * 100.0) : 0.0;
      String status = "normal";
      if (quotaPct > 100.0) {
        status = "exceeded";
        highConsumptionAlerts++;
      } else if (quotaPct > 85.0) {
        status = "warning";
        highConsumptionAlerts++;
      } else if (quotaPct > 65.0) {
        status = "advisory";
      }
      Map<String, Object> vm = new LinkedHashMap<>();
      vm.put("vehicleId", v.id);
      vm.put("type", v.type);
      vm.put("temp", v.temp);
      vm.put("driver", v.driver);
      vm.put("depot", v.depot);
      vm.put("kmPerL", v.kmPerL);
      vm.put("fuelQuotaL", v.fuelQuota);
      vm.put("plannedDistanceKm", Math.round(vDist * 10.0) / 10.0);
      vm.put("fuelConsumedL", Math.round(vFuel * 10.0) / 10.0);
      vm.put("fuelLeftL", Math.max(0.0, Math.round((v.fuelLeft - vFuel) * 10.0) / 10.0));
      vm.put("quotaUsedPct", Math.min(100, (int) Math.round(quotaPct)));
      vm.put("fuelCostLkr", (long) Math.round(vFuel * 370.0));
      vm.put("co2Kg", Math.round(vFuel * 2.68 * 10.0) / 10.0);
      vm.put("status", status);
      roster.add(vm);
    }
    double avgEfficiency = vs.stream().mapToDouble(v -> v.kmPerL).average().orElse(6.5);
    double remainingQuota = Math.max(0.0, totalWeeklyQuota - totalPlannedFuel);
    List<Map<String, String>> recommendations = List.of(
      Map.of("id", "ECO-1", "type", "optimization", "title", "Van Substitution Opportunity", "description", "Replace heavy diesel truck VEH001 (4.7 km/L) with Reefer Van VEH035 (10.3 km/L) for Colombo urban Fresh stops to save ~4.8L diesel (54% fuel reduction)."),
      Map.of("id", "ECO-2", "type", "advisory", "title", "Kandy Hill Country Speed Adjustment", "description", "Rain slowdowns along Kandy-Nuwara Eliya corridor increase idling. Route consolidation reduces hill climb trips by 1."),
      Map.of("id", "ECO-3", "type", "quota", "title", "Weekly Quota Buffer Healthy", "description", String.format("Current fleet consumption is tracking at %d%% of weekly allocation with %.0f Liters buffer remaining.", (int) Math.round((totalPlannedFuel / totalWeeklyQuota) * 100), remainingQuota))
    );
    return Map.of(
      "summary", Map.of(
        "totalWeeklyQuotaL", Math.round(totalWeeklyQuota),
        "totalPlannedFuelL", Math.round(totalPlannedFuel * 10.0) / 10.0,
        "remainingQuotaL", Math.round(remainingQuota * 10.0) / 10.0,
        "totalPlannedDistanceKm", Math.round(totalPlannedDistKm * 10.0) / 10.0,
        "fleetAverageKmL", Math.round(avgEfficiency * 10.0) / 10.0,
        "totalEstimatedCostLkr", Math.round(totalPlannedCostLkr),
        "totalCo2EmissionsKg", Math.round(totalCo2Kg * 10.0) / 10.0,
        "overallQuotaUsedPct", totalWeeklyQuota > 0 ? (int) Math.round((totalPlannedFuel / totalWeeklyQuota) * 100) : 0,
        "highConsumptionAlerts", highConsumptionAlerts
      ),
      "fuelByBrand", fuelByBrand,
      "fuelByDistrict", fuelByDistrict,
      "roster", roster,
      "recommendations", recommendations
    );
  }
}
