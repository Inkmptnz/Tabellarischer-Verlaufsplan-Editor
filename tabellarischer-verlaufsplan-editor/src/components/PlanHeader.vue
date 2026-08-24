<script setup>
defineProps({
  schulname: String,
  datum: String,
  startzeit: String,
  lehrername: String,
})

const emit = defineEmits([
  'update:schulname',
  'update:datum',
  'update:startzeit',
  'update:lehrername',
])
</script>

<template>
  <header class="plan-header">
    <input
      type="text"
      class="header-input"
      placeholder="Schulname"
      aria-label="Schulname"
      :value="schulname"
      @input="emit('update:schulname', $event.target.value)"
    />
    <input
      type="date"
      class="header-input"
      aria-label="Datum"
      :value="datum"
      @input="emit('update:datum', $event.target.value)"
    />
    <input
      type="time"
      id="start-time-input"
      class="header-input"
      aria-label="Startzeit"
      :value="startzeit"
      @input="emit('update:startzeit', $event.target.value)"
    />
    <input
      type="text"
      class="header-input"
      placeholder="Lehrername"
      aria-label="Lehrername"
      :value="lehrername"
      @input="emit('update:lehrername', $event.target.value)"
    />
  </header>
</template>

<style scoped>
.plan-header {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding-bottom: 1.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}
.header-input {
  flex: 1;
  min-width: 200px;
}
</style>
