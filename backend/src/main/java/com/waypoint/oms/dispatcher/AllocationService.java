package com.waypoint.oms.dispatcher;
import com.waypoint.oms.common.*;
import com.waypoint.oms.common.Models.*;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.*;
import static com.waypoint.oms.common.TripPlanner.bad;
@Service
public class AllocationService {
  private final OrderRepo orders;
  private final VehicleRepo vehicles;
  private final LoaderRepo loaders;
  private final TripPlanner tp;
  public AllocationService(OrderRepo orders, VehicleRepo vehicles, LoaderRepo loaders, TripPlanner tp) {
    this.orders = orders;
    this.vehicles = vehicles;
    this.loaders = loaders;
    this.tp = tp;
  }
  public Order assign(String ref, String vid, int trip) {
    Order o = orders.findById(ref).orElseThrow(() -> bad("Order " + ref + " not found"));
    Vehicle v = vehicles.findById(vid).orElseThrow(() -> bad("Vehicle " + vid + " not found"));
    tp.checkRunNotDeparted(o);
    if (!"available".equalsIgnoreCase(v.status)) throw bad("Vehicle " + vid + " is in workshop today");
    if (v.departed) throw bad("Vehicle " + vid + " has already departed");
    if (trip < 1 || trip > 2) throw bad("Trip must be 1 or 2");
    if (!v.depot.equalsIgnoreCase(o.depot)) throw bad("Vehicle " + vid + " belongs to " + v.depot + " depot, but order is for " + o.depot);
    if ("chilled".equalsIgnoreCase(o.temp) && !"reefer".equalsIgnoreCase(v.temp)) {
      throw bad("Reefer vehicle required for chilled goods — " + vid + " is ambient-only");
    }
    if ("van_only".equalsIgnoreCase(o.parking) && !"van".equalsIgnoreCase(v.type)) {
      throw bad("Outlet " + o.outletId + " has van-only access — " + vid + " is a truck");
    }
    Map<Integer, List<Order>> tripsMap = new TreeMap<>();
    orders.findByVehicleId(vid).stream()
      .filter(x -> !x.orderRef.equals(ref))
      .forEach(x -> tripsMap.computeIfAbsent(x.trip != null ? x.trip : 1, k -> new ArrayList<>()).add(x));
    tripsMap.computeIfAbsent(trip, k -> new ArrayList<>()).add(o);
    if (tripsMap.size() > 2) throw bad("Vehicle " + vid + " can only run up to 2 trips per day");
    List<Order> sameTrip = tripsMap.get(trip);
    if (sameTrip.stream().anyMatch(x -> !x.brand.equalsIgnoreCase(o.brand) || !x.district.equalsIgnoreCase(o.district))) {
      throw bad("A trip must serve one brand and one district (Current trip: " + o.brand + " / " + o.district + ")");
    }
    double totalWeight = sameTrip.stream().mapToDouble(x -> x.weightKg).sum();
    double totalVol = sameTrip.stream().mapToDouble(x -> x.volumeM3).sum();
    if (totalWeight > v.weightCap) {
      throw bad(String.format("Exceeds %s weight capacity by %.0f kg (Total: %.0f / Cap: %.0f kg)", vid, totalWeight - v.weightCap, totalWeight, v.weightCap));
    }
    if (totalVol > v.volumeCap) {
      throw bad(String.format("Exceeds %s volume capacity by %.2f m³ (Total: %.2f / Cap: %.2f m³)", vid, totalVol - v.volumeCap, totalVol, v.volumeCap));
    }
    boolean isFresh = "Fresh".equalsIgnoreCase(o.brand);
    int usedMinutes = 0;
    for (List<Order> l : tripsMap.values()) {
      if (!l.isEmpty() && "Fresh".equalsIgnoreCase(l.get(0).brand) == isFresh) {
        usedMinutes += tp.tripMinutes(l);
      }
    }
    int budget = isFresh ? 270 : 480;
    if (usedMinutes > budget) {
      throw bad(String.format("Daily time budget exceeded for %s: %d min used of %d min limit", isFresh ? "Fresh (before 8 AM)" : "Style/Tech", usedMinutes, budget));
    }
    double plannedFuel = 0;
    for (List<Order> l : tripsMap.values()) plannedFuel += tp.tripDistanceKm(l) / (v.kmPerL > 0 ? v.kmPerL : 6.0);
    if (plannedFuel > v.fuelLeft) {
      throw bad(String.format("Insufficient fuel on %s: planned trips need %.1f L but only %.1f L is left in the weekly quota", vid, plannedFuel, v.fuelLeft));
    }
    o.vehicleId = vid;
    o.trip = trip;
    o.seq = null;
    o.loaded = false;
    o.flag = null;
    o.skipCount = 0;
    o.status = "ALLOCATED";
    o.deferReason = null;
    return orders.save(o);
  }
  public Order unassign(String ref) {
    Order o = orders.findById(ref).orElseThrow(() -> bad("Order not found"));
    tp.checkRunNotDeparted(o);
    o.vehicleId = null;
    o.trip = null;
    o.seq = null;
    o.loaded = false;
    o.flag = null;
    o.status = "CONFIRMED";
    return orders.save(o);
  }
  public Order defer(String ref, String reason, String notes, String rescheduleDate) {
    Order o = orders.findById(ref).orElseThrow(() -> bad("Order not found"));
    if (!"FAILED".equalsIgnoreCase(o.delivery) && !"SKIPPED".equalsIgnoreCase(o.delivery)) {
      tp.checkRunNotDeparted(o);
    }
    o.vehicleId = null;
    o.trip = null;
    o.seq = null;
    o.loaded = false;
    o.flag = null;
    o.delivery = null;
    o.skipCount = o.skipCount + 1;
    o.status = "DEFERRED";
    o.deferReason = (reason != null && !reason.isBlank()) ? reason : "Delivery refused / failed";
    o.notes = notes;
    o.rescheduleDate = (rescheduleDate != null && !rescheduleDate.isBlank()) ? rescheduleDate : "Tomorrow";
    return orders.save(o);
  }
  public Order reissue(String ref) {
    Order o = orders.findById(ref).orElseThrow(() -> bad("Order not found: " + ref));
    int damagedUnits = o.units - (o.deliveredUnits != null ? o.deliveredUnits : o.units);
    if (damagedUnits <= 0) damagedUnits = 1;
    Order rep = new Order();
    rep.orderRef = o.orderRef + "-REP";
    rep.outletId = o.outletId;
    rep.brand = o.brand;
    rep.district = o.district;
    rep.depot = o.depot;
    rep.dockType = o.dockType;
    rep.parking = o.parking;
    rep.mallWindow = o.mallWindow;
    rep.windowOpen = o.windowOpen;
    rep.windowClose = o.windowClose;
    rep.temp = o.temp;
    rep.units = damagedUnits;
    rep.weightKg = Math.round((o.weightKg / Math.max(1, o.units)) * damagedUnits * 10.0) / 10.0;
    rep.volumeM3 = Math.round((o.volumeM3 / Math.max(1, o.units)) * damagedUnits * 100.0) / 100.0;
    rep.status = "CONFIRMED";
    rep.notes = "Replacement for damaged items on " + o.orderRef;
    rep.placedAt = o.placedAt;
    rep.deliveryDate = "Tomorrow";
    return orders.save(rep);
  }
  public Vehicle setLoader(String vid, String lid) {
    Vehicle v = vehicles.findById(vid).orElseThrow(() -> bad("Vehicle not found"));
    if (lid == null || lid.isBlank()) {
      v.loaderId = null;
      return vehicles.save(v);
    }
    Loader l = loaders.findById(lid).orElseThrow(() -> bad("Loader not found"));
    if (!l.depot.equalsIgnoreCase(v.depot)) {
      throw bad("Loader " + l.name + " is stationed at " + l.depot + " dock, not " + v.depot);
    }
    vehicles.findByLoaderId(lid).stream()
      .filter(x -> !x.id.equals(vid))
      .findAny()
      .ifPresent(x -> {
        throw bad("Loader " + l.name + " is already assigned to " + x.id);
      });
    v.loaderId = lid;
    return vehicles.save(v);
  }
  public Map<String, Object> resetAllocations(String depot) {
    List<Order> list = orders.findByDepot(depot);
    for (Order o : list) {
      o.vehicleId = null;
      o.trip = null;
      o.status = "CONFIRMED";
      o.loaded = false;
      o.flag = null;
      o.delivery = null;
      o.receipt = null;
      o.deferReason = null;
      orders.save(o);
    }
    List<Vehicle> vs = vehicles.findByDepot(depot);
    for (Vehicle v : vs) {
      v.departed = false;
      v.progressPct = 0;
      vehicles.save(v);
    }
    return Map.of("success", true, "message", "All allocations reset to unallocated queue.");
  }
  public List<Map<String, Object>> resequence(String vid, int trip, List<String> refs) {
    Vehicle v = vehicles.findById(vid).orElseThrow(() -> bad("Vehicle not found: " + vid));
    if (v.departed) throw bad("Vehicle " + vid + " has already departed");
    List<Order> all = orders.findByVehicleId(vid);
    List<Order> onTrip = all.stream().filter(x -> x.trip != null && x.trip == trip).collect(Collectors.toList());
    Set<String> expected = onTrip.stream().map(x -> x.orderRef).collect(Collectors.toSet());
    if (!refs.isEmpty() && !expected.equals(new HashSet<>(refs))) throw bad("Sequence must contain exactly the orders on trip " + trip);
    for (Order o : onTrip) {
      o.seq = refs.isEmpty() ? null : refs.indexOf(o.orderRef);
      orders.save(o);
    }
    return tp.tripsOf(v, all);
  }
}
