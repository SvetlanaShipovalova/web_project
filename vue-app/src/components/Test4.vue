<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <div v-if="rulesScreen">
      <h1>Тест на память: Найди смайлики</h1>
      <p>
        <strong>Цель игры:</strong> Нажмите "Начать игру", чтобы увидеть сетку закрытых карточек. Кликайте по ним, чтобы открывать смайлики.
      </p>
      <p>
        Если изображения совпадают, карточки остаются открытыми, если нет – они закроются через секунду. Игра продолжается, пока не будут найдены все пары.
      </p>
      <button @click="startGameFromRules">Начать игру</button>
    </div>

    <div v-else>
      <h3>Найди пары смайлов!</h3>
      <div class="row mt-4">
        <div
          v-for="(emoji, index) in shuffledEmojis"
          :key="index"
          class="col-3 card ml-3 p-4 bg-light text-center mr-2"
          @click="flipCard(index)"
        >
          <span class="emoji" style="font-size: 2em">{{ cardStates[index] }}</span>
        </div>
      </div>
      <button @click="startGame">Начать заново</button>

      <div v-if="gameEnded" class="end-message mt-4">
        <h3>Игра завершена!</h3>
        <p>Правильные ответы: {{ number_correct_answers }} / {{ number_all_answers }}</p>
        <p>Точность: {{ accuracy }}%</p>
        <p>Время выполнения: {{ formattedTime }}</p>
      </div>

    </div>
    <br><router-link to="/tests" class="btn btn-secondary">
        Назад к тестам
      </router-link>
  </div>
</template>

<script>
import Navbar from "../view/Navbar.vue";
import { useAuthStore } from '../store/authStore';

export default {
  components: {
    Navbar,
  },
  data() {
    return {
      emojis: ["😀", "😀", "😃", "😃", "😄", "😄", "😁", "😁", "😆", "😆", "😅", "😅", "😂", "😂", "🤣", "🤣", "😜", "😜", "🤪", "🤪"],
      shuffledEmojis: [],
      cardStates: [],
      firstCardIndex: null,
      secondCardIndex: null,
      lockBoard: false,
      matchedCards: 0,
      authStore: useAuthStore(),
      number_all_answers: 10, 
      number_correct_answers: 0,
      gameEnded: false,
      startTime: null,
      elapsedTime: 0,
      timer: null,
      rulesScreen: true, 
    };
  },
  computed: {
    accuracy() {
      return this.number_all_answers === 0 ? 0 : (this.number_correct_answers / this.number_all_answers * 100).toFixed(2);
    },
    formattedTime() {
      const minutes = Math.floor(this.elapsedTime / 60).toString().padStart(2, "0");
      const seconds = (this.elapsedTime % 60).toString().padStart(2, "0");
      return `${minutes}:${seconds}`;
    },
  },
  methods: {
    shuffle(array) {
      return array.sort(() => Math.random() - 0.5);
    },
    flipCard(index) {
      if (this.lockBoard || this.cardStates[index] !== "?") return;
      this.cardStates[index] = this.shuffledEmojis[index];
      if (this.firstCardIndex === null) {
        this.firstCardIndex = index;
      } else {
        this.secondCardIndex = index;
        this.lockBoard = true;
        this.checkForMatch();
      }
    },
    checkForMatch() {
      if (this.shuffledEmojis[this.firstCardIndex] === this.shuffledEmojis[this.secondCardIndex]) {
        this.disableCards();
      } else {
        this.unflipCards();
      }
    },
    disableCards() {
      this.matchedCards += 2;
      this.number_correct_answers += 1; 
      this.resetBoard();
      if (this.matchedCards === this.emojis.length) {
        this.gameEnded = true;
        clearInterval(this.timer);
        this.saveResults();
      }
    },
    unflipCards() {
      setTimeout(() => {
        this.cardStates[this.firstCardIndex] = "?";
        this.cardStates[this.secondCardIndex] = "?";
        this.resetBoard();
      }, 1000);
    },
    resetBoard() {
      this.firstCardIndex = null;
      this.secondCardIndex = null;
      this.lockBoard = false;
    },
    startGame() {
      if (this.timer) clearInterval(this.timer); 
      this.matchedCards = 0;
      this.cardStates = Array(this.emojis.length).fill("?");
      this.shuffledEmojis = this.shuffle([...this.emojis]);
      this.gameEnded = false;
      this.number_correct_answers = 0;
      this.elapsedTime = 0;
      this.startTime = Date.now();
      this.timer = setInterval(() => {
        this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
      }, 1000);
    },
    startGameFromRules() {
      this.rulesScreen = false; 
      this.startGame(); 
    },
    async saveResults() {
      try {
        const response = await fetch("https://svetasy.pythonanywhere.com/api/result/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            test: 4,
            user: this.authStore.user.id,
            accuracy: this.accuracy,
            time: this.formattedTime,
            number_all_answers: this.number_all_answers,
            number_correct_answers: this.number_correct_answers,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          alert("Результаты успешно сохранены!");
        } else {
          alert(data.detail || data.error || "Ошибка при сохранении");
        }
      } catch (error) {
        console.error("Ошибка при отправке результатов:", error);
        alert("Ошибка соединения с сервером");
      }
    },
  },
};
</script>

<style scoped>
.emoji {
  font-size: 2em;
}
.end-message {
  margin-top: 20px;
}

</style>