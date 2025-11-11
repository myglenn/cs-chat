const ICONS = {
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