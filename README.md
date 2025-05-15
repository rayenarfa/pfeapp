# 🎁 Gift Card Store Website

## 🚀 Overview

The **Gift Card Store** is a web application that allows admins to manage gift card products and users while enabling clients to browse and purchase gift cards. The project is built using **React (Vite) with TypeScript, Firebase, and Tailwind CSS**.

🔗 **Live Demo:** [Firebase Hosted URL](https://pfe2025-d05c3.web.app//)

## 📌 Features

### 🔑 Authentication

- Email/password authentication with Firebase
- Google authentication with Firebase
- Role-based access control:
  - **Admin:** Redirected to `/admin`
  - **Client:** Redirected to `/home`
- Error handling and toast notifications
- Dark mode support

### 🎁 Product Management (Admin)

- Add new gift card products
- Edit existing products
- Delete products
- Products are stored and managed in **Firestore**

### 👥 User Management (Admin)

- Add new users
- Edit user details
- Delete users

### 🏠 Client Features

- Browse available gift cards on the homepage
- Search and filter gift cards based on attributes (category, price, region)

## 🛠️ Technologies Used

- **Frontend:** React (Vite) + TypeScript
- **UI Styling:** Tailwind CSS v4
- **Backend & Database:** Firebase (Firestore for database, Authentication for user management)
- **Routing:** React Router

## 📁 Project Structure

```
/src
│── components/        # Reusable UI components (tables, forms, etc.)
│── firebase/          # Firebase configuration and authentication logic
│── pages/             # Application pages (SignIn, SignUp, Home, Admin Dashboard, etc.)
│── routes/            # App routing logic
│── utils/             # Utility functions (e.g., Firestore interactions)
│── App.tsx            # Main application component
│── main.tsx           # Entry point
```

## 🚀 Getting Started

### 🔧 Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/rayenarfa/pfe.git
   cd pfe
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up Firebase:

   - Create a Firebase project
   - Enable **Authentication** (Email/Password, Google Sign-In)
   - Set up **Firestore Database**
   - Configure **Firebase Hosting**
   - Copy your Firebase config to `firebase/firebaseConfig.ts`

4. Run the development server:
   ```sh
   npm run dev
   ```

### 🚀 Deployment (Firebase Hosting)

1. Build the project:
   ```sh
   npm run build
   ```
2. Deploy to Firebase:
   ```sh
   firebase deploy
   ```

## 📜 License

This project is open-source and available under the **MIT License**.

---

Feel free to contribute or report issues!


