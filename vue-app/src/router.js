import { createRouter, createWebHistory } from "vue-router";
import Login from "./views/Login.vue";
import Register from "./views/Register.vue";
import Dashboard from "./views/Dashboard.vue";
import ProfileForm from "./views/ProfileForm.vue";
import TestList from "./views/TestList.vue";
import Cabinet from "./views/Cabinet.vue";
import TestPage from "./views/TestPage.vue";


const routes = [
    { path: "/", redirect: "/dashboard" },
    { path: "/login", component: Login },
    { path: "/register", component: Register },
    { path: "/dashboard", component: Dashboard },
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
