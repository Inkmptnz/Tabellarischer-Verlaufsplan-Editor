document.addEventListener('DOMContentLoaded', () => {

    const tableElement = document.querySelector('.plan-table');
    if (tableElement) {
        initTableLogic(tableElement);
    }

    const lernzieleSection = document.querySelector('.lernziele-section');
    if (lernzieleSection) {
        initLernzieleLogic(lernzieleSection);
    }

    const editorElement = document.querySelector('.plan-editor');
    if (editorElement) {
        initTimeLogic(editorElement);
    }
});

function initLernzieleLogic(lernzieleSection) {
    const dom = {
        container: lernzieleSection.querySelector('.lernziele-container'),
        list: lernzieleSection.querySelector('ul'),
        addButton: lernzieleSection.querySelector('.lernziel-hinzufuegen-btn')
    };

    if (!dom.container || !dom.list || !dom.addButton) {
        console.error('Kritische Elemente für die Lernziel-Funktionalität fehlen.');
        return;
    }

    dom.addButton.addEventListener('click', () => {
        handleAddLernziel(dom.list);
    });
    dom.container.addEventListener('click', handleLernzieleClick);
}

function initTableLogic(tableElement) {
    const dom = {
        tableBody: tableElement.querySelector('tbody'),
        addPhaseButton: document.querySelector('.phase-hinzufuegen-btn')
    };

    if (!dom.tableBody || !dom.addPhaseButton) {
        console.error('Kritische Elemente für die Tabellen-Funktionalität fehlen.');
        return;
    }

    dom.addPhaseButton.addEventListener('click', () => {
        handleAddPhase(dom.tableBody);
        if (window.appAPI && window.appAPI.updateAllTimeCalculations) {
                window.appAPI.updateAllTimeCalculations();
            }
    });
    dom.tableBody.addEventListener('click', handleTableClick);


    new Sortable(dom.tableBody, {
        animation: 150,
        swapThreshold: 0.2,
        handle: '.drag-handle',
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',

        multiDrag: true, 
        selectedClass: 'selected-phases',
        fallbackTolerance: 3, 


        forceFallback: true, 
        onChoose: function(e) {
            e.target.classList.add('grabbing');
        },
        onUnchoose: function(e) {
            e.target.classList.remove('grabbing');
        },
        onStart: function(e) {
            e.target.classList.add('grabbing');
        },
        onEnd: function(e) {
            e.target.classList.remove('grabbing');
            if (window.appAPI && window.appAPI.updateAllTimeCalculations) {
                window.appAPI.updateAllTimeCalculations();
            }
        },
        onMove: function(e) {
            e.target.classList.add('grabbing');
        },
        
    });
}

function initTimeLogic(editorElement) {
    const dom = {
        startTimeInput: editorElement.querySelector('#start-time-input'),
        totalDurationInput: editorElement.querySelector('#gesamtdauer-input'),
        remainingTimeOutput: editorElement.querySelector('#restzeit-output'),
        tableBody: editorElement.querySelector('.plan-table tbody')
    };

    if (!dom.startTimeInput || !dom.tableBody || !dom.totalDurationInput || !dom.remainingTimeOutput) {
        console.error('Kritische Elemente für die Zeit-Funktionalität fehlen.');
        return;
    }

    const triggerTimeUpdate = () => updateAllTimeCalculations(dom);

    dom.tableBody.addEventListener('input', (event) => {
        if (event.target.matches('.dauer-input')) {
            triggerTimeUpdate();
        }
    });

    dom.startTimeInput.addEventListener('input', triggerTimeUpdate);
    dom.totalDurationInput.addEventListener('input', triggerTimeUpdate);

    window.appAPI = window.appAPI || {};
    window.appAPI.updateAllTimeCalculations = triggerTimeUpdate;
    
    triggerTimeUpdate();
}

function updateAllTimeCalculations(dom) {
    const startTimeString = dom.startTimeInput.value;
    if (!startTimeString) return;

    const totalPhasesDuration = calculateAndDisplayRowTimes(startTimeString, dom.tableBody.querySelectorAll('tr'));
    updateRemainingTime(dom.totalDurationInput, dom.remainingTimeOutput, totalPhasesDuration);
}


