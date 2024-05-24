const express = require('express');
const { promiseUserPool } = require('../config/database');
const io = require('socket.io')();

const router = express.Router();

// Keep track of all connected sockets
const sockets = new Set();

router.get('/homepage/:userID', async (req, res) => {
    try {
        const userID = req.params.userID;
        const [notifications] = await promiseUserPool.query(`
            SELECT Description FROM REMINDER R
            JOIN WEIGHTCHECK W ON R.WCID = W.WCID
            JOIN OWNERSHIP_INT O ON W.PetID = O.PetID
            WHERE O.UserID = ?;
        `, [userID]);
        res.render('notificationTest', { notifications, userId: userID });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error getting notifications');
    }
});



module.exports = router;


