<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <div v-if="!testStarted && !testFinished">
        <h1>🧠 Тест на математическую внимательность</h1>
        <p>В этом тесте вам будет показано два числа. Ваша задача — определить, равны ли они.</p>
        <p>Всего 20 вопросов. 60 секунд на прохождение.</p>
        <button class="btn btn-primary start-button" @click="startTest">Начать тест</button>
      </div>
      
      <div v-else-if="testStarted && !testFinished">
        <h2>Вопрос {{ current_question + 1 }} из {{ number_all_answers }}</h2>
        <p>⏳ Оставшееся время: {{ formattedTime }}</p>
        <div class="equation d-flex justify-content-center align-items-center gap-3">
          <span class="fs-4">{{ leftNumber }}</span>
          <button class="btn btn-primary" @click="checkAnswer(true)">=</button>
          <button class="btn btn-danger" @click="checkAnswer(false)">≠</button>
          <span class="fs-4">{{ rightNumber }}</span>
        </div>
      </div>
      
      <div v-else-if="testFinished">
        <h2>✅ Тест завершён!</h2>
        <p>Вы ответили правильно на {{ number_correct_answers }} из {{ number_all_answers }} вопросов</p>
        <p>⏳ Время выполнения: {{ time }}</p>
        <p>🎯 Точность: {{ accuracy.toFixed(2) }}%</p>
        <button class="btn btn-success mt-3" @click="resetTest">Пройти снова</button>
      </div>
      
      <div class="mt-4">
      </div>
    </div>
    <router-link to="/tests" class="btn btn-secondary mt-3">Назад к тестам</router-link>
  </div>
</template>

<script>
import Navbar from "../view/Navbar.vue";
import { useAuthStore } from "../store/authStore";

export default {
  components: { Navbar },
  setup() {
    return { authStore: useAuthStore() };
  },
  data() {
    return {
      leftNumber: 0,
      rightNumber: 0,
      startTime: 60,
      remainingTime: 60,
      testStarted: false,
      testFinished: false,
      number_all_answers: 20,
      number_correct_answers: 0,
      current_question: 0,
      timer: null,
      elapsedTime: 0,
      accuracy: 0,
      time: "00:00:00"
    };
  },
  computed: {
    formattedTime() {
      const minutes = Math.floor(this.remainingTime / 60).toString().padStart(2, "0");
      const seconds = (this.remainingTime % 60).toString().padStart(2, "0");
      return `00:${minutes}:${seconds}`;
    }
  },
  methods: {
    formatTime(seconds) {
      const hours = Math.floor(seconds / 3600).toString().padStart(2, "0");
      const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
      const secs = (seconds % 60).toString().padStart(2, "0");
      return `${hours}:${minutes}:${secs}`;
    },
    generateNumbers() {
      this.leftNumber = Math.floor(Math.random() * 1e7);
      this.rightNumber = Math.random() < 0.5 ? this.leftNumber : this.leftNumber + Math.floor(Math.random() * 10) + 1;
    },
    checkAnswer(isEqual) {
      if ((this.leftNumber === this.rightNumber) === isEqual) {
        this.number_correct_answers++;
      }
      this.current_question++;
      if (this.current_question >= this.number_all_answers) {
        this.finishTest();
      } else {
        this.generateNumbers();
      }
    },
    startTest() {
      this.testStarted = true;
      this.testFinished = false;
      this.number_correct_answers = 0;
      this.current_question = 0;
      this.remainingTime = this.startTime;
      this.elapsedTime = 0;
      this.startTimer();
      this.generateNumbers();
    },
    startTimer() {
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        if (this.remainingTime > 0) {
          this.remainingTime--;
        } else {
          this.finishTest();
        }
      }, 1000);
    },
    finishTest() {
      clearInterval(this.timer);
      this.testFinished = true;
      this.elapsedTime = this.startTime - this.remainingTime;
      this.time = this.formatTime(this.elapsedTime);
      this.accuracy = (this.number_correct_answers / this.number_all_answers) * 100;
      this.saveResults();
    },
    resetTest() {
      this.testStarted = false;
      this.testFinished = false;
      this.number_correct_answers = 0;
      this.current_question = 0;
      this.remainingTime = this.startTime;
      this.elapsedTime = 0;
      this.accuracy = 0;
      this.time = "00:00:00";
    },
    async saveResults() {
      if (!this.authStore.user) {
        alert("Пользователь не авторизован. Войдите в систему.");
        return;
      }
      const testId = 15;
      const scorePercentage = parseFloat(this.accuracy);
      if (isNaN(scorePercentage)) {
        alert("Ошибка: некорректное значение точности.");
        return;
      }
      try {
        const response = await fetch("https://svetasy.pythonanywhere.com/api/result/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            test: testId,
            user: this.authStore.user.id,
            score_percentage: Math.round(scorePercentage),
            time: this.time,
            number_all_answers: this.number_all_answers,
            number_correct_answers: this.number_correct_answers
          })
        });
        if (response.ok) {
          alert("Результаты успешно сохранены!");
        } else {
          const error = await response.json();
          alert(error.error || "Ошибка при сохранении результатов");
        }
      } catch (error) {
        console.error("Ошибка при отправке результатов:", error);
      }
    }
  }
};
</script>

<style scoped>
.container {
  text-align: center;
}
.start-button {
  margin-top: 20px;
}
.equation {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  font-size: 1.5rem;
}
</style>
