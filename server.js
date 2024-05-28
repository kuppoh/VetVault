const express = require('express');
const { promiseUserPool } = require('./config/database');
(async () => {
  try {
    const [rows] = await promiseUserPool.query('SELECT 1');
    console.log('Database connection successful:', rows);
  } catch (error) {
    console.error('Database connection failed:', error);
  }
})();

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
const cors=require("cors");
app.use(cors());
const flash = require('connect-flash');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');

require('dotenv').config();
app.use(express.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json())
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
const sslCertPath = path.join(__dirname, process.env.SSL_CERT);
const options ={
  connectionLimit: 10,
  password: process.env.DB_PASSWORD,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  ssl: {
    ca: fs.readFileSync(sslCertPath)},
  createDatabaseTable: true,
  tableName: 'SESSIONS',
}



const sessionStore = new MySQLStore(options);

// Add the following line to catch any errors during the initialization of the session store
sessionStore.on('error', (error) => {
  console.error('Session store error:', error);
});

// Socket.io setup
const http = require('http');
const socketIO = require('socket.io');
const { create } = require('domain');
const server = http.createServer(app);
const io = socketIO(server);

// Socket.io connection handling

const PORT = process.env.PORT || 8080;


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

// for schedule
io.on('connection', (socket) => {
  let latestSchedules = {}; // Initialize latestSchedules to an empty object
  const userId = socket.handshake.query.userId;

  const pollSchedule = setInterval(async () => {
    // Query the database for all schedules for the specified user
    const [rows] = await promiseUserPool.query(
      'SELECT * FROM users.SCHEDULE S ' +
      'JOIN PET P ON S.PetID = P.PetID ' +
      'JOIN OWNERSHIP_INT O ON P.PetID = O.PetID ' +
      'WHERE O.UserID = ?',
      [userId]
    );

    // For each schedule, if it's newer than the latest known schedule for the pet, emit a 'schedule_update' event
    rows.forEach(row => {
      if (!latestSchedules[row.PetID] || new Date(row.start) > new Date(latestSchedules[row.PetID].start)) {
        latestSchedules[row.PetID] = row;
        socket.emit(`schedule_update_${userId}`, row);
      }
    });
  }, 300); // Poll every 300 milliseconds

  socket.on('disconnect', () => {
    clearInterval(pollSchedule);
  });
});

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    store: sessionStore,
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

app.use(petRoute);
app.use(notificationRoute);

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
  console.log(`"Server running. Visit: http://localhost:8080/auth/login in your browser 🚀"`);
});

module.exports = { io }

