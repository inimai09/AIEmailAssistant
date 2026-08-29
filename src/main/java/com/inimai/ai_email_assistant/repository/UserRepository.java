package com.inimai.ai_email_assistant.repository;

import com.inimai.ai_email_assistant.entity.User;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
