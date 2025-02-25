import { defineStore } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";


export const useAuthStore = defineStore("auth", {
   state: () => ({
       user: null,
       token: null,
       isAdmin: false,
   }),


   actions: {
       async login(username, password) {
           try {
               const response = await fetch("http://127.0.0.1:8000/api/login/", {
                   method: "POST",
                   headers: {
                       "Content-Type": "application/json",
                   },
                   body: JSON.stringify({ nickname: username, password }),
               });


               if (response.ok) {
                   const data = await response.json();
                   this.user = { id: data.user_id, username };
                   this.token = "fake-token";  // Заглушка для токена
                   localStorage.setItem("token", this.token);
                   return true;
               } else {
                   const errorData = await response.json();
                   alert(errorData.error || "Ошибка входа");
                   return false;
               }
           } catch (error) {
               console.error("Ошибка при входе:", error);
               return false;
           }
       },


       async register(username, password) {
           try {
               const response = await fetch("http://127.0.0.1:8000/api/register/", {
                   method: "POST",
                   headers: {
                       "Content-Type": "application/json",
                   },
                   body: JSON.stringify({ nickname: username, password_hash: password }),
               });


               if (response.ok) {
                   alert("Регистрация успешна!");
                   return true;
               } else {
                   const errorData = await response.json();
                   alert(errorData.error || "Ошибка регистрации");
                   return false;
               }
           } catch (error) {
               console.error("Ошибка при регистрации:", error);
               return false;
           }
       },


       logout() {
           this.user = null;
           this.token = null;
           localStorage.removeItem("token");
       },
   },
});
