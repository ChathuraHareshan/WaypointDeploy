package com.waypoint.oms.common;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;
public class Models {
  @Document("orders")
  public static class Order {
    @Id
    public String orderRef;
    public String outletId;
    public String brand;
    public String district;
    public String depot;
    public String dockType;
    public String parking;
    public String mallWindow;
    public String windowOpen;
    public String windowClose;
    public String temp;
    public String status;
    public String vehicleId;
    public Integer trip;
    public String deferReason;
    public String rescheduleDate;
    public String notes;
    public int units;
    public int deferredYesterday;
    public int daysSinceLastServed;
    public double weightKg;
    public double volumeM3;
    public Integer seq;
    public int skipCount;
    public String placedAt;
    public String deliveryDate;
    public List<OrderLine> lines;
    public boolean deferAcknowledged;
    public boolean loaded;
    public String flag;
    @JsonIgnore public String flagPhoto;
    public String flagNotes;
    public String delivery;
    public String recipient;
    @JsonIgnore public String signature;
    @JsonIgnore public String photo;
    public Integer deliveredUnits;
    public String arrivedTime;
    public String issueType;
    public Double arrivalLat, arrivalLng;
    public List<String> actionIds;
    public String deliveryNote;
    public String deliveryTime;
    public String receipt;
    public String receiptNote;
    public String claimType;
    public String claimStatus;
    @Transient public Integer stop;
    @Transient public Integer stops;
    @Transient public String eta;
    @Transient public Double lat;
    @Transient public Double lng;
    @Transient public String outletName;
    @Transient public boolean pod;
    @Transient public String address;
    @Transient public String phone;
    @Transient public boolean late;
  }
  public static class OrderLine {
    public String itemId;
    public String name;
    public String product;
    public String unit;
    public String temp;
    public int qty;
    public OrderLine() {}
    public OrderLine(String itemId, String name, String product, String unit, String temp, int qty) {
      this.itemId = itemId;
      this.name = name;
      this.product = product;
      this.unit = unit;
      this.temp = temp;
      this.qty = qty;
    }
  }
  @Document("catalog")
  public static class CatalogItem {
    @Id
    public String id;
    public String name;
    public String product;
    public String unit;
    public String temp;
    public int sortOrder;
    public boolean active;
    public double weightKg;
    public double volumeM3;
  }
  @Document("vehicles")
  public static class Vehicle {
    @Id
    public String id;
    public String type;
    public String temp;
    public String depot;
    public String status;
    public String driver;
    public String loaderId;
    public double weightCap;
    public double volumeCap;
    public double kmPerL = 6.0;
    public double fuelQuota = 350.0;
    public double fuelLeft = 210.0;
    public String fuelType = "Diesel";
    public double odometerKm = 52000.0;
    public int healthScore = 95;
    public double nextServiceDueKm = 55000.0;
    public String maintenanceNotes;
    public String lastServiceDate;
    public boolean departed;
    public double speedKmh;
    public String lastPing;
    public String incident;
    public String incidentTime;
    public String returnedAt;
    public double currentLat;
    public double currentLng;
    public int progressPct = 0;
  }
  @Document("loaders")
  public static class Loader {
    @Id
    public String id;
    public String name;
    public String depot;
    public String phone;
    public String avatar;
  }
  @Document("outlets")
  public static class Outlet {
    @Id
    public String id;
    public String name;
    public String brand;
    public String district;
    public String depot;
    public String dockType;
    public String parking;
    public String mallWindow;
    public String windowOpen;
    public String windowClose;
    public double lat;
    public String phone;
    public double lng;
    public String address;
  }
  @Document("districts")
  public static class District {
    @Id
    public String district;
    public String depot;
    public int dtdMin;
    public int interMin;
    public double dtdKm;
    public double interKm;
    public double lat;
    public double lng;
    public String roadClass;
    public double freeFlowKmh;
  }
  @Document("allowances")
  public static class Allowance {
    @Id
    public String id;
    public int minutes;
  }
  @Document("users")
  public static class User {
    @Id
    public String id;
    public String name;
    public String password;
    public String role;
    public String outletId;
    public String loaderId;
    public String vehicleId;
  }
  public static class Alert {
    public String id;
    public String severity;
    public String icon;
    public String title;
    public String message;
    public String time;
    public Alert(String id, String severity, String icon, String title, String message, String time) {
      this.id = id; this.severity = severity; this.icon = icon; this.title = title; this.message = message; this.time = time;
    }
  }
}
