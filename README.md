# FlightBookingSystem w/ Angular

The Angular front end relies on a Dockerized microservice backend (API gateway exposed on port 9000) that is brought up via a single Docker Compose stack. Backend repository: https://github.com/kanchanraiii/FlightBookingSysWSecurity.

<p align="center">
  <img src="repository-media/eureka_server.png" alt="Eureka dashboard showing registered instances" />
  <br />
  <small>Figure 1. Eureka dashboard with registered instances</small>
</p>

Backend Overview: JWT-secured Spring Boot microservices behind an API Gateway (mapped to 9000 here) with Eureka discovery, Config Server, and flight/booking services on MongoDB. Core routes cover auth (`/api/auth/*`), public flight search/listing, and protected booking operations exposed through the gateway.

Frontend API calls traverse the gateway on port 9000 to the flight and booking services once the Docker stack is running.
