package com.waypoint.oms.dispatcher;
import com.waypoint.oms.common.*;
import com.waypoint.oms.common.Models.*;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.*;
@Service
public class AutoAllocationService {
  private final OrderRepo orders;
  private final VehicleRepo vehicles;
  private final DistrictRepo dist;
  private final AllowanceRepo allow;
  public AutoAllocationService(OrderRepo orders, VehicleRepo vehicles, DistrictRepo dist, AllowanceRepo allow) {
    this.orders = orders;
    this.vehicles = vehicles;
    this.dist = dist;
    this.allow = allow;
  }
  static class Slot {
    final Vehicle v;
    final int trip;
    final List<Order> os = new ArrayList<>();
    Slot(Vehicle v, int trip) { this.v = v; this.trip = trip; }
  }
  private Map<String, District> dm;
  private Map<String, Integer> am;
  private int minutes(List<Order> l) {
    if (l.isEmpty()) return 0;
    District d = dm.get(l.get(0).district);
    int t = (d != null ? d.dtdMin : 25) + (d != null ? d.interMin : 8) * (l.size() - 1);
    for (Order o : l) t += am.getOrDefault(o.brand + "_" + o.dockType, 15);
    return t;
  }
  private double km(List<Order> l) {
    if (l.isEmpty()) return 0;
    District d = dm.get(l.get(0).district);
    return 2 * (d != null && d.dtdKm > 0 ? d.dtdKm : 24.0) + (d != null && d.interKm > 0 ? d.interKm : 6.0) * (l.size() - 1);
  }
  private String check(Slot s, Slot other, Order o) {
    Vehicle v = s.v;
    if (!v.depot.equalsIgnoreCase(o.depot)) return "depot";
    if ("chilled".equalsIgnoreCase(o.temp) && !"reefer".equalsIgnoreCase(v.temp)) return "reefer";
    if ("van_only".equalsIgnoreCase(o.parking) && !"van".equalsIgnoreCase(v.type)) return "van";
    if (!s.os.isEmpty() && (!s.os.get(0).brand.equalsIgnoreCase(o.brand) || !s.os.get(0).district.equalsIgnoreCase(o.district))) return "mix";
    List<Order> t = new ArrayList<>(s.os);
    t.add(o);
    if (t.stream().mapToDouble(x -> x.weightKg).sum() > v.weightCap) return "weight";
    if (t.stream().mapToDouble(x -> x.volumeM3).sum() > v.volumeCap) return "volume";
    boolean fresh = "Fresh".equalsIgnoreCase(o.brand);
    int used = 0;
    for (List<Order> l : List.of(t, other.os)) {
      if (!l.isEmpty() && "Fresh".equalsIgnoreCase(l.get(0).brand) == fresh) used += minutes(l);
    }
    if (used > (fresh ? 270 : 480)) return "time";
    double kmL = v.kmPerL > 0 ? v.kmPerL : 6.0;
    if (km(t) / kmL + km(other.os) / kmL > v.fuelLeft) return "fuel";
    return null;
  }
  private static String explain(Map<String, Integer> why, int slots) {
    if (why.getOrDefault("reefer", 0) == slots) return "No refrigerated vehicle available";
    if (why.getOrDefault("van", 0) == slots) return "No van available for van-only outlet";
    String top = why.entrySet().stream().filter(e -> !e.getKey().equals("depot"))
      .max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse("capacity");
    switch (top) {
      case "weight": case "volume": return "Fleet capacity exhausted (weight/volume)";
      case "time": return "Delivery time budget exhausted";
      case "fuel": return "Weekly fuel quota exhausted";
      case "reefer": return "Refrigerated capacity exhausted";
      default: return "Fleet capacity exhausted";
    }
  }
  public Map<String, Object> run(String depot, boolean deferUnplaced) {
    dm = dist.findAll().stream().collect(Collectors.toMap(d -> d.district, d -> d, (a, b) -> a));
    am = allow.findAll().stream().collect(Collectors.toMap(a -> a.id, a -> a.minutes, (a, b) -> a));
    List<Order> all = orders.findByDepot(depot);
    Map<String, Slot[]> slots = new LinkedHashMap<>();
    for (Vehicle v : vehicles.findByDepot(depot)) {
      if ("available".equalsIgnoreCase(v.status) && !v.departed) slots.put(v.id, new Slot[]{new Slot(v, 1), new Slot(v, 2)});
    }
    for (Order o : all) {
      if ("ALLOCATED".equals(o.status) && o.vehicleId != null && slots.containsKey(o.vehicleId)) {
        slots.get(o.vehicleId)[(o.trip == null ? 1 : o.trip) - 1].os.add(o);
      }
    }
    List<Order> queue = all.stream().filter(o -> "CONFIRMED".equals(o.status)).collect(Collectors.toList());
    queue.sort(Comparator.comparingInt((Order o) -> -o.deferredYesterday)
      .thenComparingInt((Order o) -> -o.daysSinceLastServed)
      .thenComparingInt((Order o) -> "Fresh".equalsIgnoreCase(o.brand) ? 0 : 1)
      .thenComparing((Order o) -> o.district)
      .thenComparingDouble((Order o) -> -o.volumeM3));
    List<Order> changed = new ArrayList<>();
    List<String> assigned = new ArrayList<>();
    List<Map<String, Object>> deferred = new ArrayList<>();
    int slotCount = slots.size() * 2;
    for (Order o : queue) {
      Slot best = null;
      double bestScore = Double.MAX_VALUE;
      Map<String, Integer> why = new HashMap<>();
      for (Slot[] pair : slots.values()) {
        for (int i = 0; i < 2; i++) {
          Slot s = pair[i];
          String r = check(s, pair[1 - i], o);
          if (r != null) { why.merge(r, 1, Integer::sum); continue; }
          double spare = (s.v.volumeCap - s.os.stream().mapToDouble(x -> x.volumeM3).sum() - o.volumeM3) / s.v.volumeCap;
          double score = (s.os.isEmpty() ? 1000 : 0)
            + ("chilled".equalsIgnoreCase(o.temp) || !"reefer".equalsIgnoreCase(s.v.temp) ? 0 : 100)
            + spare * 10 + s.trip;
          if (score < bestScore) { bestScore = score; best = s; }
        }
      }
      if (best != null) {
        o.vehicleId = best.v.id;
        o.trip = best.trip;
        o.seq = null;
        o.status = "ALLOCATED";
        o.deferReason = null;
        o.skipCount = 0;
        best.os.add(o);
        assigned.add(o.orderRef);
        changed.add(o);
      } else if (deferUnplaced) {
        String reason = explain(why, slotCount);
        o.status = "DEFERRED";
        o.deferReason = reason;
        o.rescheduleDate = "Next run";
        o.skipCount = o.skipCount + 1;
        changed.add(o);
        deferred.add(Map.of("orderRef", o.orderRef, "outletId", o.outletId, "brand", o.brand, "reason", reason));
      }
    }
    orders.saveAll(changed);
    Map<String, Object> res = new LinkedHashMap<>();
    res.put("success", true);
    res.put("allocatedCount", assigned.size());
    res.put("deferredCount", deferred.size());
    res.put("assignedOrders", assigned);
    res.put("deferredOrders", deferred);
    res.put("message", "Auto-allocated " + assigned.size() + " order(s)" + (deferred.isEmpty() ? "." : "; " + deferred.size() + " deferred with reasons (see Deferrals)."));
    return res;
  }
}
