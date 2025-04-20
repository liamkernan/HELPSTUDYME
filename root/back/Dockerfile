FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY . .

RUN ./mvnw -Dmaven.test.skip=true package

FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY . .

RUN ./mvnw -Dmaven.test.skip=true package

CMD ["java", "-jar", "target/helpmestudy-1.0-SNAPSHOT.jar"]