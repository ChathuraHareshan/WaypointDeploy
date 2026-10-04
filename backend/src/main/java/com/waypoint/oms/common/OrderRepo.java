package com.waypoint.oms.common;
import com.waypoint.oms.common.Models.*;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
public interface OrderRepo extends MongoRepository<Order, String> {
  List<Order> findByVehicleId(String v);
  List<Order> findByDepot(String v);
  List<Order> findByOutletId(String v);
  List<Order> findByStatus(String v);
}
