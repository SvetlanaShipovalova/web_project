<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>Тест №{{ $route.params.id }}</h2>
    <p>Описание теста...</p>
    <router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
  </div>
</template>


<script setup>
import Navbar from "../components/Navbar.vue";
</script>
