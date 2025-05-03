// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL 연결 풀 설정
const pool = new Pool(); // Render 환경변수(PGHOST, PGUSER, etc.) 자동 인식

// 사용자 등록 API
app.post('/api/register', async (req, res) => {
  const { nickname, address, detail, phone } = req.body;
  if (!nickname || !address || !detail || !phone) {
    return res.status(400).json({ error: '모든 필드를 입력하세요.' });
  }

  try {
    await pool.query(
      'INSERT INTO users (nickname, address, detail, phone) VALUES ($1, $2, $3, $4)',
      [nickname, address, detail, phone]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('❌ 사용자 저장 오류:', err);
    res.status(500).json({ error: 'DB 저장 실패' });
  }
});

// 관리자 인증 API
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'gamza';

app.post('/api/gamza/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: '비밀번호가 틀렸습니다.' });
  }
});

// 관리자 사용자 목록 조회 API
app.get('/api/gamza/users', async (req, res) => {
  const { key } = req.query;
  if (key !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: '접근 거부' });
  }

  try {
    const result = await pool.query('SELECT nickname, address, detail, phone FROM users ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ 사용자 조회 오류:', err);
    res.status(500).json({ error: 'DB 조회 실패' });
  }
});

// 정적 파일 서비스
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res, next) => {
  const url = req.originalUrl;
  if (url === '/gamza') {
    res.sendFile(path.join(__dirname, 'gamza.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 서버 실행 중: http://localhost:${PORT}`));
