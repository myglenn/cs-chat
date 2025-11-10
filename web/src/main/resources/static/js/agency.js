function translateStatus(status) {
    if (status === 'DELETED') return '삭제';
    return 'null';
}

const AgencyState = {
    agencies: [],
    filteredAgencies: [],
    currentPage: 1,
    itemsPerPage: 5,
    searchTerm: '',
    selectedAgencies: [],
    isEditMode: false,
    editingAgency: null,
    status: '',
    formData: {
        agencyName: '',
        bizNum: '',
        baseAddr: '',
        zipCode: '',
        zipCode: '',
        detailAddress: '',
        loginId: '',
        ceo: '',
        email: '',
        tel: '',
        password: '',
        confirmPassword: ''
    },
    formErrors: {},
    isLoginIdValid: false,
    isLoginIdChecked: false
};

async function fetchAgencies() {
    try {
        const page = AgencyState.currentPage - 1;
        const size = AgencyState.itemsPerPage;
        const searchTerm = AgencyState.searchTerm;

        const params = new URLSearchParams({page, size});
        if (searchTerm) {
            params.append('name', searchTerm);
        }

        const pageData = await apiClient.get(`/admin/agencies?${params.toString()}`);
        return pageData;

    } catch (error) {
        Toast.error('대리점 목록을 불러오는 데 실패했습니다.');
        return null;
    }
}


async function refreshAgencyList() {
    try {
        const pageData = await fetchAgencies();
        if (pageData && pageData.content) {
            AgencyState.agencies = pageData.content;
            AgencyState.filteredAgencies = pageData.content;
            renderAgencies();
            renderPagination(pageData);
        }
    } catch (error) {
        console.error("대리점 목록을 새로고침하는 데 실패했습니다:", error);
        Toast.error("데이터를 새로고침하지 못했습니다.");
    }
}


function renderAgencies() {
    const currentAgencies = AgencyState.filteredAgencies;
    renderTable(currentAgencies);
    renderCards(currentAgencies);
    updateSelectedCount();
}

function renderTable(agencies) {
    const tbody = document.getElementById('agencyTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (agencies.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 8;
        td.textContent = '표시할 데이터가 없습니다.';
        td.style.textAlign = 'center';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    agencies.forEach(agency => {
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.addEventListener('click', () => editAgency(agency.id));

        const tdCheckbox = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'checkbox';
        checkbox.checked = AgencyState.selectedAgencies.includes(agency.id);
        checkbox.addEventListener('change', (e) => toggleSelectAgency(agency.id, e.target.checked));
        checkbox.addEventListener('click', (e) => e.stopPropagation());
        tdCheckbox.appendChild(checkbox);

        const createCell = (text) => {
            const td = document.createElement('td');
            td.textContent = text || '';
            return td;
        };

        const managerLoginId = agency.manager ? agency.manager.loginId : 'N/A';
        const fullAddress = `${agency.baseAddr || ''} ${agency.dtlAddr || ''}`.trim();

        tr.append(
            tdCheckbox,
            createCell(agency.name),
            createCell(managerLoginId),
            createCell(fullAddress),
            createCell(agency.bizNum),
            createCell(formatDate(agency.regDt))
        );

        tbody.appendChild(tr);
    });
}

function renderCards(agencies) {
    const container = document.getElementById('agencyCards');
    if (!container) return;

    container.innerHTML = '';
    if (agencies.length === 0) {
        container.textContent = '표시할 데이터가 없습니다.';
        return;
    }

    agencies.forEach(agency => {
        const card = document.createElement('div');
        card.className = 'agency-card';

        const cardHeader = createCardHeader(agency);

        const cardBody = createCardBody(agency);

        card.append(cardHeader, cardBody);
        container.appendChild(card);
    });
}

function createCardHeader(agency) {
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
    checkbox.checked = AgencyState.selectedAgencies.includes(agency.id);
    checkbox.addEventListener('change', (e) => toggleSelectAgency(agency.id, e.target.checked));
    checkbox.addEventListener('click', (e) => e.stopPropagation());

    const titleContainer = document.createElement('div');
    titleContainer.style.flex = '1';
    titleContainer.style.cursor = 'pointer';
    titleContainer.addEventListener('click', () => editAgency(agency.id));

    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = agency.name;

    titleContainer.appendChild(title);
    innerContainer.append(checkbox, titleContainer);
    header.appendChild(innerContainer);

    return header;
}

function createCardBody(agency) {
    const body = document.createElement('div');
    body.className = 'card-body';
    body.style.cursor = 'pointer';
    body.addEventListener('click', () => editAgency(agency.id));

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

    const managerLoginId = agency.manager ? agency.manager.loginId : 'N/A';
    const fullAddress = `${agency.baseAddr || ''} ${agency.dtlAddr || ''}`.trim();

    body.append(
        createRow('대리점명', agency.name),
        createRow('관리자ID', managerLoginId),
        createRow('주소', fullAddress),
        createRow('사업자번호', agency.bizNum),
        createRow('등록일', formatDate(agency.regDt))
    );
    return body;
}


function handleSearch() {
    AgencyState.searchTerm = document.getElementById('searchInput').value;
    AgencyState.currentPage = 1;
    refreshAgencyList();
}


async function initializeAgencyPage() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }
    if (searchButton) {
        searchButton.addEventListener('click', handleSearch);
    }
    await refreshAgencyList();
}


