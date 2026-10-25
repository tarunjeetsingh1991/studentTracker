package com.studenttracker.config;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.studenttracker.model.Student;
import com.studenttracker.repository.StudentRepository;

@Configuration
public class AppConfig {
  @Bean
  CommandLineRunner seed(StudentRepository repo) {
    return args -> {
      try (BufferedReader br = new BufferedReader(
          new InputStreamReader(new ClassPathResource("students.csv").getInputStream(), StandardCharsets.UTF_8))) {
        br.readLine();
        String line;
        while ((line = br.readLine()) != null) {
          String[] x = line.split(",", -1);
          int roll = Integer.parseInt(x[1]);
          if (!repo.existsByClassCodeAndRollNumber(x[0], roll))
            repo.save(new Student(x[0], roll, x[2], x[3]));
        }
      }
    };
  }

  @Bean
  WebMvcConfigurer cors(@Value("${app.cors.origin}") String origin) {
    return new WebMvcConfigurer() {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**").allowedOrigins(origin).allowedMethods("GET", "PUT", "OPTIONS");
      }
    };
  }
}
