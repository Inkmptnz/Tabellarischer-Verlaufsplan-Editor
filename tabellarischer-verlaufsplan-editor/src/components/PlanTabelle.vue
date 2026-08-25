<script setup>
import { ref, watchEffect } from 'vue'
import Sortable from 'sortablejs'
import { GripVertical, Trash2 } from 'lucide-vue-next'

defineProps({
  phasen: Array,
  phasenMitUhrzeit: Array,
  spalten: Array,
})
const emit = defineEmits(['delete-phase', 'sort-phasen'])

const tableBodyRef = ref(null)

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
        <th v-for="spalte in spalten" :key="spalte.id" :style="{ width: spalte.width + '%' }">
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
        <td v-for="spalte in spalten" :key="spalte.id">
          <input
            type="text"
            class="cell-input"
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

.plan-table .cell-input,
.plan-table .handlung-textarea,
.plan-table .bemerkung-textarea {
  width: 100%;
  background-color: var(--surface-color);
  border: 2px solid var(--border-color);
  border-radius: 5px;
  padding: 0.25rem;
  margin: -0.25rem;
}

.plan-table .cell-input:focus,
.plan-table .handlung-textarea:focus,
.plan-table .bemerkung-textarea:focus {
  background-color: var(--bg-color);
  border-color: var(--accent-color);
  outline: none;
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
