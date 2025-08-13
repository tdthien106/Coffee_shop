import { Router } from "express";

import EmployeeController from '../controllers/employeeController.js'

const employeeRoutes = Router(); 

employeeRoutes.get('/', EmployeeController.getAllEmployees);
employeeRoutes.get('/:id', EmployeeController.getEmployeeById);
employeeRoutes.post('/', EmployeeController.createEmployee);
employeeRoutes.put('/:id', EmployeeController.updateEmployee);
employeeRoutes.delete('/:id', EmployeeController.deleteEmployee);
employeeRoutes.get('/user/:userId', EmployeeController.getEmployeeByUserId);

export default employeeRoutes;