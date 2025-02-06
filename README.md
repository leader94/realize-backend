# Realize Backend

**Realize Backend** is a NestJS-based backend server for the **Realize** Android application. It provides essential functionality for user authentication, content management, and integration with external services like YouTube and AWS S3. The server handles user data, allows secure content uploads, and offers a seamless experience for Realize users.

---

## Features

- 🔐 **User Authentication & Authorization** – Built with **Passport** and **JWT** to secure user access.  
- 🧑‍🤝‍🧑 **User CRUD Operations** – APIs for creating, reading, updating, and deleting user information.  
- ☁ **S3 Integration** – Provides secure signed URLs to the frontend for direct image/video uploads to AWS **S3**.  
- 💻 **Swagger Documentation** – Auto-generated API documentation for easy reference and testing.  
- 🎬 **YouTube API Integration** – Fetches and returns videos based on user search queries within the app.  
- 📧 **OTP Generation & Email** – Generates OTPs for user verification and sends them to users via email.  
- 🗄 **DynamoDB** – Uses DynamoDB for scalable and fast storage of user data.

---

## Tech Stack

- **NestJS** – Framework for building efficient, scalable Node.js applications.  
- **Passport** – Authentication middleware for handling login and authorization.  
- **JWT** – JSON Web Token for stateless authentication.  
- **DynamoDB** – AWS NoSQL database for storage.  
- **Swagger** – API documentation and testing.  
- **YouTube API** – For searching and returning videos based on user queries.  
- **AWS S3** – For secure media storage and direct uploads.  
- **Nodemailer** – For sending OTP emails to users.

---

## License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---
