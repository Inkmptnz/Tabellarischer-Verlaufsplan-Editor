<script setup>

    import { ref, computed, watchEffect } from 'vue'


    import PlanHeader from './components/PlanHeader.vue'
    import LernzieleSection from './components/LernzieleSection.vue'
    import ActionBar from './components/ActionBar.vue'
    import PlanTabelle from './components/PlanTabelle.vue'


    const schulname = ref('')
    const datum = ref(new Date().toISOString().slice(0, 10))
    const startzeit = ref('11:45')
    const lehrername = ref('')

    const stundenthema = ref('')
    const lernziele = ref([])
    const gesamtdauer = ref(45)

    const phasen = ref([])

    const planTabelleKey = ref(0);
    const savedState = localStorage.getItem('planer-app-state')

    if (savedState) {
        try {
            const parsedState = JSON.parse(savedState);
            schulname.value = parsedState.schulname || '';
            datum.value = parsedState.datum || new Date().toISOString().slice(0, 10);
            startzeit.value = parsedState.startzeit || '11:45';
            lehrername.value = parsedState.lehrername || '';
            stundenthema.value = parsedState.stundenthema || '';
            lernziele.value = parsedState.lernziele || [];
            gesamtdauer.value = parsedState.gesamtdauer || 45;
            phasen.value = parsedState.phasen || [];
            planTabelleKey.value += 1;
        } catch (e) {
            console.error("Fehler beim Parsen des gespeicherten Zustands:", e);
        }
    }

    watchEffect(() => {
        const appState = {
            schulname: schulname.value,
            datum: datum.value,
            startzeit: startzeit.value,
            lehrername: lehrername.value,
            stundenthema: stundenthema.value,
            lernziele: lernziele.value,
            gesamtdauer: gesamtdauer.value,
            phasen: phasen.value
        };
        localStorage.setItem('planer-app-state', JSON.stringify(appState));
    });

    const verbleibendeZeit = computed(() => {
        const genutzteDauer = phasen.value.reduce((summe, phase) => summe + (phase.dauer || 0), 0)
        return gesamtdauer.value - genutzteDauer
    })

    const phasenMitUhrzeit = computed(() => {
        let [stunden, minuten] = startzeit.value.split(':').map(Number)
        if (isNaN(stunden) || isNaN(minuten)) return phasen.value.map(p => ({ ...p, uhrzeit: '??:??' }))
        let aktuelleMinutenGesamt = stunden * 60 + minuten
        return phasen.value.map(phase => {
            const aktuelleStunde = Math.floor(aktuelleMinutenGesamt / 60) % 24
            const aktuelleMinute = aktuelleMinutenGesamt % 60
            const formatierteUhrzeit = `${String(aktuelleStunde).padStart(2, '0')}:${String(aktuelleMinute).padStart(2, '0')}`
            aktuelleMinutenGesamt += phase.dauer || 0
            return { ...phase, uhrzeit: formatierteUhrzeit }
        })
    })

    let nextPhaseId = phasen.value.length ? Math.max(...phasen.value.map(p => p.id)) + 1 : 1;
    let nextLernzielId = lernziele.value.length ? Math.max(...lernziele.value.map(l => l.id)) + 1 : 1;

    function addPhase() {
        phasen.value.push({ id: nextPhaseId++, dauer: 0, phase: '', handlung: '', methode: '', mittel: '', bemerkung: '' })
    }
    function deletePhase(phaseId) {
        phasen.value = phasen.value.filter(p => p.id !== phaseId)
    }
    function sortPhasen({ oldIndex, newIndex }) {
        const [movedItem] = phasen.value.splice(oldIndex, 1)
        phasen.value.splice(newIndex, 0, movedItem)
    }

    function addLernziel() {
        lernziele.value.push({ id: nextLernzielId++, text: '' })
    }
    
    function deleteLernziel(lernzielId) {
        lernziele.value = lernziele.value.filter(l => l.id !== lernzielId)
    }

    function updateLernzielText({ id, text }) {
        const lernziel = lernziele.value.find(l => l.id === id);
        if (lernziel) {
            lernziel.text = text;
        }
    }
    </script>

