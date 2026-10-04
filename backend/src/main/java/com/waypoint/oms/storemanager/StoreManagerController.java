package com.waypoint.oms.storemanager;
import com.waypoint.oms.common.Models.*;
import com.waypoint.oms.security.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping({"/api/store", "/api/stores"})
public class StoreManagerController {
  private final StoreManagerService store;
  public StoreManagerController(StoreManagerService store) {
    this.store = store;
  }
  @GetMapping("/catalog")
  public List<CatalogItem> catalog() {
    return store.catalog();
  }
  @GetMapping("/outlets")
  public List<Outlet> outlets() {
    return store.outlets();
  }
  @GetMapping("/{outletId}")
  public Map<String, Object> storeProfile(@PathVariable String outletId) {
    SecurityUtils.checkStoreAccess(outletId);
    return store.storeProfile(outletId);
  }
  @GetMapping("/{outletId}/orders")
  public List<Map<String, Object>> orders(@PathVariable String outletId) {
    SecurityUtils.checkStoreAccess(outletId);
    return store.storeOrders(outletId);
  }
  @PostMapping("/{outletId}/orders")
  @ResponseStatus(HttpStatus.CREATED)
  @SuppressWarnings("unchecked")
  public Map<String, Object> placeOrder(@PathVariable String outletId, @RequestBody Map<String, Object> req) {
    SecurityUtils.checkStoreAccess(outletId);
    List<Map<String, Object>> lines = (List<Map<String, Object>>) req.get("lines");
    String note = (String) req.get("note");
    return store.placeOrderFromLines(outletId, lines, note);
  }
  @PostMapping("/orders")
  public Order placeLegacy(@RequestBody Order in) {
    SecurityUtils.checkStoreAccess(in.outletId);
    return store.place(in);
  }
  @GetMapping("/{outletId}/dashboard")
  public Map<String, Object> dashboard(@PathVariable String outletId) {
    SecurityUtils.checkStoreAccess(outletId);
    return store.dashboard(outletId);
  }
  @GetMapping("/{outletId}/deliveries/current")
  public Map<String, Object> currentDelivery(@PathVariable String outletId) {
    SecurityUtils.checkStoreAccess(outletId);
    return store.currentDelivery(outletId);
  }
  @PostMapping("/{outletId}/orders/{orderId}/deferral/acknowledge")
  public Map<String, Object> acknowledge(@PathVariable String outletId, @PathVariable String orderId) {
    SecurityUtils.checkStoreAccess(outletId);
    return store.acknowledgeDeferral(outletId, orderId);
  }
  @GetMapping("/{outletId}/receiving/current")
  public Map<String, Object> receiving(@PathVariable String outletId) {
    SecurityUtils.checkStoreAccess(outletId);
    return store.currentReceiving(outletId);
  }
  @PostMapping("/{outletId}/orders/{orderId}/receipt")
  @SuppressWarnings("unchecked")
  public Map<String, Object> receiptDetailed(@PathVariable String outletId, @PathVariable String orderId, @RequestBody Map<String, Object> req) {
    SecurityUtils.checkStoreAccess(outletId);
    if (req.containsKey("results")) {
      List<String> results = (List<String>) req.get("results");
      return store.confirmReceiptWithResults(outletId, orderId, results);
    }
    boolean ok = Boolean.TRUE.equals(req.get("ok"));
    String note = (String) req.get("note");
    String claimType = (String) req.get("claimType");
    Order o = store.receipt(orderId, ok, note, claimType);
    return Map.of("orderId", o.orderRef, "status", o.receipt != null ? o.receipt : "CONFIRMED");
  }
  @PostMapping("/orders/{ref}/receipt")
  public Order receipt(@PathVariable String ref, @RequestBody Map<String, Object> b) {
    return store.receipt(ref, Boolean.TRUE.equals(b.get("ok")), (String) b.get("note"), (String) b.get("claimType"));
  }
  @GetMapping("/{outletId}/reports")
  public Map<String, Object> reports(@PathVariable String outletId) {
    SecurityUtils.checkStoreAccess(outletId);
    return store.reports(outletId);
  }
  @PatchMapping("/{outletId}/orders/{orderId}/deferral")
  public Map<String, Object> deferralReason(@PathVariable String outletId, @PathVariable String orderId, @RequestBody Map<String, String> req) {
    SecurityUtils.checkStoreAccess(outletId);
    return store.setDeferralReason(outletId, orderId, req.get("reason"));
  }
  @PostMapping("/{outletId}/orders/{orderId}/reschedule")
  public Map<String, Object> reschedule(@PathVariable String outletId, @PathVariable String orderId) {
    SecurityUtils.checkStoreAccess(outletId);
    return store.reschedule(outletId, orderId);
  }
}
