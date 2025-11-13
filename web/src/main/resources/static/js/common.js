window.authReady = new Promise(resolve => {
    window.resolveAuthReady = resolve;
});

window.codesReady = new Promise(resolve => {
    window.resolveCodesReady = resolve;
});

let activeFocusTrap = null;
const AppState = {
    theme: localStorage.getItem('theme') || 'light',
    currentUser: null
};

async function loadCommonCodes() {
    const codeGroupsToLoad = ['CHN_CATEGORY', 'USR_ROLE', 'CHN_STATUS'];

    try {
        const results = await Promise.all(
            codeGroupsToLoad.map(groupCode =>
                apiClient.get(`/common-codes/${groupCode}`)
                    .catch(error => {
                        console.error(`Failed to load common codes for group ${groupCode}:`, error);
                        return [];
                    })
            )
        );
        if (!AppState.commonCodes) {
            AppState.commonCodes = {};
        }
        codeGroupsToLoad.forEach((groupCode, index) => {
            AppState.commonCodes[groupCode] = results[index] || [];
        });
        

        window.resolveCodesReady();

    } catch (error) {
        console.error("Failed to load common codes:", error);
        Toast.error("초기 설정 로딩 실패");
        if (!AppState.commonCodes) {
            AppState.commonCodes = {};
        }
        codeGroupsToLoad.forEach(groupCode => {
            if (!AppState.commonCodes[groupCode]) {
                AppState.commonCodes[groupCode] = [];
            }
        });
        window.resolveCodesReady();
    }
}

function getCodeName(groupCode, code) {
    if (AppState.commonCodes && AppState.commonCodes[groupCode]) {
        const foundCode = AppState.commonCodes[groupCode].find(c => c.code === code);
        return foundCode ? foundCode.name : code;
    }
    return code;
}

async function fetchAndSetCurrentUser() {
    try {
        const userInfo = await apiClient.get('/user/me');
        AppState.currentUser = userInfo;
        const userNameEl = document.getElementById('usrNameDisplay');
        if (userNameEl) userNameEl.textContent = AppState.currentUser.name;
        window.resolveAuthReady();
    } catch (error) {
        console.error("Failed to fetch current user info:", error);
        apiClient.clearToken();
        window.location.href = '/login';
    }
}

function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const themeToggleMobile = document.getElementById('themeToggleMobile');

    if (AppState.theme === 'dark') {
        document.documentElement.classList.add('dark');

        if (themeToggle) {
            themeToggle.innerHTML = '';
            themeToggle.appendChild(Icon({ type: 'sunHeader', size: 16 }));
        }
        if (themeToggleMobile) {
            themeToggleMobile.innerHTML = '';
            themeToggleMobile.appendChild(Icon({ type: 'sunHeader', size: 16 }));
        }
    } else {
        document.documentElement.classList.remove('dark');
        if (themeToggle) {
            themeToggle.innerHTML = '';
            themeToggle.appendChild(Icon({ type: 'moonHeader', size: 16 }));
        }
        if (themeToggleMobile) {
            themeToggleMobile.innerHTML = '';
            themeToggleMobile.appendChild(Icon({ type: 'moonHeader', size: 16 }));
        }
    }
}

function toggleTheme() {
    AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', AppState.theme);
    initTheme();
}

function manageFocusTrap(element) {
    const focusableElements = element.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled])'
    );

    if (focusableElements.length === 0) return;

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            closeAgencyModal();
        }

        if (event.key !== 'Tab') {
            return;
        }

        if (event.shiftKey) {
            if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                event.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                event.preventDefault();
            }
        }
    };

    document.addEventListener('keydown', handleKeyDown);

    setTimeout(() => {
        firstFocusableElement.focus();
    }, 100);

    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
}

function initDropdowns() {
    const userToggle = document.getElementById('userToggle');
    const userMenu = document.getElementById('userMenu');

    if (userToggle && userMenu) {
        userToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.classList.toggle('active');
        });
    }

    const userToggleMobile = document.getElementById('userToggleMobile');
    const userMenuMobile = document.getElementById('userMenuMobile');

    if (userToggleMobile && userMenuMobile) {
        userToggleMobile.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenuMobile.classList.toggle('active');
        });
    }

    document.addEventListener('click', () => {
        if (userMenu) userMenu.classList.remove('active');
        if (userMenuMobile) userMenuMobile.classList.remove('active');
    });
}

function initMobileSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarMobile = document.getElementById('sidebarMobile');

    function openSidebar() {
        if (sidebarOverlay && sidebarMobile) {
            sidebarOverlay.classList.add('active');
            sidebarMobile.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeSidebarFn() {
        if (sidebarOverlay && sidebarMobile) {
            sidebarOverlay.classList.remove('active');
            sidebarMobile.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', openSidebar);
    }

    if (closeSidebar) {
        closeSidebar.addEventListener('click', closeSidebarFn);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebarFn);
    }


    const mobileMenuItems = document.querySelectorAll('.sidebar-item-mobile');
    mobileMenuItems.forEach(item => {
        item.addEventListener('click', closeSidebarFn);
    });
}

const Toast = {
    container: null,

    init() {
        this.container = document.getElementById('toastContainer');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toastContainer';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },

    show(message, type = 'info') {
        if (!this.container) this.init();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        let iconType = type;
        switch (type) {
            case 'success':
                iconType = 'success';
                break;
            case 'error':
                iconType = 'error';
                break;
            case 'info':
                iconType = 'info';
                break;
            case 'warning':
                iconType = 'warning';
                break;
            default:
                iconType = 'info';
        }

        const iconElement = Icon({type: iconType, size: 20});
        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;
        toast.innerHTML = '';
        if (iconElement) {
            toast.appendChild(iconElement);
        }
        toast.appendChild(messageSpan);
        this.container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 200);
        }, 3000);
    },

    success(message) {
        this.show(message, 'success');
    },

    error(message) {
        this.show(message, 'error');
    },

    info(message) {
        this.show(message, 'info');
    },

    warning(message) {
        this.show(message, 'warning');
    }
};


const CustomAlert = {
    container: null,

    init() {
        if (this.container) return;


        this.container = document.createElement('div');
        this.container.id = 'customAlertContainer';
        this.container.className = 'custom-alert-overlay';
        this.container.style.display = 'none';


        const content = document.createElement('div');
        content.className = 'custom-alert-content';


        const header = document.createElement('div');
        header.className = 'custom-alert-header';
        const title = document.createElement('h3');
        title.className = 'custom-alert-title';
        title.id = 'customAlertTitle';
        header.appendChild(title);


        const body = document.createElement('div');
        body.className = 'custom-alert-body';
        const icon = document.createElement('div');
        icon.className = 'custom-alert-icon';
        icon.id = 'customAlertIcon';
        const message = document.createElement('p');
        message.className = 'custom-alert-message';
        message.id = 'customAlertMessage';
        body.append(icon, message);


        const footer = document.createElement('div');
        footer.className = 'custom-alert-footer';
        footer.id = 'customAlertFooter';


        content.append(header, body, footer);
        this.container.appendChild(content);
        document.body.appendChild(this.container);
    },

    show(options) {
        this.init();
        const {
            title = '알림',
            message,
            type = 'info',
            confirmText = '확인',
            cancelText = '취소',
            onConfirm,
            onCancel
        } = options;

        document.getElementById('customAlertTitle').textContent = title;
        document.getElementById('customAlertMessage').textContent = message;

        const iconContainer = document.getElementById('customAlertIcon');
        iconContainer.innerHTML = '';
        const iconType = (type === 'confirm') ? 'warning' : type;
        const iconElement = Icon({
            type: iconType,
            className: `icon-${iconType}`,
            size: 32
        });
        if (iconElement) {
            iconContainer.appendChild(iconElement);
        }

        const footer = document.getElementById('customAlertFooter');
        footer.innerHTML = '';

        if (type === 'confirm') {
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn btn-outline';
            cancelBtn.textContent = cancelText;
            cancelBtn.addEventListener('click', () => {
                this.hide();
                if (onCancel) onCancel();
            });

            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'btn btn-primary';
            confirmBtn.textContent = confirmText;
            confirmBtn.addEventListener('click', () => {
                this.hide();
                if (onConfirm) onConfirm();
            });
            footer.append(cancelBtn, confirmBtn);
        } else {
            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'btn btn-primary w-full';
            confirmBtn.textContent = confirmText;
            confirmBtn.addEventListener('click', () => {
                this.hide();
                if (onConfirm) onConfirm();
            });
            footer.appendChild(confirmBtn);
        }

        this.container.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    },

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
            document.body.style.overflow = '';
        }
    },

    info(message, onConfirm) {
        this.show({title: '알림', message, type: 'info', onConfirm});
    },

    success(message, onConfirm) {
        this.show({title: '성공', message, type: 'success', onConfirm});
    },

    warning(message, onConfirm) {
        this.show({title: '경고', message, type: 'warning', onConfirm});
    },

    error(message, onConfirm) {
        this.show({title: '오류', message, type: 'error', onConfirm});
    },

    confirm(titleOrMessage, messageOrOnConfirm, onConfirmOrOnCancel, onCancel) {
        if (typeof messageOrOnConfirm === 'function') {
            this.show({
                title: '확인',
                message: titleOrMessage,
                type: 'confirm',
                onConfirm: messageOrOnConfirm,
                onCancel: onConfirmOrOnCancel
            });
        } else {
            this.show({
                title: titleOrMessage,
                message: messageOrOnConfirm,
                type: 'confirm',
                onConfirm: onConfirmOrOnCancel,
                onCancel: onCancel
            });
        }
    }
};


