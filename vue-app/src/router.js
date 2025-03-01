import { createRouter, createWebHistory } from "vue-router";
import Login from "./components/Login.vue";
import Register from "./components/Register.vue";
import ProfileForm from "./components/ProfileForm.vue";
import TestList from "./components/TestList.vue";
import Cabinet from "./components/Cabinet.vue";
import TestPage from "./components/TestPage.vue";


const routes = [
    { path: "/", redirect: "/Login" },
    { path: "/login", component: Login },
    { path: "/register", component: Register },
    { path: "/profile", component: ProfileForm },
    { path: "/tests", component: TestList },
    { path: "/cabinet", component: Cabinet },
    { path: '/test/:name', component: TestPage, props: true },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;