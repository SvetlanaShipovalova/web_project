<template>
    <Navbar />
    <div class="container mt-5 text-center">
        <div class="game-container sequence-test-container">
            <div v-if="!gameStarted && !gameEnded">
            <h1>Тест Числовых Последовательностей</h1>
                <h2>{{ $route.params.name }}</h2>
                <p><strong>Игра:</strong> "Тест Числовых Последовательностей" — это когнитивный тест, направленный на развитие логического мышления, аналитических способностей и умения выявлять закономерности.</p>
                <p><strong>Цель игры:</strong> Определить недостающее число в числовой последовательности, выбрав правильный вариант среди предложенных ответов.</p>
                <p>Нажмите "Начать тест", чтобы приступить к решению задач. На экране появится числовая последовательность с пропущенным элементом. Вам необходимо проанализировать закономерность и выбрать верный ответ из предложенных вариантов.</p>
                <button class="start-button" @click="startGame">Начать тест</button>
            </div>
  
            <div v-else-if="gameStarted">
                <div class="info">
                    <p>Вопрос: {{ currentQuestion + 1 }} / {{ number_all_answers }}</p>
                    <p>Правильные ответы: {{ number_correct_answers }} / {{ number_all_answers }}</p>
                </div>
                <div class="sequence">
                    <h3 v-html="questions[currentQuestion].sequence"></h3>
                </div>
                <div class="answers">
                    <button
                        v-for="(option, index) in questions[currentQuestion].options"
                        :key="index"
                        @click="handleAnswer(option)"
                        :disabled="answered"
                        class="answer-button mx-1"
                    >
                        {{ option }}
                    </button>
                </div>
                <p v-if="answered" class="feedback message mt-3">{{ feedback }}</p>
            </div>
  
            <div v-if="gameEnded" class="results end-message">
                <h3>Тест завершён!</h3>
                <p>Вы ответили правильно на {{ number_correct_answers }} из {{ number_all_answers }} вопросов.</p>
                <p>Точность: {{ accuracy }}%</p>
                <p>Время выполнения: {{ time }}</p>
                <p class="final-message">{{ finalMessage }}</p>
                <p><strong>Попробуйте улучшить свой результат, анализируя числа быстрее и точнее!</strong></p>
            </div>
            <br><router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
        </div>
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
          gameStarted: false,
          gameEnded: false,
          currentQuestion: 0,
          answered: false,
          feedback: "",
          number_all_answers: 12,
          number_correct_answers: 0,
          time: 0, // Храним время в секундах
          startTime: null,
          questions: [
              { sequence: "1, 2, ?, 4, 5", options: [2, 3, 1, 4], answer: 3 },
              { sequence: "1, 3, ?, 7, 9", options: [5, 3, 1, 13], answer: 5 },
              { sequence: "1, 10, 3, 8, ?, 6, 7, 4, 9, 2", options: [8, 9, 5, 11], answer: 5 },
              { sequence: "1, 3, 9, 27, ?, 243", options: [36, 48, 81, 54], answer: 81 },
              { sequence: "2, 3, 5, 7, 11, 13, 17, 19, ?, 29", options: [23, 22, 25, 30], answer: 23 },
              { sequence: "916, 015, ?, 213, 312, 411", options: [123, 332, 113, 114], answer: 114 },
              { sequence: "23, 57, 1113, 1719, 2329, ?, 4143, 4753", options: [3137, 4122, 51232, 12523], answer: 3137 },
              { sequence: "1, 5, 16, 17, 18,<br>2, 6, 17, 18, ?", options: [31, 22, 19, 5], answer: 19 },
              { sequence: "1 - 2 - 5 - 7 - 8,<br>8 - 7 - ? - 8 - 2", options: [1, 2, 5, 8, 7], answer: 8 },
              { sequence: "6 - 2 - 7 - 6 - 6 - 2,<br>2 - 0 - 7 - 0 - ? - 0", options: [2, 0, 6, 7], answer: 2 },
              { sequence: "3.14, 4.28, 5.46, 6.82, 7.64, ?", options: [8.99, 8.28, 8.38, 8.00], answer: 8.28 },
              { sequence: "8110423, 259974, 9814143, 5512166, 113322, ?", options: [334455, 7911132, 9841233, 872236], answer: 7911132 },
          ],
      };
  },
  computed: {
      accuracy() {
          if (this.number_all_answers === 0) return 0;
          const calculated = (this.number_correct_answers / this.number_all_answers) * 100;
          return Number(calculated.toFixed(2));
      },
      formattedTime() {
          const hours = String(Math.floor(this.time / 3600)).padStart(2, '0');
          const minutes = String(Math.floor((this.time % 3600) / 60)).padStart(2, '0');
          const sec = String(this.time % 60).padStart(2, '0');
          return `${hours}:${minutes}:${sec}`;
      },
      finalMessage() {
          const accuracy = this.accuracy;
          if (accuracy >= 80) return "Вы настоящий мастер!";
          if (accuracy >= 50) return "Хороший результат! Немного практики — и всё получится!";
          return "Может быть, вам ближе искусство?";
      },
  },
  methods: {
      startGame() {
          this.gameStarted = true;
          this.gameEnded = false;
          this.currentQuestion = 0;
          this.number_correct_answers = 0;
          this.answered = false;
          this.feedback = "";
          this.time = 0;
          this.startTime = Date.now();
      },
      handleAnswer(option) {
          if (this.answered) return;
          this.answered = true;
          const current = this.questions[this.currentQuestion];
          if (option === current.answer) {
              this.feedback = "Правильно!";
              this.number_correct_answers++;
          } else {
              this.feedback = `Неправильно! Правильный ответ: ${current.answer}`;
          }
          setTimeout(() => {
              this.moveToNextQuestion();
          }, 1500);
      },
      moveToNextQuestion() {
          this.answered = false;
          if (this.currentQuestion + 1 < this.number_all_answers) {
              this.currentQuestion++;
          } else {
              this.endGame();
          }
      },
      endGame() {
          this.gameStarted = false;
          this.gameEnded = true;
          this.time = Math.floor((Date.now() - this.startTime) / 1000);
          this.saveResults();
      },

      async saveResults() {
          const testId = 8;
          const payload = {
              test: testId,
              user: this.authStore.user.id,
              score_percentage: Math.round(this.accuracy),
              time: this.formattedTime,
              number_all_answers: this.number_all_answers,
              number_correct_answers: this.number_correct_answers,
              accuracy: Math.round(this.accuracy)
          };

          console.log("Отправляемые данные:", payload);

          try {
              const response = await fetch("https://svetasy.pythonanywhere.com/api/result/", {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${localStorage.getItem("token")}`
                  },
                  body: JSON.stringify(payload),
              });

              const data = await response.json();

              if (!response.ok) {
                  throw new Error(data.detail || data.error || JSON.stringify(data));
              }

              alert("Результаты успешно сохранены!");
          } catch (error) {
              console.error("Ошибка сохранения:", error);
              alert(`Ошибка: ${error.message}`);
          }
      }
  },
};
</script>

<style src="../assets/style.css"></style>
