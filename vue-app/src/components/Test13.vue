<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>Тест 13</h2>
    <div id="app">
      <!-- Начальный экран -->
      <div v-if="!gameStarted && !gameEnded">
        <h1>Тест на зрительно-моторную координацию</h1>
        <p>
          <strong>Игра:</strong> "Тест на зрительно-моторную координацию" — это игра для развития концентрации и скорости восприятия.
        </p>
        <p>
          <strong>Цель игры:</strong> Среди множества чисел "44" найдите одно число "45" и нажмите на него как можно быстрее.
        </p>
        <button class="start-button" @click="startGame">Начать игру</button>
      </div>

      <!-- Игровой экран -->
      <div v-else-if="gameStarted">
        <p>Прошедшее время: {{ elapsedTime }}</p>
        <p>Раунд: {{ currentRound }} / {{ number_all_answers }}</p>
        <p>Правильные ответы: {{ number_correct_answers }} / {{ number_all_answers }}</p>
        <div class="game-area d-flex flex-wrap justify-content-center">
          <div v-for="(num, index) in grid" :key="index" 
               class="number-cell bg-dark text-warning p-3" 
               @click="handleClick(num)">{{ num }}</div>
        </div>
      </div>

      <!-- Финальный экран -->
      <div v-if="gameEnded" class="end-message">
        <h3>Игра завершена!</h3>
        <p>Время выполнения: {{ elapsedTime }}</p>
        <p>Правильные ответы: {{ number_correct_answers }} / {{ number_all_answers }}</p>
        <p>Точность: {{ accuracy }}%</p>
        <button @click="restartGame">Пройти снова</button>
      </div>
    </div>
  </div>
  <router-link to="/tests" class="btn btn-secondary mt-3">Назад к тестам</router-link>
</template>

<script>
import Navbar from "../view/Navbar.vue";
import { useAuthStore } from '../store/authStore';

export default {
  components: { Navbar },
  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },
  data() {
    return {
      gameStarted: false,
      gameEnded: false,
      number_all_answers: 10,
      number_correct_answers: 0,
      currentRound: 1,
      startTime: null,
      elapsedTime: "00:00",
      timer: null,
      grid: [],
    };
  },
  computed: {
    accuracy() {
      return this.number_all_answers ? ((this.number_correct_answers / this.number_all_answers) * 100).toFixed(2) : 0;
    },
  },
  methods: {
    startGame() {
      this.gameStarted = true;
      this.gameEnded = false;
      this.currentRound = 1;
      this.number_correct_answers = 0;
      this.startTime = Date.now();
      this.updateElapsedTime();
      this.timer = setInterval(this.updateElapsedTime, 1000);
      this.generateGrid();
    },
    updateElapsedTime() {
      const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
      const minutes = Math.floor(elapsedSeconds / 60);
      const seconds = elapsedSeconds % 60;
      this.elapsedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    },
    generateGrid() {
      this.grid = Array(54).fill(44);
      const randomIndex = Math.floor(Math.random() * 54);
      this.grid[randomIndex] = 45;
    },
    handleClick(num) {
      if (num === 45) {
        this.number_correct_answers++;
      }
      this.currentRound++;
      if (this.currentRound > this.number_all_answers) {
        this.endGame();
      } else {
        this.generateGrid();
      }
    },
    endGame() {
      clearInterval(this.timer);
      this.gameStarted = false;
      this.gameEnded = true;
      this.saveResults();
    },
    async saveResults() {
      try {
        const response = await fetch("https://svetasy.pythonanywhere.com/api/result/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            test: 13,
            user: this.authStore.user.id,
            score_percentage: parseInt(this.accuracy, 10),
            time: this.elapsedTime,
            number_all_answers: this.number_all_answers,
            number_correct_answers: this.number_correct_answers,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          alert(errorData.error || "Ошибка при сохранении результатов");
        } else {
          alert("Результаты успешно сохранены!");
        }
      } catch (error) {
        alert("Ошибка соединения с сервером");
      }
    },
    restartGame() {
      this.gameStarted = false;
      this.gameEnded = false;
      this.startGame();
    },
  },
};
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.game-area {
  display: grid;
  grid-template-columns: repeat(10, 30px);
  gap: 5px;
  margin-top: 20px;
  justify-content: center;
}

</style>
