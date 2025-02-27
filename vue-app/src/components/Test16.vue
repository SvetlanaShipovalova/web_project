<template>
  <Navbar />
  <div class="container mt-5 text-center">
  <h2>{{ $route.params.name }}</h2>
    <div class="color-blindness-test">
      <h1>Тест на цветовое зрение</h1>
      
      <!-- Начальный экран -->
      <div v-if="!testStarted && !testCompleted">
        <p>Ваша задача: выбрать правильное число, которое вы видите на изображении.</p>
        <button class="start-button btn btn-primary" @click="startTest">Начать тест</button>
      </div>
      
      <!-- Экран прохождения теста -->
      <div v-else-if="testStarted && !testCompleted">
        <p>Вопрос {{ currentQuestionIndex + 1 }} из {{ questions.length }}</p>
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
      
      <!-- Финальный экран -->
      <div v-if="testCompleted">
        <p>Ваш результат: {{ score }} из {{ questions.length }}</p>
        <p>Точность: {{ accuracy }}%</p>
        <p>Время выполнения: {{ time }} секунд</p>
        <button class="btn btn-secondary" @click="resetTest">Пройти заново</button>
      </div>
      <router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
    </div>
  </div>
</template>

<script setup>
import Navbar from "../view/Navbar.vue";
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
</script>

<script>
export default {
  data() {
    return {
      testStarted: false,
      testCompleted: false,
      score: 0,
      currentQuestionIndex: 0,
      startTime: null,
      time: 0,
      accuracy: 0,
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
  },
  methods: {
    startTest() {
      this.testStarted = true;
      this.testCompleted = false;
      this.score = 0;
      this.currentQuestionIndex = 0;
      this.startTime = Date.now();
      this.accuracy = 0;
    },
    checkAnswer(option) {
      if (option === this.currentQuestion.correctAnswer) {
        this.score++;
      }
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
      } else {
        this.testCompleted = true;
        this.time = ((Date.now() - this.startTime) / 1000).toFixed(2);
        this.accuracy = ((this.score / this.questions.length) * 100).toFixed(2);
      }
    },
    resetTest() {
      this.testStarted = false;
      this.testCompleted = false;
      this.time = 0;
      this.accuracy = 0;
    },
  },
};
</script>
<style src="../assets/style.css"></style>