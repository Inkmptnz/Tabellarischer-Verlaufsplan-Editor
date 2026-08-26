import { ref, computed } from 'vue'
import { sanitizeFilename } from './useFileHandler.js'

const CUSTOM_PRESETS_KEY = 'planer-custom-presets'

const presetModules = import.meta.glob('../presets/*.json', { eager: true })

const eingebautePresets = []
for (const dateiname in presetModules) {
  const name = getPresetName(dateiname)
  const columns = getColumns(presetModules[dateiname])
  eingebautePresets.push({ name, columns })
}

const eigenePresets = ref(ladeEigenePresets())

// Eingebaute und importierte Presets werden zu einer Liste zusammengeführt.
// Ein eigenes Preset mit demselben Namen wie ein eingebautes ersetzt dieses
// in der Liste (erneuter Import aktualisiert also ein vorhandenes Preset).
const presets = computed(() => {
  const eigeneNamen = new Set(eigenePresets.value.map((preset) => preset.name))
  return [
    ...eingebautePresets.filter((preset) => !eigeneNamen.has(preset.name)),
    ...eigenePresets.value,
  ]
})

function getPresetName(fileName) {
  const split = fileName.split('/')
  const nameWithExtension = split[split.length - 1]
  const name = nameWithExtension.slice(0, -5)
  return name
}

function getColumns(json) {
  return json.default
}

function ladeEigenePresets() {
  const gespeichert = localStorage.getItem(CUSTOM_PRESETS_KEY)
  if (!gespeichert) return []
  try {
    const geparst = JSON.parse(gespeichert)
    return Array.isArray(geparst) ? geparst : []
  } catch {
    return []
  }
}

function speichereEigenePresets() {
  localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(eigenePresets.value))
}

function istGueltigesPresetFormat(columns) {
  return (
    Array.isArray(columns) &&
    columns.length > 0 &&
    columns.every((spalte) => typeof spalte?.id === 'string' && typeof spalte?.label === 'string')
  )
}

// Preset-JSON-Dateien haben exakt dasselbe Format wie src/presets/*.json:
// ein Array aus { id, label, width, type, options }. Jede eingebaute
// Preset-Datei lässt sich also 1:1 als eigenes Preset importieren.
function importPreset(columns, dateiname) {
  if (!istGueltigesPresetFormat(columns)) {
    throw new Error('Ungültiges Preset-Format: erwartet ein Array aus Spalten mit id und label.')
  }

  const name = sanitizeFilename(dateiname.replace(/\.json$/i, ''), 'Eigenes Preset')
  const spalten = columns.map((spalte) => ({
    id: spalte.id,
    label: spalte.label,
    width: typeof spalte.width === 'number' ? spalte.width : 20,
    type: spalte.type === 'textarea' || spalte.type === 'datalist' ? spalte.type : 'text',
    ...(spalte.type === 'datalist' ? { options: Array.isArray(spalte.options) ? spalte.options : [] } : {}),
  }))

  const neuesPreset = { name, columns: spalten }
  const index = eigenePresets.value.findIndex((preset) => preset.name === name)
  if (index === -1) {
    eigenePresets.value.push(neuesPreset)
  } else {
    eigenePresets.value[index] = neuesPreset
  }
  speichereEigenePresets()

  return neuesPreset
}

export function usePresets() {
  return { presets, importPreset }
}