<template>
    <main class="plan-editor">
        <PlanHeader
        v-model:schulname="schulname"
        v-model:datum="datum"
        v-model:startzeit="startzeit"
        v-model:lehrername="lehrername"
        />

        <LernzieleSection
        :lernziele="lernziele"
        :stundenthema="stundenthema"
        @update:stundenthema="stundenthema = $event"
        @add-lernziel="addLernziel"
        @delete-lernziel="deleteLernziel"
        @update-lernziel-text="updateLernzielText"
        />

        <ActionBar
        :verbleibende-zeit="verbleibendeZeit"
        v-model:gesamtdauer="gesamtdauer"
        @add-phase="addPhase"
        />

        <PlanTabelle
        :key="planTabelleKey"
        :phasen="phasen"
        :phasen-mit-uhrzeit="phasenMitUhrzeit"
        @delete-phase="deletePhase"
        @sort-phasen="sortPhasen"
        />
    </main>

    <datalist id="dauer-presets">
        <option value="45"></option>
        <option value="90"></option>
    </datalist>

    <datalist id="methoden-liste">
        <option value="Lehrervortrag"></option>
        <option value="Stillarbeit"></option>
        <option value="Partnerarbeit"></option>
        <option value="Gruppenarbeit"></option>
        <option value="Experiment"></option>
        <option value="Präsentation"></option>
    </datalist>

    <datalist id="mittel-liste">
        <option value="Arbeitsblatt"></option>
        <option value="Präsentation"></option>
        <option value="Beamer"></option>
        <option value="Smartphone"></option>
        <option value="Plickerskarten"></option>
        <option value="Tafel"></option>
    </datalist>

</template>

<style>
    :root {
        --bg-color: #121212;
        --surface-color: #1e1e1e;
        --accent-color: #3b82f6;
        --text-primary: #e0e0e0;
        --text-secondary: #888888;
        --border-color: #333333;
        --danger-color: #ef4444;
        --accent-color-hover: #2a2a2a; 
    }

    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    input[type="number"] {
        -moz-appearance: textfield;
        appearance: textfield;
    }

    *,
    *::before,
    *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        background-color: var(--bg-color);
        color: var(--text-primary);
        line-height: 1.5;
    }

    .plan-editor {
        max-width: 100%;
        margin: 2rem auto;
        padding: 2rem;
    }

    input[type="text"]:not(.thema-input),
    input[type="date"],
    input[type="time"],
    input[type="number"],
    textarea {
        background-color: var(--surface-color);
        color: var(--text-primary);
        border: 2px solid var(--border-color);
        border-radius: 4px;
        padding: 0.5rem 0.75rem;
        font-family: inherit;
        font-size: 1rem;
        transition: border-color 0.2s ease-in-out;
    }

    input:focus,
    textarea:focus,
    input[type="text"]:focus,
    input:hover,
    input[type="text"]:hover {
        outline: none;
        border-color: var(--accent-color);
    }

    input:focus::placeholder {
    color: transparent;
    }

    textarea {
        resize: vertical;
        min-height: 60px;
    }
    .topic-container {
        text-align: center;
        margin-bottom: 1.5rem;
    }

    .thema-input {
        display: inline-block;
        width: fit-content;
        min-width: 25%;
        max-width: 50%;
        font-size: 1.5rem;
        font-weight: 600;
        text-align: center;
        background-color: var(--surface-color);
        border: 1px solid transparent;
        border-radius: 6px;
        padding: 0.75rem;
    }

    .thema-input:hover {
        background-color: var(--surface-color);
        outline: 2px solid var(--accent-color);
    }

    .thema-input:focus {
        outline: 2px solid var(--accent-color);
        background-color: var(--surface-color);
    }
    .action-btn {
        background-color: transparent;
        color: var(--text-primary);
        border: 1px solid transparent;
        border-radius: 50px;
        padding: 0.5rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
    }

    .action-btn:hover {
        background-color: #2e2e2e;
        border-color: var(--accent-color-hover);
    }
    .primary-action {
        background-color: var(--accent-color);
        border-color: var(--accent-color);
        color: white;
    }

    .primary-action:hover {
        background-color: #2563eb;
    }
    span[contenteditable="true"] {
        width: 100%;
        background-color: var(--surface-color);
        border: 2px solid var(--border-color);
        border-radius: 5px;
        padding: 0.25rem;
        margin: -0.25rem;  
    }

    span[contenteditable="true"]:focus {

        background-color: var(--bg-color);

        border-color: var(--accent-color);
        outline: none;
    }

    .lucide {
        width: 23px;
        height: 23px;
        stroke-width: 2;
    }
</style>