const Modal = {
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    initCloseButtons() {

        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });


        document.querySelectorAll('[data-modal-close]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.getAttribute('data-modal-close');
                Modal.close(modalId);
            });
        });
    }
};

function createPagination(pageData, onPageChange) {
    if (!pageData || pageData.totalElements === 0) {
        return document.createElement('div');
    }

    const totalPages = pageData.totalPages;
    const currentPage = pageData.number + 1;

    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.innerHTML = '‹';
    prevBtn.disabled = pageData.first;
    prevBtn.addEventListener('click', () => {
        if (!pageData.first) onPageChange(currentPage - 1);
    });
    paginationContainer.appendChild(prevBtn);

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        const firstBtn = document.createElement('button');
        firstBtn.className = 'pagination-btn';
        firstBtn.textContent = '1';
        firstBtn.addEventListener('click', () => onPageChange(1));
        paginationContainer.appendChild(firstBtn);

        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
    }


    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'pagination-btn';
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => onPageChange(i));
        paginationContainer.appendChild(pageBtn);
    }


    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }

        const lastBtn = document.createElement('button');
        lastBtn.className = 'pagination-btn';
        lastBtn.textContent = totalPages;
        lastBtn.addEventListener('click', () => onPageChange(totalPages));
        paginationContainer.appendChild(lastBtn);
    }
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.innerHTML = '›';
    nextBtn.disabled = pageData.last;
    nextBtn.addEventListener('click', () => {
        if (!pageData.last) onPageChange(currentPage + 1);
    });
    paginationContainer.appendChild(nextBtn);

    return paginationContainer;
}

