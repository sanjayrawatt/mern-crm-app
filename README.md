# MERN Stack CRM Application

A full-stack Customer Relationship Management (CRM) application designed to manage customers, leads, and sales opportunities. Built from the ground up using the MERN stack (MongoDB, Express.js, React, Node.js).

## Live Demo
*(Live link will be added in some time, for now you can check out these screenshots)*


## Features
- **User Authentication:** Secure user registration and login with JWT (JSON Web Tokens).
- **Customer Management:** Full CRUD (Create, Read, Update, Delete) functionality for customer records.
- **Sales Pipeline:** Manage sales opportunities through distinct stages (Qualification, Proposal, Negotiation, Closed Won/Lost).
- **File Attachments:** Upload and attach important documents (contracts, proposals) to opportunities.
- **Activity Logging:** Automatic, time-stamped audit trail for all major actions on a record.
- **Search and Pagination:** Efficiently search and navigate through large sets of data.

## Tech Stack
- **Frontend:** React, React Router, Context API
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT) & bcrypt
- **File Handling:** Multer

## Getting Started

### Prerequisites
- Node.js (v18.x or later)
- npm
- MongoDB (local instance or a cloud service like MongoDB Atlas)

### Installation & Setup

1.  **Clone the repository:**
    ```
    git clone https://github.com/sanjayrawatt/mern-crm-app.git
    cd mern-crm-app
    ```

2.  **Setup Backend:**
    - Navigate to the backend folder: `cd backend`
    - Install dependencies: `npm install`
    - Create a `.env` file and add the following variables:
      ```
      MONGO_URI=your_mongodb_connection_string
      JWT_SECRET=your_jwt_secret_key
      ```
    - Start the backend server: `npm start`

3.  **Setup Frontend:**
    - In a new terminal, navigate to the frontend folder: `cd frontend`
    - Install dependencies: `npm install`
    - Start the React development server: `npm run dev`

The application should now be running at `http://localhost:5173`.

## Project Structure
```
/mern-crm-app
├── /backend
│   ├── /models       # Mongoose schemas
│   ├── /routes       # API routes
│   ├── /middleware   # Auth middleware
│   ├── /services     # Helper services (e.g., activity logger)
│   └── server.js     # Express server entry point
└── /frontend
    ├── /src
    │   ├── /components # React components
    │   ├── /context    # AuthContext
    │   ├── /pages      # Main page components
    │   └── App.jsx     # Main app layout and routing
```
```

