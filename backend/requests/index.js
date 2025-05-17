const express = require('express');
const router = express.Router();
const db = require('../_helpers/db');
const authorize = require('../_middleware/authorize');
const Role = require('../_helpers/role');

router.post('/', authorize(), create);
router.get('/', authorize(), getAll);
router.get('/:id', authorize(), getById);
router.put('/:id', authorize(), update);
router.delete('/:id', authorize(Role.Admin), _delete);

async function create(req, res, next) {
  try {
    console.log('Creating request with body:', {
      type: req.body.type,
      employeeId: req.body.employeeId || req.user.id,
      hasItems: !!req.body.items,
      itemsCount: req.body.items ? req.body.items.length : 0,
      hasRequestItems: !!req.body.requestItems,
      requestItemsCount: req.body.requestItems ? req.body.requestItems.length : 0
    });
    
    // Create the request first
    const request = await db.Request.create({
      type: req.body.type,
      employeeId: req.body.employeeId || req.user.id
    });
    
    // Then create any request items if they exist
    // First check for items array (primary)
    if (req.body.items && req.body.items.length > 0) {
      console.log(`Creating ${req.body.items.length} items from 'items' array`);
      const requestItems = req.body.items.map(item => ({
        name: item.name,
        quantity: item.quantity || 1,
        requestId: request.id
      }));
      await db.RequestItem.bulkCreate(requestItems);
    } 
    // Then check for requestItems if items doesn't exist
    else if (req.body.requestItems && req.body.requestItems.length > 0) {
      console.log(`Creating ${req.body.requestItems.length} items from 'requestItems' array`);
      const requestItems = req.body.requestItems.map(item => ({
        name: item.name,
        quantity: item.quantity || 1,
        requestId: request.id
      }));
      await db.RequestItem.bulkCreate(requestItems);
    } else {
      console.log('No items found in request body');
    }
    
    // Create a workflow for the request
    await db.Workflow.create({
      employeeId: request.employeeId,
      type: 'Request Approval',
      details: JSON.stringify({
        requestId: request.id,
        requestType: request.type,
        requesterId: request.employeeId,
        message: `Review ${request.type} request #${request.id} from Employee ID ${request.employeeId}.`
      })
    });
    
    // Return the created request with its items
    const createdRequest = await db.Request.findByPk(request.id, {
      include: [
        { model: db.RequestItem, as: 'requestItems' },
        { 
          model: db.Employee,
          include: [{ 
            model: db.Account, 
            as: 'User',
            attributes: ['id', 'email', 'role'] 
          }] 
        }
      ]
    });
    
    // Log the result to help debug
    console.log('Created request:', {
      id: createdRequest.id,
      hasEmployee: !!createdRequest.Employee,
      employeeId: createdRequest.employeeId,
      hasRequestItems: Array.isArray(createdRequest.requestItems),
      requestItemsCount: createdRequest.requestItems ? createdRequest.requestItems.length : 0,
      employeeData: createdRequest.Employee ? {
        id: createdRequest.Employee.id,
        hasUser: !!createdRequest.Employee.User,
        userData: createdRequest.Employee.User ? {
          id: createdRequest.Employee.User.id,
          email: createdRequest.Employee.User.email
        } : null
      } : null,
      requestItems: (createdRequest.requestItems || []).map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity
      }))
    });
    
    // Transform response for consistent frontend experience
    const plainResponse = createdRequest.get({ plain: true });
    
    res.status(201).json(plainResponse);
  } catch (err) { 
    console.error('Error in create:', err);
    next(err); 
  }
}

async function getAll(req, res, next) {
  try {
    const conditions = {};
    
    // If employeeId is provided as a query parameter, filter by it
    if (req.query.employeeId) {
      conditions.employeeId = req.query.employeeId;
    }
    
    // If user is not an admin, they can only see their own requests
    if (req.user.role !== Role.Admin) {
      // Get the employee record for the current user
      const employee = await db.Employee.findOne({
        where: { userId: req.user.id }
      });
      
      if (req.query.employeeId) {
        // If they're trying to access another employee's requests, check if it's allowed
        if (employee && employee.id.toString() !== req.query.employeeId) {
          return res.status(403).json({ message: 'Unauthorized' });
        }
      } else if (employee) {
        // No employeeId specified, so just show their own
        conditions.employeeId = employee.id;
      }
    }
    
    // Log what we're looking for
    console.log('Request conditions:', conditions);
    
    const requests = await db.Request.findAll({
      where: conditions,
      include: [
        { 
          model: db.RequestItem, 
          as: 'requestItems',
          required: false // Allow requests with no items to be included
        }, 
        { 
          model: db.Employee,
          required: false, // Don't require an employee to be found
          include: [{ 
            model: db.Account, 
            as: 'User',
            attributes: ['id', 'email', 'role'] // Explicitly specify the attributes
          }] 
        }
      ]
    });
    
    // Log the result to help debug
    console.log(`Found ${requests.length} requests`);
    if (requests.length > 0) {
      const sampleRequest = requests[0];
      console.log('Sample request:', {
        id: sampleRequest.id,
        hasEmployee: !!sampleRequest.Employee,
        employeeId: sampleRequest.employeeId,
        hasRequestItems: Array.isArray(sampleRequest.requestItems),
        requestItemsCount: sampleRequest.requestItems ? sampleRequest.requestItems.length : 0,
        employeeData: sampleRequest.Employee ? {
          id: sampleRequest.Employee.id,
          hasUser: !!sampleRequest.Employee.User,
          userData: sampleRequest.Employee.User ? {
            id: sampleRequest.Employee.User.id,
            email: sampleRequest.Employee.User.email
          } : null
        } : null,
        requestItems: (sampleRequest.requestItems || []).map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity
        }))
      });
    }
    
    // Transform requests for consistent frontend experience
    const transformedRequests = requests.map(request => {
      const plainRequest = request.get({ plain: true });
      
      // Ensure requestItems property exists and items are properly formatted
      if (!plainRequest.requestItems) {
        plainRequest.requestItems = [];
      }
      
      return plainRequest;
    });
    
    res.json(transformedRequests);
  } catch (err) { 
    console.error('Error in getAll:', err);
    next(err); 
  }
}

