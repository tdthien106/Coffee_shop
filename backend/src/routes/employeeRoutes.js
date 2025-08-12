import { Router } from "express";

import EmployeeController from '../controllers/employeeController.js'

const employeeRoutes = Router(); 

employeeRoutes.get('/employees', EmployeeController.getAllEmployees);
employeeRoutes.get('/employees/:id', EmployeeController.getEmployeeById);
employeeRoutes.post('/employees', EmployeeController.createEmployee);
employeeRoutes.put('/employees/:id', EmployeeController.updateEmployee);
employeeRoutes.delete('/employees/:id', EmployeeController.deleteEmployee);
employeeRoutes.get('/employees/user/:userId', EmployeeController.getEmployeeByUserId);

export default employeeRoutes;