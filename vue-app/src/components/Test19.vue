<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <div v-if="testFinished" class="result">
        <h2>Тест завершён!</h2>
        <p>Вы ответили правильно на {{ number_all_answers }} из {{ number_correct_answers }} вопросов</p>
        <p>Время выполнения теста: {{ time }}</p>
        <p>Точность: {{ accuracy.toFixed(2) }}%</p>
        <div class="controls mt-3">
          <button class="btn btn-success" @click="resetTest">Пройти снова</button>
        </div>
      </div>
      <div v-else>
        <div class="equation d-flex justify-content-center align-items-center gap-3">
          <span class="fs-4">{{ leftNumber }}</span>
          <button class="btn btn-primary" @click="checkAnswer(true)">=</button>
          <button class="btn btn-danger" @click="checkAnswer(false)">≠</button>
          <span class="fs-4">{{ rightNumber }}</span>
        </div>
        <p v-if="errorMessage" class="text-danger fw-bold">{{ errorMessage }}</p>
        <button class="btn btn-warning mt-3" @click="finishTest">Готово</button>
        <p>Оставшееся время: {{ formattedTime }}</p>
      </div>
      <div class="mt-4">
        <router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
      </div>
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
    leftNumber: 0,
    rightNumber: 0,
    startTime: 90, // Общее время теста (секунды)
    remainingTime: 90, // Таймер
    testFinished: false,
    number_all_answers: 0, // Сколько угадал (int4)
    number_correct_answers: 10, // Всего вопросов (int4)
    timer: null,
    elapsedTime: 0,
    accuracy: 0,
    time: "00:00:00", // Формат времени ЧЧ:ММ:СС
  };
},
computed: {
  formattedTime() {
    const minutes = Math.floor(this.remainingTime / 60).toString().padStart(2, "0");
    const seconds = (this.remainingTime % 60).toString().padStart(2, "0");
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
  generateNumbers() {
    this.leftNumber = Math.floor(Math.random() * 10000000);
    this.rightNumber = Math.random() < 0.5 ? this.leftNumber : this.leftNumber + Math.floor(Math.random() * 10) + 1;
  },
  checkAnswer(isEqual) {
    if ((this.leftNumber === this.rightNumber) === isEqual) {
      this.number_all_answers++; // Если правильно, увеличиваем число правильных ответов
    }
    this.generateNumbers();
  },
  startTimer() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.remainingTime--;
      if (this.remainingTime <= 0) {
        this.finishTest();
      }
    }, 1000);
  },
  finishTest() {
    clearInterval(this.timer);
    this.testFinished = true;
    this.elapsedTime = this.startTime - this.remainingTime;
    this.time = this.formatTime(this.elapsedTime); // Преобразуем в "00:00:00"
    this.accuracy = (this.number_all_answers / this.number_correct_answers) * 100;
    this.saveResults();
  },
  resetTest() {
    this.testFinished = false;
    this.number_all_answers = 0;
    this.remainingTime = this.startTime;
    this.elapsedTime = 0;
    this.accuracy = 0;
    this.time = "00:00:00";
    this.startTimer();
    this.generateNumbers();
  },
  async saveResults() {
    if (!this.authStore.user) {
      alert("Пользователь не авторизован. Войдите в систему.");
      return;
    }

    const testId = 19;
    const scorePercentage = parseFloat(this.accuracy);

    if (isNaN(scorePercentage)) {
      alert("Ошибка: некорректное значение точности.");
      return;
    }

    console.log("Отправляемые данные:", {
      test: testId,
      user: this.authStore.user.id,
      score_percentage: scorePercentage,
      time: this.time,
      number_all_answers: this.number_all_answers, // Сколько ответил правильно
      number_correct_answers: this.number_correct_answers, // Всего вопросов
    });

    try {
      const response = await fetch("http://127.0.0.1:8000/api/result/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          test: testId,
          user: this.authStore.user.id,
          score_percentage: scorePercentage,
          time: this.time, // Время в формате "00:00:00"
          number_all_answers: this.number_all_answers, // Сколько ответил правильно
          number_correct_answers: this.number_correct_answers, // Сколько всего вопросов
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
mounted() {
  this.generateNumbers();
  this.startTimer();
},
};
</script>

  <style scoped>
  .container {
    text-align: center;
  }
  .equation {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 24px;
  }
  button {
    font-size: 24px;
    padding: 10px;
    cursor: pointer;
  }
  .result {
    text-align: center;
  }
  .text-danger {
    color: red;
    font-weight: bold;
  }
  </style>
  