const { promiseUserPool } = require('../config/database');
const databaseController = {
    createPet: async (req, res) => {
        const pet = { // Will have to change based on the form that Kurtis makes
            Name: req.body.name,
            Birthdate: req.body.birthdate,
            Gender: req.body.gender,
            Specie: req.body.specie,
            Breed: req.body.breed,
            Description: req.body.description
        };
        try {
            await promiseUserPool.query('INSERT INTO PET SET ?', pet);
            res.redirect('/petIndex');
        } catch (error) {
            console.error(error);
            res.redirect('/petIndex');
        }
    },
    editPet: async (req, res) => {
        let Name = req.body.name;
        let Gender = req.body.gender;
        let Specie = req.body.specie;
        let Breed = req.body.breed;
        let BirthDate = req.body.birthdate;
        let Description = req.body.description;
        let MedName = req.body.medName;
        let MedDescription = req.body.medDescription;
        let BodyPart = req.body.bodyPart;
        let Symptom = req.body.symptom;
        let ConDescription = req.body.conDescription;
        let Weight = req.body.weight;
        let WeightDate = req.body.weightDate;
        let UserName = req.body.userName;
        let petId = req.params.id;
        
        try {
            const [rows] = await promiseUserPool.query("SELECT P.*, M.MedName, M.Description as MedDescription, C.BodyPart, C.Symptom, C.Description as ConDescription, W.Weight, W.Date, U.name as UserName FROM PET P LEFT JOIN PET_MED_INT PMI ON P.PetID = PMI.PetID LEFT JOIN MEDICATION M ON PMI.MedID = M.MedID LEFT JOIN PET_CON_INT PCI ON P.PetID = PCI.PetID LEFT JOIN CONDITIONS C ON PCI.ConditionID = C.ConditionID LEFT JOIN WEIGHTCHECK W ON P.PetID = W.PetID LEFT JOIN OWNERSHIP_INT OI ON P.PetID = OI.PetID LEFT JOIN users U ON OI.UserID = U.ID WHERE P.PetID = ?", [petId]);
            const currentInfo = rows[0];

            if (Name === "") {
                Name = currentInfo.Name;
            }
            if (Gender === "") {
                Gender = currentInfo.Gender;
            }
            if (BirthDate === "") {
                BirthDate = currentInfo.BirthDate;
            }
            if (Specie === "") {
                Specie = currentInfo.Specie;
            }
            if (Breed === "") {
                Breed = currentInfo.Breed;
            }
            if (Description === "") {
                Description = currentInfo.Description;
            }
            if (MedName === "") {
                MedName = currentInfo.MedName;
            }
            if (MedDescription === "") {
                MedDescription = currentInfo.MedDescription;
            }
            if (BodyPart === "") {
                BodyPart = currentInfo.BodyPart;
            }
            if (Symptom === "") {
                Symptom = currentInfo.Symptom;
            }
            if (ConDescription === "") {
                ConDescription = currentInfo.ConDescription;
            }
            if (Weight === "") {
                Weight = currentInfo.Weight;
            }
            if (UserName === "") {
                UserName = currentInfo.UserName;
            }

            
            console.log(Name, Gender, BirthDate, Breed, Description, UserName, petId);

            await promiseUserPool.query(`
            UPDATE PET P
            LEFT JOIN PET_MED_INT PMI ON P.PetID = PMI.PetID
            LEFT JOIN MEDICATION M ON PMI.MedID = M.MedID
            LEFT JOIN PET_CON_INT PCI ON P.PetID = PCI.PetID
            LEFT JOIN CONDITIONS C ON PCI.ConditionID = C.ConditionID
            LEFT JOIN WEIGHTCHECK W ON P.PetID = W.PetID
            LEFT JOIN OWNERSHIP_INT OI ON P.PetID = OI.PetID
            LEFT JOIN users ON OI.UserID = users.id
            LEFT JOIN users U ON OI.UserID = U.ID
            SET P.Name = ?,
                P.Gender = ?,
                P.BirthDate = ?,
                P.Breed = ?,
                P.Description = ?,
                U.name = ?
            WHERE P.PetID = ?
        `, [Name, Gender, BirthDate, Breed, Description, UserName, petId]);
            
            // let Weight = req.body.weight; 

            // if (Weight !== "" && WeightDate !== "") {
            //     await promiseUserPool.query('INSERT INTO WEIGHTCHECK (PetID, Weight, Date) VALUES ((SELECT DISTINCT w.PetID FROM WEIGHTCHECK w JOIN PET p ON w.PetID = p.PetID WHERE p.Name = ?), ?, ?)',[Name, Weight, WeightDate]);
            // }
            
            res.redirect('/petProfile/' + petId);
        } catch (error) {
            console.error(error);
        }
    },
    deletePet: async (req, res) => {
        try {
            await promiseUserPool.query('DELETE FROM PET WHERE id = ?', req.params.id);
            res.redirect('/petIndex');
        } catch (error) {
            console.error(error);
            res.redirect('/petIndex');
        }
    },
    getPetbyID: async (req, res, next) => {
        try {
            const petId = req.params.id;

            const [petInfo] = await promiseUserPool.query('SELECT * FROM Pet_View WHERE PetID = ?', petId);

            if (petInfo.length > 0) {
                req.petInfo = petInfo[0];
            }

            const [rows] = await promiseUserPool.query(`
                SELECT P.*, PMI.Portion, PMI.Rate, PMI.Date as pmiDate, M.MedName, M.Description as MedDescription, C.BodyPart, C.Symptom, C.Description as ConDescription, W.Weight, W.Date, U.name as UserName
                FROM PET P
                LEFT JOIN PET_MED_INT PMI ON P.PetID = PMI.PetID
                LEFT JOIN MEDICATION M ON PMI.MedID = M.MedID
                LEFT JOIN PET_CON_INT PCI ON P.PetID = PCI.PetID
                LEFT JOIN CONDITIONS C ON PCI.ConditionID = C.ConditionID
                LEFT JOIN WEIGHTCHECK W ON P.PetID = W.PetID
                LEFT JOIN OWNERSHIP_INT OI ON P.PetID = OI.PetID
                LEFT JOIN users U ON OI.UserID = U.ID
                WHERE P.PetID = ?
                `, petId);
    
            if (rows.length > 0) {
                req.pet = rows[0];
                next();
            } else {
                res.status(404).send('Pet not found');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Error getting pet');
        }
    },
    getPetsbyUserID: async (req, res, next) => {
        try {
            const userId = req.user.id;  // Assuming the user's ID is stored in req.user.id

            const [rows] = await promiseUserPool.query(`
                SELECT *
                FROM PET P
                JOIN OWNERSHIP_INT OI ON P.PetID = OI.PetID
                WHERE OI.UserID = ?
                `, userId);
            
            if (rows.length > 0) {
                req.pets = rows;
                next();
            } else {
                res.status(404).send('No pets found for this user');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Error getting pets');
        }
    },
    checkIfEmailExists: async (email) => {
        const [rows] = await promiseUserPool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return true;
        } else {
            return false;
        }
    },
    getLatestWeightCheck: async (req, res, next) => {
        try {
        const [results] = await promiseUserPool.query('SELECT * FROM WEIGHTCHECK wc WHERE wc.PetID = ? ORDER BY wc.Date DESC LIMIT 1', [req.params.id]);
        if (results.length > 0) {
            req.weight = results[0];
            next();
        } else {
            res.status(404).send('Weight check not found');
        } } catch (err) {
            console.error(err);
            res.status(500).send('Error getting weight check');
        }
},
    getPreivousWeightCheck: async (req, res, next) => {
        try {
            const [results] = await promiseUserPool.query('SELECT * FROM WEIGHTCHECK wc WHERE wc.PetID = ? ORDER BY wc.Date DESC LIMIT 1, 1', [req.params.id]);
            if (results.length > 0) {
                req.prevWeight = results[0];
                next();
            } else {
                res.status(404).send('Weight check not found');
            } } catch (err) {
                console.error(err);
                res.status(500).send('Error getting weight check');
            }
    },
    getRemindersforPet: async (req, res, next) => {
        try {
            const petId = req.params.id;

            const [messagesRows] = await promiseUserPool.query('SELECT * FROM Urgent_list WHERE PetID = ?', petId);

            if (messagesRows.length > 0) {
                req.messages = messagesRows;
            }
            
            const [rows] = await promiseUserPool.query('SELECT * FROM Reminder_List WHERE PetID = ?', petId);

            if (rows.length > 0) {
                req.reminders = rows;
                next();
            } else {
                res.status(404).send('No reminders found for this pet');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Error getting reminders');
        }
    },
    getPrescriptionsForPet: async (req, res, next) => {
        try {
            const petId = req.params.id;

            const [rows] = await promiseUserPool.query('SELECT * FROM Prescription_Page WHERE PetID = ?', petId);

            if (rows.length > 0) {
                req.prescriptions = rows;
                next();
            } else {
                res.status(404).send('No prescriptions found for this pet');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Error getting prescriptions');
        }
    }
};


module.exports = databaseController;