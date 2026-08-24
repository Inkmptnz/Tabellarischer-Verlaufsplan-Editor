<script setup>
defineProps({
  message: String,
  count: Number,
})

const emit = defineEmits(['undo', 'dismiss'])
</script>

<template>
  <div class="undo-toast" role="status">
    <span
      >{{ message }}<template v-if="count > 1"> ({{ count }})</template></span
    >
    <button type="button" class="action-btn undo-btn" @click="emit('undo')">Rückgängig</button>
    <button type="button" class="action-btn dismiss-btn" title="Schließen" @click="emit('dismiss')">
      ✕
    </button>
  </div>
</template>

<style scoped>
.undo-toast {
  position: fixed;
  left: 50%;
  bottom: 2rem;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: var(--surface-color);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
  z-index: 1000;
}

.undo-btn {
  color: var(--accent-color);
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--accent-color);
}

.dismiss-btn {
  padding: 0.25rem 0.5rem;
  color: var(--text-secondary);
}
</style>
