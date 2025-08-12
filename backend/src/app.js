import express from 'express';
import dotenv from 'dotenv';

import pool from './config/db.js';
import indexRoutes from './routes/indexRoutes.js';

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', indexRoutes);

pool.connect()
  .then(() => {
    console.log('✅✅✅Connected to the database successfully');
    app.listen(port, () => {
      console.log(`✅✅✅Server is running on http://localhost:${port}`);
    }); 
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

app.get('/', (req, res) => {
  pool.query('SELECT NOW()', (err, result) => {
    if (err) {
      console.error('Error executing query', err);
      res.status(500).send('Database query error');
    } else {
      res.send(`Current time: ${result.rows[0].now}`);
    }
  } );  
});

app.post('/', (req, res) => {
  const { name } = req.body;
  res.send(`Hello ${name}!`);
});