package com.waypoint.oms.common;
import com.waypoint.oms.common.Models.*;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
public interface DistrictRepo extends MongoRepository<District, String> {
  List<District> findByDepot(String v);
}
