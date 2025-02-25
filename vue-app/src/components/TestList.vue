<template>
  <Navbar />
  <div class="container mt-5">
    <div class="container mt-3 text-center">
      <h1>Добро пожаловать!</h1>
      <p>Здесь вы можете пройти когнитивные тесты.</p>
    </div>

    <div class="row row-cols-1 row-cols-md-3 g-4 mb-5">
      <div v-for="test in tests" :key="test.id" class="col">
        <div class="card h-100 shadow-sm d-flex flex-column">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">{{ test.name }}</h5>
            <p class="card-text flex-grow-1">{{ test.description }}</p>
            <router-link :to="'/test/' + test.id" class="btn btn-primary mt-auto w-100">Начать тест</router-link>
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
  { id: 1, name: "Тест 1", description: "Проверьте развитость произвольного внимания и поля зрения." },
  { id: 2, name: "Тест 2", description: "Тест числового охвата." },
  { id: 3, name: "Тест 3", description: "Проверка на быстроту реакции по поиску слов." },
  { id: 4, name: "Тест 4", description: "Тест на память" },
  { id: 5, name: "Тест 5", description: "Тест реакции" },
  { id: 6, name: "Тест 6", description: "Сравнение объектов" },
  { id: 7, name: "Тест 7", description: "Игра Копилка" },
  { id: 8, name: "Тест 8", description: "Тест Числовых Последовательностей" },
  { id: 9, name: "Тест 9", description: "Игра-тренажер: Наперстки" },
  { id: 10, name: "Тест 10", description: "Пятнашки" },
  { id: 11, name: "Тест 11", description: "Тест на восприятие звуков животных." },
  { id: 12, name: "Тест 12", description: "Тест на внимание Мюнстерберга." },
  { id: 13, name: "Тест 13", description: "Тест на зрительно-моторную координацию." },
  { id: 14, name: "Тест 14", description: "Найдите неточность на картинке." },
  { id: 15, name: "Тест 15", description: "Прогрессивные матрицы Равена." },
  { id: 16, name: "Тест 16", description: "Тест на цветовое зрение" },
  { id: 17, name: "Тест 17", description: "Тест на цветовую последовательность" },
  { id: 18, name: "Тест 18", description: "Тест на избирательность внимания" },
  { id: 19, name: "Тест 19", description: "Тест на сравнение чисел" },
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