// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'users.json');
const ADMIN_PASSWORD = "gamza";

// 데이터 파일에서 사용자 불러오기
let users = [];
if (fs.existsSync(DATA_FILE)) {
  users = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

// 사용자 등록
app.post('/api/register', (req, res) => {
  const { nickname, address, detail, phone } = req.body;
  if (!nickname || !address || !detail || !phone) {
    return res.status(400).json({ error: '모든 필드를 입력하세요.' });
  }

  const newUser = {
    nickname,
    address,
    detail,
    phone,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf-8');
  res.json({ success: true });
});

// 관리자 로그인
app.post('/api/gamza/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: "비밀번호가 틀렸습니다." });
  }
});

// 관리자 사용자 목록 조회
app.get('/api/gamza/users', (req, res) => {
  const { key } = req.query;
  if (key !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: "접근 거부" });
  }
  res.json(users);
});

// 정적 파일 라우팅
app.use(express.static(path.join(__dirname, 'public')));
app.get('/gamza', (req, res) => {
  res.sendFile(path.join(__dirname, 'gamza.html'));
});

// 기타 라우팅 index.html 로 포워딩
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`\u{1F680} 서버 실행 중: http://localhost:${PORT}`));
