//  CREATE TABLE seats (
//      id SERIAL PRIMARY KEY,
//      seat_name VARCHAR(10),
//      bookedby VARCHAR(255)
//      isbooked INT DEFAULT 0
//  );
// INSERT INTO seats (isbooked)
// SELECT 0 FROM generate_series(1, 20);

import express from "express";
import pg from "pg";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import path from "path";
import loginRouter from "./routes/login.js";
import signupRouter from "./routes/signup.js";
import authMiddleware from "./middlewares/auth.middleware.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const port = process.env.PORT || 8080;

// Equivalent to mongoose connection
// Pool is nothing but group of connections
// If you pick one connection out of the pool and release it
// the pooler will keep that connection open for sometime to other clients to reuse
const pool = new pg.Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "sql_class_2_db",
  max: 20,
  connectionTimeoutMillis: 0,
  idleTimeoutMillis: 0,
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(loginRouter(pool));
app.use(signupRouter(pool));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});
//get all seats
app.get("/seats", async (req, res) => {
  const result = await pool.query("select * from seats"); // equivalent to Seats.find() in mongoose
  res.send(result.rows);
});
app.get("/users", async (req, res) => {
  const result = await pool.query("select * from users");
  res.send(result.rows);
});

//book a seat give the seatId and your name

app.put("/:id", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const name = req.user.username;
    // payment integration should be here
    // verify payment
    const conn = await pool.connect(); // pick a connection from the pool
    //begin transaction
    // KEEP THE TRANSACTION AS SMALL AS POSSIBLE
    await conn.query("BEGIN");
    //getting the row to make sure it is not booked
    /// $1 is a variable which we are passing in the array as the second parameter of query function,
    // Why do we use $1? -> this is to avoid SQL INJECTION
    // (If you do ${id} directly in the query string,
    // then it can be manipulated by the user to execute malicious SQL code)
    const sql = "SELECT * FROM seats where id = $1 and isbooked = 0 FOR UPDATE";
    const result = await conn.query(sql, [id]);

    //if no rows found then the operation should fail can't book
    // This shows we Do not have the current seat available for booking
    if (result.rowCount === 0) {
      await conn.query("ROLLBACK");
      conn.release();
      return res.send({ error: "Seat already booked" });
    }
    //if we get the row, we are safe to update
    const sqlU = "update seats set isbooked = 1, bookedby = $2 where id = $1";
    const updateResult = await conn.query(sqlU, [id, name]); // Again to avoid SQL INJECTION we are using $1 and $2 as placeholders

    //end transaction by committing
    await conn.query("COMMIT");
    conn.release(); // release the connection back to the pool (so we do not keep the connection open unnecessarily)
    res.send(updateResult);
  } catch (ex) {
    console.log(ex);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => console.log("Server starting on port: " + port));
