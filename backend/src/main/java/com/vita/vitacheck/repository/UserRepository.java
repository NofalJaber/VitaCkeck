package com.vita.vitacheck.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vita.vitacheck.model.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByCnp(String cnp);
    Optional<User> findByPhoneNumber(String phoneNumber);
}
