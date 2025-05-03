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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`서버 실행 중: http://localhost:${PORT}`));
