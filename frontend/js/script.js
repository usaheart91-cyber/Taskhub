// API Configuration
const API_URL = 'http://localhost:5000/api';
let authToken = localStorage.getItem('authToken');
let currentUserId = localStorage.getItem('userId');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    loadSurveys();
    loadLeaderboard();

    // Event Listeners
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
});

// Auth Functions
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUserId = data.user.id;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('userId', currentUserId);
            localStorage.setItem('username', data.user.username);

            showToast('Login successful!', 'success');
            document.getElementById('loginForm').reset();
            updateAuthUI();
            loadDashboard();
        } else {
            showToast(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        showToast('Connection error: ' + error.message, 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUserId = data.user.id;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('userId', currentUserId);
            localStorage.setItem('username', data.user.username);

            showToast('Registration successful!', 'success');
            document.getElementById('registerForm').reset();
            updateAuthUI();
            loadDashboard();
        } else {
            showToast(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showToast('Connection error: ' + error.message, 'error');
    }
}

function logout() {
    authToken = null;
    currentUserId = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');

    updateAuthUI();
    showToast('Logged out successfully', 'success');
    document.getElementById('dashboard').style.display = 'none';
    scrollToSection('home');
}

function updateAuthUI() {
    const authMenus = document.getElementById('authMenus');
    const userMenus = document.getElementById('userMenus');

    if (authToken) {
        authMenus.style.display = 'none';
        userMenus.style.display = 'flex';
    } else {
        authMenus.style.display = 'flex';
        userMenus.style.display = 'none';
    }
}

// Surveys Functions
async function loadSurveys() {
    try {
        const response = await fetch(`${API_URL}/surveys`);
        const surveys = await response.json();

        const surveysList = document.getElementById('surveysList');
        surveysList.innerHTML = '';

        if (surveys.length === 0) {
            surveysList.innerHTML = '<p style="text-align: center; color: white;">No surveys available yet</p>';
            return;
        }

        surveys.forEach(survey => {
            const card = document.createElement('div');
            card.className = 'survey-card';
            card.innerHTML = `
                <h3>${survey.title}</h3>
                <p>${survey.description.substring(0, 100)}...</p>
                <p class="time">⏱️ ${survey.estimatedTime} mins</p>
                <p class="points">💰 ${survey.points} Points</p>
                <p style="color: #999; font-size: 0.85rem;">${survey.totalParticipants} completed</p>
            `;
            card.onclick = () => viewSurvey(survey);
            surveysList.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading surveys:', error);
        showToast('Failed to load surveys', 'error');
    }
}

function viewSurvey(survey) {
    if (!authToken) {
        showToast('Please login first', 'error');
        scrollToSection('login');
        return;
    }

    document.getElementById('surveyTitle').textContent = survey.title;
    document.getElementById('surveyDescription').textContent = survey.description;
    document.getElementById('surveyPoints').textContent = survey.points;
    document.getElementById('surveyTime').textContent = survey.estimatedTime;
    document.getElementById('surveyParticipants').textContent = survey.totalParticipants;
    document.getElementById('completeSurveyBtn').dataset.surveyId = survey._id;

    document.getElementById('surveyModal').style.display = 'block';
}

function closeSurveyModal() {
    document.getElementById('surveyModal').style.display = 'none';
}

async function completeSurvey() {
    const surveyId = document.getElementById('completeSurveyBtn').dataset.surveyId;

    try {
        const response = await fetch(`${API_URL}/surveys/${surveyId}/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            showToast(`🎉 +${data.pointsEarned} Points earned!`, 'success');
            closeSurveyModal();
            loadSurveys();
            loadDashboard();
        } else {
            showToast(data.error || 'Failed to complete survey', 'error');
        }
    } catch (error) {
        showToast('Connection error: ' + error.message, 'error');
    }
}

// Leaderboard Functions
async function loadLeaderboard() {
    try {
        const response = await fetch(`${API_URL}/users/leaderboard`);
        const leaderboard = await response.json();

        const table = document.getElementById('leaderboardTable');
        
        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Username</th>
                        <th>Points</th>
                        <th>Joined</th>
                    </tr>
                </thead>
                <tbody>
        `;

        leaderboard.forEach((user, index) => {
            const rank = index + 1;
            let rankClass = '';
            if (rank === 1) rankClass = 'first';
            else if (rank === 2) rankClass = 'second';
            else if (rank === 3) rankClass = 'third';

            const joinDate = new Date(user.joinedAt).toLocaleDateString();

            html += `
                <tr>
                    <td><span class="rank ${rankClass}">🥇 #${rank}</span></td>
                    <td>${user.username}</td>
                    <td><strong>${user.points}</strong></td>
                    <td>${joinDate}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        table.innerHTML = html;
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

// Dashboard Functions
async function loadDashboard() {
    if (!authToken || !currentUserId) return;

    try {
        const response = await fetch(`${API_URL}/users/${currentUserId}/dashboard`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();

        document.getElementById('userPoints').textContent = data.points;
        document.getElementById('surveysCompleted').textContent = data.surveysCompleted;
        document.getElementById('referralPoints').textContent = data.referralPoints;
        document.getElementById('referralCode').textContent = data.referralCode || 'N/A';

        document.getElementById('dashboard').style.display = 'block';
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function copyReferralCode() {
    const code = document.getElementById('referralCode').textContent;
    if (code === 'N/A') {
        showToast('Referral code not available', 'error');
        return;
    }

    navigator.clipboard.writeText(code);
    showToast('Referral code copied!', 'success');
}

// Utility Functions
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

function switchForm(formType) {
    document.getElementById('login').style.display = formType === 'login' ? 'flex' : 'none';
    document.getElementById('register').style.display = formType === 'register' ? 'flex' : 'none';
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('surveyModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Logout button
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});
