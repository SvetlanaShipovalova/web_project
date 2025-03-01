<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <!-- Начальный экран -->
      <div v-if="!testStarted && !testFinished">
        <h1>Тест на избирательность внимания</h1>
        <p>
          Вы увидите перед собой <strong>10</strong> заданных чисел, а ниже таблицу из {{ number_total_numbers }} ячеек с трехзначными числами. 
          Ваша задача — как можно быстрее найти и выделить эти <strong>10 чисел</strong>.
        </p>
        <button class="start-button btn btn-primary" @click="startTest">Начать</button>
      </div>

      <!-- Игровой экран -->
      <div v-else-if="testStarted">
        <p>Оставшееся время: {{ formattedTime }}</p>
        <div>
          <h2>Заданные числа:</h2>
          <div class="numbers-row">
            <span v-for="(number, index) in targetNumbers" :key="index">{{ number }}</span>
          </div>
        </div>
        <div class="grid">
          <div
            v-for="(cell, index) in gridNumbers"
            :key="index"
            :class="getCellClass(index)"
            @click="toggleCell(index)"
          >
            {{ cell }}
          </div>
        </div>
        <button v-if="timeLeft > 0" @click="finishTest" class="btn btn-success mt-3">Готово</button>
      </div>

      <!-- Финальный экран -->
      <div v-if="testFinished" class="end-message">
        <h3>Тест завершен!</h3>
        <p>Время выполнения: {{ time }}</p>
        <p>Правильные ответы: {{ number_all_answers }} из {{ number_correct_answers }}</p>
        <p>Точность: {{ accuracy }}%</p>
      </div>
      <router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
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
      testStarted: false,
      testFinished: false,
      timeLeft: 90,
      timer: null,
      targetNumbers: [],
      gridNumbers: [],
      selectedIndexes: [],
      elapsedTime: 0,
      time: "00:00:00",
      number_all_answers: 0, // Количество правильных ответов пользователя
      number_correct_answers: 10, // Фиксированное количество заданных чисел
      number_total_numbers: 100, // Общее количество представленных чисел
      startTime: null,
    };
  },
  computed: {
    formattedTime() {
      const minutes = Math.floor(this.timeLeft / 60).toString().padStart(2, "0");
      const seconds = (this.timeLeft % 60).toString().padStart(2, "0");
      return `${minutes}:${seconds}`;
    },
  },
  methods: {
    formatTime(seconds) {
      const hours = Math.floor(seconds / 3600).toString().padStart(2, "0");
      const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
      const sec = (seconds % 60).toString().padStart(2, "0");
      return `${hours}:${minutes}:${sec}`;
    },
    startTest() {
      this.testStarted = true;
      this.testFinished = false;
      this.targetNumbers = this.generateRandomNumbers(this.number_correct_answers);
      this.gridNumbers = this.generateGridNumbers(this.number_total_numbers, this.targetNumbers);
      this.selectedIndexes = [];
      this.timeLeft = 90;
      this.startTime = Date.now();
      this.startTimer();
    },
    startTimer() {
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft -= 1;
        } else {
          clearInterval(this.timer);
          this.finishTest();
        }
      }, 1000);
    },
    generateRandomNumbers(count) {
      const numbers = new Set();
      while (numbers.size < count) {
        numbers.add(Math.floor(100 + Math.random() * 900));
      }
      return Array.from(numbers);
    },
    generateGridNumbers(gridCount, targetNumbers) {
      const gridNumbers = [...targetNumbers];
      while (gridNumbers.length < gridCount) {
        const randomNum = Math.floor(100 + Math.random() * 900);
        if (!gridNumbers.includes(randomNum)) {
          gridNumbers.push(randomNum);
        }
      }
      return gridNumbers.sort(() => Math.random() - 0.5);
    },
    toggleCell(index) {
      if (this.testFinished || this.timeLeft <= 0) return;
      const selectedIndex = this.selectedIndexes.indexOf(index);
      if (selectedIndex !== -1) {
        this.selectedIndexes.splice(selectedIndex, 1);
      } else {
        this.selectedIndexes.push(index);
      }
    },
    getCellClass(index) {
      if (this.testFinished) {
        const isCorrect = this.targetNumbers.includes(this.gridNumbers[index]);
        return this.selectedIndexes.includes(index) ? (isCorrect ? 'correct' : 'wrong') : '';
      }
      return this.selectedIndexes.includes(index) ? 'highlighted' : '';
    },
    finishTest() {
      this.testFinished = true;
      clearInterval(this.timer);
      this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
      this.time = this.formatTime(this.elapsedTime);
      this.number_all_answers = this.selectedIndexes.filter(index => this.targetNumbers.includes(this.gridNumbers[index])).length;
      this.accuracy = ((this.number_all_answers / this.number_correct_answers) * 100).toFixed(2);
      this.saveResults();
    },
    async saveResults() {
      if (!this.authStore.user) {
        alert("Пользователь не авторизован. Пожалуйста, войдите в систему.");
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/api/result/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            test: 18, // ID теста
            user: this.authStore.user.id,
            score_percentage: parseFloat(this.accuracy),
            time: this.time,
            number_all_answers: this.number_all_answers,
            number_correct_answers: this.number_correct_answers,
          }),
        });

        if (response.ok) {
          alert("Результаты успешно сохранены!");
        } else {
          const errorData = await response.json();
          console.error("Ошибка сервера:", errorData);
          alert(errorData.error || "Ошибка при сохранении результатов");
        }
      } catch (error) {
        console.error("Ошибка при отправке результатов:", error);
      }
    },
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
};
</script>
  
  <style scoped>
  .container {
    max-width: 700px;
  }
  .numbers-row {
    display: flex;
    justify-content: center;
    gap: 10px;
    font-size: 18px;
    font-weight: bold;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 5px;
    margin-top: 20px;
  }
  .grid div {
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f8f9fa;
    border: 1px solid #ddd;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    user-select: none;
  }
  .grid div.highlighted {
    background: #b0e0e6;
  }
  .grid div.correct {
    background: #98fb98;
  }
  .grid div.wrong {
    background: #f4cccc;
  }
  .end-message {
    margin-top: 20px;
  }
  </style>
  