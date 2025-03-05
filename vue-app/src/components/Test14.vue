<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <div class="image-checker">
        <h2>Найдите неточность на картинке</h2>
        <button v-if="!gameStarted" @click="startGame">Начать игру</button>
        <button v-if="gameStarted && !gameEnded" @click="endGame">Закончить игру</button> 
        <div v-if="gameStarted">
          <div class="image-container-wrapper">
            <div v-for="(image, index) in images" :key="index" class="image-container">
              <img :src="image.src" @click="checkSpot(index, $event)" />
              <div v-if="highlightedSpots[index]" class="highlight" :style="highlightedSpots[index].style"></div>
            </div>
          </div>
          <p v-if="!gameEnded">{{ timer }} секунд осталось</p>
          <p v-if="gameEnded">Игра окончена!</p>
          <p v-if="gameEnded">Попаданий: {{ number_correct_answers }} из {{ number_all_answers }} возможных отличий.</p>
          <p v-if="gameEnded">Время, затраченное на игру: {{ time }}</p>
          <p v-if="gameEnded">Точность: {{ accuracy }}%</p>
          <button v-if="gameEnded" @click="startGame">Начать заново</button>
        </div>
        <br>
        <router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from "../view/Navbar.vue";
import { useAuthStore } from '../store/authStore';
import img_1 from '../assets/test_res/img_1.png';
import img_2 from '../assets/test_res/img_2.png';
import img_3 from '../assets/test_res/img_3.png';
import img_4 from '../assets/test_res/img_4.png';
import img_5 from '../assets/test_res/img_5.png';
import img_6 from '../assets/test_res/img_6.png';
import img_7 from '../assets/test_res/img_7.png';
import img_8 from '../assets/test_res/img_8.png';

export default {
  components: { Navbar },
  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },
  data() {
    return {
      images: [
        { src: img_1, correctSpot: { x: 210, y: 70 } },
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
      time: "00:00:00",
      accuracy: 0,
      number_all_answers: 0,   // Общее количество изображений (вопросов)
      number_correct_answers: 0, // Сколько пользователь ответил правильно
    };
  },
  methods: {
    startGame() {
      this.gameStarted = true;
      this.gameEnded = false;
      this.timer = 60;
      this.time = "00:00:00";
      this.highlightedSpots = {};
      this.number_correct_answers = 0;
      this.number_all_answers = this.images.length; // Всегда равно количеству изображений
      this.startTimer();
    },
    checkSpot(index, event) {
      if (this.gameEnded) return;

      const rect = event.target.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      const correctSpot = this.images[index].correctSpot;
      const errorMargin = 30;

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
          this.number_correct_answers++;
        }
      }

      this.checkGameEnd();
    },
    checkGameEnd() {
      if (this.number_correct_answers === this.number_all_answers || this.timer <= 0) {
        this.endGame();
      }
    },
    startTimer() {
      this.timerInterval = setInterval(() => {
        if (this.timer > 0) {
          this.timer--;
        } else {
          this.endGame();
        }
      }, 1000);
    },
    endGame() {
      if (this.gameEnded) return;

      this.gameEnded = true;
      clearInterval(this.timerInterval);

      const elapsedSeconds = 60 - this.timer;
      this.time = this.formatTime(elapsedSeconds);

      // Корректный расчет точности
      this.accuracy = this.number_all_answers > 0 
        ? ((this.number_correct_answers / this.number_all_answers) * 100).toFixed(2) 
        : "0.00";

      this.saveResults();
    },
    formatTime(seconds) {
      const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
      const sec = String(seconds % 60).padStart(2, '0');
      return `00:${minutes}:${sec}`;
    },
    async saveResults() {
      if (!this.authStore.user) {
        alert("Пользователь не авторизован. Пожалуйста, войдите в систему.");
        return;
      }

      const testId = 14;
      const scorePercentage = this.accuracy;

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
            score_percentage: Math.round(scorePercentage),
            time: this.time,
            number_all_answers: this.number_all_answers,
            number_correct_answers: this.number_correct_answers
          }),
        });

        if (response.ok) {
          alert("Результаты успешно сохранены!");
        } else {
          alert("Ошибка при сохранении результатов");
        }
      } catch (error) {
        console.error("Ошибка при отправке результатов:", error);
      }
    }
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