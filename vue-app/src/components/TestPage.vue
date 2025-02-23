<template>
  <component :is="currentComponent" />
</template>

<script setup>
import {defineAsyncComponent, computed, defineProps} from 'vue';

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

const testComponents = {
  '1': defineAsyncComponent(() => import('../views/Test1.vue')),
  '2': defineAsyncComponent(() => import('../views/Test2.vue')),
  '3': defineAsyncComponent(() => import('../views/Test3.vue')),
  //'4': defineAsyncComponent(() => import('../views/Test4.vue')),
  //'5': defineAsyncComponent(() => import('../views/Test5.vue')),
};

const currentComponent = computed(() => {
  return testComponents[props.id] || null;
});
</script>