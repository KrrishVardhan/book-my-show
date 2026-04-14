import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET = "supersecret";

const loginRouter = (pool) => {
  const router = Router();

  router.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      const result = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );

      const user = result.rows[0];

      if (!user) return res.status(400).send("User not found");

      const match = await bcrypt.compare(password, user.password_hash);

      if (!match) return res.status(400).send("Wrong password");

      const token = jwt.sign({ id: user.id, username: user.username }, SECRET);

      res.send({ token });
    } catch (err) {
      res.status(500).send("Login error");
    }
  });

  return router;
};

export default loginRouter;