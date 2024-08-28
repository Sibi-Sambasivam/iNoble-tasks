const express = require('express');
const db = require('./db');

const app = express();

app.use(express.json());

app.post('/add-employee', (req, res) => {
  const { name, email, mobile, experiences } = req.body;

 
  db.beginTransaction((err) => {
    if (err) throw err;

    
    const employeeQuery = 'INSERT INTO Employee (Name, Email, Mobile) VALUES (?, ?, ?)';
    db.query(employeeQuery, [name, email, mobile], (err, result) => {
      if (err) {
        return db.rollback(() => {
          res.send('Error inserting into Employee table');
        });
      }

      const empID = result.insertId; 

      
      const empExpQueries = experiences.map(exp => {
        return new Promise((resolve, reject) => {
          const expQuery = 'INSERT INTO EmpExp (Name, Years, EmpID) VALUES (?, ?, ?)';
          db.query(expQuery, [exp.name, exp.years, empID], (err, result) => {
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
            res.send('Employee and experience data inserted successfully');
          });
        })
        .catch(err => {
          db.rollback(() => {
            res.send('Error inserting into EmpExp table');
          });
        });
    });
  });
});


app.listen(3000, () => {
  console.log(`Server running on port 3000`);
});
