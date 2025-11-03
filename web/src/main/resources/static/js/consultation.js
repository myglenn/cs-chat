const ChatSearchState = {
    isSearching: false,
    searchTerm: '',
    searchResults: [],
    currentResultIndex: -1
};

const ConsultationState = {
    consultations: [],
    currentPage: 1,
    totalPages: 1,
    totalElements: 0,
    currentConsultation: null,
    searchTerm: '',
    statusFilter: 'IN_PROGRESS',
    categoryFilter: [],
    tempCategoryFilter: [],
    attachedFiles: []
};

function createElementSafe(tag, options = {}) {
    const el = document.createElement(tag);

    if (options.text) {
        el.textContent = options.text;
    }

    if (options.className) {
        el.className = options.className;
    }

    if (options.id) {
        el.id = options.id;
    }


    if (options.attributes) {
        for (const key in options.attributes) {
            el.setAttribute(key, options.attributes[key]);
        }
    }


    if (options.children) {
        options.children.forEach(child => {
            if (child) el.appendChild(child);
        });
    }

    return el;
}

function openImageModal(imageUrl, fileName) {


    const downloadBtn = createElementSafe('button', {
        className: 'image-modal-btn',
        attributes: {title: '다운로드'},
        children: [Icon({type: 'download', size: 20})]
    });
    downloadBtn.onclick = () => downloadImageFile(imageUrl, fileName);


    const closeBtn = createElementSafe('button', {
        className: 'image-modal-btn image-modal-close',
        attributes: {title: '닫기'},
        children: [Icon({type: 'close', size: 20})]
    });
    closeBtn.onclick = closeImageModal;


    const img = createElementSafe('img', {
        attributes: {src: imageUrl, alt: fileName}
    });
    img.onclick = (e) => e.stopPropagation();

    const modalBody = createElementSafe('div', {
        className: 'image-modal-body',
        children: [img]
    });
    modalBody.onclick = closeImageModal;


    const modal = createElementSafe('div', {
        id: 'imageModal',
        className: 'image-modal-overlay',
        children: [
            createElementSafe('div', {
                className: 'image-modal-content',
                children: [
                    createElementSafe('div', {
                        className: 'image-modal-header',
                        children: [
                            createElementSafe('span', {className: 'image-modal-filename', text: fileName}),
                            createElementSafe('div', {
                                className: 'image-modal-actions',
                                children: [downloadBtn, closeBtn]
                            })
                        ]
                    }),
                    modalBody
                ]
            })
        ]
    });

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';


    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeImageModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

async function openDmModal() {
    const existingModal = document.getElementById('dmSendModal');
    if (existingModal) existingModal.remove();

    let selectedAgencyIds = new Set();
    let allAgencies = [];

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'dmSendModal';
    modalOverlay.className = 'modal-overlay active registration-modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';


    const closeBtn = createElementSafe('button', {
        className: 'modal-close',
        children: [Icon({type: 'close', size: 20})]
    });
    closeBtn.addEventListener('click', () => modalOverlay.remove());

    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    const modalTitle = document.createElement('h2');
    modalTitle.className = 'modal-title';
    modalTitle.textContent = 'DM 발송';
    modalHeader.append(modalTitle, closeBtn);


    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    const form = document.createElement('form');
    form.className = 'modal-form';

    const agencySearchInput = createElementSafe('input', {
        id: 'dmAgencySearchInput',
        className: 'form-input',
        attributes: {
            type: 'text',
            placeholder: '대리점 이름 검색...',
            style: 'margin-bottom: 0.5rem;'
        }
    });

    const agencyCheckboxContainer = createElementSafe('div', {
        id: 'dmAgencyCheckboxContainer',
        className: 'checkbox-list-container',
        attributes: {style: 'height: 150px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: var(--border-radius); padding: 0.5rem;'}
    });







    const agencyCountDisplay = createElementSafe('div', {
        className: 'form-group-description',
        attributes: {style: 'text-align: right; margin-top: 0.5rem;'},
        children: [
            createElementSafe('span', {id: 'dmSelectedCount', text: '0'}),
            createElementSafe('span', {text: '개 선택됨'})
        ]
    });

    form.append(
        createFormGroup('dmAgencySearch', '대리점 검색', agencySearchInput),
        createFormGroup('dmAgencyCheckboxContainer', '받는 대리점 *', agencyCheckboxContainer, 'dmAgencyError'),
        agencyCountDisplay,

    );
    modalBody.appendChild(form);

    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn btn-outline';
    cancelBtn.textContent = '취소';
    cancelBtn.addEventListener('click', () => modalOverlay.remove());







    const submitBtn = document.createElement('button');
    submitBtn.type = 'button';
    submitBtn.className = 'btn btn-primary';
    submitBtn.textContent = '채팅방 생성';

    submitBtn.addEventListener('click', () => {
        const agencyIds = Array.from(selectedAgencyIds);

        if (agencyIds.length === 0) {
            document.getElementById('dmAgencyError').textContent = '받는 대리점을 선택하세요.';
            return;
        }


        const tempChannel = {
            id: null,
            type: 'DM',
            title: '새 DM',
            status: 'IN_PROGRESS',
            creator: AppState.currentUser,
            messages: [],
            participants: allAgencies
                .filter(agc => agencyIds.includes(String(agc.id)))
                .map(agc => ({id: agc.id, name: agc.name})),


            _tempData: {
                agencyIds: agencyIds
            }
        };


        modalOverlay.remove();




        ConsultationState.currentConsultation = tempChannel;
        renderChatHeader(tempChannel);
        renderMessages(tempChannel.messages || [], 0);


        const chatView = document.getElementById('chatView');
        if (chatView) chatView.classList.add('active');
        const inputContainer = document.getElementById('chatInputContainer');
        if (inputContainer) inputContainer.style.display = 'flex';
        if (window.innerWidth <= 768) {
            document.getElementById('chatLayout').classList.add('chat-active');
        }
        const newState = { consultationId: 'new' };
        history.pushState(newState, '', '#chat=new');
    });

    modalFooter.append(cancelBtn, submitBtn);

    modalContent.append(modalHeader, modalBody, modalFooter);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    function renderAgencyCheckboxes(agenciesToRender) {
        agencyCheckboxContainer.innerHTML = '';
        agenciesToRender.forEach(agency => {
            const agencyIdStr = String(agency.id);
            const isChecked = selectedAgencyIds.has(agencyIdStr);

            const checkbox = createElementSafe('input', {
                id: `dmAgency-${agency.id}`,
                attributes: {type: 'checkbox', value: agency.id}
            });
            checkbox.checked = isChecked;


            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    selectedAgencyIds.add(agencyIdStr);
                } else {
                    selectedAgencyIds.delete(agencyIdStr);
                }

                document.getElementById('dmSelectedCount').textContent = selectedAgencyIds.size;
            });

            const label = createElementSafe('label', {
                className: 'checkbox-label',
                attributes: {for: `dmAgency-${agency.id}`},
                children: [
                    checkbox,
                    createElementSafe('span', {className: 'checkbox-custom'}),
                    createElementSafe('span', {className: 'checkbox-text', text: agency.name})
                ]
            });
            agencyCheckboxContainer.appendChild(label);
        });
    }

    agencySearchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredAgencies = allAgencies.filter(agency =>
            agency.name.toLowerCase().includes(searchTerm)
        );

        renderAgencyCheckboxes(filteredAgencies);
    });




















    try {
        const agencies = await apiClient.get('/admin/agencies/search');
        console.log("Fetched agencies data:", agencies);
        allAgencies = agencies;
        renderAgencyCheckboxes(allAgencies);







    } catch (error) {
        Toast.error('대리점 목록을 불러오는 데 실패했습니다.');
    }
}

