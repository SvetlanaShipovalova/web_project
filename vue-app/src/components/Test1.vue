<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <div v-if="currentView === 'start'">
        <h1>Тест таблицы Шульте</h1>
        <button id="start-button" @click="startTest">Начать тест</button>
      </div>

      <div v-else-if="currentView === 'test'">
        <h2>Раунд {{ round }}</h2>
        <p>Найдите числа от 1 до {{ maxNumber }} в порядке возрастания.</p>
        <p>Оставшееся время: {{ remainingTime }} сек</p>
        <p>Количество ошибок: {{ missClicks }}</p>
        <div class="grid">
          <button
              v-for="number in shuffledNumbers"
              :key="number"
              :disabled="clickedNumbers.includes(number)"
              @click="checkNumber(number)"
              class="grid-button"
          >
            {{ number }}
          </button>
        </div>
        <div class="controls">
          <button @click="endTest" id="text">Завершить</button>
          <button @click="restartTest" id="text">Начать заново</button>
        </div>
      </div>

      <div v-else-if="currentView === 'result'">
        <h1>Результаты</h1>
        <p v-for="(time, index) in results" :key="index">
          Раунд {{ index + 1 }}: {{ time }} сек
        </p>
        <h2>Итог:</h2>
        <p>Ошибок: {{ totalMissClicks }}</p>
        <p>Точность: {{ accuracy }}%</p>
        <button @click="restartTest" id="text">Повторить попытку</button>
        <button @click="goBack" id="text">Вернуться назад</button>
      </div>
    </div>
    <router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
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
      round: 1,
      timer: null,
      timeTaken: 0,
      remainingTime: 60,
      maxNumber: 12,
      numbers: [],
      shuffledNumbers: [],
      clickedNumbers: [],
      results: [],
      missClicks: 0,
      totalMissClicks: 0,
      gridDimensions: { rows: 4, cols: 3 },
      time: "0.00"
    };
  },
  computed: {
    accuracy() {
      const totalClicks = this.round * this.maxNumber;
      return totalClicks > 0 ? ((totalClicks - this.totalMissClicks) / totalClicks * 100).toFixed(2) : 0;
    }
  },
  methods: {
    startTest() {
      this.resetRound();
      this.currentView = 'test';
      this.startTimer();
    },
    startTimer() {
      this.stopTimer();
      this.timer = setInterval(() => {
        this.remainingTime--;
        if (this.remainingTime <= 0) {
          this.handleTimeout();
        }
      }, 1000);
    },
    stopTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    shuffle(array) {
      return array.sort(() => Math.random() - 0.5);
    },
    checkNumber(number) {
      if (number === this.clickedNumbers.length + 1) {
        this.clickedNumbers.push(number);
        if (this.clickedNumbers.length === this.maxNumber) {
          this.finishRound();
        }
      } else {
        this.missClicks += 1;
        if (this.missClicks >= 3) {
          this.restartRound();
        }
      }
    },
    handleTimeout() {
      this.missClicks += 1;
      if (this.missClicks >= 3) {
        this.restartRound();
      }
    },
    finishRound() {
      this.stopTimer();
      const timeSpent = 60 - this.remainingTime;
      this.results.push(timeSpent);
      this.totalMissClicks += this.missClicks;
      this.time = timeSpent.toFixed(2);
      if (this.round < 3) {
        this.round += 1;
        this.resetRound();
        this.startTimer();
      } else {
        this.currentView = 'result';
      }
    },
    restartRound() {
      this.missClicks = 0;
      this.resetRound();
      this.startTimer();
    },
    resetRound() {
      this.remainingTime = 60;
      this.clickedNumbers = [];
      this.missClicks = 0;
      if (this.round === 1) {
        this.maxNumber = 12;
        this.gridDimensions = { rows: 4, cols: 3 };
      } else if (this.round === 2) {
        this.maxNumber = 16;
this.gridDimensions = { rows: 4, cols: 4 };
      } else {
        this.maxNumber = 20;
        this.gridDimensions = { rows: 5, cols: 4 };
      }
      this.numbers = Array.from({ length: this.maxNumber }, (_, i) => i + 1);
      this.shuffledNumbers = this.shuffle([...this.numbers]);
    },
    restartTest() {
      this.round = 1;
      this.results = [];
      this.totalMissClicks = 0;
      this.startTest();
    },
    goBack() {
      this.currentView = 'start';
      this.round = 1;
      this.results = [];
      this.totalMissClicks = 0;
    },
    endTest() {
      this.stopTimer();
      this.currentView = 'result';
    }
  }
};
</script>