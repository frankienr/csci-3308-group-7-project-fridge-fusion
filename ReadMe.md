# 🍽️ Fridge Fusion
Team 7 - The Chefs

## 📖 Description  
Fridge Fusion is a tool to help home cooks come up with a recipe based on what is available in their fridge. A user will be able to add all the ingredients that they have and Fridge Fusion will tell them recipes they can make. 

---

## 👥 Contributors
- Frankie Nuffer-Rodriguez
- Hanna Choi
- Robert Schmidt
- Rodrigo Franklin de Mello Nicastro

---

## 💻 Technology Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- Spoonacular API
- bcrypt.js

### Frontend
- HTML, CSS, JavaScript
- Handlebars (templating)

### Dev Tools and Misc
- Git & Github
- Dotenv

## ✅ Prerequisites
Before running the application, ensure you have the following installed on your machine:
- **[Node.js](https://nodejs.org/)** (v16+ recommended)  
- **[PostgreSQL](https://www.postgresql.org/)** (if using a local database)  
- **[Git](https://git-scm.com/)**

## 🚀 Running the Application Locally
1. **Clone the Repository**  
   ```sh
   git clone https://github.com/frankienr/csci-3308-group-7-project-fridge-fusion.git
   cd csci-3308-group-7-project-fridge-fusion/ProjectSourceCode
   ```

2. **Install Dependencies**
    ```npm install```

3. **Set Up Environment Variables**
[ADD ENV]

4. **Start the Application**
Docker Compose Up
Go to http://localhost:3000/
[ADD INSTRUCTIONS]

## 🧪 Running Tests
This project uses [Mocha](https://mochajs.org/) and [Chai](https://www.chaijs.com/) for testing backend functionality such as routes, authentication, views, and database logic.

### 📦 Prerequisites
Before running the tests, ensure you've installed all dependencies:
```bash
npm install
```
Also, make sure your development database is properly configured and running. If you're using Docker:

```bash
docker-compose up
```

### 🚀 Run the tests

To execute all tests, use the following command:

```bash
npm run testandrun
```

### ✅ Test Coverage

The tests currently cover:

- User registration and login routes
- Profile access (authenticated vs unauthenticated)
- View rendering using Handlebars
- Fridge and ingredient routes


## 🌍 Deployed Application
This application is deployed on Render, a cloud platform for hosting full-stack applications.

You can access the live version of the app here:
https://csci-3308-group-7-project-fridge-fusion.onrender.com/
