package com.waypoint.oms.security;
import com.waypoint.oms.common.Models.User;
import com.waypoint.oms.common.UserRepo;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
  private final JwtService jwtService;
  private final UserRepo userRepo;
  public JwtAuthFilter(JwtService jwtService, UserRepo userRepo) {
    this.jwtService = jwtService;
    this.userRepo = userRepo;
  }
  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String header = request.getHeader("Authorization");
    if (header != null && header.startsWith("Bearer ")) {
      String token = header.substring(7).trim();
      if (jwtService.isValid(token)) {
        String userId = jwtService.getUserId(token);
        User user = userRepo.findById(userId).orElse(null);
        if (user != null) {
          String roleName = user.role != null ? user.role : "ANONYMOUS";
          if (!roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName;
          }
          SimpleGrantedAuthority authority = new SimpleGrantedAuthority(roleName);
          UsernamePasswordAuthenticationToken auth =
              new UsernamePasswordAuthenticationToken(user, null, List.of(authority));
          SecurityContextHolder.getContext().setAuthentication(auth);
        }
      }
    }
    filterChain.doFilter(request, response);
  }
}
