const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const cookieParser = require('cookie-parser');
const base64url = require('base64url');

const app = express();
const PORT = process.env.PORT || 7385;

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
fs.ensureDirSync(DATA_DIR);

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Middleware: extract and verify user from 'user' cookie
app.use((req, res, next) => {
  const encoded = req.cookies.user;
  if (!encoded) {
    return res.status(401).json({ error: 'Unauthorized: No user cookie found' });
  }
  try {
    const json = base64url.decode(encoded);
    const parsed = JSON.parse(json);
    if (!parsed.email) throw new Error("Missing email");
    req.user = parsed;
    next();
  } catch (err) {
    console.error('Invalid user cookie:', err);
    return res.status(401).json({ error: 'Unauthorized: Invalid user cookie' });
  }
});

// Return authenticated user info
app.get('/api/me', (req, res) => {
  res.json({ user: req.user });
});

// Get user-specific file path
function getUserDataPath(email) {
  const safeEmail = email.replace(/[^a-zA-Z0-9@.-]/g, '_');
  return path.join(DATA_DIR, `${safeEmail}.json`);
}

// Default structure for new users
const defaultData = {
  books: [
    {
      id: 1,
      title: "My First Book",
      chapters: [{ id: 1, title: "Chapter 1", content: "" }],
      selectedChapterId: 1,
      characters: [],
      locations: [],
      plotPoints: [],
      settings: {}
    }
  ],
  selectedBookId: 1
};

// GET current novel data
app.get('/api/novel', async (req, res) => {
  const filePath = getUserDataPath(req.user.email);
  try {
    if (!await fs.pathExists(filePath)) {
      await fs.writeJson(filePath, defaultData, { spaces: 2 });
    }
    const data = await fs.readJson(filePath);
    console.log(`[GET] Loaded data for ${req.user.email}`);
    res.json(data);
  } catch (err) {
    console.error(`Error loading data for ${req.user.email}:`, err);
    res.status(500).json({ error: 'Failed to load data' });
  }
});

// POST updated novel data
app.post('/api/novel', async (req, res) => {
  const filePath = getUserDataPath(req.user.email);
  try {
    await fs.writeJson(filePath, req.body, { spaces: 2 });
    console.log(`[POST] Saved data for ${req.user.email}`);
    res.json({ status: 'saved' });
  } catch (err) {
    console.error(`Error saving data for ${req.user.email}:`, err);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
