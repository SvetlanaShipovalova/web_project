<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>Тест на внимательность</h2>
    
    <div v-if="!testStarted && !testFinished">
      <h1 class="display-4">Запишите числа!</h1>
      <button class="btn btn-primary btn-lg" @click="startTest">Начать</button>
    </div>

    <div v-else-if="testStarted">
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>Число</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(index) in numbers" :key="index">
            <td>
              <input
                type="text"
                class="form-control"
                v-model="userInputs[index]"
                placeholder="Введите число"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div class="mt-4">
        <h4>Следующее число: {{ currentNumber }}</h4>
      </div>
      <button class="btn btn-danger mt-3" @click="finishTest">Завершить тест</button>
    </div>

    <div v-else>
      <h3 class="display-5">Тест завершен!</h3>
      <p>⏳ Время выполнения: {{ formattedTime }}</p>
      <p>✅ Правильные ответы: {{ number_correct_answers }} из {{ number_all_answers }}</p>
      <p>🎯 Точность: {{ accuracy }}%</p>
      <button class="btn btn-secondary mt-3" @click="resetTest">Пройти тест снова</button>
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
      numbers: [],
      currentNumber: null,
      userInputs: Array(8).fill(''), // Массив для ввода пользователем
      number_all_answers: 8, // Всегда 8
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
      return this.number_all_answers > 0 ? ((this.number_correct_answers / this.number_all_answers) * 100).toFixed(2) : 0;
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
        const response = await fetch("https://svetasy.pythonanywhere.com/api/result/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            test: 11,
            user: this.authStore.user.id,
            score_percentage: Math.round(this.accuracy),
            time: this.formattedTime, // Время выполнения
            number_all_answers: this.number_all_answers, // Всегда 8
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
    resetTest() {
      this.testStarted = false;
      this.testFinished = false;
      this.displayIndex = 0;
      this.number_correct_answers = 0;
      this.userInputs = Array(8).fill(''); // Сброс массива ввода
      this.timeLeft = 60; // Сброс времени
      this.currentNumber = null; // Сброс текущего числа
    },
  },
  beforeUnmount() {
    clearInterval(this.timer); // Останавливаем таймер при размонтировании компонента
  },
};
</script>

<style scoped>
/* Стили не используются, но можно добавить дополнительные стили, если потребуется */
</style>
