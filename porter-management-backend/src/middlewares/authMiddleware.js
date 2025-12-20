import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  const secrete_key = process.env.JWT_SECRETE;
  try {
    const token = req.headers?.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    jwt.verify(token, secrete_key, (err, decode) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }
      req.user = decode;
      next();
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
