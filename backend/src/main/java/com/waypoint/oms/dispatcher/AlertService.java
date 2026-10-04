package com.waypoint.oms.dispatcher;
import com.waypoint.oms.common.Models.*;
import org.springframework.stereotype.Service;
import java.util.*;
@Service
public class AlertService {
  public List<Alert> build(List<Order> all, List<Vehicle> vs) {
    List<Alert> a = new ArrayList<>();
    int n = 1;
    long workshop = vs.stream().filter(v -> "in_workshop".equalsIgnoreCase(v.status)).count();
    long reeferDown = vs.stream().filter(v -> "in_workshop".equalsIgnoreCase(v.status) && "reefer".equalsIgnoreCase(v.temp)).count();
    if (workshop > 0) {
      a.add(new Alert("A" + n++, reeferDown > 0 ? "warning" : "info", "truck", workshop + " vehicle(s) in workshop",
        reeferDown + " refrigerated vehicle(s) unavailable today, so chilled capacity is reduced.", "now"));
    }
    long flagged = all.stream().filter(o -> o.flag != null && !o.flag.isBlank()).count();
    if (flagged > 0) {
      a.add(new Alert("A" + n++, "urgent", "alert", "Loader exceptions", flagged + " item(s) flagged by loaders before departure. Review the shortfall or re-allocate.", "now"));
    }
    long failed = all.stream().filter(o -> "FAILED".equals(o.delivery) || "SKIPPED".equals(o.delivery)).count();
    if (failed > 0) {
      a.add(new Alert("A" + n++, "urgent", "alert", "Failed or skipped deliveries", failed + " stop(s) were not delivered. Reschedule them from Deferrals.", "now"));
    }
    long damaged = all.stream().filter(o -> "Damaged".equalsIgnoreCase(o.issueType) || (o.issueType != null && o.issueType.toLowerCase().contains("damage")) || (o.claimType != null && o.claimType.toLowerCase().contains("damage"))).count();
    if (damaged > 0) {
      a.add(new Alert("A" + n++, "urgent", "alert", "Damaged goods reported", damaged + " order(s) completed with damaged items. Review damage reports & replacement logistics.", "now"));
    }
    long late = all.stream().filter(o -> o.late && "ALLOCATED".equals(o.status)).count();
    if (late > 0) {
      a.add(new Alert("A" + n++, "warning", "alert", "Late arrival risk", late + " stop(s) are planned to arrive after the outlet window closes. Re-sequence in Route Management.", "now"));
    }
    long repeat = all.stream().filter(o -> !"ALLOCATED".equals(o.status) && o.skipCount + o.deferredYesterday >= 2).count();
    if (repeat > 0) {
      a.add(new Alert("A" + n++, "warning", "alert", "Outlets skipped repeatedly", repeat + " outlet order(s) have been skipped two or more runs in a row. Prioritise them.", "now"));
    }
    long chilledWaiting = all.stream().filter(o -> "CONFIRMED".equals(o.status) && "chilled".equalsIgnoreCase(o.temp)).count();
    if (chilledWaiting > 0) {
      a.add(new Alert("A" + n++, "info", "truck", chilledWaiting + " chilled order(s) waiting", "These need a refrigerated vehicle with free capacity.", "now"));
    }
    long lowFuel = vs.stream().filter(v -> "available".equalsIgnoreCase(v.status) && v.fuelQuota > 0 && v.fuelLeft / v.fuelQuota < 0.15).count();
    if (lowFuel > 0) {
      a.add(new Alert("A" + n++, "warning", "truck", lowFuel + " vehicle(s) low on weekly fuel", "Less than 15% of the weekly quota remains. Allocation will reject trips that exceed it.", "now"));
    }
    for (Vehicle v : vs) {
      if (v.incident != null && !v.incident.isBlank()) {
        a.add(new Alert("A" + n++, "urgent", "truck", v.id + " reported an incident", v.incident + " (since " + v.incidentTime + "). Contact the driver.", v.incidentTime));
      }
    }
    if (a.isEmpty()) a.add(new Alert("A1", "info", "alert", "All clear", "No operational alerts right now.", "now"));
    return a;
  }
}
