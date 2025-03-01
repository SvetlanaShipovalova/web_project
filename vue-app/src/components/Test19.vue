<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <!-- Экран начала теста -->
      <div v-if="!testStarted && !testFinished">
        <h1>🧠 Тест на математическую внимательность</h1>
        <p>В этом тесте вам будет показано два числа. Ваша задача — определить, равны ли они.</p>
        <p>Всего 20 вопросов. 60 секунд на прохождение.</p>
        <button class="btn btn-primary start-button" @click="startTest">Начать тест</button>
      </div>

      <!-- Игровой процесс -->
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

      <!-- Итоговые результаты -->
      <div v-if="testFinished" class="result">
        <h2>✅ Тест завершён!</h2>
        <p>Вы ответили правильно на {{ number_correct_answers }} из {{ number_all_answers }} вопросов</p>
        <p>⏳ Время выполнения: {{ time }}</p>
        <p>🎯 Точность: {{ accuracy.toFixed(2) }}%</p>
        <button class="btn btn-success mt-3" @click="resetTest">Пройти снова</button>
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
      startTime: 60, // Исходное время теста (секунды)
      remainingTime: 60, // Таймер обратного отсчета
      testStarted: false,
      testFinished: false,
      number_all_answers: 20, // Фиксированное количество вопросов
      number_correct_answers: 0, // Количество правильных ответов
      current_question: 0, // Счетчик текущего вопроса
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
      return `00:${minutes}:${seconds}`;
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
        this.number_correct_answers++; // Увеличиваем, если ответ верный
      }
      this.current_question++; // Увеличиваем счетчик вопросов
      if (this.current_question >= this.number_all_answers) {
        this.finishTest(); // Завершаем тест, если все вопросы отвечены
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
          this.finishTest(); // Завершаем тест, если время истекло
        }
      }, 1000);
    },
    finishTest() {
      clearInterval(this.timer);
      this.testFinished = true;
      this.elapsedTime = this.startTime - this.remainingTime;
      this.time = this.formatTime(this.elapsedTime); // Преобразуем в "00:00:00"
      this.accuracy = (this.number_correct_answers / this.number_all_answers) * 100; // Используем фиксированное число вопросов
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
        number_all_answers: this.number_all_answers, // Всего вопросов
        number_correct_answers: this.number_correct_answers, // Сколько правильно
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
            number_all_answers: this.number_all_answers, // Всего вопросов
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
