// Signup form with client-side validation, a password strength meter and accessible errors.
const form = document.getElementById('signup');
const TAKEN_EMAILS = ['taken@example.com', 'admin@example.com'];

function age(isoDate, today = new Date()) {
  const d = new Date(isoDate + 'T00:00:00');
  let years = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) years--;
  return years;
}

function passwordScore(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;
  return score;
}

const validators = {
  fullName: (v) => {
    const s = v.trim();
    if (!s) return 'Full name is required';
    if (s.length < 2) return 'Full name must be at least 2 characters';
    if (!/^[\p{L}' -]+$/u.test(s)) return 'Full name can only contain letters, spaces, hyphens and apostrophes';
    return '';
  },
  email: (v) => {
    const s = v.trim().toLowerCase();
    if (!s) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) return 'Enter a valid email address';
    if (TAKEN_EMAILS.includes(s)) return 'An account with this email already exists';
    return '';
  },
  password: (v) => {
    if (!v) return 'Password is required';
    if (v.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(v)) return 'Password must contain an uppercase letter';
    if (!/\d/.test(v)) return 'Password must contain a number';
    if (!/[^A-Za-z0-9]/.test(v)) return 'Password must contain a symbol';
    return '';
  },
  confirmPassword: (v) => {
    if (!v) return 'Please confirm your password';
    if (v !== form.password.value) return 'Passwords do not match';
    return '';
  },
  birthDate: (v) => {
    if (!v) return 'Date of birth is required';
    if (new Date(v + 'T00:00:00') > new Date()) return 'Date of birth cannot be in the future';
    if (age(v) < 18) return 'You must be at least 18 years old';
    return '';
  },
  country: (v) => (v ? '' : 'Please select a country'),
  terms: (_v, el) => (el.checked ? '' : 'You must accept the terms and conditions'),
};

function validateField(name) {
  const el = form.elements[name];
  const message = validators[name](el.value, el);
  document.getElementById(`${name}-error`).textContent = message;
  el.setAttribute('aria-invalid', message ? 'true' : 'false');
  return !message;
}

function updateStrength() {
  const pw = form.password.value;
  const score = passwordScore(pw);
  const levels = ['Weak', 'Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#b42318', '#b42318', '#b42318', '#d97706', '#2f9e44', '#1a7f37'];
  document.getElementById('strength-label').textContent = pw ? levels[score] : '—';
  const bar = document.getElementById('strength-bar');
  bar.style.width = `${(score / 5) * 100}%`;
  bar.style.background = colors[score];
}

// Validate a field when the user leaves it; re-validate live once it has been flagged.
for (const name of Object.keys(validators)) {
  const el = form.elements[name];
  el.addEventListener('blur', () => validateField(name));
  el.addEventListener('input', () => {
    if (el.getAttribute('aria-invalid') === 'true') validateField(name);
    if (name === 'password') {
      updateStrength();
      if (form.confirmPassword.value) validateField('confirmPassword');
    }
  });
  el.addEventListener('change', () => {
    if (el.type === 'checkbox' || el.tagName === 'SELECT') validateField(name);
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const results = Object.keys(validators).map((name) => [name, validateField(name)]);
  const firstInvalid = results.find(([, ok]) => !ok);
  if (firstInvalid) {
    form.elements[firstInvalid[0]].focus();
    return;
  }
  document.getElementById('success-email').textContent = form.email.value.trim().toLowerCase();
  form.hidden = true;
  const success = document.getElementById('success');
  success.hidden = false;
  success.focus();
});
