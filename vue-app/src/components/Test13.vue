<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <div>
        <div v-if="!gameStarted">
          <h2>Тест на зрительно-моторную координацию</h2>
          <p>В каждом раунде ты увидишь два шарика. Шарики будут двигаться вдоль своей оси,
            <br> и твоя цель - заставить их остановиться как можно ближе к пересечению линий.</p>
          <button @click="startGame" class="start-button">Начать игру</button>
        </div>
        <div v-else>
          <div class="game-container" @click="stopNextBall">
            <div class="line vertical"></div>
            <div class="line horizontal"></div>
            <div
              v-for="(ball, index) in balls"
              :key="index"
              class="ball"
              :style="{
              left: ball.x + 'px',
              top: ball.y + 'px',
              backgroundColor: ball.color
            }"
            ></div>
            <div class="score">Score: {{ score }}</div>
            <div class="level">Level: {{ level }}</div>
          </div>
          <div class="result" v-if="resultMessage">{{ resultMessage }}</div>
          <div class="final-result" v-if="finalMessage">
            {{ finalMessage }}
            <p>Время выполнения теста: {{ time }}</p>
            <p>Точность: {{ accuracy }}%</p>
            <p>Попаданий близко к центру: {{ number_all_answers }}</p>
            <p>Общее количество попыток: {{ number_correct_answers }}</p>
          </div>
          <button v-if="finalMessage" @click="restartGame" class="restart-button">Начать заново</button>
        </div>
        <br> <router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
      </div>
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
      balls: [
        { x: 140, y: 0, color: this.getRandomColor(), moving: true, direction: 'down' },
        { x: 0, y: 140, color: this.getRandomColor(), moving: true, direction: 'right' },
      ],
      score: 0,
      speed: 2,
      interval: null,
      nextBallIndex: 0,
      resultMessage: '',
      finalMessage: '',
      level: 1,
      time: "00:00:00",  // Время выполнения теста в формате ЧЧ:ММ:СС
number_all_answers: 0,  // Сколько раз игрок попал близко к центру
number_correct_answers: 0,  // Общее количество попыток
      accuracy: 0,  // Точность
      gameStartTime: null,  // Время начала игры
    };
  },
  methods: {
    startGame() {
  this.gameStarted = true;
  this.score = 0;
  this.level = 1;
  this.speed = 2;
  this.gameStartTime = Date.now();  // Время начала игры
  this.number_all_answers = 0;  // Обнулить попадания
  this.number_correct_answers = 0;  // Обнулить попытки
  this.balls.forEach((ball, index) => {
    ball.x = index === 0 ? 140 : 0;
    ball.y = index === 0 ? 0 : 140;
    ball.moving = true;
  });
  this.nextBallIndex = 0;
  this.resultMessage = '';
  this.finalMessage = '';
  this.startInterval();
},
    startInterval() {
      this.interval = setInterval(() => {
        this.moveBalls();
        this.time = ((Date.now() - this.gameStartTime) / 1000).toFixed(1);  // Вычисляем время
      }, 50);
    },
    moveBalls() {
      this.balls.forEach((ball) => {
        if (ball.moving) {
          if (ball.direction === 'down') {
            ball.y += this.speed;
            if (ball.y > 300) {
              ball.y = 0;
            }
          } else if (ball.direction === 'up') {
            ball.y -= this.speed;
            if (ball.y < 0) {
              ball.y = 300;
            }
          }
          if (ball.direction === 'right') {
            ball.x += this.speed;
            if (ball.x > 300) {
              ball.x = 0;
            }
          } else if (ball.direction === 'left') {
            ball.x -= this.speed;
            if (ball.x < 0) {
              ball.x = 300;
            }
          }
        }
      });
    },
    stopNextBall() {
  if (this.nextBallIndex < this.balls.length) {
    const ball = this.balls[this.nextBallIndex];
    ball.moving = false;
    this.number_correct_answers++; // Увеличиваем количество попыток

    if (this.isAccurate(ball)) {
      this.number_all_answers++; // Увеличиваем количество точных попаданий
    }

    this.calculateScore();
    this.nextBallIndex++;

    if (this.nextBallIndex === this.balls.length) {
      this.displayResult();
      this.nextLevel();
    }
  }
},
isAccurate(ball) {
  const centerX = 140;
  const centerY = 140;
  const distance = Math.sqrt((ball.x - centerX) ** 2 + (ball.y - centerY) ** 2);
  return distance <= 10; // Попадание в центр, если расстояние до пересечения < 10 px
},
    calculateScore() {
      const centerX = 140;
      const centerY = 140;

      this.balls.forEach((ball) => {
        const distance = Math.sqrt(
          (ball.x - centerX) ** 2 + (ball.y - centerY) ** 2
        );
        this.score += Math.max(0, 100 - distance);
      });
    },
    displayResult() {
  if (this.score > 1100) {
    this.resultMessage = 'Отличный уровень координации';
  } else if (this.score >= 1000) {
    this.resultMessage = 'Средний уровень координации';
  } else {
    this.resultMessage = 'Нуждается в улучшении';
  }
  
  this.accuracy = ((this.number_all_answers / this.number_correct_answers) * 100).toFixed(2);
},
nextLevel() {
  if (this.level < 3) {
    this.level++;
    this.speed += 1;
    this.resetGame();
  } else {
    this.finalMessage = "Игра завершена! Ваш финальный счет: " + this.score;
    clearInterval(this.interval);
    this.time = this.formatTime(Math.floor((Date.now() - this.gameStartTime) / 1000)); // Форматирование времени
    this.saveResults(); // Сохранение результатов
  }
},
formatTime(seconds) {
  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const sec = String(seconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${sec}`;
},
    resetGame() {
      this.balls.forEach((ball, index) => {
        ball.x = index === 0 ? 140 : 0;
        ball.y = index === 0 ? 0 : 140;
        ball.moving = true;
      });
      this.nextBallIndex = 0;
      this.resultMessage = '';
    },
    restartGame() {
      this.startGame();
    },
    getRandomColor() {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
    async saveResults() {
  if (!this.authStore.user) {
    alert("Пользователь не авторизован. Пожалуйста, войдите в систему.");
    return;
  }

  const testId = 13;
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
        time_spent: this.time, // Время в формате HH:MM:SS
        number_all_answers: this.number_all_answers, // Количество попаданий в центр
        number_correct_answers: this.number_correct_answers // Общее количество попыток
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
  mounted() {},
  beforeUnmount() {
    clearInterval(this.interval);
  },
};
</script>

<style scoped>
.game-container {
  position: relative;
  width: 300px;
  height: 300px;
  margin: auto;
  background-color: #f0f0f0;
  overflow: hidden;
}

.line {
  position: absolute;
  background-color: #000;
}

.vertical {
  width: 2px;
  height: 100%;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
}

.horizontal {
  height: 2px;
  width: 100%;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}

.ball {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
}

.score {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 24px;
  color: #333;
}

.level {
  position: absolute;
  top: 40px;
  left: 10px;
  font-size: 24px;
  color: #333;
}

.result {
  margin-top: 10px;
  text-align: center;
  font-size: 20px;
  color: #333;
}

.final-result {
  margin-top: 5px;
  text-align: center;
  font-size: 20px;
  color: #333;
}

</style>
