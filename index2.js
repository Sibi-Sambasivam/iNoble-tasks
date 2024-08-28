const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json()); 

app.post('/update-employee', (req, res) => {
  const { empID, name, email, mobile, experiences } = req.body;


  db.beginTransaction((err) => {
    if (err) throw err;


    const updateEmployeeQuery = 'UPDATE Employee SET Name = ?, Email = ?, Mobile = ? WHERE EmpID = ?';
    db.query(updateEmployeeQuery, [name, email, mobile, empID], (err, result) => {
      if (err) {
        return db.rollback(() => {
          res.send('Error updating Employee table');
        });
      }

      
      const empExpQueries = experiences.map(exp => {
        return new Promise((resolve, reject) => {
          const updateExpQuery = 'UPDATE EmpExp SET Name = ?, Years = ? WHERE Id = ? AND EmpID = ?';
          db.query(updateExpQuery, [exp.name, exp.years, exp.id, exp.empID], (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });
      });

      
      Promise.all(empExpQueries)
        .then(() => {
          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                res.send('Transaction failed');
              });
            }
            res.send('Employee and experience data updated successfully');
          });
        })
        .catch(err => {
          db.rollback(() => {
            res.send('Error updating EmpExp table');
          });
        });
    });
  });
});


app.listen(3000, () => {
  console.log(`Server running on port 3000`);
});
