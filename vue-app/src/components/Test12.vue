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
              <button @click="checkAnswer(option)">{{ option }}</button>
            </div>
            <p v-if="selectedOption !== null" class="feedback">
              {{ feedback }}
            </p>
          </div>
          <p v-if="isAnswered && feedback === 'Правильно!'" class="success-message">
            Вы нашли {{ foundCount }} слов(а).
          </p>
          <div v-if="isAnswered" class="results">
            <p>Время выполнения теста: {{ time }} секунд</p>
            <p>Точность: {{ accuracy }}%</p>
          </div>
          <button v-if="isAnswered && feedback === 'Правильно!'" class="retry-button" @click="retryTest">
            Пройти тест еще раз
          </button>
          <br><router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from "../view/Navbar.vue";

export default {
  components: { Navbar },
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
      time: 0, // Время выполнения теста
      accuracy: 0 // Точность теста
    };
  },
  methods: {
    startTest() {
      this.testStarted = true;
      this.startTime = Date.now(); // Начинаем отсчет времени
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
      this.foundCount = (this.randomText.match(regex) || []).length; 
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
      if (option === this.foundCount) {
        this.feedback = 'Правильно!';
      } else {
        this.feedback = 'Попробуйте снова, неверно.'; 
      }
      this.isAnswered = true;
this.calculateResults(); // Вычисляем результаты после ответа
    },
    calculateResults() {
      const elapsedTime = (Date.now() - this.startTime) / 1000; // Время в секундах
      this.time = elapsedTime.toFixed(2); // Ограничиваем до двух знаков после запятой
      this.accuracy = ((this.foundCount / this.words.length) * 100).toFixed(2); // Точность
    },
    retryTest() {
      this.isAnswered = false; 
      this.selectedOption = null; 
      this.feedback = ''; 
      this.foundCount = null; 
      this.options = []; 
      this.randomText = ''; 
      this.testStarted = false;
      this.time = 0; // Сброс времени
      this.accuracy = 0; // Сброс точности
    }
  }
};
</script>

<style>
.random-text {
  margin-left: 10%;
  margin-right: 10%;
  font-size: 18px;
  padding: 15px;
  border: 1px dashed #ccc;
  border-radius: 5px;
  background-color: #fafafa;
  overflow-wrap: break-word;
}
.quiz {
  margin-top: 20px;
}
.option {
  margin: 5px 0;
  display: inline-block;
}
.feedback {
  font-size: 18px;
  margin-top: 10px;
  color: #333;
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