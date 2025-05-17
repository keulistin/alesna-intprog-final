const express = require('express');
const router = express.Router();
const db = require('../_helpers/db');
const authorize = require('../_middleware/authorize');
const Role = require('../_helpers/role');
const { Op } = require('sequelize');

router.post('/', authorize(Role.Admin), create);
router.get('/', authorize(), getAll);
router.get('/nextId', authorize(), getNextEmployeeId);
router.get('/:id', authorize(), getById);
router.get('/:id/with-details', authorize(), getWithDetails);
router.put('/:id', authorize(Role.Admin), update);
router.delete('/:id', authorize(Role.Admin), _delete);
router.post('/:id/transfer', authorize(Role.Admin), transfer);

async function create(req, res, next) {
  try {
    console.log('Creating employee with data:', JSON.stringify(req.body));
    
    // Check if employeeId is provided, if not generate one
    if (!req.body.employeeId) {
      const nextId = await generateNextEmployeeId();
      console.log('Generated next employee ID:', nextId);
      req.body.employeeId = nextId;
    }
    
    // Check if employee with this ID already exists
    const existingEmployee = await db.Employee.findOne({
      where: { employeeId: req.body.employeeId }
    });
    
    if (existingEmployee) {
      return res.status(400).json({ 
        message: `Employee with ID ${req.body.employeeId} already exists.` 
      });
    }
    
    // Check if employee already exists in this department
    if (req.body.departmentId) {
      const employeesInDepartment = await db.Employee.findAll({
        where: { 
          departmentId: req.body.departmentId,
          userId: req.body.userId
        }
      });
      
      if (employeesInDepartment.length > 0) {
        return res.status(400).json({ 
          message: 'This employee already exists in the specified department.' 
        });
      }
    }
    
    const employee = await db.Employee.create(req.body);
    console.log('Employee created successfully:', employee.id);
    
    // Create an onboarding workflow for the new employee
    await db.Workflow.create({
      employeeId: employee.id,
      type: 'Onboarding',
      details: JSON.stringify({
        task: 'Setup workstation',
        employeeId: employee.employeeId,
        position: employee.position
      })
    });
    
    res.status(201).json(employee);
  } catch (err) { 
    console.error('Error creating employee:', err);
    next(err); 
  }
}

async function getAll(req, res, next) {
  try {
    console.log('Getting all employees');
    const employees = await db.Employee.findAll({
      include: [
        { model: db.Account, as: 'User' }, 
        { model: db.Department }
      ]
    });
    console.log(`Found ${employees.length} employees`);
    
    // Log the structure of the first employee to debug
    if (employees.length > 0) {
      const firstEmp = employees[0];
      console.log('Sample employee data structure:', JSON.stringify({
        id: firstEmp.id,
        employeeId: firstEmp.employeeId,
        position: firstEmp.position,
        User: firstEmp.User ? { id: firstEmp.User.id, email: firstEmp.User.email } : null,
        Department: firstEmp.Department ? { id: firstEmp.Department.id, name: firstEmp.Department.name } : null
      }));
    }
    
    res.json(employees);
  } catch (err) { 
    console.error('Error getting all employees:', err);
    next(err); 
  }
}

async function getById(req, res, next) {
  try {
    console.log(`Getting employee by ID: ${req.params.id}`);
    const employee = await db.Employee.findByPk(req.params.id, {
      include: [
        { model: db.Account, as: 'User' }, 
        { model: db.Department }
      ]
    });
    if (!employee) throw new Error('Employee not found');
    console.log('Found employee:', employee.employeeId);
    res.json(employee);
  } catch (err) { 
    console.error(`Error getting employee by ID ${req.params.id}:`, err);
    next(err); 
  }
}

async function update(req, res, next) {
  try {
    console.log(`Updating employee ID: ${req.params.id}`, JSON.stringify(req.body));
    const employee = await db.Employee.findByPk(req.params.id);
    if (!employee) throw new Error('Employee not found');
    await employee.update(req.body);
    console.log('Employee updated successfully');
    res.json(employee);
  } catch (err) { 
    console.error(`Error updating employee ID ${req.params.id}:`, err);
    next(err); 
  }
}

