package com.waypoint.oms.common;
import com.waypoint.oms.common.Models.CatalogItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
public interface CatalogRepo extends MongoRepository<CatalogItem, String> {
  List<CatalogItem> findByActiveTrueOrderBySortOrderAsc();
}
