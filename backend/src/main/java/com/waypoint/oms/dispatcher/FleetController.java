package com.waypoint.oms.dispatcher;
import com.waypoint.oms.common.Models.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController
@RequestMapping("/api/dispatcher")
public class FleetController {
  private final FleetService fleet;
  public FleetController(FleetService fleet) { this.fleet = fleet; }
  @GetMapping("/fleet")
  public Map<String, Object> fleet(@RequestParam(defaultValue = "Peliyagoda") String depot) { return fleet.fleetAnalytics(depot); }
  @PostMapping("/vehicles/{id}/status")
  public Vehicle status(@PathVariable String id, @RequestBody Map<String, String> b) { return fleet.updateVehicleStatus(id, b.get("status"), b.get("notes")); }
  @PostMapping("/vehicles/{id}/driver")
  public Vehicle driver(@PathVariable String id, @RequestBody Map<String, String> b) { return fleet.updateVehicleDriver(id, b.get("driver")); }
  @PostMapping("/vehicles/{id}/refuel")
  public Vehicle refuel(@PathVariable String id, @RequestBody Map<String, Number> b) {
    return fleet.refuelVehicle(id, b.get("amount") != null ? b.get("amount").doubleValue() : 0.0);
  }
}
