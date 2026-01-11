import multer from "multer";

export const multerErrorHandler = (
  err,
  req,
  res,
  next
) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
};
