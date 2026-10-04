package com.waypoint.oms.dispatcher;
import com.waypoint.oms.config.SeedService;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController
@RequestMapping("/api/dispatcher")
public class AnalyticsController {
  private final CapacityService capacity;
  private final FuelService fuel;
  private final ReportService reports;
  private final SeedService seed;
  public AnalyticsController(CapacityService capacity, FuelService fuel, ReportService reports, SeedService seed) {
    this.capacity = capacity;
    this.fuel = fuel;
    this.reports = reports;
    this.seed = seed;
  }
  @GetMapping("/capacity")
  public Map<String, Object> capacity(@RequestParam(defaultValue = "Peliyagoda") String depot) { return capacity.capacityAnalytics(depot); }
  @GetMapping("/fuel")
  public Map<String, Object> fuel(@RequestParam(defaultValue = "Peliyagoda") String depot) { return fuel.fuelAnalytics(depot); }
  @GetMapping("/reports")
  public Map<String, Object> reports(@RequestParam(defaultValue = "Peliyagoda") String depot) { return reports.reports(depot); }
  @PostMapping("/seed/reset")
  public Map<String, Object> reset() throws Exception {
    seed.reset();
    return Map.of("success", true, "message", "Database re-seeded from the initial datasets.");
  }
}
