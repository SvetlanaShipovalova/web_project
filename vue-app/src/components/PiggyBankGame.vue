<template>
    <Navbar />
    <div class="container mt-5 text-center">
      <h2>Тест №{{ $route.params.id }}</h2>
      <div id="app">
        <!-- Начальный экран -->
        <div v-if="!gameStarted && !gameEnded">
          <h1>Игра "Копилка"</h1>
          <p>
            <strong>"Копилка"</strong> — игра на развитие скорости мышления и вычислительных навыков.
          </p>
          <p>
            <strong>Цель игры:</strong> определить, в какой из копилок больше денег.
            Если суммы равны, можно выбрать любую. С каждым раундом добавляются монеты номиналом "2".
          </p>
          <button class="start-button btn btn-primary" @click="startGame">Начать игру</button>
        </div>
  
        <!-- Игровой экран -->
        <div v-else-if="gameStarted">
          <p>Раунд: {{ currentRound }} / {{ totalRounds }}</p>
          <div class="game-area piggy-bank-game">
            <!-- Левая копилка -->
            <div class="piggy-bank border p-3 mx-2" @click="handleAnswer('left')">
              <div v-for="(coin, index) in leftBank" :key="'left-' + index" class="coin">
                {{ coin }}
              </div>
            </div>
            <!-- Правая копилка -->
            <div class="piggy-bank border p-3 mx-2" @click="handleAnswer('right')">
              <div v-for="(coin, index) in rightBank" :key="'right-' + index" class="coin">
                {{ coin }}
              </div>
            </div>
          </div>
          <p
            v-if="feedback"
            class="message"
            :class="{ correct: feedback === 'Правильно!', incorrect: feedback === 'Неправильно!' }"
          >
            {{ feedback }}
          </p>
        </div>
  
        <!-- Финальный экран -->
        <div v-if="gameEnded" class="end-message">
          <h3>Игра завершена!</h3>
          <p>Правильных ответов: {{ correctAnswers }} из {{ totalRounds }}</p>
          <p>Точность: {{ accuracy }}%</p>
          <p>Время: {{ time }} секунд</p>
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
        currentRound: 0,
        totalRounds: 20,
        correctAnswers: 0,
        feedback: "",
        leftBank: [],
        rightBank: [],
        maxValue: 1,
        accuracy: 0,
        time: 0,
        startTime: null
      };
    },
    methods: {
      startGame() {
        this.gameStarted = true;
        this.gameEnded = false;
        this.currentRound = 0;
        this.correctAnswers = 0;
        this.feedback = "";
        this.maxValue = 1;
        this.accuracy = 0;
        this.time = 0;
        this.startTime = new Date();
        this.generateRound();
      },
      generateRound() {
        const leftSize = Math.floor(Math.random() * 5) + 3;
        const rightSize = Math.floor(Math.random() * 5) + 3;
        this.leftBank = this.generateCoins(leftSize);
        this.rightBank = this.generateCoins(rightSize);
      },
      generateCoins(size) {
        const coins = [];
        for (let i = 0; i < size; i++) {
          coins.push(Math.random() < 0.5 ? 1 : this.maxValue);
        }
        return coins;
      },
      handleAnswer(choice) {
        const leftSum = this.leftBank.reduce((acc, coin) => acc + coin, 0);
        const rightSum = this.rightBank.reduce((acc, coin) => acc + coin, 0);
  
        if (
          (choice === "left" && leftSum >= rightSum) ||
          (choice === "right" && rightSum >= leftSum)
        ) {
          this.feedback = "Правильно!";
          this.correctAnswers++;
        } else {
          this.feedback = "Неправильно!";
        }
  
        this.currentRound++;
        if (this.currentRound > 10) {
          this.maxValue = 2;
        }
        if (this.currentRound < this.totalRounds) {
          setTimeout(() => {
            this.feedback = "";
            this.generateRound();
          }, 1500);
        } else {
          this.endGame();
        }
      },
      endGame() {
        this.gameStarted = false;
        this.gameEnded = true;
        this.accuracy = Math.round((this.correctAnswers / this.totalRounds) * 100);
        const endTime = new Date();
        this.time = ((endTime - this.startTime) / 1000).toFixed(2);
      }
    }
  };
  </script>
  
  <style src="../assets/style.css"></style>  