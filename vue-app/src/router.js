import { createRouter, createWebHistory } from "vue-router";
import Login from "./views/Login.vue";
import Register from "./views/Register.vue";
import ProfileForm from "./views/ProfileForm.vue";
import TestList from "./views/TestList.vue";
import Cabinet from "./views/Cabinet.vue";
import TestPage from "./views/TestPage.vue";


const routes = [
    { path: "/", redirect: "/Login" },
    { path: "/login", component: Login },
    { path: "/register", component: Register },
    { path: "/profile", component: ProfileForm },
    { path: "/tests", component: TestList },
    { path: "/cabinet", component: Cabinet },
    { path: "/test/:id", component: TestPage },
];


const router = createRouter({
    history: createWebHistory(),
    routes,
});


export default router;
