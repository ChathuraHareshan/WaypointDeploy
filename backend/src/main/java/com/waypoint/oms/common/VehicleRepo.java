package com.waypoint.oms.common;
import com.waypoint.oms.common.Models.*;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
public interface VehicleRepo extends MongoRepository<Vehicle, String> {
  List<Vehicle> findByDepot(String v);
  List<Vehicle> findByLoaderId(String v);
  List<Vehicle> findByStatus(String v);
}
