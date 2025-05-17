module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    // Always log the error for debugging
    console.error('API Error:', {
        path: req.path,
        method: req.method,
        body: req.body,
        errorName: err.name,
        errorMessage: err.message,
        errorStack: err.stack
    });

    switch (true) {
        case typeof err === 'string':
            // custom application error
            const is404 = err.toLowerCase().endsWith('not found');
            const statusCode = is404 ? 404 : 400;
            return res.status(statusCode).json({ message: err });

        case err.name === 'UnauthorizedError':
            // jwt authentication error
            return res.status(401).json({ message: 'Unauthorized' });
        
        case err.name === 'SequelizeValidationError':
            // Sequelize validation error
            return res.status(400).json({ 
                message: 'Validation error', 
                errors: err.errors.map(e => ({ field: e.path, message: e.message }))
            });
            
        case err.name === 'SequelizeUniqueConstraintError':
            // Unique constraint error
            return res.status(400).json({ 
                message: 'Duplicate entry', 
                errors: err.errors.map(e => ({ field: e.path, message: e.message }))
            });

        default:
            return res.status(500).json({ message: err.message });
    }
}