async function _delete(req, res, next) {
  try {
    console.log(`Deleting employee ID: ${req.params.id}`);
    const employee = await db.Employee.findByPk(req.params.id);
    if (!employee) throw new Error('Employee not found');
    await employee.destroy();
    console.log('Employee deleted successfully');
    res.json({ message: 'Employee deleted' });
  } catch (err) { 
    console.error(`Error deleting employee ID ${req.params.id}:`, err);
    next(err); 
  }
}

async function transfer(req, res, next) {
  try {
    console.log(`Transferring employee ID: ${req.params.id} to department: ${req.body.departmentId}`);
    const employee = await db.Employee.findByPk(req.params.id);
    if (!employee) throw new Error('Employee not found');
    
    const oldDepartmentId = employee.departmentId;
    const newDepartmentId = req.body.departmentId;
    
    await employee.update({ departmentId: newDepartmentId });
    
    // Get department names for the workflow details
    let oldDepartmentName = 'Unknown';
    let newDepartmentName = 'Unknown';
    
    if (oldDepartmentId) {
      const oldDept = await db.Department.findByPk(oldDepartmentId);
      if (oldDept) oldDepartmentName = oldDept.name;
    }
    
    if (newDepartmentId) {
      const newDept = await db.Department.findByPk(newDepartmentId);
      if (newDept) newDepartmentName = newDept.name;
    }
    
    // Create a transfer workflow
    await db.Workflow.create({
      employeeId: employee.id,
      type: 'Department Transfer',
      details: `Employee transferred from ${oldDepartmentName} to ${newDepartmentName}.`
    });
    
    console.log('Employee transferred successfully');
    res.json({ message: 'Department transfer workflow created for employee ' + employee.employeeId });
  } catch (err) { 
    console.error(`Error transferring employee ID ${req.params.id}:`, err);
    next(err); 
  }
}

async function getNextEmployeeId(req, res, next) {
  try {
    console.log('Getting next employee ID');
    const nextId = await generateNextEmployeeId();
    console.log('Next employee ID:', nextId);
    res.json({ employeeId: nextId });
  } catch (err) { 
    console.error('Error generating next employee ID:', err);
    next(err); 
  }
}

async function generateNextEmployeeId() {
  console.log('Generating next employee ID');
  // Get all existing employee IDs
  const employees = await db.Employee.findAll({
    attributes: ['employeeId'],
    where: {
      employeeId: {
        [Op.like]: 'EMP%'
      }
    }
  });
  
  // Extract all existing IDs
  const existingIds = employees.map(emp => emp.employeeId);
  console.log('Existing employee IDs:', existingIds);
  
  // Start from 1 and keep going until we find a non-existing ID
  let currentNum = 1;
  let candidateId;
  
  do {
    candidateId = 'EMP' + currentNum.toString().padStart(3, '0');
    currentNum++;
  } while (existingIds.includes(candidateId));
  
  console.log('Generated candidate ID:', candidateId);
  return candidateId;
}

async function getWithDetails(req, res, next) {
  try {
    console.log(`Getting detailed employee by ID: ${req.params.id}`);
    const employee = await db.Employee.findByPk(req.params.id, {
      include: [
        { 
          model: db.Account, 
          as: 'User',
          attributes: ['id', 'email', 'role'] 
        }, 
        { 
          model: db.Department,
          attributes: ['id', 'name'] 
        }
      ]
    });
    
    if (!employee) throw new Error('Employee not found');
    
    console.log('Found employee with details:', {
      id: employee.id,
      employeeId: employee.employeeId,
      hasUser: !!employee.User,
      hasDepartment: !!employee.Department
    });
    
    res.json(employee);
  } catch (err) { 
    console.error(`Error getting detailed employee by ID ${req.params.id}:`, err);
    next(err); 
  }
}

module.exports = router; 