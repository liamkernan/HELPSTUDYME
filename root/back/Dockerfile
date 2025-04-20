FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY . .

# build **package**, not just repackage
RUN ./mvnw -Dmaven.test.skip=true package

# run the JAR Spring Boot just produced
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY . .

RUN ./mvnw -Dmaven.test.skip=true package

CMD ["java", "-jar", "target/helpmestudy-1.0-SNAPSHOT.jar"]