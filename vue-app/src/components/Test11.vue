<template> 
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>Тест 11</h2>
    <div id="app">
      <!-- Начальный экран -->
      <div v-if="!gameStarted && !gameEnded">
        <h1>Тест на внимательность</h1>
        <p>
          <strong>Игра:</strong> "Тест на внимательность" — это игра для развития концентрации и скорости восприятия.
        </p>
        <p>
          <strong>Цель игры:</strong> Среди множества чисел "44" найдите одно число "45" и нажмите на него как можно быстрее.
        </p>
        <button class="start-button btn btn-primary" @click="startGame">Начать игру</button>
      </div>

      <!-- Игровой экран -->
      <div v-else-if="gameStarted">
        <p>Время: {{ time }}</p>
        <p>Раунд: {{ currentRound }} / {{ number_all_answers }}</p>
        <p>Правильные ответы: {{ number_correct_answers }} / {{ number_all_answers }}</p>
        <div class="game-area d-flex flex-wrap justify-content-center">
          <div v-for="(num, index) in grid" :key="index" 
               class="number-cell" 
               @click="handleClick(num)">{{ num }}</div>
        </div>
      </div>

      <!-- Финальный экран -->
      <div v-if="gameEnded" class="end-message">
        <h3>Игра завершена!</h3>
        <p>Время: {{ time }}</p>
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
export default {
  components: { Navbar },
  data() {
    return {
      gameStarted: false,
      gameEnded: false,
      number_all_answers: 10,
      number_correct_answers: 0,
      time: "00:00:00",
      currentRound: 0,
      startTime: null,
      elapsedTime: 0,
      grid: [],
      timerInterval: null,
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
      this.number_correct_answers = 0;
      this.currentRound = 0;
      this.elapsedTime = 0;
      this.time = "00:00:00";
      this.startTimer();
      this.nextRound();
    },
    startTimer() {
      this.startTime = performance.now();
      this.timerInterval = setInterval(() => {
        const totalSeconds = Math.floor((performance.now() - this.startTime) / 1000);
        this.time = new Date(totalSeconds * 1000).toISOString().substr(11, 8);
      }, 1000);
    },
    stopTimer() {
      clearInterval(this.timerInterval);
    },
    nextRound() {
      if (this.currentRound >= this.number_all_answers) {
        this.endGame();
        return;
      }
      this.currentRound++;
      this.generateGrid();
    },
    generateGrid() {
      this.grid = Array(300).fill(44);
      const randomIndex = Math.floor(Math.random() * 300);
      this.grid[randomIndex] = 45;
    },
    handleClick(num) {
      if (num === 45) {
        this.number_correct_answers++;
      }
      this.nextRound();
    },
    endGame() {
      this.stopTimer();
      this.gameStarted = false;
      this.gameEnded = true;
      this.saveResults();
    },
    restartGame() {
      this.stopTimer();
      this.startGame();
    },
    async saveResults() {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/result/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            test: 2,
            score_percentage: parseInt(this.accuracy, 10),
            time: this.time,
            number_all_answers: this.number_all_answers,
            number_correct_answers: this.number_correct_answers,
            accuracy: parseInt(this.accuracy, 10),
          }),
        });
        if (response.ok) {
          alert("Результаты успешно сохранены!");
        } else {
          alert("Ошибка при сохранении результатов");
        }
      } catch (error) {
        alert("Ошибка соединения с сервером");
      }
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
  grid-template-columns: repeat(20, 30px);
  gap: 5px;
  margin-top: 20px;
  justify-content: center;
}

.number-cell {
  width: 30px;
  height: 30px;
  background-color: black;
  color: yellow;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  border-radius: 3px;
}
</style>
