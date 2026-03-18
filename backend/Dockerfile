# Folosim o imagine oficială de Java cu Maven pentru a construi aplicația
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
# Copiem fișierul pom.xml și descărcăm dependențele (ajută la cache)
COPY pom.xml .
RUN mvn dependency:go-offline -B
# Copiem tot codul sursă și construim aplicația
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: Rularea aplicației cu o imagine Java mai mică (JRE)
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
# Copiem fișierul .jar generat în etapa de build
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
# Comanda pentru a porni Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]