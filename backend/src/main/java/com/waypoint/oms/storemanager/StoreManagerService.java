package com.waypoint.oms.storemanager;
import com.waypoint.oms.common.*;
import com.waypoint.oms.common.Models.*;
import com.waypoint.oms.security.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import static com.waypoint.oms.common.TripPlanner.bad;
import static com.waypoint.oms.common.TripPlanner.invalid;
@Service
public class StoreManagerService {
  private static final ZoneId COLOMBO = ZoneId.of("Asia/Colombo");
  private static final LocalTime CUTOFF_TIME = LocalTime.of(16, 0);
  private final OrderRepo orders;
  private final VehicleRepo vehicles;
  private final OutletRepo outlets;
  private final CatalogRepo catalog;
  private final TripPlanner tp;
  public StoreManagerService(OrderRepo orders, VehicleRepo vehicles, OutletRepo outlets, CatalogRepo catalog, TripPlanner tp) {
    this.orders = orders;
    this.vehicles = vehicles;
    this.outlets = outlets;
    this.catalog = catalog;
    this.tp = tp;
  }
  public List<CatalogItem> catalog() {
    return catalog.findByActiveTrueOrderBySortOrderAsc();
  }
  public List<Outlet> outlets() {
    return outlets.findAll();
  }
  public Map<String, Object> storeProfile(String outletId) {
    Outlet o = outlets.findById(outletId).orElseThrow(() -> bad("Outlet not found: " + outletId));
    Map<String, Object> res = new LinkedHashMap<>();
    res.put("outletId", o.id);
    res.put("id", o.id);
    res.put("name", o.name);
    res.put("brand", o.brand);
    res.put("district", o.district);
    res.put("depot", o.depot);
    res.put("dockType", o.dockType);
    res.put("parking", o.parking);
    res.put("mallWindow", o.mallWindow);
    res.put("windowOpen", o.windowOpen);
    res.put("windowClose", o.windowClose);
    res.put("cutoff", cutoffInfo());
    return res;
  }
  public Map<String, Object> cutoffInfo() {
    ZonedDateTime now = ZonedDateTime.now(COLOMBO);
    ZonedDateTime cutoffToday = now.toLocalDate().atTime(CUTOFF_TIME).atZone(COLOMBO);
    long secondsRemaining = Math.max(0, Duration.between(now, cutoffToday).getSeconds());
    LocalDate nextDate = now.toLocalTime().isBefore(CUTOFF_TIME) ? now.toLocalDate().plusDays(1) : now.toLocalDate().plusDays(2);
    if (nextDate.getDayOfWeek() == DayOfWeek.SUNDAY) {
      nextDate = nextDate.plusDays(1);
    }
    Map<String, Object> c = new LinkedHashMap<>();
    c.put("time", "16:00");
    c.put("zone", "Asia/Colombo");
    c.put("secondsRemaining", secondsRemaining);
    c.put("nextDeliveryDate", nextDate.toString());
    c.put("today", now.toLocalDate().toString());
    return c;
  }
  public List<Map<String, Object>> storeOrders(String oid) {
    List<Order> l = orders.findByOutletId(oid);
    decorateTripInfo(l);
    return l.stream().map(this::toOrderDto).collect(Collectors.toList());
  }
  public Map<String, Object> placeOrderFromLines(String outletId, List<Map<String, Object>> linesInput, String note) {
    Outlet ou = outlets.findById(outletId).orElseThrow(() -> invalid("Outlet not found: " + outletId));
    if (linesInput == null || linesInput.isEmpty()) {
      throw invalid("At least one line item is required");
    }
    List<CatalogItem> allCat = catalog.findAll();
    Map<String, CatalogItem> catMap = allCat.stream().collect(Collectors.toMap(c -> c.id, c -> c, (a, b) -> a));
    Map<String, CatalogItem> nameMap = allCat.stream().collect(Collectors.toMap(c -> c.name.toLowerCase(), c -> c, (a, b) -> a));
    List<OrderLine> lines = new ArrayList<>();
    int totalUnits = 0;
    double totalWeight = 0;
    double totalVol = 0;
    boolean hasChilled = false;
    for (Map<String, Object> raw : linesInput) {
      String id = raw.get("itemId") != null ? String.valueOf(raw.get("itemId")) : null;
      String name = raw.get("name") != null ? String.valueOf(raw.get("name")) : null;
      int qty = 1;
      if (raw.get("qty") instanceof Number n) qty = n.intValue();
      if (qty <= 0) continue;
      CatalogItem matched = null;
      if (id != null && catMap.containsKey(id)) {
        matched = catMap.get(id);
      } else if (name != null && nameMap.containsKey(name.toLowerCase())) {
        matched = nameMap.get(name.toLowerCase());
      }
      String itemName = matched != null ? matched.name : (name != null ? name : "General Item");
      String product = matched != null ? matched.product : itemName;
      String unit = matched != null ? matched.unit : "pack";
      String temp = matched != null ? matched.temp : "Ambient";
      double unitW = matched != null && matched.weightKg > 0 ? matched.weightKg : 1.5;
      double unitV = matched != null && matched.volumeM3 > 0 ? matched.volumeM3 : 0.005;
      if ("Chilled".equalsIgnoreCase(temp)) hasChilled = true;
      totalUnits += qty;
      totalWeight += unitW * qty;
      totalVol += unitV * qty;
      lines.add(new OrderLine(matched != null ? matched.id : "item-" + lines.size(), itemName, product, unit, temp, qty));
    }
    if (totalUnits <= 0) throw invalid("Total order units must be greater than zero");
    LocalDate nextDate = (LocalDate) LocalDate.parse((String) cutoffInfo().get("nextDeliveryDate"));
    Order o = new Order();
    o.orderRef = "ORD" + (System.currentTimeMillis() % 100000000L);
    o.outletId = ou.id;
    o.brand = ou.brand;
    o.district = ou.district;
    o.depot = ou.depot;
    o.dockType = ou.dockType;
    o.parking = ou.parking;
    o.mallWindow = ou.mallWindow;
    o.windowOpen = ou.windowOpen;
    o.windowClose = ou.windowClose;
    o.temp = hasChilled ? "chilled" : "ambient";
    o.units = totalUnits;
    o.weightKg = Math.round(totalWeight * 10.0) / 10.0;
    o.volumeM3 = Math.round(totalVol * 1000.0) / 1000.0;
    o.notes = note;
    o.lines = lines;
    o.status = "CONFIRMED";
    o.delivery = "PENDING";
    o.placedAt = Instant.now().toString();
    o.deliveryDate = nextDate.toString();
    Order saved = orders.save(o);
    return toOrderDto(saved);
  }
  public Order place(Order in) {
    if (in.outletId == null || in.outletId.isBlank()) throw invalid("outletId is required");
    Outlet ou = outlets.findById(in.outletId).orElseThrow(() -> invalid("Outlet not found: " + in.outletId));
    if (in.weightKg <= 0 || in.volumeM3 <= 0 || in.units <= 0) throw invalid("Units, weight and volume must be greater than zero");
    Order o = new Order();
    o.orderRef = "ORD" + (System.currentTimeMillis() % 100000000L);
    o.outletId = ou.id;
    o.brand = ou.brand;
    o.district = ou.district;
    o.depot = ou.depot;
    o.dockType = ou.dockType;
    o.parking = ou.parking;
    o.mallWindow = ou.mallWindow;
    o.windowOpen = ou.windowOpen;
    o.windowClose = ou.windowClose;
    o.temp = "Fresh".equalsIgnoreCase(ou.brand) && "chilled".equalsIgnoreCase(in.temp) ? "chilled" : "ambient";
    o.units = in.units;
    o.weightKg = in.weightKg;
    o.volumeM3 = in.volumeM3;
    o.notes = in.notes;
    o.status = "CONFIRMED";
    o.delivery = "PENDING";
    o.placedAt = Instant.now().toString();
    o.deliveryDate = LocalDate.now(COLOMBO).plusDays(1).toString();
    if (in.lines != null && !in.lines.isEmpty()) {
      o.lines = in.lines;
    } else {
      o.lines = List.of(new OrderLine("gen-1", ou.brand + " Goods", ou.brand, "pack", o.temp, o.units));
    }
    return orders.save(o);
  }
  public Map<String, Object> dashboard(String outletId) {
    List<Order> list = orders.findByOutletId(outletId);
    decorateTripInfo(list);
    long thisWeek = list.size();
    long deferred = list.stream().filter(o -> "DEFERRED".equalsIgnoreCase(o.status)).count();
    long issues = list.stream().filter(o -> "DISPUTED".equalsIgnoreCase(o.receipt) || (o.issueType != null && !o.issueType.isBlank())).count();
    long deliveries = list.stream().filter(o -> "DELIVERED".equalsIgnoreCase(o.delivery)).count();
    long onTimeCount = list.stream().filter(o -> "DELIVERED".equalsIgnoreCase(o.delivery) && !o.late).count();
    int onTimeRate = deliveries > 0 ? (int) Math.round((double) onTimeCount * 100.0 / deliveries) : 100;
    Order next = list.stream()
        .filter(o -> !"DELIVERED".equalsIgnoreCase(o.delivery) && !"DEFERRED".equalsIgnoreCase(o.status))
        .findFirst()
        .orElse(null);
    Map<String, Object> nextMap = null;
    if (next != null) {
      nextMap = new LinkedHashMap<>();
      nextMap.put("orderId", next.orderRef);
      nextMap.put("itemCount", next.units);
      nextMap.put("deliveryDate", next.deliveryDate != null ? next.deliveryDate : LocalDate.now(COLOMBO).toString());
      nextMap.put("expectedArrival", next.eta != null ? next.eta : next.windowOpen);
      nextMap.put("vehicleId", next.vehicleId);
      String driverName = null;
      if (next.vehicleId != null) {
        Vehicle v = vehicles.findById(next.vehicleId).orElse(null);
        if (v != null) driverName = v.driver;
      }
      nextMap.put("driverName", driverName != null ? driverName : "Assigned Driver");
      nextMap.put("stopsAhead", Math.max(0, (next.stop != null ? next.stop : 1) - 1));
    }
    Order deferralNoticeOrder = list.stream()
        .filter(o -> "DEFERRED".equalsIgnoreCase(o.status) && !o.deferAcknowledged)
        .findFirst()
        .orElse(null);
    Map<String, Object> deferralNotice = null;
    if (deferralNoticeOrder != null) {
      deferralNotice = new LinkedHashMap<>();
      deferralNotice.put("orderId", deferralNoticeOrder.orderRef);
      deferralNotice.put("reason", deferralNoticeOrder.deferReason != null ? deferralNoticeOrder.deferReason : "Warehouse capacity limit");
      deferralNotice.put("date", deferralNoticeOrder.rescheduleDate != null ? deferralNoticeOrder.rescheduleDate : deferralNoticeOrder.deliveryDate);
      deferralNotice.put("skipCount", deferralNoticeOrder.skipCount);
      deferralNotice.put("danger", deferralNoticeOrder.skipCount >= 2);
    }
    Map<String, Object> stats = new LinkedHashMap<>();
    stats.put("ordersThisWeek", thisWeek);
    stats.put("deferredRecently", deferred);
    stats.put("issuesReported", issues);
    stats.put("onTimeRate", onTimeRate);
    stats.put("deliveriesThisWeek", deliveries);
    Map<String, Object> res = new LinkedHashMap<>();
    res.put("today", LocalDate.now(COLOMBO).toString());
    res.put("stats", stats);
    res.put("deferralNotice", deferralNotice);
    res.put("nextDelivery", nextMap);
    return res;
  }
  public Map<String, Object> currentDelivery(String outletId) {
    List<Order> list = orders.findByOutletId(outletId);
    decorateTripInfo(list);
    Order current = list.stream()
        .filter(o -> !"DELIVERED".equalsIgnoreCase(o.delivery) && !"DEFERRED".equalsIgnoreCase(o.status))
        .findFirst()
        .orElse(list.isEmpty() ? null : list.get(0));
    Map<String, Object> res = new LinkedHashMap<>();
    if (current == null) {
      res.put("order", null);
      res.put("delivery", null);
      res.put("steps", List.of());
      return res;
    }
    Vehicle v = current.vehicleId != null ? vehicles.findById(current.vehicleId).orElse(null) : null;
    boolean isDeparted = v != null && v.departed;
    boolean isArrived = "ARRIVED".equalsIgnoreCase(current.delivery);
    boolean isDelivered = "DELIVERED".equalsIgnoreCase(current.delivery);
    boolean isLoaded = current.loaded;
    String stage = "CONFIRMED";
    String headline = "Order confirmed at fulfillment center";
    if (isDelivered) {
      stage = "DELIVERED";
      headline = "Order delivered";
    } else if (isArrived) {
      stage = "ARRIVING";
      headline = "Driver arrived at outlet dock";
    } else if (isDeparted) {
      stage = "EN_ROUTE";
      headline = "Driver en route - ETA " + (current.eta != null ? current.eta : current.windowOpen);
    } else if (isLoaded) {
      stage = "LOADED";
      headline = "Loaded on vehicle " + current.vehicleId + " at depot dock";
    }
    Map<String, Object> deliveryInfo = new LinkedHashMap<>();
    deliveryInfo.put("vehicleId", current.vehicleId);
    deliveryInfo.put("driverName", v != null && v.driver != null ? v.driver : "Assigned Driver");
    deliveryInfo.put("depot", current.depot);
    deliveryInfo.put("stage", stage);
    deliveryInfo.put("stopsAhead", Math.max(0, (current.stop != null ? current.stop : 1) - 1));
    List<Map<String, Object>> steps = new ArrayList<>();
    steps.add(step("CONFIRMED", "Order Confirmed", "Fulfillment center processing", true, "CONFIRMED".equals(stage)));
    steps.add(step("LOADED", "Loaded at Depot", "Pallet checked and loaded", isLoaded || isDeparted || isArrived || isDelivered, "LOADED".equals(stage)));
    steps.add(step("EN_ROUTE", "In Transit", "Driver dispatched from depot", isDeparted || isArrived || isDelivered, "EN_ROUTE".equals(stage)));
    steps.add(step("ARRIVING", "Arriving", "At outlet dock gate", isArrived || isDelivered, "ARRIVING".equals(stage)));
    steps.add(step("DELIVERED", "Delivered", "Handed over and verified", isDelivered, "DELIVERED".equals(stage)));
    res.put("order", toOrderDto(current));
    res.put("delivery", deliveryInfo);
    res.put("headline", headline);
    res.put("windowOpen", current.windowOpen);
    res.put("windowClose", current.windowClose);
    res.put("steps", steps);
    return res;
  }
  private Map<String, Object> step(String key, String label, String desc, boolean done, boolean active) {
    Map<String, Object> s = new LinkedHashMap<>();
    s.put("key", key);
    s.put("label", label);
    s.put("desc", desc);
    s.put("done", done);
    s.put("active", active);
    return s;
  }
  public Map<String, Object> currentReceiving(String outletId) {
    List<Order> list = orders.findByOutletId(outletId);
    decorateTripInfo(list);
    Order o = list.stream()
        .filter(x -> "ARRIVED".equalsIgnoreCase(x.delivery) || "DELIVERED".equalsIgnoreCase(x.delivery))
        .findFirst()
        .orElse(list.isEmpty() ? null : list.get(0));
    Map<String, Object> res = new LinkedHashMap<>();
    if (o == null) {
      res.put("order", null);
      return res;
    }
    Vehicle v = o.vehicleId != null ? vehicles.findById(o.vehicleId).orElse(null) : null;
    res.put("order", toOrderDto(o));
    res.put("vehicleId", o.vehicleId);
    res.put("driverName", v != null && v.driver != null ? v.driver : "Driver");
    Map<String, Object> report = new LinkedHashMap<>();
    report.put("note", o.deliveryNote != null ? o.deliveryNote : "");
    report.put("submittedAt", o.deliveryTime != null ? o.deliveryTime : Instant.now().toString());
    report.put("photoCount", o.photo != null ? 1 : 0);
    report.put("itemsDispatched", o.units);
    res.put("driverReport", report);
    return res;
  }
  public Map<String, Object> confirmReceiptWithResults(String outletId, String orderId, List<String> results) {
    Order o = tp.getOrder(orderId);
    if (!outletId.equalsIgnoreCase(o.outletId)) throw bad("Order does not belong to outlet " + outletId);
    boolean hasShortOrDamaged = results != null && results.stream().anyMatch(r -> "SHORT".equalsIgnoreCase(r) || "DAMAGED".equalsIgnoreCase(r));
    o.receipt = hasShortOrDamaged ? "DISPUTED" : "CONFIRMED";
    if (hasShortOrDamaged) {
      o.claimType = "Damaged / Missing items";
      o.claimStatus = "SUBMITTED";
      o.receiptNote = "Receipt discrepancy flagged by store manager";
    } else {
      o.receiptNote = "Goods received in full";
    }
    Order saved = orders.save(o);
    Map<String, Object> res = new LinkedHashMap<>();
    res.put("orderId", saved.orderRef);
    res.put("status", saved.receipt);
    res.put("claimNumber", hasShortOrDamaged ? "C-" + System.currentTimeMillis() % 1000000 : null);
    res.put("claimType", saved.claimType);
    return res;
  }
  public Order receipt(String ref, boolean ok, String note, String claimType) {
    Order o = tp.getOrder(ref);
    o.receipt = ok ? "CONFIRMED" : "DISPUTED";
    o.receiptNote = note;
    if (!ok) {
      o.claimType = (claimType != null && !claimType.isBlank()) ? claimType : "Damaged / Missing Items";
      o.claimStatus = "SUBMITTED";
    }
    return orders.save(o);
  }
  public Map<String, Object> acknowledgeDeferral(String outletId, String orderId) {
    Order o = tp.getOrder(orderId);
    if (!outletId.equalsIgnoreCase(o.outletId)) throw bad("Order does not belong to outlet " + outletId);
    o.deferAcknowledged = true;
    Order saved = orders.save(o);
    return toOrderDto(saved);
  }
  public Map<String, Object> setDeferralReason(String outletId, String orderId, String reason) {
    Order o = tp.getOrder(orderId);
    if (!outletId.equalsIgnoreCase(o.outletId)) throw bad("Order does not belong to outlet " + outletId);
    o.deferReason = reason;
    Order saved = orders.save(o);
    return toOrderDto(saved);
  }
  public Map<String, Object> reschedule(String outletId, String orderId) {
    Order o = tp.getOrder(orderId);
    if (!outletId.equalsIgnoreCase(o.outletId)) throw bad("Order does not belong to outlet " + outletId);
    o.status = "CONFIRMED";
    o.delivery = "PENDING";
    o.deliveryDate = (String) cutoffInfo().get("nextDeliveryDate");
    o.deferAcknowledged = true;
    Order saved = orders.save(o);
    return toOrderDto(saved);
  }
  public Map<String, Object> reports(String outletId) {
    List<Order> list = orders.findByOutletId(outletId);
    List<Map<String, Object>> deferrals = list.stream()
        .filter(o -> "DEFERRED".equalsIgnoreCase(o.status) || o.skipCount > 0)
        .map(o -> {
          Map<String, Object> m = new LinkedHashMap<>();
          m.put("orderId", o.orderRef);
          m.put("outletName", o.outletName != null ? o.outletName : o.outletId);
          m.put("reason", o.deferReason != null ? o.deferReason : "Capacity constraint");
          m.put("deferredBy", "Peliyagoda Logistics Desk");
          m.put("deferredDate", o.rescheduleDate != null ? o.rescheduleDate : o.deliveryDate);
          m.put("history", o.skipCount + " skips");
          m.put("danger", o.skipCount >= 2);
          return m;
        })
        .collect(Collectors.toList());
    long skippedTwice = list.stream().filter(o -> o.skipCount >= 2).count();
    List<Map<String, Object>> onTime = new ArrayList<>();
    Map<String, Object> w1 = new LinkedHashMap<>();
    w1.put("week", "Current Week");
    long totalDelivered = list.stream().filter(o -> "DELIVERED".equalsIgnoreCase(o.delivery)).count();
    long onTimeDelivered = list.stream().filter(o -> "DELIVERED".equalsIgnoreCase(o.delivery) && !o.late).count();
    int rate = totalDelivered > 0 ? (int) Math.round((double) onTimeDelivered * 100.0 / totalDelivered) : 96;
    w1.put("rate", rate);
    w1.put("orders", list.size());
    onTime.add(w1);
    Map<String, Object> res = new LinkedHashMap<>();
    res.put("deferrals", deferrals);
    res.put("skippedTwiceCount", skippedTwice);
    res.put("onTime", onTime);
    return res;
  }
  private void decorateTripInfo(List<Order> list) {
    Map<String, Order> dec = new HashMap<>();
    list.stream().map(o -> o.vehicleId).filter(Objects::nonNull).distinct().forEach(id ->
        vehicles.findById(id).ifPresent(v ->
            tp.tripsOf(v, orders.findByVehicleId(id)).forEach(t ->
                ((List<Order>) t.get("orders")).forEach(x -> dec.put(x.orderRef, x))
            )
        )
    );
    for (Order o : list) {
      Order d = dec.get(o.orderRef);
      if (d != null) {
        o.stop = d.stop;
        o.stops = d.stops;
        o.eta = d.eta;
        o.lat = d.lat;
        o.lng = d.lng;
        o.late = d.late;
      }
    }
  }
  private Map<String, Object> toOrderDto(Order o) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("id", o.orderRef);
    m.put("orderRef", o.orderRef);
    m.put("outletId", o.outletId);
    m.put("brand", o.brand);
    m.put("placedAt", o.placedAt != null ? o.placedAt : Instant.now().toString());
    m.put("deliveryDate", o.deliveryDate != null ? o.deliveryDate : LocalDate.now(COLOMBO).toString());
    String statusLabel = "Confirmed";
    if ("CONFIRMED".equalsIgnoreCase(o.receipt)) {
      statusLabel = "Delivered";
    } else if ("DISPUTED".equalsIgnoreCase(o.receipt)) {
      statusLabel = "Issue Reported";
    } else if ("DELIVERED".equalsIgnoreCase(o.delivery)) {
      statusLabel = "Delivery";
    } else if ("DEFERRED".equalsIgnoreCase(o.status)) {
      statusLabel = "Deferred";
    } else if (o.vehicleId != null) {
      statusLabel = "Confirmed";
    } else {
      statusLabel = "Placed";
    }
    m.put("status", o.status);
    m.put("statusLabel", statusLabel);
    m.put("itemCount", o.units);
    long chilledCount = o.lines != null ? o.lines.stream().filter(l -> "Chilled".equalsIgnoreCase(l.temp)).mapToInt(l -> l.qty).sum() : ("chilled".equalsIgnoreCase(o.temp) ? o.units : 0);
    m.put("chilledCount", chilledCount);
    m.put("expectedArrival", o.eta != null ? o.eta : o.windowOpen);
    m.put("lines", o.lines != null ? o.lines : List.of());
    m.put("note", o.notes != null ? o.notes : "");
    m.put("notes", o.notes);
    m.put("weightKg", o.weightKg);
    m.put("volumeM3", o.volumeM3);
    m.put("deferReason", o.deferReason);
    m.put("deferAcknowledged", o.deferAcknowledged);
    m.put("skipCount", o.skipCount);
    m.put("receipt", o.receipt);
    m.put("delivery", o.delivery);
    return m;
  }
}
