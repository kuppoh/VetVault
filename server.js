const express = require('express');
const { promiseUserPool } = require('./config/database');
const databaseRoute = require('./routes/databaseRoute');
const indexRoute = require('./routes/indexRoute');
const petRoute = require('./routes/petRoute');
const path = require("path");
const ejsLayouts = require("express-ejs-layouts");
const session = require("express-session");
const passport = require("./middleware/passport");
const { forwardAuthenticated } = require("./middleware/checkAuth");
const authController = require("./controller/auth_controller");
const fs = require('fs');
const notificationRoute = require('./routes/notificationsRoute');
const app = express(); 
const flash = require('connect-flash');
require('dotenv').config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(notificationRoute);
// Socket.io setup
const http = require('http');
const socketIO = require('socket.io');
const server = http.createServer(app);
const io = socketIO(server);

// Socket.io connection handling

const PORT = process.env.PORT || 3000;

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A client connected');
  const userId = socket.handshake.query.userId; // Make sure userId is passed on connection

  const fetchAndEmitNotifications = async () => {
      const [notifications] = await promiseUserPool.query(`
          SELECT Description FROM REMINDER R
          JOIN WEIGHTCHECK W ON R.WCID = W.WCID
          JOIN OWNERSHIP_INT O ON W.PetID = O.PetID
          WHERE O.UserID = ?;
      `, [userId]);
      io.to(socket.id).emit(`notification_${userId}`, { notifications });
      
  };

  const notificationInterval = setInterval(fetchAndEmitNotifications, 300);

  socket.on('disconnect', () => {
      console.log('A client disconnected');
      clearInterval(notificationInterval);
  });

  fetchAndEmitNotifications(); // Initial fetch
});
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
      secret: "secret",
      resave: true,
      saveUninitialized: true,
      cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
);
app.use(flash());  
// Use EJS layouts for rendering views
app.use(ejsLayouts);

// Initialize stuff
app.use(passport.initialize());
app.use(passport.session());
app.use(indexRoute);
app.use(databaseRoute);
app.use(petRoute);
// Set the view engine to EJS
app.set("view engine", "ejs");


app.get("/auth/login", authController.login);

// Ignore for now
app.get("/register", authController.register);
app.get("/login", forwardAuthenticated, authController.login );
app.post("/register", authController.registerSubmit);
app.post("/login", authController.loginSubmit);
app.get("/logout", authController.logout);
app.post("/logout", authController.logout);
app.get("/test", (req, res) => { 
  res.send("Test page");
}
);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { io }

