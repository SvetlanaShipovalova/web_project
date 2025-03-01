<template>
 <div>
   <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
     <div class="container">
       <text class="navbar-brand">Когнитивные тесты</text>
       <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
         <span class="navbar-toggler-icon"></span>
       </button>
       <div class="collapse navbar-collapse" id="navbarNav">
         <ul class="navbar-nav ms-auto">
         </ul>
       </div>
     </div>
   </nav>


   <div class="container d-flex justify-content-center align-items-center min-vh-100" style="margin-top: -80px;">
     <div class="card p-4 shadow-lg" style="max-width: 400px; width: 100%; ">
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
         <button type="submit" class="btn btn-primary w-100 py-2">Войти</button>
         <p class="mt-3 text-center">
           Нет аккаунта? <router-link to="/register">Зарегистрироваться</router-link>
         </p>
       </form>
     </div>
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


const login = async () => {
   try {
       const response = await fetch("http://127.0.0.1:8000/api/login/", {
           method: "POST",
           headers: {
               "Content-Type": "application/json",
           },
           body: JSON.stringify({
               nickname: username.value,
               password: password.value,
           }),
       });


       if (response.ok) {
           const data = await response.json();
           console.log("Успешный вход:", data);


           authStore.user = {
               id: data.user_id,
               username: username.value,
           };
           authStore.token = data.token || "fake-token";


           router.push("/tests");
       } else {
           const errorData = await response.json();
           alert(errorData.error || "Ошибка входа");
       }
   } catch (error) {
       console.error("Ошибка при входе:", error);
       alert("Ошибка при входе");
   }
};
</script>
