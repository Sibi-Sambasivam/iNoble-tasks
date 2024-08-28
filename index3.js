const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());


app.get('/employees', (req, res) => {
  const page = parseInt(req.query.page) || 1; 
  const pageSize = parseInt(req.query.pageSize) || 5; 


  if (page < 1 || pageSize < 1) {
    return res.send('Invalid page number or page size');
  }


  const offset = (page - 1) * pageSize;


  const filterCondition = 'Employee.Name LIKE ?';
  const filterValue = '%a%'; 

  const query = `
    SELECT Employee.EmpID, Employee.Name, Employee.Email, Employee.Mobile, EmpExp.Id as ExpID, EmpExp.Name as ExpName, EmpExp.Years
    FROM Employee
    LEFT JOIN EmpExp ON Employee.EmpID = EmpExp.EmpID
    WHERE ${filterCondition}
    LIMIT ? OFFSET ?
  `;

  db.query(query, [filterValue, pageSize, offset], (err, results) => {
    if (err) {
      return res.send('Error fetching employees and experiences');
    }

    
    const employees = {};
    results.forEach(row => {
      if (!employees[row.EmpID]) {
        employees[row.EmpID] = {
          EmpID: row.EmpID,
          Name: row.Name,
          Email: row.Email,
          Mobile: row.Mobile,
          Experiences: []
        };
      }
      if (row.ExpID) { 
        employees[row.EmpID].Experiences.push({
          Id: row.ExpID,
          Name: row.ExpName,
          Years: row.Years
        });
      }
    });

   
    const formattedResults = Object.values(employees);

    res.json(formattedResults);
  });
});


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
          db.query(updateExpQuery, [exp.name, exp.years, exp.id, empID], (err, result) => {
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
