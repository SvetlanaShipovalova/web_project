<template>
    <Navbar />
    <div class="container mt-5 text-center">
      <h2>{{ $route.params.name }}</h2>
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
    const authStore = useAuthStore(); // Используем хранилище
    return { authStore };
  },
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
      startTime: null,
    };
  },
  methods: {
    startGame() {
      this.gameStarted = true;
      this.gameEnded = false;
      this.currentRound = 1;
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
        // 50% шанс получить монету номиналом 1 или монету с текущим значением maxValue
        coins.push(Math.random() < 0.5 ? 1 : this.maxValue);
      }
      return coins;
    },
    handleAnswer(choice) {
      const leftSum = this.leftBank.reduce((acc, coin) => acc + coin, 0);
      const rightSum = this.rightBank.reduce((acc, coin) => acc + coin, 0);

      if ((choice === "left" && leftSum >= rightSum) || (choice === "right" && rightSum >= leftSum)) {
        this.feedback = "Правильно!";
        this.correctAnswers++;
      } else {
        this.feedback = "Неправильно!";
      }

      if (this.currentRound < this.totalRounds) {
        this.currentRound++;
        // Повышаем сложность после 10-го раунда
        if (this.currentRound > 10) {
          this.maxValue = 2;
        }
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
      this.saveResults(); // Сохраняем результаты после завершения теста
    },
    restartGame() {
      this.startGame();
    },
    async saveResults() {
      if (!this.authStore.user) {
        alert("Пользователь не авторизован. Пожалуйста, войдите в систему.");
        return;
      }

      const testId = 7; // ID седьмого теста
      const scorePercentage = this.accuracy; // Точность в процентах

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
            score_percentage: parseFloat(scorePercentage), // Преобразуем в число
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
};
</script>
  
  <style src="../assets/style.css"></style>
  