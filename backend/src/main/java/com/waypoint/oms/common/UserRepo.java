package com.waypoint.oms.common;
import com.waypoint.oms.common.Models.*;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
public interface UserRepo extends MongoRepository<User, String> {
}
