module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.stack);
  res.status(statusCode).json({
    error: process.env.NODE_ENV === "production" ? "Server error" : err.message,
  });
};
