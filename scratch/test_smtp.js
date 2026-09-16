const nodemailer = require('nodemailer');
const fs = require('fs');

// Read .env.local manually
const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, v] = line.trim().split('=');
  if (k && v) env[k] = v;
});

const transporter = nodemailer.createTransport({
  host: env.BREVO_SMTP_HOST,
  port: Number(env.BREVO_SMTP_PORT),
  secure: false,
  auth: {
    user: env.BREVO_SMTP_USER,
    pass: env.BREVO_SMTP_KEY,
  },
  tls: { rejectUnauthorized: false }
});

transporter.verify((err, success) => {
  if (err) {
    console.error('SMTP verify result: FAILED ->', err.message);
  } else {
    console.log('SMTP verify result: SUCCESS ->', success);
  }
});
