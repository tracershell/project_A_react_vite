// /server/src/routes/admin/employees/employeeslistpage.js
const express = require('express');
const router = express.Router();
const db = require('../../../lib/db');

// GET all employees
router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM employees');
  res.json(rows);
});

// ADD employee
router.post('/add', async (req, res) => {
  const emp = req.body;
  await db.query(
    'INSERT INTO employees (eid, name, email) VALUES (?, ?, ?)',
    [emp.eid, emp.name, emp.email]
  );
  res.json({ success: true });
});

// EDIT employee
router.post('/edit/:eid', async (req, res) => {
  const { eid } = req.params;
  const emp = req.body;
  await db.query(
    'UPDATE employees SET name=?, email=? WHERE eid=?',
    [emp.name, emp.email, eid]
  );
  res.json({ success: true });
});

// DELETE employee
router.post('/delete/:eid', async (req, res) => {
  const { eid } = req.params;
  await db.query('DELETE FROM employees WHERE eid=?', [eid]);
  res.json({ success: true });
});

module.exports = router;
