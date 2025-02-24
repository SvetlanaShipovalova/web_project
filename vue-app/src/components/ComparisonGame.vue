<template>
    <Navbar />
    <div class="container mt-5 text-center">
      <h2>Тест №{{ $route.params.id }}</h2>
      <div id="app">
        <div v-if="!gameStarted">
          <h1>Игра "Сравнение объектов"</h1>
          <p>
            <strong>"Сравнение объектов"</strong> — это игра для развития произвольного внимания и концентрации.
          </p>
          <p>
            <strong>Цель игры:</strong> Сравнить два изображения и определить, совпадают ли они.
          </p>
          <p>
            Игра помогает тренировать внимание, увеличивать концентрацию и улучшать способность к быстрому анализу. Удачи!
          </p>
          <button class="start-button btn btn-primary" @click="startGame">Начать игру</button>
        </div>
  
        <div v-else-if="gameStarted">
                  <p>Оставшееся время: {{ formattedTime }}</p>
          <p>Жизни: {{ lives }}</p>
  
          <div class="game-area d-flex justify-content-center">
            <div class="image-container border p-3 mx-2">
              <div v-for="(symbol, index) in leftImage" :key="index" class="symbol">
                {{ symbol }}
              </div>
            </div>
            <div class="image-container border p-3 mx-2">
              <div v-for="(symbol, index) in rightImage" :key="index" class="symbol">
                {{ symbol }}
              </div>
            </div>
          </div>
  
          <p class="instruction">Совпадают ли изображения?</p>
  
          <div class="choices d-flex justify-content-center">
            <button class="choice-button btn btn-danger mx-2" @click="handleAnswer(false)">Нет</button>
            <button class="choice-button btn btn-success mx-2" @click="handleAnswer(true)">Да</button>
          </div>
  
          <p class="message" :class="{ correct: isCorrect, incorrect: !isCorrect }">{{ message }}</p>
        </div>
  
        <div v-if="gameEnded" class="end-message">
          <h3>Игра завершена!</h3>
          <p>Правильных ответов: {{ correctAnswers }} из {{ totalAnswers }}</p>
          <p>Точность: {{ accuracy }}%</p>
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
        gameStarted: false,
        gameEnded: false,
        time: 90,
        timer: null,
        lives: 3,
        round: 1,
        symbolsCount: 2,
        maxSymbolsCount: 6,
        leftImage: [],
        rightImage: [],
        imagesMatch: false,
        message: "",
        isCorrect: null,
        correctAnswers: 0,
        totalAnswers: 0,
        accuracy: 0,
        symbols: ["🔲", "⚫", "⬛", "▷", "▼", "▲", "▽", "🔘"],
      };
    },
    computed: {
      formattedTime() {
        const minutes = Math.floor(this.time / 60)
          .toString()
          .padStart(2, "0");
        const seconds = (this.time % 60).toString().padStart(2, "0");
        return `${minutes}:${seconds}`;
      },
    },
    methods: {
      startGame() {
        this.gameStarted = true;
        this.gameEnded = false;
        this.time = 90;
        this.lives = 3;
        this.correctAnswers = 0;
        this.totalAnswers = 0;
        this.accuracy = 0;
        this.symbolsCount = 2;
        this.message = "";
        this.generateImages();
        this.startTimer();
      },
      startTimer() {
        clearInterval(this.timer);
        this.timer = setInterval(() => {
          this.time--;
          if (this.time <= 0) {
            clearInterval(this.timer);
            this.endGame();
          }
        }, 1000);
      },
      generateImages() {
        const leftImage = Array.from({ length: this.symbolsCount }, () =>
          this.symbols[Math.floor(Math.random() * this.symbols.length)]
        );
        const rightImage = [...leftImage];
        
        this.imagesMatch = Math.random() < 0.7;
        if (!this.imagesMatch) {
          const randomIndex = Math.floor(Math.random() * rightImage.length);
          let randomSymbol;
          do {
            randomSymbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
          } while (randomSymbol === rightImage[randomIndex]);
          rightImage[randomIndex] = randomSymbol;
        }
  
        this.leftImage = leftImage;
        this.rightImage = rightImage;
      },
      handleAnswer(answer) {
        this.totalAnswers++;
        if (answer === this.imagesMatch) {
          this.message = "Правильно!";
          this.isCorrect = true;
          this.correctAnswers++;
        } else {
          this.message = "Неправильно!";
          this.isCorrect = false;
          this.lives--;
        }
        
        if (this.lives === 0 || this.time <= 0) {
          clearInterval(this.timer);
          this.accuracy = this.totalAnswers > 0 
            ? Math.round((this.correctAnswers / this.totalAnswers) * 100) 
            : 0;
          this.endGame();
        } else {
          if (this.correctAnswers % 3 === 0 && this.symbolsCount < this.maxSymbolsCount) {
            this.symbolsCount++;
          }
          setTimeout(() => {
            this.message = "";
            this.generateImages();
          }, 1000);
        }
      },
      endGame() {
        this.gameStarted = false;
        this.gameEnded = true;
      },
    },
  };
  </script>
  
  <style src="../assets/style.css"></style>  
  