const Validation = {
    email(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    phone(phone) {
        return /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(phone);
    },

    required(value) {
        return value && value.trim().length > 0;
    },

    minLength(value, length) {
        return value && value.length >= length;
    },

    match(value1, value2) {
        return value1 === value2;
    }
};

function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function filterData(data, searchTerm, fields) {
    if (!searchTerm || searchTerm.trim() === '') return data;

    const term = searchTerm.toLowerCase();
    return data.filter(item => {
        return fields.some(field => {
            const value = item[field];
            return value && value.toString().toLowerCase().includes(term);
        });
    });
}

function initProfileModal() {
    const openProfileBtn = document.getElementById('openProfileModal');
    const openProfileBtnMobile = document.getElementById('openProfileModalMobile');

    if (openProfileBtn) {
        openProfileBtn.addEventListener('click', () => {
            showProfileModal();
        });
    }

    if (openProfileBtnMobile) {
        openProfileBtnMobile.addEventListener('click', () => {
            showProfileModal();
        });
    }
}


function createProfileForm(user) {
    const form = document.createElement('form');
    form.className = 'modal-form';
    form.id = 'profileForm';


    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'profileName';
    nameInput.className = 'form-input';
    nameInput.value = user.name || '';


    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.id = 'profileEmail';
    emailInput.className = 'form-input';
    emailInput.value = user.loginId || '';
    emailInput.readOnly = true;



    form.append(
        createFormGroup('profileName', '이름', nameInput, 'profileNameError'),
        createFormGroup('profileEmail', '아이디', emailInput, 'profileEmailError')
    );


    const passwordGroup = document.createElement('div');
    passwordGroup.className = 'form-group';
    const passwordLabel = document.createElement('label');
    passwordLabel.className = 'form-label';
    passwordLabel.textContent = '비밀번호';
    const passwordChangeBtn = document.createElement('button');
    passwordChangeBtn.type = 'button';
    passwordChangeBtn.className = 'btn btn-outline w-full';
    passwordChangeBtn.textContent = '비밀번호 변경';


    passwordChangeBtn.addEventListener('click', () => {
        const currentUser = AppState.currentUser;
        if (!currentUser) return;
        openPasswordChangeModal({
            targetId: currentUser.id,
            targetName: "내",
            apiEndpoint: `/user/me/password`,
            requireCurrentPassword: true,
            onSuccess: () => {
                Toast.success("비밀번호가 변경되었습니다.");
            }
        });
    });
    passwordGroup.append(passwordLabel, passwordChangeBtn);
    form.appendChild(passwordGroup);

    return form;
}


function showProfileModal() {
    if (!AppState.currentUser) {
        Toast.warning('사용자 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }
    closeProfileModal();

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'profileModal';
    modalOverlay.className = 'modal-overlay active';
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    const modalTitle = document.createElement('h2');
    modalTitle.className = 'modal-title';
    modalTitle.textContent = '정보수정';
    const closeButton = document.createElement('button');
    closeButton.className = 'modal-close';
    closeButton.addEventListener('click', closeProfileModal);
    closeButton.appendChild(Icon({type: 'close', size: 20}));
    modalHeader.append(modalTitle, closeButton);

    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    const profileForm = createProfileForm(AppState.currentUser);
    modalBody.appendChild(profileForm);

    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn btn-outline';
    cancelBtn.textContent = '취소';
    cancelBtn.addEventListener('click', closeProfileModal);
    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'btn btn-primary';
    saveBtn.textContent = '수정';
    saveBtn.addEventListener('click', saveProfile);
    modalFooter.append(cancelBtn, saveBtn);

    modalContent.append(modalHeader, modalBody, modalFooter);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    document.body.style.overflow = 'hidden';
}


function openPasswordChangeModal(options) {

    const {targetId, targetName, apiEndpoint, onSuccess, requireCurrentPassword = false} = options;

    closePasswordChangeModal();

    let isCurrentPasswordVerified = false;


    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'passwordChangeModal';
    modalOverlay.className = 'modal-overlay active registration-modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    const modalTitle = document.createElement('h2');
    modalTitle.className = 'modal-title';
    modalTitle.textContent = `${targetName} 비밀번호 변경`;
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.addEventListener('click', closePasswordChangeModal);
    closeBtn.appendChild(Icon({type: 'close', size: 20}));
    modalHeader.append(modalTitle, closeBtn);


    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    const form = document.createElement('form');
    form.className = 'modal-form';
    form.addEventListener('submit', e => e.preventDefault());


    let currentPasswordInput = null;
    if (requireCurrentPassword) {
        currentPasswordInput = document.createElement('input');
        currentPasswordInput.type = 'password';
        currentPasswordInput.id = 'currentPassword';
        currentPasswordInput.className = 'form-input';
        currentPasswordInput.placeholder = '현재 비밀번호를 입력하세요';

        currentPasswordInput.addEventListener('focusout', async (e) => {
            const password = e.target.value;
            const errorEl = document.getElementById('currentPasswordError');
            if (!password) {
                errorEl.textContent = '현재 비밀번호를 입력하세요.';
                errorEl.style.color = 'var(--destructive)';
                isCurrentPasswordVerified = false;
                return;
            }
            try {
                const response = await apiClient.post('/user/me/check-password', { password: password });
                if (response.isMatch) {
                    errorEl.textContent = '현재 비밀번호가 일치합니다.';
                    errorEl.style.color = 'var(--success)';
                    isCurrentPasswordVerified = true;
                } else {
                    errorEl.textContent = '현재 비밀번호가 일치하지 않습니다.';
                    errorEl.style.color = 'var(--destructive)';
                    isCurrentPasswordVerified = false;
                }
            } catch (error) {
                errorEl.textContent = '비밀번호 확인 중 오류가 발생했습니다.';
                errorEl.style.color = 'var(--destructive)';
                isCurrentPasswordVerified = false;
            }
        });


        form.appendChild(
            createFormGroup('currentPassword', '현재 비밀번호', currentPasswordInput, 'currentPasswordError')
        );
    }


    const newPasswordInput = document.createElement('input');
    newPasswordInput.type = 'password';
    newPasswordInput.id = 'newPassword';
    newPasswordInput.className = 'form-input';
    newPasswordInput.placeholder = '새 비밀번호를 입력하세요 (6자 이상)';


    const confirmPasswordInput = document.createElement('input');
    confirmPasswordInput.type = 'password';
    confirmPasswordInput.id = 'confirmNewPassword';
    confirmPasswordInput.className = 'form-input';
    confirmPasswordInput.placeholder = '새 비밀번호를 다시 입력하세요';


    form.append(
        createFormGroup('newPassword', '새 비밀번호', newPasswordInput, 'newPasswordError'),
        createFormGroup('confirmNewPassword', '비밀번호 확인', confirmPasswordInput, 'confirmNewPasswordError')
    );
    modalBody.appendChild(form);


    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn btn-outline';
    cancelBtn.textContent = '취소';
    cancelBtn.addEventListener('click', closePasswordChangeModal);

    const submitBtn = document.createElement('button');
    submitBtn.type = 'button';
    submitBtn.className = 'btn btn-primary';
    submitBtn.textContent = '변경';


    submitBtn.addEventListener('click', async () => {
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        let hasError = false;

        if (requireCurrentPassword) {
            if (!currentPasswordInput.value) {
                document.getElementById('currentPasswordError').textContent = '현재 비밀번호를 입력하세요.';
                hasError = true;
            } else {
                document.getElementById('currentPasswordError').textContent = '';
            }
        }

        if (!newPassword) {
            document.getElementById('newPasswordError').textContent = '새 비밀번호를 입력하세요.'; // (사용자님 제안)
            hasError = true;
        } else if (newPassword.length < 6) {
            document.getElementById('newPasswordError').textContent = '비밀번호는 6자 이상이어야 합니다.';
            hasError = true;
        } else {
            document.getElementById('newPasswordError').textContent = '';
        }

        if (newPassword && !confirmPassword) {
            document.getElementById('confirmNewPasswordError').textContent = '새 비밀번호를 다시 입력하세요.';
            hasError = true;
        } else if (newPassword.length > 0 && newPassword !== confirmPassword) {
            document.getElementById('confirmNewPasswordError').textContent = '비밀번호가 일치하지 않습니다.';
            hasError = true;
        } else {
            document.getElementById('confirmNewPasswordError').textContent = '';
        }


        if (hasError) return;


        const payload = {newPassword: newPassword};
        if (requireCurrentPassword) {
            payload.currentPassword = currentPasswordInput.value;
        }

        try {
            await apiClient.put(apiEndpoint, payload);
            Toast.success('비밀번호가 성공적으로 변경되었습니다.');
            closePasswordChangeModal();
            if (onSuccess) onSuccess();
        } catch (error) {
            Toast.error('비밀번호 변경에 실패했습니다.');
            if (error.status === 401 && requireCurrentPassword) {
                document.getElementById('currentPasswordError').textContent = '현재 비밀번호가 일치하지 않습니다.';
            }
            const isPasswordError = error.status === 401 || error.status === 400 || error.status === 403;
            if (isPasswordError && requireCurrentPassword) {
                document.getElementById('currentPasswordError').textContent = '현재 비밀번호가 일치하지 않습니다.';
            }
        }
    });





    modalFooter.append(cancelBtn, submitBtn);


    modalContent.append(modalHeader, modalBody, modalFooter);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    document.body.style.overflow = 'hidden';
}


function closePasswordChangeModal() {
    const modal = document.getElementById('passwordChangeModal');
    if (modal) {
        modal.remove();

    }
}

function showPasswordChangeForm() {
    const modalTitle = document.getElementById('profileModalTitle');
    const profileForm = document.getElementById('profileForm');
    const modalFooter = document.querySelector('#profileModal .modal-footer');

    if (!modalTitle || !profileForm || !modalFooter) {
        console.error('프로필 모달의 일부 요소를 찾을 수 없습니다.');
        return;
    }

    modalTitle.textContent = '비밀번호 변경';

    profileForm.innerHTML = '';
    modalFooter.innerHTML = '';

    const createSafePasswordInput = (id, label, placeholder) => {
        const group = document.createElement('div');
        group.className = 'form-group';
        const labelEl = document.createElement('label');
        labelEl.className = 'form-label';
        labelEl.htmlFor = id;
        labelEl.textContent = label;
        const inputEl = document.createElement('input');
        inputEl.type = 'password';
        inputEl.id = id;
        inputEl.className = 'form-input';
        inputEl.placeholder = placeholder;
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.id = `${id}Error`;
        group.append(labelEl, inputEl, errorEl);
        return group;
    };
    profileForm.append(
        createSafePasswordInput('currentPassword', '현재 비밀번호', '현재 비밀번호를 입력하세요'),
        createSafePasswordInput('newPassword', '새 비밀번호', '새 비밀번호를 입력하세요 (8자 이상)'),
        createSafePasswordInput('confirmPassword', '비밀번호 확인', '새 비밀번호를 다시 입력하세요')
    );

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn btn-outline';
    cancelBtn.textContent = '취소';
    cancelBtn.addEventListener('click', showProfileModal);

    const changeBtn = document.createElement('button');
    changeBtn.type = 'button';
    changeBtn.className = 'btn btn-primary';
    changeBtn.textContent = '변경';
    changeBtn.addEventListener('click', changePassword);

    modalFooter.append(cancelBtn, changeBtn);
}


async function saveProfile() {
    const name = document.getElementById('profileName').value;

    if (!Validation.required(name)) {
        document.getElementById('profileNameError').textContent = '이름을 입력하세요';
        return;
    }

    const payload = {name: name};

    try {
        const updatedUser = await apiClient.put(`/user/me/name`, payload);
        AppState.currentUser = updatedUser;
        document.getElementById('usrNameDisplay').textContent = updatedUser.name;
        Toast.success('정보가 성공적으로 수정되었습니다');
        closeProfileModal();
    } catch (error) {
        Toast.error('정보 수정에 실패했습니다.');
    }
}


async function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    let hasError = false;

    if (!Validation.required(currentPassword)) {
        document.getElementById('currentPasswordError').textContent = '현재 비밀번호를 입력하세요';
        hasError = true;
    } else {
        document.getElementById('currentPasswordError').textContent = '';
    }

    if (!Validation.required(newPassword) || !Validation.minLength(newPassword, 8)) {
        document.getElementById('newPasswordError').textContent = '비밀번호는 8자 이상이어야 합니다';
        hasError = true;
    } else {
        document.getElementById('newPasswordError').textContent = '';
    }

    if (!Validation.required(confirmPassword) || !Validation.match(newPassword, confirmPassword)) {
        document.getElementById('confirmPasswordError').textContent = '비밀번호가 일치하지 않습니다';
        hasError = true;
    } else {
        document.getElementById('confirmPasswordError').textContent = '';
    }

    if (hasError) return;
    const payload = {
        currentPassword: currentPassword,
        newPassword: newPassword
    };
    try {
        await apiClient.put(`/user/me/password`, payload);

        Toast.success('비밀번호가 성공적으로 변경되었습니다');
        closeProfileModal();

    } catch (error) {
        if (error.status === 401) {
            document.getElementById('currentPasswordError').textContent = '현재 비밀번호가 일치하지 않습니다.';
        } else {
            Toast.error('비밀번호 변경에 실패했습니다.');
        }
    }
}

function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

function initFAB() {
    const fabButton = document.getElementById('fabButton');
    const fabMenu = document.getElementById('fabMenu');

    if (!fabButton || !fabMenu) return;

    fabButton.addEventListener('click', (e) => {
        e.stopPropagation();
        fabButton.classList.toggle('active');
        fabMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.fab-container')) {
            fabButton.classList.remove('active');
            fabMenu.classList.remove('show');
        }
    });

    const menuItems = fabMenu.querySelectorAll('.fab-menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();

            fabButton.classList.remove('active');
            fabMenu.classList.remove('show');

            const action = item.getAttribute('data-action');
            if (action && typeof window[action] === 'function') {
                window[action]();
            }
        });
    });
}


