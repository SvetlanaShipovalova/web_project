<template>
  <Navbar />
  <div class="container mt-5">
    <div class="container mt-3 text-center">
      <h1>Добро пожаловать!</h1>
      <p>Здесь вы можете пройти когнитивные тесты.</p>
    </div>

    <div class="row row-cols-1 row-cols-md-3 g-4 mb-5">
      <div v-for="test in tests" :key="test.name" class="col">
        <div class="card h-100 shadow-sm d-flex flex-column">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">{{ test.name }}</h5>
            <p class="card-text flex-grow-1">{{ test.description }}</p>
            <router-link :to="'/test/' + test.name" class="btn btn-primary mt-auto w-100">Начать тест</router-link> <!-- Изменено на test.name -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Navbar from "../view/Navbar.vue";

const tests = ref([
  { name: "Тест 1", description: "Тест таблицы Шульте" },
  { name: "Тест 2", description: "Тест числового охвата" },
  { name: "Тест 3", description: "Тест на быстроту реакции по поиску слов" },
  { name: "Тест 4", description: "Тест на память: Найди смайлики" },
  { name: "Тест 5", description: "Тест реакции" },
  { name: "Тест 6", description: "Тест: Сравнение объектов" },
  { name: "Тест 7", description: "Игра Копилка" },
  { name: "Тест 8", description: "Тест Числовых Последовательностей" },
  { name: "Тест 9", description: "Игра-тренажер: Наперстки" },
  { name: "Тест 10", description: "Пятнашки" },
  { name: "Тест 11", description: "Тест на оперативную память" },
  { name: "Тест 12", description: "Тест на внимание Мюнстерберга" },
  { name: "Тест 13", description: "Тест на зрительно-моторную координацию" },
  { name: "Тест 14", description: "Найдите неточность" },
  { name: "Тест 15", description: "Тест на математическую внимательность" },
  { name: "Тест 16", description: "Тест на цветовое зрение" },
  { name: "Тест 17", description: "Тест на цветовую последовательность" },
  { name: "Тест 18", description: "Тест на избирательность внимания" },
]);
</script>

<style scoped>
.card {
  border-radius: 10px;
  transition: transform 0.2s ease-in-out;
  display: flex;
}
.card:hover {
  transform: scale(1.03);
}
</style>
