<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>Тест №{{ $route.params.name }}</h2>
    <div id="app">
      <div v-if="currentView === 'start'">
        <h1>Тест числового охвата</h1>
        <button id="start-button" @click="startTest">Начать тест</button>
      </div>

      <div v-else-if="currentView === 'test'">
        <h2>Раунд {{ round }}</h2>
        <p>Запомните число, а затем выберите его на клавиатуре.</p>
        <p>Загаданное число исчезнет через: {{ remainingTime }} сек</p>

        <div class="digit-to-remember">
          <span v-if="showDigit">{{ currentDigit }}</span>
        </div>

        <div class="buttons" v-if="!showDigit">
          <button v-for="i in 9" :key="i" @click="checkAnswer(i)">{{ i }}</button>
          <button @click="checkAnswer(0)">0</button>
        </div>
      </div>

      <div v-else-if="currentView === 'result'">
        <h1>Результаты</h1>
        <p>Раунд {{ round }} завершён!</p>
        <p>Точность: {{ accuracy }}%</p>
        <button @click="restartTest">Повторить</button>
        <button @click="goBack">Назад</button>
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
      remainingTime: 5,
      currentDigit: null,
      showDigit: false,
      accuracy: 0,
      results: [],
      userInput: "",
    };
  },
  methods: {
    startTest() {
      this.currentView = 'test';
      this.startRound();
    },
    startRound() {
      if (this.round > 4) {
        this.currentDigit = Math.floor(Math.random() * 90) + 10;
      } else {
        this.currentDigit = Math.floor(Math.random() * 10);
      }

      this.showDigit = true;
      this.userInput = "";
      this.remainingTime = 3;

      let countdown = setInterval(() => {
        this.remainingTime--;
        if (this.remainingTime <= 0) {
          clearInterval(countdown);
          this.showDigit = false;
        }
      }, 1000);
    },
    checkAnswer(number) {
      if (this.showDigit) return;

      this.userInput += number;

      if (this.round > 4) {
        if (this.userInput.length === 2) {
          if (parseInt(this.userInput) === this.currentDigit) {
            this.accuracy = 100;
          } else {
            this.accuracy = 0;
          }
          this.endRound();
        }
      } else {
        if (parseInt(this.userInput) === this.currentDigit) {
          this.accuracy = 100;
          this.endRound();
        }
      }
    },
    endRound() {
      this.results.push(this.accuracy);
      if (this.round < 7) {
        this.round++;
        this.startRound();
      } else {
        this.currentView = 'result';
      }
    },
    restartTest() {
      this.round = 1;
      this.results = [];
      this.accuracy = 0;
      this.userInput = "";
      this.currentView = 'start';
    },
    goBack() {
      this.currentView = 'start';
    }
  }
};
</script>
