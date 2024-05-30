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
            await promiseUserPool.query("INSERT INTO OWNERSHIP_INT (UserID, PetID, AuthorityID, ImageID) VALUES (?, (SELECT PetID FROM PET WHERE Name = ?), 'A001', 'I028')", [req.user.id, pet.Name]);
            res.redirect('/petIndex');
        } catch (error) {
            console.error(error);
            res.redirect('/petIndex');
        }
    },
    editPet:  async (req, res) => {
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

          
          console.log(Name, Gender, BirthDate, Breed, Description, UserName, petId, Weight, WeightDate);

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

          if (Weight !== "" && WeightDate !== "") {
              await promiseUserPool.query('INSERT INTO WEIGHTCHECK (PetID, Weight, Date) VALUES ((SELECT DISTINCT w.PetID FROM WEIGHTCHECK w JOIN PET p ON w.PetID = p.PetID WHERE p.Name = ?), ?, ?)',[Name, Weight, WeightDate]);
          }
          
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
