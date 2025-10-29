const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

async function handleLogin(event) {
    event.preventDefault();

    errorMessage.textContent = '';
    const loginId = loginForm.loginId.value;
    const password = loginForm.password.value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ loginId, password })
        });

        if (!response.ok) { throw new Error('Login failed'); }

        const tokenData = await response.json();

        apiClient.setToken(tokenData.accessToken);
        window.location.href = '/';

    } catch (error) {
        console.error('Error:', error);
        Toast.error('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
}

if (!!loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}