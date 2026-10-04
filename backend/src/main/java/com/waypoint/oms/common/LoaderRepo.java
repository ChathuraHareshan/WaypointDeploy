package com.waypoint.oms.common;
import com.waypoint.oms.common.Models.*;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
public interface LoaderRepo extends MongoRepository<Loader, String> {
  List<Loader> findByDepot(String v);
}
