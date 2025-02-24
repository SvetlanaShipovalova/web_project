import { createRouter, createWebHistory } from "vue-router";
import Login from "./components/Login.vue";
import Register from "./components/Register.vue";
import ProfileForm from "./components/ProfileForm.vue";
import TestList from "./components/TestList.vue";
import Cabinet from "./components/Cabinet.vue";
import Test1 from "./components/Test1.vue";
import Test2 from "./components/Test2.vue";
import Test3 from "./components/Test3.vue"; //Предположим у тебя есть Test3


const routes = [
    { path: "/", redirect: "/Login" },
    { path: "/login", component: Login },
    { path: "/register", component: Register },
    { path: "/profile", component: ProfileForm },
    { path: "/tests", component: TestList },
    { path: "/cabinet", component: Cabinet },
    {
        path: "/test/:id",
        component: () => import('./components/TestPage.vue'), // Используем контейнер
        props: true, // Передаем id как пропс
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;