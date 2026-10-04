package com.waypoint.oms.common;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import java.util.LinkedHashMap;
import java.util.Map;
@RestControllerAdvice
public class ApiExceptionHandler {
  private static ResponseEntity<Map<String, Object>> body(HttpStatus s, String msg) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("status", s.value());
    m.put("message", msg);
    return ResponseEntity.status(s).body(m);
  }
  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<Map<String, Object>> status(ResponseStatusException e) {
    HttpStatus s = HttpStatus.resolve(e.getStatusCode().value());
    return body(s != null ? s : HttpStatus.INTERNAL_SERVER_ERROR, e.getReason() != null ? e.getReason() : "Request failed");
  }
  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, Object>> other(Exception e) {
    return body(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected server error: " + e.getMessage());
  }
}
