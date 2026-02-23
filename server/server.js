require('dotenv').config();

const crypto = require('crypto');
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
const COOKIE_SIGNING_SECRET = process.env.SECURE_AUTH_SECRET || process.env.FLASK_SECRET_KEY || '';
const DATA_ENCRYPTION_SECRET = process.env.DATA_ENCRYPTION_KEY || COOKIE_SIGNING_SECRET;
const ENCRYPTION_KEY = DATA_ENCRYPTION_SECRET
  ? crypto.createHash('sha256').update(DATA_ENCRYPTION_SECRET).digest()
  : null;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://novel.blahpunk.com,http://localhost:3000,http://localhost:7692')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const ALLOWED_ORIGIN_SET = new Set(ALLOWED_ORIGINS);

if (!COOKIE_SIGNING_SECRET) {
  throw new Error('SECURE_AUTH_SECRET (or FLASK_SECRET_KEY) is required to verify user cookies.');
}

if (!ENCRYPTION_KEY) {
  throw new Error('DATA_ENCRYPTION_KEY (or SECURE_AUTH_SECRET) is required for encrypted data storage.');
}

fs.ensureDirSync(DATA_DIR);
try {
  fs.chmodSync(DATA_DIR, 0o700);
} catch (err) {
  console.warn('[security] Could not set data directory permissions:', err.message);
}

app.disable('x-powered-by');

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGIN_SET.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(bodyParser.json({ limit: '2mb' }));
app.use(cookieParser());

function timingSafeCompare(a, b) {
  const aBuffer = Buffer.from(a, 'utf8');
  const bBuffer = Buffer.from(b, 'utf8');
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function signCookie(cookieValue) {
  return crypto.createHmac('sha256', COOKIE_SIGNING_SECRET).update(cookieValue).digest('hex');
}

function parseAndVerifyUserCookie(req) {
  const encodedUser = req.cookies.user;
  const providedSignature = req.cookies.user_sig;
  if (!encodedUser || !providedSignature) {
    throw new Error('Missing auth cookies');
  }

  const expectedSignature = signCookie(encodedUser);
  if (!timingSafeCompare(expectedSignature, providedSignature)) {
    throw new Error('Invalid cookie signature');
  }

  const decoded = base64url.decode(encodedUser);
  const parsed = JSON.parse(decoded);
  if (!parsed.email) {
    throw new Error('Missing email in auth payload');
  }
  return parsed;
}

function isEncryptedRecord(payload) {
  return (
    payload &&
    payload.encrypted === true &&
    payload.algorithm === 'aes-256-gcm' &&
    typeof payload.iv === 'string' &&
    typeof payload.tag === 'string' &&
    typeof payload.ciphertext === 'string'
  );
}

function encryptPayload(plainObject) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  const plaintext = Buffer.from(JSON.stringify(plainObject), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    encrypted: true,
    version: 1,
    algorithm: 'aes-256-gcm',
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    ciphertext: ciphertext.toString('base64'),
    updatedAt: new Date().toISOString(),
  };
}

function decryptPayload(encryptedRecord) {
  const iv = Buffer.from(encryptedRecord.iv, 'base64');
  const tag = Buffer.from(encryptedRecord.tag, 'base64');
  const ciphertext = Buffer.from(encryptedRecord.ciphertext, 'base64');

  const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(plaintext.toString('utf8'));
}

async function writeEncryptedData(filePath, payload) {
  const encrypted = encryptPayload(payload);
  await fs.writeFile(filePath, JSON.stringify(encrypted, null, 2), {
    encoding: 'utf8',
    mode: 0o600,
  });
  try {
    fs.chmodSync(filePath, 0o600);
  } catch (err) {
    console.warn('[security] Could not set file permissions:', err.message);
  }
}

async function readAndDecryptUserData(filePath, fallbackData) {
  if (!(await fs.pathExists(filePath))) {
    await writeEncryptedData(filePath, fallbackData);
    return fallbackData;
  }

  const stored = await fs.readJson(filePath);
  if (isEncryptedRecord(stored)) {
    return decryptPayload(stored);
  }

  // Legacy plaintext migration path.
  await writeEncryptedData(filePath, stored);
  return stored;
}

function isValidNovelData(payload) {
  if (!payload || typeof payload !== 'object') return false;
  if (!Array.isArray(payload.books)) return false;
  if (!Object.prototype.hasOwnProperty.call(payload, 'selectedBookId')) return false;
  return true;
}

// Middleware: extract and verify user from signed cookies.
app.use((req, res, next) => {
  try {
    req.user = parseAndVerifyUserCookie(req);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

// Return authenticated user info.
app.get('/api/me', (req, res) => {
  res.json({ user: req.user });
});

function getUserDataPath(email) {
  const safeEmail = email.replace(/[^a-zA-Z0-9@.-]/g, '_');
  return path.join(DATA_DIR, `${safeEmail}.json`);
}

const defaultData = {
  books: [
    {
      id: 1,
      title: 'My First Book',
      chapters: [{ id: 1, title: 'Chapter 1', content: {}, goalWords: 1200 }],
      selectedChapterId: 1,
      characters: [],
      locations: [],
      plotPoints: [],
      settings: {},
    },
  ],
  selectedBookId: 1,
};

app.get('/api/novel', async (req, res) => {
  const filePath = getUserDataPath(req.user.email);
  try {
    const data = await readAndDecryptUserData(filePath, defaultData);
    res.json(data);
  } catch (err) {
    console.error(`[GET] Failed loading data for ${req.user.email}:`, err.message);
    res.status(500).json({ error: 'Failed to load data' });
  }
});

app.post('/api/novel', async (req, res) => {
  const filePath = getUserDataPath(req.user.email);
  const payload = req.body;
  if (!isValidNovelData(payload)) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  try {
    await writeEncryptedData(filePath, payload);
    res.json({ status: 'saved' });
  } catch (err) {
    console.error(`[POST] Failed saving data for ${req.user.email}:`, err.message);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
