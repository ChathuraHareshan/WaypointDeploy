package com.waypoint.oms.driver;
import com.waypoint.oms.security.SecurityUtils;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController
@RequestMapping("/api/driver")
public class DriverController {
  private final DriverService driver;
  public DriverController(DriverService driver) {
    this.driver = driver;
  }
  @GetMapping("/{vehicleId}/run")
  public Map<String, Object> run(@PathVariable String vehicleId) {
    SecurityUtils.checkDriverAccess(vehicleId);
    return driver.driverRun(vehicleId);
  }
  @GetMapping("/orders/{ref}/pod")
  public Map<String, Object> pod(@PathVariable String ref) {
    return driver.pod(ref);
  }
  @PostMapping("/{vehicleId}/sync")
  @SuppressWarnings("unchecked")
  public Map<String, Object> sync(@PathVariable String vehicleId, @RequestBody Map<String, Object> body) {
    SecurityUtils.checkDriverAccess(vehicleId);
    Object actions = body.get("actions");
    List<Map<String, Object>> list = actions instanceof List ? (List<Map<String, Object>>) actions : List.of();
    Map<String, Object> res = new LinkedHashMap<>();
    res.put("results", driver.sync(vehicleId, list));
    return res;
  }
}
