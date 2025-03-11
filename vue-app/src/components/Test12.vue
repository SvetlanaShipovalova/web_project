<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <!-- Начальный экран -->
      <div v-if="!gameStarted && !gameEnded">
        <h1>Тест Мюнсберга</h1>
        <p>
          <strong>Цель игры:</strong> Вам будет предложен список слов. Ваша задача — как можно быстрее
          найти и выделить в списке слова, не соответствующие общей категории.
        </p>
        <button class="start-button btn btn-primary" @click="startGame">Начать тест</button>
      </div>

      <!-- Игровой экран -->
      <div v-else-if="gameStarted">
        <p>Оставшееся время: {{ formattedTime }}</p>
        <p>Выделено неверных слов: {{ number_correct_answers }} / {{ number_all_answers }}</p>
        <div class="word-list">
          <button v-for="(word, index) in words" :key="index" 
                  :class="{ selected: selectedWords.includes(word), correct: oddWords.includes(word) && selectedWords.includes(word) }" 
                  @click="selectWord(word)">
            {{ word }}
          </button>
        </div>
        <button class="btn btn-warning mt-3" @click="endGame">Завершить тест</button>
      </div>

      <!-- Финальный экран -->
      <div v-if="gameEnded" class="end-message">
        <h3>Тест завершен!</h3>
        <p>Выделено неверных слов: {{ number_correct_answers }} / {{ number_all_answers }}</p>
        <p>Точность: {{ accuracy }}%</p>
        <button class="btn btn-success" @click="restartGame">Пройти снова</button>
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
      timeLeft: 60,
      words: [],
      oddWords: [],
      selectedWords: [],
      number_all_answers: 0,
      number_correct_answers: 0,
      time: "00:00:00",
      gameInterval: null,
    };
  },
  computed: {
    formattedTime() {
      return `00:00:${this.timeLeft.toString().padStart(2, "0")}`;
    },
    accuracy() {
      if (this.number_all_answers === 0) return 0;
      return ((this.number_correct_answers / this.number_all_answers) * 100).toFixed(2);
    },
  },
  methods: {
    startGame() {
      this.gameStarted = true;
      this.gameEnded = false;
      this.selectedWords = [];
      this.timeLeft = 60;
      this.generateWordList();
      this.number_all_answers = this.oddWords.length;
      
      this.gameInterval = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          this.endGame();
        }
      }, 1000);
    },
    
    generateWordList() {
      const categories = [
        { category: "Фрукты", words: ["Яблоко", "Груша", "Банан", "Автобус", "Апельсин", "Виноград", "Клубника", "Дом"] },
        { category: "Животные", words: ["Собака", "Кошка", "Тигр", "Слон", "Ручка", "Лев", "Медведь", "Стул"] },
      ];
      const chosenCategory = categories[Math.floor(Math.random() * categories.length)];
      this.words = chosenCategory.words.sort(() => Math.random() - 0.5);
      this.oddWords = chosenCategory.words.filter(word => !["Яблоко", "Груша", "Банан", "Апельсин", "Виноград", "Клубника"].includes(word) &&
                                                          !["Собака", "Кошка", "Тигр", "Слон", "Лев", "Медведь"].includes(word));
      this.number_all_answers = this.oddWords.length;
    },

    selectWord(word) {
      if (!this.selectedWords.includes(word)) {
        this.selectedWords.push(word);
        this.number_correct_answers = this.selectedWords.filter(w => this.oddWords.includes(w)).length;
      }
    },

    endGame() {
      clearInterval(this.gameInterval);
      this.gameStarted = false;
      this.gameEnded = true;
      this.saveResults();
    },

    restartGame() {
      this.startGame();
    },

    async saveResults() {
      if (!this.authStore.user) {
        alert("Пользователь не авторизован. Пожалуйста, войдите в систему.");
        return;
      }

      const testId = 6;
      const accuracyValue = parseFloat(this.accuracy);

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
            score_percentage: parseInt(accuracyValue, 10),
            time: this.time,
            number_all_answers: this.number_all_answers,
            number_correct_answers: this.number_correct_answers,
            accuracy: parseInt(accuracyValue, 10),
          }),
        });

        if (response.ok) {
          alert("Результаты успешно сохранены!");
        } else {
          const errorData = await response.json();
          alert(errorData.detail || errorData.error || "Ошибка при сохранении");
        }
      } catch (error) {
        console.error("Ошибка при отправке результатов:", error);
        alert("Ошибка соединения с сервером");
      }
    },
  },
};
</script>

<style>
.word-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.word-list button {
  padding: 10px 20px;
  font-size: 16px;
  border: 1px solid #333;
  background-color: lightgray;
  cursor: pointer;
}

.word-list button.selected {
  background-color: red;
  color: white;
}

.word-list button.correct {
  background-color: green;
  color: white;
}
</style>
