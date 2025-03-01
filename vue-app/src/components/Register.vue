<template>
 <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
   <div class="container">
     <text class="navbar-brand" >Когнитивные тесты</text>
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
   <div class="card p-4 shadow-lg" style="max-width: 400px; width: 100%; height: 450px">
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




const register = async () => {
   if (password.value !== passwordConfirm.value) {
       alert("Пароли не совпадают!");
       return;
   }


   const data = {
       nickname: username.value,
       password: password.value,
   };


   console.log("Отправляемые данные:", data);


   const response = await fetch("http://127.0.0.1:8000/api/register/", {
       method: "POST",
       headers: {
           "Content-Type": "application/json",
       },
       body: JSON.stringify(data),
   });


   if (response.ok) {
       alert("Регистрация успешна!");
       router.push("/login");
   } else {
       const errorData = await response.json();
       alert(errorData.error || "Ошибка регистрации");
   }
};
</script>
