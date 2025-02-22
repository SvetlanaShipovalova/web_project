import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: null,
        token: null, // Пока без бэкенда, будет заглушка
        isAdmin: false, // Добавляем флаг isAdmin
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
    },

    actions: {
        login(username, password) {
            // Временные учетные данные для администратора
            if (username === "admin" && password === "admin123") {
                this.token = "admin-fake-token";
                this.user = { username: "admin", role: "admin" }; // добавляем роль пользователю
                this.isAdmin = true; // Устанавливаем isAdmin в true
                localStorage.setItem("token", this.token);
                localStorage.setItem("isAdmin", "true");  // Сохраняем isAdmin в localStorage
                return true;
            }

            // Стандартные учетные данные
            if (username === "test" && password === "1234") {
                this.token = "fake-token"; // Заглушка вместо настоящего API
                this.user = { username, role: "user" };  // добавляем роль пользователю
                this.isAdmin = false; // Устанавливаем isAdmin в false
                localStorage.setItem("token", this.token);
                localStorage.setItem("isAdmin", "false");  // Сохраняем isAdmin в localStorage
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
            this.isAdmin = false; // Сбрасываем isAdmin при выходе
            localStorage.removeItem("token");
            localStorage.removeItem("isAdmin");  // Удаляем isAdmin из localStorage
        },
    },
});