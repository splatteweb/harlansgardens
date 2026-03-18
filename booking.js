// ── CONFIG ────────────────────────────────────────────────────────────────────
// After deploying the Google Apps Script Web App, paste your /exec URL here.
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

// ── DOM REFS ──────────────────────────────────────────────────────────────────
const fab          = document.getElementById('bookFab');
const overlay      = document.getElementById('bookOverlay');
const closeBtn     = document.getElementById('bookClose');
const form         = document.getElementById('bookForm');
const statusEl     = document.getElementById('bookStatus');
const addressField = document.getElementById('addressField');
const addressInput = document.getElementById('bookAddress');
const submitBtn    = document.getElementById('bookSubmit');
const toggleBtns   = document.querySelectorAll('.book-toggle-btn');

// ── STATE ─────────────────────────────────────────────────────────────────────
let consultationType = 'call';

// ── MODAL OPEN / CLOSE ────────────────────────────────────────────────────────
function openModal() {
  overlay.classList.add('open');
  overlay.removeAttribute('aria-hidden');
  document.body.style.overflow = 'hidden';
  document.getElementById('bookName').focus();
}

function closeModal() {
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

fab.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// ── TYPE TOGGLE ───────────────────────────────────────────────────────────────
toggleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    toggleBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    consultationType = btn.dataset.type;

    const isInPerson = consultationType === 'onsite';
    addressField.hidden = !isInPerson;
    addressInput.required = isInPerson;
  });
});

// ── FORM SUBMIT ───────────────────────────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const payload = {
    type:     consultationType,
    name:     document.getElementById('bookName').value.trim(),
    phone:    document.getElementById('bookPhone').value.trim(),
    address:  consultationType === 'onsite' ? addressInput.value.trim() : '',
    datetime: document.getElementById('bookDatetime').value || '',
    source:   'booking-widget',
    // calendarEventId: reserved for future Google Calendar integration
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';
  statusEl.textContent = '';
  statusEl.className = 'book-status';

  try {
    // Google Apps Script Web Apps don't return CORS headers, so we use
    // no-cors mode. The request fires successfully but the response is
    // opaque — we optimistically show success and rely on the sheet as
    // the source of truth. Network failures are caught in the catch block.
    await fetch(APPS_SCRIPT_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    statusEl.textContent = "Thanks! Harlan will be in touch within one business day.";
    statusEl.classList.add('book-status--success');
    resetForm();

  } catch {
    statusEl.textContent = "Something went wrong — please call us directly at (555) 000-0000.";
    statusEl.classList.add('book-status--error');

  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Request Consultation';
  }
});

function resetForm() {
  form.reset();
  consultationType = 'call';
  toggleBtns.forEach(b => b.classList.remove('active'));
  document.getElementById('toggleCall').classList.add('active');
  addressField.hidden = true;
  addressInput.required = false;
}
