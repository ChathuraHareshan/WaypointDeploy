package com.waypoint.oms;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
public class OmsApplication {
  public static void main(String[] args) {
    SpringApplication.run(OmsApplication.class, args);
  }
}
