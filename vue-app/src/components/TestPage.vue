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
  '1': defineAsyncComponent(() => import('.//Test1.vue')),
  '2': defineAsyncComponent(() => import('.//Test2.vue')),
  '3': defineAsyncComponent(() => import('.//Test3.vue')),
  '4': defineAsyncComponent(() => import('.//Test4.vue')),
  '5': defineAsyncComponent(() => import('.//Test5.vue')),
  '6': defineAsyncComponent(() => import('./Test6.vue')),
  '7': defineAsyncComponent(() => import('./Test7.vue')),
  '8': defineAsyncComponent(() => import('./Test8.vue')),
  '9': defineAsyncComponent(() => import('./Test9.vue')),
  '10': defineAsyncComponent(() => import('./Test10.vue')),
  '11': defineAsyncComponent(() => import('../components/Test11.vue')),
  '12': defineAsyncComponent(() => import('../components/Test12.vue')),
  '13': defineAsyncComponent(() => import('../components/Test13.vue')),
  '14': defineAsyncComponent(() => import('../components/Test14.vue')),
  '15': defineAsyncComponent(() => import('../components/Test15.vue')),
  '16': defineAsyncComponent(() => import('../components/Test16.vue')),
  '17': defineAsyncComponent(() => import('../components/Test17.vue')),
  '18': defineAsyncComponent(() => import('../components/Test18.vue')),
  '19': defineAsyncComponent(() => import('../components/Test19.vue')),
  '20': defineAsyncComponent(() => import('../components/Test20.vue')),

};

const currentComponent = computed(() => {
  return testComponents[props.id] || null;
});
</script>