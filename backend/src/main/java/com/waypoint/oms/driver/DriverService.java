package com.waypoint.oms.driver;
import com.waypoint.oms.common.*;
import com.waypoint.oms.common.Models.*;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.*;
import static com.waypoint.oms.common.TripPlanner.bad;
@Service
public class DriverService {
  static final ZoneId COLOMBO = ZoneId.of("Asia/Colombo");
  static final DateTimeFormatter HM = DateTimeFormatter.ofPattern("HH:mm");
  static final Set<String> FINAL = Set.of("DELIVERED", "FAILED", "SKIPPED");
  static final int MAX_SIGNATURE = 300_000;   
  static final int MAX_PHOTO = 1_500_000;
  static final String DISPATCHER_PHONE = System.getenv().getOrDefault("DISPATCHER_PHONE", "+94 11 234 5678");
  private final OrderRepo orders;
  private final VehicleRepo vehicles;
  private final TripPlanner tp;
  public DriverService(OrderRepo orders, VehicleRepo vehicles, TripPlanner tp) {
    this.orders = orders;
    this.vehicles = vehicles;
    this.tp = tp;
  }
  private Vehicle vehicle(String vid) { return vehicles.findById(vid).orElseThrow(() -> bad("Vehicle not found: " + vid)); }
  private static String now() { return LocalTime.now(COLOMBO).format(HM); }
  @SuppressWarnings("unchecked")
  public Map<String, Object> driverRun(String vid) {
    Vehicle v = vehicle(vid);
    Map<String, Object> run = tp.runOf(v);
    List<Order> stops = new ArrayList<>();
    for (Map<String, Object> t : (List<Map<String, Object>>) run.get("trips")) stops.addAll((List<Order>) t.get("orders"));
    long delivered = stops.stream().filter(o -> "DELIVERED".equals(o.delivery)).count();
    long failed = stops.stream().filter(o -> "FAILED".equals(o.delivery) || "SKIPPED".equals(o.delivery)).count();
    Map<String, Object> summary = new LinkedHashMap<>();
    summary.put("stops", stops.size());
    summary.put("delivered", delivered);
    summary.put("withIssues", stops.stream().filter(o -> "DELIVERED".equals(o.delivery) && o.issueType != null).count());
    summary.put("failed", failed);
    summary.put("pending", stops.size() - delivered - failed);
    summary.put("plannedKm", ((List<Map<String, Object>>) run.get("trips")).stream().mapToDouble(t -> ((Number) t.get("distanceKm")).doubleValue()).sum());
    Map<String, Object> contacts = new LinkedHashMap<>();
    contacts.put("dispatcher", DISPATCHER_PHONE);
    run.put("version", Integer.toHexString(stops.stream().map(o -> o.orderRef + ":" + o.trip + ":" + o.seq).collect(Collectors.joining("|")).hashCode()));
    run.put("stopRefs", stops.stream().map(o -> o.orderRef).collect(Collectors.toList()));
    run.put("summary", summary);
    run.put("contacts", contacts);
    run.put("serverTime", now());
    return run;
  }
  public Map<String, Object> pod(String ref) {
    Order o = tp.getOrder(ref);
    if (o.signature == null) throw bad("No proof of delivery recorded for " + ref);
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("orderRef", o.orderRef);
    m.put("outletId", o.outletId);
    m.put("recipient", o.recipient);
    m.put("deliveredUnits", o.deliveredUnits);
    m.put("units", o.units);
    m.put("arrivedTime", o.arrivedTime);
    m.put("deliveryTime", o.deliveryTime);
    m.put("issueType", o.issueType);
    m.put("note", o.deliveryNote);
    m.put("signature", o.signature);
    m.put("photo", o.photo);
    return m;
  }
  @SuppressWarnings("unchecked")
  public List<Map<String, Object>> sync(String vid, List<Map<String, Object>> actions) {
    Vehicle v = vehicle(vid);
    List<Map<String, Object>> sorted = new ArrayList<>(actions == null ? List.<Map<String, Object>>of() : actions);
    sorted.sort(Comparator.comparing((Map<String, Object> a) -> str(a, "clientTime", "")));
    List<Map<String, Object>> results = new ArrayList<>();
    for (Map<String, Object> a : sorted) {
      Map<String, Object> r = new LinkedHashMap<>();
      r.put("id", str(a, "id", ""));
      r.put("type", str(a, "type", ""));
      r.put("orderRef", a.get("orderRef"));
      try {
        r.put("status", apply(v, a));
      } catch (ResponseStatusException e) {
        r.put("status", "conflict");
        r.put("message", e.getReason());
      }
      results.add(r);
    }
    return results;
  }
  @SuppressWarnings("unchecked")
  private String apply(Vehicle v, Map<String, Object> a) {
    String type = str(a, "type", "");
    Map<String, Object> p = a.get("payload") instanceof Map ? (Map<String, Object>) a.get("payload") : Map.of();
    switch (type) {
      case "LOCATION":
        v.currentLat = num(p, "lat", v.currentLat);
        v.currentLng = num(p, "lng", v.currentLng);
        v.speedKmh = num(p, "speed", 0);
        v.lastPing = timeOf(a);
        vehicles.save(v);
        return "applied";
      case "INCIDENT": {
        String kind = str(p, "kind", "");
        if (kind.isBlank()) throw bad("Incident type is required");
        String note = str(p, "note", "");
        v.incident = note.isBlank() ? kind : kind + ": " + note;
        v.incidentTime = timeOf(a);
        vehicles.save(v);
        return "applied";
      }
      case "INCIDENT_CLEAR":
        v.incident = null;
        v.incidentTime = null;
        vehicles.save(v);
        return "applied";
      case "RETURN":
        return returnRun(v, a);
      case "ARRIVE":
      case "DELIVER":
      case "FAIL":
        return orderAction(v, type, a, p);
      default:
        throw bad("Unknown action type: " + type);
    }
  }
  private String orderAction(Vehicle v, String type, Map<String, Object> a, Map<String, Object> p) {
    String ref = str(a, "orderRef", "");
    String id = str(a, "id", "");
    Order o = orders.findById(ref).orElseThrow(() -> bad("Order " + ref + " no longer exists"));
    if (o.actionIds != null && o.actionIds.contains(id)) return "duplicate";
    if (!v.id.equals(o.vehicleId)) throw bad("Order " + ref + " is no longer on " + v.id + " (the dispatcher re-routed it)");
    if (!v.departed) throw bad("The run has not departed from the depot yet");
    String cur = o.delivery == null ? "PENDING" : o.delivery;
    if (FINAL.contains(cur)) throw bad("Stop " + o.outletId + " is already " + cur.toLowerCase());
    String time = timeOf(a);
    switch (type) {
      case "ARRIVE":
        o.delivery = "ARRIVED";
        o.arrivedTime = time;
        if (p.get("lat") != null) { o.arrivalLat = num(p, "lat", 0); o.arrivalLng = num(p, "lng", 0); }
        break;
      case "DELIVER": {
        String sig = str(p, "signature", ""), photo = str(p, "photo", ""), who = str(p, "recipient", "").trim();
        if (who.isBlank() || !sig.startsWith("data:image/") || !photo.startsWith("data:image/")) {
          throw bad("Proof of delivery needs a recipient name, a signature and a photo");
        }
        if (sig.length() > MAX_SIGNATURE || photo.length() > MAX_PHOTO) throw bad("Signature or photo is too large");
        int units = (int) num(p, "deliveredUnits", o.units);
        if (units < 0 || units > o.units) throw bad("Delivered units must be between 0 and " + o.units);
        String issue = str(p, "issueType", "");
        if (units < o.units && issue.isBlank()) issue = "Short delivery";
        o.delivery = "DELIVERED";
        o.recipient = who;
        o.signature = sig;
        o.photo = photo;
        o.deliveredUnits = units;
        o.issueType = issue.isBlank() ? null : issue;
        o.deliveryNote = str(p, "note", "");
        o.deliveryTime = time;
        break;
      }
      default: { 
        String reason = str(p, "reason", "");
        if (reason.isBlank()) throw bad("A reason is required when a delivery cannot be made");
        o.delivery = "FAILED";
        o.issueType = reason;
        o.deliveryNote = str(p, "note", "");
        o.deliveredUnits = 0;
        o.deliveryTime = time;
      }
    }
    if (o.actionIds == null) o.actionIds = new ArrayList<>();
    o.actionIds.add(id);
    if (o.actionIds.size() > 30) o.actionIds.remove(0);
    orders.save(o);
    refreshProgress(v);
    return "applied";
  }
  private String returnRun(Vehicle v, Map<String, Object> a) {
    if (!v.departed) throw bad("The run has not departed from the depot yet");
    long pending = orders.findByVehicleId(v.id).stream().filter(o -> !FINAL.contains(o.delivery == null ? "PENDING" : o.delivery)).count();
    if (pending > 0) throw bad(pending + " stop(s) are still pending. Complete or report them before returning.");
    if (v.returnedAt == null) v.returnedAt = timeOf(a);
    v.progressPct = 100;
    vehicles.save(v);
    return "applied";
  }
  private void refreshProgress(Vehicle v) {
    List<Order> os = orders.findByVehicleId(v.id);
    long done = os.stream().filter(o -> FINAL.contains(o.delivery == null ? "PENDING" : o.delivery)).count();
    v.progressPct = os.isEmpty() ? 0 : (int) (100 * done / os.size());
    vehicles.save(v);
  }
  private static String timeOf(Map<String, Object> a) {
    try {
      return LocalTime.ofInstant(Instant.parse(str(a, "clientTime", "")), COLOMBO).format(HM);
    } catch (Exception e) {
      return now();
    }
  }
  private static String str(Map<String, Object> m, String k, String d) { Object v = m == null ? null : m.get(k); return v == null ? d : String.valueOf(v); }
  private static double num(Map<String, Object> m, String k, double d) { Object v = m == null ? null : m.get(k); return v instanceof Number ? ((Number) v).doubleValue() : d; }
}
