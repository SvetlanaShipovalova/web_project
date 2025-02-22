<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h1>Добро пожаловать!</h1>
    <p>Здесь вы можете пройти когнитивные тесты.</p>
    <router-link to="/tests" class="btn btn-primary btn-lg">Перейти к тестам</router-link>
  </div>
</template>


<script setup>
import Navbar from "../components/Navbar.vue";
</script>
