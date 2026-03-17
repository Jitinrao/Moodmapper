const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
  }

  if (err.code === 'ENOTFOUND') {
    return res.status(503).json({
      error: 'Service Unavailable',
      details: 'External service is not available'
    });
  }

  if (err.response && err.response.status === 400) {
    return res.status(400).json({
      error: 'Bad Request',
      details: 'Invalid request to external service'
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

module.exports = { errorHandler };
