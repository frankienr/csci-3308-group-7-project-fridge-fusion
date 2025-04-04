# 📢 Fridge Fusion - Release Notes
## 🗓️ April 3, 2025

---

## ✨ Highlights and Features

- **Docker Compose Integration**
  - Set up and run the entire application with Docker Compose.
  - Run `docker-compose up` to get started!

- **User Registration Page**
  - Users can now **create an account** and securely register within the app.
  - Passwords are encrypted using **bcrypt.js** for added security.  

- **Database Tables Set Up** 
  - All essential database tables have been structured, including:  
    - Users (managing accounts)  
    - Ingredients (tracking available ingredients)  
    - Recipes (storing pulled recipes)
    - Users to ingredients
    - Ingredients to recipes
    - Users to users (friends)

- **Spoonacular API Integration**
  - Recipes are stored in the database for future reference.  

- **Basic Styling Implemented**
  - Improved UI with a **clean, modern design** using Handlebars.  
  - Responsive layout for both **desktop and mobile** users.  

---

## 🔧 Bug Fixes & Improvements
- Fixed minor issues with navigation bar styling.
- Optimized handlebar files for mobile responsiveness.
- Fixed the docker file to run properly.
- Added testing.
