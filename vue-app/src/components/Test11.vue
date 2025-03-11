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
    </div>
  </div>
  <router-link to="/tests" class="btn btn-secondary mt-3">Назад к тестам</router-link>
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
      displayIndex: 0,
      timeLeft: 60, // Время выполнения теста в секундах
      timer: null,
    };
  },
  computed: {
    formattedTime() {
      const minutes = Math.floor(this.timeLeft / 60);
      const seconds = this.timeLeft % 60;
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    },
    accuracy() {
      return this.number_all_answers ? ((this.number_correct_answers / this.number_all_answers) * 100).toFixed(2) : 0;
    },
  },
  methods: {
    startTest() {
      this.testStarted = true;
      this.testFinished = false;
      this.generateNumbers();
      this.displayNextNumber();
      this.startTimer(); // Запускаем таймер при начале теста
    },
    generateNumbers() {
      // Генерируем 8 случайных чисел от 1 до 100
      this.numbers = Array.from({ length: 8 }, () => Math.floor(Math.random() * 100) + 1);
      this.userInputs = Array(8).fill(''); // Сброс массива ввода
      this.number_correct_answers = 0; // Сброс количества правильных ответов
      this.displayIndex = 0; // Сброс индекса отображаемого числа
      this.timeLeft = 60; // Сброс времени
    },
    displayNextNumber() {
      this.timer = setInterval(() => {
        if (this.displayIndex < this.numbers.length) {
          this.currentNumber = this.numbers[this.displayIndex];
          this.displayIndex++;
        } else {
          clearInterval(this.timer); // Останавливаем таймер, если все числа показаны
        }
      }, 2000);
    },
    startTimer() {
      const countdown = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          clearInterval(countdown);
          this.finishTest(); // Завершаем тест, если время вышло
        }
      }, 1000);
    },
    finishTest() {
      clearInterval(this.timer); // Останавливаем таймер
      this.calculateScore(); // Подсчет правильных ответов
      this.testFinished = true;
    },
    calculateScore() {
      this.number_correct_answers = this.userInputs.reduce((count, input, index) => {
        return count + (parseInt(input) === this.numbers[index] ? 1 : 0);
      }, 0); // Подсчет правильных ответов
      this.saveResults(); // Сохраняем результаты
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
