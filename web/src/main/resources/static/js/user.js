
const UserState = {
    users: [],
    filteredUsers: [],
    currentPage: 1,
    itemsPerPage: 5,
    searchTerm: '',
    selectedUsers: [],
    isEditMode: false,
    editingUser: null,
    formData: {
        userId: '',
        name: '',
        password: '',
        confirmPassword: ''
    },
    formErrors: {},
    isUserIdValid: false,
    isUserIdChecked: false
};

async function fetchUsers() {
    try {
        
        const page = UserState.currentPage - 1;
        const size = UserState.itemsPerPage;
        const searchTerm = UserState.searchTerm;
        const params = new URLSearchParams({ page, size });
        if (searchTerm) {
            params.append('name', searchTerm);
        }

        const apiEndpoint = `/admin/users?${params.toString()}`;
        const pageData = await apiClient.get(apiEndpoint);
        return pageData;

    } catch (error) {
        Toast.error('사원 목록을 불러오는 데 실패했습니다.');
        return null;
    }
}

async function refreshUserList() {
    try {
        const pageData = await fetchUsers();
        if (pageData && pageData.content) {
            UserState.users = pageData.content;
            UserState.filteredUsers = pageData.content;
            renderUsers();
            renderPagination(pageData);
        }
    } catch (error) {
        console.error("사원 목록 새로고침에 실패했습니다:", error);
    }
}

function renderUsers() {
    renderTable(UserState.filteredUsers);
    renderCards(UserState.filteredUsers);
    updateSelectedCount();
}






function renderTable(users) {
    const tbody = document.getElementById('userTableBody');
    if (!tbody) return;

    
    tbody.innerHTML = '';

    
    if (users.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 6;
        td.textContent = '표시할 데이터가 없습니다.';
        td.style.textAlign = 'center';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.addEventListener('click', () => editUser(user.id));

        const createCell = (text) => {
            const td = document.createElement('td');
            td.textContent = text || '';
            return td;
        };

        
        const tdCheckbox = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'checkbox';
        checkbox.checked = UserState.selectedUsers.includes(user.id);
        checkbox.addEventListener('change', (e) => toggleSelectUser(user.id, e.target.checked));
        checkbox.addEventListener('click', (e) => e.stopPropagation());
        tdCheckbox.appendChild(checkbox);

        
        tr.append(
            tdCheckbox,
            createCell(user.name),
            createCell(user.loginId),
            createCell(formatDate(user.regDt))
        );

        
        tbody.appendChild(tr);
    });
}



function renderCards(users) {
    const container = document.getElementById('userCards');
    if (!container) return;
    container.innerHTML = '';

    if (users.length === 0) {
        container.textContent = '표시할 데이터가 없습니다.';
        container.style.textAlign = 'center';
        return;
    }

    users.forEach(user => {
        const card = document.createElement('div');
        card.className = 'user-card';

        const cardHeader = createCardHeaderForUser(user);
        const cardBody = createCardBodyForUser(user);

        card.append(cardHeader, cardBody);
        container.appendChild(card);
    });
}


function createCardHeaderForUser(user) {
    const header = document.createElement('div');
    header.className = 'card-header';
    header.style.marginBottom = '0.75rem';

    const innerContainer = document.createElement('div');
    innerContainer.style.display = 'flex';
    innerContainer.style.alignItems = 'center';
    innerContainer.style.gap = '0.75rem';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'checkbox';
    checkbox.checked = UserState.selectedUsers.includes(user.id);
    checkbox.addEventListener('change', (e) => toggleSelectUser(user.id, e.target.checked));
    checkbox.addEventListener('click', (e) => e.stopPropagation());

    const titleContainer = document.createElement('div');
    titleContainer.style.flex = '1';
    titleContainer.style.cursor = 'pointer';
    titleContainer.addEventListener('click', () => editUser(user.id));

    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = user.name;

    titleContainer.appendChild(title);
    innerContainer.append(checkbox, titleContainer);
    header.appendChild(innerContainer);

    return header;
}


