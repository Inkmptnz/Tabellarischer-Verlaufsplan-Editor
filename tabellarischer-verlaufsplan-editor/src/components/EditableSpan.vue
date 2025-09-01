<template>
  <span
    ref="editableElement"
    contenteditable="true"
    @input="handleInput"
    @blur="handleInput" 
  ></span>
</template>

<script setup>
    import { ref, onMounted, watch } from 'vue';

    const props = defineProps({
        modelValue: {
            type: String,
            required: true,
        },
    });

    const emit = defineEmits(['update:modelValue']);

    const editableElement = ref(null);

    function updateContent(newValue) {
    if (editableElement.value && editableElement.value.innerText !== newValue) {
        editableElement.value.innerText = newValue;
    }
    }

    onMounted(() => {
        updateContent(props.modelValue);
    });


    watch(() => props.modelValue, (newValue) => {
        updateContent(newValue);
    });


    const handleInput = (event) => {
        emit('update:modelValue', event.target.innerText);
    };
</script>