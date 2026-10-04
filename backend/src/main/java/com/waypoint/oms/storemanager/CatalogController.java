package com.waypoint.oms.storemanager;
import com.waypoint.oms.common.CatalogRepo;
import com.waypoint.oms.common.Models.CatalogItem;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
@RestController
@RequestMapping({"/api/catalog", "/catalog"})
public class CatalogController {
  private final CatalogRepo catalog;
  public CatalogController(CatalogRepo catalog) {
    this.catalog = catalog;
  }
  @GetMapping
  public List<CatalogItem> getCatalog() {
    return catalog.findByActiveTrueOrderBySortOrderAsc();
  }
}
