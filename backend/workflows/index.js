const express = require('express');
const router = express.Router();
const db = require('../_helpers/db');
const authorize = require('../_middleware/authorize');
const Role = require('../_helpers/role');

router.post('/', authorize(Role.Admin), create);
router.get('/', authorize(), getAll);
router.get('/employee/:employeeId', authorize(), getByEmployeeId);
router.get('/:id', authorize(), getById);
router.put('/:id/status', authorize(Role.Admin), updateStatus);
router.post('/onboarding', authorize(Role.Admin), onboarding);

async function create(req, res, next) {
  try {
    console.log('Creating workflow:', req.body);
    const workflow = await db.Workflow.create(req.body);
    console.log('Workflow created successfully:', workflow.id);
    res.status(201).json(workflow);
  } catch (err) { 
    console.error('Error creating workflow:', err);
    next(err); 
  }
}

async function getAll(req, res, next) {
  try {
    console.log('Getting all workflows');
    const workflows = await db.Workflow.findAll({
      include: [{ model: db.Employee }]
    });
    console.log(`Found ${workflows.length} workflows`);
    res.json(workflows);
  } catch (err) { 
    console.error('Error getting all workflows:', err);
    next(err); 
  }
}

async function getById(req, res, next) {
  try {
    console.log(`Getting workflow by ID: ${req.params.id}`);
    const workflow = await db.Workflow.findByPk(req.params.id);
    if (!workflow) throw new Error('Workflow not found');
    console.log('Found workflow:', workflow.id);
    res.json(workflow);
  } catch (err) { 
    console.error(`Error getting workflow by ID ${req.params.id}:`, err);
    next(err); 
  }
}

async function getByEmployeeId(req, res, next) {
  try {
    console.log(`Getting workflows for employee ID: ${req.params.employeeId}`);
    const workflows = await db.Workflow.findAll({
      where: { employeeId: req.params.employeeId }
    });
    console.log(`Found ${workflows.length} workflows for employee ${req.params.employeeId}`);
    res.json(workflows);
  } catch (err) { 
    console.error(`Error getting workflows for employee ID ${req.params.employeeId}:`, err);
    next(err); 
  }
}

async function updateStatus(req, res, next) {
  try {
    console.log(`Updating workflow status for ID: ${req.params.id}`, req.body);
    
    if (!req.body.status) {
      throw new Error('Status is required');
    }
    
    const workflow = await db.Workflow.findByPk(req.params.id);
    if (!workflow) throw new Error('Workflow not found');
    
    // Validate the status value
    const validStatuses = ['Pending', 'Approved', 'Rejected'];
    if (!validStatuses.includes(req.body.status)) {
      throw new Error(`Invalid status value. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    await workflow.update({ status: req.body.status });
    console.log(`Workflow ${req.params.id} status updated to ${req.body.status}`);
    
    // Check if this is a request approval workflow and update the corresponding request
    if (workflow.type === 'Request Approval' || workflow.type === 'RequestApproval') {
      try {
        // Try to extract requestId from the workflow details
        let requestId = null;
        
        // First try from the request body if it was provided
        if (req.body.requestId) {
          requestId = req.body.requestId;
          console.log(`Using requestId from request body: ${requestId}`);
        }
        // Otherwise try to extract from the workflow details
        else if (workflow.details) {
          let details = workflow.details;
          
          // If details is a string, try to parse it as JSON
          if (typeof details === 'string') {
            try {
              details = JSON.parse(details);
              if (details.requestId) {
                requestId = details.requestId;
                console.log(`Extracted requestId from parsed JSON details: ${requestId}`);
              }
            } catch (e) {
              // If not valid JSON, try to extract via regex
              const requestIdMatch = details.match(/request #(\d+)/i) || 
                                    details.match(/requestId:\s*(\d+)/i) || 
                                    details.match(/<b>requestId:<\/b>\s*(\d+)/i);
              
              if (requestIdMatch && requestIdMatch[1]) {
                requestId = parseInt(requestIdMatch[1]);
                console.log(`Extracted requestId via regex: ${requestId}`);
              }
            }
          } 
          // If details is already an object, try to get requestId directly
          else if (typeof details === 'object' && details !== null) {
            if (details.requestId) {
              requestId = details.requestId;
              console.log(`Extracted requestId from object details: ${requestId}`);
            }
          }
        }
        
        // Update request status if we found a requestId
        if (requestId) {
          const request = await db.Request.findByPk(requestId);
          if (request) {
            // Map workflow status to request status
            const requestStatus = req.body.status === 'Approved' ? 'Approved' : 
                                req.body.status === 'Rejected' ? 'Rejected' : 'Pending';
            
            await request.update({ status: requestStatus });
            console.log(`Updated request ${requestId} status to ${requestStatus}`);
          } else {
            console.log(`Could not find request with ID ${requestId}`);
          }
        } else {
          console.log('No requestId could be extracted from workflow details');
        }
      } catch (err) {
        console.error('Error updating related request:', err);
        // Don't fail the whole request if updating the request fails
      }
    }
    
    res.json(workflow);
  } catch (err) { 
    console.error(`Error updating workflow status for ID ${req.params.id}:`, err);
    next(err); 
  }
}

async function onboarding(req, res, next) {
  try {
    console.log('Creating onboarding workflow:', req.body);
    const workflow = await db.Workflow.create({
      employeeId: req.body.employeeId,
      type: 'Onboarding',
      details: req.body.details,
      status: 'Pending'
    });
    console.log('Onboarding workflow created successfully:', workflow.id);
    res.status(201).json(workflow);
  } catch (err) { 
    console.error('Error creating onboarding workflow:', err);
    next(err); 
  }
}

module.exports = router; 