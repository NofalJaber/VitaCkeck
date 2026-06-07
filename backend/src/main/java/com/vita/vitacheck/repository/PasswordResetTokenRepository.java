package com.vita.vitacheck.repository;

import com.vita.vitacheck.model.PasswordResetToken;
import com.vita.vitacheck.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByUser(User user);
    void deleteByUser_Id(Long userId);
}