function createCardBodyForUser(user) {
    const body = document.createElement('div');
    body.className = 'card-body';
    body.style.cursor = 'pointer';
    body.addEventListener('click', () => editUser(user.id));

    const createRow = (label, value) => {
        const row = document.createElement('div');
        row.className = 'card-row';
        const labelSpan = document.createElement('span');
        labelSpan.className = 'card-label';
        labelSpan.textContent = label;
        const valueSpan = document.createElement('span');
        valueSpan.className = 'card-value';
        valueSpan.textContent = value || '';
        row.append(labelSpan, valueSpan);
        return row;
    };

    body.append(
        createRow('이름', user.name),
        createRow('아이디', user.loginId),
        createRow('등록일', formatDate(user.regDt))
    );

    return body;
}
function handleSearch() {
    
    UserState.searchTerm = document.getElementById('searchInput').value;
    
    UserState.currentPage = 1;
    
    refreshUserList();
}


function renderPagination(pageData) {
    
    if (!pageData) return;

    
    const paginationContainer = document.getElementById('pagination');
    const paginationMobile = document.getElementById('paginationMobile');

    
    const handlePageChange = (page) => {
        UserState.currentPage = page; 
        refreshUserList();           
    };

    
    if (paginationContainer) {
        paginationContainer.innerHTML = ''; 
        
        const pagination = createPagination(pageData, handlePageChange);
        paginationContainer.appendChild(pagination);
    }

    
    if (paginationMobile) {
        paginationMobile.innerHTML = ''; 
        const pagination = createPagination(pageData, handlePageChange);
        paginationMobile.appendChild(pagination);
    }
}

function updateSelectedCount() {
    const bulkActionModal = document.getElementById('bulkActionModal');
    const bulkActionTitle = document.getElementById('bulkActionTitle');

    if (!bulkActionModal || !bulkActionTitle) return;

    const selectedCount = UserState.selectedUsers.length;

    if (selectedCount > 0) {
        bulkActionTitle.textContent = `${selectedCount}개 항목 선택됨`;
        bulkActionModal.classList.add('active');
    } else {
        bulkActionModal.classList.remove('active');
    }
}

function closeBulkActionModal() {
    UserState.selectedUsers = [];
    renderUsers();
}





function toggleSelectUser(userId, checked) {
    if (checked) {
        if (!UserState.selectedUsers.includes(userId)) {
            UserState.selectedUsers.push(userId);
        }
    } else {
        UserState.selectedUsers = UserState.selectedUsers.filter(id => id !== userId);
    }
    updateSelectedCount();
}

function toggleSelectAll(checked) {
    const startIndex = (UserState.currentPage - 1) * UserState.itemsPerPage;
    const endIndex = startIndex + UserState.itemsPerPage;
    const currentUsers = UserState.filteredUsers.slice(startIndex, endIndex);

    if (checked) {
        currentUsers.forEach(user => {
            if (!UserState.selectedUsers.includes(user.id)) {
                UserState.selectedUsers.push(user.id);
            }
        });
    } else {
        const currentIds = currentUsers.map(u => u.id);
        UserState.selectedUsers = UserState.selectedUsers.filter(id => !currentIds.includes(id));
    }

    renderUsers();
}

function openCommonPasswordChangeForUser() {
    const user = UserState.editingUser;
    if (!user) return;

    
    openPasswordChangeModal({
        targetId: user.id,
        targetName: user.name,
        
        apiEndpoint: `/admin/users/${user.id}/password`,
        onSuccess: () => {
        }
    });
}

