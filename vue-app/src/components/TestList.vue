<template>
  <Navbar />
  <div class="container mt-5">
    <div class="container mt-5 text-center">
      <h1>Добро пожаловать!</h1>
      <p>Здесь вы можете пройти когнитивные тесты.</p>
    </div>


    <div class="row row-cols-1 row-cols-md-3 g-4">
      <div v-for="test in tests" :key="test.id" class="col">
        <div class="card h-100 shadow-sm d-flex flex-column">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">{{ test.name }}</h5>
            <p class="card-text flex-grow-1">{{ test.description }}</p>
            <router-link :to="'/test/' + test.id" class="btn btn-primary mt-auto w-100">Начать</router-link>
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
  { id: 1, name: "Тест таблицы Шульте", description: "Проверьте развитость произвольного внимания и поля зрения." },
  { id: 2, name: "Наперстки", description: "Найдите, где спрятан предмет." },
  { id: 3, name: "Сравнение объектов", description: "Определите различия между изображениями." },
  { id: 4, name: "Числовые последовательности", description: "Найдите пропущенные числа в последовательности." },
  { id: 5, name: "Копилка", description: "Определите, в какой копилке больше монет." },
  { id: 6, name: "Тест на внимание", description: "Проверьте свою способность концентрироваться." }
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
