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
  //'4': defineAsyncComponent(() => import('../components/Test4.vue')),
<<<<<<< HEAD
  //'5': defineAsyncComponent(() => import('../components/Test5.vue')),
=======
  '11': defineAsyncComponent(() => import('../components/Test11.vue')),
  '12': defineAsyncComponent(() => import('../components/Test12.vue')),
  '13': defineAsyncComponent(() => import('../components/Test13.vue')),
  '14': defineAsyncComponent(() => import('../components/Test14.vue')),
  '15': defineAsyncComponent(() => import('../components/Test15.vue')),
>>>>>>> 4b2fa83e4d0e49f3a66b4466b54fcd4940beab7e
};

const currentComponent = computed(() => {
  return testComponents[props.id] || null;
});
</script>