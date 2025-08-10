const express = require('express');
const routes = require('express').Router();
const userModel = require('../models/user.model');
const {getUsers, getUser, createUser, updateUser, deleteUser} = require('../controllers/user.controller.js');
const { get } = require('mongoose');


// Get users
routes.get('/', getUsers);  
routes.get('/:id', getUser);

// Create a new user
routes.post('/', createUser);

// Update a user
routes.put('/:id', updateUser);

// Delete a user
routes.delete('/:id', deleteUser);

module.exports = routes;