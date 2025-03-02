<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <div v-if="currentView === 'start'">
        <h1>Тест таблицы Шульте</h1>
        <button id="start-button" @click="startTest">Начать тест</button>
      </div>

      <div v-else-if="currentView === 'test'">
        <h2>Раунд {{ round }}</h2>
        <p>Найдите числа от 1 до {{ maxNumber }} в порядке возрастания.</p>
        <p>Оставшееся время: {{ remainingTime }} сек</p>
        <p>Количество ошибок: {{ missClicks }}</p>
        <div class="grid">
          <button
            v-for="number in shuffledNumbers"
            :key="number"
            :disabled="clickedNumbers.includes(number)"
            @click="checkNumber(number)"
            class="grid-button"
          >
            {{ number }}
          </button>
        </div>
        <div class="controls">
          <button @click="restartTest" id="text">Начать заново</button>
        </div>
      </div>

      <div v-else-if="currentView === 'result'">
        <h1>Результаты</h1>
        <p v-for="(time, index) in results" :key="index">
          Раунд {{ index + 1 }}: {{ formatTime(time) }} сек
        </p>
        <h2>Итог:</h2>
        <p>Ошибок: {{ totalMissClicks }}</p>
        <p>Точность: {{ accuracy }}%</p>
        <p>Время: {{ time }}</p>
        <p>Вопросов: {{ number_all_answers }}</p>
        <p>Верных ответов: {{ number_correct_answers }}</p>
        <button @click="restartTest" id="text">Повторить попытку</button>
        <button @click="goBack" id="text">Вернуться назад</button>
      </div>
    </div>
    <router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
  </div>
</template>

<script>
import Navbar from "../view/Navbar.vue";
import { useAuthStore } from "../store/authStore";

export default {
  components: {
    Navbar,
  },
  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },
  data() {
    return {
      currentView: "start",
      round: 1,
      timer: null,
      remainingTime: 60,
      maxNumber: 12,
      numbers: [],
      shuffledNumbers: [],
      clickedNumbers: [],
      results: [],
      missClicks: 0,
      totalMissClicks: 0,
      gridDimensions: { rows: 4, cols: 3 },
      time: "00:00:00",
      number_all_answers: 48, // Общее количество вопросов
    };
  },
  computed: {
    accuracy() {
      const totalClicks = this.round * this.maxNumber;
      return totalClicks > 0
        ? (((totalClicks - this.totalMissClicks) / totalClicks) * 100).toFixed(2)
        : 0;
    },
    number_correct_answers() {
      return this.number_all_answers - this.totalMissClicks; // Вычисляем количество правильных ответов
    },
  },
  methods: {
    addTime(secondsToAdd) {
      const [hours, minutes, secs] = this.time.split(":").map(Number);
      let totalSeconds = hours * 3600 + minutes * 60 + secs;
      totalSeconds += secondsToAdd;

      const newHours = Math.floor(totalSeconds / 3600);
      const newMinutes = Math.floor((totalSeconds % 3600) / 60);
      const newSecs = totalSeconds % 60;

      this.time = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}:${String(newSecs).padStart(2, '0')}`;
    },
    startTest() {
      this.resetRound();
      this.currentView = "test";
      this.startTimer();
    },
    startTimer() {
      this.stopTimer();
      this.timer = setInterval(() => {
        this.remainingTime--;
        if (this.remainingTime <= 0) {
          this.handleTimeout();
        }
      }, 1000);
    },
    stopTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    shuffle(array) {
      return array.sort(() => Math.random() - 0.5);
    },
    checkNumber(number) {
      if (number === this.clickedNumbers.length + 1) {
        this.clickedNumbers.push(number);
        if (this.clickedNumbers.length === this.maxNumber) {
          this.finishRound();
        }
      } else {
        this.missClicks += 1;
        if (this.missClicks >= 3) {
          this.restartRound();
        }
      }
    },
    handleTimeout() {
      this.missClicks += 1;
      if (this.missClicks >= 3) {
        this.restartRound();
      }
    },
    finishRound() {
      this.stopTimer();
      const timeSpent = 60 - this.remainingTime;
      this.totalMissClicks += this.missClicks;
      this.addTime(timeSpent);
      if (this.round < 3) {
        this.round += 1;
        this.resetRound();
        this.startTimer();
      } else {
        this.currentView = "result";
        this.saveResults();
      }
    },
    restartRound() {
      this.missClicks = 0;
      this.resetRound();
      this.startTimer();
    },
    resetRound() {
      this.remainingTime = 60;
      this.clickedNumbers = [];
      this.missClicks = 0;
      if (this.round === 1) {
        this.maxNumber = 12;
        this.gridDimensions = { rows: 4, cols: 3 };
      } else if (this.round === 2) {
        this.maxNumber = 16;
        this.gridDimensions = { rows: 4, cols: 4 };
      } else {
        this.maxNumber = 20;
        this.gridDimensions = { rows: 5, cols: 4 };
      }
      this.numbers = Array.from({ length: this.maxNumber }, (_, i) => i + 1);
      this.shuffledNumbers = this.shuffle([...this.numbers]);
    },
    restartTest() {
      this.round = 1;
      this.totalMissClicks = 0;
      this.time = "00:00:00";
      this.startTest();
    },
    goBack() {
      this.currentView = "start";
      this.round = 1;
      this.totalMissClicks = 0;
      this.time = "00:00:00";
    },
    async saveResults() {
      if (!this.authStore.user) {
        alert("Пользователь не авторизован. Пожалуйста, войдите в систему.");
        return;
      }

      const testId = 1;
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
            score_percentage: parseFloat(scorePercentage),
            time: this.time,
            number_correct_answers: this.number_correct_answers,
            number_all_answers: this.number_all_answers,
            accuracy: parseFloat(scorePercentage),
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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 10px;
  margin: 20px auto;
  max-width: 300px;
}

.grid-button {
  padding: 20px;
  font-size: 18px;
  cursor: pointer;
}

.controls {
  margin-top: 20px;
}

button {
  margin: 5px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}
</style>