function calculateAndDisplayRowTimes(startTimeString, phasen) {
    let [hours, minutes] = startTimeString.split(':').map(Number)

    if (isNaN(hours) || isNaN(minutes)) {
            console.error("Deine Startzeit für den Unterrichts ist ungültig");
            return;
    }

    let currentTimeMin = hours * 60 + minutes;
    let totalPhasesDurationMin = 0;

    phasen.forEach(row => {
        const phaseHours = Math.floor(currentTimeMin / 60) % 24
        const phaseMin = currentTimeMin % 60;
        const phaseFormattedTime = `${String(phaseHours).padStart(2, '0')}:${String(phaseMin).padStart(2, '0')}`;

        const clockCell = row.querySelector('.clock-cell');
        if (clockCell) {
            clockCell.textContent = phaseFormattedTime;
        }

        const phaseDurationInput = row.querySelector('.dauer-input');
        const phaseDuration = parseInt(phaseDurationInput.value, 10) || 0;

        currentTimeMin += phaseDuration;
        totalPhasesDurationMin += phaseDuration;
    });
    return totalPhasesDurationMin;
};  

function updateRemainingTime(totalDurationInput, remainingTimeOutput, totalPhasesDuration) {
    const totalLessonDuration = parseInt(totalDurationInput.value, 10) || 0;
    const remainingTime = totalLessonDuration - totalPhasesDuration;
    remainingTimeOutput.textContent = remainingTime;
}

const createNewLernzielItem = () => {
    const li = document.createElement('li');
    li.innerHTML = `
            <span contenteditable="true" role="textbox" class="lernziel-text"> </span>
            <button type="button" class="action-btn lernziel-loeschen-btn danger-btn" title="Lernziel löschen">
                <i data-lucide="trash-2"></i>
            </button>
        `;
    return li;
};

const handleAddLernziel = (lernziele_list) => {
    const newItem = createNewLernzielItem();
    lernziele_list.appendChild(newItem);

    if (window.lucide) {
        window.lucide.createIcons();
    }
};

const handleLernzieleClick = (event) => {
    const deleteButton = event.target.closest('.lernziel-loeschen-btn');
    if (!deleteButton) {
        return;
    }

    const itemToDelete = deleteButton.closest('li');
    if (itemToDelete) {
        itemToDelete.remove();
    }
};

const handleAddPhase = (tableBody) => {
    const newRow = createNewPhaseRow();
    tableBody.appendChild(newRow);
    if (window.lucide) {
        window.lucide.createIcons();
    }
};

const createNewPhaseRow = () => {
    const row = document.createElement('tr');
    row.innerHTML = `
            <td class="col-drag drag-handle-cell">
                <button type="button" class="action-btn drag-handle" title="Zeile verschieben">
                    <i data-lucide="grip-vertical" draggable="false"></i>
                </button>
            </td>
            <td class="col-uhr clock-cell"></td>
            <td class="col-dauer">
                <input type="number" placeholder="0" class="cell-input dauer-input" min="0">
            </td>
            <td class="col-phase">
                <input type="text" placeholder="Phase wählen" class="cell-input phase-input">
            </td>
            <td class="col-handlung">
                <div contenteditable="true" role="textbox" aria-multiline="true" class="cell-input handlung-textarea" data-placeholder="Handlung beschreiben..."></div>
            </td>
            <td class="col-methode">
                <input type="text" list="methoden-liste" placeholder="Methode wählen" class="cell-input methode-input">
            </td>
            <td class="col-mittel">
                <input type="text" list="mittel-liste" placeholder="Mittel wählen" class="cell-input mittel-input">
            </td>
            <td class="col-bemerkung">
                <div contenteditable="true" role="textbox" aria-multiline="true" class="cell-input bemerkung-textarea" data-placeholder="Bemerkung..."></div>
            </td>
            <td class="col-delete delete-cell">
                <button type="button" class="action-btn zeile-loeschen-btn danger-btn" title="Zeile löschen">
                    <i data-lucide="trash-2"></i>
                </button>
            </td>
        `;
    return row;
};

const handleTableClick = (event) => {
    const deleteButton = event.target.closest('.zeile-loeschen-btn');
    if (!deleteButton) {
        return;
    }

    const rowToDelete = deleteButton.closest('tr');
    if (rowToDelete) {
        rowToDelete.remove();
    }
};
