<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <div class="color-blindness-test">
      <h2>{{ $route.params.name }}</h2>

      <div v-if="!testStarted && !testCompleted">
        <p>Ваша задача: выбрать правильное число, которое вы видите на изображении.</p>
        <button class="start-button btn btn-primary" @click="startTest">Начать тест</button>
      </div>

      <div v-else-if="testStarted && !testCompleted">
        <p>Вопрос {{ currentQuestionIndex + 1 }} из {{ number_all_answers }}</p>
        <img :src="currentQuestion.image" alt="Тест на цветовое зрение" />
        <div class="answers">
          <button
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            class="btn btn-outline-primary mx-1"
            @click="checkAnswer(option)"
          >
            {{ option }}
          </button>
        </div>
      </div>

      <div v-if="testCompleted">
        <p>Ваш результат: {{ number_correct_answers }} из {{ number_all_answers }}</p>
        <p>Точность: {{ accuracy }}%</p>
        <p>Время выполнения: {{ time }}</p>
        <button class="btn btn-secondary" @click="resetTest">Пройти заново</button>
      </div>
      <router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
    </div>
  </div>
</template>

<script>
import Navbar from "../view/Navbar.vue";
import { useAuthStore } from '../store/authStore'; // Импортируем authStore
import triangleCircle from '../assets/test_res/triangleCircle.png';
import img96 from '../assets/test_res/96.png';
import img13 from '../assets/test_res/13.png';
import img95 from '../assets/test_res/95.png';
import triangleCircle3 from '../assets/test_res/triangleCircle(3).png';
import img9 from '../assets/test_res/9.png';
import img132 from '../assets/test_res/13(2).png';
import img66 from '../assets/test_res/66.png';
import triangleCircle2 from '../assets/test_res/triangleCircle(2).png';
import img962 from '../assets/test_res/96(2).png';
import triangleCircle5 from '../assets/test_res/triangleCircle(5).png';
import img36 from '../assets/test_res/36.png';
import img136 from '../assets/test_res/136.png';
import triangleCircle4 from '../assets/test_res/triangleCircle(4).png';
import img30 from '../assets/test_res/30.png';
import img92 from '../assets/test_res/9(2).png';

export default {
  components: { Navbar },
  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },
  data() {
    return {
      testStarted: false,
      testCompleted: false,
      number_correct_answers: 0, // Количество правильных ответов
      number_all_answers: 0, // Всего вопросов
      currentQuestionIndex: 0,
      startTime: null,
      timeElapsed: 0,
      time: "00:00:00", // Форматированное время
      timer: null,
      questions: [
        {
          image: triangleCircle,
          correctAnswer: "Треугольник и круг",
          options: ["Треугольник", "Треугольник и круг", "Круг", "Ничего"],
        },
        {
          image: img96,
          correctAnswer: "96",
          options: ["6", "Ничего", "9", "96"],
        },
        {
          image: img13,
          correctAnswer: "13",
          options: ["9", "1", "13", "5"],
        },
        {
          image: img95,
          correctAnswer: "95",
          options: ["95", "Ничего", "9", "5"],
        },
        {
          image: triangleCircle3,
          correctAnswer: "Треугольник и круг",
          options: ["Ничего", "Круг", "Треугольник", "Треугольник и круг"],
        },
        {
          image: img9,
          correctAnswer: "9",
          options: ["6", "8", "9", "Ничего"],
        },
        {
          image: img132,
          correctAnswer: "13",
          options: ["1", "13", "Ничего", "3"],
        },
        {
          image: img66,
          correctAnswer: "66",
          options: ["9", "66", "6", "Ничего"],
        },
        {
          image: triangleCircle2,
          correctAnswer: "Треугольник и круг",
          options: ["Ничего", "Круг", "Треугольник", "Треугольник и круг"],
        },
        {
          image: img962,
          correctAnswer: "96",
          options: ["96", "Ничего", "9", "6"],
        },
        {
          image: triangleCircle5,
          correctAnswer: "Треугольник и круг",
          options: ["Ничего", "Треугольник", "Круг", "Треугольник и круг"],
        },
        {
          image: img36,
          correctAnswer: "36",
          options: ["3", "6", "Ничего", "36"],
        },
        {
          image: img136,
          correctAnswer: "136",
          options: ["136", "66", "68", "69"],
        },
        {
          image: triangleCircle4,
          correctAnswer: "Треугольник и круг",
          options: ["Треугольник и квадрат", "Треугольник и круг", "Два треугольника и квадрат", "Ничего"],
        },
        {
          image: img962,
          correctAnswer: "96",
          options: ["Ничего", "6", "9", "96"],
        },
        {
          image: img30,
          correctAnswer: "30",
          options: ["6", "10", "30", "Ничего"],
        },
        {
          image: img92,
          correctAnswer: "9",
          options: ["0", "9", "Ничего", "2"],
        },
      ],
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentQuestionIndex];
    },
    accuracy() {
      return this.number_all_answers > 0
        ? ((this.number_correct_answers / this.number_all_answers) * 100).toFixed(2)
        : "0.00";
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
      this.testCompleted = false;
      this.number_correct_answers = 0;
      this.number_all_answers = this.questions.length;
      this.currentQuestionIndex = 0;
      this.timeElapsed = 0;
      this.startTime = Date.now();
      this.startTimer();
    },
    startTimer() {
      this.timer = setInterval(() => {
        this.timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
      }, 1000);
    },
    checkAnswer(option) {
      if (option === this.currentQuestion.correctAnswer) {
        this.number_correct_answers++;
      }
      if (this.currentQuestionIndex < this.number_all_answers - 1) {
        this.currentQuestionIndex++;
      } else {
        this.endTest();
      }
    },
    endTest() {
      clearInterval(this.timer);
      this.testCompleted = true;
      this.time = this.formatTime(this.timeElapsed);
      this.saveResults();
    },
    resetTest() {
      this.testStarted = false;
      this.testCompleted = false;
      this.timeElapsed = 0;
      this.time = "00:00:00";
      clearInterval(this.timer);
    },
    async saveResults() {
      if (!this.authStore.user) {
        alert("Пользователь не авторизован. Войдите в систему.");
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
            test: 16, // ID теста
            user: this.authStore.user.id,
            score_percentage: parseFloat(this.accuracy),
            time_spent: this.time, // Сохраняем итоговое время
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

<style src="../assets/style.css"></style>
