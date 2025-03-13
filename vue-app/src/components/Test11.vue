<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>Тест на оперативную память</h2>
    
    <div v-if="!testStarted && !testFinished">
      <h3 class="display-4">Запишите числа!</h3>
      <p class="lead">Цель игры: Запомнить и правильно записать предложенные числа.</p>
      <p>
        Вам будет показано 8 чисел поочередно.<br>
        Каждое число будет отображаться на экране на короткое время 3 секунды.<br>
        После демонстрации всех чисел, введите их в поля ниже.<br>
        Если вы видите двузначное число, пожалуйста, вводите его цифры последовательно.<br>
        Чем больше правильных ответов, тем выше точность!
      </p>
      <button class="btn btn-primary btn-lg" @click="startTest">Начать</button>
    </div>

    <div v-if="testStarted && !testFinished">
      <div class="mt-4">
        <h4>Следующее число: {{ currentNumber }}</h4>
      </div>
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>Число</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(num, index) in numbers" :key="index">
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
      <button class="btn btn-danger mt-3" @click="finishTest">Завершить тест</button>
    </div>

    <div v-if="testFinished">
      <h3 class="display-5">Тест завершен!</h3>
      <p>⏳ Время выполнения: {{ formattedTimeSpent }}</p>
      <p>✅ Правильные ответы: {{ number_correct_answers }} из {{ number_all_answers }}</p>
      <p>🎯 Точность: {{ accuracy }}%</p>
      <button class="btn btn-secondary mt-3" @click="resetTest">Пройти тест снова</button>
    </div>
    <br>
    <router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
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
      numbers: [],
      currentNumber: null,
      userInputs: Array(8).fill(''),
      number_all_answers: 8,
      number_correct_answers: 0,
      displayIndex: 0,
      timeLeft: 60,
      timer: null,
      countdown: null,
      startTime: null,
      timeSpent: 0
    };
  },
  computed: {
    formattedTimeSpent() {
      const minutes = Math.floor(this.timeSpent / 60);
      const seconds = this.timeSpent % 60;
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
      this.startTime = Date.now(); // Запоминаем время начала теста
      this.startTimer();
    },
    generateNumbers() {
      this.numbers = Array.from({ length: 8 }, () => Math.floor(Math.random() * 100) + 1);
      this.userInputs = Array(8).fill('');
      this.number_correct_answers = 0;
      this.displayIndex = 0;
      this.timeLeft = 60;
    },
    displayNextNumber() {
      this.timer = setInterval(() => {
        if (this.displayIndex < this.numbers.length) {
          this.currentNumber = this.numbers[this.displayIndex];
          this.displayIndex++;
        } else {
          clearInterval(this.timer);
          this.finishTest(); // Завершаем тест, если все числа показаны
        }
      }, 2000);
    },
    startTimer() {
      this.countdown = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          clearInterval(this.countdown);
          if (!this.testFinished) this.finishTest(); // Завершаем тест, если время вышло
        }
      }, 1000);
    },
    finishTest() {
      clearInterval(this.timer);
      clearInterval(this.countdown);
      this.timeSpent = Math.floor((Date.now() - this.startTime) / 1000); // Считаем затраченное время
      this.calculateScore();
      this.testFinished = true;
      this.$forceUpdate();
    },
    calculateScore() {
      this.number_correct_answers = this.userInputs.reduce((count, input, index) => {
        return count + (Number(input) === Number(this.numbers[index]) ? 1 : 0);
      }, 0);
      this.saveResults();
    },
    async saveResults() {
      if (!localStorage.getItem("token")) {
        alert("Ошибка: Пользователь не авторизован.");
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
            test: 11,
            user: this.authStore.user.id,
            score_percentage: Math.round(this.accuracy),
            time: this.timeSpent,
            number_all_answers: this.number_all_answers,
            number_correct_answers: this.number_correct_answers,
          }),
        });

        if (response.ok) {
          console.log("Результаты успешно сохранены!");
        } else {
          const errorData = await response.json();
          console.error("Ошибка сервера:", errorData);
          alert("Ошибка при сохранении результатов: " + (errorData.error || "Неизвестная ошибка"));
        }
      } catch (error) {
        console.error("Ошибка при отправке результатов:", error);
        alert("Ошибка при отправке результатов. Проверьте подключение к интернету.");
      }
    },
    resetTest() {
      this.testStarted = false;
      this.testFinished = false;
      this.displayIndex = 0;
      this.number_correct_answers = 0;
      this.userInputs = Array(8).fill('');
      this.timeLeft = 60;
      this.currentNumber = null;
      this.timeSpent = 0;
      clearInterval(this.timer);
      clearInterval(this.countdown);
    },
  },
  beforeUnmount() {
    clearInterval(this.timer);
    clearInterval(this.countdown);
  },
};
</script>