function openUserModal() {
    const currentUserRole = AppState.currentUser.role;
    const modalTitleText = UserState.isEditMode ? '사원 수정' : '사원 등록';
    const formData = UserState.formData;

    
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'userModal';
    modalOverlay.className = 'modal-overlay active registration-modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    const modalTitle = document.createElement('h2');
    modalTitle.className = 'modal-title';
    modalTitle.textContent = modalTitleText;
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.addEventListener('click', closeUserModal);
    closeBtn.appendChild(Icon({ type: 'close', size: 20 })); 
    modalHeader.append(modalTitle, closeBtn);

    
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    const form = document.createElement('form');
    form.id = 'userForm';
    form.className = 'modal-form';
    form.addEventListener('submit', e => e.preventDefault());


    
    const userIdInput = document.createElement('input');
    userIdInput.type = 'text';
    userIdInput.id = 'userId';
    userIdInput.className = 'form-input';
    userIdInput.value = formData.userId || '';
    userIdInput.placeholder = '사원 아이디를 입력하세요';
    userIdInput.addEventListener('change', (e) => updateFormField('userId', e.target.value));

    if (UserState.isEditMode) {
        userIdInput.readOnly = true;
        form.appendChild(createFormGroup('userId', '사원 아이디 *', userIdInput, 'userIdError'));
    } else {
        const checkIdBtn = document.createElement('button');
        checkIdBtn.type = 'button';
        checkIdBtn.className = 'btn btn-outline';
        checkIdBtn.textContent = '중복확인';
        checkIdBtn.addEventListener('click', checkUserId);

        const userIdWrapper = document.createElement('div');
        userIdWrapper.className = 'form-group-with-button';
        userIdWrapper.append(userIdInput, checkIdBtn);

        form.appendChild(createFormGroup('userId', '사원 아이디 *', userIdWrapper, 'userIdError'));
    }

    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'name';
    nameInput.className = 'form-input';
    nameInput.value = formData.name || '';
    nameInput.placeholder = '이름을 입력하세요';
    nameInput.addEventListener('change', (e) => updateFormField('name', e.target.value));

    form.append(
        createFormGroup('name', '이름 *', nameInput, 'nameError')
    );


    
    if (UserState.isEditMode) {
        const changePwdBtn = document.createElement('button');
        changePwdBtn.type = 'button';
        changePwdBtn.className = 'btn btn-outline w-full';
        changePwdBtn.textContent = '비밀번호 변경';
        changePwdBtn.addEventListener('click', openCommonPasswordChangeForUser);
        form.appendChild(createFormGroup('password', '비밀번호', changePwdBtn));
    } else {
        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.id = 'password';
        passwordInput.className = 'form-input';
        passwordInput.placeholder = '비밀번호를 입력하세요 (6자 이상)';
        passwordInput.addEventListener('change', (e) => updateFormField('password', e.target.value));

        const confirmPasswordInput = document.createElement('input');
        confirmPasswordInput.type = 'password';
        confirmPasswordInput.id = 'confirmPassword';
        confirmPasswordInput.className = 'form-input';
        confirmPasswordInput.placeholder = '비밀번호를 다시 입력하세요';
        confirmPasswordInput.addEventListener('change', (e) => updateFormField('confirmPassword', e.target.value));

        form.append(
            createFormGroup('password', '비밀번호 *', passwordInput, 'passwordError'),
            createFormGroup('confirmPassword', '비밀번호 확인 *', confirmPasswordInput, 'confirmPasswordError')
        );
    }

    
    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn btn-outline';
    cancelBtn.textContent = '취소';
    cancelBtn.addEventListener('click', closeUserModal);

    const submitBtn = document.createElement('button');
    submitBtn.type = 'button';
    submitBtn.className = 'btn btn-primary';
    submitBtn.textContent = UserState.isEditMode ? '수정' : '등록';
    submitBtn.addEventListener('click', saveUser);

    if (UserState.isEditMode) {
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-destructive';
        deleteBtn.textContent = '삭제';
        deleteBtn.addEventListener('click', () => deleteUser(UserState.editingUser.id));

        const spacer = document.createElement('div');
        spacer.style.flex = '1';

        modalFooter.append(deleteBtn, spacer, cancelBtn, submitBtn);
    } else {
        modalFooter.append(cancelBtn, submitBtn);
    }

    
    modalBody.appendChild(form);
    modalContent.append(modalHeader, modalBody, modalFooter);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    document.body.style.overflow = 'hidden';
}


function openAgencySearchModal() {
    closeAgencySearchModal(); 

    
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'agencySearchModal';
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.style.zIndex = '1050';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    const modalTitle = document.createElement('h2');
    modalTitle.className = 'modal-title';
    modalTitle.textContent = '대리점 검색';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.addEventListener('click', closeAgencySearchModal);
    closeBtn.appendChild(Icon({ type: 'close', size: 20 })); 
    modalHeader.append(modalTitle, closeBtn);

    
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';

    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'search-wrapper';
    searchWrapper.style.marginBottom = '1rem';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'agencySearchInput';
    searchInput.className = 'search-input';
    searchInput.placeholder = '대리점명으로 검색';

    const searchBtn = document.createElement('button');
    searchBtn.id = 'agencySearchBtn';
    searchBtn.className = 'search-btn';
    searchBtn.setAttribute('aria-label', '검색');
    searchBtn.appendChild(Icon({ type: 'search', size: 18 })); 

    searchWrapper.append(searchInput, searchBtn);

    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'agencySearchResults';
    resultsContainer.className = 'search-results-list';

    modalBody.append(searchWrapper, resultsContainer);

    
    modalContent.append(modalHeader, modalBody);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    const performSearch = async () => {
        const searchTerm = searchInput.value;
        if (!searchTerm.trim()) {
            renderAgencySearchResults([]);
            return;
        }

        try {
            const results = await apiClient.get(`/admin/agencies/search?name=${searchTerm}`);
            renderAgencySearchResults(results);

        } catch (error) {
            Toast.error("대리점 검색에 실패했습니다.");
            
            renderAgencySearchResults([]);
        }
    };

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}


