const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json()); // to parse JSON bodies

// Endpoint to fetch employees with pagination and filtering
app.get('/employees', (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const pageSize = parseInt(req.query.pageSize) || 5; // Default to 5 rows per page

  // Validate page and pageSize
  if (page < 1 || pageSize < 1) {
    return res.status(400).send('Invalid page number or page size');
  }

  // Calculate offset
  const offset = (page - 1) * pageSize;

  // Filter query: find employees where the name contains 'a'
  const filterCondition = 'Name LIKE ?';
  const filterValue = '%a%'; // Filter for names containing 'a'

  const query = `
    SELECT * FROM Employee
    WHERE ${filterCondition}
    LIMIT ? OFFSET ?
  `;

  db.query(query, [filterValue, pageSize, offset], (err, results) => {
    if (err) {
      return res.status(500).send('Error fetching employees');
    }

    res.status(200).json(results);
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
