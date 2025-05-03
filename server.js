const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL 연결 설정 (Render 환경변수 사용)
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

// PostgreSQL users 테이블 초기화 (없으면 생성)
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      nickname TEXT NOT NULL,
      address TEXT NOT NULL,
      detailAddress TEXT,
      phone TEXT NOT NULL
    )
  `);
}
initDB();

// 사용자 등록
app.post('/api/register', async (req, res) => {
  const { nickname, address, detailAddress, phone } = req.body;
  if (!nickname || !address || !phone) {
    return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
  }

  try {
    await pool.query(
      'INSERT INTO users (nickname, address, detailAddress, phone) VALUES ($1, $2, $3, $4)',
      [nickname, address, detailAddress || '', phone]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('DB 저장 오류:', err);
    res.status(500).json({ error: 'DB 저장 실패' });
  }
});

// 관리자 조회 (비밀번호 기반 인증)
const ADMIN_PASSWORD = 'gamza';

app.post('/api/gamza/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: '비밀번호가 틀렸습니다.' });
  }
});

app.get('/api/gamza/users', async (req, res) => {
  const { key } = req.query;
  if (key !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: '접근 거부' });
  }

  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('DB 조회 오류:', err);
    res.status(500).json({ error: 'DB 조회 실패' });
  }
});

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));
app.get('/gamza', (req, res) => {
  res.sendFile(path.join(__dirname, 'gamza.html'));
});
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`서버 실행 중: http://localhost:${PORT}`));
