<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <div class="container">
        <h2>Тест на внимание «Мюнстерберга»</h2>
        <button v-if="!testStarted" class="start-button" @click="startTest">
          Играть
        </button>
        <div v-else>
          <p class="random-text" v-html="randomText"></p>
          <button class="check-button" @click="checkWords">Проверить количество найденных слов</button>

          <div v-if="foundCount !== null" class="quiz">
            <h2>Сколько слов было найдено?</h2>
            <div v-for="option in options" :key="option" class="option">
              <button @click="checkAnswer(option)" :disabled="isAnswered">{{ option }}</button>
            </div>
            <p v-if="selectedOption !== null" class="feedback">
              {{ feedback }}
            </p>
          </div>

          <p v-if="isAnswered && feedback === 'Правильно!'" class="success-message">
            Вы нашли {{ foundCount }} слов(а).
          </p>

          <div v-if="isAnswered" class="results">
            <p>Время выполнения теста: {{ time }}</p>
            <p>Точность: {{ accuracy }}%</p>
            <p>Найдено слов: {{ number_correct_answers }} из {{ number_all_answers }}</p>
          </div>

          <button v-if="isAnswered" class="retry-button" @click="retryTest">
            Пройти тест еще раз
          </button>

          <br>
          <router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
        </div>
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
      words: [
        'ФАКТ', 'ТЕОРИЯ', 'БИЗНЕС', 'ДОЧИСЛО', 'КАРТЕ',
        'МАРКЕТИНГ', 'ДАННЫЕ', 'ДЕНЬГИ', 'КЛЮЧ', 'КУСТ',
        'АНАЛИЗ', 'ДИАГНОЗ', 'ПРОБЛЕМА', 'РЕШЕНИЕ', 'ПЛАН',
        'КОНЦЕПЦИЯ', 'СТРАТЕГИЯ', 'МОДЕЛЬ', 'ИССЛЕДОВАНИЕ', 'РЕСУРС',
        'ИНФОРМАЦИЯ', 'ПРОЦЕСС', 'СИСТЕМА', 'КОММУНИКАЦИЯ', 'ПАРТНЁР',
        'ПРОЕКТ', 'УСПЕХ', 'ДИАЛОГ', 'КОНТРОЛЬ', 'ОЦЕНКА'
      ],
      randomText: '',
      foundCount: null,
      options: [],
      selectedOption: null,
      feedback: '',
      isAnswered: false,
      testStarted: false,
      time: "00:00:00", 
      accuracy: 0, 
      number_all_answers: 0, 
      number_correct_answers: 0, 
    };
  },
  methods: {
    startTest() {
      this.testStarted = true;
      this.startTime = Date.now(); 
      this.generateRandomText();
    },
    generateRandomText() {
      let text = '';
      const minLength = 350;
      const usedWords = new Set();

      while (text.length < minLength) {
        if (usedWords.size === this.words.length) {
          break;
        }
        const randomWord = this.words[Math.floor(Math.random() * this.words.length)];
        if (!usedWords.has(randomWord)) {
          usedWords.add(randomWord);
          const randomPosition = Math.floor(Math.random() * (text.length + 1));
          text = this.insertWord(randomWord, text, randomPosition);
        }
      }
      while (text.length < minLength) {
        text += ' ';
      }

      this.randomText = text.trim();
    },
    insertWord(word, currentText, position) {
      return currentText.slice(0, position) + word + currentText.slice(position);
    },
    checkWords() {
      const regex = new RegExp(this.words.join('|'), 'g');
      const matches = this.randomText.match(regex) || [];
      this.foundCount = matches.length;
      this.number_all_answers = this.foundCount; // Количество всех слов в тексте
      this.generateOptions();
    },
    generateOptions() {
      const correctAnswer = this.foundCount;
      const optionsSet = new Set([correctAnswer]);

      while (optionsSet.size < 4) {
        const randomOption = Math.floor(Math.random() * (this.words.length + 1));
        optionsSet.add(randomOption);
      }
      this.options = Array.from(optionsSet).sort((a, b) => a - b);
    },
    checkAnswer(option) {
      this.selectedOption = option;
      this.number_correct_answers = option; // Сколько слов выбрал пользователь

      if (option === this.foundCount) {
        this.feedback = 'Правильно!';
      } else {
        this.feedback = `Неправильно! Правильный ответ: ${this.foundCount}`;
      }

      this.isAnswered = true;
      this.calculateResults();
    },
    calculateResults() {
      const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
      this.time = this.formatTime(elapsedTime);

      this.accuracy = this.number_all_answers > 0 
        ? ((this.number_correct_answers / this.number_all_answers) * 100).toFixed(2) 
        : "0.00";

      this.saveResults();
    },
    formatTime(seconds) {
      const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
      const sec = String(seconds % 60).padStart(2, '0');
      return `00:${minutes}:${sec}`;
    },
    async saveResults() {
      if (!this.authStore.user) {
        alert("Пользователь не авторизован. Пожалуйста, войдите в систему.");
        return;
      }

      const testId = 12;
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
            time_spent: this.time,
            number_all_answers: this.number_all_answers,
            number_correct_answers: this.number_correct_answers
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
    retryTest() {
      this.isAnswered = false; 
      this.selectedOption = null; 
      this.feedback = ''; 
      this.foundCount = null; 
      this.options = []; 
      this.randomText = ''; 
      this.testStarted = false;
      this.time = "00:00:00"; 
      this.accuracy = 0; 
    }
  }
};
</script>


<style>
.random-text {
  margin: 10% auto;
  font-size: 18px;
  padding: 15px;
  border: 1px dashed #ccc;
  border-radius: 5px;
  background-color: #fafafa;
  overflow-wrap: break-word;
}
.feedback {
  font-size: 18px;
  margin-top: 10px;
  font-weight: bold;
}
.success-message {
  font-size: 20px;
  color: #4CAF50;
}
.results {
  margin-top: 20px;
  font-size: 18px;
}
</style>
