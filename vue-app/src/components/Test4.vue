<template>
    <Navbar />
    <div class="container mt-5 text-center">
      <h2>Тест №{{ $route.params.id }}</h2>
      <div id="app">
        <div v-if="currentView === 'start'">
          <h1>Игра "Тест на память"</h1>
          <p>
            <strong>"Тест на память"</strong> — это игра на развитие внимания и концентрации.
          </p>
          <p>
            <strong>Цель:</strong> Найдите все пары за 60 секунд.
          </p>
          <button class="btn btn-primary" @click="startGame">Начать игру</button>
        </div>
  
        <div v-else-if="currentView === 'test'">
          <p>Оставшееся время: {{ formattedTime }}</p>
          <div class="cards-container d-flex flex-wrap justify-content-center">
            <div v-for="(card, index) in cards" :key="index" class="card" 
                 :class="{'flipped': card.flipped || card.matched, 'matched': card.matched}" 
                 @click="flipCard(card, index)">
              <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-back">
                  <span>{{ card.value }}</span>
                </div>
              </div>
            </div>
          </div>
          <button class="btn btn-danger mt-3" @click="endGame">Завершить тест</button>
        </div>
  
        <div v-else-if="currentView === 'result'">
          <h3>Результаты</h3>
          <p>Время выполнения: {{ elapsedTime }} секунд.</p>
          <p>Точность: {{ accuracy }}%</p>
          <div class="controls">
            <button class="btn btn-success" @click="restartGame">Начать заново</button>
            <router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
          </div>
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
        currentView: 'start',
        cards: [],
        flippedCards: [],
        matchedCards: [],
        gameStarted: false,
        remainingTime: 60,
        startTime: null,
        elapsedTime: 0,
      };
    },
    computed: {
      formattedTime() {
        const minutes = Math.floor(this.remainingTime / 60).toString().padStart(2, "0");
        const seconds = (this.remainingTime % 60).toString().padStart(2, "0");
        return `${minutes}:${seconds}`;
      },
      accuracy() {
        const totalPairs = this.cards.length / 2;
        const matchedPairs = this.matchedCards.length;
        return totalPairs ? ((matchedPairs / totalPairs) * 100).toFixed(2) : 0;
      },
    },
    methods: {
      startGame() {
        this.currentView = 'test';
        this.cards = this.generateCards();
        this.startTime = Date.now();
        this.startTimer();
      },
      generateCards() {
        const values = ['😊', '😂', '😍', '😎', '😜', '😢', '😱', '😈'];
        const doubledValues = [...values, ...values];
        return this.shuffle(doubledValues).map(value => ({ value, flipped: false, matched: false }));
      },
      shuffle(array) {
        return array.sort(() => Math.random() - 0.5);
      },
      startTimer() {
        const timer = setInterval(() => {
          if (this.remainingTime > 0) {
            this.remainingTime--;
          } else {
            clearInterval(timer);
            this.endGame();
          }
        }, 1000);
      },
      flipCard(card) {
        if (card.flipped || card.matched || this.flippedCards.length === 2) return;
        card.flipped = true;
        this.flippedCards.push(card);
        if (this.flippedCards.length === 2) {
          this.checkForMatch();
        }
      },
      checkForMatch() {
        const [firstCard, secondCard] = this.flippedCards;
        if (firstCard.value === secondCard.value) {
          firstCard.matched = true;
          secondCard.matched = true;
          this.matchedCards.push(firstCard);
        } else {
          setTimeout(() => {
            firstCard.flipped = false;
            secondCard.flipped = false;
          }, 1000);
        }
        this.flippedCards = [];
      },
      endGame() {
        this.elapsedTime = ((Date.now() - this.startTime) / 1000).toFixed(2);
        this.currentView = 'result';
      },
      restartGame() {
        this.currentView = 'start';
        this.remainingTime = 60;
        this.matchedCards = [];
        this.flippedCards = [];
      },
    },
  };
  </script>
  
  <style scoped>
  .container {
    text-align: center;
  }
  .cards-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
  }
  .card {
    width: 80px;
    height: 80px;
    background-color: #f0f0f0;
    border-radius: 10px;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  .card-inner {
    width: 100%;
    height: 100%;
    transition: transform 0.5s;
    transform-style: preserve-3d;
  }
  .card.flipped .card-inner {
    transform: rotateY(180deg);
  }
  .card-front, .card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    background-color: #fff;
    backface-visibility: hidden;
  }
  .card-back {
    transform: rotateY(180deg);
  }
  .controls {
    margin-top: 20px;
  }
  </style>
  