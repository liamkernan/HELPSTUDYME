# Use Java 17
FROM eclipse-temurin:17-jdk

# Set working directory
WORKDIR /app

# Copy everything into the container
COPY . .

# Build the Spring Boot jar
RUN ./mvnw -Dmaven.test.skip=true spring-boot:repackage

# Run the jar
CMD ["java", "-jar", "target/*.jar"]