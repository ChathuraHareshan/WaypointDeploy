package com.waypoint.oms.dispatcher;
import com.waypoint.oms.common.*;
import com.waypoint.oms.common.Models.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController
@RequestMapping("/api/dispatcher")
public class AllocationController {
  private final AllocationService allocation;
  private final AutoAllocationService auto;
  private final BoardService board;
  public AllocationController(AllocationService allocation, AutoAllocationService auto, BoardService board) {
    this.allocation = allocation;
    this.auto = auto;
    this.board = board;
  }
  private static String text(Map<String, ?> b, String key) {
    Object v = b == null ? null : b.get(key);
    if (v == null || String.valueOf(v).isBlank()) throw TripPlanner.invalid(key + " is required");
    return String.valueOf(v);
  }
  @GetMapping("/board")
  public Map<String, Object> board(@RequestParam(defaultValue = "Peliyagoda") String depot) { return board.board(depot); }
  @PostMapping("/allocations")
  public Order assign(@RequestBody Map<String, Object> b) {
    int trip = b.get("trip") instanceof Number ? ((Number) b.get("trip")).intValue() : 1;
    return allocation.assign(text(b, "orderRef"), text(b, "vehicleId"), trip);
  }
  @DeleteMapping("/allocations/{ref}")
  public Order unassign(@PathVariable String ref) { return allocation.unassign(ref); }
  @PostMapping("/allocations/auto")
  public Map<String, Object> autoAllocate(@RequestParam(defaultValue = "Peliyagoda") String depot,
                                          @RequestParam(defaultValue = "true") boolean deferUnplaced) {
    return auto.run(depot, deferUnplaced);
  }
  @PostMapping("/allocations/reset")
  public Map<String, Object> reset(@RequestParam(defaultValue = "Peliyagoda") String depot) { return allocation.resetAllocations(depot); }
  @PostMapping("/orders/{ref}/defer")
  public Order defer(@PathVariable String ref, @RequestBody(required = false) Map<String, String> b) {
    Map<String, String> m = b == null ? Map.of() : b;
    return allocation.defer(ref, m.get("reason"), m.get("notes"), m.get("rescheduleDate"));
  }
  @PostMapping("/orders/{ref}/reissue")
  public Order reissue(@PathVariable String ref) {
    return allocation.reissue(ref);
  }
  @PutMapping("/vehicles/{id}/loader")
  public Vehicle loader(@PathVariable String id, @RequestBody Map<String, String> b) { return allocation.setLoader(id, b.get("loaderId")); }
  @PutMapping("/trips/{vehicleId}/{trip}/sequence")
  public List<Map<String, Object>> sequence(@PathVariable String vehicleId, @PathVariable int trip, @RequestBody Map<String, List<String>> b) {
    return allocation.resequence(vehicleId, trip, b.getOrDefault("orderRefs", List.of()));
  }
}
