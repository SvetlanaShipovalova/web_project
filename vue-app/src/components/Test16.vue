<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <!-- Стартовый экран -->
      <div v-if="currentView === 'start'">
        <h1>Тест на цветовое зрение</h1>
        <p><strong>Описание:</strong> Найдите лишний цвет среди представленных вариантов.</p>
        <p><strong>Цель:</strong> Определить цветовую чувствительность.</p>
        <button @click="startTest">Начать тест</button>
      </div>
      
      <!-- Экран теста -->
      <div v-else-if="currentView === 'test'">
        <h2>Раунд {{ round }} из 6</h2>
        <p>Выберите лишний цвет</p>
        <p>Оставшееся время: {{ remainingTime }} сек</p>
        <div class="row">
          <div
            v-for="(color, index) in colors"
            :key="index"
            class="col-6 col-sm-3 mb-3"
          >
            <button
              :style="{ backgroundColor: color }"
              class="btn btn-block grid-button"
              @click="checkColor(index)"
            ></button>
          </div>
        </div>
      </div>
      
      <!-- Экран результатов -->
      <div v-else-if="currentView === 'result'">
        <h1>Результаты</h1>
        <p>Всего вопросов: {{ number_all_answers }}</p>
        <p>Верных ответов: {{ number_correct_answers }}</p>
        <p>Точность: {{ accuracy }}%</p>
        <p>Вы потратили: {{ time }}</p>
        <button @click="startTest">Начать заново</button>
      </div>
    </div>
    <router-link to="/tests" class="btn btn-secondary mt-3">Назад к тестам</router-link>
  </div>
</template>

<script>
import Navbar from "../view/Navbar.vue";
import { useAuthStore } from "../store/authStore";

export default {
  components: { Navbar },
  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },
  data() {
    return {
      currentView: "start",
      round: 1,
      timer: null,
      remainingTime: 30,
      time: "00:00:00",
      number_all_answers: 6,
      number_correct_answers: 0,
      colors: [],
      correctIndex: null,
    };
  },
  computed: {
    accuracy() {
      return ((this.number_correct_answers / this.number_all_answers) * 100).toFixed(2);
    }
  },
  methods: {
    startTest() {
      this.round = 1;
      this.remainingTime = 30;
      this.time = "00:00:00";
      this.number_correct_answers = 0;
      this.currentView = "test";
      this.resetRound();
      this.startTimer();
    },
    startTimer() {
      this.stopTimer();
      this.timer = setInterval(() => {
        this.remainingTime--;
        this.time = this.formatTime(30 - this.remainingTime);
        if (this.remainingTime <= 0) {
          this.finishTest();
        }
      }, 1000);
    },
    stopTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
      const sec = (seconds % 60).toString().padStart(2, "0");
      return `00:${minutes}:${sec}`;
    },
    generateColors() {
      // Генерируем базовый цвет с фиксированной насыщенностью и яркостью 50%
      const baseHue = Math.floor(Math.random() * 360);
      const baseColor = `hsl(${baseHue}, 70%, 50%)`;
      // Случайным образом определяем, будет ли вариант светлее или темнее базового
      const isDarker = Math.random() < 0.5;
      // Если темнее, то яркость снижается на 15%, если светлее – увеличивается на 15%
      const variantLightness = isDarker ? 35 : 65;
      const variantColor = `hsl(${baseHue}, 70%, ${variantLightness}%)`;
      
      // Выбираем случайный индекс для лишнего цвета среди 4 вариантов
      this.correctIndex = Math.floor(Math.random() * 4);
      // Заполняем массив из 4 элементов базовым цветом
      this.colors = Array(4).fill(baseColor);
      // Вставляем вариантный цвет (с отличной яркостью)
      this.colors[this.correctIndex] = variantColor;
    },
    checkColor(index) {
      if (index === this.correctIndex) {
        this.number_correct_answers++;
      }
      if (this.round < this.number_all_answers) {
        this.round++;
        this.resetRound();
      } else {
        this.finishTest();
      }
    },
    finishTest() {
      this.stopTimer();
      this.currentView = "result";
      this.saveResults();
    },
    resetRound() {
      this.generateColors();
    },
    async saveResults() {
      if (!this.authStore.user) {
        alert("Пользователь не авторизован. Пожалуйста, войдите в систему.");
        return;
      }
      const testId = 16;
      const accuracyValue = parseFloat(this.accuracy);
      try {
        const response = await fetch("http://127.0.0.1:8000/api/result/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            test: testId,
            user: this.authStore.user.id,
            score_percentage: Math.min(100, parseInt(accuracyValue, 10)),
            time: this.time,
            number_all_answers: this.number_all_answers,
            number_correct_answers: this.number_correct_answers,
            accuracy: Math.min(100, parseInt(accuracyValue, 10)),
          }),
        });
        if (response.ok) {
          alert("Результаты успешно сохранены!");
        } else {
          const errorData = await response.json();
          alert(errorData.detail || errorData.error || "Ошибка при сохранении");
        }
      } catch (error) {
        console.error("Ошибка при отправке результатов:", error);
        alert("Ошибка соединения с сервером");
      }
    },
  },
};
</script>

<style scoped>
/* Адаптивная сетка через Bootstrap, здесь используются классы col-6 (xs) и col-sm-3 (sm и выше) */
.grid-button {
  width: 80px;
  height: 80px;
}
</style>
