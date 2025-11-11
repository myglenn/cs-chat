const ICONS = {
    logo: {
        paths: [
            {d: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"}
        ]
    },
    success: {paths: [{d: "M22 11.08V12a10 10 0 1 1-5.93-9.14"}, {tag: 'polyline', points: "22 4 12 14.01 9 11.01"}]},
    error: {
        paths: [{tag: 'circle', cx: "12", cy: "12", r: "10"}, {
            tag: 'line',
            x1: "12",
            y1: "8",
            x2: "12",
            y2: "12"
        }, {tag: 'line', x1: "12", y1: "16", x2: "12.01", y2: "16"}]
    },
    warning: {
        paths: [{d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"}, {
            tag: 'line',
            x1: "12",
            y1: "9",
            x2: "12",
            y2: "13"
        }, {tag: 'line', x1: "12", y1: "17", x2: "12.01", y2: "17"}]
    },
    info: {
        paths: [{tag: 'circle', cx: "12", cy: "12", r: "10"}, {
            tag: 'line',
            x1: "12",
            y1: "16",
            x2: "12",
            y2: "12"
        }, {tag: 'line', x1: "12", y1: "8", x2: "12.01", y2: "8"}]
    },
    close: {paths: [{d: "M18 6 6 18"}, {d: "m6 6 12 12"}]},
    search: {paths: [{tag: 'circle', cx: '11', cy: '11', r: '8'}, {d: 'm21 21-4.3-4.3'}]},
    searchSmall: {
        paths: [
            {tag: 'circle', cx: "11", cy: "11", r: "8"},
            {d: "m21 21-4.3-4.3"}
        ]
    },
    megaphone: {paths: [{d: "M3 11v5a2 2 0 0 0 2 2h2"}, {d: "M19 16v-5a2 2 0 0 0-2-2h-2"}, {d: "M5 16H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h1"}, {d: "M19 11h1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-1"}, {d: "m12 16-3-5h6l-3 5Z"}, {d: "M8 8a4 4 0 0 1 8 0"}, {d: "M12 3v1"}]},
    chevronUp: {paths: [{d: "m18 15-6-6-6 6"}]},

    file: {
        paths: [
            {d: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"},
            {tag: 'polyline', points: "14 2 14 8 20 8"}
        ]
    },

    download: {
        paths: [
            {d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"},
            {tag: 'polyline', points: "7 10 12 15 17 10"},
            {tag: 'line', x1: "12", y1: "15", x2: "12", y2: "3"}
        ]
    },
    send: {
        paths: [
            {d: "m22 2-7 20-4-9-9-4Z"},
            {d: "M22 2 11 13"}
        ]
    },
    leave: {
        paths: [
            {d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"},
            {tag: 'polyline', points: "16 17 21 12 16 7"},
            {tag: 'line', x1: "21", y1: "12", x2: "9", y2: "12"}
        ]
    },
    check: {
        paths: [
            {tag: 'polyline', points: "20 6 9 17 4 12"}
        ]
    },
    sun: {
        paths: [
            {d: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"}
        ]
    },
    moon: {
        paths: [
            {d: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"}
        ]
    },
    eye: {
        paths: [
            {d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z"},
            {d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"}
        ]
    },
    eyeOff: {
        paths: [
            {d: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"}
        ]
    },
    filter: {
        paths: [
            {tag: 'circle', cx: "12", cy: "12", r: "1"},
            {tag: 'circle', cx: "12", cy: "5", r: "1"},
            {tag: 'circle', cx: "12", cy: "19", r: "1"}
        ]
    },
    chevronLeft: {
        paths: [
            {d: "m15 18-6-6 6-6"}
        ]
    },
    chevronDown: {
        paths: [
            {d: "m6 9 6 6 6-6"}
        ]
    },
    attach: {
        paths: [
            {d: "m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"}
        ]
    },
    plus: {
        paths: [
            {d: "M5 12h14"},
            {d: "M12 5v14"}
        ]
    },
    userPlus: {
        paths: [
            {d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"},
            {tag: 'circle', cx: "9", cy: "7", r: "4"},
            {d: "M22 21v-2a4 4 0 0 0-3-3.87"},
            {d: "M16 3.13a4 4 0 0 1 0 7.75"}
        ]
    },
    building: {
        paths: [
            {d: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"},
            {d: "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"},
            {d: "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"},
            {d: "M10 6h4"}, {d: "M10 10h4"}, {d: "M10 14h4"}, {d: "M10 18h4"}
        ]
    },
    trash: {
        paths: [
            {d: "M3 6h18"},
            {d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"},
            {d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"}
        ]
    },
    moonHeader: {
        paths: [
            {d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"}
        ]
    },
    sunHeader: {
        paths: [
            {tag: 'circle', cx: "12", cy: "12", r: "4"},
            {d: "M12 2v2"}, {d: "M12 20v2"},
            {d: "m4.93 4.93 1.41 1.41"}, {d: "m17.66 17.66 1.41 1.41"},
            {d: "M2 12h2"}, {d: "M20 12h2"},
            {d: "m6.34 17.66-1.41 1.41"}, {d: "m19.07 4.93-1.41 1.41"}
        ]
    },
    userAvatar: {
        paths: [
            {d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"},
            {tag: 'circle', cx: "12", cy: "7", r: "4"}
        ]
    },
    settings: {
        paths: [
            {d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"},
            {tag: 'circle', cx: "12", cy: "12", r: "3"}
        ]
    },
    logout: {
        paths: [
            {d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"},
            {tag: 'polyline', points: "16 17 21 12 16 7"},
            {tag: 'line', x1: "21", y1: "12", x2: "9", y2: "12"}
        ]
    },
    menu: {
        paths: [
            {tag: 'line', x1: "4", y1: "12", x2: "20", y2: "12"},
            {tag: 'line', x1: "4", y1: "6", x2: "20", y2: "6"},
            {tag: 'line', x1: "4", y1: "18", x2: "20", y2: "18"}
        ]
    },
    consultation: {
        paths: [
            {d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"}
        ]
    }
};
ICONS.confirm = ICONS.warning;


function Icon({type, className, size = 24}) {
    const iconData = ICONS[type];
    if (!iconData) return null;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, 'svg');

    svg.setAttribute('class', className || '');
    svg.setAttribute('xmlns', svgNS);
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');

    iconData.paths.forEach(pathData => {
        const tagName = pathData.tag || 'path';
        const element = document.createElementNS(svgNS, tagName);

        for (const key in pathData) {
            if (key !== 'tag') {
                element.setAttribute(key, pathData[key]);
            }
        }
        svg.appendChild(element);
    });

    return svg;
}


function createFormGroup(options, labelText, inputElement, errorId) {
    let id, label, value, placeholder, type, readonly;
    let finalInputElement;

    if (typeof options === 'object' && options !== null) {
        ({id, label, value, placeholder, type = 'text', readonly = false} = options);

        finalInputElement = document.createElement('input');
        finalInputElement.type = type;
        finalInputElement.id = id;
        finalInputElement.className = 'form-input';
        finalInputElement.value = value || '';
        if (placeholder) finalInputElement.placeholder = placeholder;
        if (readonly) finalInputElement.readOnly = true;

        finalInputElement.addEventListener('change', () => {
            if (typeof updateFormField === 'function') {
                updateFormField(id, finalInputElement.value);
            }
        });

    } else {
        id = options;
        label = labelText;
        finalInputElement = inputElement;
    }


    const group = document.createElement('div');
    group.className = 'form-group';

    const labelEl = document.createElement('label');
    labelEl.className = 'form-label';
    labelEl.htmlFor = id;
    labelEl.textContent = label;

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.id = (typeof options === 'object') ? `${id}Error` : (errorId || `${id}Error`);

    group.append(labelEl, finalInputElement, errorDiv);
    return group;
}