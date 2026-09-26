# 🏥 Hospital Appointment Management System

A full-stack **Hospital Appointment Management System (HAMS)** designed to streamline hospital operations by connecting **administrators, doctors, and patients** through a centralized web application.

The system provides role-based dashboards for managing doctors, patients, appointments, prescriptions, billing, laboratory information, medical history, and other hospital workflows.

## 📑 Table of Contents

- [Project Overview](#-project-overview)

- [Key Features](#-key-features)

- [Technology Stack](#%EF%B8%8F-technology-stack)

- [System Architecture](#%EF%B8%8F-system-architecture)

- [Project Structure](#-project-structure)

- [Prerequisites](#%EF%B8%8F-prerequisites)

- [Database Setup](#%EF%B8%8F-database-setup)

- [Running the Application](#%EF%B8%8F-running-the-application)

- [API Architecture](#-api-architecture)

- [Role-Based Access](#-role-based-access)

- [Appointment Workflow](#-appointment-workflow)

- [Billing Workflow](#-billing-workflow)

- [Security](#-security)

- [Responsive UI](#-responsive-ui)

- [Project Goals](#-project-goals)

- [Future Enhancements](#-future-enhancements)

- [Testing](#-testing)

- [Development](#-development)

- [Project Status](#-project-status)

- [Developer](#-developer)

- [License](#-license)

## 🚀 Project Overview

The Hospital Appointment Management System is a modern full-stack web application built with a **React.js frontend**, **Spring Boot backend**, and **PostgreSQL database**.

The application follows a role-based architecture in which each user receives access to functionality relevant to their role.

### 👨‍💼 Administrator

Administrators can manage hospital operations through a centralized dashboard, including:

- Dashboard

- Doctor management

- Patient management

- Appointment management

- Prescription management

- Billing and payments

- Laboratory management

- Medical records

- Reports and analytics

- Notifications and alerts

### 👨‍⚕️ Doctor

Doctors have access to their own operational dashboard with features including:

- Dashboard

- Appointments

- My patients

- Prescriptions

- Billing and payments

- Lab results

- Medical history

- Reports

Doctors can view appointments assigned to them and access relevant patient and billing information.

### 👤 Patient

Patients have a dedicated dashboard with features including:

- Dashboard

- My appointments

- My profile

- Prescriptions

- Payments and billing

- Lab results

- Medical history

## ✨ Key Features

### 🔐 Authentication and Authorization

- User registration and login

- JWT-based authentication

- Role-based access control

- Protected frontend routes

- Separate dashboards for administrators, doctors, and patients

- Session-based authentication state

- Secure API authorization using Bearer tokens

### 👨‍⚕️ Doctor Management

- Add doctors

- View doctor records

- Update doctor information

- Delete doctors

- Manage doctor specializations

- Maintain doctor availability information

### 👤 Patient Management

- Add patients

- View patient information

- Update patient records

- Delete patient records

- Patient identification and profile management

- Medical history support

### 📅 Appointment Management

- Create appointments

- Assign doctors and patients

- Select an appointment department or specialization

- Schedule appointment dates and times

- Track appointment statuses

- Search appointments

- Filter by status, doctor, or department

- Edit and delete appointments

- Doctor confirmation workflow

- Display appointment information according to the user's role

### 💊 Prescription Management

- Manage prescriptions

- Associate prescriptions with patients and doctors

- View prescription information

- Access prescription records through role-specific dashboards

### 💳 Billing and Payments

- Create and manage billing records

- Manage doctor-specific billing records

- Display patient billing information

- Store invoice information

- Track total billing amount, paid amount, and due amount

- Display pending billing counts

- Track payment statuses

- Search billing records

- Filter billing records by payment status

- View detailed billing information in a modal

### 🧪 Laboratory Management

- Manage laboratory information

- Provide access to lab results

- Control lab information visibility according to user roles

### 📋 Medical Records

- Maintain patient medical histories

- Provide access to medical records

- Control patient information visibility according to user roles

### 📊 Dashboards

Each role has a dedicated dashboard containing relevant information and statistics.

**Administrator Dashboard**

- Hospital-level operational information

- Doctor statistics

- Patient statistics

- Appointment statistics

- Prescription information

**Doctor Dashboard**

- Doctor-specific appointments

- Patient information

- Billing information

- Prescription and medical information

**Patient Dashboard**

- Personal appointments

- Prescriptions

- Billing information

- Laboratory results

- Medical history

## 🛠️ Technology Stack

### Frontend

| Technology | Purpose |
| --- | --- |
| React.js | Frontend application |
| JavaScript | Application logic |
| Tailwind CSS | UI styling |
| Axios | API communication |
| React Router | Client-side routing |
| Lucide React | UI icons |

### Backend

| Technology | Purpose |
| --- | --- |
| Java | Backend programming language |
| Spring Boot | REST API development |
| Spring Data JPA | Database interaction |
| Spring Security | Authentication and authorization |
| JWT | Token-based authentication |
| Maven | Dependency management |

### Database

| Technology | Purpose |
| --- | --- |
| PostgreSQL | Relational database |
| SQL | Database queries |
| JPA/Hibernate | Object-relational mapping |

## 🏗️ System Architecture

```
                    ┌─────────────────────────┐
                    │        React.js         │
                    │       Frontend          │
                    └────────────┬────────────┘
                                 │
                                 │ REST API
                                 │
                    ┌────────────▼────────────┐
                    │      Spring Boot        │
                    │        Backend          │
                    ├─────────────────────────┤
                    │ REST Controllers        │
                    │ Services                │
                    │ Repositories            │
                    │ JWT Authentication      │
                    │ Role-Based Authorization│
                    └────────────┬────────────┘
                                 │
                                 │ JPA / Hibernate
                                 │
                    ┌────────────▼────────────┐
                    │       PostgreSQL        │
                    │        Database         │
                    └─────────────────────────┘
```

## 📁 Project Structure

```
Hospital-Appointment-Management-System/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── doctor/
│   │   │   └── user/
│   │   ├── context/
│   │   ├── routes/
│   │   ├── api/
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/
│   │       │       └── hams/
│   │       │           ├── controller/
│   │       │           ├── model/
│   │       │           ├── repository/
│   │       │           ├── service/
│   │       │           ├── security/
│   │       │           └── ...
│   │       └── resources/
│   │           └── application.properties
│   ├── pom.xml
│   └── ...
│
└── README.md
```

## ⚙️ Prerequisites

Make sure the following tools are installed:

- **Node.js**

- **npm**

- **Java JDK 21**

- **Maven**

- **PostgreSQL**

- **Git**

Verify the installations:

```bash
node --version
npm --version
java --version
mvn --version
git --version
```

## 🗄️ Database Setup

Create a PostgreSQL database for the application:

```sql
CREATE DATABASE hams;
```

Configure the database connection in:

```
backend/src/main/resources/application.properties
```

Example configuration:

```
spring.datasource.url=jdbc:postgresql://localhost:5432/hams
spring.datasource.username=YOUR_POSTGRES_USERNAME
spring.datasource.password=YOUR_POSTGRES_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

Replace the username and password with your local PostgreSQL credentials.

## ▶️ Running the Application

### Run the Backend

Navigate to the backend directory:

```bash
cd backend
```

Run the Spring Boot application:

```bash
mvn spring-boot:run
```

The backend runs at:

```
http://localhost:8080
```

### Run the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Start the React application:

```bash
npm start
```

The frontend runs at:

```
http://localhost:3000
```

## 🔗 API Architecture

The frontend communicates with the Spring Boot backend using REST APIs.

Major API areas include:

```
/api/auth
/api/doctors
/api/patients
/api/appointments
/api/prescriptions
/api/billing
```

The exact available endpoints may evolve as additional modules are implemented.

## 🔑 Role-Based Access

The application separates functionality according to the authenticated user's role.

```
                    Login
                      │
                      ▼
              JWT Authentication
                      │
                      ▼
               Role Verification
                 /     |     \
                /      |      \
               ▼       ▼       ▼
            ADMIN   DOCTOR   PATIENT
              │        │        │
              ▼        ▼        ▼
           Admin     Doctor   Patient
          Dashboard Dashboard Dashboard
```

This prevents users from accessing dashboard functionality that does not belong to their role.

## 📅 Appointment Workflow

The appointment workflow is designed around doctor-patient scheduling.

```
Admin / Patient
      │
      ▼
Create Appointment
      │
      ▼
Appointment Status
    PENDING
      │
      ▼
Assigned Doctor
      │
      ▼
Doctor Reviews
      │
      ├───────────────┐
      ▼               ▼
  CONFIRMED       CANCELLED
      │
      ▼
 Appointment
  Completed
```

New appointments can remain in a **pending** state until the assigned doctor confirms them.

## 💳 Billing Workflow

Billing information is associated with patients and doctors.

```
Billing Record
      │
      ├── Invoice Number
      ├── Patient
      ├── Doctor
      ├── Service
      ├── Amount
      ├── Discount
      ├── Tax
      ├── Total Amount
      ├── Paid Amount
      ├── Due Amount
      └── Payment Status
```

Doctors can view billing information associated with their patients.

## 🔒 Security

The application uses:

- JWT authentication

- Bearer token authorization

- Protected routes

- Role-based access control

- Session-based authentication state

- Backend authorization

Authentication tokens are attached to API requests through the frontend API configuration.

## 📱 Responsive UI

The frontend is designed using Tailwind CSS and supports responsive layouts for:

- Desktop

- Laptop

- Tablet

- Mobile

Dashboard sidebars, cards, tables, forms, and modals are designed to adapt to different screen sizes.

## 🎯 Project Goals

The main goals of HAMS are to:

- Digitize hospital appointment workflows

- Centralize patient and doctor information

- Simplify appointment scheduling

- Provide role-specific dashboards

- Manage prescriptions and medical information

- Track billing and payment information

- Improve accessibility of hospital records

- Provide a scalable foundation for additional hospital modules

## 🔮 Future Enhancements

Potential future improvements include:

- Real-time notifications

- Email notifications

- SMS appointment reminders

- Online payment gateway integration

- Advanced reports and analytics

- Hospital staff management

- Pharmacy management

- Medicine inventory

- Advanced laboratory workflows

- PDF invoice generation

- Prescription PDF generation

- Appointment calendar integration

- Improved audit logging

- Cloud deployment

- Docker containerization

- Production database configuration

## 🧪 Testing

The application can be tested by creating users with different roles and validating their respective workflows.

### Administrator

```
Login
→ Doctor Management
→ Patient Management
→ Appointment Management
→ Prescription Management
→ Billing & Payment
```

### Doctor

```
Login
→ Appointments
→ My Patients
→ Prescriptions
→ Billing & Payment
→ Lab Results
→ Medical History
```

### Patient

```
Login
→ My Appointments
→ Profile
→ Prescriptions
→ Payments & Billing
→ Lab Results
→ Medical History
```

## 🧑‍💻 Development

This project is being developed as a full-stack application with a modular architecture so that individual hospital modules can be developed and tested independently.

The frontend communicates with backend services through REST APIs, while PostgreSQL provides persistent data storage.

## 📌 Project Status

🚧 **Active Development**

Core functionality, including authentication, role-based dashboards, doctor management, patient management, appointment management, prescriptions, and billing workflows, is being developed and integrated progressively.

## 👨‍💻 Developer

**Dhaswanth Nag Prathi**
B.Tech — Computer Science & Engineering

### Technologies

```
React.js
Java
Spring Boot
PostgreSQL
JavaScript
REST APIs
JWT
Tailwind CSS
Git & GitHub
```

## 📄 License

This project is currently intended for **educational, portfolio, and demonstration purposes**.

---

⭐ If you find this project useful, consider giving the repository a star.
