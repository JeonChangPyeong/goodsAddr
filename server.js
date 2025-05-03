// server.js
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const users = [];

app.post('/api/register', (req, res) => {
  const { nickname, address, phone } = req.body;
  if (!nickname || !address || !phone) {
    return res.status(400).json({ error: '모든 필드를 입력하세요.' });
  }
  users.push({ nickname, address, phone });
  res.json({ success: true });
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get("/", (req, res) => {
  res.send("🎉 서버가 정상적으로 동작 중입니다!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`서버 실행 중: http://localhost:${PORT}`));
