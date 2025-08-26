package com.example.inventory.service;

import com.example.inventory.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    User createUser(User user);
    User updateUser(Long id, User updatedUser);
    Optional<User> getUserByEmail(String email);
    List<User> getAllUsers();
    Optional<User> getUserById(Long id);
    void deleteUserById(Long id);
}
