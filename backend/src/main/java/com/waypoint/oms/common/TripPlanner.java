package com.waypoint.oms.common;
import com.waypoint.oms.common.Models.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import java.util.stream.*;
@Service
public class TripPlanner {
  private final OrderRepo orders;
  private final VehicleRepo vehicles;
  private final LoaderRepo loaders;
  private final OutletRepo outlets;
  private final DistrictRepo dist;
  private final AllowanceRepo allow;
  public TripPlanner(OrderRepo orders, VehicleRepo vehicles, LoaderRepo loaders, OutletRepo outlets, DistrictRepo dist, AllowanceRepo allow) {
    this.orders = orders;
    this.vehicles = vehicles;
    this.loaders = loaders;
    this.outlets = outlets;
    this.dist = dist;
    this.allow = allow;
  }
  public static ResponseStatusException invalid(String m) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, m); }
  public static ResponseStatusException bad(String m) {
    return new ResponseStatusException(HttpStatus.CONFLICT, m);
  }
  public int tripMinutes(List<Order> os) {
    if (os.isEmpty()) return 0;
    District d = dist.findById(os.get(0).district).orElse(null);
    int dtd = d != null ? d.dtdMin : 25;
    int inter = d != null ? d.interMin : 8;
    int t = dtd + inter * (os.size() - 1);
    for (Order o : os) {
      t += allow.findById(o.brand + "_" + o.dockType).map(a -> a.minutes).orElse(15);
    }
    return t;
  }
  public double tripDistanceKm(List<Order> os) {
    if (os.isEmpty()) return 0.0;
    District d = dist.findById(os.get(0).district).orElse(null);
    double dtd = d != null && d.dtdKm > 0 ? d.dtdKm : 24.0;
    double inter = d != null && d.interKm > 0 ? d.interKm : 6.0;
    return 2 * dtd + inter * Math.max(0, os.size() - 1); 
  }
  public static String hm(int m) {
    int hours = (m / 60) % 24;
    int mins = m % 60;
    return String.format("%02d:%02d", hours, mins);
  }
  public Order getOrder(String ref) {
    return orders.findById(ref).orElseThrow(() -> bad("Order not found: " + ref));
  }
  public void checkRunNotDeparted(Order o) {
    if (o.vehicleId != null) {
      Vehicle v = vehicles.findById(o.vehicleId).orElse(null);
      if (v != null && v.departed) throw bad("Run has already departed");
    }
  }
  public List<Map<String, Object>> tripsOf(Vehicle v, List<Order> all) {
    List<Map<String, Object>> trips = new ArrayList<>();
    int freshCumulative = 0;
    int otherCumulative = 0;
    for (int n = 1; n <= 2; n++) {
      int k = n;
      List<Order> os = all.stream()
        .filter(x -> v.id.equals(x.vehicleId) && x.trip != null && x.trip == k)
        .sorted(Comparator.comparingInt((Order x) -> x.seq != null ? x.seq : Integer.MAX_VALUE)
          .thenComparing((Order x) -> x.windowClose != null ? x.windowClose : "08:00"))
        .collect(Collectors.toList());
      int min = tripMinutes(os);
      if (!os.isEmpty()) {
        boolean fresh = "Fresh".equalsIgnoreCase(os.get(0).brand);
        District d = dist.findById(os.get(0).district).orElse(null);
        int dtd = d != null ? d.dtdMin : 25;
        int inter = d != null ? d.interMin : 8;
        int startTimeMinutes = (fresh ? 210 + freshCumulative : 540 + otherCumulative) + dtd;
        for (int i = 0; i < os.size(); i++) {
          Order o = os.get(i);
          if (i > 0) startTimeMinutes += inter;
          o.stop = i + 1;
          o.stops = os.size();
          o.eta = hm(startTimeMinutes);
          o.pod = o.signature != null && o.photo != null;
          o.late = o.windowClose != null && o.eta.compareTo(o.windowClose) > 0;
          Outlet out = outlets.findById(o.outletId).orElse(null);
          if (out != null) {
            o.lat = out.lat;
            o.lng = out.lng;
            o.outletName = out.name;
            o.address = out.address;
            o.phone = out.phone;
          }
          int handling = allow.findById(o.brand + "_" + o.dockType).map(a -> a.minutes).orElse(15);
          startTimeMinutes += handling;
        }
        if (fresh) freshCumulative += min;
        else otherCumulative += min;
      }
      double distKm = tripDistanceKm(os);
      double kmL = v.kmPerL > 0 ? v.kmPerL : 6.0;
      double fuelUsedL = distKm > 0 ? (distKm / kmL) : 0.0;
      double fuelCostLkr = fuelUsedL * 370.0;
      double co2Kg = fuelUsedL * 2.68;
      Map<String, Object> tripMap = new LinkedHashMap<>();
      tripMap.put("trip", n);
      tripMap.put("orders", os);
      tripMap.put("weightKg", os.stream().mapToDouble(x -> x.weightKg).sum());
      tripMap.put("volumeM3", os.stream().mapToDouble(x -> x.volumeM3).sum());
      tripMap.put("minutes", min);
      tripMap.put("distanceKm", Math.round(distKm * 10.0) / 10.0);
      tripMap.put("fuelLiters", Math.round(fuelUsedL * 10.0) / 10.0);
      tripMap.put("fuelCostLkr", (long) Math.round(fuelCostLkr));
      tripMap.put("co2Kg", Math.round(co2Kg * 10.0) / 10.0);
      tripMap.put("brand", !os.isEmpty() ? os.get(0).brand : null);
      tripMap.put("lateStops", os.stream().filter(x -> x.late).count());
      tripMap.put("district", !os.isEmpty() ? os.get(0).district : null);
      trips.add(tripMap);
    }
    return trips;
  }
  public Map<String, Object> runOf(Vehicle v) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("vehicle", v);
    m.put("loader", v.loaderId == null ? null : loaders.findById(v.loaderId).orElse(null));
    m.put("trips", tripsOf(v, orders.findByVehicleId(v.id)));
    return m;
  }
}
