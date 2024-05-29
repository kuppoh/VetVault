const { promiseUserPool } = require('../config/database');
const databaseController = {
    createPet: async (req, res) => {
        const pet = { // Will have to change based on the form that Kurtis makes
            Name: req.body.name,
            Birthdate: req.body.birthdate,
            Gender: req.body.gender,
            Specie: req.body.species,
            Breed: req.body.breed,
            Description: req.body.description
        };
        try {
            await promiseUserPool.query('INSERT INTO PET SET ?', pet);
            await promiseUserPool.query("INSERT INTO OWNERSHIP_INT (UserID, PetID, AuthorityID) VALUES (?, (SELECT PetID FROM PET WHERE Name = ?), 'A001')", [req.user.id, pet.Name]);
            res.redirect('/petIndex');
        } catch (error) {
            console.error(error);
            res.redirect('/petIndex');
        }
    },
    editPet: async (req, res) => {
        const petId = req.params.id;
        const userInput = req.body;
      
        try {
          const [rows] = await promiseUserPool.query(`
            SELECT P.*, M.MedName, M.Description as MedDescription, C.BodyPart, C.Symptom, C.Description as ConDescription, W.Weight, W.Date, U.name as UserName
            FROM PET P 
            LEFT JOIN PET_MED_INT PMI ON P.PetID = PMI.PetID
            LEFT JOIN MEDICATION M ON PMI.MedID = M.MedID
            LEFT JOIN PET_CON_INT PCI ON P.PetID = PCI.PetID
            LEFT JOIN CONDITIONS C ON PCI.ConditionID = C.ConditionID
            LEFT JOIN WEIGHTCHECK W ON P.PetID = W.PetID
            LEFT JOIN OWNERSHIP_INT OI ON P.PetID = OI.PetID
            LEFT JOIN users U ON OI.UserID = U.ID
            WHERE P.PetID = ?
          `, [petId]);
      
          const currentInfo = rows[0] || {
            Name: '',
            Gender: '',
            BirthDate: null,
            Specie: '',
            Breed: '',
            Description: '',
            MedName: '',
            MedDescription: '',
            BodyPart: '',
            Symptom: '',
            ConDescription: '',
            Weight: null,
            UserName: ''
          };
      
          // Populate empty fields in userInput with currentInfo or defaults
          for (const key in userInput) {
            if (!userInput[key]) {
              userInput[key] = currentInfo[key] || '';
            }
          }
      
          const {
            Name = currentInfo.Name,
            Gender = currentInfo.Gender,
            BirthDate = currentInfo.BirthDate,
            Specie = currentInfo.Specie,
            Breed = currentInfo.Breed,
            Description = currentInfo.Description,
            MedName = currentInfo.MedName,
            MedDescription = currentInfo.MedDescription,
            BodyPart = currentInfo.BodyPart,
            Symptom = currentInfo.Symptom,
            ConDescription = currentInfo.ConDescription,
            Weight = currentInfo.Weight,
            UserName = currentInfo.UserName
          } = userInput;
      
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
                P.Specie = ?,
                P.Breed = ?,
                P.Description = ?,
                M.MedName = ?,
                M.Description = ?,
                C.BodyPart = ?,
                C.Symptom = ?,
                C.Description = ?,
                W.Weight = ?,
                U.name = ?
            WHERE P.PetID = ?
          `, [Name, Gender, BirthDate, Specie, Breed, Description, MedName, MedDescription, BodyPart, Symptom, ConDescription, Weight, UserName, petId]);
      
          res.redirect('/petProfile/' + petId);
          console.log("Final userInput:", {
            Name,
            Gender,
            BirthDate,
            Specie,
            Breed,
            Description,
            MedName,
            MedDescription,
            BodyPart,
            Symptom,
            ConDescription,
            Weight,
            UserName
          });
          
        } catch (error) {
          console.error(error);
          res.status(500).send('Error updating pet');
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
        console.log("getPetbyID called")
        try {
          const petId = req.params.id;
      
          // Fetch basic pet information
          const [petInfoRows] = await promiseUserPool.query('SELECT * FROM Pet_View WHERE PetID = ?', [petId]);
          req.petInfo = petInfoRows.length > 0 ? petInfoRows[0] : null;
      
          // Fetch pet image
          const [petImageRows] = await promiseUserPool.query('SELECT * FROM Pet_Image_Tag_List WHERE PetID = ?', [petId]);
          req.petImage = petImageRows.length > 0 ? petImageRows[0] : null;
      
          // Fetch detailed pet information
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
          `, [petId]);
      
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

            const [petInfo] = await promiseUserPool.query('SELECT * FROM Pet_View WHERE UserID = ?', userId);

            if (petInfo.length > 0) {
                req.petInfo = petInfo[0];
            }

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
                req.pets = [];
                next();
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
        console.log("getLatestWeightCheck called")
        try {
        const [results] = await promiseUserPool.query('SELECT * FROM WEIGHTCHECK wc WHERE wc.PetID = ? ORDER BY wc.WCID DESC LIMIT 1', [req.params.id]);
        if (results.length > 0) {
            req.weight = results[0];
            next();
        } else {
            req.weight = null;
            next();
        } } catch (err) {
            console.error(err);
            res.status(500).send('Error getting weight check');
        }
},
    getPreivousWeightCheck: async (req, res, next) => {
        console.log("getPreviousWeightCheck called")
        try {
            const [results] = await promiseUserPool.query(`SELECT * FROM (
                SELECT * FROM WEIGHTCHECK wc WHERE wc.PetID = ? ORDER BY wc.WCID DESC LIMIT 2
            ) AS subquery ORDER BY WCID ASC LIMIT 1`, [req.params.id]);
            if (results.length > 0) {
                req.prevWeight = results[0];
                next();
            } else {
                req.prevWeight = null;
                next();
            } } catch (err) {
                console.error(err);
                res.status(500).send('Error getting weight check');
            }
    },
    getRemindersforPet: async (req, res, next) => {
        console.log("getRemindersforPet called");
        try {
          const petId = req.params.id;
      
          // Fetch messages
          const [messagesRows] = await promiseUserPool.query('SELECT * FROM Urgent_list WHERE PetID = ?', [petId]);
          req.messages = messagesRows.length > 0 ? messagesRows : [];
      
          // Fetch reminders
          const [rows] = await promiseUserPool.query('SELECT * FROM Reminder_List WHERE PetID = ?', [petId]);
          req.reminders = rows.length > 0 ? rows : [];
      
          next();
        } catch (error) {
          console.error(error);
          res.status(500).send('Error getting reminders');
        }
      },
    getPrescriptionsForPet: async (req, res, next) => {
        console.log("getPrescriptionsForPet called")
        try {
            const petId = req.params.id;

            const [rows] = await promiseUserPool.query('SELECT * FROM Prescription_Page WHERE PetID = ?', petId);

            if (rows.length > 0) {
                req.prescriptions = rows;
                next();
            } else {
                req.prescriptions = [];
                next();
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Error getting prescriptions');
        }
    }
};


module.exports = databaseController;