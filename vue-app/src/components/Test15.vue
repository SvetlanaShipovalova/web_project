<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <div>
        <h2>Прогрессивные матрицы Равена</h2>

        <div v-if="!isTestStarted">
          <button @click="startTest">Начать тест</button>
        </div>

        <div v-if="isTestStarted && !isAgeEntered">
          <label for="age">Введите ваш возраст:</label><br />
          <input type="number" v-model="age" id="age" min="0" /><br />
          <button @click="enterAge">Подтвердить возраст</button>
        </div>

        <div v-if="isTestStarted && isAgeEntered">
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
            <div>Ограничение по времени: {{ remainingTime }} секунд</div>
          </div>
          <div v-else>
            <h3>Тест завершен!</h3>
            <p>Процент выполнения: {{ accuracy }}%</p>
            <p>Затраченное время: {{ time }} секунд</p>
            <p>{{ intelligenceLevel }}</p>
            <button @click="restartTest">Начать заново</button>
          </div>
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
    const authStore = useAuthStore(); // Используем хранилище
    return { authStore };
  },
  data() {
    return {
      currentQuestionIndex: 0,
      correctAnswersCount: 0, // Счетчик правильных ответов
      isTestStarted: false,
      isAgeEntered: false,
      age: null,
      remainingTime: 1200, // 20 минут в секундах
      timer: null,
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
      time: 0,
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentQuestionIndex];
    },
    accuracy() {
      const coefficient = this.getCoefficient();
      const totalQuestions = this.questions.length;
      return ((this.correctAnswersCount / totalQuestions) * 100 * coefficient).toFixed(2); // Процент выполнения
    },
    intelligenceLevel() {
      const score = this.accuracy;
      if (score > 90) return 'Незаурядный, выдающийся интеллект';
      else if (score >= 80) return 'Высокий уровень интеллекта';
      else if (score >= 70) return 'Интеллект выше среднего';
      else if (score >= 60) return 'Средний уровень интеллекта';
      else if (score >= 50) return 'Интеллект ниже среднего';
      else if (score >= 50) return 'Низкий уровень интеллекта';
      else if (score >= 40) return 'Легкая степень слабоумия';
      else if (score >= 30) return 'Средняя степень слабоумия';
      else return 'Тяжелая степень слабоумия';
    },
  },
  methods: {
    startTest() {
      this.isTestStarted = true;
      this.correctAnswersCount = 0; // Сброс счетчика
      this.currentQuestionIndex = 0;
      this.time = 0; // Сброс общего времени
      this.remainingTime = 1200; // Сброс времени
      this.startTimer(); // Запуск таймера
    },
    enterAge() {
      this.isAgeEntered = true;
    },
    startTimer() {
      this.timer = setInterval(() => {
        if (this.remainingTime > 0) {
          this.remainingTime--;
          this.time++; // Увеличиваем общее время
        } else {
          clearInterval(this.timer);
          this.currentQuestionIndex = this.questions.length; // Завершение теста
          this.saveResults(); // Сохраняем результаты
        }
      }, 1000);
    },
    checkAnswer(option) {
      if (option === this.currentQuestion.correct) {
        this.correctAnswersCount++; // Увеличиваем счетчик правильных ответов
      }
      this.nextQuestion();
    },
    nextQuestion() {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
      } else {
        clearInterval(this.timer);
        this.currentQuestionIndex = this.questions.length; // Завершение теста
        this.saveResults(); // Сохраняем результаты
      }
    },
    restartTest() {
      this.remainingTime = 1200; // Сброс времени
      this.isTestStarted = false; // Завершение теста
      this.isAgeEntered = false; // Сброс возраста
      this.correctAnswersCount = 0; // Сброс счетчика правильных ответов
      this.currentQuestionIndex = 0; // Сброс индекса вопросов
      this.time = 0; // Сброс общего времени
      clearInterval(this.timer); // Остановка таймера
    },
    getCoefficient() {
      if (this.age >= 18 && this.age <= 25) return 0.9;
      else if (this.age >= 26 && this.age <= 35) return 0.8;
      else if (this.age >= 36 && this.age <= 45) return 0.7;
      else if (this.age >= 46) return 0.6;
      else return 1.0; // Для возрастов до 18 лет
    },
    async saveResults() {
      if (!this.authStore.user) {
        alert("Пользователь не авторизован. Пожалуйста, войдите в систему.");
        return;
      }

      const testId = 15; // ID пятнадцатого теста
      const scorePercentage = parseFloat(this.accuracy); // Точность в процентах

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
            score_percentage: scorePercentage, // Точность в процентах
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
  beforeUnmount() {
    clearInterval(this.timer); // Остановка таймера при размонтировании
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

