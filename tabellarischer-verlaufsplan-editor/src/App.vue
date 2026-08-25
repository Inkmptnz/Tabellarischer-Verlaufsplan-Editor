<script setup>
import { ref, computed, watchEffect } from 'vue'

import { usePdfExport } from './utils/usePdfExport.js'
import { useFileHandler } from './utils/useFileHandler.js'
import { usePresets } from './utils/usePresets.js'
import PlanHeader from './components/PlanHeader.vue'
import LernzieleSection from './components/LernzieleSection.vue'
import ActionBar from './components/ActionBar.vue'
import PlanTabelle from './components/PlanTabelle.vue'

const { generatePdf } = usePdfExport()
const { exportDataAsJson, importDataFromJson, sanitizeFilename } = useFileHandler()

const schulname = ref('')
const datum = ref(new Date().toISOString().slice(0, 10))
const startzeit = ref('08:00')
const lehrername = ref('')

const stundenthema = ref('')
const lernziele = ref([])
const gesamtdauer = ref(45)


const { presets } = usePresets()
const aktivesPresetName = ref(presets[0].name)
const aktivesPreset = computed(
  () => presets.find((preset) => preset.name === aktivesPresetName.value) || presets[0],
)

const phasen = ref([])

const deletedStack = ref([])

loadState()

watchEffect(() => {
  saveState()
})

function loadState() {
  const savedState = localStorage.getItem('planer-app-state')
  if (savedState) {
    try {
      const parsedState = JSON.parse(savedState)
      schulname.value = parsedState.schulname || ''
      datum.value = parsedState.datum || new Date().toISOString().slice(0, 10)
      startzeit.value = parsedState.startzeit || '08:00'
      lehrername.value = parsedState.lehrername || ''
      stundenthema.value = parsedState.stundenthema || ''
      lernziele.value = parsedState.lernziele || []
      gesamtdauer.value = parsedState.gesamtdauer || 45
      phasen.value = parsedState.phasen || []
      if (presets.some((preset) => preset.name === parsedState.aktivesPresetName)) {
        aktivesPresetName.value = parsedState.aktivesPresetName
      }
    } catch (e) {
      console.error('Fehler beim Parsen des gespeicherten Zustands:', e)
    }
  }
}

function saveState() {
  const appState = {
    schulname: schulname.value,
    datum: datum.value,
    startzeit: startzeit.value,
    lehrername: lehrername.value,
    stundenthema: stundenthema.value,
    lernziele: lernziele.value,
    gesamtdauer: gesamtdauer.value,
    phasen: phasen.value,
    aktivesPresetName: aktivesPresetName.value,
  }
  localStorage.setItem('planer-app-state', JSON.stringify(appState))
}

const verbleibendeZeit = computed(() => {
  const genutzteDauer = phasen.value.reduce((summe, phase) => summe + (phase.dauer || 0), 0)
  return gesamtdauer.value - genutzteDauer
})

const phasenMitUhrzeit = computed(() => {
  let [stunden, minuten] = startzeit.value.split(':').map(Number)
  if (isNaN(stunden) || isNaN(minuten)) return phasen.value.map((p) => ({ ...p, uhrzeit: '??:??' }))
  let aktuelleMinutenGesamt = stunden * 60 + minuten
  return phasen.value.map((phase) => {
    const aktuelleStunde = Math.floor(aktuelleMinutenGesamt / 60) % 24
    const aktuelleMinute = aktuelleMinutenGesamt % 60
    const formatierteUhrzeit = `${String(aktuelleStunde).padStart(2, '0')}:${String(aktuelleMinute).padStart(2, '0')}`
    aktuelleMinutenGesamt += phase.dauer || 0
    return { ...phase, uhrzeit: formatierteUhrzeit }
  })
})

function nextId(array) {
  return array.length ? Math.max(...array.map((item) => item.id)) + 1 : 1
}

