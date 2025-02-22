import { defineStore } from "pinia";


export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: null,
        token: null, // Пока без бэкенда, будет заглушка
    }),


    getters: {
        isAuthenticated: (state) => !!state.token,
    },


    actions: {
        login(username, password) {
            if (username === "test" && password === "1234") {
                this.token = "fake-token"; // Заглушка вместо настоящего API
                this.user = { username };
                localStorage.setItem("token", this.token);
                return true;
            } else {
                return false;
            }
        },


        register(username, password) {
            console.log(`Регистрация пользователя: ${username} с паролем ${password}`);
            return true;
        },


        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem("token");
        },
    },
});
