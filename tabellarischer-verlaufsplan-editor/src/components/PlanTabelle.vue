<script setup>
    import { ref, onMounted } from 'vue'
    import Sortable from 'sortablejs'
    import { GripVertical, Trash2 } from 'lucide-vue-next'

    const props = defineProps({
    phasen: Array,
    phasenMitUhrzeit: Array
    })
    const emit = defineEmits(['delete-phase', 'sort-phasen'])

    const tableBodyRef = ref(null)
    let sortableInstance = null;

    onMounted(() => {
        if (tableBodyRef.value && !tableBodyRef.value.sortable) {
            new Sortable(tableBodyRef.value, {
            animation: 150,
            handle: '.drag-handle',
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            onChoose: function(e) {
                e.target.classList.add('grabbing');
            },
            onUnchoose: function(e) {
                e.target.classList.remove('grabbing');
            },
            onStart: function(e) {
                e.target.classList.add('grabbing');
            },
            onEnd: (event) => {
                event.target.classList.remove('grabbing');
                emit('sort-phasen', {
                        oldIndex: event.oldIndex,
                        newIndex: event.newIndex,
                    })
                }
            })
            tableBodyRef.value.sortable = true;
        }
    }, { deep: true })
</script>

<template>
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
        <td class="col-uhr clock-cell">{{ phasenMitUhrzeit[index]?.uhrzeit || '??:??' }}</td>
        <td class="col-dauer">
          <input type="number" class="cell-input dauer-input" min="0" v-model.number="phase.dauer" :placeholder="phase.dauer === 0 ? '0' : ''">
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
          <button @click="emit('delete-phase', phase.id)" class="action-btn zeile-loeschen-btn danger-btn" title="Zeile löschen">
            <Trash2 />
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
        .plan-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        margin-top: 1rem;
    }

    .plan-table th {
        background-color: var(--surface-color);
        padding: 0.75rem 1rem;
        text-align: center;
        font-weight: 500;
        color: var(--text-secondary);
        vertical-align: middle;
    }

    .plan-table td {
        padding: 0.5rem 0.25rem;
        vertical-align: middle;
        border-bottom: 1px solid var(--border-color);
    }

    .plan-table tbody tr:nth-child(even) td {
        background-color: rgba(15, 15, 15, 0.5);
    }

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

    .plan-table .bemerkung-textarea:focus {
        background-color: var(--bg-color);

        border-color: var(--accent-color);
        outline: none;
    }

    .plan-table .col-handlung,
    .plan-table .col-bemerkung {
        padding: 1em;
        outline: none;
    }

    .col-drag,
    .col-delete {
        width: 4%;
        text-align: center;
    }

    .drag-handle-cell,
    .delete-cell {
        vertical-align: middle;
    }

    .col-uhr {
        width: 7%;
        text-align: center;
    }

    .col-dauer {
        width: 3%;
    }

    .col-phase {
        width: 15%;
    }

    .dauer-input {
        text-align: center;
    }-table .cell-input:focus,
    .plan-table .handlung-textarea:focus,
    .plan-table .bemerkung-textarea:focus {
        background-color: var(--bg-color);

        border-color: var(--accent-color);
        outline: none;
    }

    .plan-table .col-handlung,
    .plan-table .col-bemerkung {
        padding: 1em;
        outline: none;
    }

    .col-drag,
    .col-delete {
        width: 4%;
        text-align: center;
    }

    .drag-handle-cell,
    .delete-cell {
        vertical-align: middle;
    }

    .col-uhr {
        width: 7%;
        text-align: center;
    }

    .col-dauer {
        width: 6%;
    }

    .col-phase {
        width: 15%;
    }

    .dauer-input {
        text-align: center;
    }
    .col-methode {
        width: 12%;
    }

    .col-mittel {
        width: 12%;
    }

    .col-bemerkung {
        width: 15%;
    }


    .grabbing * {
        cursor: grabbing !important;
    }

    .sortable-chosen,
    sortable-chosen.sortable-ghost {
        opacity: 100%;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .sortable-ghost {
        background-color: var(--accent-color);
        opacity: 0;
    }


    .drag-handle {
        cursor: grab;
    }

    .drag-handle:active {
        cursor: grabbing;
    }

    .selected-phases {
        background-color: var(--accent-color);
    }

    .danger-btn:hover {
        color: var(--danger-color);
    }

</style>