package com.waypoint.oms.security;
import com.waypoint.oms.common.Models.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
@Service
public class JwtService {
  private final SecretKey key;
  private final long expirationMs;
  public JwtService(
      @Value("${security.jwt.secret:waypoint-super-secret-key-that-is-at-least-32-characters-long-2026}") String secret,
      @Value("${security.jwt.expiration-ms:86400000}") long expirationMs) {
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.expirationMs = expirationMs;
  }
  public String generateToken(User user) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("role", user.role);
    claims.put("name", user.name);
    claims.put("outletId", user.outletId);
    claims.put("loaderId", user.loaderId);
    claims.put("vehicleId", user.vehicleId);
    long now = System.currentTimeMillis();
    return Jwts.builder()
        .claims(claims)
        .subject(user.id)
        .issuedAt(new Date(now))
        .expiration(new Date(now + expirationMs))
        .signWith(key)
        .compact();
  }
  public Claims parseToken(String token) {
    return Jwts.parser()
        .verifyWith(key)
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }
  public String getUserId(String token) {
    return parseToken(token).getSubject();
  }
  public boolean isValid(String token) {
    try {
      Claims c = parseToken(token);
      return c.getExpiration().after(new Date());
    } catch (Exception e) {
      return false;
    }
  }
}