async function logout() {
    try {
        await apiClient.post('/auth/logout');
        Toast.success('로그아웃 되었습니다.');
        apiClient.clearToken();
        setTimeout(() => {
            window.location.href = '/login';
        }, 1000);

    } catch (error) {
        console.error('Logout failed:', error);
        Toast.error('로그아웃에 실패했습니다. 다시 시도해주세요.');
        apiClient.clearToken();
        setTimeout(() => {
            window.location.href = '/login';
        }, 1000);
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    try {
        const iconMap = [
            { id: 'openProfileModal', type: 'settings', size: 16, prepend: true },
            { id: 'logout-button', type: 'logout', size: 16, prepend: true },

            { id: 'menuToggle', type: 'menu', size: 16 },
            { selector: '#header-mobile .avatar', type: 'userAvatar', size: 16 },
            { id: 'openProfileModalMobile', type: 'settings', size: 16, prepend: true },
            { id: 'logout-button-mobile', type: 'logout', size: 16, prepend: true },

            { selector: '#sidebar [data-page="agency"]', type: 'building', size: 16, prepend: true },
            { selector: '#sidebar [data-page="user"]', type: 'userPlus', size: 16, prepend: true },
            { selector: '#sidebar [data-page="consultation"]', type: 'consultation', size: 16, prepend: true },

            { id: 'closeSidebar', type: 'close', size: 16 },
            { selector: '#sidebarMobile [data-page="agency"]', type: 'building', size: 20, prepend: true },
            { selector: '#sidebarMobile [data-page="user"]', type: 'userPlus', size: 20, prepend: true },
            { selector: '#sidebarMobile [data-page="consultation"]', type: 'consultation', size: 20, prepend: true },
        ];

        iconMap.forEach(item => {
            const el = item.id ? document.getElementById(item.id) : document.querySelector(item.selector);
            if (el) {
                const icon = Icon({ type: item.type, size: item.size });
                if (icon) {
                    if (item.className) icon.classList.add(item.className);
                    if (item.prepend) {
                        el.prepend(icon);
                    } else {
                        el.appendChild(icon);
                    }
                }
            }
        });
    } catch (e) {
        console.error("Failed to inject icons:", e);
    }

    initTheme();

    const apiClient = new ApiClient();
    window.apiClient = apiClient;


    const themeToggle = document.getElementById('themeToggle');
    const themeToggleMobile = document.getElementById('themeToggleMobile');

    const pcAvatar = document.querySelector('.header-pc .avatar');
    const mobileAvatar = document.querySelector('.header-mobile .avatar');

    if (pcAvatar && pcAvatar.children.length === 0 && !pcAvatar.textContent.trim()) {
        pcAvatar.appendChild(Icon({ type: 'userAvatar', size: 16 }));
    }
    if (mobileAvatar && mobileAvatar.children.length === 0 && !mobileAvatar.textContent.trim()) {
        mobileAvatar.appendChild(Icon({ type: 'userAvatar', size: 16 }));
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    if (themeToggleMobile) {
        themeToggleMobile.addEventListener('click', toggleTheme);
    }

    initDropdowns();

    initMobileSidebar();

    let token = localStorage.getItem('accessToken');
    if (!token) {
        token = sessionStorage.getItem('accessToken');
    }
    if (token) {
        apiClient.setToken(token);
        await fetchAndSetCurrentUser();
        await loadCommonCodes();
    } else {
        if (window.location.pathname.indexOf('/login') === -1) {
            window.location.href = '/login';
        }
    }

    Modal.initCloseButtons();

    Toast.init();

    initProfileModal();

    initFAB();

    const logoutBtns = document.querySelectorAll('.logout');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            CustomAlert.confirm(
                '로그아웃',
                '로그아웃 하시겠습니까?',
                () => {
                    logout();
                }
            );
        });
    });

    const currentPage = document.body.getAttribute('data-page');
    if (currentPage) {

        document.querySelectorAll('.sidebar-item').forEach(item => {
            if (item.getAttribute('data-page') === currentPage) {
                item.classList.add('active');
            }
        });

        document.querySelectorAll('.sidebar-item-mobile').forEach(item => {
            if (item.getAttribute('data-page') === currentPage) {
                item.classList.add('active');
            }
        });
    }


});