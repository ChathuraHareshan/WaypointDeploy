package com.waypoint.oms.dispatcher;
import com.waypoint.oms.common.*;
import com.waypoint.oms.common.Models.*;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.*;
import static com.waypoint.oms.common.TripPlanner.bad;
@Service
public class CapacityService {
  private final OrderRepo orders;
  private final VehicleRepo vehicles;
  private final TripPlanner tp;
  public CapacityService(OrderRepo orders, VehicleRepo vehicles, TripPlanner tp) {
    this.orders = orders;
    this.vehicles = vehicles;
    this.tp = tp;
  }
  public Map<String, Object> capacityAnalytics(String depot) {
    List<Vehicle> vs = (depot == null || "all".equalsIgnoreCase(depot)) ? vehicles.findAll() : vehicles.findByDepot(depot);
    List<Order> os = (depot == null || "all".equalsIgnoreCase(depot)) ? orders.findAll() : orders.findByDepot(depot);
    List<Vehicle> availableVs = vs.stream().filter(v -> "available".equalsIgnoreCase(v.status)).collect(Collectors.toList());
    double singleTripWeightCap = availableVs.stream().mapToDouble(v -> v.weightCap).sum();
    double singleTripVolCap = availableVs.stream().mapToDouble(v -> v.volumeCap).sum();
    double dailyMaxWeightCap = singleTripWeightCap * 2.0;
    double dailyMaxVolCap = singleTripVolCap * 2.0;
    double totalDemandWeight = os.stream().mapToDouble(o -> o.weightKg).sum();
    double totalDemandVol = os.stream().mapToDouble(o -> o.volumeM3).sum();
    List<Order> allocatedOrders = os.stream().filter(o -> "ALLOCATED".equalsIgnoreCase(o.status)).collect(Collectors.toList());
    double allocatedWeight = allocatedOrders.stream().mapToDouble(o -> o.weightKg).sum();
    double allocatedVol = allocatedOrders.stream().mapToDouble(o -> o.volumeM3).sum();
    List<Vehicle> reeferVs = availableVs.stream().filter(v -> "reefer".equalsIgnoreCase(v.temp)).collect(Collectors.toList());
    double reeferSingleWeightCap = reeferVs.stream().mapToDouble(v -> v.weightCap).sum();
    double reeferSingleVolCap = reeferVs.stream().mapToDouble(v -> v.volumeCap).sum();
    double reeferDailyWeightCap = reeferSingleWeightCap * 2.0;
    double reeferDailyVolCap = reeferSingleVolCap * 2.0;
    List<Order> chilledOrders = os.stream().filter(o -> "chilled".equalsIgnoreCase(o.temp)).collect(Collectors.toList());
    double chilledDemandWeight = chilledOrders.stream().mapToDouble(o -> o.weightKg).sum();
    double chilledDemandVol = chilledOrders.stream().mapToDouble(o -> o.volumeM3).sum();
    List<Order> allocatedChilled = allocatedOrders.stream().filter(o -> "chilled".equalsIgnoreCase(o.temp)).collect(Collectors.toList());
    double allocatedChilledWeight = allocatedChilled.stream().mapToDouble(o -> o.weightKg).sum();
    double allocatedChilledVol = allocatedChilled.stream().mapToDouble(o -> o.volumeM3).sum();
    List<Vehicle> vanVs = availableVs.stream().filter(v -> "van".equalsIgnoreCase(v.type)).collect(Collectors.toList());
    double vanDailyWeightCap = vanVs.stream().mapToDouble(v -> v.weightCap * 2.0).sum();
    double vanDailyVolCap = vanVs.stream().mapToDouble(v -> v.volumeCap * 2.0).sum();
    List<Order> vanOnlyOrders = os.stream().filter(o -> "van_only".equalsIgnoreCase(o.parking)).collect(Collectors.toList());
    double vanOnlyDemandWeight = vanOnlyOrders.stream().mapToDouble(o -> o.weightKg).sum();
    double vanOnlyDemandVol = vanOnlyOrders.stream().mapToDouble(o -> o.volumeM3).sum();
    int totalFreshMinutesUsed = 0;
    int totalDaytimeMinutesUsed = 0;
    for (Vehicle v : availableVs) {
      List<Map<String, Object>> trips = tp.tripsOf(v, os);
      for (Map<String, Object> t : trips) {
        String brand = (String) t.get("brand");
        int m = ((Number) t.getOrDefault("minutes", 0)).intValue();
        if ("Fresh".equalsIgnoreCase(brand)) totalFreshMinutesUsed += m;
        else if (brand != null) totalDaytimeMinutesUsed += m;
      }
    }
    int totalFreshMinutesBudget = reeferVs.size() * 270;
    int totalDaytimeMinutesBudget = availableVs.size() * 480;
    Map<String, List<Order>> districtMap = os.stream().collect(Collectors.groupingBy(o -> o.district, LinkedHashMap::new, Collectors.toList()));
    List<Map<String, Object>> districtBreakdown = new ArrayList<>();
    for (Map.Entry<String, List<Order>> entry : districtMap.entrySet()) {
      String distName = entry.getKey();
      List<Order> dOrders = entry.getValue();
      double dw = dOrders.stream().mapToDouble(o -> o.weightKg).sum();
      double dv = dOrders.stream().mapToDouble(o -> o.volumeM3).sum();
      long dAlloc = dOrders.stream().filter(o -> "ALLOCATED".equalsIgnoreCase(o.status)).count();
      long dChilled = dOrders.stream().filter(o -> "chilled".equalsIgnoreCase(o.temp)).count();
      long dVanOnly = dOrders.stream().filter(o -> "van_only".equalsIgnoreCase(o.parking)).count();
      Map<String, Object> dm = new LinkedHashMap<>();
      dm.put("district", distName);
      dm.put("totalOrders", dOrders.size());
      dm.put("allocatedOrders", dAlloc);
      dm.put("unallocatedOrders", dOrders.size() - dAlloc);
      dm.put("weightKg", Math.round(dw));
      dm.put("volumeM3", Math.round(dv * 10.0) / 10.0);
      dm.put("chilledOrders", dChilled);
      dm.put("vanOnlyOrders", dVanOnly);
      dm.put("allocationPct", dOrders.size() > 0 ? (int) Math.round((dAlloc * 100.0) / dOrders.size()) : 0);
      districtBreakdown.add(dm);
    }
    List<Map<String, Object>> forecastWeeks = List.of(
      Map.of("week", "Wk 40", "label", "Sep 28", "totalDemandM3", 820.0, "chilledM3", 280.0, "maxCapM3", dailyMaxVolCap, "utilizationPct", 78, "event", "Normal Trading"),
      Map.of("week", "Wk 41", "label", "Oct 05", "totalDemandM3", 860.0, "chilledM3", 310.0, "maxCapM3", dailyMaxVolCap, "utilizationPct", 82, "event", "Payday Surge"),
      Map.of("week", "Wk 42", "label", "Oct 12", "totalDemandM3", 790.0, "chilledM3", 260.0, "maxCapM3", dailyMaxVolCap, "utilizationPct", 75, "event", "Normal Trading"),
      Map.of("week", "Wk 43", "label", "Oct 19", "totalDemandM3", 840.0, "chilledM3", 290.0, "maxCapM3", dailyMaxVolCap, "utilizationPct", 80, "event", "Monsoon Advisory"),
      Map.of("week", "Wk 44", "label", "Oct 26", "totalDemandM3", 1180.0, "chilledM3", 460.0, "maxCapM3", dailyMaxVolCap, "utilizationPct", 98, "event", "🎉 Vesak Festival Peak (+40%)"),
      Map.of("week", "Wk 45", "label", "Nov 02", "totalDemandM3", 910.0, "chilledM3", 330.0, "maxCapM3", dailyMaxVolCap, "utilizationPct", 86, "event", "Post-Festival Normal"),
      Map.of("week", "Wk 46", "label", "Nov 09", "totalDemandM3", 830.0, "chilledM3", 275.0, "maxCapM3", dailyMaxVolCap, "utilizationPct", 79, "event", "Normal Trading"),
      Map.of("week", "Wk 47", "label", "Nov 16", "totalDemandM3", 870.0, "chilledM3", 305.0, "maxCapM3", dailyMaxVolCap, "utilizationPct", 83, "event", "Payday Ramp")
    );
    Map<String, Object> overview = new LinkedHashMap<>();
    overview.put("singleTripWeightCapKg", Math.round(singleTripWeightCap));
    overview.put("singleTripVolumeCapM3", Math.round(singleTripVolCap * 10.0) / 10.0);
    overview.put("dailyMaxWeightCapKg", Math.round(dailyMaxWeightCap));
    overview.put("dailyMaxVolumeCapM3", Math.round(dailyMaxVolCap * 10.0) / 10.0);
    overview.put("totalDemandWeightKg", Math.round(totalDemandWeight));
    overview.put("totalDemandVolumeM3", Math.round(totalDemandVol * 10.0) / 10.0);
    overview.put("allocatedWeightKg", Math.round(allocatedWeight));
    overview.put("allocatedVolumeM3", Math.round(allocatedVol * 10.0) / 10.0);
    overview.put("weightCapacityUtilizationPct", dailyMaxWeightCap > 0 ? (int) Math.round((allocatedWeight / dailyMaxWeightCap) * 100) : 0);
    overview.put("volumeCapacityUtilizationPct", dailyMaxVolCap > 0 ? (int) Math.round((allocatedVol / dailyMaxVolCap) * 100) : 0);
    overview.put("totalOrders", os.size());
    overview.put("allocatedOrders", allocatedOrders.size());
    overview.put("unallocatedOrders", os.size() - allocatedOrders.size());
    return Map.of(
      "overview", overview,
      "reeferCapacity", Map.of(
        "reeferVehicles", reeferVs.size(),
        "dailyMaxWeightCapKg", Math.round(reeferDailyWeightCap),
        "dailyMaxVolumeCapM3", Math.round(reeferDailyVolCap * 10.0) / 10.0,
        "chilledDemandWeightKg", Math.round(chilledDemandWeight),
        "chilledDemandVolumeM3", Math.round(chilledDemandVol * 10.0) / 10.0,
        "allocatedChilledWeightKg", Math.round(allocatedChilledWeight),
        "allocatedChilledVolumeM3", Math.round(allocatedChilledVol * 10.0) / 10.0,
        "utilizationPct", reeferDailyVolCap > 0 ? (int) Math.round((allocatedChilledVol / reeferDailyVolCap) * 100) : 0
      ),
      "vanCapacity", Map.of(
        "vanVehicles", vanVs.size(),
        "dailyMaxWeightCapKg", Math.round(vanDailyWeightCap),
        "dailyMaxVolumeCapM3", Math.round(vanDailyVolCap * 10.0) / 10.0,
        "vanOnlyDemandWeightKg", Math.round(vanOnlyDemandWeight),
        "vanOnlyDemandVolumeM3", Math.round(vanOnlyDemandVol * 10.0) / 10.0,
        "vanOnlyOrders", vanOnlyOrders.size()
      ),
      "timeBudgets", Map.of(
        "freshMinutesUsed", totalFreshMinutesUsed,
        "freshMinutesBudget", totalFreshMinutesBudget,
        "freshBudgetUtilizationPct", totalFreshMinutesBudget > 0 ? (int) Math.round((totalFreshMinutesUsed * 100.0) / totalFreshMinutesBudget) : 0,
        "daytimeMinutesUsed", totalDaytimeMinutesUsed,
        "daytimeMinutesBudget", totalDaytimeMinutesBudget,
        "daytimeBudgetUtilizationPct", totalDaytimeMinutesBudget > 0 ? (int) Math.round((totalDaytimeMinutesUsed * 100.0) / totalDaytimeMinutesBudget) : 0
      ),
      "districts", districtBreakdown,
      "forecast", forecastWeeks
    );
  }
}
