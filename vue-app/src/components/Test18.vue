<template>
    <Navbar />
    <div class="container mt-5 text-center">
      <h2>{{ $route.params.name }}</h2>
      <div id="app">
        <!-- Начальный экран -->
        <div v-if="!testStarted && !testFinished">
          <h1>Тест на избирательность внимания</h1>
          <p>
            Вы увидите перед собой список из 10 трехзначных чисел, а ниже таблицу из 100 ячеек с трехзначными числами. 
            Ваша задача — как можно быстрее найти и выделить эти 10 чисел.
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
          <p>Время выполнения: {{ elapsedTime }} секунд</p>
          <p>Точность: {{ accuracy }}%</p>
        </div>
        <router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
      </div>
    </div>
  </template>

<script>
import Navbar from "../view/Navbar.vue";
import { useAuthStore } from '../store/authStore'; // Импортируем authStore
export default {
  components: { Navbar },
  setup() {
    const authStore = useAuthStore(); // Используем хранилище
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
      accuracy: 0,
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
    startTest() {
      this.testStarted = true;
      this.testFinished = false;
      this.targetNumbers = this.generateRandomNumbers(10);
      this.gridNumbers = this.generateGridNumbers(100, this.targetNumbers);
      this.selectedIndexes = [];
      this.timeLeft = 90;
      this.startTime = new Date();
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
      this.elapsedTime = 90 - this.timeLeft;
      const correctSelections = this.selectedIndexes.filter(index => this.targetNumbers.includes(this.gridNumbers[index])).length;
      this.accuracy = correctSelections * 10;
      this.saveResults(); // Сохраняем результаты
    },
    async saveResults() {
      if (!this.authStore.user) {
        alert("Пользователь не авторизован. Пожалуйста, войдите в систему.");
        return;
      }

      const testId = 18; // ID восемнадцатого теста
      const scorePercentage = parseFloat(this.accuracy); // Точность в процентах

      // Проверка данных
      if (isNaN(scorePercentage)) {
        alert("Ошибка: некорректное значение точности.");
        return;
      }

      // Логирование данных
      console.log("Отправляемые данные:", {
        test: testId,
        user: this.authStore.user.id,
        score_percentage: scorePercentage,
      });

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
            score_percentage: scorePercentage, // Точность в процентах
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
  