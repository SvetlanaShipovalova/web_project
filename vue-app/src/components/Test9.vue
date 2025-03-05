<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <!-- Начальный экран -->
      <div v-if="!gameStarted && !gameEnded">
        <h1>Игра-тренажер: "Наперстки"</h1>
        <p>
          <strong>"Наперстки"</strong> — это увлекательная игра, направленная на развитие внимания и памяти.
        </p>
        <p>
          <strong>Цель игры:</strong> Найти, под каким стаканчиком находится шарик после перемешивания. Сложность увеличивается с каждым раундом.
        </p>
        <button class="start-button btn btn-primary" @click="startGame">Начать игру</button>
      </div>

      <div v-else-if="gameStarted">
        <div class="info">
          <p>Раунд: {{ round }} / {{ number_all_answers }}</p>
        </div>
        <div class="cups-container">
          <div
            v-for="index in cups"
            :key="index"
            class="cup"
            @click="selectCup(index)"
          >
            <div v-if="index === ballPosition && showBall" class="ball"></div>
          </div>
        </div>
        <div class="message">{{ message }}</div>
      </div>

      <div v-if="gameEnded" class="end-message">
        <h3>{{ gameWon ? 'Поздравляем!' : 'Игра окончена!' }}</h3>
        <p>Правильных ответов: {{ number_correct_answers }} из {{ number_all_answers }}</p>
        <p>Точность: {{ accuracy }}%</p>
        <p>Время прохождения игры: {{ time }}</p>
      </div>
      <router-link to="/tests" class="btn btn-secondary mt-3">Назад к тестам</router-link>
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
      cups: [0, 1, 2],
      ballPosition: 0,
      gameStarted: false,
      gameEnded: false,
      gameWon: false,
      round: 1,
      number_all_answers: 5,
      number_correct_answers: 0,
      message: "",
      showBall: false,
      isSelectable: false,
      startTime: null,
      time: 0 // Храним время в секундах
    };
  },
  computed: {
    accuracy() {
      if (this.number_all_answers === 0) return 0;
      const calculated = (this.number_correct_answers / this.number_all_answers) * 100;
      return Number(calculated.toFixed(2));
    },
    formattedTime() {
      const hours = String(Math.floor(this.time / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((this.time % 3600) / 60)).padStart(2, '0');
      const sec = String(this.time % 60).padStart(2, '0');
      return `${hours}:${minutes}:${sec}`;
    }
  },
  methods: {
    startGame() {
      this.resetGame();
      this.startTime = Date.now();
      this.startRound();
    },
    resetGame() {
      this.gameStarted = true;
      this.gameEnded = false;
      this.gameWon = false;
      this.round = 1;
      this.number_correct_answers = 0;
      this.message = "";
    },
    startRound() {
      this.message = `Раунд ${this.round}. Следите за шариком!`;
      this.ballPosition = Math.floor(Math.random() * 3);
      this.showBall = true;
      this.isSelectable = false;

      setTimeout(() => {
        this.shuffleCups();
      }, 1000);
    },
    shuffleCups() {
      let shuffleCount = 0;
      const maxShuffles = 5 + this.round * 2;
      const shuffleInterval = setInterval(() => {
        this.ballPosition = this.getRandomPosition();
        shuffleCount++;
        if (shuffleCount >= maxShuffles) {
          clearInterval(shuffleInterval);
          this.showBall = true;
          setTimeout(() => {
            this.showBall = false;
            this.isSelectable = true;
            this.message = "Выберите стаканчик!";
          }, 100);
        }
      }, 500 - this.round * 50);
    },
    getRandomPosition() {
      let newPosition;
      do {
        newPosition = Math.floor(Math.random() * 3);
      } while (newPosition === this.ballPosition);
      return newPosition;
    },
    selectCup(index) {
      if (!this.isSelectable) return;
      this.isSelectable = false;
      if (index === this.ballPosition) {
        this.message = "Правильно!";
        this.number_correct_answers++;
        if (this.round < this.number_all_answers) {
          this.round++;
          setTimeout(() => this.startRound(), 2000);
        } else {
          this.endGame(true);
        }
      } else {
        this.message = `Неправильно! Шарик был под стаканчиком ${this.ballPosition + 1}.`;
        this.endGame(false);
      }
    },
    endGame(won) {
      this.gameEnded = true;
      this.gameStarted = false;
      this.gameWon = won;
      this.time = Math.floor((Date.now() - this.startTime) / 1000);
      this.saveResults();
    },
    async saveResults() {
      if (!this.authStore.user) {
        alert("Пользователь не авторизован.");
        return;
      }

      const testId = 9;
      const payload = {
        test: testId,
        user: this.authStore.user.id,
        score_percentage: Math.round(this.accuracy),
        time: this.formattedTime,
        number_all_answers: this.number_all_answers,
        number_correct_answers: this.number_correct_answers,
        accuracy: Math.round(this.accuracy)
      };

      console.log("Отправляемые данные:", payload);

      try {
        const response = await fetch("http://127.0.0.1:8000/api/result/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || data.error || `Ошибка ${response.status}`);
        }

        alert("Результаты успешно сохранены!");
      } catch (error) {
        console.error("Ошибка сохранения:", error);
        alert(`Ошибка: ${error.message}`);
      }
    }
  },
};
</script>

<style src="../assets/style.css"></style>
