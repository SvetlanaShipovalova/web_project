<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <div v-if="!gameStarted && !gameEnded">
        <h1>Игра "Копилка"</h1>
        <p><strong>"Копилка"</strong> — игра на развитие скорости мышления и вычислительных навыков.</p>
        <p><strong>Цель игры:</strong> определить, в какой из копилок больше денег.</p>
        <button class="start-button btn btn-primary" @click="startGame">Начать игру</button>
      </div>

      <div v-else-if="gameStarted">
        <p>Раунд: {{ currentRound }} / {{ number_all_answers }}</p>
        <p>Правильные ответы: {{ number_correct_answers }} / {{ number_all_answers }}</p>
        <div class="game-area piggy-bank-game">
          <div class="piggy-bank border p-3 mx-2" @click="handleAnswer('left')">
            <div v-for="(coin, index) in leftBank" :key="'left-' + index" class="coin">
              {{ coin }}
            </div>
          </div>
          <div class="piggy-bank border p-3 mx-2" @click="handleAnswer('right')">
            <div v-for="(coin, index) in rightBank" :key="'right-' + index" class="coin">
              {{ coin }}
            </div>
          </div>
        </div>
        <p v-if="feedback" class="message" :class="{ correct: feedback === 'Правильно!', incorrect: feedback === 'Неправильно!' }">
          {{ feedback }}
        </p>
      </div>

      <div v-if="gameEnded" class="end-message">
        <h3>Игра завершена!</h3>
        <p>Правильных ответов: {{ number_correct_answers }} из {{ number_all_answers }}</p>
        <p>Точность: {{ accuracy }}%</p>
        <p>Время выполнения: {{ time }}</p>
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
      gameStarted: false,
      gameEnded: false,
      currentRound: 0,
      number_all_answers: 20,
      number_correct_answers: 0,
      feedback: "",
      leftBank: [],
      rightBank: [],
      maxValue: 1,
      time: 0, // Храним время в секундах
      startTime: null,
    };
  },
  computed: {
    formattedTime() {
      const hours = String(Math.floor(this.time / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((this.time % 3600) / 60)).padStart(2, '0');
      const sec = String(this.time % 60).padStart(2, '0');
      return `${hours}:${minutes}:${sec}`;
    },
    accuracy() {
      return this.number_all_answers > 0
        ? (this.number_correct_answers / this.number_all_answers) * 100
        : 0;
    }
  },
  methods: {
    startGame() {
      this.gameStarted = true;
      this.gameEnded = false;
      this.currentRound = 1;
      this.number_correct_answers = 0;
      this.feedback = "";
      this.maxValue = 1;
      this.time = 0;
      this.startTime = Date.now();
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

      const isCorrect = (choice === "left" && leftSum >= rightSum) ||
                       (choice === "right" && rightSum >= leftSum);

      this.feedback = isCorrect ? "Правильно!" : "Неправильно!";
      if (isCorrect) this.number_correct_answers++;

      if (this.currentRound < this.number_all_answers) {
        this.currentRound++;
        this.maxValue = this.currentRound > 10 ? 2 : 1;
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
      this.time = Math.floor((Date.now() - this.startTime) / 1000);
      this.saveResults();
    },
    async saveResults() {
      if (!this.authStore.user) {
        alert("Пользователь не авторизован. Пожалуйста, войдите в систему.");
        return;
      }

      const payload = {
        test: 7,
        user: this.authStore.user.id,
        score_percentage: Math.round(this.accuracy),
        time: this.formattedTime,
        number_all_answers: this.number_all_answers,
        number_correct_answers: this.number_correct_answers
      };

      console.log("Отправляемые данные:", payload);

      try {
        const response = await fetch("http://127.0.0.1:8000/api/result/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || data.error || `Ошибка ${response.status}`);
        }

        alert("Результаты успешно сохранены!");
      } catch (error) {
        console.error("Ошибка сохранения:", {
          error: error.message,
          payload,
          stack: error.stack
        });
        alert(`Ошибка сохранения: ${error.message}`);
      }
    }
  },
};
</script>

<style src="../assets/style.css"></style>

  