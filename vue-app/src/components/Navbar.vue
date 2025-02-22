<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <router-link class="navbar-brand" to="/dashboard">Когнитивные Тесты</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/dashboard">Главная</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/tests">Тесты</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/profile">Анкета</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/cabinet">Личный кабинет</router-link>
          </li>
          <li class="nav-item">
            <button class="btn btn-danger ms-3" @click="logout">Выйти</button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>


<script setup>
import { useAuthStore } from "../store/authStore";
import { useRouter } from "vue-router";


const authStore = useAuthStore();
const router = useRouter();


const logout = () => {
  authStore.logout();
  router.push("/login");
};
</script>
