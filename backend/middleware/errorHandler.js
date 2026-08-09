// Centralized error handler. Any `next(err)` call in the app ends up here.
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
    return res.status(409).json({ error: "A post with this slug already exists" });
  }

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal server error",
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: "Route not found" });
}

module.exports = { errorHandler, notFoundHandler };
