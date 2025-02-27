<template>
    <Navbar />
    <div class="container mt-5 text-center">
      <h2>{{ $route.params.name }}</h2>
      <div id="app">
        <div v-if="testFinished" class="result">
          <h2>Тест завершён!</h2>
          <p>Вы ответили правильно на {{ correctAnswers }} из {{ totalQuestions }} вопросов</p>
          <p>Время выполнения теста: {{ elapsedTime }} сек</p>
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
  
  <script setup>
  import Navbar from "../view/Navbar.vue";
  </script>
  
  <script>
  export default {
    data() {
      return {
        leftNumber: 0,
        rightNumber: 0,
        startTime: 90,
        remainingTime: 90,
        testFinished: false,
        correctAnswers: 0,
        totalQuestions: 0,
        timer: null,
        elapsedTime: 0,
        accuracy: 0,
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
      generateNumbers() {
        this.leftNumber = Math.floor(Math.random() * 10000000);
        this.rightNumber = Math.random() < 0.5 ? this.leftNumber : this.leftNumber + Math.floor(Math.random() * 10) + 1;
      },
      checkAnswer(isEqual) {
        if ((this.leftNumber === this.rightNumber) === isEqual) {
          this.correctAnswers++;
        }
        this.totalQuestions++;
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
        this.accuracy = this.totalQuestions > 0 ? (this.correctAnswers / this.totalQuestions) * 100 : 0;
      },
      resetTest() {
        this.testFinished = false;
        this.correctAnswers = 0;
        this.totalQuestions = 0;
        this.remainingTime = this.startTime;
        this.elapsedTime = 0;
        this.accuracy = 0;
        this.startTimer();
        this.generateNumbers();
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
  