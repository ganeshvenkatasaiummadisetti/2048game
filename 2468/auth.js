// Simple client-side auth manager using localStorage
const USERS_KEY = 'game_users_v1';
const CURRENT_USER_KEY = 'game_current_user';

function getUsers() {
    try {
        const raw = localStorage.getItem(USERS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function findUser(username) {
    const users = getUsers();
    return users.find(u => u.username === username);
}

function registerUser(username, password) {
    if (!username || !password) return { ok: false, error: 'Username and password are required.' };
    username = username.trim();
    if (findUser(username)) return { ok: false, error: 'Username already exists.' };
    const users = getUsers();
    users.push({ username, password, createdAt: Date.now(), bestScore: 0, bestTile: 0 });
    saveUsers(users);
    return { ok: true };
}

function updateUserBest(username, score, tile) {
    if (!username) return;
    const users = getUsers();
    const u = users.find(x => x.username === username);
    if (!u) return;
    let changed = false;
    if (typeof score === 'number' && score > (u.bestScore || 0)) {
        u.bestScore = score;
        changed = true;
    }
    if (typeof tile === 'number' && tile > (u.bestTile || 0)) {
        u.bestTile = tile;
        changed = true;
    }
    if (changed) saveUsers(users);
}

function getUserBest(username) {
    if (!username) return null;
    const u = findUser(username);
    if (!u) return null;
    return { bestScore: u.bestScore || 0, bestTile: u.bestTile || 0 };
}

function loginUser(username, password) {
    if (!username || !password) return { ok: false, error: 'Username and password are required.' };
    const u = findUser(username.trim());
    if (!u) return { ok: false, error: 'User not found.' };
    if (u.password !== password) return { ok: false, error: 'Invalid password.' };
    localStorage.setItem(CURRENT_USER_KEY, u.username);
    return { ok: true };
}

function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
}

function getCurrentUser() {
    return localStorage.getItem(CURRENT_USER_KEY);
}

function initAuthUI() {
    // If user-area exists on the page, render appropriate controls
    const ua = document.getElementById('user-area');
    if (!ua) return;
    ua.innerHTML = '';
    const cur = getCurrentUser();
    if (cur) {
        const span = document.createElement('span');
        span.textContent = `Hello, ${cur}`;
        span.style.fontWeight = '700';
        ua.appendChild(span);
        const outBtn = document.createElement('button');
        outBtn.className = 'restart-btn';
        outBtn.textContent = 'Logout';
        outBtn.addEventListener('click', () => { logout(); window.location.href = 'login.html'; });
        ua.appendChild(outBtn);
    } else {
        const loginLink = document.createElement('a');
        loginLink.href = 'login.html';
        loginLink.textContent = 'Login';
        loginLink.style.color = 'inherit';
        loginLink.style.fontWeight = '700';
        loginLink.style.textDecoration = 'none';
        ua.appendChild(loginLink);

        const sep = document.createElement('span');
        sep.textContent = '|';
        sep.style.opacity = '0.6';
        ua.appendChild(sep);

        const regLink = document.createElement('a');
        regLink.href = 'register.html';
        regLink.textContent = 'Register';
        regLink.style.color = 'inherit';
        regLink.style.fontWeight = '700';
        regLink.style.textDecoration = 'none';
        ua.appendChild(regLink);
    }
}

function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark-mode', isDark);
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
        toggle.textContent = isDark ? '☀️' : '🌙';
        toggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
    try {
        localStorage.setItem('game_theme', theme);
    } catch (e) {}
}

function initThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    const savedTheme = localStorage.getItem('game_theme');
    applyTheme(savedTheme === 'dark' ? 'dark' : 'light');

    toggle.addEventListener('click', () => {
        const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });
}

// helper for forms on login/register pages
function wireAuthForms() {
    // register form
    const regForm = document.getElementById('register-form');
    if (regForm) {
        const msg = document.getElementById('register-msg');
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fm = new FormData(regForm);
            const username = fm.get('username');
            const password = fm.get('password');
            const r = registerUser(username, password);
            if (!r.ok) {
                if (msg) msg.textContent = r.error;
                return;
            }
            // auto-login and redirect to index
            loginUser(username, password);
            location.href = 'index.html';
        });
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const msg = document.getElementById('login-msg');
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fm = new FormData(loginForm);
            const username = fm.get('username');
            const password = fm.get('password');
            const r = loginUser(username, password);
            if (!r.ok) {
                if (msg) msg.textContent = r.error;
                return;
            }
            location.href = 'index.html';
        });
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initAuthUI();
    initThemeToggle();
    wireAuthForms();
});
