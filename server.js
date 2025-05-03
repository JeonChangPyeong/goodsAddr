const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const users = [];

const ADMIN_PASSWORD = "qwer1234!"; // 비밀번호

// 사용자 등록
app.post('/api/register', (req, res) => {
  const { nickname, address, phone } = req.body;
  if (!nickname || !address || !phone) {
    return res.status(400).json({ error: '모든 필드를 입력하세요.' });
  }
  users.push({ nickname, address, phone });
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

// 관리자 사용자 조회
app.get('/api/gamza/users', (req, res) => {
  const { key } = req.query;
  if (key !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: "접근 거부" });
  }
  res.json(users);
});

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// 관리자 페이지
app.get('/gamza', (req, res) => {
  res.sendFile(path.join(__dirname, 'gamza.html'));
});

// 모든 기타 요청은 index.html로 연결 (SPA 지원용)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`서버 실행 중: http://localhost:${PORT}`));
