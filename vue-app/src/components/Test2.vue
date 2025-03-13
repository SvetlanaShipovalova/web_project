<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <div v-if="currentView === 'start'">
        <h1>Тест числового охвата</h1>
        <p><strong>Игра:</strong> Тест таблицы Шульте помогает развивать внимание, концентрацию и скорость обработки визуальной информации.</p>
        <p><strong>Цель игры:</strong> Число отображается на экране в течение 3 секунд, затем исчезает. Ваша задача — запомнить показанное число и затем выбрать его на экране. Если число двузначное, необходимо нажимать цифры последовательно.</p>
        <button id="start-button" @click="startTest">Начать тест</button>
      </div>

      <div v-else-if="currentView === 'test'">
        <h2>Раунд {{ round }}</h2>
        <p>Запомните число, а затем выберите его на клавиатуре.</p>
        <p>Загаданное число исчезнет через: {{ remainingTime }} сек</p>

        <div class="digit-to-remember">
          <h2 v-if="showDigit">{{ currentDigit }}</h2>
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
      remainingTime: 5,
      currentDigit: null,
      showDigit: false,
      userInput: "",
      totalTime: 0,
      number_all_answers: 7,    // Всего раундов/вопросов
      number_correct_answers: 0 // Счётчик правильных ответов
    };
  },
  computed: {
    time() {
      return this.formatTime(this.totalTime);
    },
    accuracy() {
      if (this.number_all_answers === 0) return 0;
      const calculated = (this.number_correct_answers / this.number_all_answers) * 100;
      return Math.round(calculated);
    }
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
      // Генерация числа в зависимости от раунда
      this.currentDigit = this.round > 4
        ? Math.floor(Math.random() * 90) + 10 // Двузначные для раундов 5-7
        : Math.floor(Math.random() * 10);     // Однозначные для раундов 1-4

      this.showDigit = true;
      this.userInput = "";
      this.remainingTime = 3;

      // Таймер показа числа
      const countdown = setInterval(() => {
        this.remainingTime--;
        if (this.remainingTime <= 0) {
          clearInterval(countdown);
          this.showDigit = false;
        }
      }, 1000);
    },

    checkAnswer(number) {
      if (this.showDigit) return;

      this.userInput += number.toString();

      // Проверка завершённости ввода
      const requiredLength = this.round > 4 ? 2 : 1;
      if (this.userInput.length === requiredLength) {
        const userAnswer = parseInt(this.userInput);
        if (userAnswer === this.currentDigit) {
          this.number_correct_answers += 1;
        }
        this.endRound();
      }
    },

    endRound() {
      // Добавляем время раунда к общему времени
      this.totalTime += (3 - this.remainingTime);

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
        const payload = {
          test: 2,
          user: this.authStore.user.id,
          score_percentage: this.accuracy,
          time: this.time,
          number_all_answers: this.number_all_answers,
          number_correct_answers: this.number_correct_answers
        };

        console.log('Saving results:', payload);

        const response = await fetch("/api/result/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload)
        });

        const responseData = await response.json();
        console.log('Server response:', responseData);

        if (!response.ok) {
          throw new Error(responseData.error || 'Unknown server error');
        }

        alert("Результаты успешно сохранены!");
      } catch (error) {
        console.error("Save error:", error);
        alert(`Ошибка сохранения: ${error.message}`);
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