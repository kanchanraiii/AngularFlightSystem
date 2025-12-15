# FlightBookingSystem w/ Angular

The Angular front end relies on a Dockerized microservice backend (API gateway exposed on port 9000) that is brought up via a single Docker Compose stack. Backend repository: https://github.com/kanchanraiii/FlightBookingSysWSecurity.

<p align="center">
  <img src="repository-media/eureka_server.png" alt="Eureka dashboard showing registered instances" />
  <br />
  <small>Figure 1. Eureka dashboard with registered instances</small>
</p>

Backend Overview: JWT-secured Spring Boot microservices behind an API Gateway (mapped to 9000 here) with Eureka discovery, Config Server, and flight/booking services on MongoDB. Core routes cover auth (`/auth/*`), public flight search/listing, and protected booking operations exposed through the gateway.

Frontend API calls traverse the gateway on port 9000 to the flight and booking services once the Docker stack is running.

## Frontend Authorization Flow

<p align="center">
  <img src="repository-media/authorization_flow.png" alt="Eureka dashboard showing registered instances" />
  <br />
  <small>Figure 2. JWT Authorization Flowchart</small>
</p>

In production  the login/register forms call the gateway, capture the JWT, and store it in localStorage plus an in-memory signal. An HTTP interceptor attaches `Authorization: Bearer <token>` to every request. A guard blocks the protected route when no token is present and redirects to login; the protected page reflects the live session and provides logout, which clears storage and state so subsequent navigation requires re-authentication.

## User History Feature Showcase
User history uses the stored JWT and email from session to call `/booking/api/booking/history/{email}`, then cross-references `/flight/api/flight/getAllFlights` to show route details. 
<p align="center">
  <img src="repository-media/user_history_demo.gif" alt="User history preview" />
  <br />
  <small>Figure 3. User history preview</small>
</p>

## Search Flights Showcase
Search flights uses cached flight data from `/flight/api/flight/getAllFlights` with inline typeahead suggestions (no dropdowns). 
<p align="center">
  <img src="repository-media/search_flight_demo.gif" alt="Search flights preview" />
  <br />
  <small>Figure 4. Search flights preview</small>
</p>
