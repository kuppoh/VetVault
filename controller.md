### For Future References only


#### editPet controller in database_controller.js
Following code has all the joins and everything that needs to be updated (minus the prescriptions, rate of medication, the PMI table)

The following code also has the weight check functionality (if left empty, etc.)

Full code
```js
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

            
            console.log(Name, Gender, Specie, BirthDate, Breed, Description, MedName, MedDescription, BodyPart, Symptom, ConDescription, Weight, UserName, petId, WeightDate);
            await promiseUserPool.query(`
            UPDATE PET P
            LEFT JOIN PET_MED_INT PMI ON P.PetID = PMI.PetID
            LEFT JOIN MEDICATION M ON PMI.MedID = M.MedID
            LEFT JOIN PET_CON_INT PCI ON P.PetID = PCI.PetID
            LEFT JOIN CONDITIONS C ON PCI.ConditionID = C.ConditionID
            LEFT JOIN WEIGHTCHECK W ON P.PetID = W.PetID
            LEFT JOIN OWNERSHIP_INT OI ON P.PetID = OI.PetID
            LEFT JOIN users ON OI.UserID = users.id
            SET P.Name = ?,
                P.Gender = ?,
                P.Specie = ?,
                P.Birthdate = ?,
                P.Breed = ?,
                P.Description = ?,
                M.MedName = ?,
                M.Description = ?,
                C.BodyPart = ?,
                C.Symptom = ?,
                C.Description = ?,
                users.name = ?
            WHERE P.PetID = ?
        `, [Name, Gender, Specie, Birthdate, Breed, Description, MedName, MedDescription, BodyPart, Symptom, ConDescription, UserName, petId]);

                    // let Weight = req.body.weight; 

            if (Weight !== "" && WeightDate !== "") {
                await promiseUserPool.query('INSERT INTO WEIGHTCHECK (PetID, Weight, Date) VALUES ((SELECT DISTINCT w.PetID FROM WEIGHTCHECK w JOIN PET p ON w.PetID = p.PetID WHERE p.Name = ?), ?, ?)',[Name, Weight, WeightDate]);
            }
```