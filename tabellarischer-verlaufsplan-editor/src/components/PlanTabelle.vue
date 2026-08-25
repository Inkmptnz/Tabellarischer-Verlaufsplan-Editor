<script setup>
import { ref, computed, watchEffect } from 'vue'
import Sortable from 'sortablejs'
import { GripVertical, Trash2 } from 'lucide-vue-next'

const props = defineProps({
  phasen: Array,
  phasenMitUhrzeit: Array,
  spalten: Array,
})
const emit = defineEmits(['delete-phase', 'sort-phasen'])

const tableBodyRef = ref(null)

// Drag + Uhr + Dauer + Delete sind fest codierte Spalten außerhalb der Presets
const FESTE_SPALTEN_BREITE = 4 + 7 + 6 + 4
const VERFUEGBARE_BREITE = 100 - FESTE_SPALTEN_BREITE

// Preset-Breiten sind relative Gewichte, keine absoluten Prozentwerte —
// werden hier immer auf die tatsächlich verfügbare Breite normiert, damit
// ein Preset mit falscher Summe das Tabellen-Layout nicht sprengt.
const spaltenMitBreite = computed(() => {
  const gesamtGewicht = props.spalten.reduce((summe, spalte) => summe + spalte.width, 0)
  return props.spalten.map((spalte) => ({
    ...spalte,
    breite: gesamtGewicht > 0 ? (spalte.width / gesamtGewicht) * VERFUEGBARE_BREITE : 0,
  }))
})

function setDauer(phase, rawValue) {
  const digits = rawValue.replace(/\D/g, '')
  phase.dauer = digits === '' ? 0 : Number(digits)
}

watchEffect(() => {
  if (tableBodyRef.value && !tableBodyRef.value.sortable) {
    new Sortable(tableBodyRef.value, {
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      forceFallback: true,
      fallbackOnBody: true,
      fallbackTolerance: 3,
      onStart: function (e) {
        e.target.classList.add('grabbing')
      },
      onEnd: (event) => {
        event.target.classList.remove('grabbing')
        emit('sort-phasen', {
          oldIndex: event.oldIndex,
          newIndex: event.newIndex,
        })
      },
    })
    tableBodyRef.value.sortable = true
  }
})
</script>

<template>
  <table class="plan-table">
    <thead>
      <tr>
        <th class="col-drag"></th>
        <th class="col-uhr">Uhr</th>
        <th class="col-dauer">Zeit</th>
        <th v-for="spalte in spaltenMitBreite" :key="spalte.id" :style="{ width: spalte.breite + '%' }">
          {{ spalte.label }}
        </th>
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
        <td class="col-uhr clock-cell">{{ phasenMitUhrzeit[index]?.uhrzeit || '??:??' }}</td>
        <td class="col-dauer">
          <input
            type="text"
            inputmode="numeric"
            class="cell-input dauer-input"
            :value="phase.dauer"
            :placeholder="phase.dauer === 0 ? '0' : ''"
            @input="setDauer(phase, $event.target.value)"
            @focus="$event.target.select()"
            @mouseup.prevent
          />
        </td>
        <td v-for="spalte in spalten" :key="spalte.id" :class="{ 'cell-textarea': spalte.type === 'textarea' }">
          <textarea
            v-if="spalte.type === 'textarea'"
            class="cell-input"
            :placeholder="spalte.label + ' ...'"
            v-model="phase[spalte.id]"
          ></textarea>
          <input
            v-else
            type="text"
            class="cell-input"
            :list="spalte.type === 'datalist' ? `${spalte.id}-liste` : null"
            :placeholder="spalte.label + ' ...'"
            v-model="phase[spalte.id]"
          />
        </td>
        <td class="col-delete delete-cell">
          <button
            @click="emit('delete-phase', phase.id)"
            class="action-btn zeile-loeschen-btn danger-btn"
            title="Zeile löschen"
          >
            <Trash2 />
          </button>
        </td>
      </tr>
    </tbody>
  </table>

  <datalist
    v-for="spalte in spalten.filter((s) => s.type === 'datalist')"
    :key="spalte.id"
    :id="`${spalte.id}-liste`"
  >
    <option v-for="option in spalte.options" :key="option" :value="option"></option>
  </datalist>
</template>

<style scoped>
/* ====== TABLE: BASE & LAYOUT ====== */

.plan-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  margin-top: 1rem;
}

.plan-table th {
  position: relative; /* Wichtig für die Positionierung der Resize-Griffe */
  background-color: var(--surface-color);
  padding: 0.75rem 1rem;
  text-align: center;
  font-weight: 500;
  color: var(--text-secondary);
  vertical-align: middle;
  user-select: none; /* Verhindert das Markieren des Header-Textes */
}

.plan-table td {
  padding: 0.5rem 0.25rem;
  vertical-align: middle;
  border-bottom: 1px solid var(--border-color);
}

.plan-table tbody tr:nth-child(even) td {
  background-color: rgba(28, 28, 28, 0.5);
}

/* ====== TABLE: CELL CONTENT & INPUTS ====== */

.plan-table .cell-input {
  width: 100%;
  background-color: var(--surface-color);
  border: 2px solid var(--border-color);
  border-radius: 5px;
  padding: 0.25rem;
  margin: -0.25rem;
}

.plan-table .cell-input:focus {
  background-color: var(--bg-color);
  border-color: var(--accent-color);
  outline: none;
}

.plan-table td.cell-textarea {
  /* Vertikale Ausrichtung für mehrzeilige Inhalte überschreiben */
  vertical-align: top;
  padding: 1em;
}

.plan-table td.cell-textarea .cell-input {
  resize: vertical;
}

.dauer-input {
  text-align: center;
}

/* ====== TABLE: COLUMN SIZING ====== */

.col-drag,
.col-delete {
  width: 4%;
  text-align: center;
}

.col-uhr {
  width: 7%;
  text-align: center;
}

.col-dauer {
  width: 6%;
}

/* ====== TABLE: RESIZE HANDLES ====== */

.resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 5px;
  height: 100%;
  cursor: col-resize;
}

/* ====== TABLE: INTERACTIVITY (DRAG & DROP) ====== */

.drag-handle {
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}

.grabbing * {
  cursor: grabbing !important;
}

.sortable-ghost td {
  background-color: rgba(59, 130, 246, 0.18) !important;
  border-top: 1px dashed var(--accent-color);
  border-bottom: 1px dashed var(--accent-color);
}

.sortable-chosen {
  opacity: 1;
}

.sortable-fallback {
  display: table !important;
  table-layout: fixed;
  background-color: var(--surface-color);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
  border-radius: 6px;
  opacity: 0.95;
  pointer-events: none;
}

.danger-btn:hover {
  color: var(--danger-color);
}
</style>
