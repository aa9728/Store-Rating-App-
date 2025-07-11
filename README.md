A full-stack web application for rating and managing stores, built with React, Express.js, and SQLite. The app supports three user roles (Admin, Normal User, Store Owner) with role-based dashboards and permissions.
Frontend: React, Material-UI, Axios, React Router
Backend: Express.js, JWT, bcryptjs, express-validator, helmet, cors
Database: SQLite (via sqlite3 npm package)
Clone the Repository
git clone https://github.com/yourusername/store-rating-app.git
cd store-rating-app
2. Install Dependencies
npm install
cd server && npm install
cd ../client && npm install
cd ..
3. Initialize the Database
cd server
npm run init-db
cd ..
4. Start the Application
npm run dev
The backend will run on: http://localhost:5000
The frontend will run on: http://localhost:3000
5. Open the App in Your Browser
Go to http://localhost:3000 to use the app.
6. Default Admin Login
Email: admin@storeapp.com
Password: Admin@123
