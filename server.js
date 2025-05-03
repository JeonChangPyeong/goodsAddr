const express = require('express');
const cors = require('cors');
const path = require('path');

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

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(express.static(path.join(__dirname, "."))); // 현재 디렉토리 정적 파일 제공
app.get("/gamza", (req, res) => {
  res.sendFile(path.join(__dirname, "gamza.html"));
});

const ADMIN_PASSWORD = "qwer1234!"; // ✏️ 원하는 비밀번호로 변경

app.post('/api/gamza/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: "비밀번호가 틀렸습니다." });
  }
});

app.get('/api/gamza/users', (req, res) => {
  const { key } = req.query;
  if (key !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: "접근 거부" });
  }
  res.json(users);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`서버 실행 중: http://localhost:${PORT}`));
