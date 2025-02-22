<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>Личный кабинет</h2>
    <p>Имя пользователя: <strong>{{ userName }}</strong></p>
  </div>
</template>


<script setup>
import Navbar from "../components/Navbar.vue";
import { useAuthStore } from "../store/authStore";


const authStore = useAuthStore();
const userName = authStore.user ? authStore.user.username : "Неизвестный пользователь";
</script>
