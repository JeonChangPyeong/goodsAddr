const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const usersFile = path.join(__dirname, 'users.json');

function loadUsers() {
  try {
    const data = fs.readFileSync(usersFile, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
}

app.post('/api/register', (req, res) => {
  const { nickname, address, detail, phone } = req.body;
  if (!nickname || !address || !detail || !phone) {
    return res.status(400).json({ error: '모든 필드를 입력하세요.' });
  }

  const users = loadUsers();
  users.push({ nickname, address, detail, phone, createdAt: new Date().toISOString() });
  saveUsers(users);

  res.json({ success: true });
});

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
