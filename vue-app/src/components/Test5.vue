<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <!-- Начальный экран -->
      <div v-if="!gameStarted && !gameEnded">
        <h1>Тест реакции</h1>
        <p>
          <strong>"Тест реакции"</strong> — это игра для развития скорости реакции и внимания.
        </p>
        <p>
          <strong>Цель игры:</strong> Кликать по подсвеченным элементам как можно быстрее.
        </p>
        <button class="start-button btn btn-primary" @click="startGame">Начать игру</button>
      </div>

      <!-- Игровой экран -->
      <div v-else-if="gameStarted">
        <p>Время: {{ formattedTime }}</p>
        <p>Очки: {{ score }}</p>
        <div class="game-area d-flex flex-wrap justify-content-center">
          <div v-for="i in 30" :key="i" class="square"
               :class="{ active: i === activeSquare }" @click="handleClick(i)">
          </div>
        </div>
      </div>

      <!-- Финальный экран -->
      <div v-if="gameEnded" class="end-message">
        <h3>Игра завершена!</h3>
        <p>Среднее время реакции: {{ time.toFixed(2) }} сек</p>
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
    const authStore = useAuthStore(); // Используем хранилище
    return { authStore };
  },
  data() {
    return {
      gameStarted: false,
      gameEnded: false,
      score: 0,
      time: 0,
      activeSquare: null,
      reactionTimes: [],
      startTime: null,
      gameInterval: null,
    };
  },
  computed: {
    formattedTime() {
      return `${Math.floor(this.time / 60).toString().padStart(2, "0")}:${(this.time % 60).toString().padStart(2, "0")}`;
    },
    accuracy() {
      return this.reactionTimes.length > 0 ? ((this.score / this.reactionTimes.length) * 100).toFixed(2) : 0;
    },
  },
  methods: {
    startGame() {
      this.gameStarted = true;
      this.gameEnded = false;
      this.score = 0;
      this.reactionTimes = [];
      this.startTime = performance.now();
      this.generateRandomSquare();
      this.gameInterval = setInterval(() => {
        this.time++;
        if (this.time >= 30) {
          this.endGame();
        }
      }, 1000);
    },
    generateRandomSquare() {
      this.activeSquare = Math.floor(Math.random() * 30) + 1;
    },
    handleClick(index) {
      if (index === this.activeSquare) {
        const reactionTime = (performance.now() - this.startTime) / 1000;
        this.reactionTimes.push(reactionTime);
        this.score++;
        this.generateRandomSquare();
      }
    },
    endGame() {
      clearInterval(this.gameInterval);
      this.gameStarted = false;
      this.gameEnded = true;
      this.time = this.reactionTimes.length > 0 ? this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length : 0;
      this.saveResults(); // Сохраняем результаты после завершения теста
    },
    restartGame() {
      this.startGame();
    },
    async saveResults() {
      if (!this.authStore.user) {
        alert("Пользователь не авторизован. Пожалуйста, войдите в систему.");
        return;
      }

      const testId = 5; // ID пятого теста
      const scorePercentage = this.accuracy; // Точность в процентах

      try {
        const response = await fetch("http://127.0.0.1:8000/api/result/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            test: testId, // Используем ID теста
            user: this.authStore.user.id, // ID пользователя
            score_percentage: parseFloat(scorePercentage), // Преобразуем в число
          }),
        });

        if (response.ok) {
          alert("Результаты успешно сохранены!");
        } else {
          const errorData = await response.json();
          alert(errorData.error || "Ошибка при сохранении результатов");
        }
      } catch (error) {
        console.error("Ошибка при отправке результатов:", error);
      }
    },
  },
};
</script>

<style scoped>
.container {
  text-align: center;
}
.game-area {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  margin-top: 20px;
}
.square {
  width: 50px;
  height: 50px;
  background-color: #f0f0f0;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}
.square.active {
  background-color: #007bff;
}
button {
  font-size: 18px;
  padding: 10px;
  cursor: pointer;
  margin: 10px;
}
</style>