<script setup>
    import { ref } from 'vue'
    import { Plus, Save, Printer, FolderInput, RotateCcw } from 'lucide-vue-next'

    defineProps({
        gesamtdauer: Number,
        verbleibendeZeit: Number
    })

    const emit = defineEmits(['update:gesamtdauer', 'add-phase', 'reset-all', 'reset-all-data', 'export-pdf'])
    let pressTimer = null
    const isPressing = ref(false)

    function startPressTimer() {
        isPressing.value = true
        pressTimer = setTimeout(() => {
            emit('reset-all-data')
            isPressing.value = false
        }, 2000)
    }
    function cancelPressTimer() {
        clearTimeout(pressTimer)
        isPressing.value = false
    }
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
      
      <button 
        type="button" 
        class="action-btn print-btn"
        @click="emit('export-pdf')"
      >
        <Printer />
        <span>PDF Export</span>
      </button>

      <button type="button" class="action-btn reset-btn" title="Alle Daten zurücksetzen (2s halten)"
        @mousedown="startPressTimer"
        @mouseup="cancelPressTimer"
        @mouseleave="cancelPressTimer"
        :class="{ 'is-pressing': isPressing }"
      >
        <svg class="progress-ring" width="40" height="40">
            <circle
                class="progress-ring-circle"
                stroke="var(--danger-color)"
                stroke-width="2"
                fill="transparent"
                r="18"
                cx="20"
                cy="20"
            />
        </svg>

        <RotateCcw />
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
        gap: 0.5rem;
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
    .lucide-rotate-ccw-icon {
        color: var(--danger-color);
       
    }

    .reset-btn {
        position: relative;
        padding: 0.5rem; 
        width: 44px;
        height: 44px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .progress-ring {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-90deg); /* Startet die Linie oben */
    }

    .progress-ring-circle {
        stroke-dasharray: 113 113; /* Umfang Kreis (2 * PI * 14 ≈ 88) */
        stroke-dashoffset: 113; 
        transition: stroke-dashoffset 2s linear;
    } 
    

    .reset-btn.is-pressing .progress-ring-circle {
        stroke-dashoffset: 0;
    }

    .reset-icon {
        position: relative;
        z-index: 1;
    }
</style>