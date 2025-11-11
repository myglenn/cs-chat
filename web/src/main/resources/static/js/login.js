const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

document.addEventListener('DOMContentLoaded', () => {

    const loginLogoDiv = document.getElementById('loginLogo');
    if (loginLogoDiv) {
        loginLogoDiv.innerHTML = '';
        loginLogoDiv.appendChild(Icon({ type: 'logo' }));
    }

    if (loginForm) {
        const savedLoginId = localStorage.getItem('savedLoginId');
        if (savedLoginId) {
            loginForm.loginId.value = savedLoginId;
            loginForm.saveId.checked = true;
        }
    }

    const togglePasswordBtn = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');

    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.appendChild(Icon({ type: 'eye', size: 20 }));

        togglePasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            togglePasswordBtn.innerHTML = '';
            if (type === 'password') {
                togglePasswordBtn.appendChild(Icon({ type: 'eye', size: 20 }));
            } else {
                togglePasswordBtn.appendChild(Icon({ type: 'eyeOff', size: 20 }));
            }
        });
    }

    if (!!loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            CustomAlert.show({
                title: '관리자 문의',
                message: '비밀번호 초기화는 관리자에게 문의하세요.\n\n[관리자 연락처]\n- 연락처: 02-1234-5678\n- 이메일: admin@example.com',
                type: 'info',
                confirmText: '확인'
            });
        });
    }

});

async function handleLogin(event) {
    event.preventDefault();

    errorMessage.textContent = '';
    const loginId = loginForm.loginId.value;
    const password = loginForm.password.value;
    const saveId = loginForm.saveId.checked;
    const rememberMe = loginForm.rememberMe.checked;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ loginId, password })
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const tokenData = await response.json();

        if (saveId) {
            localStorage.setItem('savedLoginId', loginId);
        } else {
            localStorage.removeItem('savedLoginId');
        }

        apiClient.setToken(tokenData.accessToken, rememberMe);
        window.location.href = '/';

    } catch (error) {
        console.error('Error:', error);
        Toast.error('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
}