package com.waypoint.oms.config;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.waypoint.oms.common.*;
import com.waypoint.oms.common.Models.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.io.InputStream;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
@Component
public class SeedService implements CommandLineRunner {
  private final ObjectMapper mapper;
  private final OrderRepo orders;
  private final VehicleRepo vehicles;
  private final LoaderRepo loaders;
  private final OutletRepo outlets;
  private final DistrictRepo districts;
  private final AllowanceRepo allowances;
  private final UserRepo users;
  private final CatalogRepo catalog;
  private final PasswordEncoder passwordEncoder;
  public SeedService(ObjectMapper mapper, OrderRepo orders, VehicleRepo vehicles, LoaderRepo loaders, OutletRepo outlets,
                     DistrictRepo districts, AllowanceRepo allowances, UserRepo users, CatalogRepo catalog,
                     PasswordEncoder passwordEncoder) {
    this.mapper = mapper;
    this.orders = orders;
    this.vehicles = vehicles;
    this.loaders = loaders;
    this.outlets = outlets;
    this.districts = districts;
    this.allowances = allowances;
    this.users = users;
    this.catalog = catalog;
    this.passwordEncoder = passwordEncoder;
  }
  @Override
  public void run(String... args) throws Exception { load(false); }
  public void reset() throws Exception { load(true); }
  private void load(boolean force) throws Exception {
    seed("catalog", catalog, CatalogItem.class, force);
    seed("orders", orders, Order.class, force);
    seed("vehicles", vehicles, Vehicle.class, force);
    seed("loaders", loaders, Loader.class, force);
    seed("outlets", outlets, Outlet.class, force);
    seed("districts", districts, District.class, force);
    seed("allowances", allowances, Allowance.class, force);
    seedUsers(force);
    normalizeOrders();
  }
  private void seedUsers(boolean force) throws Exception {
    if (!force && users.count() > 0) {
      boolean updated = false;
      List<User> list = users.findAll();
      for (User u : list) {
        if (u.password != null && !u.password.startsWith("$2a$") && !u.password.startsWith("$2b$")) {
          u.password = passwordEncoder.encode(u.password);
          updated = true;
        }
      }
      if (updated) users.saveAll(list);
      return;
    }
    InputStream in = getClass().getResourceAsStream("/seed/users.json");
    if (in == null) return;
    if (force) users.deleteAll();
    List<User> list = mapper.readValue(in, mapper.getTypeFactory().constructCollectionType(List.class, User.class));
    for (User u : list) {
      if (u.password != null && !u.password.startsWith("$2a$") && !u.password.startsWith("$2b$")) {
        u.password = passwordEncoder.encode(u.password);
      }
    }
    users.saveAll(list);
  }
  private void normalizeOrders() {
    List<Order> list = orders.findAll();
    boolean dirty = false;
    String today = LocalDate.now(ZoneId.of("Asia/Colombo")).toString();
    String now = Instant.now().toString();
    for (Order o : list) {
      if (o.placedAt == null) {
        o.placedAt = now;
        dirty = true;
      }
      if (o.deliveryDate == null) {
        o.deliveryDate = today;
        dirty = true;
      }
      if (o.lines == null || o.lines.isEmpty()) {
        List<OrderLine> lines = new ArrayList<>();
        int count = Math.max(1, o.units);
        lines.add(new OrderLine("gen-item-1", o.brand + " Standard Pack", o.brand + " Goods", "pack", o.temp, count));
        o.lines = lines;
        dirty = true;
      }
    }
    if (dirty) {
      orders.saveAll(list);
    }
  }
  private <T> void seed(String name, MongoRepository<T, String> repo, Class<T> type, boolean force) throws Exception {
    if (!force && repo.count() > 0) return;
    InputStream in = getClass().getResourceAsStream("/seed/" + name + ".json");
    if (in == null) return;
    if (force) repo.deleteAll();
    repo.saveAll(mapper.readValue(in, mapper.getTypeFactory().constructCollectionType(List.class, type)));
  }
}
