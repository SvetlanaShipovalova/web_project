<template>
  <component :is="currentComponent" />
</template>

<script setup>
import { defineAsyncComponent, computed, defineProps } from 'vue';

const props = defineProps({
  name: { 
    type: String,
    required: true
  }
});

const testComponents = {
  'Тест 1': defineAsyncComponent(() => import('../components/Test1.vue')),
  'Тест 2': defineAsyncComponent(() => import('../components/Test2.vue')),
  'Тест 3': defineAsyncComponent(() => import('../components/Test3.vue')),
  'Тест 4': defineAsyncComponent(() => import('../components/Test4.vue')),
  'Тест 5': defineAsyncComponent(() => import('../components/Test5.vue')),
  'Тест 6': defineAsyncComponent(() => import('../components/Test6.vue')),
  'Тест 7': defineAsyncComponent(() => import('../components/Test7.vue')),
  'Тест 8': defineAsyncComponent(() => import('../components/Test8.vue')),
  'Тест 9': defineAsyncComponent(() => import('../components/Test9.vue')),
  'Тест 10': defineAsyncComponent(() => import('../components/Test10.vue')),
  'Тест 11': defineAsyncComponent(() => import('../components/Test11.vue')),
  'Тест 12': defineAsyncComponent(() => import('../components/Test12.vue')),
  'Тест 13': defineAsyncComponent(() => import('../components/Test13.vue')),
  'Тест 14': defineAsyncComponent(() => import('../components/Test14.vue')),
  'Тест 15': defineAsyncComponent(() => import('../components/Test15.vue')),
  'Тест 16': defineAsyncComponent(() => import('../components/Test16.vue')),
  'Тест 17': defineAsyncComponent(() => import('../components/Test17.vue')),
  'Тест 18': defineAsyncComponent(() => import('../components/Test18.vue')),
  'Тест 19': defineAsyncComponent(() => import('../components/Test19.vue')),
  'Тест 20': defineAsyncComponent(() => import('../components/Test20.vue')),
};

const currentComponent = computed(() => {
  return testComponents[props.name] || null;
});
</script>
