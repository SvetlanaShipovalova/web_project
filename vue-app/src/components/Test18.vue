<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>Тест на избирательность внимания</h2>
    <div id="app">
      <div v-if="!testStarted && !testFinished">
        <p><strong>"Тест на внимательность"</strong> — это игра для развития концентрации и зрительной памяти.</p>
        <p><strong>Цель игры:</strong> Найти 5 заданных чисел среди 48 плиток как можно быстрее. Сначала выберите число из 5 загаданных и потом выберите его среди 48 плиток, таким образом соберите все 5 пар чисел (загаданное и найденное)</p>
        <button class="btn btn-primary btn-lg" @click="startTest">Начать тест</button>
      </div>

      <div v-else-if="testStarted">
        <p class="h5">Оставшееся время: {{ formattedTime }}</p>
        <div class="row mb-4">
          <div
            v-for="(num, index) in targetNumbers"
            :key="index"
            class="col-2 border d-flex justify-content-center align-items-center p-3"
            @click="selectNumber(num)"
          >
            {{ num }}
          </div>
        </div>
        <div class="row mb-4">
          <div
            v-for="(num, index) in gridNumbers"
            :key="index"
            class="col-2 border d-flex justify-content-center align-items-center p-3"
            :class="{'bg-success': correctIndices.includes(index), 'bg-danger': incorrectIndices.includes(index)}"
            @click="placeNumber(num, index)"
          >
            {{ num }}
          </div>
        </div>
        <button v-if="errors < 5" class="btn btn-warning" @click="finishTestEarly">Завершить тест</button>
      </div>

      <div v-if="testFinished">
        <h3 class="display-5">Тест завершен!</h3>
        <p>⏳ Время выполнения: {{ formattedTimeSpent }}</p>
        <p>✅ Правильные ответы: {{ number_correct_answers }} из {{ number_all_answers }}</p>
        <p>🎯 Точность: {{ accuracy }}%</p>
      </div>
    </div>
    <router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
  </div>
</template>

<script>
import Navbar from "../view/Navbar.vue";
import { useAuthStore } from '../store/authStore';

export default {
  components: {
    Navbar,
  },
  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },
  data() {
    return {
      testStarted: false,
      testFinished: false,
      initialTime: 120, // Установлено время на 2 минуты (120 секунд)
      timeLeft: 120, // Установлено время на 2 минуты (120 секунд)
      time: 0, // Время выполнения
      timer: null,
      targetNumbers: [],
      gridNumbers: [],
      selectedNumber: null,
      correctIndices: [],
      incorrectIndices: [],
      errors: 0,
      number_all_answers: 5,
      number_correct_answers: 0,
    };
  },
  computed: {
    formattedTime() {
      const minutes = Math.floor(this.timeLeft / 60);
      const seconds = this.timeLeft % 60;
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    },
    formattedTimeSpent() {
      const minutes = Math.floor(this.time / 60);
      const seconds = this.time % 60;
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    },
    accuracy() {
      return ((this.number_correct_answers / this.number_all_answers) * 100).toFixed(2);
    },
  },
  methods: {
    startTest() {
      this.testStarted = true;
      this.testFinished = false;
      this.targetNumbers = this.generateRandomNumbers(this.number_all_answers);
      this.gridNumbers = this.generateGridNumbers(48, this.targetNumbers);
      this.resetTestState();
      this.startTimer();
    },
    resetTestState() {
      this.selectedNumber = null;
      this.correctIndices = [];
      this.incorrectIndices = [];
      this.errors = 0;
      this.timeLeft = this.initialTime;
      this.time = 0; // Обнуляем затраченное время
    },
    startTimer() {
      this.timer = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
          this.time = this.initialTime - this.timeLeft; // Записываем затраченное время
        } else {
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
    generateGridNumbers(totalCount, targetNumbers) {
      const numbers = [...targetNumbers];
      while (numbers.length < totalCount) {
        const randomNum = Math.floor(100 + Math.random() * 900);
        if (!numbers.includes(randomNum)) {
          numbers.push(randomNum);
        }
      }
      return numbers.sort(() => Math.random() - 0.5);
    },
    selectNumber(num) {
      this.selectedNumber = num;
    },
    placeNumber(num, index) {
      if (this.selectedNumber === null) {
        alert("Сначала выберите число из верхнего ряда!");
        return;
      }

      if (this.targetNumbers.includes(this.selectedNumber)) {
        if (num === this.selectedNumber && !this.correctIndices.includes(index)) {
          this.correctIndices.push(index);
          this.number_correct_answers++;
        }
        this.selectedNumber = null; // Сбрасываем выбранное число после проверки
      } else {
        if (!this.incorrectIndices.includes(index)) {
          this.incorrectIndices.push(index);
          this.errors++;
          if (this.errors >= 5) {
            this.finishTest();
          }
        }
      }
    },
    finishTest() {
      this.testFinished = true;
      clearInterval(this.timer);
      this.time = this.initialTime - this.timeLeft; // Фиксируем затраченное время
      this.saveResults();
    },
    finishTestEarly() {
      this.testFinished = true;
      clearInterval(this.timer);
      this.time = this.initialTime - this.timeLeft;
      this.saveResults();
    },
    async saveResults() {
      if (!this.authStore.user) {
        alert("Пользователь не авторизован. Войдите в систему.");
        return;
      }
      try {
        const response = await fetch("https://svetasy.pythonanywhere.com/api/result/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            test: 18,
            user: this.authStore.user.id,
            score_percentage: Math.round(this.accuracy),
            time: this.time, // Отправляем затраченное время в секундах
            number_all_answers: this.number_all_answers,
            number_correct_answers: this.number_correct_answers,
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
  beforeUnmount() {
    clearInterval(this.timer);
  },
};
</script>

<style scoped>
/* Можно добавить стили */
</style>