function searchConsultations() {
    ConsultationState.searchTerm = document.getElementById('listSearchInput').value;
    ConsultationState.currentPage = 1;
    refreshConsultationList();
}

function filterByStatus(status) {
    ConsultationState.statusFilter = status;
    ConsultationState.currentPage = 1;
    ConsultationState.searchTerm = '';
    const searchInput = document.getElementById('listSearchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    document.querySelectorAll('.filter-chip').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-status') === status) {
            btn.classList.add('active');
        }
    });
    refreshConsultationList();
}

function openCategoryFilter() {
    const dropdown = document.getElementById('categoryFilterDropdown');
    const optionsContainer = dropdown.querySelector('.category-filter-options');
    if (!dropdown || !optionsContainer) return;

    optionsContainer.innerHTML = '';

    const categories = AppState.commonCodes['CHN_CATEGORY'] || [];

    ConsultationState.tempCategoryFilter = [...ConsultationState.categoryFilter];

    categories.forEach(category => {
        const optionLabel = createElementSafe('label', {className: 'category-filter-option'});
        const checkbox = createElementSafe('input', {
            attributes: {type: 'checkbox', value: category.code}
        });
        checkbox.checked = ConsultationState.tempCategoryFilter.includes(category.code);
        checkbox.addEventListener('change', updateCategorySelection);

        optionLabel.append(
            checkbox,
            createElementSafe('span', {className: 'category-checkbox'}),
            createElementSafe('span', {className: 'category-label', text: category.name})
        );
        optionsContainer.appendChild(optionLabel);
    });

    dropdown.classList.add('active');
}

function toggleCategoryFilter() {
    const dropdown = document.getElementById('categoryFilterDropdown');
    if (!dropdown) return;

    if (dropdown.classList.contains('active')) {
        dropdown.classList.remove('active');
    } else {
        openCategoryFilter();
    }
}

function updateCategorySelection() {
    ConsultationState.tempCategoryFilter = Array.from(
        document.querySelectorAll('#categoryFilterDropdown .category-filter-option input:checked')
    ).map(cb => cb.value);
}

function applyCategoryFilter() {
    ConsultationState.categoryFilter = [...ConsultationState.tempCategoryFilter];
    updateCategoryFilterLabel();
    document.getElementById('categoryFilterDropdown').classList.remove('active');
    ConsultationState.searchTerm = '';
    const searchInput = document.getElementById('listSearchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    refreshConsultationList();
}

function updateCategoryFilterLabel() {
    const label = document.getElementById('categoryFilterLabel');
    const count = ConsultationState.categoryFilter.length;
    const categories = AppState.commonCodes['CHN_CATEGORY'] || [];
    if (count === 0) {
        label.textContent = '전체';
    } else if (count === 1) {
        const selectedCode = ConsultationState.categoryFilter[0];
        const category = categories.find(cat => cat.code === selectedCode);
        label.textContent = category ? category.name : selectedCode;
    } else {
        label.textContent = `${count}개 선택`;
    }
}

function cancelCategoryFilter() {
    document.getElementById('categoryFilterDropdown').classList.remove('active');
}

async function fetchConsultations() {
    try {

        const params = new URLSearchParams();

        if (ConsultationState.searchTerm) {
            params.append('keyword', ConsultationState.searchTerm);
        }
        if (ConsultationState.statusFilter !== 'all') {
            params.append('status', ConsultationState.statusFilter);
        }
        if (ConsultationState.categoryFilter.length > 0) {
            ConsultationState.categoryFilter.forEach(cat => params.append('category', cat));
        }

        const currentUserRole = AppState.currentUser.role;
        let apiEndpoint = '';

        if (currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'OPERATOR') {
            apiEndpoint = `/admin/channels?${params.toString()}`;
        } else if (currentUserRole === 'AGENCY_ADMIN' || currentUserRole === 'AGENCY_REP') {
            apiEndpoint = `/agency/channels?${params.toString()}`;
        } else {
            Toast.error("상담 목록을 조회할 권한이 없습니다.");
            return null;
        }


        const channelList = await apiClient.get(apiEndpoint);
        return channelList;

    } catch (error) {
        Toast.error('상담 목록을 불러오는 데 실패했습니다.');
        return null;
    }
}

async function refreshConsultationList() {
    try {

        const channelList = await fetchConsultations();
        if (channelList) {
            ConsultationState.consultations = channelList;
            renderConsultationList();
        }
    } catch (error) {
        console.error("상담 목록 새로고침 실패:", error);
    }
}


document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('categoryFilterDropdown');
    const filterBtn = document.getElementById('categoryFilterBtn');

    if (dropdown && filterBtn && dropdown.classList.contains('active')) {
        if (!dropdown.contains(e.target) && !filterBtn.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    }
});

