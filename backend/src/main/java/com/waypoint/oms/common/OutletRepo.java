package com.waypoint.oms.common;
import com.waypoint.oms.common.Models.*;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
public interface OutletRepo extends MongoRepository<Outlet, String> {
  List<Outlet> findByDepot(String v);
  List<Outlet> findByBrand(String v);
}
