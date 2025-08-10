const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const userModel = require('./models/user.model');
const userRouter = require('./router/user.route');

dotenv.config({ path: './.env' });

const app = express();
const port = process.env.PORT;
const mongodbUri = process.env.MONGODB_URI;

//midleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define routes
app.use('/api/users', userRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

mongoose.connect(mongodbUri)
.then(() => {
  console.log('Connected to database successfully');
  app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
}).catch(err => {
  console.error('Error connecting to database:', err);
});