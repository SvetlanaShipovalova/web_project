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

<script>
import Navbar from "../view/Navbar.vue";
import { useAuthStore } from '../store/authStore';
export default {
  components: { Navbar },
  setup() {
    const authStore = useAuthStore(); // Используем хранилище
    return { authStore };
  },
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
      this.tiles = this.initializeTiles();
      this.gameStarted = true;
      this.gameEnded = false;
      this.timer = setInterval(() => {
        this.timeElapsed++;
      }, 1000);
    },
    initializeTiles() {
      const tiles = [...Array(15).keys()].map(i => (i + 1).toString());
      tiles.push(''); // Добавляем пустую клетку
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
      const validMoves = [emptyIndex - 1, emptyIndex + 1, emptyIndex - 4, emptyIndex + 4]; // Соседние индексы

      // Проверяем, что ход допустим
      if (validMoves.includes(index)) {
        // Меняем местами пустую клетку и выбранную костяшку
        [this.tiles[emptyIndex], this.tiles[index]] = [this.tiles[index], this.tiles[emptyIndex]];
        this.moves++;
        this.accuracy = this.calculateAccuracy(); // Обновляем точность
      }
    },
    testVictory() {
      const correctOrder = [...Array(15).keys()].map(i => (i + 1).toString()).concat(''); // Правильный порядок
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
      this.accuracy = this.calculateAccuracy(); // Рассчитываем точность при завершении игры
      this.saveResults(); // Сохраняем результаты после завершения игры
    },
    calculateAccuracy() {
      const correctOrder = [...Array(15).keys()].map(i => (i + 1).toString()).concat(''); // Правильный порядок
      let correctCount = 0;

      for (let i = 0; i < this.tiles.length; i++) {
        if (this.tiles[i] === correctOrder[i]) {
          correctCount++;
        }
      }

      return ((correctCount / 15) * 100).toFixed(2); // Рассчитываем точность как процент правильно расположенных костяшек
    },
    async saveResults() {
      if (!this.authStore.user) {
        alert("Пользователь не авторизован. Пожалуйста, войдите в систему.");
        return;
      }

      const testId = 10; // ID десятого теста
      const scorePercentage = parseInt(this.accuracy); // Преобразуем точность в целое число

      try {
        const response = await fetch("http://127.0.0.1:8000/api/result/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            test: testId, // Используем ID теста
            user: this.authStore.user.id, // ID пользователя
            score_percentage: scorePercentage, // Отправляем целое число
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
  beforeDestroy() {
    clearInterval(this.timer); // Очищаем таймер при уничтожении компонента
  },
};
</script>

<style src="../assets/style.css"></style>
