<template> 
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <!-- Начальный экран -->
      <div v-if="!gameStarted && !gameEnded">
        <h1>Тест на память</h1>
        <p>
          <strong>Игра:</strong> "Тест на память" — это когнитивная игра, направленная на развитие зрительной памяти и концентрации.
        </p>
        <p>
          <strong>Цель игры:</strong> Нажмите "Начать игру", чтобы увидеть сетку закрытых карточек. Кликайте по ним, чтобы открывать смайлики. </p>
          <p>Если изображения совпадают, карточки остаются открытыми, если нет – они закроются через секунду. Игра продолжается, пока не будут найдены все пары. В конце отображаются время прохождения, количество найденных пар и точность.
        </p>
        <button class="start-button btn btn-primary" @click="startGame">Начать игру</button>
      </div>

      <!-- Игровой экран -->
      <div v-else-if="gameStarted">
        <p>Время: {{ formattedTime }}</p>
        <p>Найденные пары: {{ number_correct_answers }} / {{ number_all_answers }}</p>
        <div class="row mt-4">
          <div 
            v-for="(emoji, index) in shuffledEmojis" 
            :key="index" 
            class="col-2 card m-2 p-4 bg-light text-center" 
            @click="flipCard(index)"
          >
            <span class="emoji" style="font-size: 2em">{{ cardStates[index] }}</span>
          </div>
        </div>
      </div>

      <!-- Финальный экран -->
      <div v-if="gameEnded" class="end-message">
        <h3>Игра завершена!</h3>
        <p>Общее время: {{ formattedTime }}</p>
        <p>Правильные ответы: {{ number_correct_answers }} / {{ number_all_answers }}</p>
        <p>Точность: {{ accuracy }}%</p>
        <button class="btn btn-success" @click="restartGame">Пройти снова</button>
      </div>
      <router-link to="/tests" class="btn btn-secondary mt-3">Назад к тестам</router-link>
    </div>
  </div>
</template>

<script>
import Navbar from "../view/Navbar.vue";

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
      number_all_answers: 10,
      number_correct_answers: 0,
      gameStarted: false,
      gameEnded: false,
      startTime: null,
      elapsedTime: 0,
      timer: null,
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
        this.endGame();
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
      this.matchedCards = 0;
      this.cardStates = Array(this.emojis.length).fill("?");
      this.shuffledEmojis = this.shuffle([...this.emojis]);
      this.gameStarted = true;
      this.gameEnded = false;
      this.number_correct_answers = 0;
      this.elapsedTime = 0;
      this.startTime = Date.now();
      this.timer = setInterval(() => {
        this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
      }, 1000);
    },
    endGame() {
      this.gameEnded = true;
      this.gameStarted = false;
      clearInterval(this.timer);
    },
    restartGame() {
      this.startGame();
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