function renderPagination(pageData) {

    if (!pageData) return;


    const paginationContainer = document.getElementById('pagination');
    const paginationMobile = document.getElementById('paginationMobile');


    const handlePageChange = (page) => {
        AgencyState.currentPage = page;
        refreshAgencyList();
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

    const selectedCount = AgencyState.selectedAgencies.length;

    if (selectedCount > 0) {
        bulkActionTitle.textContent = `${selectedCount}개 항목 선택됨`;
        bulkActionModal.classList.add('active');
    } else {
        bulkActionModal.classList.remove('active');
    }
}

function closeBulkActionModal() {
    AgencyState.selectedAgencies = [];
    renderAgencies();
}

function toggleSelectAgency(agencyId, checked) {
    if (checked) {
        if (!AgencyState.selectedAgencies.includes(agencyId)) {
            AgencyState.selectedAgencies.push(agencyId);
        }
    } else {
        AgencyState.selectedAgencies = AgencyState.selectedAgencies.filter(id => id !== agencyId);
    }
    updateSelectedCount();
}

function toggleSelectAll(checked) {
    const startIndex = (AgencyState.currentPage - 1) * AgencyState.itemsPerPage;
    const endIndex = startIndex + AgencyState.itemsPerPage;
    const currentAgencies = AgencyState.filteredAgencies.slice(startIndex, endIndex);

    if (checked) {
        currentAgencies.forEach(agency => {
            if (!AgencyState.selectedAgencies.includes(agency.id)) {
                AgencyState.selectedAgencies.push(agency.id);
            }
        });
    } else {
        const currentIds = currentAgencies.map(a => a.id);
        AgencyState.selectedAgencies = AgencyState.selectedAgencies.filter(id => !currentIds.includes(id));
    }

    renderAgencies();
}


function openAgencyModal() {
    const modalTitleText = AgencyState.isEditMode ? '대리점 수정' : '대리점 등록';

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'agencyModal';
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
    closeBtn.appendChild(Icon({type: 'close', size: 20}));
    closeBtn.addEventListener('click', closeAgencyModal);
    modalHeader.append(modalTitle, closeBtn);

    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    const form = document.createElement('form');
    form.id = 'agencyForm';
    form.className = 'modal-form';
    form.addEventListener('submit', e => e.preventDefault());

    const formData = AgencyState.formData;

    const agencyInfoTitle = document.createElement('h3');
    agencyInfoTitle.className = 'form-section-title';
    agencyInfoTitle.textContent = '대리점 정보';
    form.appendChild(agencyInfoTitle);
    form.append(
        createFormGroup({
            id: 'agencyName',
            label: '대리점명 *',
            value: formData.agencyName,
            placeholder: '대리점명을 입력하세요'
        }),
        createFormGroup({id: 'bizNum', label: '사업자등록번호 *', value: formData.bizNum, placeholder: '000-00-00000'}),
        createFormGroup({
            id: 'email',
            label: '이메일 *',
            value: formData.email,
            type: 'email',
            placeholder: 'email@example.com'
        }),
        createFormGroup({id: 'ceo', label: '대표자명 *', value: formData.ceo, placeholder: '사업자등록증 상의 대표자명'}),
        createFormGroup({id: 'tel', label: '대리점 연락처 *', value: formData.tel, placeholder: '02-0000-0000'})
    );

    const addressGroup = document.createElement('div');
    addressGroup.className = 'form-group';
    const addressLabel = document.createElement('label');
    addressLabel.className = 'form-label';
    addressLabel.textContent = '주소';
    const addressInputWrapper = document.createElement('div');
    addressInputWrapper.className = 'form-group-with-button';
    const zipCodeInput = document.createElement('input');
    zipCodeInput.type = 'text';
    zipCodeInput.className = 'form-input';
    zipCodeInput.id = 'zipCode';
    zipCodeInput.value = formData.zipCode;
    zipCodeInput.placeholder = '우편번호';
    zipCodeInput.readOnly = true;
    const addressSearchBtn = document.createElement('button');
    addressSearchBtn.type = 'button';
    addressSearchBtn.className = 'btn btn-outline';
    addressSearchBtn.appendChild(Icon({type: 'search', size: 16}));
    addressSearchBtn.appendChild(document.createTextNode(' 검색'));
    addressSearchBtn.addEventListener('click', openAddressSearch);
    addressInputWrapper.append(zipCodeInput, addressSearchBtn);
    const zipCodeError = document.createElement('div');
    zipCodeError.className = 'error-message';
    zipCodeError.id = 'zipCodeError';
    addressGroup.append(addressLabel, addressInputWrapper, zipCodeError);
    form.appendChild(addressGroup);

    form.append(
        createFormGroup({id: 'baseAddr', value: formData.baseAddr, placeholder: '기본주소', readonly: true}),
        createFormGroup({id: 'dtlAddr', value: formData.dtlAddr, placeholder: '상세주소'})
    );

    const managerInfoTitle = document.createElement('h3');
    managerInfoTitle.className = 'form-section-title';
    managerInfoTitle.textContent = '관리자 정보';
    form.appendChild(managerInfoTitle);

    const loginIdGroup = document.createElement('div');
    loginIdGroup.className = 'form-group';
    const loginIdLabel = document.createElement('label');
    loginIdLabel.className = 'form-label';
    loginIdLabel.textContent = '관리자 아이디 *';
    const loginIdInputWrapper = document.createElement('div');
    loginIdInputWrapper.className = 'form-group-with-button';
    const loginIdInput = document.createElement('input');
    loginIdInput.type = 'text';
    loginIdInput.className = 'form-input';
    loginIdInput.id = 'loginId';
    loginIdInput.value = formData.loginId;
    loginIdInput.placeholder = '관리자 아이디를 입력하세요';
    loginIdInput.addEventListener('change', () => updateFormField('loginId', loginIdInput.value));
    loginIdInputWrapper.appendChild(loginIdInput);

    if (AgencyState.isEditMode) {
        loginIdInput.readOnly = true;
        const managerIdInput = document.createElement('input');
        managerIdInput.type = 'hidden';
        managerIdInput.id = 'managerId';
        if (AgencyState.editingAgency && AgencyState.editingAgency.manager) {
            managerIdInput.value = AgencyState.editingAgency.manager.id;
        }
        form.appendChild(managerIdInput);

    } else {
        const checkIdBtn = document.createElement('button');
        checkIdBtn.type = 'button';
        checkIdBtn.className = 'btn btn-outline';
        checkIdBtn.textContent = '중복확인';
        checkIdBtn.addEventListener('click', checkLoginId);
        loginIdInputWrapper.appendChild(checkIdBtn);
    }
    const loginIdError = document.createElement('div');
    loginIdError.className = 'error-message';
    loginIdError.id = 'loginIdError';
    loginIdGroup.append(loginIdLabel, loginIdInputWrapper, loginIdError);
    form.appendChild(loginIdGroup);

    form.append(
        createFormGroup({
            id: 'managerName',
            label: '관리자 이름 *',
            value: formData.managerName,
            placeholder: '시스템을 사용할 관리자 이름'
        })
    );

    if (AgencyState.isEditMode) {
        const group = document.createElement('div');
        group.className = 'form-group';
        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = '관리자 비밀번호';
        const changePwdBtn = document.createElement('button');
        changePwdBtn.type = 'button';
        changePwdBtn.className = 'btn btn-outline w-full';
        changePwdBtn.textContent = '비밀번호 변경';
        changePwdBtn.id = 'btn_chagePwd';
        changePwdBtn.addEventListener('click', changeEditingAgencyPassword);
        group.append(label, changePwdBtn);
        form.appendChild(group);
    } else {
        form.append(
            createFormGroup({
                id: 'password',
                label: '관리자 비밀번호 *',
                type: 'password',
                placeholder: '비밀번호를 입력하세요 (6자 이상)'
            }),
            createFormGroup({
                id: 'confirmPassword',
                label: '비밀번호 확인 *',
                type: 'password',
                placeholder: '비밀번호를 다시 입력하세요'
            })
        );
    }

    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';

    if (AgencyState.isEditMode) {
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-destructive';
        deleteBtn.textContent = '삭제';
        deleteBtn.addEventListener('click', () => {
            deleteAgency(AgencyState.editingAgency.id);
            closeAgencyModal();
        });

        const spacer = document.createElement('div');
        spacer.style.flex = '1';

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn btn-outline';
        cancelBtn.textContent = '취소';
        cancelBtn.addEventListener('click', closeAgencyModal);

        const submitBtn = document.createElement('button');
        submitBtn.type = 'button';
        submitBtn.className = 'btn btn-primary';
        submitBtn.textContent = '수정';
        submitBtn.addEventListener('click', submitAgency);

        modalFooter.append(deleteBtn, spacer, cancelBtn, submitBtn);
    } else {
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn btn-outline';
        cancelBtn.textContent = '취소';
        cancelBtn.addEventListener('click', closeAgencyModal);

        const submitBtn = document.createElement('button');
        submitBtn.type = 'button';
        submitBtn.className = 'btn btn-primary';
        submitBtn.textContent = '등록';
        submitBtn.addEventListener('click', submitAgency);

        modalFooter.append(cancelBtn, submitBtn);
    }

    const bizNumInput = form.querySelector('#bizNum');
    if (bizNumInput) {
        bizNumInput.addEventListener('input', (e) => {
            const value = e.target.value;
            const formattedValue = formatBizNum(value);
            e.target.value = formattedValue;
            updateFormField('bizNum', formattedValue);
        });
    }

    const telInput = form.querySelector('#tel');
    if (telInput) {
        telInput.addEventListener('input', (e) => {
            const value = e.target.value;
            const formattedValue = formatTel(value);
            e.target.value = formattedValue;
            updateFormField('tel', formattedValue);
        });
    }

    modalBody.appendChild(form);
    modalContent.append(modalHeader, modalBody, modalFooter);
    modalOverlay.appendChild(modalContent);

    document.body.appendChild(modalOverlay);
    document.body.style.overflow = 'hidden';
}

async function editAgency(agencyId) {
    closeAgencyModal();
    const agency = AgencyState.agencies.find(a => a.id === agencyId);
    if (!agency) return;
    try {
        const fullAgencyInfo = await apiClient.get(`/admin/agencies/${agencyId}`);

        if (!fullAgencyInfo) {
            Toast.error("대리점 정보를 불러오지 못했습니다.");
            return;
        }
        AgencyState.isEditMode = true;
        AgencyState.editingAgency = fullAgencyInfo;

        AgencyState.formData = {
            agencyName: fullAgencyInfo.name,
            bizNum: fullAgencyInfo.bizNum,
            baseAddr: fullAgencyInfo.baseAddr || '',
            zipCode: fullAgencyInfo.zipCode || '',
            dtlAddr: fullAgencyInfo.dtlAddr || '',
            tel: fullAgencyInfo.tel || '',
            ceo: fullAgencyInfo.ceo || '',
            email: fullAgencyInfo.email || '',
            managerId: fullAgencyInfo.manager ? fullAgencyInfo.manager.id : '',
            loginId: fullAgencyInfo.manager ? fullAgencyInfo.manager.loginId : '',
            managerName: fullAgencyInfo.manager ? fullAgencyInfo.manager.name : '',
            password: '',
            confirmPassword: ''
        };
        AgencyState.isLoginIdChecked = true;
        AgencyState.isLoginIdValid = true;

        openAgencyModal(true);

    } catch (error) {
        console.error("Failed to fetch agency details:", error);
        Toast.error("대리점 상세 정보를 불러오는 데 실패했습니다.");
    }
}

function deleteAgency(agencyId) {
    CustomAlert.confirm('대리점을 삭제시겠습니까?', async () => {
        try {
            await apiClient.delete(`/admin/agencies/${agencyId}`);

            Toast.success('대리점이 삭제되었습니다');
            await fetchAgencies();

        } catch (error) {
            console.error("Failed to delete agency:", error);
            Toast.error("삭제 중 오류가 발생했습니다.");
        }
    });
}

function bulkDeleteAgencies() {
    const selectedIds = AgencyState.selectedAgencies;
    if (selectedIds.length === 0) {
        Toast.warning('선택된 대리점이 없습니다');
        return;
    }

    CustomAlert.confirm(
        `${selectedIds.length}개 항목 삭제`,
        `선택한 ${selectedIds.length}개의 대리점을 삭제하시겠습니까?`,
        async () => {
            try {
                await apiClient.post('/admin/agencies/bulk-delete', selectedIds);

                Toast.success(`${selectedIds.length}개의 대리점이 삭제되었습니다`);
                await refreshAgencyList();
            } catch (error) {
                Toast.error("일괄 삭제 중 오류가 발생했습니다.");
            }
        }
    );
}


function changeItemsPerPage(value) {
    AgencyState.itemsPerPage = parseInt(value);
    AgencyState.currentPage = 1;
    refreshAgencyList();
}


function updateFormField(field, value) {
    AgencyState.formData[field] = value;

    if (field === 'loginId') {
        AgencyState.isLoginIdChecked = false;
        AgencyState.isLoginIdValid = false;
    }

    const errorEl = document.getElementById(`${field}Error`);
    if (errorEl) {
        errorEl.textContent = '';
    }
}

async function checkLoginId() {
    const loginId = AgencyState.formData.loginId;
    const errorEl = document.getElementById('loginIdError');

    if (!loginId) {
        errorEl.textContent = '관리자 아이디를 입력하세요';
        return;
    }

    try {
        const response = await apiClient.post('/auth/check-id', {loginId: loginId});
        AgencyState.isLoginIdChecked = true;
        if (response.isDuplicate) {
            AgencyState.isLoginIdValid = false;
            errorEl.textContent = '이미 사용중인 아이디입니다';
            Toast.error('이미 사용중인 아이디입니다');
        } else {
            AgencyState.isLoginIdValid = true;
            errorEl.textContent = '사용 가능한 아이디입니다';
            errorEl.style.color = 'var(--success)';
            Toast.success('사용 가능한 아이디입니다');
            setTimeout(() => {
                errorEl.style.color = '';
                errorEl.textContent = '';
            }, 2000);
        }
    } catch (error) {
        Toast.error('중복 확인 중 오류가 발생했습니다.');
        AgencyState.isLoginIdChecked = false;
        AgencyState.isLoginIdValid = false;
    }
}

function validateAgencyForm() {
    const errors = {};
    const formData = AgencyState.formData;

    const bizNumRegex = /^\d{10}$/;
    const telRegex = /^\d{8,11}$/;


    if (!formData.agencyName || !formData.agencyName.trim()) {
        errors.agencyName = '대리점명을 입력하세요';
    }

    const bizNumRaw = formData.bizNum ? formData.bizNum.replace(/-/g, '') : '';
    if (!bizNumRaw) {
        errors.bizNum = '사업자등록번호를 입력하세요';
    } else if (!bizNumRegex.test(bizNumRaw)) {
        errors.bizNum = '올바른 사업자등록번호 10자리를 입력하세요.';
    }

    if (!formData.loginId || !formData.loginId.trim()) {
        errors.loginId = '관리자 아이디를 입력하세요';
    } else if (!AgencyState.isEditMode && !AgencyState.isLoginIdValid) {
        errors.loginId = '관리자 아이디 중복확인을 해주세요';
    }

    if (!formData.managerName || !formData.managerName.trim()) {
        errors.managerName = '관리자 이름을 입력하세요';
    }

    if (!formData.email || !formData.email.trim()) {
        errors.email = '이메일을 입력하세요';
    } else if (!Validation.email(formData.email)) {
        errors.email = '올바른 이메일 형식을 입력하세요';
    }

    const telRaw = formData.tel ? formData.tel.replace(/-/g, '') : '';
    if (!telRaw) {
        errors.tel = '대리점 연락처를 입력하세요';
    } else if (!telRegex.test(telRaw)) {
        errors.tel = '올바른 전화번호 형식이 아닙니다.';
    }

    if (!AgencyState.isEditMode) {
        if (!formData.password || !formData.password.trim()) {
            errors.password = '관리자 비밀번호를 입력하세요';
        } else if (formData.password.length < 6) {
            errors.password = '비밀번호는 6자 이상이어야 합니다';
        }

        if (!formData.confirmPassword || !formData.confirmPassword.trim()) {
            errors.confirmPassword = '비밀번호 확인을 입력하세요';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = '비밀번호가 일치하지 않습니다';
        }
    }

    AgencyState.formErrors = errors;

    Object.keys(errors).forEach(field => {
        const errorEl = document.getElementById(`${field}Error`);
        if (errorEl) {
            errorEl.textContent = errors[field];
        }
    });

    return Object.keys(errors).length === 0;
}


async function submitAgency() {
    if (!validateAgencyForm()) {
        Toast.error('입력 정보를 확인해주세요');
        return;
    }

    try {
        if (AgencyState.isEditMode) {

            const agencyId = AgencyState.editingAgency.id;``
            const managerId = AgencyState.editingAgency.manager.id;

            const agencyUpdateDTO = {
                name: AgencyState.formData.agencyName,
                bizNum: AgencyState.formData.bizNum,
                zipCode: AgencyState.formData.zipCode,
                baseAddr: AgencyState.formData.baseAddr,
                dtlAddr: AgencyState.formData.dtlAddr,
                tel: AgencyState.formData.tel,
                ceo: AgencyState.formData.ceo,
                email: AgencyState.formData.email
            };

            const userUpdateDTO = {
                name: AgencyState.formData.managerName,
            };

            await Promise.all([
                apiClient.put(`/admin/agencies/${agencyId}`, agencyUpdateDTO),
                apiClient.put(`/admin/users/${managerId}`, userUpdateDTO)
            ]);
            Toast.success('대리점 정보가 수정되었습니다');
        } else {

            const createRequest = {
                code: AgencyState.formData.bizNum,
                name: AgencyState.formData.agencyName,
                bizNum: AgencyState.formData.bizNum,
                zipCode: AgencyState.formData.zipCode,
                baseAddr:AgencyState.formData.baseAddr,
                dtlAddr: AgencyState.formData.dtlAddr,
                tel: AgencyState.formData.tel,
                ceo: AgencyState.formData.ceo,
                email: AgencyState.formData.email,
                usr: {
                    loginId: AgencyState.formData.loginId,
                    password: AgencyState.formData.password,
                    name: AgencyState.formData.managerName
                }
            };
            await apiClient.post('/admin/agencies', createRequest);

            Toast.success('대리점이 성공적으로 등록되었습니다');
        }

        closeAgencyModal();
        await fetchAgencies();
    } catch (e) {
        console.error("Failed to submit agency:", e);
        Toast.error("처리 중 오류가 발생했습니다.");
    }
}

function changeEditingAgencyPassword() {
    const agency = AgencyState.editingAgency;
    if (!agency) return;


    openPasswordChangeModal({
        targetId: agency.id,
        targetName: agency.name,

        apiEndpoint: `/admin/agencies/${agency.id}/password`,
        onSuccess: () => {
            console.log(`Agency ${agency.id}'s password changed.`);
        }
    });
}

function closeAgencyModal() {
    if (activeFocusTrap) {
        activeFocusTrap();
        activeFocusTrap = null;
    }
    const modal = document.getElementById('agencyModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
    resetForm();
}

function resetForm() {
    AgencyState.formData = {
        agencyName: '',
        bizNum: '',
        baseAddr: '',
        zipCode: '',
        dtlAddr: '',
        loginId: '',
        ceo: '',
        email: '',
        tel: '',
        password: '',
        confirmPassword: ''
    };
    AgencyState.formErrors = {};
    AgencyState.isLoginIdChecked = false;
    AgencyState.isLoginIdValid = false;
    AgencyState.editingAgency = null;
    AgencyState.isEditMode = false;
}

function openAddressSearch() {
    openAddressSearchModal();

    const embedLayer = document.getElementById('address-embed-layer');
    setTimeout(() => {
        new daum.Postcode({
            oncomplete: function (data) {
                const zonecode = data.zonecode;
                let fullAddress = data.address;
                const buildingName = data.buildingName;

                if (buildingName !== '' && data.apartment === 'Y') {
                    fullAddress += (fullAddress !== '' ? `, ${buildingName}` : buildingName);
                }

                AgencyState.formData.zipCode = zonecode;
                AgencyState.formData.baseAddr = fullAddress;

                document.getElementById('zipCode').value = zonecode;
                document.getElementById('baseAddr').value = fullAddress;

                closeAddressSearchModal();
                const detailAddressInput = document.getElementById('dtlAddr');
                if (detailAddressInput) {
                    detailAddressInput.focus();
                }
            },
            width: '100%',
            height: '100%'
        }).embed(embedLayer);
    }, 0);
}

function openAddressSearchModal() {
    closeAddressSearchModal();

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'addressSearchModal';
    modalOverlay.className = 'modal-overlay active address-modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    const modalTitle = document.createElement('h2');
    modalTitle.className = 'modal-title';
    modalTitle.textContent = '주소 검색';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.appendChild(Icon({type: 'close', size: 20}));
    closeBtn.addEventListener('click', closeAddressSearchModal);
    modalHeader.append(modalTitle, closeBtn);

    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    modalBody.id = 'address-embed-layer';
    modalBody.style.height = '400px';
    modalBody.style.padding = '0';
    // modalBody.style.overflow = 'hidden';
    modalBody.style.flex = 'none';
    modalBody.style.overflow = 'auto';

    modalContent.append(modalHeader, modalBody);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    document.body.style.overflow = 'hidden';
}

function closeAddressSearchModal() {
    const modal = document.getElementById('addressSearchModal');
    if (modal) {
        modal.remove();

        if (!document.getElementById('agencyModal')) {
            document.body.style.overflow = '';
        }
    }
}

function formatBizNum(value) {
    const number = value.replace(/[^0-9]/g, '');
    let result = '';
    if (number.length < 4) {
        result = number;
    } else if (number.length < 6) {
        result = `${number.slice(0, 3)}-${number.slice(3)}`;
    } else {
        result = `${number.slice(0, 3)}-${number.slice(3, 5)}-${number.slice(5, 10)}`;
    }
    return result;
}

function formatTel(value) {
    const number = value.replace(/[^0-9]/g, '');
    const len = number.length;
    let result = '';
    if (number.length === 0) return '';
    if (number.startsWith('1')) {
        if (len <= 4) return number;
        return `${number.slice(0, 4)}-${number.slice(4, 8)}`;
    }

    if (number.startsWith('02')) {
        if (len <= 2) return number;
        if (len <= 5) return `${number.slice(0, 2)}-${number.slice(2)}`;
        if (len <= 9) return `${number.slice(0, 2)}-${number.slice(2, 5)}-${number.slice(5, 9)}`;
        return `${number.slice(0, 2)}-${number.slice(2, 6)}-${number.slice(6, 10)}`;
    }

    if (number.startsWith('0')) {
        if (len <= 3) return number;
        if (len <= 7) return `${number.slice(0, 3)}-${number.slice(3, 7)}`; //
        if (len <= 10) return `${number.slice(0, 3)}-${number.slice(3, 6)}-${number.slice(6, 10)}`;
        return `${number.slice(0, 3)}-${number.slice(3, 7)}-${number.slice(7, 11)}`;
    }

    return result;
}


document.addEventListener('DOMContentLoaded', async () => {
    await window.authReady;
    initializeAgencyPage();
});

