import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple"; // ✅ import hàm
import path from "path";

import pool from "./config/db.js";
import indexRoutes from "./routes/_indexRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Khởi tạo lớp Store từ connect-pg-simple
const PgSession = connectPgSimple(session); // ✅ gọi hàm với session

app.use(
  cors({
    origin: "http://localhost:5173", // frontend
    credentials: true, // ✅ cho phép cookie qua CORS
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session lưu trong Postgres
app.use(
  session({
    store: new PgSession({
      pool, // ✅ dùng pool Postgres đang có
      createTableIfMissing: true, // ✅ tự tạo bảng session nếu chưa có
      // tableName: 'session'      // (tuỳ chọn) tên bảng
    }),
    secret: process.env.SESSION_SECRET || "change_me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax", // dùng HTTPS + đa domain thì cân nhắc 'none' + secure:true
      secure: false, // true nếu chạy HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    },
  })
);
app.use("/static", express.static(path.join(process.cwd(), "public")));

app.use("/api", indexRoutes);

pool
  .connect()
  .then(() => {
    console.log("✅✅✅Connected to the database successfully");
    app.listen(port, () => {
      console.log(`✅✅✅Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

app.get("/", (req, res) => {
  pool.query("SELECT NOW()", (err, result) => {
    if (err) {
      console.error("Error executing query", err);
      res.status(500).send("Database query error");
    } else {
      res.send(`Current time: ${result.rows[0].now}`);
    }
  });
});

app.post("/", (req, res) => {
  const { name } = req.body;
  res.send(`Hello ${name}!`);
});
