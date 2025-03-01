<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <div v-if="currentView === 'start'">
        <h1>Игра "Тест на память"</h1>
        <p><strong>"Тест на память"</strong> — это игра на развитие внимания и концентрации.</p>
        <p><strong>Цель:</strong> Найдите все пары за 60 секунд.</p>
        <button class="btn btn-primary" @click="startGame">Начать игру</button>
      </div>

      <div v-else-if="currentView === 'test'">
        <p>Оставшееся время: {{ formattedTime }}</p>
        <div class="cards-container d-flex flex-wrap justify-content-center">
          <div v-for="(card, index) in cards" :key="index" class="card"
               :class="{'flipped': card.flipped || card.matched, 'matched': card.matched}"
               @click="flipCard(card)">
            <div class="card-inner">
              <div class="card-front"></div>
              <div class="card-back">
                <span>{{ card.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="currentView === 'result'">
        <h3>Результаты</h3>
        <p>Время выполнения: {{ time }}</p>
        <p>Правильные ответы: {{ number_all_answers }} / {{ number_correct_answers }}</p>
        <p>Точность: {{ accuracy }}%</p>
        <button class="btn btn-success" @click="restartGame">Начать заново</button>
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
      currentView: 'start',
      cards: [],
      flippedCards: [],
      matchedPairs: [],
      number_all_answers: 0,  // Сколько отгадал (найденные пары)
      number_correct_answers: 8,  // Всего пар в тесте
      remainingTime: 60, // Таймер 60 секунд
      timeElapsed: 0, // Время в секундах
      time: "00:00:00", // Форматированное время
      gameTimer: null,
      startTime: null,
    };
  },
  computed: {
    formattedTime() {
      const minutes = Math.floor(this.remainingTime / 60).toString().padStart(2, "0");
      const seconds = (this.remainingTime % 60).toString().padStart(2, "0");
      return `00:${minutes}:${seconds}`;
    },
    accuracy() {
      return ((this.number_all_answers / this.number_correct_answers) * 100).toFixed(2);
    },
  },
  methods: {
    startGame() {
      this.currentView = 'test';
      this.cards = this.generateCards();
      this.matchedPairs = [];
      this.number_all_answers = 0;
      this.remainingTime = 60;
      this.timeElapsed = 0;
      this.time = "00:00:00";
      this.startTime = Date.now();
      this.startTimer();
    },
    generateCards() {
      const values = ['😊', '😂', '😍', '😎', '😜', '😢', '😱', '😈'];
      const doubledValues = [...values, ...values];
      return this.shuffle(doubledValues).map(value => ({ value, flipped: false, matched: false }));
    },
    shuffle(array) {
      return array.sort(() => Math.random() - 0.5);
    },
    startTimer() {
      this.gameTimer = setInterval(() => {
        if (this.remainingTime > 0) {
          this.remainingTime--;
          this.timeElapsed++;
          this.time = this.formatTime(this.timeElapsed);
        } else {
          this.endGame();
        }
      }, 1000);
    },
    formatTime(seconds) {
      const hours = Math.floor(seconds / 3600).toString().padStart(2, "0");
      const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
      const sec = (seconds % 60).toString().padStart(2, "0");
      return `${hours}:${minutes}:${sec}`;
    },
    flipCard(card) {
      if (card.flipped || card.matched || this.flippedCards.length === 2) return;
      card.flipped = true;
      this.flippedCards.push(card);
      if (this.flippedCards.length === 2) {
        this.checkForMatch();
      }
    },
    checkForMatch() {
  const [firstCard, secondCard] = this.flippedCards;
  if (firstCard.value === secondCard.value) {
    firstCard.matched = true;
    secondCard.matched = true;
    this.matchedPairs.push(firstCard);
    this.number_all_answers++; // Увеличиваем счетчик найденных пар

    // ✅ Если нашли все пары, завершаем игру
    if (this.number_all_answers === this.number_correct_answers) {
      this.endGame();
    }
  } else {
    setTimeout(() => {
      firstCard.flipped = false;
      secondCard.flipped = false;
    }, 1000);
  }
  this.flippedCards = [];
},
endGame() {
  clearInterval(this.gameTimer); // ✅ Останавливаем таймер
  this.time = this.formatTime(this.timeElapsed); // Фиксируем финальное время
  this.currentView = 'result';
  this.saveResults(); // Сохраняем результаты
},
    restartGame() {
      this.currentView = 'start';
      this.remainingTime = 60;
      this.matchedPairs = [];
      this.flippedCards = [];
    },
    async saveResults() {
      if (!this.authStore.user) {
        alert("Пользователь не авторизован. Пожалуйста, войдите в систему.");
        return;
      }

      const testId = 4; // ID теста
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
            time: this.time, // Время в формате "00:00:00"
            number_all_answers: this.number_all_answers,
            number_correct_answers: this.number_correct_answers,
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


<style scoped>
.container {
  text-align: center;
}
.cards-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}
.card {
  width: 80px;
  height: 80px;
  background-color: #f0f0f0;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.card-inner {
  width: 100%;
  height: 100%;
  transition: transform 0.5s;
  transform-style: preserve-3d;
}
.card.flipped .card-inner {
  transform: rotateY(180deg);
}
.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  background-color: #fff;
  backface-visibility: hidden;
}
.card-back {
  transform: rotateY(180deg);
}
.controls {
  margin-top: 20px;
}
</style>
  