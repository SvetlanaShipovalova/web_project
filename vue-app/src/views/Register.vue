<template>
  <div class="container d-flex justify-content-center align-items-center min-vh-100">
    <div class="card p-4 shadow-lg" style="max-width: 400px; width: 100%;">
      <h2 class="text-center">Регистрация</h2>
      <form @submit.prevent="register">
        <div class="mb-3">
          <label class="form-label">Имя пользователя</label>
          <input v-model="username" type="text" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Пароль</label>
          <input v-model="password" type="password" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Повторите пароль</label>
          <input v-model="passwordConfirm" type="password" class="form-control" required />
        </div>
        <button type="submit" class="btn btn-success w-100">Зарегистрироваться</button>
        <p class="mt-3 text-center">
          Уже есть аккаунт? <router-link to="/login">Войти</router-link>
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
const passwordConfirm = ref("");
const authStore = useAuthStore();
const router = useRouter();


const register = () => {
  if (password.value !== passwordConfirm.value) {
    alert("Пароли не совпадают!");
    return;
  }


  authStore.register(username.value, password.value);
  router.push("/login");
};
</script>
