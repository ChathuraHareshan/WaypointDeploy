package com.waypoint.oms.loader;
import com.waypoint.oms.common.*;
import com.waypoint.oms.common.Models.*;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;
import static com.waypoint.oms.common.TripPlanner.bad;
@Service
public class LoaderService {
  private final OrderRepo orders;
  private final VehicleRepo vehicles;
  private final LoaderRepo loaders;
  private final OutletRepo outlets;
  private final TripPlanner tp;
  public LoaderService(OrderRepo orders, VehicleRepo vehicles, LoaderRepo loaders, OutletRepo outlets, TripPlanner tp) {
    this.orders = orders;
    this.vehicles = vehicles;
    this.loaders = loaders;
    this.outlets = outlets;
    this.tp = tp;
  }
  public List<Map<String, Object>> loaderRuns(String lid) {
    List<Vehicle> vs = (lid == null || "ALL".equalsIgnoreCase(lid)) ? List.of() : vehicles.findByLoaderId(lid);
    if (vs.isEmpty()) {
      Loader l = (lid == null || "ALL".equalsIgnoreCase(lid)) ? null : loaders.findById(lid).orElse(null);
      String depot = l != null && l.depot != null ? l.depot : "Peliyagoda";
      vs = vehicles.findAll().stream()
          .filter(v -> (v.depot == null || v.depot.equalsIgnoreCase(depot)) &&
                       "available".equalsIgnoreCase(v.status) &&
                       !orders.findByVehicleId(v.id).isEmpty())
          .collect(Collectors.toList());
    }
    return vs.stream().map(tp::runOf).collect(Collectors.toList());
  }
  public List<Map<String, Object>> listFormattedRuns(String lid) {
    List<Vehicle> vList = (lid == null || "ALL".equalsIgnoreCase(lid)) ? List.of() : vehicles.findByLoaderId(lid);
    if (vList.isEmpty()) {
      Loader l = (lid == null || "ALL".equalsIgnoreCase(lid)) ? null : loaders.findById(lid).orElse(null);
      String depot = l != null && l.depot != null ? l.depot : "Peliyagoda";
      vList = vehicles.findAll().stream()
          .filter(v -> (v.depot == null || v.depot.equalsIgnoreCase(depot)) &&
                       "available".equalsIgnoreCase(v.status) &&
                       !orders.findByVehicleId(v.id).isEmpty())
          .collect(Collectors.toList());
    }
    List<Map<String, Object>> res = new ArrayList<>();
    for (Vehicle v : vList) {
      res.add(formatVehicleRun(v));
    }
    return res;
  }
  public Map<String, Object> getFormattedRun(String runOrVehicleId) {
    Vehicle v = vehicles.findById(runOrVehicleId)
        .orElseGet(() -> vehicles.findAll().stream()
            .filter(x -> runOrVehicleId.equalsIgnoreCase(x.id) || runOrVehicleId.endsWith(x.id.replaceAll("[^0-9]", "")))
            .findFirst()
            .orElseGet(() -> vehicles.findAll().stream()
                .filter(x -> !orders.findByVehicleId(x.id).isEmpty())
                .findFirst()
                .orElseThrow(() -> bad("Run or vehicle not found: " + runOrVehicleId))));
    return formatVehicleRun(v);
  }
  private Map<String, Object> formatVehicleRun(Vehicle v) {
    List<Order> os = orders.findByVehicleId(v.id);
    long loadedCount = os.stream().filter(o -> o.loaded).count();
    boolean anyLoaded = loadedCount > 0;
    String status = v.departed ? "completed" : (anyLoaded ? "active" : "queued");
    String phase = v.departed ? "completed" : (anyLoaded ? "loading" : "pending");
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("id", v.id);
    m.put("label", "Run #" + v.id);
    m.put("vehicleId", v.id);
    m.put("dock", (v.depot != null ? v.depot : "Peliyagoda") + " Dock Bay 1");
    m.put("totalItems", os.size());
    m.put("loadedItems", (int) loadedCount);
    m.put("status", status);
    m.put("phase", phase);
    m.put("viewOnly", v.departed);
    m.put("trips", tp.tripsOf(v, os));
    m.put("vehicle", v.id);
    m.put("vehicleObj", v);
    List<Map<String, Object>> items = new ArrayList<>();
    List<Map<String, Object>> stops = new ArrayList<>();
    for (int i = 0; i < os.size(); i++) {
      Order o = os.get(i);
      Outlet out = outlets.findById(o.outletId).orElse(null);
      String outletName = out != null ? out.name : ("Outlet " + o.outletId);
      String zone = i < os.size() / 3 ? "Rear" : (i < 2 * os.size() / 3 ? "Mid" : "Front");
      String itemStatus = o.loaded ? "verified" : (o.flag != null ? "flagged" : "pending");
      Map<String, Object> item = new LinkedHashMap<>();
      item.put("sku", o.orderRef);
      item.put("name", outletName + " (" + o.brand + ")");
      item.put("qty", o.units + " units");
      item.put("units", o.units);
      item.put("zone", zone);
      item.put("status", itemStatus);
      item.put("flag", o.flag);
      item.put("flagNotes", o.flagNotes);
      items.add(item);
      Map<String, Object> stop = new LinkedHashMap<>();
      stop.put("id", "stop-" + (i + 1));
      stop.put("stopIndex", i);
      stop.put("orderRef", o.orderRef);
      stop.put("name", outletName);
      stop.put("items", o.units);
      stop.put("zone", zone);
      stop.put("status", o.loaded ? "completed" : "pending");
      stops.add(stop);
    }
    m.put("itemsList", items);
    m.put("stopsList", stops);
    return m;
  }
  public Order load(String ref, boolean l) {
    Order o = tp.getOrder(ref);
    tp.checkRunNotDeparted(o);
    o.loaded = l;
    if (l) o.flag = null;
    return orders.save(o);
  }
  public Order flag(String ref, String issue, String photo, String notes) {
    Order o = tp.getOrder(ref);
    tp.checkRunNotDeparted(o);
    o.flag = issue;
    o.flagPhoto = photo;
    o.flagNotes = notes;
    o.loaded = false;
    return orders.save(o);
  }
  public Vehicle depart(String vid) {
    Vehicle v = vehicles.findById(vid).orElseThrow(() -> bad("Vehicle not found: " + vid));
    if (v.loaderId == null) {
      v.loaderId = "LDR01";
    }
    List<Order> os = orders.findByVehicleId(vid);
    if (os.isEmpty()) throw bad("No orders allocated to vehicle " + vid);
    for (Order o : os) {
      if (!o.loaded && o.flag == null) {
        throw bad("Stop " + o.outletId + " (" + o.orderRef + ") is not yet loaded or flagged");
      }
      if ("Quantity Mismatch".equalsIgnoreCase(o.flag) && "Fresh".equalsIgnoreCase(o.brand)) {
        throw bad("Critical shortfall at " + o.outletId + " (" + o.orderRef + ") - Dispatcher must resolve before departure");
      }
    }
    for (Order o : os) {
      if (o.flag != null) {
        o.delivery = "SKIPPED";
        o.deliveryNote = "Not delivered: " + o.flag + (o.flagNotes != null ? " - " + o.flagNotes : "");
      } else {
        o.delivery = "PENDING";
      }
      orders.save(o);
    }
    v.departed = true;
    v.progressPct = 0;
    return vehicles.save(v);
  }
  public Map<String, Object> summary(String lid) {
    List<Vehicle> vList = vehicles.findByLoaderId(lid);
    if (vList.isEmpty()) {
      Loader l = loaders.findById(lid).orElse(null);
      String depot = l != null && l.depot != null ? l.depot : "Peliyagoda";
      vList = vehicles.findAll().stream()
          .filter(v -> (v.depot == null || v.depot.equalsIgnoreCase(depot)) &&
                       "available".equalsIgnoreCase(v.status) &&
                       !orders.findByVehicleId(v.id).isEmpty())
          .collect(Collectors.toList());
    }
    int activeRuns = (int) vList.stream().filter(v -> !v.departed).count();
    int completedRuns = (int) vList.stream().filter(v -> v.departed).count();
    int totalItems = 0;
    int loadedItems = 0;
    for (Vehicle v : vList) {
      List<Order> os = orders.findByVehicleId(v.id);
      totalItems += os.size();
      loadedItems += os.stream().filter(o -> o.loaded).count();
    }
    Map<String, Object> res = new LinkedHashMap<>();
    res.put("activeRuns", activeRuns);
    res.put("completedRuns", completedRuns);
    res.put("totalItems", totalItems);
    res.put("loadedItems", loadedItems);
    res.put("accuracy", totalItems > 0 ? (int) Math.round(100.0 * loadedItems / totalItems) : 100);
    return res;
  }
  public Map<String, Object> profile(String lid) {
    Loader l = loaders.findById(lid).orElse(null);
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("id", lid);
    m.put("name", l != null ? l.name : lid);
    m.put("depot", l != null ? l.depot : "Peliyagoda");
    m.put("phone", l != null ? l.phone : "+94 11 234 5678");
    m.put("avatar", l != null ? l.avatar : null);
    return m;
  }
  public List<Map<String, Object>> exceptions(String vid) {
    List<Order> os = orders.findByVehicleId(vid);
    List<Map<String, Object>> ex = new ArrayList<>();
    for (Order o : os) {
      if (o.flag != null) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("sku", o.orderRef);
        m.put("orderRef", o.orderRef);
        m.put("reason", o.flag);
        m.put("note", o.flagNotes);
        m.put("at", o.deliveryTime != null ? o.deliveryTime : "10:30");
        ex.add(m);
      }
    }
    return ex;
  }
}
