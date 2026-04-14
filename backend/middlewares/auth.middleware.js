import jwt from "jsonwebtoken";

const SECRET = "supersecret";

const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth) return res.status(401).send("No token");

  const token = auth.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).send("Invalid token");
  }
};

export default authMiddleware;