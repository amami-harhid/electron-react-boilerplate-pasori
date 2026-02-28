// server.js
const express = require('express');
const session = require('express-session');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

// OAuth2 クライアント作成
function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

// Google OAuth 認可開始
app.get('/auth/google', (req, res) => {
  const oauth2Client = createOAuthClient();
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Refresh Token を取得
    prompt: 'consent',      // 毎回同意画面を出す（Refresh Token 再発行のため）
    scope: ['openid', 'profile', 'email', 'https://www.googleapis.com/auth/userinfo.profile']
  });
  res.redirect(url);
});

// 認可コード受け取り & トークン取得
app.get('/auth/google/callback', async (req, res) => {
  const code = req.query.code;
  const oauth2Client = createOAuthClient();

  try {
    const { tokens } = await oauth2Client.getToken(code);
    req.session.accessToken = tokens.access_token;
    req.session.refreshToken = tokens.refresh_token; // 初回のみ取得される
    res.redirect('/');
  } catch (err) {
    console.error('Token exchange failed:', err);
    res.status(500).send('OAuth failed');
  }
});

// Refresh Token で Access Token 更新
app.post('/auth/refresh', async (req, res) => {
  if (!req.session.refreshToken) {
    return res.status(401).json({ error: 'No refresh token' });
  }

  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials({ refresh_token: req.session.refreshToken });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    req.session.accessToken = credentials.access_token;
    res.json({ accessToken: credentials.access_token });
  } catch (err) {
    if (err.message.includes('invalid_grant')) {
      // Refresh Token 期限切れ
      return res.status(401).json({ error: 'refresh_expired' });
    }
    console.error('Refresh failed:', err);
    res.status(500).json({ error: 'refresh_failed' });
  }
});

// 保護された API の例
app.get('/api/userinfo', async (req, res) => {
  if (!req.session.accessToken) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials({ access_token: req.session.accessToken });

  try {
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    res.json(data);
  } catch (err) {
    if (err.code === 401) {
      return res.status(401).json({ error: 'access_expired' });
    }
    res.status(500).json({ error: 'api_failed' });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:80'));