function renderConsultationList() {
    const listBody = document.getElementById('chatListBody');
    if (!listBody) return;

    listBody.innerHTML = '';


    const filteredList = ConsultationState.consultations;


    if (filteredList.length === 0) {
        listBody.appendChild(
            createElementSafe('div', {
                text: '상담 내역이 없습니다',
                attributes: {
                    style: 'padding: 2rem; text-align: center; color: var(--muted-foreground);'
                }
            })
        );
        return;
    }


    filteredList.forEach(consultation => {
        try {
            const item = document.createElement('div');
            item.className = 'chat-item';
            if (ConsultationState.currentConsultation && ConsultationState.currentConsultation.id === consultation.id) {
                item.classList.add('active');
            }
            item.onclick = () => selectConsultation(consultation.id, true);

            const statusName = getCodeName('CHN_STATUS', consultation.status);
            const statusClass = consultation.status === 'OPEN' ? 'badge-warning' :
                consultation.status === 'IN_PROGRESS' ? 'badge-info' : 'badge-default';
            const categoryName = getCodeName('CHN_CATEGORY', consultation.category);
            const timeText = formatTimestampSmart(consultation.lastMessageTime || consultation.regDt);

            const participants = consultation.participants || [];
            let avatarText = '?';
            let previewText = '';

            if (consultation.type === 'DM') {
                avatarText = 'DM';
                previewText = consultation.lastMessage;
            } else {
                if (participants.length > 0) {
                    let agencyName = participants[0].name;
                    if (participants.length > 1) {
                        agencyName += ` 외 ${participants.length - 1}개`;
                    }
                    avatarText = agencyName.charAt(0);
                    previewText = agencyName;
                } else {
                    avatarText = '?';
                    previewText = '배정 대리점 없음';
                }
            }

            const avatar = createElementSafe('div', {
                className: 'chat-item-avatar',
                text: avatarText
            });

            const content = createElementSafe('div', {
                className: 'chat-item-content',
                children: [
                    createElementSafe('div', {
                        className: 'chat-item-header',
                        children: [
                            createElementSafe('h3', {className: 'chat-item-title', text: consultation.title}),
                            createElementSafe('span', { className: 'chat-item-time', text: timeText })
                        ]
                    }),
                    createElementSafe('div', {
                        attributes: {style: 'display: flex; gap: 0.5rem; margin-bottom: 0.25rem; align-items: center;'},
                        children: [
                            createElementSafe('span', {className: `badge ${statusClass}`, text: statusName}),
                            consultation.type !== 'DM' ? createElementSafe('span', {
                                style: 'font-size: 0.75rem; color: var(--muted-foreground);',
                                text: categoryName
                            }) : null
                        ]
                    }),

                    createElementSafe('p', {className: 'chat-item-preview', text: previewText}),
                ]
            });

            let unreadBadge = null;
            if (consultation.unreadCount > 0) {
                unreadBadge = createElementSafe('span', {
                    className: 'badge badge-danger',
                    attributes: {style: 'position: absolute; bottom: 0.75rem; right: 1rem; min-width: 1.25rem; height: 1.25rem; padding: 0 0.25rem; border-radius: 9999px; font-size: 0.625rem; display: flex; align-items: center; justify-content: center;'},
                    text: consultation.unreadCount
                });
            }

            item.appendChild(avatar);
            item.appendChild(content);
            if (unreadBadge) {
                item.appendChild(unreadBadge);
            }

            listBody.appendChild(item);
        } catch (error) {
            console.error("Error rendering consultation item:", consultation, error);
        }
    });
}

async function selectConsultation(id, isUserAction = false) {
    try {

        let unreadCountToScroll = 0;

        const previewItem = ConsultationState.consultations.find(c => String(c.id) === String(id));
        if (isUserAction && previewItem) {
            unreadCountToScroll = previewItem.unreadCount || 0;
        }

        const currentUserRole = AppState.currentUser.role;
        let apiEndpoint = '';
        if (currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'OPERATOR') {
            apiEndpoint = `/admin/channels/${id}`;
        } else {
            apiEndpoint = `/agency/channels/${id}`;
        }

        const fetchedConsultation = await apiClient.get(apiEndpoint);
        ConsultationState.currentConsultation = fetchedConsultation;
        const currentCon = ConsultationState.currentConsultation;

        if (currentCon) {
            if (isUserAction) {
                try {
                    let readApiEndpoint = '';
                    if (currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'OPERATOR') {
                        readApiEndpoint = `/admin/channels/${id}/read`;
                    } else {
                        readApiEndpoint = `/agency/channels/${id}/read`;
                    }
                    await apiClient.post(readApiEndpoint);
                } catch (readError) {
                    console.error("읽음 처리 API 호출 실패:", readError);
                }
                if (previewItem) {
                    previewItem.unreadCount = 0;
                }
                if (ConsultationState.currentConsultation) {
                    ConsultationState.currentConsultation.unreadCount = 0;
                }
                renderConsultationList();
            }
        }
        renderConsultationList();
        renderChatHeader(currentCon);
        renderMessages(currentCon.messages || [], unreadCountToScroll);

        const chatView = document.getElementById('chatView');
        if (chatView) chatView.classList.add('active');

        const completeBtn = document.getElementById('completeBtn');
        const inputContainer = document.getElementById('chatInputContainer');
        const userRole = AppState.currentUser.role;
        const isAdmin = (userRole === 'SUPER_ADMIN' || userRole === 'OPERATOR');

        if (currentCon && currentCon.status !== 'CLOSED') {
            if (isAdmin) {
                completeBtn.style.display = 'flex';
            } else {
                completeBtn.style.display = 'none';
            }
            inputContainer.style.display = 'flex';

        } else {
            completeBtn.style.display = 'none';
            inputContainer.style.display = 'none';
        }

        if (window.innerWidth <= 768) {
            document.getElementById('chatLayout').classList.add('chat-active');
        }


        if (!history.state || history.state.consultationId !== id) {
            history.pushState({consultationId: id}, '', `#chat=${id}`);
        }

    } catch (error) {
        console.error(error);
        Toast.error("상담 정보를 불러오는 데 실패했습니다.");
    }
}

function onChannelListUpdate(updateInfo) {


    Toast.info('새로운 상담 내역이 있습니다.');

    refreshConsultationList();
}

