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
        console.log("Initial userInput:", userInput);
    
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
    
            // Update only non-empty fields from userInput
            const updatedFields = {
                Name: userInput.name || currentInfo.Name,
                Gender: userInput.gender || currentInfo.Gender,
                BirthDate: userInput.birthdate || currentInfo.BirthDate,
                Specie: userInput.specie || currentInfo.Specie,
                Breed: userInput.breed || currentInfo.Breed,
                Description: userInput.description || currentInfo.Description,
                MedName: userInput.medName || currentInfo.MedName,
                MedDescription: userInput.medDescription || currentInfo.MedDescription,
                BodyPart: userInput.bodyPart || currentInfo.BodyPart,
                Symptom: userInput.symptom || currentInfo.Symptom,
                ConDescription: userInput.conDescription || currentInfo.ConDescription,
                Weight: userInput.weight || currentInfo.Weight,
                UserName: userInput.userName || currentInfo.UserName
            };
    
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
            `, [updatedFields.Name, updatedFields.Gender, updatedFields.BirthDate, updatedFields.Specie, updatedFields.Breed, updatedFields.Description, updatedFields.MedName, updatedFields.MedDescription, updatedFields.BodyPart, updatedFields.Symptom, updatedFields.ConDescription, updatedFields.Weight, updatedFields.UserName, petId]);
    
            res.redirect('/petProfile/' + petId);
            console.log("Final userInput:", updatedFields);
            
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
        console.log("getPetsbyUserID called")
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
    },
    createPrescription: async (req, res) => {
        console.log("createPrescription called");
        const prescriptionInfo = {
            MedName: req.body.medName,
            Description: req.body.description
        };
        console.log(req.body);
        try {
            const [currentMeds] = await promiseUserPool.query('SELECT * FROM MEDICATION WHERE MedName = ?', req.body.medName);
            if (currentMeds.length === 0) { // If the medication does not exist in the database, insert it
                await promiseUserPool.query("INSERT INTO MEDICATION SET `MedName` = ?, `Description` = ?", [req.body.medName, req.body.description]);
            }
    
            const [pet] = await promiseUserPool.query('SELECT * FROM PET WHERE PetID = ?', req.body.petName); // Assuming PetID is used in the dropdown
            console.log(pet);
            if (pet.length === 0) {
                throw new Error(`Pet not found for ID: ${req.body.petName}`);
            }
            
            await promiseUserPool.query("INSERT INTO PET_MED_INT (PetID, MedID, Portion, Rate, Date) VALUES (?, (SELECT MedID FROM MEDICATION WHERE MedName = ?), ?, ?, ?)", [pet[0].PetID, req.body.medName, req.body.portion, req.body.rate, req.body.date]);
    
            res.redirect('/petProfile/' + req.body.petName);
        } catch (error) {
            console.error(error);
            res.status(500).send(`Error creating prescription: ${error.message}`);
        }
    },
    
    
    
    
    
};


module.exports = databaseController;