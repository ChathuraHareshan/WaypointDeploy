package com.waypoint.oms.security;
import com.waypoint.oms.common.Models.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;
public class SecurityUtils {
  public static User getCurrentUser() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth != null && auth.getPrincipal() instanceof User u) {
      return u;
    }
    return null;
  }
  public static boolean isDispatcher(User u) {
    return u != null && "DISPATCHER".equalsIgnoreCase(u.role);
  }
  public static void checkLoaderAccess(String loaderId) {
    User u = getCurrentUser();
    if (u == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
    if (isDispatcher(u)) return;
    if (u.loaderId == null || !u.loaderId.equalsIgnoreCase(loaderId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden: you cannot access other loaders' runs");
    }
  }
  public static void checkDriverAccess(String vehicleId) {
    User u = getCurrentUser();
    if (u == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
    if (isDispatcher(u)) return;
    if (u.vehicleId == null || !u.vehicleId.equalsIgnoreCase(vehicleId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden: you cannot access other vehicles' runs");
    }
  }
  public static void checkStoreAccess(String outletId) {
    User u = getCurrentUser();
    if (u == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
    if (isDispatcher(u)) return;
    if (u.outletId == null || !u.outletId.equalsIgnoreCase(outletId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden: you cannot access other stores' data");
    }
  }
}
