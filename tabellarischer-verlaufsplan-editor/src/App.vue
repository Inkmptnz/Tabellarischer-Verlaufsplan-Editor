<script setup>
import { ref, computed, onMounted} from 'vue'
import { Plus, Save, Printer, GripVertical, Trash2 } from 'lucide-vue-next'
import Sortable from 'sortablejs'

const schulname = ref('Name der Schule')
const datum = ref(new Date().toISOString().slice(0, 10))
const startzeit = ref('11:45')
const lehrername = ref('Name des Lehrers')


const stundenthema = ref('Stundenthema hier eingeben')
const lernziele = ref([
  { id: 1, text: 'Erstes Lernziel' },
  { id: 2, text: 'Zweites Lernziel' }
])


const gesamtdauer = ref(45)


const phasen = ref([
  {
    id: 1,
    dauer: 10,
    phase: 'Einstieg',
    handlung: 'Begrüßung und Vorstellung des Themas.',
    methode: 'Lehrervortrag',
    mittel: 'Tafel',
    bemerkung: 'Auf Vorwissen der SuS eingehen.'
  },
  {
    id: 2,
    dauer: 20,
    phase: 'Erarbeitung',
    handlung: 'Schüler bearbeiten Arbeitsblatt in Stillarbeit.',
    methode: 'Stillarbeit',
    mittel: 'Arbeitsblatt',
    bemerkung: ''
  }
])

// ----- FUNKTIONEN -----


let nextPhaseId = 3;
let nextLernzielId = 3;

function addPhase() {
  phasen.value.push({
    id: nextPhaseId++,
    dauer: 0,
    phase: '',
    handlung: '',
    methode: '',
    mittel: '',
    bemerkung: ''
  })
}

function deletePhase(phaseId) {
  phasen.value = phasen.value.filter(p => p.id !== phaseId)
}

function addLernziel() {
  lernziele.value.push({
    id: nextLernzielId++,
    text: ''
  });
}

function deleteLernziel(lernzielId) {
  lernziele.value = lernziele.value.filter(l => l.id !== lernzielId);
}


// ----- COMPUTED PROPERTIES -----

const verbleibendeZeit = computed(() => {
  const genutzteDauer = phasen.value.reduce((summe, phase) => summe + (phase.dauer || 0), 0);
  return gesamtdauer.value - genutzteDauer;
});

const phasenMitUhrzeit = computed(() => {
  
  let [stunden, minuten] = startzeit.value.split(':').map(Number);
  if (isNaN(stunden) || isNaN(minuten)) {
    return phasen.value.map(phase => ({ ...phase, uhrzeit: '??:??' }));
  }

  let aktuelleMinutenGesamt = stunden * 60 + minuten;

  return phasen.value.map(phase => {
    const aktuelleStunde = Math.floor(aktuelleMinutenGesamt / 60) % 24;
    const aktuelleMinute = aktuelleMinutenGesamt % 60;
    const formatierteUhrzeit = `${String(aktuelleStunde).padStart(2, '0')}:${String(aktuelleMinute).padStart(2, '0')}`;
    aktuelleMinutenGesamt += phase.dauer || 0;

    return {
      ...phase, // behalte alle originalen Phasen-Daten
      uhrzeit: formatierteUhrzeit // füge die berechnete Uhrzeit hinzu
    };
  });
});

const tableBodyRef = ref(null);

// ----- LIFECYCLE HOOKS -----
onMounted(() => {
  if (tableBodyRef.value) {
    new Sortable(tableBodyRef.value, {
      animation: 150,
      handle: '.drag-handle', // Definiert den Bereich, an dem gezogen werden kann
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      onEnd: (event) => {
        const { oldIndex, newIndex } = event;

        const [movedItem] = phasen.value.splice(oldIndex, 1);
        
        phasen.value.splice(newIndex, 0, movedItem);
      }
    });
  }
});

</script>

