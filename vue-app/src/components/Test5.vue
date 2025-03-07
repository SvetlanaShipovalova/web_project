<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <!-- Начальный экран -->
      <div v-if="!gameStarted && !gameEnded">
        <h1>Тест реакции</h1>
        <p>
          <strong>Игра:</strong> "Тест реакции" — это игра для развития скорости реакции и внимания.
        </p>
        <p>
          <strong>Цель игры:</strong> Кликать по подсвеченным элементам как можно быстрее. Нажмите "Начать игру", после чего на экране появится сетка серых квадратов, один из которых будет случайным образом подсвечиваться красным. </p>
          <p>Ваша задача — как можно быстрее нажимать на подсвеченный квадрат. После каждого клика новый квадрат будет загораться в случайном месте. Игра состоит из 50 раундов, в каждом из которых важно быстро среагировать и нажать на нужный элемент. В конце теста отображаются общее время, количество правильных кликов и точность.</p>
        <button class="start-button btn btn-primary" @click="startGame">Начать игру</button>
      </div>

      <!-- Игровой экран -->
      <div v-else-if="gameStarted">
        <p>Оставшееся время: {{ formattedTime }}</p>
        <p>Раунд: {{ currentRound }} / {{ number_all_answers }}</p>
        <p>Правильные ответы: {{ number_correct_answers }} / {{ number_all_answers }}</p>
        <div class="game-area d-flex flex-wrap justify-content-center">
          <div v-for="i in 30" :key="i" class="square"
               :class="{ active: i === activeSquare }" @click="handleClick(i)">
          </div>
        </div>
      </div>

      <!-- Финальный экран -->
      <div v-if="gameEnded" class="end-message">
        <h3>Игра завершена!</h3>
        <p>Общее время: {{ time }}</p>
        <p>Правильные ответы: {{ number_correct_answers }} / {{ number_all_answers }}</p>
        <p>Точность: {{ accuracy }}%</p>
        <button class="btn btn-success" @click="restartGame">Пройти снова</button>
      </div>
      <router-link to="/tests" class="btn btn-secondary mt-3">Назад к тестам</router-link>
    </div>
  </div>
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
      timeLeft: 50,
      timeElapsed: 0,
      time: "00:00:00",
      activeSquare: null,
      number_all_answers: 50,
      number_correct_answers: 0,
      currentRound: 0,
      startTime: null,
      gameInterval: null,
    };
  },
  computed: {
    formattedTime() {
      const minutes = Math.floor(this.timeLeft / 60).toString().padStart(2, "0");
      const seconds = (this.timeLeft % 60).toString().padStart(2, "0");
      return `00:${minutes}:${seconds}`;
    },
    accuracy() {
      if (this.number_all_answers === 0) return 0;
      const calculated = (this.number_correct_answers / this.number_all_answers) * 100;
      return calculated.toFixed(2);
    },
  },
  methods: {
    startGame() {
      this.gameStarted = true;
      this.gameEnded = false;
      this.number_correct_answers = 0;
      this.currentRound = 0;
      this.timeElapsed = 0;
      this.timeLeft = 50;
      this.time = "00:00:00";
      this.startTime = Date.now();

      this.generateRandomSquare();

      this.gameInterval = setInterval(() => {
        if (this.currentRound < this.number_all_answers) {
          this.currentRound++;
          this.timeLeft--;
          this.timeElapsed++;
          this.time = this.formatTime(this.timeElapsed);
          this.generateRandomSquare();
        } else {
          this.endGame();
        }
      }, 1000);
    },

    formatTime(seconds) {
      const hours = Math.floor(seconds / 3600).toString().padStart(2, "0");
      const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
      const sec = (seconds % 60).toString().padStart(2, "0");
      return `${hours}:${minutes}:${sec}`;
    },

    generateRandomSquare() {
      this.activeSquare = Math.floor(Math.random() * 30) + 1;
    },

    handleClick(index) {
      if (index === this.activeSquare) {
        this.number_correct_answers++;
        this.generateRandomSquare();
      }
    },

    endGame() {
      clearInterval(this.gameInterval);
      this.gameStarted = false;
      this.gameEnded = true;
      this.time = this.formatTime(this.timeElapsed);
      this.saveResults();
    },

    restartGame() {
      this.startGame();
    },

    async saveResults() {
      if (!this.authStore.user) {
        alert("Пользователь не авторизован. Пожалуйста, войдите в систему.");
        return;
      }

      const testId = 5;
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
            score_percentage: parseInt(accuracyValue, 10),
            time: this.time,
            number_all_answers: this.number_all_answers,
            number_correct_answers: this.number_correct_answers,
            accuracy: parseInt(accuracyValue, 10),
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

<style>
.game-area {
  display: grid;
  grid-template-columns: repeat(6, 60px);
  gap: 10px;
  margin-top: 20px;
}

.square {
  width: 60px;
  height: 60px;
  background-color: lightgray;
  border: 1px solid #333;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.square.active {
  background-color: red;
}
</style>
