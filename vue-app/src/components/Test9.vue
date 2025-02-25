<template>
    <Navbar />
    <div class="container mt-5 text-center">
      <h2>Тест №{{ $route.params.id }}</h2>
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
          <p>
            Игра помогает развивать концентрацию, тренировать зрительное внимание и улучшать кратковременную память. Удачи!
          </p>
          <button class="start-button btn btn-primary" @click="startGame">Начать игру</button>
        </div>
  
        <!-- Игровой экран -->
        <div v-else-if="gameStarted">
          <div class="info">
            <p>Раунд: {{ round }} / {{ maxRounds }}</p>
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
  
        <!-- Финальный экран -->
        <div v-if="gameEnded" class="end-message">
          <h3>{{ gameWon ? 'Поздравляем!' : 'Игра окончена!' }}</h3>
          <div v-if="gameWon">
            <p>Вы успешно прошли игру "Наперстки"!</p>
            <p>Вы продемонстрировали прекрасное внимание и память.</p>
          </div>
          <div v-else>
            <p>Шарик был под стаканчиком {{ ballPosition + 1 }}. Попробуйте снова!</p>
          </div>
          <p>Точность: {{ accuracy }}%</p>
          <p>Время прохождения игры: {{ time }} секунд</p>
        </div>
        <router-link to="/tests" class="btn btn-secondary mt-3">Назад к тестам</router-link>
      </div>
    </div>
  </template>
  
  <script>
  import Navbar from "../view/Navbar.vue";
  export default {
    components: { Navbar },
    data() {
      return {
        cups: [0, 1, 2], // Индексы стаканчиков
        ballPosition: 0, // Текущая позиция мяча
        gameStarted: false,
        gameEnded: false,
        gameWon: false,
        round: 1,       // Номер текущего раунда
        maxRounds: 5,   // Количество раундов
        message: "",
        showBall: false,
        isSelectable: false, // Можно ли выбрать стаканчик
        startTime: null,     // Время начала игры
        time: 0,             // Общее время прохождения игры (в секундах)
        accuracy: 0          // Процент правильно пройденных раундов
      };
    },
    methods: {
      startGame() {
        this.resetGame();
        this.startTime = new Date(); // Запоминаем время начала игры
        this.startRound();
      },
      resetGame() {
        this.gameStarted = true;
        this.gameEnded = false;
        this.gameWon = false;
        this.round = 1;
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
        }, 500 - this.round * 50); // Ускоряем скорость перемешивания
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
          if (this.round < this.maxRounds) {
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
        // Рассчитываем общее время прохождения игры
        const endTime = new Date();
        this.time = ((endTime - this.startTime) / 1000).toFixed(2);
        // Если игра завершена не из-за полного прохождения, считаем, что количество правильных раундов = (round - 1)
        this.accuracy = won ? 100 : Math.round(((this.round - 1) / this.maxRounds) * 100);
      },
    },
  };
  </script>
  
  <style src="../assets/style.css"></style>
  