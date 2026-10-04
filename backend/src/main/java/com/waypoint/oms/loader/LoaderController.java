package com.waypoint.oms.loader;
import com.waypoint.oms.common.Models.*;
import com.waypoint.oms.security.SecurityUtils;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController
@RequestMapping("/api/loader")
public class LoaderController {
  private final LoaderService loader;
  public LoaderController(LoaderService loader) {
    this.loader = loader;
  }
  @GetMapping("/{id}/runs")
  public List<Map<String, Object>> runsLegacy(@PathVariable String id) {
    SecurityUtils.checkLoaderAccess(id);
    return loader.loaderRuns(id);
  }
  @GetMapping("/runs")
  public List<Map<String, Object>> listRuns(@RequestParam(required = false) String loaderId) {
    String lid = resolveLoaderId(loaderId);
    SecurityUtils.checkLoaderAccess(lid);
    return loader.listFormattedRuns(lid);
  }
  @GetMapping("/runs/{runId}")
  public Map<String, Object> getRun(@PathVariable String runId) {
    return loader.getFormattedRun(runId);
  }
  @PostMapping("/runs/{runId}/start")
  public Map<String, Object> startRun(@PathVariable String runId, @RequestParam(required = false) String loaderId) {
    String lid = resolveLoaderId(loaderId);
    SecurityUtils.checkLoaderAccess(lid);
    return loader.getFormattedRun(runId);
  }
  @PostMapping("/runs/{runId}/complete")
  public Map<String, Object> completeRun(@PathVariable String runId, @RequestParam(required = false) String loaderId) {
    String lid = resolveLoaderId(loaderId);
    SecurityUtils.checkLoaderAccess(lid);
    loader.depart(runId);
    return loader.getFormattedRun(runId);
  }
  @PostMapping("/runs/{runId}/stops/{stopIndex}/load")
  public Map<String, Object> loadStop(@PathVariable String runId, @PathVariable int stopIndex) {
    Map<String, Object> r = loader.getFormattedRun(runId);
    @SuppressWarnings("unchecked")
    List<Map<String, Object>> stops = (List<Map<String, Object>>) r.get("stopsList");
    if (stopIndex >= 0 && stopIndex < stops.size()) {
      String orderRef = (String) stops.get(stopIndex).get("orderRef");
      if (orderRef != null) {
        loader.load(orderRef, true);
      }
    }
    return loader.getFormattedRun(runId);
  }
  @PostMapping("/items/verify")
  public Map<String, Object> verifyItem(@RequestBody Map<String, Object> b) {
    String sku = (String) b.get("sku");
    String runId = (String) b.get("runId");
    if (sku != null) {
      loader.load(sku, true);
    }
    return runId != null ? loader.getFormattedRun(runId) : Map.of("success", true);
  }
  @PostMapping("/items/flag")
  public Map<String, Object> flagItem(@RequestBody Map<String, Object> b) {
    String sku = (String) b.get("sku");
    String reason = (String) b.get("reason");
    String note = (String) b.get("note");
    String photo = (String) b.get("photo");
    String runId = (String) b.get("runId");
    if (sku != null) {
      loader.flag(sku, reason, photo, note);
    }
    return runId != null ? loader.getFormattedRun(runId) : Map.of("success", true);
  }
  @PostMapping("/orders/{ref}/load")
  public Order load(@PathVariable String ref, @RequestBody Map<String, Boolean> b) {
    return loader.load(ref, Boolean.TRUE.equals(b.get("loaded")));
  }
  @PostMapping("/orders/{ref}/flag")
  public Order flag(@PathVariable String ref, @RequestBody Map<String, String> b) {
    return loader.flag(ref, b.get("issue"), b.get("photo"), b.get("notes"));
  }
  @PostMapping("/vehicles/{id}/depart")
  public Vehicle depart(@PathVariable String id) {
    return loader.depart(id);
  }
  @PostMapping("/runs/{runId}/signoff")
  public Map<String, Object> signoff(@PathVariable String runId, @RequestBody Map<String, String> b) {
    loader.depart(runId);
    return Map.of("success", true, "message", "Signoff complete", "runId", runId);
  }
  @GetMapping("/runs/{runId}/exceptions")
  public List<Map<String, Object>> exceptions(@PathVariable String runId) {
    return loader.exceptions(runId);
  }
  @PostMapping("/runs/{runId}/exceptions/{sku}/notify")
  public Map<String, Object> notifyException(@PathVariable String runId, @PathVariable String sku) {
    return Map.of("success", true, "notified", true, "sku", sku);
  }
  @GetMapping("/summary")
  public Map<String, Object> summary(@RequestParam(required = false) String loaderId) {
    String lid = resolveLoaderId(loaderId);
    SecurityUtils.checkLoaderAccess(lid);
    return loader.summary(lid);
  }
  @GetMapping("/profile")
  public Map<String, Object> profile(@RequestParam(required = false) String loaderId) {
    String lid = resolveLoaderId(loaderId);
    SecurityUtils.checkLoaderAccess(lid);
    return loader.profile(lid);
  }
  @GetMapping("/messages")
  public List<Map<String, Object>> messages(@RequestParam(required = false) String loaderId) {
    return List.of();
  }
  private String resolveLoaderId(String requested) {
    User u = SecurityUtils.getCurrentUser();
    if (u != null && !SecurityUtils.isDispatcher(u) && u.loaderId != null) return u.loaderId;
    if (requested != null && !requested.isBlank()) return requested;
    if (u != null && SecurityUtils.isDispatcher(u)) return "ALL";
    if (u != null && u.loaderId != null) return u.loaderId;
    return "LDR01";
  }
}