async function getById(req, res, next) {
  try {
    console.log(`Getting request with id ${req.params.id}`);
    
    const request = await db.Request.findByPk(req.params.id, {
      include: [
        { model: db.RequestItem, as: 'requestItems' }, 
        { 
          model: db.Employee,
          include: [{ 
            model: db.Account, 
            as: 'User',
            attributes: ['id', 'email', 'role'] 
          }] 
        }
      ]
    });
    
    if (!request) throw new Error('Request not found');
    if (req.user.role !== Role.Admin && request.employeeId !== req.user.id) {
      throw new Error('Unauthorized');
    }
    
    // Log the result to help debug
    console.log('Found request:', {
      id: request.id,
      hasEmployee: !!request.Employee,
      employeeId: request.employeeId,
      hasRequestItems: Array.isArray(request.requestItems),
      requestItemsCount: request.requestItems ? request.requestItems.length : 0,
      employeeData: request.Employee ? {
        id: request.Employee.id,
        hasUser: !!request.Employee.User,
        userData: request.Employee.User ? {
          id: request.Employee.User.id,
          email: request.Employee.User.email
        } : null
      } : null,
      requestItems: (request.requestItems || []).map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity
      }))
    });
    
    // Transform request for consistent frontend experience
    const plainRequest = request.get({ plain: true });
    
    // Ensure requestItems property exists
    if (!plainRequest.requestItems) {
      plainRequest.requestItems = [];
    }
    
    res.json(plainRequest);
  } catch (err) { 
    console.error('Error in getById:', err);
    next(err); 
  }
}

async function update(req, res, next) {
  try {
    console.log('Update request with body:', {
      id: req.params.id,
      type: req.body.type,
      status: req.body.status,
      employeeId: req.body.employeeId,
      hasItems: !!req.body.items,
      itemsCount: req.body.items ? req.body.items.length : 0
    });
    
    const request = await db.Request.findByPk(req.params.id);
    if (!request) throw new Error('Request not found');
    
    // Check if user is authorized (admin or request owner)
    if (req.user.role !== Role.Admin && request.employeeId !== req.user.id) {
      throw new Error('Unauthorized');
    }
    
    // Check if status is changing
    const statusChanged = req.body.status && req.body.status !== request.status;
    const oldStatus = request.status;
    const itemsUpdated = !!(req.body.items || req.body.requestItems);
    
    // Update the request
    await request.update({
      type: req.body.type,
      status: req.body.status
    });
    
    // If items were provided, update them
    if (itemsUpdated) {
      // Delete existing items
      await db.RequestItem.destroy({ where: { requestId: request.id } });
      
      // Create new items (handle both items and requestItems property names)
      const items = req.body.items || req.body.requestItems || [];
      if (items.length > 0) {
        await db.RequestItem.bulkCreate(items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          requestId: request.id
        })));
      }
    }
    
    // Only create a workflow if something significant changed (status or items)
    if (statusChanged || itemsUpdated) {
      // Find employee to get employeeId for the message
      const employee = await db.Employee.findByPk(request.employeeId);
      const employeeIdDisplay = employee ? employee.employeeId : request.employeeId;
      
      // Create only one workflow entry regardless of whether status or items changed
      // Always use the "Review updated" message
      await db.Workflow.create({
        employeeId: request.employeeId,
        type: 'Request Approval',
        status: 'Pending',
        details: JSON.stringify({
          requestId: request.id,
          requestType: request.type,
          requesterId: request.employeeId,
          message: `Review updated ${request.type} request #${request.id} from Employee ID ${employeeIdDisplay}.`
        })
      });
    }
    
    // Get updated request with items
    const updatedRequest = await db.Request.findByPk(request.id, {
      include: [
        { model: db.RequestItem, as: 'requestItems' },
        { 
          model: db.Employee,
          include: [{ 
            model: db.Account, 
            as: 'User',
            attributes: ['id', 'email', 'role'] 
          }] 
        }
      ]
    });
    
    // Transform response for consistent frontend experience
    const plainResponse = updatedRequest.get({ plain: true });
    
    res.json(plainResponse);
  } catch (err) { 
    console.error('Error in update:', err);
    next(err); 
  }
}

async function _delete(req, res, next) {
  try {
    const request = await db.Request.findByPk(req.params.id);
    if (!request) throw new Error('Request not found');
    await request.destroy();
    res.json({ message: 'Request deleted' });
  } catch (err) { next(err); }
}

module.exports = router; 