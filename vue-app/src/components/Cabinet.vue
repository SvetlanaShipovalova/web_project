<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>Личный кабинет</h2>
    <p>Имя пользователя: <strong>{{ userName }}</strong></p>
    <a v-if="authStore.isAdmin" href="/admin" target="_blank" class="btn btn-primary ms-3">Административная панель</a>
  </div>
</template>


<script setup>
import Navbar from "../view/Navbar.vue";
import { useAuthStore } from "../store/authStore";
import {computed} from "vue";


const authStore = useAuthStore();
const userName = authStore.user ? authStore.user.username : "Неизвестный пользователь";
const isAdmin = computed(() => authStore.user && authStore.user.role === 'admin');
</script>
