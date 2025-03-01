<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <!-- Начальный экран -->
      <div v-if="!gameStarted && !gameEnded">
        <h1>Логическая игра "Пятнашки"</h1>
        <p>
          <strong>"Пятнашки"</strong> — это головоломка 4x4, состоящая из 15 костяшек и одной пустой клетки.
        </p>
        <p>
          <strong>Цель игры:</strong> упорядочить костяшки по возрастанию, начиная с левого верхнего угла.
        </p>
        <button class="start-button btn btn-primary" @click="startGame">Начать игру</button>
      </div>

      <div v-else-if="gameStarted">
        <p>Прошедшее время: {{ time }}</p>
        <p>Ходы: {{ moves }}</p>
        <div class="game-board grid">
          <button
            v-for="(tile, index) in tiles"
            :key="index"
            :class="['tile', tile === '' ? 'empty' : '']"
            @click="moveTile(index)"
          >
            {{ tile }}
          </button>
        </div>
        <button class="btn btn-danger mt-3" @click="testVictory">Проверить победу</button>
      </div>

      <div v-if="gameEnded" class="end-message">
        <h3>Игра завершена!</h3>
        <p>{{ endMessage }}</p>
        <p>Правильно расположенных плиток: {{ number_correct_answers }} из {{ number_all_answers }}</p>
        <p>Количество ходов: {{ moves }}</p>
        <p>Время прохождения: {{ time }}</p>
        <p>Точность: {{ accuracy }}%</p>
        <p>{{ motivationalMessage }}</p>
      </div>
      <router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
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
      tiles: [],
      moves: 0,
      timeElapsed: 0,
      time: "00:00:00",
      accuracy: 100,
      timer: null,
      gameStarted: false,
      gameEnded: false,
      endMessage: '',
      number_all_answers: 15, // Всего плиток
      number_correct_answers: 0, // Количество правильно расположенных плиток
      startTime: null,
    };
  },
  computed: {
    motivationalMessage() {
      if (this.accuracy >= 95) return 'Феноменальный результат! Вы прирождённый стратег!';
      if (this.accuracy >= 85) return 'Отличная работа! Вы проявили аналитическое мышление.';
      if (this.accuracy >= 70) return 'Хорошо! Немного практики, и результат улучшится.';
      if (this.accuracy >= 50) return 'Попробуйте улучшить результат!';
      return 'Продолжайте тренироваться для улучшения навыков.';
    }
  },
  methods: {
    startGame() {
      clearInterval(this.timer);
      this.timeElapsed = 0;
      this.moves = 0;
      this.tiles = this.initializeTiles();
      this.gameStarted = true;
      this.gameEnded = false;
      this.number_correct_answers = 0;
      this.startTime = Date.now();
      this.time = "00:00:00"; 

      this.timer = setInterval(() => {
        this.timeElapsed++;
        this.updateTimeFormat();
      }, 1000);
    },
    updateTimeFormat() {
      const minutes = String(Math.floor(this.timeElapsed / 60)).padStart(2, '0');
      const seconds = String(this.timeElapsed % 60).padStart(2, '0');
      this.time = `00:${minutes}:${seconds}`;
    },
    initializeTiles() {
      const tiles = [...Array(15).keys()].map(i => (i + 1).toString());
      tiles.push('');
      return this.shuffleTiles(tiles);
    },
    shuffleTiles(tiles) {
      for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
      }
      return tiles;
    },
    moveTile(index) {
      const emptyIndex = this.tiles.indexOf('');
      const validMoves = [emptyIndex - 1, emptyIndex + 1, emptyIndex - 4, emptyIndex + 4];

      if (validMoves.includes(index)) {
        [this.tiles[emptyIndex], this.tiles[index]] = [this.tiles[index], this.tiles[emptyIndex]];
        this.moves++;
        this.number_correct_answers = this.calculateCorrectTiles();
        this.accuracy = ((this.number_correct_answers / this.number_all_answers) * 100).toFixed(2);
      }
    },
    testVictory() {
      const correctOrder = [...Array(15).keys()].map(i => (i + 1).toString()).concat('');
      if (this.tiles.join('') === correctOrder.join('')) {
        this.endGame('Поздравляем! Вы выиграли!');
      } else {
        this.endGame('Игра еще не окончена. Продолжайте!');
      }
    },
    endGame(message) {
      clearInterval(this.timer);
      this.gameEnded = true;
      this.endMessage = message;
      this.number_correct_answers = this.calculateCorrectTiles();
      this.accuracy = ((this.number_correct_answers / this.number_all_answers) * 100).toFixed(2);
      this.timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
      this.updateTimeFormat();
      this.saveResults();
    },
    calculateCorrectTiles() {
      const correctOrder = [...Array(15).keys()].map(i => (i + 1).toString()).concat('');
      return this.tiles.filter((tile, i) => tile === correctOrder[i]).length;
    },
    async saveResults() {
      if (!this.authStore.user) {
        alert("Пользователь не авторизован. Пожалуйста, войдите в систему.");
        return;
      }

      const testId = 10;
      try {
        await fetch("http://127.0.0.1:8000/api/result/", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: JSON.stringify({
            test: testId, 
            user: this.authStore.user.id, 
            score_percentage: parseFloat(this.accuracy),
            time_spent: this.time, 
            number_all_answers: this.number_all_answers, 
            number_correct_answers: this.number_correct_answers
          }),
        });
        alert("Результаты сохранены!");
      } catch (error) {
        console.error("Ошибка при отправке:", error);
      }
    },
  },
  beforeUnmount() {
    clearInterval(this.timer);
  },
};
</script>

<style src="../assets/style.css"></style>
