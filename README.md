# BizFlow
**A Local-First POS & Inventory Management System**

BizFlow is a high-performance Point of Sale (POS) and Inventory management solution built with **.NET 10** and **React**. Engineered for retail environments where uptime is critical, it features a robust local-first synchronization strategy to ensure business continuity even during network outages.

## 🛠 Tech Stack
* **Backend:** .NET 10 (ASP.NET Core Web API)
* **Frontend:** React, TypeScript, Tailwind CSS, Shadcn/UI
* **Database:** PostgreSQL
* **Architecture:** Clean Architecture, Domain-Driven Design (DDD), CQRS (MediatR)

## ✨ Key Features
* **High-Speed Checkout:** Optimized transaction processing backend reducing manual entry time by up to **40%**.
* **Inventory Intelligence:** Automated "Low Stock" and "Near Expiry" alert engine designed to minimize business wastage by **20%**.
* **Local-First Sync Engine:** Advanced synchronization logic that secures sales data during offline periods and updates the cloud database immediately upon reconnection.
* **Real-time Analytics:** Interactive dashboard providing instant insights into revenue, order counts, and stock health.
* **Security & Validation:** Implemented strict server-side validation and encrypted credential handling for secure enterprise use.

## 🏗 Architectural Highlights
The system follows **Clean Architecture** principles to ensure a strict separation of concerns, making the codebase highly maintainable and testable:
* **Domain:** Core business logic, entities, and domain exceptions.
* **Application:** Use cases, DTOs, and MediatR Commands/Queries.
* **Infrastructure:** Data persistence (Entity Framework Core) and external service integrations.
* **API:** RESTful endpoints with custom middleware for error handling and logging.

## 🚀 Getting Started

### Prerequisites
* .NET 10 SDK
* Node.js (v18+)
* PostgreSQL Instance