function renderAgencySearchResults(agencies) {
    const resultsContainer = document.getElementById('agencySearchResults');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = ''; 

    if (!agencies || agencies.length === 0) {
        resultsContainer.textContent = '검색 결과가 없습니다.';
        return;
    }

    agencies.forEach(agency => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.textContent = `${agency.name} (대표: ${agency.ceo})`;

        item.addEventListener('click', () => {
            
            document.getElementById('agencyNameDisplay').value = agency.name;
            UserState.formData.agcId = agency.id;
            closeAgencySearchModal();
        });

        resultsContainer.appendChild(item);
    });
}





function closeAgencySearchModal() {
    const modal = document.getElementById('agencySearchModal');
    if (modal) modal.remove();
}


function bulkDeleteUsers() {
    if (UserState.selectedUsers.length === 0) {
        Toast.warning('선택된 사원이 없습니다');
        return;
    }

    CustomAlert.confirm(
        `${selectedIds.length}개 항목 삭제`,
        `선택한 ${selectedIds.length}명의 사원을 삭제하시겠습니까?`,
        async () => { // <-- async 키워드 추가
            try {
                await apiClient.post('/admin/users/bulk-delete', selectedIds);
                Toast.success(`${selectedIds.length}명의 사원이 삭제되었습니다`);
                UserState.selectedUsers = [];
                await refreshUserList();
            } catch (error) {
                Toast.error("일괄 삭제 중 오류가 발생했습니다.");
            }
        }
    );
}

function changeItemsPerPage(value) {
    UserState.itemsPerPage = parseInt(value);
    UserState.currentPage = 1;
    // renderUsers();
    refreshUserList();
}



function openNewUserModal() {
    closeUserModal();
    UserState.isEditMode = false;
    resetForm(); 
    openUserModal();
}


async function editUser(userId) {
    closeUserModal();
    try {
        
        const userInfo = await apiClient.get(`/admin/users/${userId}`);
        if (!userInfo) {
            Toast.error("사용자 정보를 불러오지 못했습니다.");
            return;
        }

        
        UserState.isEditMode = true;
        UserState.editingUser = userInfo;
        UserState.formData = {
            userId: userInfo.loginId,
            name: userInfo.name,
            password: '',
            confirmPassword: ''
        };
        UserState.isUserIdChecked = true;
        UserState.isUserIdValid = true;

        openUserModal();

    } catch (error) {
        console.error(error)
        Toast.error("사원 상세 정보 조회에 실패했습니다.");
    }
}

function validateUserForm() {
    const errors = {};
    const formData = UserState.formData;

    if (!UserState.isEditMode) {
        if (!formData.userId || !formData.userId.trim()) {
            errors.userId = '사원 아이디를 입력하세요';
        } else if (!UserState.isUserIdChecked) {
            errors.userId = '아이디 중복확인을 해주세요';
        } else if (!UserState.isUserIdValid) {
            errors.userId = '사용할 수 없는 아이디입니다';
        }
    }

    if (!formData.name || !formData.name.trim()) {
        errors.name = '이름을 입력하세요';
    }

    if (!UserState.isEditMode) {
        if (!formData.password || !formData.password.trim()) {
            errors.password = '비밀번호를 입력하세요';
        } else if (formData.password.length < 6) {
            errors.password = '비밀번호는 6자 이상이어야 합니다';
        }

        if (!formData.confirmPassword || !formData.confirmPassword.trim()) {
            errors.confirmPassword = '비밀번호 확인을 입력하세요';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = '비밀번호가 일치하지 않습니다';
        }
    }

    UserState.formErrors = errors;

    const allFields = ['userId', 'name', 'password', 'confirmPassword'];
    allFields.forEach(field => {
        const errorEl = document.getElementById(`${field}Error`);
        if (errorEl) {
            errorEl.textContent = errors[field] || '';
        }
    });

    return Object.keys(errors).length === 0;
}


