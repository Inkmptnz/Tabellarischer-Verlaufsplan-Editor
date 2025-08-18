<script setup>
    import { Plus, Trash2 } from 'lucide-vue-next'

    defineProps({
    stundenthema: String,
    lernziele: Array
    })

    const emit = defineEmits([
    'update:stundenthema',
    'add-lernziel',
    'delete-lernziel',
    'update-lernziel-text'
    ])
</script>

<template>
  <section class="lernziele-section">
    <div class="topic-container">
      <h1
        class="thema-input"
        contenteditable="true"
        @input="emit('update:stundenthema', $event.target.innerText)"
        v-text="stundenthema"
      ></h1>
    </div>

    <div class="lernziele-container">
      <h2>Lernziele:</h2>
      <ul>
        <li v-for="lernziel in lernziele" :key="lernziel.id">
          <span
            contenteditable="true"
            role="textbox"
            class="lernziel-text"
            @input="emit('update-lernziel-text', { id: lernziel.id, text: $event.target.innerText })"
            @vue:mounted="({ el }) => el.innerText = lernziel.text"
          ></span>
          <button
            type="button"
            @click="emit('delete-lernziel', lernziel.id)"
            class="action-btn lernziel-loeschen-btn danger-btn"
            title="Lernziel löschen"
          >
            <Trash2 />
          </button>
        </li>
      </ul>
      <button
        type="button"
        @click="emit('add-lernziel')"
        class="action-btn lernziel-hinzufuegen-btn"
      >
        <Plus />
        <span class="lernziel-hinzufuegen-span">Neues Lernziel</span>
      </button>
    </div>
  </section>
</template>


<style scoped>

    .lernziele-section {
        margin-bottom: 2rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid var(--border-color);
    }

    .lernziele-container span:not(.lernziel-hinzufuegen-span)::before {
        content: '•';
        position: relative;
        left: -20px;
        color: var(--accent-color);
    }

    .lernziele-container {
        margin-top: 1.5rem;
    }

    .lernziele-container h2 {
        font-size: 1.1rem;
        font-weight: 500;
        color: var(--text-secondary);
        margin-bottom: 0.75rem;
    }

    .lernziele-container ul {
        padding-left: 1.5rem;
    }

    .lernziele-container li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding-bottom: 0.5rem;
    }
</style>