const express = require("express");
const cors = require("cors");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool();

// 사용자 등록
app.post("/api/register", async (req, res) => {
  const { nickname, address, detail, phone } = req.body;
  if (!nickname || !address || !detail || !phone) {
    return res.status(400).json({ error: "모든 필드를 입력하세요." });
  }
  try {
    await pool.query(
      "INSERT INTO users (nickname, address, detail, phone) VALUES ($1, $2, $3, $4)",
      [nickname, address, detail, phone]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "DB 저장 실패" });
  }
});

// 관리자 로그인
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "gamza";
app.post("/api/gamza/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: "비밀번호가 틀렸습니다." });
  }
});

// 사용자 목록 조회
app.get("/api/gamza/users", async (req, res) => {
  const { key } = req.query;
  if (key !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: "접근 거부" });
  }
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "DB 조회 실패" });
  }
});

// 정적 파일 제공
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`서버 실행 중: http://localhost:${PORT}`));