async function saveUser() {

    if (!validateUserForm()) {
        Toast.error('입력 정보를 확인해주세요');
        return;
    }

    const formData = UserState.formData;
    let payload;

    try {
        if (UserState.isEditMode) {
            payload = {
                name: formData.name
            };
            await apiClient.put(`/admin/users/${UserState.editingUser.id}`, payload);
            Toast.success('사용자 정보가 수정되었습니다.');
        } else {
            payload = {
                loginId: formData.userId,
                name: formData.name,
                role: 'OPERATOR',
                password: formData.password
            };
            await apiClient.post('/admin/users', payload);
            Toast.success('사원이 등록되었습니다.');
        }
        closeUserModal();
        await refreshUserList();

    } catch (error) {
        Toast.error('작업에 실패했습니다.');
    }
}


function deleteUser(userId) {
    CustomAlert.confirm('사용자를 삭제하시겠습니까?', async () => {
        try {
            await apiClient.delete(`/admin/users/${userId}`);
            Toast.success('사원이 삭제되었습니다.');
            closeUserModal();
            await refreshUserList();
        } catch (error) {
            Toast.error('삭제에 실패했습니다.');
        }
    });
}



async function checkUserId() {
    const userId = UserState.formData.userId;
    const errorEl = document.getElementById('userIdError');
    if (!userId) {
        errorEl.textContent = '사용자 아이디를 입력하세요';
        return;
    }

    try {
        const response = await apiClient.post('/auth/check-id', { loginId: userId });

        UserState.isUserIdChecked = true;
        if (response.isDuplicate) {
            errorEl.textContent = '이미 사용 중인 아이디입니다';
            UserState.isUserIdValid = false;
        } else {
            errorEl.textContent = '사용 가능한 아이디입니다';
            errorEl.style.color = 'var(--success)';
            UserState.isUserIdValid = true;
            setTimeout(() => { errorEl.style.color = ''; errorEl.textContent = ''; }, 2000);
        }
    } catch (error) {
        Toast.error('중복 확인 중 오류가 발생했습니다.');
    }
}


function closeUserModal() {
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
    resetForm();
}


function resetForm() {
    UserState.formData = {
        userId: '',
        name: '',
        password: '',
        confirmPassword: ''
    };
    UserState.formErrors = {};
    UserState.isUserIdChecked = false;
    UserState.isUserIdValid = false;
    UserState.editingUser = null;
    UserState.isEditMode = false;
}

function updateFormField(field, value) {
    UserState.formData[field] = value;
    if (field === 'userId' && !UserState.isEditMode) {
        UserState.isUserIdChecked = false;
        UserState.isUserIdValid = false;
    }
}



async function initializeUserPage() {
    document.getElementById('searchButton').addEventListener('click', handleSearch);
    document.getElementById('searchInput').addEventListener('keyup', e => {
        if (e.key === 'Enter') handleSearch();
    });
    document.getElementById('openUserModalBtn').addEventListener('click', openNewUserModal);

    const fabActionBtn = document.querySelector('.fab-menu-item[data-action="openUserModal"]');
    if (fabActionBtn) {
        fabActionBtn.addEventListener('click', openNewUserModal);
    }

    await refreshUserList();
}


document.addEventListener('DOMContentLoaded', async () => {
    try {
        const iconMap = [
            { id: 'searchButton', type: 'search', size: 18 },
            { selector: '#searchWrapper', type: 'search', size: 16, prepend: true, className: 'search-icon' },
            { id: 'openUserModalBtn', type: 'plus', size: 16, prepend: true },
            { id: 'fabButton', type: 'plus', size: 24 },
            { selector: '[data-action="openUserModal"]', type: 'userPlus', size: 20, prepend: true },
            { selector: '[onclick="closeBulkActionModal()"]', type: 'close', size: 16 },
            { selector: '[onclick="bulkDeleteUsers()"]', type: 'trash', size: 16, prepend: true }
        ];

        iconMap.forEach(item => {
            const btn = item.id ? document.getElementById(item.id) : document.querySelector(item.selector);
            if (btn) {
                const icon = Icon({ type: item.type, size: item.size });
                if (item.className) icon.classList.add(item.className);
                if (item.prepend) {
                    btn.prepend(icon);
                } else {
                    btn.appendChild(icon);
                }
            }
        });
    } catch (e) {
        console.error("Failed to inject icons:", e);
    }
    await window.authReady;
    initializeUserPage();
});