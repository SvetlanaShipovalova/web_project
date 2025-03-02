<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <div v-if="currentView === 'start'">
        <h1>Проверка на быстроту реакции и сообразительность</h1>
        <button id="start-button" @click="startTest">Начать тест</button>
      </div>

      <div v-else-if="currentView === 'test'">
        <h2>Вопрос {{ currentQuestionIndex + 1 }}</h2>
        <p>{{ currentQuestion.text }}</p>
        <ul class="horizontal-options">
          <button v-for="(option, index) in currentQuestion.options" :key="index" @click="checkAnswer(index)">{{ option }}</button>
        </ul>
        <p>Ошибки: {{ missClicks }}</p>
        <p>Время: {{ formatTime(timer) }}</p>
        <div class="controls">
          <button @click="endTest" id="text">Завершить тест</button>
        </div>
      </div>

      <div v-else-if="currentView === 'result'">
        <h1>Результаты теста</h1>
        <p>Правильных ответов: {{ number_all_answers }} из {{ number_correct_answers }}</p>
        <p>Ошибок: {{ missClicks }}
          <span v-if="missClicks > 0"> (Вопросы: {{ errorQuestions.join(', ') }})</span>
        </p>
        <p>Общее время: {{ formatTime(totalTime) }}</p>
        <p>Точность: {{ accuracy }}%</p>
        <p>Самый сложный вопрос: Вопрос №{{ hardestQuestionIndex + 1 }} (время: {{ hardestQuestionTime.toFixed(3) }} сек)</p>
        <button @click="restartTest" id="text">Пройти заново</button>
        <button @click="goBack" id="text">Вернуться назад</button>
      </div>
    </div>
    <router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
  </div>
</template>

<script>
import Navbar from "../view/Navbar.vue";
import { useAuthStore } from '../store/authStore'; 

export default {
  components: { Navbar },
  setup() {
    const authStore = useAuthStore(); 
    return { authStore };
  },
  data() {
    return {
      currentView: 'start',
      currentQuestionIndex: 0,
      missClicks: 0,
      timer: 0,
      totalTime: 0,
      hardestQuestionIndex: null,
      hardestQuestionTime: 0,
      questionStartTime: 0,
      questionStartGlobalTime: 0,
      errorQuestions: [],
      number_correct_answers: 0, 
      number_all_answers: 0, 
      questions: [
        {
          text: 'Найдите лишнее:',
          options: ['Таращиться', 'Наблюдать', 'Моргать', 'Глазеть', 'Смотреть'],
          correct: 'Моргать',
        },
        {
          text: 'Найди лишнее:',
          options: ['Клоун', 'Акробат', 'Шут', 'Канатоходец'],
          correct: 'Акробат',
        },
        {
          text: 'Найди лишнее:',
          options: ['Июнь', 'Март', 'Май', 'Июль'],
          correct: 'Март',
        },
        {
          text: 'Найди лишнее:',
          options: ['Превосходный', 'Поэтичный', 'Величественный', 'Грандиозный'],
          correct: 'Поэтичный',
        },
        {
          text: 'Найди лишнее:',
          options: ['Хлопок', 'Шерсть', 'Шелк', 'Лён', 'Эластан'],
          correct: 'Эластан',
        },
        {
          text: 'Найди лишнее:',
          options: ['Самолёт', 'Машина', 'Птица', 'Ракета', 'Бабочка'],
          correct: 'Машина',
        },
        {
          text: 'Найди лишнее:',
          options: ['Жёлтый', 'Синий', 'Зелёный'],
          correct: 'Жёлтый',
        },
        {
          text: 'Найди лишнее:',
          options: ['2', '6', '7', '4'],
          correct: '7',
        },
        {
          text: 'Найди лишнее:',
          options: ['Радар', 'Заказ', 'Кабак', 'Топор'],
          correct: 'Топор',
        },
        {
          text: 'Найди лишнее:',
          options: ['Сельдерей', 'Огурец', 'Авокадо', 'Киви'],
          correct: 'Киви',
        },
      ],
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentQuestionIndex];
    },
    accuracy() {
      return ((this.number_all_answers / this.number_correct_answers) * 100).toFixed(2);
    }
  },
  methods: {
    startTest() {
      this.currentView = 'test';
      this.currentQuestionIndex = 0;
      this.missClicks = 0;
      this.timer = 0;
      this.totalTime = 0;
      this.hardestQuestionIndex = null;
      this.hardestQuestionTime = 0;
      this.errorQuestions = [];
      this.questionStartGlobalTime = performance.now();
      this.questionStartTime = performance.now();
      this.number_correct_answers = this.questions.length;
      this.number_all_answers = 0; 
      this.startTimer();
    },
    startTimer() {
      this.timerInterval = setInterval(() => {
        this.timer = performance.now() - this.questionStartGlobalTime;
      }, 10);
    },
    stopTimer() {
      clearInterval(this.timerInterval);
    },
    checkAnswer(selectedIndex) {
      const selectedOption = this.currentQuestion.options[selectedIndex];
      const questionTime = (performance.now() - this.questionStartTime) / 1000;

      if (selectedOption === this.currentQuestion.correct) {
        this.number_all_answers++; 
      } else {
        this.missClicks++;
        this.errorQuestions.push(this.currentQuestionIndex + 1);
      }

      if (questionTime > this.hardestQuestionTime) {
        this.hardestQuestionTime = questionTime;
        this.hardestQuestionIndex = this.currentQuestionIndex;
      }

      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
        this.questionStartTime = performance.now();
      } else {
        this.endTest();
      }
    },
    endTest() {
      this.stopTimer();
      this.totalTime = performance.now() - this.questionStartGlobalTime;
      this.currentView = 'result';
      this.saveResults(); 
    },
    formatTime(timeInMilliseconds) {
      const totalSeconds = Math.floor(timeInMilliseconds / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}.${String(seconds).padStart(2, '0')}`;
    },
    restartTest() {
      this.startTest();
    },
    goBack() {
      this.currentView = 'start';
    },
    async saveResults() {
      if (!this.authStore.user) {
        alert("Пользователь не авторизован. Пожалуйста, войдите в систему.");
        return;
      }

      const testId = 3; 
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
            time: this.formatTime(this.totalTime),
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

.horizontal-options {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
}

.horizontal-options button {
  padding: 10px 20px;
  font-size: 16px;
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