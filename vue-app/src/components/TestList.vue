<template>
  <Navbar />
  <div class="container mt-5">
    <div class="container mt-5 text-center">
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
  { id: 1, name: "Тест c использованием таблиц Шульте", description: "Проверьте развитость произвольного внимания и поля зрения." },
  { id: 2, name: "Тест числового охвата", description: "Запоните числа и определите их после сигнала." },
  { id: 3, name: "Проверка на быстроту реакции", description: "Найдите лишнее слово как можно скорее." },
  { id: 4, name: "Тест4", description: "Найдите пропущенные числа в последовательности." },
  { id: 5, name: "Тест5", description: "Определите, в какой копилке больше монет." },
  { id: 6, name: "Полина (сравнение)", description: "Проверьте свою способность концентрироваться." },
  { id: 7, name: "Полина (копилка)", description: "Проверьте свою способность концентрироваться." },
  { id: 8, name: "Полина", description: "Проверьте свою способность концентрироваться." },
  { id: 9, name: "Полина", description: "Проверьте свою способность концентрироваться." },
  { id: 10, name: "Полина", description: "Проверьте свою способность концентрироваться." },
  { id: 11, name: "Тест на восприятие звуков", description: "Проверка воприятия ребенком звуков животных." },
  { id: 12, name: "Тест на внимание Мюнстерберга", description: "Проверьте свою способность концентрироваться." },
  { id: 13, name: "Тест на зрительно-моторную координацию", description: "Используя шарики, проверьте свою реакцию." },
  { id: 14, name: "Найдите неточность на картинке", description: "Проверьте свою способность концентрироваться." },
  { id: 15, name: "Прогрессивные матрицы Равена", description: "Проверьте свою способность концентрироваться." },
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