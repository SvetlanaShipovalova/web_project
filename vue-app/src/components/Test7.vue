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
        <p>Раунд: {{ currentRound }} / {{ number_correct_answers }}</p>
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
        <p>Правильных ответов: {{ number_all_answers }} из {{ number_correct_answers }}</p>
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
    number_correct_answers: 20, // Общее количество вопросов
    number_all_answers: 0, // Количество отгаданных
    feedback: "",
    leftBank: [],
    rightBank: [],
    maxValue: 1,
    accuracy: 0,
    time: "00:00:00", // Время в формате ЧЧ:ММ:СС
    startTime: null,
  };
},
methods: {
  startGame() {
    this.gameStarted = true;
    this.gameEnded = false;
    this.currentRound = 1;
    this.number_all_answers = 0;
    this.feedback = "";
    this.maxValue = 1;
    this.accuracy = 0;
    this.time = "00:00:00";
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

    if ((choice === "left" && leftSum >= rightSum) || (choice === "right" && rightSum >= leftSum)) {
      this.feedback = "Правильно!";
      this.number_all_answers++;
    } else {
      this.feedback = "Неправильно!";
    }

    if (this.currentRound < this.number_correct_answers) {
      this.currentRound++;
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

    // Вычисляем точность
    this.accuracy = this.number_correct_answers > 0
      ? ((this.number_all_answers / this.number_correct_answers) * 100).toFixed(2)
      : "0.00";
    if (this.number_all_answers === this.number_correct_answers) {
      this.accuracy = "100.00";
    }

    // Рассчитываем время
    const totalSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    this.time = this.formatTime(totalSeconds);

    this.saveResults(); 
  },
  formatTime(seconds) {
    const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${sec}`;
  },
  async saveResults() {
    if (!this.authStore.user) {
      alert("Пользователь не авторизован. Пожалуйста, войдите в систему.");
      return;
    }

    const testId = 7; 
    const scorePercentage = parseFloat(this.accuracy);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/result/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          test: testId,
          user: this.authStore.user.id,
          score_percentage: scorePercentage,
          time_spent: this.time, // Сохранение времени выполнения
          number_all_answers: this.number_all_answers,
          number_correct_answers: this.number_correct_answers
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
  