FROM eclipse-temurin:17-jdk AS builder
WORKDIR /app

COPY pom.xml mvnw ./
COPY .mvn .mvn

RUN chmod +x mvnw \
 && ./mvnw dependency:go-offline -B

COPY src src
RUN ./mvnw -Dmaven.test.skip=true package -B

FROM eclipse-temurin:17-jdk
WORKDIR /app

COPY --from=builder /app/target/helpmestudy-1.0-SNAPSHOT.jar app.jar

ENTRYPOINT ["java","-jar","app.jar"]