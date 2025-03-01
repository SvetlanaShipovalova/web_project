<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <div>
        <h2>Прогрессивные матрицы Равена</h2>

        <!-- Начало теста -->
        <div v-if="!isTestStarted">
          <button @click="startTest">Начать тест</button>
        </div>

        <!-- Ввод возраста -->
        <div v-if="isTestStarted && !isAgeEntered">
          <label for="age">Введите ваш возраст:</label><br />
          <input type="number" v-model="age" id="age" min="1" required /><br />
          <button @click="enterAge">Подтвердить возраст</button>
        </div>

        <!-- Основной тест -->
        <div v-if="isTestStarted && isAgeEntered && !testCompleted">
          <div v-if="currentQuestion">
            <img :src="currentQuestion.image" alt="Matrix" />
            <div class="options">
              <div
                v-for="(option, index) in currentQuestion.options"
                :key="index"
                class="option"
                @click="checkAnswer(option)"
              >
                <img :src="option" alt="Option" />
              </div>
            </div>
          </div>
        </div>

        <!-- Завершение теста -->
        <div v-if="testCompleted">
          <h3>Тест завершен!</h3>
          <p>Правильных ответов: {{ number_correct_answers }} из {{ number_all_answers }}</p>
          <p>Точность: {{ accuracy }}%</p>
          <p>Затраченное время: {{ time }}</p>
          <button @click="restartTest">Начать заново</button>
        </div>

        <router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from "../view/Navbar.vue";
import { useAuthStore } from '../store/authStore';
import m_1 from '../assets/test_res/m_1.png';
import m_1_1 from '../assets/test_res/m_1.1.png';
import m_1_2 from '../assets/test_res/m_1.2.png';
import m_1_3 from '../assets/test_res/m_1.3.png';
import m_2 from '../assets/test_res/m_2.png';
import m_2_1 from '../assets/test_res/m_2.1.png';
import m_2_2 from '../assets/test_res/m_2.2.png';
import m_2_3 from '../assets/test_res/m_2.3.png';
import m_3 from '../assets/test_res/m_3.png';
import m_3_1 from '../assets/test_res/m_3.1.png';
import m_3_2 from '../assets/test_res/m_3.2.png';
import m_3_3 from '../assets/test_res/m_3.3.png';
import m_4 from '../assets/test_res/m_4.png';
import m_4_1 from '../assets/test_res/m_4.1.png';
import m_4_2 from '../assets/test_res/m_4.2.png';
import m_4_3 from '../assets/test_res/m_4.3.png';
import m_5 from '../assets/test_res/m_5.png';
import m_5_1 from '../assets/test_res/m_5.1.png';
import m_5_2 from '../assets/test_res/m_5.2.png';
import m_5_3 from '../assets/test_res/m_5.3.png';
import m_6 from '../assets/test_res/m_6.png';
import m_6_1 from '../assets/test_res/m_6.1.png';
import m_6_2 from '../assets/test_res/m_6.2.png';
import m_6_3 from '../assets/test_res/m_6.3.png';
import m_7 from '../assets/test_res/m_7.png';
import m_7_1 from '../assets/test_res/m_7.1.png';
import m_7_2 from '../assets/test_res/m_7.2.png';
import m_7_3 from '../assets/test_res/m_7.3.png';
import m_8 from '../assets/test_res/m_8.png';
import m_8_1 from '../assets/test_res/m_8.1.png';
import m_8_2 from '../assets/test_res/m_8.2.png';
import m_8_3 from '../assets/test_res/m_8.3.png';
import m_9 from '../assets/test_res/m_9.png';
import m_9_1 from '../assets/test_res/m_9.1.png';
import m_9_2 from '../assets/test_res/m_9.2.png';
import m_9_3 from '../assets/test_res/m_9.3.png';
import m_10 from '../assets/test_res/m_10.png';
import m_10_1 from '../assets/test_res/m_10.1.png';
import m_10_2 from '../assets/test_res/m_10.2.png';
import m_10_3 from '../assets/test_res/m_10.3.png';
import m_11 from '../assets/test_res/m_11.png';
import m_11_1 from '../assets/test_res/m_11.1.png';
import m_11_2 from '../assets/test_res/m_11.2.png';
import m_11_3 from '../assets/test_res/m_11.3.png';
import m_12 from '../assets/test_res/m_12.png';
import m_12_1 from '../assets/test_res/m_12.1.png';
import m_12_2 from '../assets/test_res/m_12.2.png';
import m_12_3 from '../assets/test_res/m_12.3.png';
import m_13 from '../assets/test_res/m_13.png';
import m_13_1 from '../assets/test_res/m_13.1.png';
import m_13_2 from '../assets/test_res/m_13.2.png';
import m_13_3 from '../assets/test_res/m_13.3.png';
import m_14 from '../assets/test_res/m_14.png';
import m_14_1 from '../assets/test_res/m_14.1.png';
import m_14_2 from '../assets/test_res/m_14.2.png';
import m_14_3 from '../assets/test_res/m_14.3.png';
import m_15 from '../assets/test_res/m_15.png';
import m_15_1 from '../assets/test_res/m_15.1.png';
import m_15_2 from '../assets/test_res/m_15.2.png';
import m_15_3 from '../assets/test_res/m_15.3.png';

