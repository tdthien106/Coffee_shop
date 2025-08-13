import EmployeeModel from "../models/employeeModel.js";

class EmployeeController {
  // GET all employees
  async getAllEmployees(req, res) {
    try {
      const employees = await EmployeeModel.findAll();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET employee by ID
  async getEmployeeById(req, res) {
    try {
      const employee = await EmployeeModel.findById(req.params.id);
      employee ? res.json(employee) : res.status(404).json({ error: 'Not found' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // POST create employee
  async createEmployee(req, res) {
    try {
      const newEmployee = await EmployeeModel.create(req.body);
      res.status(201).json(newEmployee);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }


  async updateEmployee(req, res) {
    try {
      if (req.body.salary && req.body.salary < 0) {
        return res.status(400).json({
          success: false,
          message: 'Salary must be positive'
        });
      }

      const updatedEmployee = await EmployeeModel.update(
        req.params.id,
        req.body
      );
      
      if (!updatedEmployee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      res.json({
        success: true,
        data: updatedEmployee
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteEmployee(req, res) {
    try {
      const deletedEmployee = await EmployeeModel.delete(req.params.id);
      
      if (!deletedEmployee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }

      res.json({
        success: true,
        data: deletedEmployee,
        message: 'Delete success full'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getEmployeeByUserId(req, res) {
    try {
      const employee = await EmployeeModel.findByUserId(req.params.user_id);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found for this user'
        });
      }
      res.json({
        success: true,
        data: employee
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new EmployeeController();