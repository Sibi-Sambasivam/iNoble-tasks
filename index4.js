const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json()); 


app.get('/get-employee/:empID', (req, res) => {
  const empID = req.params.empID;


  db.beginTransaction((err) => {
    if (err) throw err;

   
    const employeeQuery = 'SELECT * FROM Employee WHERE EmpID = ?';
    db.query(employeeQuery, [empID], (err, employeeResult) => {
      if (err) {
        return db.rollback(() => {
          res.send('Error fetching from Employee table');
        });
      }

      if (employeeResult.length === 0) {
        return res.send('Employee not found');
      }

   
      const empExpQuery = 'SELECT * FROM EmpExp WHERE EmpID = ?';
      db.query(empExpQuery, [empID], (err, empExpResult) => {
        if (err) {
          return db.rollback(() => {
            res.send('Error fetching from EmpExp table');
          });
        }

       
        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              res.send('Transaction failed');
            });
          }

        
          res.json({
            employee: employeeResult[0],
            experiences: empExpResult
          });
        });
      });
    });
  });
});


app.listen(3000, () => {
  console.log(`Server running on port 3000`);
});
