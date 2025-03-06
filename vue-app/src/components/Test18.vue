<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>Тест на внимательность</h2>
    <div id="app">
      <div v-if="!testStarted && !testFinished">
        <h1>Тест на внимательность</h1>
        <p>
          <strong>"Тест на внимательность"</strong> — это игра для развития концентрации и зрительной памяти.
        </p>
        <p>
          <strong>Цель игры:</strong> Найти 5 заданных чисел среди 48 плиток как можно быстрее.
        </p>
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
        <div v-else-if="testFinished">
        <h3 class="display-5">Тест завершен!</h3>
        <p>⏳ Время выполнения: {{ formattedTime }}</p>
        <p>✅ Правильные ответы: {{ number_correct_answers }} из {{ number_all_answers }}</p>
        <p>🎯 Точность: {{ accuracy }}%</p>
        <router-link to="/tests" class="btn btn-secondary mt-3">Назад к тестам</router-link>
      </div>
      </div>
    </div>
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
      timeLeft: 60,
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
      this.timeLeft = 60; // Сброс времени
    },
    startTimer() {
      this.timer = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          this.finishTest(); // Завершение теста при истечении времени
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
        const randomNum = Math.floor(100         + Math.random() * 900);
        if (!numbers.includes(randomNum)) {
          numbers.push(randomNum);
        }
      }
      return numbers.sort(() => Math.random() - 0.5);
    },
    selectNumber(num) {
      // Устанавливаем выбранное число
      this.selectedNumber = num;
    },
    placeNumber(num, index) {
      if (this.selectedNumber === num) {
        // Если выбранное число совпадает с нажимаемой плиткой
        this.correctIndices.push(index);
        this.number_correct_answers++;
        this.selectedNumber = null; // Сбрасываем выбранное число
      } else {
        // Если выбрали неверное число
        this.incorrectIndices.push(index);
        this.errors++;
        if (this.errors >= 5) {
          this.finishTest(); // Завершаем тест, если ошибки больше 5
        }
      }
    },
    finishTest() {
      this.testFinished = true;
      clearInterval(this.timer); // Останавливаем таймер
      this.saveResults(); // Сохраняем результаты
    },
    finishTestEarly() {
      this.testFinished = true;
      clearInterval(this.timer); // Останавливаем таймер
      this.saveResults(); // Сохраняем результаты
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
            test: 18, // ID теста
            user: this.authStore.user.id,
            score_percentage: Math.round(this.accuracy),
            time: this.formattedTime, // Время выполнения
            number_all_answers: this.number_all_answers, // Всегда 5
            number_correct_answers: this.number_correct_answers, // Сколько правильно
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
  beforeUnmount() {
    clearInterval(this.timer); // Останавливаем таймер при размонтировании компонента
  },
};
</script>

<style scoped>
/* Здесь можно добавить стили, если потребуется */
</style>

