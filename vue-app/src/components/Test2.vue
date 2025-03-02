<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <div v-if="currentView === 'start'">
        <h1>Тест числового охвата</h1>
        <button id="start-button" @click="startTest">Начать тест</button>
      </div>

      <div v-else-if="currentView === 'test'">
        <h2>Раунд {{ round }}</h2>
        <p>Запомните число, а затем выберите его на клавиатуре.</p>
        <p>Загаданное число исчезнет через: {{ remainingTime }} сек</p>

        <div class="digit-to-remember">
          <span v-if="showDigit">{{ currentDigit }}</span>
        </div>

        <div class="buttons" v-if="!showDigit">
          <button v-for="i in 9" :key="i" @click="checkAnswer(i)">{{ i }}</button>
          <button @click="checkAnswer(0)">0</button>
        </div>
      </div>

      <div v-else-if="currentView === 'result'">
        <h1>Результаты</h1>
        <p>Раунд {{ round }} завершён!</p>
        <p>Точность: {{ accuracy }}%</p>
        <p>Время: {{ time }}</p>
        <p>Вопросов: {{ number_correct_answers }}</p>
        <p>Верных ответов: {{ number_all_answers }}</p>
        <button @click="restartTest">Повторить</button>
        <button @click="goBack">Назад</button>
      </div>
    </div>
    <router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
  </div>
</template>

<script>
import Navbar from "../view/Navbar.vue";
import { useAuthStore } from '../store/authStore';

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
      currentView: 'start',
      round: 1,
      remainingTime: 5,
      currentDigit: null,
      showDigit: false,
      accuracy: 0,
      results: [],
      userInput: "",
      time: "00:00:00",
      number_correct_answers: 7,
      number_all_answers: 7, 
    };
  },
  computed: {
    accuracy() {
      return this.number_correct_answers > 0
        ? ((this.number_all_answers / this.number_correct_answers) * 100).toFixed(2)
        : 0;
    },
  },
  methods: {
    formatTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    },
    startTest() {
      this.currentView = 'test';
      this.startRound();
    },
    startRound() {
      if (this.round > 4) {
        this.currentDigit = Math.floor(Math.random() * 90) + 10;
      } else {
        this.currentDigit = Math.floor(Math.random() * 10);
      }

      this.showDigit = true;
      this.userInput = "";
      this.remainingTime = 3;
      this.time = "00:00:00";

      let countdown = setInterval(() => {
        this.remainingTime--;
        if (this.remainingTime <= 0) {
          clearInterval(countdown);
          this.showDigit = false;
        }
      }, 1000);
    },
    checkAnswer(number) {
      if (this.showDigit) return;

      this.userInput += number;

      if (this.round > 4) {
        if (this.userInput.length === 2) {
          if (parseInt(this.userInput) === this.currentDigit) {
            // Правильный ответ
          } else {
            this.number_all_answers -= 1;
          }
          this.endRound();
        }
      } else {
        if (parseInt(this.userInput) === this.currentDigit) {
          // Правильный ответ
        } else {
          this.number_all_answers -= 1; 
        }
        this.endRound();
      }
    },
    endRound() {
      const timeSpent = 5 - this.remainingTime;
      this.time = this.formatTime(timeSpent);

      this.results.push(this.accuracy);

      if (this.round < 7) {
        this.round++;
        this.startRound();
      } else {
        this.currentView = 'result';
        this.saveResults();
      }
    },
    restartTest() {
      this.round = 1;
      this.results = [];
      this.number_all_answers = 7;
      this.userInput = "";
      this.currentView = 'start';
    },
    goBack() {
      this.currentView = 'start';
      this.round = 1;
      this.number_all_answers = 7;
    },
    async saveResults() {
      if (!this.authStore.user) {
        alert("Пользователь не авторизован. Пожалуйста, войдите в систему.");
        return;
      }

      const testId = 2;
      const scorePercentage = this.accuracy;

      try {
        const response = await fetch("https://svetasy.pythonanywhere.com/api/result/", {
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
            number_all_answers: this.number_all_answers,
            number_correct_answers: this.number_correct_answers,
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
  }
};
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.digit-to-remember {
  font-size: 3rem;
  margin: 20px 0;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  max-width: 300px;
  margin: 0 auto;
}

button {
  padding: 20px;
  font-size: 1.5rem;
  cursor: pointer;
}
</style>