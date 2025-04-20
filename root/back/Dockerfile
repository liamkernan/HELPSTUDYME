FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY . .

# build **package**, not just repackage
RUN ./mvnw -Dmaven.test.skip=true package

# run the JAR Spring Boot just produced
CMD ["java", "-jar", "target/*.jar"]