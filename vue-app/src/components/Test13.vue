<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <div v-if="currentView === 'start'">
        <h1>Тест на восприятие цвета</h1>
        <p>
          <strong>"Тест на восприятие цвета"</strong> — это игра для тренировки внимания и когнитивной гибкости.
        </p>
        <p>
          <strong>Цель игры:</strong> Выбрать цвет, которым написано слово, а не тот, который оно обозначает.
        </p>
        <button id="start-button" @click="startTest">Начать тест</button>
      </div>

      <div v-else-if="currentView === 'test'">
        <h2>Раунд {{ round }}</h2>
        <p>Выберите цвет, которым написано слово.</p>
        <h1 :style="{ color: currentColor }">{{ currentWord }}</h1>

        <div class="buttons">
          <button v-for="color in shuffledColors" :key="color" @click="checkAnswer(color)" :style="{ color: color }">{{ colorNames[color] }}</button>
        </div>
      </div>

      <div v-else-if="currentView === 'result'">
        <h1>Результаты</h1>
        <p>Точность: {{ accuracy }}%</p>
        <p>Время: {{ time }}</p>
        <p>Вопросов: {{ number_all_answers }}</p>
        <p>Верных ответов: {{ number_correct_answers }}</p>
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
      colors: ["red", "blue", "green", "yellow", "black"],
      colorNames: { red: "Красный", blue: "Синий", green: "Зелёный", yellow: "Жёлтый", black: "Чёрный" },
      currentWord: "",
      currentColor: "",
      shuffledColors: [],
      number_all_answers: 10,
      number_correct_answers: 0,
      totalTime: 0,
      startTime: null
    };
  },
  computed: {
    time() {
      return `${this.totalTime.toFixed(2)} сек`;
    },
    accuracy() {
      if (this.number_all_answers === 0) return 0;
      return Math.round((this.number_correct_answers / this.number_all_answers) * 100);
    }
  },
  methods: {
    startTest() {
      this.currentView = 'test';
      this.startTime = performance.now();
      this.nextRound();
    },

    nextRound() {
      if (this.round > this.number_all_answers) {
        this.endTest();
        return;
      }
      const randomIndex = Math.floor(Math.random() * this.colors.length);
      this.currentWord = this.colorNames[this.colors[randomIndex]];
      this.currentColor = this.colors[(randomIndex + Math.floor(Math.random() * (this.colors.length - 1) + 1)) % this.colors.length];
      this.shuffledColors = [...this.colors].sort(() => Math.random() - 0.5);
    },

    checkAnswer(color) {
      if (color === this.currentColor) {
        this.number_correct_answers++;
      }
      this.round++;
      this.nextRound();
    },

    endTest() {
      this.totalTime = (performance.now() - this.startTime) / 1000;
      this.currentView = 'result';
      this.saveResults();
    },

    restartTest() {
      this.round = 1;
      this.number_correct_answers = 0;
      this.totalTime = 0;
      this.currentView = 'start';
    },

    goBack() {
      this.$router.push('/tests');
    },

    async saveResults() {
      if (!this.authStore.user) {
        alert("Для сохранения результатов необходимо авторизоваться");
        return;
      }
      try {
        await fetch("https://svetasy.pythonanywhere.com/api/result/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            test: 2,
            user: this.authStore.user.id,
            score_percentage: this.accuracy,
            time: this.time,
            number_all_answers: this.number_all_answers,
            number_correct_answers: this.number_correct_answers
          }),
        });
        alert("Результаты успешно сохранены!");
      } catch (error) {
        console.error("Ошибка при отправке результатов:", error);
      }
    }
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

h1 {
  font-size: 2rem;
  margin: 20px 0;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}

button {
  padding: 10px 20px;
  font-size: 1.2rem;
  cursor: pointer;
  border: none;
  background-color: #f0f0f0;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #ddd;
}
</style>
