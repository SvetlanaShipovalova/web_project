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
    const authStore = useAuthStore(); // Используем хранилище
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
    };
  },
  methods: {
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
            this.accuracy = 100;
          } else {
            this.accuracy = 0;
          }
          this.endRound();
        }
      } else {
        if (parseInt(this.userInput) === this.currentDigit) {
          this.accuracy = 100;
          this.endRound();
        }
      }
    },
    endRound() {
      this.results.push(this.accuracy);
      if (this.round < 7) {
        this.round++;
        this.startRound();
      } else {
        this.currentView = 'result';
        this.saveResults(); // Сохраняем результаты после завершения теста
      }
    },
    restartTest() {
      this.round = 1;
      this.results = [];
      this.accuracy = 0;
      this.userInput = "";
      this.currentView = 'start';
    },
    goBack() {
      this.currentView = 'start';
    },
    async saveResults() {
      if (!this.authStore.user) {
        alert("Пользователь не авторизован. Пожалуйста, войдите в систему.");
        return;
      }

      const testId = 2; // ID второго теста
      const scorePercentage = this.calculateAverageAccuracy(); // Средняя точность

      try {
        const response = await fetch("http://127.0.0.1:8000/api/result/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            test: testId, // Используем ID теста
            user: this.authStore.user.id, // ID пользователя
            score_percentage: parseFloat(scorePercentage), // Преобразуем в число
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
    calculateAverageAccuracy() {
      if (this.results.length === 0) return 0;
      const sum = this.results.reduce((acc, curr) => acc + curr, 0);
      return (sum / this.results.length).toFixed(2);
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
