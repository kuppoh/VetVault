const { promiseUserPool } = require("../config/database");

module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/auth/login");
  },

  forwardAuthenticated: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect("/dashboard");
  },

  isAdmin: async function (req, res, next) {
    if (!req.user) {
      return res.status(403).send("Access denied");
    }
  
    const userId = req.user.id;
    const query = "SELECT role FROM users WHERE id = ?";
  
    try {
      const [results] = await promiseUserPool.query(query, [userId]);
      if (results.length > 0 && results[0].role === "admin") {
        return next();
      }
      res.status(403).send("Access denied");
    } catch (error) {
      console.error("Error executing MySQL query:", error);
      res.status(500).send("Internal Server Error");
    }
  }
};