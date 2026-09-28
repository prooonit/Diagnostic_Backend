export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ message: "Invalid JSON body" });
  }

  const statusCode = error.statusCode || 500;
  const message = statusCode >= 500 ? "Internal server error" : error.message;

  return res.status(statusCode).json({ message });
}
