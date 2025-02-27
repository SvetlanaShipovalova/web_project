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
        <p>
          Тренируйте критическое мышление и стратегическое планирование, решая головоломку за минимальное количество ходов!
        </p>
        <button class="start-button btn btn-primary" @click="startGame">Начать игру</button>
      </div>

      <!-- Игровой экран -->
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

      <!-- Финальный экран -->
      <div v-if="gameEnded" class="end-message">
        <h3>Игра завершена!</h3>
        <p>{{ endMessage }}</p>
        <p>Количество ходов: {{ moves }}</p>
        <p>Время прохождения: {{ time }}</p>
        <p>Точность: {{ accuracy }}%</p>
        <p>{{ motivationalMessage }}</p>
      </div>
      <router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
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
      tiles: [],
      moves: 0,
      timeElapsed: 0,
      accuracy: 100,
      timer: null,
      gameStarted: false,
      gameEnded: false,
      endMessage: '',
    };
  },
  computed: {
    time() {
      const minutes = Math.floor(this.timeElapsed / 60).toString().padStart(2, '0');
      const seconds = (this.timeElapsed % 60).toString().padStart(2, '0');
      return `${minutes}:${seconds}`;
    },
    motivationalMessage() {
      if (this.moves <= 50) return 'Феноменальный результат! Вы прирождённый стратег!';
      if (this.moves <= 150) return 'Отличная работа! Вы проявили аналитическое мышление.';
      if (this.moves <= 300) return 'Хорошо! Немного практики, и результат улучшится.';
      return 'Вы сделали это! Продолжайте тренироваться для улучшения навыков.';
    },
  },
  methods: {
    startGame() {
      clearInterval(this.timer);
      this.timeElapsed = 0;
      this.moves = 0;
      this.accuracy = 100;
      this.gameStarted = true;
      this.gameEnded = false;
      this.initializeTiles();
      this.timer = setInterval(() => {
        this.timeElapsed++;
      }, 1000);
    },
    initializeTiles() {
      this.tiles = [...Array(15).keys()].map(i => (i + 1).toString()).concat('');
      this.shuffleTiles();
    },
    shuffleTiles() {
      for (let i = this.tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
      }
    },
    isSolved() {
      return this.tiles.join('') === '123456789101112131415';
    },
    moveTile(index) {
      if (!this.gameStarted || this.gameEnded) return;
      const emptyIndex = this.tiles.indexOf('');
      const validMoves = [emptyIndex - 1, emptyIndex + 1, emptyIndex - 4, emptyIndex + 4];
      if (validMoves.includes(index)) {
        [this.tiles[emptyIndex], this.tiles[index]] = [this.tiles[index], this.tiles[emptyIndex]];
        this.moves++;
        if (this.isSolved()) this.endGame(true);
      }
    },
    endGame(success) {
      clearInterval(this.timer);
      this.gameEnded = true;
      this.endMessage = success ? 'Поздравляем! Вы успешно собрали головоломку!' : 'Игра завершена.';
    },
    testVictory() {
      this.tiles = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", ""];
      this.moves = 233;
      this.timeElapsed = 600;
      this.accuracy = 85;
      this.endGame(true);
    },
  },
};
</script>

<style src="../assets/style.css"></style>
