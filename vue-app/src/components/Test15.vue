<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>Тест №{{ $route.params.id }}</h2>
    <div id="app">
  <div class="image-checker">
    <h2>Найдите неточность на картинке</h2>
    <button v-if="!gameStarted" @click="startGame">Начать игру</button>
    <div v-if="gameStarted">
      <div class="image-container-wrapper">
        <div v-for="(image, index) in images" :key="index" class="image-container">
          <img :src="image.src" @click="checkSpot(index, $event)" />
          <div v-if="highlightedSpots[index]" class="highlight" :style="highlightedSpots[index].style"></div>
        </div>
      </div>
      <p v-if="!gameEnded">{{ timer }} секунд осталось</p> <!-- Таймер выводится только если игра не закончена -->
      <p v-if="gameEnded">Игра окончена!</p>
      <p v-if="gameEnded">Вы нашли {{ foundSpots }} из {{ totalSpots }} отличий.</p>
      <button v-if="gameEnded" @click="startGame">Начать заново</button>
    </div>
    <br> <router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
  </div>
    </div>
  </div>
</template>

<script>
import Navbar from "../view/Navbar.vue";
import img_1 from '../assets/img_1.png';
import img_2 from '../assets/img_2.png';
import img_3 from '../assets/img_3.png';
import img_4 from '../assets/img_4.png';
import img_5 from '../assets/img_5.png';
import img_6 from '../assets/img_6.png';
import img_7 from '../assets/img_7.png';
import img_8 from '../assets/img_8.png';

export default {
  components: {Navbar},
  data() {
    return {
      images: [
        { src: img_1, correctSpot: { x: 218, y: 138 } },
        { src: img_2, correctSpot: { x: 60, y: 25 } },
        { src: img_3, correctSpot: { x: 245, y: 60 } },
        { src: img_4, correctSpot: { x: 150, y: 80 } },
        { src: img_5, correctSpot: { x: 100, y: 155 } },
        { src: img_6, correctSpot: { x: 240, y: 90 } },
        { src: img_7, correctSpot: { x: 25, y: 70 } },
        { src: img_8, correctSpot: { x: 260, y: 135 } },

      ],
      highlightedSpots: {},
      gameEnded: false,
      gameStarted: false,
      timer: 60,
      totalSpots: 8,
      foundSpots: 0,
    };
  },
  methods: {
    startGame() {
      this.gameStarted = true;
      this.gameEnded = false;
      this.timer = 60;
      this.highlightedSpots = {};
      this.foundSpots = 0;
      this.startTimer();
    },
    checkSpot(index, event) {
      const rect = event.target.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      const correctSpot = this.images[index].correctSpot;
      const errorMargin = 20; // зона, где клик считается корректным

      if (
          clickX >= correctSpot.x - errorMargin &&
          clickX <= correctSpot.x + errorMargin &&
          clickY >= correctSpot.y - errorMargin &&
          clickY <= correctSpot.y + errorMargin
      ) {
        if (!this.highlightedSpots[index]) {
          this.highlightedSpots = {
            ...this.highlightedSpots,
            [index]: {
              style: {
                position: 'absolute',
                left: `${correctSpot.x - errorMargin}px`,
                top: `${correctSpot.y - errorMargin}px`,
                width: `${errorMargin * 2}px`,
                height: `${errorMargin * 2}px`,
                border: '2px solid red',
                borderRadius: '50%',
                pointerEvents: 'none'
              }
            }
          };
          this.foundSpots++;
          this.checkGameEnd();
        }
      }
    },
    checkGameEnd() {
      if (this.foundSpots === this.totalSpots || this.timer <= 0) {
        this.gameEnded = true;
        clearInterval(this.timerInterval);
      }
    },
    startTimer() {
      this.timerInterval = setInterval(() => {
        if (this.timer > 0) {
          this.timer--;
        } else {
          this.gameEnded = true;
          clearInterval(this.timerInterval);
        }
      }, 1000);
    }
  },
  mounted() {
    this.startTimer();
  },
  beforeUnmount() {
    clearInterval(this.timerInterval);
  }
};
</script>

<style>

.image-container-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.image-container {
  position: relative;
  display: inline-block;
  margin: 10px;
  width: 300px;
}

.image-container img {
  width: 100%;
  height: auto;
}

.highlight {
  position: absolute;
}
</style>