function addPhase() {
  const neuePhase = {}
  neuePhase.id = nextId(phasen.value)
  neuePhase.dauer = 0

  for (const column of aktivesPreset.value.columns) {
    neuePhase[column.id] = ''
  }
  phasen.value.push(neuePhase)
}

function deletePhase(phaseId) {
  const index = phasen.value.findIndex((p) => p.id === phaseId)
  if (index === -1) return
  const [item] = phasen.value.splice(index, 1)
  rememberDeleted('phase', item, index)
}
function sortPhasen({ oldIndex, newIndex }) {
  const [movedItem] = phasen.value.splice(oldIndex, 1)
  phasen.value.splice(newIndex, 0, movedItem)
}

function addLernziel() {
  lernziele.value.push({ id: nextId(lernziele.value), text: '' })
}

function deleteLernziel(lernzielId) {
  const index = lernziele.value.findIndex((l) => l.id === lernzielId)
  if (index === -1) return
  const [item] = lernziele.value.splice(index, 1)
  rememberDeleted('lernziel', item, index)
}

function rememberDeleted(type, item, index) {
  deletedStack.value.push({ type, item, index })
}

function undoDelete() {
  const last = deletedStack.value.pop()
  if (!last) return
  const { type, item, index } = last
  const target = type === 'phase' ? phasen.value : lernziele.value
  target.splice(index, 0, item)
}

function resetAllData() {
  localStorage.removeItem('planer-app-state')
  location.reload()
}

function handlePdfExport() {
  const exportData = {
    schulname: schulname.value,
    lehrername: lehrername.value,
    datum: datum.value,
    stundenthema: stundenthema.value,
    phasenMitUhrzeit: phasenMitUhrzeit.value,
    lernziele: lernziele.value,
    spalten: aktivesPreset.value.columns,
  }

  generatePdf(exportData)
}

function handleExportToJson() {
  const appState = {
    schulname: schulname.value,
    datum: datum.value,
    startzeit: startzeit.value,
    lehrername: lehrername.value,
    stundenthema: stundenthema.value,
    lernziele: lernziele.value,
    gesamtdauer: gesamtdauer.value,
    phasen: phasen.value,
    aktivesPresetName: aktivesPresetName.value,
  }
  exportDataAsJson(appState, `${sanitizeFilename('verlaufsplan_' + stundenthema.value)}.json`)
}

async function handleImportFromJson() {
  try {
    const importedData = await importDataFromJson()

    if (importedData) {
      schulname.value = importedData.schulname || ''
      datum.value = importedData.datum || new Date().toISOString().slice(0, 10)
      startzeit.value = importedData.startzeit || '08:00'
      lehrername.value = importedData.lehrername || ''
      stundenthema.value = importedData.stundenthema || ''
      lernziele.value = importedData.lernziele || []
      gesamtdauer.value = importedData.gesamtdauer || 45
      phasen.value = importedData.phasen || []
      if (presets.some((preset) => preset.name === importedData.aktivesPresetName)) {
        aktivesPresetName.value = importedData.aktivesPresetName
      }
    }
  } catch (error) {
    console.error('Fehler beim Importieren der Daten:', error)
    alert(
      'Fehler beim Importieren der Datei. Bitte stellen Sie sicher, dass es eine valide JSON-Datei ist.',
    )
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
    />

    <ActionBar
      :verbleibende-zeit="verbleibendeZeit"
      :can-undo="deletedStack.length > 0"
      :presets="presets"
      v-model:gesamtdauer="gesamtdauer"
      v-model:aktives-preset-name="aktivesPresetName"
      @add-phase="addPhase"
      @undo="undoDelete"
      @export-json="handleExportToJson"
      @import-json="handleImportFromJson"
      @export-pdf="handlePdfExport"
      @reset-all-data="resetAllData"
    />

    <PlanTabelle
      :phasen="phasen"
      :phasen-mit-uhrzeit="phasenMitUhrzeit"
      :spalten="aktivesPreset.columns"
      @delete-phase="deletePhase"
      @sort-phasen="sortPhasen"
    />
  </main>
</template>
