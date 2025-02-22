<template>
  <div class="container d-flex justify-content-center align-items-center min-vh-100">
    <div class="card p-4 shadow-lg" style="max-width: 400px; width: 100%;">
      <h2 class="text-center">Вход</h2>
      <form @submit.prevent="login">
        <div class="mb-3">
          <label class="form-label">Имя пользователя</label>
          <input v-model="username" type="text" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Пароль</label>
          <input v-model="password" type="password" class="form-control" required />
        </div>
        <button type="submit" class="btn btn-primary w-100">Войти</button>
        <p class="mt-3 text-center">
          Нет аккаунта? <router-link to="/register">Зарегистрироваться</router-link>
        </p>
      </form>
    </div>
  </div>
</template>


<script setup>
import { ref } from "vue";
import { useAuthStore } from "../store/authStore";
import { useRouter } from "vue-router";


const username = ref("");
const password = ref("");
const authStore = useAuthStore();
const router = useRouter();


const login = () => {
  const success = authStore.login(username.value, password.value);
  if (success) {
    router.push("/dashboard");
  } else {
    alert("Неверные учетные данные");
  }
};
</script>
