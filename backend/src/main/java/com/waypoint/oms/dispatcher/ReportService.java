package com.waypoint.oms.dispatcher;
import com.waypoint.oms.common.*;
import com.waypoint.oms.common.Models.*;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.*;
@Service
public class ReportService {
  static final double LKR_PER_LITRE = 370.0;
  static final double CO2_KG_PER_LITRE = 2.68;
  private final OrderRepo orders;
  private final VehicleRepo vehicles;
  private final TripPlanner tp;
  public ReportService(OrderRepo orders, VehicleRepo vehicles, TripPlanner tp) {
    this.orders = orders;
    this.vehicles = vehicles;
    this.tp = tp;
  }
  private static long count(List<Order> l, java.util.function.Predicate<Order> p) { return l.stream().filter(p).count(); }
  private static double round1(double d) { return Math.round(d * 10.0) / 10.0; }
  @SuppressWarnings("unchecked")
  public Map<String, Object> reports(String depot) {
    List<Order> all = orders.findByDepot(depot);
    List<Vehicle> vs = vehicles.findByDepot(depot);
    long total = all.size();
    long planned = count(all, o -> "ALLOCATED".equals(o.status));
    long delivered = count(all, o -> "DELIVERED".equals(o.delivery));
    Map<String, Object> summary = new LinkedHashMap<>();
    summary.put("total", total);
    summary.put("planned", planned);
    summary.put("deferred", count(all, o -> "DEFERRED".equals(o.status)));
    summary.put("unallocated", count(all, o -> "CONFIRMED".equals(o.status)));
    summary.put("delivered", delivered);
    summary.put("failed", count(all, o -> "FAILED".equals(o.delivery) || "SKIPPED".equals(o.delivery)));
    summary.put("receiptsConfirmed", count(all, o -> "CONFIRMED".equals(o.receipt)));
    summary.put("receiptsDisputed", count(all, o -> "DISPUTED".equals(o.receipt)));
    summary.put("plannedPct", total > 0 ? Math.round(100.0 * planned / total) : 0);
    summary.put("deliveredPct", total > 0 ? Math.round(100.0 * delivered / total) : 0);
    List<Map<String, Object>> brands = new ArrayList<>();
    for (String b : List.of("Fresh", "Style", "Tech")) {
      List<Order> bo = all.stream().filter(o -> b.equalsIgnoreCase(o.brand)).collect(Collectors.toList());
      Map<String, Object> m = new LinkedHashMap<>();
      m.put("brand", b);
      m.put("orders", bo.size());
      m.put("allocated", count(bo, o -> "ALLOCATED".equals(o.status)));
      m.put("deferred", count(bo, o -> "DEFERRED".equals(o.status)));
      m.put("delivered", count(bo, o -> "DELIVERED".equals(o.delivery)));
      m.put("weightKg", round1(bo.stream().mapToDouble(o -> o.weightKg).sum()));
      m.put("volumeM3", round1(bo.stream().mapToDouble(o -> o.volumeM3).sum()));
      brands.add(m);
    }
    double litres = 0, km = 0, wFill = 0, vFill = 0;
    int trips = 0, lateStops = 0;
    Set<String> used = new HashSet<>();
    for (Vehicle v : vs) {
      for (Map<String, Object> t : tp.tripsOf(v, all)) {
        List<Order> os = (List<Order>) t.get("orders");
        if (os.isEmpty()) continue;
        trips++;
        used.add(v.id);
        wFill += ((Number) t.get("weightKg")).doubleValue() / v.weightCap;
        vFill += ((Number) t.get("volumeM3")).doubleValue() / v.volumeCap;
        litres += ((Number) t.get("fuelLiters")).doubleValue();
        km += ((Number) t.get("distanceKm")).doubleValue();
        lateStops += ((Number) t.get("lateStops")).intValue();
      }
    }
    Map<String, Object> fleet = new LinkedHashMap<>();
    fleet.put("vehiclesUsed", used.size());
    fleet.put("vehiclesAvailable", vs.stream().filter(v -> "available".equalsIgnoreCase(v.status)).count());
    fleet.put("trips", trips);
    fleet.put("avgWeightFillPct", trips > 0 ? Math.round(100 * wFill / trips) : 0);
    fleet.put("avgVolumeFillPct", trips > 0 ? Math.round(100 * vFill / trips) : 0);
    fleet.put("lateStops", lateStops);
    Map<String, Object> fuel = new LinkedHashMap<>();
    fuel.put("plannedLitres", round1(litres));
    fuel.put("plannedKm", round1(km));
    fuel.put("costLkr", Math.round(litres * LKR_PER_LITRE));
    fuel.put("co2Kg", round1(litres * CO2_KG_PER_LITRE));
    Map<String, Long> reasons = all.stream().filter(o -> "DEFERRED".equals(o.status))
      .collect(Collectors.groupingBy(o -> o.deferReason != null ? o.deferReason : "Unspecified", TreeMap::new, Collectors.counting()));
    List<Map<String, Object>> repeat = all.stream().filter(o -> o.skipCount + o.deferredYesterday >= 2 && !"ALLOCATED".equals(o.status))
      .map(o -> Map.<String, Object>of("orderRef", o.orderRef, "outletId", o.outletId, "brand", o.brand, "skips", o.skipCount + o.deferredYesterday))
      .collect(Collectors.toList());
    Map<String, Object> res = new LinkedHashMap<>();
    res.put("summary", summary);
    res.put("brands", brands);
    res.put("fleet", fleet);
    res.put("fuel", fuel);
    res.put("deferralReasons", reasons);
    res.put("repeatSkips", repeat);
    return res;
  }
}
