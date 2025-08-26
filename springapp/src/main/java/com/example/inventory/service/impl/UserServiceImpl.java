package com.example.inventory.service.impl;

import com.example.inventory.entity.User;
import com.example.inventory.repository.UserRepository;
import com.example.inventory.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    @Autowired

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User createUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public void deleteUserById(Long id) {
        userRepository.deleteById(id);
    }
    @Override
public User updateUser(Long id, User updatedUser) {
    return userRepository.findById(id)
            .map(existingUser -> {
                existingUser.setName(updatedUser.getName());
                existingUser.setEmail(updatedUser.getEmail());
                existingUser.setRole(updatedUser.getRole());
                existingUser.setPasswordHash(updatedUser.getPasswordHash());
                existingUser.setPhoneNumber(updatedUser.getPhoneNumber());
                // Add other fields to update as necessary
                return userRepository.save(existingUser);
            })
            .orElseThrow(() -> new RuntimeException("User not found with id " + id));
}

}
