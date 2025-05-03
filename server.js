const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(__dirname, 'users.json');

// 유저 데이터를 파일에서 불러오기
let users = [];
if (fs.existsSync(USERS_FILE)) {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    users = JSON.parse(data);
  } catch (err) {
    console.error("❌ 사용자 파일 읽기 오류:", err.message);
  }
}

// 유저 등록
app.post('/api/register', (req, res) => {
  const { nickname, address, detail, phone } = req.body;
  if (!nickname || !address || !detail || !phone) {
    return res.status(400).json({ error: '모든 필드를 입력하세요.' });
  }

  const user = { nickname, address, detail, phone };
  users.push(user);

  fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), (err) => {
    if (err) {
      console.error("❌ 사용자 파일 저장 오류:", err.message);
      return res.status(500).json({ error: '저장 실패' });
    }
    res.json({ success: true });
  });
});

// 관리자 로그인
const ADMIN_PASSWORD = "qwer1234!"; // ✅ 변경 가능
app.post('/api/gamza/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: "비밀번호가 틀렸습니다." });
  }
});

// 관리자 - 사용자 목록
app.get('/api/gamza/users', (req, res) => {
  const { key } = req.query;
  if (key !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: "접근 거부" });
  }
  res.json(users);
});

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// 메인 페이지 (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 관리자 페이지 (gamza.html)
app.get('/gamza', (req, res) => {
  res.sendFile(path.join(__dirname, 'gamza.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 서버 실행 중: http://localhost:${PORT}`));