<template>
  <main class="plan-editor">

    <!-- Header-Inputs mit v-model an den Zustand binden -->
    <header class="plan-header">
      <input type="text" class="header-input" placeholder="Schulname" v-model="schulname">
      <input type="date" class="header-input" v-model="datum">
      <input type="time" id="start-time-input" class="header-input" v-model="startzeit">
      <input type="text" class="header-input" placeholder="Lehrername" v-model="lehrername">
    </header>

    <section class="lernziele-section">
      <div class="topic-container">
        <h1 class="thema-input" contenteditable="true" v-text="stundenthema" @input="stundenthema = $event.target.innerText"></h1>
      </div>

      <div class="lernziele-container">
        <h2>Lernziele:</h2>
        <ul>
          <li v-for="lernziel in lernziele" :key="lernziel.id">
            <span contenteditable="true" role="textbox" class="lernziel-text"
            	@input="lernziel.text = $event.target.innerText"
            	@vue:mounted="({ el }) => el.innerText = lernziel.text">
            </span>
    		<button type="button" @click="deleteLernziel(lernziel.id)" class="action-btn lernziel-loeschen-btn danger-btn" title="Lernziel löschen">
    			<Trash2 />
  			</button>
			</li>
        </ul>
        <button type="button" @click="addLernziel" class="action-btn lernziel-hinzufuegen-btn">
          <Plus />
          <span class="lernziel-hinzufuegen-span">Neues Lernziel</span>
        </button>
      </div>
    </section>

    <div class="action-bar">
      <div class="main-actions">
        <!-- Button klickt, ruft die addPhase Funktion auf -->
        <button type="button" @click="addPhase" class="action-btn phase-hinzufuegen-btn primary-action">
          <Plus  />
          <span>Neue Phase</span>
        </button>
        <button type="button" class="action-btn save-btn">
          <Save  />
          <span>Speichern</span>
        </button>
        <button type="button" class="action-btn print-btn">
          <Printer  />
          <span>Drucken</span>
        </button>
      </div>
      <div class="time-controls">
        <div class="input-group">
          <label for="gesamtdauer-input">Dauer:</label>
          <input type="number" id="gesamtdauer-input" class="gesamtdauer-input" min="1" v-model="gesamtdauer">
          <span>Min</span>
        </div>
        <div class="time-summary">
          Verbleibend: <span id="restzeit-output">{{ verbleibendeZeit }}</span> Min
        </div>
      </div>
    </div>

    <table class="plan-table">
      <thead>
        <tr>
          <th class="col-drag"></th>
          <th class="col-uhr">Uhr</th>
          <th class="col-dauer">Zeit</th>
          <th class="col-phase">Phase</th>
          <th class="col-handlung">Handlung</th>
          <th class="col-methode">Methode</th>
          <th class="col-mittel">Mittel</th>
          <th class="col-bemerkung">Bemerkung</th>
          <th class="col-delete"></th>
        </tr>
      </thead>
      <tbody ref="tableBodyRef">
        <tr v-for="(phase, index) in phasen" :key="phase.id">
          <td class="col-drag drag-handle-cell">
            <button type="button" class="action-btn drag-handle" title="Zeile verschieben">
              <GripVertical />
            </button>
          </td>

          <td class="col-uhr clock-cell">{{ phasenMitUhrzeit[index].uhrzeit }}</td>
          
          <td class="col-dauer">
            <input type="number" class="cell-input dauer-input" min="0" v-model.number="phase.dauer">
          </td>
          <td class="col-phase">
            <input type="text" placeholder="Phase wählen" class="cell-input phase-input" v-model="phase.phase">
          </td>
          <td class="col-handlung">
            <textarea class="cell-input handlung-textarea" placeholder="Handlung beschreiben..." v-model="phase.handlung"></textarea>
          </td>
          <td class="col-methode">
            <input type="text" list="methoden-liste" placeholder="Methode wählen" class="cell-input methode-input" v-model="phase.methode">
          </td>
          <td class="col-mittel">
            <input type="text" list="mittel-liste" placeholder="Mittel wählen" class="cell-input mittel-input" v-model="phase.mittel">
          </td>
          <td class="col-bemerkung">
            <textarea class="cell-input bemerkung-textarea" placeholder="Bemerkung..." v-model="phase.bemerkung"></textarea>
          </td>
          <td class="col-delete delete-cell">
            <button type="button" @click="deletePhase(phase.id)" class="action-btn zeile-loeschen-btn danger-btn" title="Zeile löschen">
              <Trash2 />
            </button>
          </td>
        </tr>
        <!-- ENDE DER KORREKTUR -->
      </tbody>
    </table>
    <!-- Datalists bleiben unverändert, da sie statisch sind -->
    <datalist id="dauer-presets">...</datalist>
    <datalist id="methoden-liste">...</datalist>
    <datalist id="mittel-liste">...</datalist>
  </main>
</template>