package com.waypoint.oms.auth;
import com.waypoint.oms.common.Models.*;
import com.waypoint.oms.common.OutletRepo;
import com.waypoint.oms.common.UserRepo;
import com.waypoint.oms.security.JwtService;
import com.waypoint.oms.security.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.LinkedHashMap;
import java.util.Map;
@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final UserRepo users;
  private final OutletRepo outlets;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  public AuthController(UserRepo users, OutletRepo outlets, PasswordEncoder passwordEncoder, JwtService jwtService) {
    this.users = users;
    this.outlets = outlets;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }
  @PostMapping("/login")
  public Map<String, Object> login(@RequestBody Map<String, String> b) {
    String username = b.get("username") != null ? b.get("username").trim().toLowerCase() : "";
    String password = b.get("password") != null ? b.get("password").trim() : "";
    User u = users.findById(username).orElseThrow(
        () -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));
    boolean matches = false;
    if (u.password != null && (u.password.startsWith("$2a$") || u.password.startsWith("$2b$"))) {
      matches = passwordEncoder.matches(password, u.password);
    } else if (u.password != null && u.password.equals(password)) {
      matches = true;
      u.password = passwordEncoder.encode(password);
      users.save(u);
    }
    if (!matches) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
    }
    String token = jwtService.generateToken(u);
    User safe = safeUser(u);
    Map<String, Object> res = new LinkedHashMap<>();
    res.put("token", token);
    res.put("user", safe);
    if ("STORE_MANAGER".equalsIgnoreCase(u.role) && u.outletId != null) {
      Outlet outlet = outlets.findById(u.outletId).orElse(null);
      if (outlet != null) {
        res.put("store", outlet);
      }
    }
    return res;
  }
  @GetMapping("/me")
  public User me() {
    User u = SecurityUtils.getCurrentUser();
    if (u == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
    }
    return safeUser(u);
  }
  @GetMapping("/users/{userId}")
  public Map<String, Object> sessionForUser(@PathVariable String userId) {
    User u = users.findById(userId.trim().toLowerCase()).orElseThrow(
        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + userId));
    User safe = safeUser(u);
    Map<String, Object> res = new LinkedHashMap<>();
    res.put("user", safe);
    if (u.outletId != null) {
      outlets.findById(u.outletId).ifPresent(o -> res.put("store", o));
    }
    return res;
  }
  private User safeUser(User u) {
    User r = new User();
    r.id = u.id;
    r.name = u.name;
    r.role = u.role;
    r.outletId = u.outletId;
    r.loaderId = u.loaderId;
    r.vehicleId = u.vehicleId;
    return r;
  }
}
