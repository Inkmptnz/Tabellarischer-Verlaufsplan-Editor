<script setup>
    import { Plus, Save, Printer, FolderInput } from 'lucide-vue-next'

    defineProps({
    gesamtdauer: Number,
    verbleibendeZeit: Number
    })

    const emit = defineEmits(['update:gesamtdauer', 'add-phase'])
</script>


<template>
  <div class="action-bar">
    <div class="main-actions">
      <button
        type="button"
        @click="emit('add-phase')"
        class="action-btn phase-hinzufuegen-btn primary-action"
      >
        <Plus />
        <span>Neue Phase</span>
      </button>
      <button type="button" class="action-btn save-btn">
        <Save />
        <span>Speichern</span>
      </button>

      <button type="button" class="action-btn import-btn">
        <FolderInput />
        <span>Importieren</span>
      </button>
      
      <button type="button" class="action-btn print-btn">
        <Printer />
        <span>Drucken</span>
      </button>
    </div>
    <div class="time-controls">
      <div class="input-group">
        <label for="gesamtdauer-input">Dauer:</label>
        <input
          type="number"
          id="gesamtdauer-input"
          class="gesamtdauer-input"
          min="1"
          :value="gesamtdauer"
          @input="emit('update:gesamtdauer', Number($event.target.value))"
        />
        <span>Min</span>
      </div>
      <div class="time-summary">
        Verbleibend: <span id="restzeit-output">{{ verbleibendeZeit }}</span> Min
      </div>
    </div>
  </div>
</template>

<style scoped>
    .action-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 1.5rem;
        margin-bottom: 2rem;
        border-bottom: 1px solid var(--border-color);
    }

    .time-controls,
    .main-actions {
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }

    .action-bar .input-group {
        gap: 0.5rem;
    }

    .action-bar .gesamtdauer-input {
        width: 60px;
        margin-left: 0.5rem;
        margin-right: 0.5rem;
    }

    .time-summary {
        color: var(--text-secondary);
    }
</style>