function closeConsultationModal() {
    const modal = document.getElementById('consultationSendModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

async function submitConsultation() {
    const category = document.getElementById('consultationCategory').value;
    const title = document.getElementById('consultationTitle').value.trim();
    const content = document.getElementById('consultationContent').value.trim();


    let hasError = false;

    if (!title) {
        document.getElementById('consultationTitleError').textContent = '제목을 입력하세요';
        hasError = true;
    }
    if (hasError) return;


    const payload = {
        type: "CON",
        title: title,
        category: category,
        content: content,
    };

    try {

        await apiClient.post('/agency/channels', payload);

        Toast.success('상담이 발송되었습니다');
        closeConsultationModal();
        await refreshConsultationList();

    } catch (error) {
        console.error("Error caught in submitConsultation:", error);
        Toast.error('상담 발송에 실패했습니다.');
    }
}

async function submitDm(agencyIdSet) {
    const agencyIds = Array.from(agencyIdSet);
    const content = document.getElementById('dmContent').value.trim();


    let hasError = false;
    if (agencyIds.length === 0) {
        document.getElementById('dmAgencyError').textContent = '받는 대리점을 선택하세요.';
        hasError = true;
    }
    if (hasError) return;

    const payload = {
        agencyIds: agencyIds,
        content: content,
        type: 'DM'
    };

    try {
        await apiClient.post('/admin/channels', payload);
        Toast.success('DM이 성공적으로 발송되었습니다.');
        document.getElementById('dmSendModal').remove();
        await refreshConsultationList();
    } catch (error) {
        Toast.error('DM 발송에 실패했습니다.');
    }
}


// async function submitComplete(event) {
//     event.preventDefault();
//
//     const category = document.getElementById('completeCategory').value;
//     const memo = document.getElementById('completeMemo').value.trim();
//
//     if (!category) {
//         document.getElementById('completeCategoryError').textContent = '카테고리를 선택하세요';
//         return;
//     }
//
//     if (!ConsultationState.currentConsultation) {
//         Toast.error("선택된 상담이 없습니다.");
//         return;
//     }
//
//     const consultationId = ConsultationState.currentConsultation.id;
//
//
//     const payload = {
//         category: category,
//         memo: memo
//
//     };
//
//     try {
//
//
//         await apiClient.put(`/admin/channels/${consultationId}/close`, payload);
//
//         Toast.success('상담이 완료되었습니다');
//         closeCompleteModal();
//
//
//         const consultation = ConsultationState.consultations.find(c => c.id === consultationId);
//         if (consultation) {
//             consultation.status = 'CLOSED';
//         }
//         ConsultationState.currentConsultation.status = 'CLOSED';
//         selectConsultation(consultationId);
//         renderConsultationList();
//
//     } catch (error) {
//         Toast.error("상담 완료 처리에 실패했습니다.");
//     }
// }

async function sendChatMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();

    if (!text && ConsultationState.attachedFiles.length === 0) {
        return;
    }

    if (!ConsultationState.currentConsultation) {
        Toast.error("메시지를 보낼 대상이 없습니다.");
        return;
    }


    try {

        const currentCon = ConsultationState.currentConsultation;
        const fileIds = ConsultationState.attachedFiles.map(f => f.id);

        if (currentCon.id === null) {
            const payload = {
                type: 'DM',
                agcIds: currentCon._tempData.agencyIds,
                content: text,
                fileIds: fileIds
            };
            const createdChannel = await apiClient.post('/admin/channels', payload);
            ConsultationState.currentConsultation.id = createdChannel.id;
            const localMessage = {
                chnId: createdChannel.id,
                content: text,
                regDt: new Date().toISOString(),
                sender: {id: AppState.currentUser.id, name: AppState.currentUser.name},
                files: ConsultationState.attachedFiles.map(f => ({
                    id: f.id,
                    name: f.name,
                    type: f.type,
                    size: f.size,
                    downloadUrl: `/api/msg/files/download/${f.id}`
                }))
            };
            onGlobalUpdate(localMessage);
        } else {
            const channelId = ConsultationState.currentConsultation.id;
            const payload = {
                content: text,
                fileIds: fileIds
            };
            apiClient.publish(`/app/channels/${channelId}/send`, payload);
        }


        input.value = '';
        ConsultationState.attachedFiles = [];
        const attachedFilesContainer = document.getElementById('attachedFilesContainer');
        if (attachedFilesContainer) {
            attachedFilesContainer.innerHTML = '';
            attachedFilesContainer.style.display = 'none';
        }


    } catch (error) {
        Toast.error("메시지 전송에 실패했습니다.");
    }
}


function closeChat() {
    history.back();
}

function handleHistoryChange(state) {
    const chatLayout = document.getElementById('chatLayout');
    const chatView = document.getElementById('chatView');

    if (state && state.consultationId) {
        if (!chatView.classList.contains('active') ||
            (ConsultationState.currentConsultation && ConsultationState.currentConsultation.id != state.consultationId)) {

            selectConsultation(state.consultationId, false);
        }
    } else {
        if (chatLayout) {
            chatLayout.classList.remove('chat-active');
        }
        if (chatView) {
            chatView.classList.remove('active');
        }
        if (ChatSearchState.isSearching) {
            closeChatSearch();
        }
    }
}

function renderChatHeader(consultation) {
    const titleEl = document.getElementById('chatTitle');
    const subtitleEl = document.getElementById('chatSubtitle');
    const previewEl = document.getElementById('chatPreview');

    let headerTitle = consultation.title;

    if (consultation.type === 'CON') {
        const participants = consultation.participants;
        if (participants && participants.length > 0) {
            headerTitle = participants[0].name;
            if (participants.length > 1) {
                headerTitle += ` 외 ${participants.length - 1}개`;
            }
        } else {
            headerTitle = "참여 대리점 없음";
        }
    }

    titleEl.textContent = headerTitle;

    const creatorName = (consultation.creator && consultation.creator.name) ? consultation.creator.name : "고객";
    let subtitleText = creatorName;
    if (consultation.type === 'CON') {
        const categoryName = getCodeName('CHN_CATEGORY', consultation.category);
        subtitleText += ` · ${categoryName}`;
    }
    previewEl.textContent = subtitleText;
}

function renderMessages(messages, unreadCountToScroll = 0) {
    console.log(messages);
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;

    messagesContainer.innerHTML = '';

    if (!messages || messages.length === 0) {
        messagesContainer.appendChild(
            createElementSafe('div', {
                text: '메시지가 없습니다',
                attributes: {
                    style: 'text-align: center; color: var(--muted-foreground); padding: 2rem;'
                }
            })
        );
        return;
    }


    const currentConsultation = ConsultationState.currentConsultation;


    const firstUnreadIndex = (unreadCountToScroll > 0 && messages.length > 0)
        ? Math.max(0, messages.length - unreadCountToScroll)
        : -1;

    if (currentConsultation && currentConsultation.type === 'CON' && messages.length > 0) {
        const firstMessage = messages[0];
        const nameInitial = (firstMessage.sender && firstMessage.sender.name) ? firstMessage.sender.name.charAt(0) : '고';
        const name = (firstMessage.sender && firstMessage.sender.name) ? firstMessage.sender.name : '고객';

        const toggleBtn = createElementSafe('button', {
            className: 'notice-card-toggle',
            attributes: {'aria-label': '접기/펼치기'},
            children: [
                Icon({type: 'chevronUp', className: 'chevron-icon', size: 16})
            ]
        });
        toggleBtn.onclick = toggleNoticeCard;

        const noticeCard = createElementSafe('div', {
            className: 'consultation-notice-card collapsed',
            id: 'consultationNoticeCard',
            children: [
                createElementSafe('div', {
                    className: 'notice-card-header',
                    children: [
                        createElementSafe('h4', {
                            className: 'notice-card-title',
                            text: currentConsultation.title
                        }),
                        toggleBtn
                    ]
                }),
                createElementSafe('div', {
                    className: 'notice-card-content',
                    id: 'noticeCardContent',
                    children: [
                        createElementSafe('div', {
                            className: 'message received',
                            attributes: {style: 'margin: 0;'},
                            children: [
                                createElementSafe('div', {className: 'message-avatar', text: nameInitial}),
                                createElementSafe('div', {
                                    className: 'message-content',
                                    children: [
                                        createElementSafe('div', {
                                            attributes: {style: 'font-size: 0.75rem; color: var(--muted-foreground); margin-bottom: 0.25rem;'},
                                            text: name
                                        }),

                                        firstMessage.content ? createElementSafe('div', {
                                            className: 'message-bubble',
                                            text: firstMessage.content
                                        }) : null,

                                        createElementSafe('div', {
                                            className: 'message-time',
                                            text: formatTimestampSmart(firstMessage.regDt)
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                })
            ]
        });

        messagesContainer.appendChild(noticeCard);

    }

    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        const isSent = message.sender && String(message.sender.id) === String(AppState.currentUser.id);

        let fileElements = [];



        if (message.files && message.files.length > 0) {
            message.files.forEach(file => {
                const isImage = file.type && file.type.startsWith('image/');

                if (isImage) {
                    const img = createElementSafe('img', {
                        attributes: {
                            src: file.downloadUrl,
                            alt: file.name,
                            style: 'max-width: 200px; max-height: 150px; cursor: pointer; border-radius: var(--radius-sm);'
                        }
                    });
                    img.onclick = () => openImageModal(file.downloadUrl, file.name);

                    fileElements.push(createElementSafe('div', {
                        className: 'message-file-item message-file-image',
                        children: [img]
                    }));
                } else {

                    const fileIcon = createElementSafe('div', {
                        className: 'file-icon',
                        children: [Icon({ type: 'file', size: 24 })]
                    });


                    const downloadLink = createElementSafe('a', {
                        className: 'file-download-link',
                        attributes: {
                            href: file.downloadUrl,
                            download: file.name,
                            title: '다운로드'
                        },
                        children: [Icon({ type: 'download', size: 20 })]
                    });


                    fileElements.push(createElementSafe('div', {
                        className: 'message-file-item message-file-document',
                        children: [
                            fileIcon,
                            createElementSafe('div', {
                                className: 'file-info',
                                children: [
                                    createElementSafe('span', { className: 'file-name', text: file.name }),
                                    createElementSafe('span', { className: 'file-size', text: formatFileSize(file.size) })
                                ]
                            }),
                            downloadLink
                        ]
                    }));
                }
            });
        }

        const filesContainer = fileElements.length > 0 ? createElementSafe('div', {
            className: 'message-files',
            children: fileElements
        }) : null;
        const textBubble = message.content ? createElementSafe('div', {
            className: 'message-bubble',
            text: message.content
        }) : null;

        let messageContentChildren = [];
        if (isSent) {
            messageContentChildren = [
                createElementSafe('div', {
                    attributes: {style: 'font-size: 0.75rem; color: var(--muted-foreground); margin-bottom: 0.25rem;'},
                    text: '나'
                }),
                filesContainer,
                textBubble,
                createElementSafe('div', {className: 'message-time', text: formatTimestampSmart(message.regDt)})
            ];
        } else {
            const senderName = (message.sender && message.sender.name) ? message.sender.name : '알 수 없음';

            messageContentChildren = [
                createElementSafe('div', {
                    attributes: {style: 'font-size: 0.75rem; color: var(--muted-foreground); margin-bottom: 0.25rem;'},
                    text: senderName
                }),
                filesContainer,
                textBubble,
                createElementSafe('div', {className: 'message-time', text: formatTimestampSmart(message.regDt)})
            ];
        }

        const messageContent = createElementSafe('div', {
            className: 'message-content',
            children: messageContentChildren
        });

        const nameInitial = isSent ? null : ((message.sender && message.sender.name) ? message.sender.name.charAt(0) : '?');

        const messageEl = createElementSafe('div', {
            className: `message ${isSent ? 'sent' : 'received'}`,
            children: [
                isSent ? null : createElementSafe('div', {className: 'message-avatar', text: nameInitial}),
                messageContent
            ]
        });
        if (i === firstUnreadIndex) {
            messageEl.id = 'firstUnreadMessage';
        }
        messagesContainer.appendChild(messageEl);
    }
    setTimeout(() => {
        const firstUnreadElement = document.getElementById('firstUnreadMessage');

        if (firstUnreadElement) {
            firstUnreadElement.scrollIntoView({behavior: 'auto', block: 'start'});
        } else {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }, 0);
}

function toggleNoticeCard() {
    const noticeCard = document.getElementById('consultationNoticeCard');
    const content = document.getElementById('noticeCardContent');
    const chevron = noticeCard ? noticeCard.querySelector('.chevron-icon') : null;

    if (!noticeCard || !content || !chevron) return;

    const isCollapsed = noticeCard.classList.toggle('collapsed');

    if (isCollapsed) {
        content.style.display = 'none';
        chevron.style.transform = 'rotate(180deg)';
    } else {
        content.style.display = 'block';
        chevron.style.transform = 'rotate(0deg)';
    }
}

function downloadImageFile(imageUrl, fileName) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function closeChatSearch() {
    const searchHeader = document.getElementById('messageSearchHeader');
    const chatHeader = document.querySelector('.chat-header');
    const searchInput = document.getElementById('messageSearchInput');

    ChatSearchState.isSearching = false;
    ChatSearchState.searchTerm = '';
    ChatSearchState.searchResults = [];
    ChatSearchState.currentResultIndex = -1;

    searchHeader.style.display = 'none';
    chatHeader.style.display = 'flex';
    searchInput.value = '';


    clearSearchHighlights();
    updateSearchUI();
}

function clearSearchHighlights() {
    const highlights = document.querySelectorAll('.search-highlight');
    highlights.forEach(highlight => {
        const text = highlight.textContent;
        const textNode = document.createTextNode(text);
        highlight.parentNode.replaceChild(textNode, highlight);
    });


    const messageBubbles = document.querySelectorAll('.message-bubble');
    messageBubbles.forEach(bubble => {
        bubble.normalize();
    });
}

function updateSearchUI() {
    const resultCount = document.getElementById('messageSearchResultCount');
    const prevBtn = document.getElementById('searchPrevBtn');
    const nextBtn = document.getElementById('searchNextBtn');

    if (ChatSearchState.searchResults.length > 0) {
        resultCount.textContent = `${ChatSearchState.currentResultIndex + 1}/${ChatSearchState.searchResults.length}`;
        prevBtn.disabled = false;
        nextBtn.disabled = false;
    } else {
        resultCount.textContent = ChatSearchState.searchTerm ? '0/0' : '0/0';
        prevBtn.disabled = true;
        nextBtn.disabled = true;
    }
}


function onGlobalUpdate(updateData) {
    if (ChatSearchState.isSearching) {
        Toast.info("새 메시지가 도착하여 검색이 초기화되었습니다.");
        closeChatSearch();
    }

    let chnId;
    let isNewChannel = false;
    let newChannelData = null;

    if (updateData.content !== undefined && updateData.chnId !== undefined) {

        chnId = updateData.chnId;
    } else if (updateData.id !== undefined && updateData.title !== undefined) {

        chnId = updateData.id;
        isNewChannel = true;
        newChannelData = updateData;
    } else {
        return;
    }


    let previewItem = ConsultationState.consultations.find(c => String(c.id) === String(chnId));
    if (isNewChannel && !previewItem) {
        ConsultationState.consultations.unshift(newChannelData);
        previewItem = newChannelData;
    }

    if (!previewItem) {
        return;
    }


    if (isNewChannel) {
        Object.assign(previewItem, newChannelData);
    } else {
        previewItem.lastMessage = updateData.content;
        previewItem.lastMessageTime = updateData.regDt;

        const isMyMessage = updateData.sender && String(updateData.sender.id) === String(AppState.currentUser.id);


        const isViewing = ConsultationState.currentConsultation && String(ConsultationState.currentConsultation.id) === String(chnId);

        if (!isMyMessage && !isViewing) {
            previewItem.unreadCount = (previewItem.unreadCount || 0) + 1;
        }


        if (isViewing) {
            ConsultationState.currentConsultation.messages.push(updateData);
            renderMessages(ConsultationState.currentConsultation.messages);
        }
    }
    ConsultationState.consultations.sort((a, b) => {
        const getTimestamp = (item) => {
            const timeStr = item.lastMessageTime || item.regDt;
            if (!timeStr) return 0;
            const timestamp = new Date(timeStr).getTime();
            return isNaN(timestamp) ? 0 : timestamp;
        };

        const timeA = getTimestamp(a);
        const timeB = getTimestamp(b);
        return timeB - timeA;
    })
    renderConsultationList();
}


async function openConsultationModal() {

    const existingModal = document.getElementById('consultationSendModal');
    if (existingModal) existingModal.remove();


    const modalOverlay = createElementSafe('div', {
        id: 'consultationSendModal',
        className: 'modal-overlay active registration-modal'
    });


    const modalContent = createElementSafe('div', {
        className: 'modal-content'
    });


    const closeBtn = createElementSafe('button', {
        className: 'modal-close',
        children: [Icon({type: 'close', size: 20})]
    });

    closeBtn.addEventListener('click', () => modalOverlay.remove());


    const modalHeader = createElementSafe('div', {
        className: 'modal-header',
        children: [
            createElementSafe('h2', {className: 'modal-title', text: '상담 등록'}),
            closeBtn
        ]
    });


    const modalBody = createElementSafe('div', {
        className: 'modal-body'
    });
    const form = createElementSafe('form', {
        className: 'modal-form'
    });


    const categorySelect = createElementSafe('select', {
        id: 'consultationCategory',
        className: 'form-select'
    });

    const categories = ["영업문의", "장애/기술지원", "청구/정산", "기타"];
    categories.forEach(cat => {
        categorySelect.appendChild(createElementSafe('option', {text: cat, attributes: {value: cat}}));
    });


    const contentTextarea = createElementSafe('textarea', {
        id: 'consultationContent',
        className: 'form-input',
        attributes: {rows: '6', placeholder: '문의 내용을 입력하세요'}
    });


    const titleInput = createElementSafe('input', {
        id: 'consultationTitle',
        className: 'form-input',
        attributes: {type: 'text', placeholder: '상담 제목을 입력하세요'}
    });


    form.append(
        createFormGroup('consultationTitle', '상담 제목 *', titleInput, 'consultationTitleError'),
        createFormGroup('consultationCategory', '문의 종류 *', categorySelect, 'consultationCategoryError'),
        createFormGroup('consultationContent', '문의 내용 *', contentTextarea, 'consultationContentError')
    );
    modalBody.appendChild(form);


    const modalFooter = createElementSafe('div', {
        className: 'modal-footer'
    });
    const cancelBtn = createElementSafe('button', {
        type: 'button',
        className: 'btn btn-outline',
        text: '취소'
    });

    cancelBtn.addEventListener('click', closeConsultationModal);

    const submitBtn = createElementSafe('button', {
        type: 'button',
        className: 'btn btn-primary',
        text: '등록'
    });

    submitBtn.addEventListener('click', submitConsultation);

    modalFooter.append(cancelBtn, submitBtn);


    modalContent.append(modalHeader, modalBody, modalFooter);
    modalOverlay.appendChild(modalContent);

    document.body.style.overflow = 'hidden';

    document.body.appendChild(modalOverlay);
}

function formatTimestampSmart(isoString) {
    if (!isoString) return '';

    try {
        const date = new Date(isoString);
        const now = new Date();
        const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        if (diffHours < 24 && date.getDate() === now.getDate()) {
            return `${hours}:${minutes}`;
        } else {
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${month}/${day} ${hours}:${minutes}`;
        }
    } catch (e) {
        console.error('Invalid date string for formatting:', isoString, e);
        return '';
    }
}

function performChatSearch() {
    clearSearchHighlights();

    const searchInput = document.getElementById('messageSearchInput');
    const searchTerm = searchInput.value.trim();
    ChatSearchState.searchTerm = searchTerm;

    if (searchTerm === '') {
        ChatSearchState.searchResults = [];
        ChatSearchState.currentResultIndex = -1;
        updateSearchUI();
        return;
    }

    const messagesContainer = document.getElementById('chatMessages');
    const messageBubbles = messagesContainer.querySelectorAll('.message-bubble');
    const results = [];
    const regex = new RegExp(searchTerm.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');

    messageBubbles.forEach(bubble => {
        const textNodes = Array.from(bubble.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
        textNodes.forEach(node => {
            let match;
            let lastIndex = 0;
            const fragment = document.createDocumentFragment();
            while ((match = regex.exec(node.textContent)) !== null) {
                fragment.appendChild(document.createTextNode(node.textContent.substring(lastIndex, match.index)));

                const highlight = createElementSafe('mark', {
                    className: 'search-highlight',
                    text: match[0]
                });
                results.push(highlight);
                fragment.appendChild(highlight);

                lastIndex = regex.lastIndex;
            }
            fragment.appendChild(document.createTextNode(node.textContent.substring(lastIndex)));
            node.parentNode.replaceChild(fragment, node);
        });
    });

    ChatSearchState.searchResults = results;
    ChatSearchState.currentResultIndex = results.length > 0 ? 0 : -1;
    updateSearchUI();




}

function navigateChatSearch(direction) {
    if (ChatSearchState.searchResults.length === 0) return;

    const current = document.querySelector('.search-highlight.current');
    if (current) current.classList.remove('current');

    let newIndex = ChatSearchState.currentResultIndex;

    if (direction === 'next') {
        newIndex = (newIndex + 1) % ChatSearchState.searchResults.length;
    } else if (direction === 'prev') {
        newIndex = (newIndex - 1 + ChatSearchState.searchResults.length) % ChatSearchState.searchResults.length;
    } else if (typeof direction === 'number') {
        newIndex = direction;
    }

    ChatSearchState.currentResultIndex = newIndex;
    const nextResult = ChatSearchState.searchResults[newIndex];

    if (nextResult) {
        nextResult.classList.add('current');
        nextResult.scrollIntoView({behavior: 'smooth', block: 'center'});
    }
    updateSearchUI();
}

function openChatSearch() {
    const searchHeader = document.getElementById('messageSearchHeader');
    const chatHeader = document.querySelector('.chat-header');
    const searchInput = document.getElementById('messageSearchInput');

    ChatSearchState.isSearching = true;
    searchHeader.style.display = 'flex';
    chatHeader.style.display = 'none';
    searchInput.focus();
    updateSearchUI();
}

function createAttachmentPreview(file, tempId) {
    const isImage = file.type.startsWith('image/');
    const fileSizeFormatted = formatFileSize(file.size);

    const previewContent = isImage
        ? [createElementSafe('img', { attributes: { src: URL.createObjectURL(file), alt: file.name, style: 'width: 40px; height: 40px; object-fit: cover;' } })]
        : [Icon({ type: 'file', size: 24 })];

    const removeBtn = createElementSafe('button', {
        className: 'remove-file-btn',
        attributes: { type: 'button', title: '제거' },
        children: [Icon({ type: 'close', size: 16 })]

    });

    const previewElement = createElementSafe('div', {
        className: 'attachment-preview-item',
        id: `preview-${tempId}`,
        children: [
            ...previewContent,
            createElementSafe('div', {
                className: 'attachment-info',
                children: [
                    createElementSafe('span', { className: 'attachment-name', text: file.name }),
                    createElementSafe('span', { className: 'attachment-size', text: fileSizeFormatted })
                ]
            }),
            removeBtn
        ]
    });
    return previewElement;
}

function removeAttachedFile(fileId, previewElement) {

    ConsultationState.attachedFiles = ConsultationState.attachedFiles.filter(f => f.id !== fileId);


    if (previewElement) {
        previewElement.remove();
    }


    const attachedFilesContainer = document.getElementById('attachedFilesContainer');
    if (attachedFilesContainer && ConsultationState.attachedFiles.length === 0) {
        attachedFilesContainer.style.display = 'none';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes < 0 || isNaN(bytes)) return 'Invalid size';
    if (bytes < 1) return parseFloat(bytes.toFixed(1)) + ' ' + sizes[0];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const index = Math.min(i, sizes.length - 1);
    return parseFloat((bytes / Math.pow(k, index)).toFixed(1)) + ' ' + sizes[index];
}

async function submitComplete(selectedCategory) {
    // event.preventDefault();

    const category = selectedCategory;
    // const memo = document.getElementById('completeMemo').value.trim();

    if (!category) {
        Toast.error("카테고리를 선택하세요.");
        return;
    }

    if (!ConsultationState.currentConsultation) {
        Toast.error("선택된 상담이 없습니다.");
        return;
    }

    const consultationId = ConsultationState.currentConsultation.id;
    const payload = {
        category: category,
        memo: ""
    };

    try {
        await apiClient.put(`/admin/channels/${consultationId}/close`, payload);
        Toast.success('상담이 완료되었습니다');
        // closeCompleteModal(); // 이미 2단계에서 모달을 닫음
        const consultation = ConsultationState.consultations.find(c => c.id === consultationId);
        if (consultation) {
            consultation.status = 'CLOSED';
        }
        ConsultationState.currentConsultation.status = 'CLOSED';
        selectConsultation(consultationId, false);
        renderConsultationList();

    } catch (error) {
        console.error("상담 완료 처리 실패:", error);
        Toast.error("상담 완료 처리에 실패했습니다.");
    }
}

function openCompleteModal() {
    // 이전 모달이 있다면 제거
    const existingModal = document.getElementById('completeModal');
    if (existingModal) existingModal.remove();
    const categories = AppState.commonCodes['CHN_CATEGORY'] || [];
    let selectedCategory = categories.length > 0 ? categories[0].code : "";
    const modalOverlay = createElementSafe('div', {
        id: 'completeModal',
        className: 'modal-overlay active registration-modal'
    });
    const modalContent = createElementSafe('div', {
        className: 'modal-content',
        attributes: { style: 'max-width: 25rem;' } // 모달 너비 조절
    });
    const closeBtn = createElementSafe('button', {
        className: 'modal-close',
        children: [Icon({ type: 'close', size: 20 })]
    });
    closeBtn.addEventListener('click', () => modalOverlay.remove());

    const modalHeader = createElementSafe('div', {
        className: 'modal-header',
        children: [
            createElementSafe('h2', { className: 'modal-title', text: '상담 카테고리 선택' }),
            closeBtn
        ]
    });
    const modalBody = createElementSafe('div', {
        className: 'modal-body',
        attributes: { style: 'display: flex; flex-direction: column; gap: 1rem;' }
    });
    categories.forEach((category, index) => {
        const radioId = `category-radio-${category.code}`;

        const radioInput = createElementSafe('input', {
            id: radioId,
            attributes: {
                type: 'radio',
                name: 'completeCategory',
                value: category.code,
                style: 'display: none;'
            }
        });
        if (index === 0) radioInput.checked = true;
        const customRadio = createElementSafe('span', {
            className: 'custom-radio-ui',
            attributes: { style: 'width: 20px; height: 20px; border: 2px solid var(--border); border-radius: 50%; display: inline-block; position: relative; margin-right: 0.75rem; flex-shrink: 0;' }
        });
        const customRadioInner = createElementSafe('span', {
            attributes: { style: 'width: 12px; height: 12px; background-color: var(--primary); border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: none;' }
        });
        customRadio.appendChild(customRadioInner);
        const label = createElementSafe('label', {
            className: 'category-radio-label',
            attributes: {
                for: radioId,
                style: 'display: flex; align-items: center; cursor: pointer; font-size: 1rem;'
            },
            children: [
                radioInput,
                customRadio,
                createElementSafe('span', { text: category.name })
            ]
        });
        radioInput.addEventListener('change', () => {
            selectedCategory = radioInput.value;
            modalBody.querySelectorAll('.custom-radio-ui span').forEach(inner => inner.style.display = 'none');
            customRadioInner.style.display = 'block';
        });
        if (index === 0) customRadioInner.style.display = 'block';
        modalBody.appendChild(label);
    });

    const modalFooter = createElementSafe('div', {
        className: 'modal-footer',
        attributes: { style: 'padding-top: 0;' }
    });

    const submitBtn = createElementSafe('button', {
        type: 'button',
        className: 'btn btn-primary w-full',
        text: '완료'
    });

    submitBtn.addEventListener('click', () => {
        submitComplete(selectedCategory);
        modalOverlay.remove();
    });

    modalFooter.appendChild(submitBtn);

    // --- 모달 조립 및 표시 ---
    modalContent.append(modalHeader, modalBody, modalFooter);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    document.body.style.overflow = 'hidden';
}


document.addEventListener('DOMContentLoaded', async () => {

    await window.authReady;
    await window.codesReady;
    try {
        await apiClient.connectWebSocket();
        apiClient.subscribe(
            `/topic/user/${AppState.currentUser.loginId}`,
            onGlobalUpdate
        );

    } catch (error) {
        console.error("WebSocket 연결 실패:", error);
    }

    await refreshConsultationList();

    let initialConsultationId = null;
    if (window.location.hash.startsWith('#chat=')) {
        const id = window.location.hash.split('=')[1];
        if (id) {
            initialConsultationId = id;
            const state = {consultationId: id};
            history.replaceState(state, '', `#chat=${id}`);
        }
    } else {
        history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    renderConsultationList();

    if (initialConsultationId) {
        selectConsultation(initialConsultationId, false);
    }


    const currentUserRole = AppState.currentUser.role;
    const openModalBtn = document.getElementById('openModalBtn');
    const openDmModalBtn = document.getElementById('openDmModalBtn');

    if (currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'OPERATOR') {
        openModalBtn.style.display = 'none';
        openDmModalBtn.style.display = 'flex';
        openDmModalBtn.addEventListener('click', openDmModal);
    } else {
        openModalBtn.addEventListener('click', openConsultationModal);
    }


    const sendBtn = document.getElementById('sendMessageBtn');
    const textInput = document.getElementById('messageInput');

    if (sendBtn) {
        sendBtn.addEventListener('click', sendChatMessage);
    }
    if (textInput) {
        textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }

    const backBtn = document.getElementById('backToListBtn');




    if (backBtn) {
        backBtn.addEventListener('click', () => {
            closeChat();
        });
    }

    window.addEventListener('popstate', (event) => {
        handleHistoryChange(event.state);
    });


    const categoryFilterBtn = document.getElementById('categoryFilterBtn');
    if (categoryFilterBtn) {
        categoryFilterBtn.addEventListener('click', toggleCategoryFilter);
    }
    const applyCategoryBtn = document.getElementById('applyCategoryBtn');
    if (applyCategoryBtn) {
        applyCategoryBtn.addEventListener('click', applyCategoryFilter);
    }
    const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
    if (cancelCategoryBtn) {
        cancelCategoryBtn.addEventListener('click', cancelCategoryFilter);
    }

    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const status = chip.getAttribute('data-status');
            filterByStatus(status);
        });
    });

    const listSearchInput = document.getElementById('listSearchInput');
    const listSearchBtn = document.getElementById('listSearchBtn');

    if (listSearchBtn) {
        listSearchBtn.addEventListener('click', () => {
            searchConsultations();
        });
    }
    if (listSearchInput) {
        listSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchConsultations();
            }
        });
    }

    const startSearchBtn = document.getElementById('toggleMessageSearchBtn');
    if (startSearchBtn) {
        startSearchBtn.addEventListener('click', openChatSearch);
    }
    const closeSearchBtn = document.getElementById('closeMessageSearchBtn');
    if (closeSearchBtn) {
        closeSearchBtn.addEventListener('click', closeChatSearch);
    }
    const chatSearchInput = document.getElementById('messageSearchInput');
    if (chatSearchInput) {







        chatSearchInput.addEventListener('input', (e) => {
            performChatSearch();
        });
        chatSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                navigateChatSearch('next');
            }
        });
    }

    const searchPrevBtn = document.getElementById('searchPrevBtn');
    if (searchPrevBtn) {
        searchPrevBtn.addEventListener('click', () => {



            navigateChatSearch('prev');
        });
    }
    const searchNextBtn = document.getElementById('searchNextBtn');
    if (searchNextBtn) {
        searchNextBtn.addEventListener('click', () => {



            navigateChatSearch('next');
        });
    }

    const attachBtn = document.getElementById('attachFileBtn');
    const fileInput = document.getElementById('fileInput');
    const attachedFilesContainer = document.getElementById('attachedFilesContainer');

    if (attachBtn && fileInput) {
        attachBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }

    if (fileInput && attachedFilesContainer) {
        fileInput.addEventListener('change', async (event) => {
            console.log(">>> File Input Changed. event.target.files:", event.target.files);
            const files = event.target.files;
            if (!files || files.length === 0) {
                console.log(`[File Change] Found ${files ? files.length : 'null/undefined'} files.`);
                return;
            }


            attachedFilesContainer.style.display = 'flex';
            for (const file of files) {
                const fileId = `temp-${Date.now()}-${Math.random()}`;
                const previewElement = createAttachmentPreview(file, fileId);
                attachedFilesContainer.appendChild(previewElement);
                try {
                    const formData = new FormData();
                    formData.append('file', file);
                    previewElement.classList.add('uploading');
                    const uploadResponse = await apiClient.postMultipart('/msg/files/upload', formData);
                    const uploadedFileId = uploadResponse.fileId;
                    previewElement.classList.remove('uploading');
                    previewElement.classList.add('uploaded');

                    previewElement.dataset.fileId = uploadedFileId;
                    ConsultationState.attachedFiles.push({
                        id: uploadedFileId,
                        name: file.name,
                        type: file.type,
                        size: file.size,

                    });

                    const removeBtn = previewElement.querySelector('.remove-file-btn');
                    if(removeBtn) {
                        removeBtn.onclick = () => removeAttachedFile(uploadedFileId, previewElement);
                    }

                } catch (error) {
                    console.error("File upload failed:", file.name, error);
                    Toast.error(`'${file.name}' 업로드 실패`);
                    previewElement.remove();
                }
            }
            fileInput.value = '';
        });
    }

    const completeBtn = document.getElementById('completeBtn');
    if (completeBtn) {
        completeBtn.addEventListener('click', () => {
            openCompleteModal();
        });
    }

    // await refreshConsultationList();
});
