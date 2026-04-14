import { Router } from "express";
import bcrypt from "bcryptjs";

const signupRouter = (pool) => {
  const router = Router();

  router.post("/signup", async (req, res) => {
    try {
      const { username, password } = req.body;

      const hashed = await bcrypt.hash(password, 10);

      await pool.query(
        "INSERT INTO users (username, password_hash) VALUES ($1, $2)",
        [username, hashed]
      );

      res.send({ message: "User created" });
    } catch (err) {
      res.status(500).send("Signup error");
    }
  });

  return router;
};

export default signupRouter;