export default {
  components: { Navbar },
  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },
  data() {
    return {
      currentQuestionIndex: 0,
      number_correct_answers: 0,
      number_all_answers: 0,
      isTestStarted: false,
      isAgeEntered: false,
      testCompleted: false,
      age: null,
      startTime: null,
      timeElapsed: 0,
      time: "00:00:00", 
      questions: [
        {
          image: m_1,
          options: [m_1_1, m_1_2, m_1_3],
          correct: m_1_2,
        },
        {
          image: m_2,
          options: [m_2_1, m_2_2, m_2_3],
          correct: m_2_3,
        },
        {
          image: m_3,
          options: [m_3_1, m_3_2, m_3_3],
          correct: m_3_3,
        },
        {
          image: m_4,
          options: [m_4_1, m_4_2, m_4_3],
          correct: m_4_2,
        },
        {
          image: m_5,
          options: [m_5_1, m_5_2, m_5_3],
          correct: m_5_1,
        },
        {
          image: m_6,
          options: [m_6_1, m_6_2, m_6_3],
          correct: m_6_1,
        },
        {
          image: m_7,
          options: [m_7_1, m_7_2, m_7_3],
          correct: m_7_2,
        },
        {
          image: m_8,
          options: [m_8_1, m_8_2, m_8_3],
          correct: m_8_3,
        },
        {
          image: m_9,
          options: [m_9_1, m_9_2, m_9_3],
          correct: m_9_2,
        },
        {
          image: m_10,
          options: [m_10_1, m_10_2, m_10_3],
          correct: m_10_1,
        },
        {
          image: m_11,
          options: [m_11_1, m_11_2, m_11_3],
          correct: m_11_2,
        },
        {
          image: m_12,
          options: [m_12_1, m_12_2, m_12_3],
          correct: m_12_3,
        },
        {
          image: m_13,
          options: [m_13_1, m_13_2, m_13_3],
          correct: m_13_3,
        },
        {
          image: m_14,
          options: [m_14_1, m_14_2, m_14_3],
          correct: m_14_1,
        },
        {
          image: m_15,
          options: [m_15_1, m_15_2, m_15_3],
          correct: m_15_2,
        },
      ],
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentQuestionIndex];
    },
    accuracy() {
      return this.number_all_answers > 0
        ? ((this.number_correct_answers / this.number_all_answers) * 100).toFixed(2)
        : "0.00";
    },
  },
  methods: {
    startTest() {
      this.isTestStarted = true;
      this.testCompleted = false;
      this.number_correct_answers = 0;
      this.number_all_answers = this.questions.length;
      this.currentQuestionIndex = 0;
      this.timeElapsed = 0;
      this.startTime = Date.now();
    },
    enterAge() {
      if (!this.age || this.age < 1) {
        alert("Введите корректный возраст!");
        return;
      }
      this.isAgeEntered = true;
      this.startTime = Date.now(); // Фиксируем старт времени
    },
    checkAnswer(option) {
      if (option === this.currentQuestion.correct) {
        this.number_correct_answers++;
      }
      if (this.currentQuestionIndex < this.number_all_answers - 1) {
        this.currentQuestionIndex++;
      } else {
        this.endTest();
      }
    },
    endTest() {
      this.testCompleted = true;
      this.timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
      this.time = this.formatTime(this.timeElapsed);
      this.$forceUpdate();
      this.saveResults();
    },
    restartTest() {
      this.isTestStarted = false;
      this.isAgeEntered = false;
      this.testCompleted = false;
      this.timeElapsed = 0;
      this.time = "00:00:00";
    },
    formatTime(seconds) {
      const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
      const sec = String(seconds % 60).padStart(2, "0");
      return `${hours}:${minutes}:${sec}`;
    },
    async saveResults() {
      if (!this.authStore.user) {
        alert("Пользователь не авторизован. Войдите в систему.");
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:8000/api/result/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            test: 15,
            user: this.authStore.user.id,
            score_percentage: parseFloat(this.accuracy),
            time_spent: this.time,
            number_all_answers: this.number_all_answers,
            number_correct_answers: this.number_correct_answers,
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
    },
  },
};
</script>

<style scoped>
.options {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}
.option {
  margin: 0 10px;
  cursor: pointer;
}
.option img {
  width: 100px;
  height: auto;
}
</style>
