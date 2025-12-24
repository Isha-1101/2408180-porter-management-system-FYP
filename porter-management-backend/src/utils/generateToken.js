import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  const secrete_key = process.env.JWT_SECRETE;
  return jwt.sign(
    {
      id: user._id,
      phone: user.phone,
      role: user.role,
    },
    secrete_key,
    {
      expiresIn: "30d",
    }
  );
};
