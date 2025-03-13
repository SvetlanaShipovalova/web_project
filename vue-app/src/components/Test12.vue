<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2 class="mb-4">{{ $route.params.name }}</h2>
    <div id="app">
      <div class="row justify-content-center">
        <div class="col-lg-8 col-md-10 col-sm-12">
          <div class="card shadow">
            <div class="card-body">
              <h3 class="card-title">Тест на внимание «Мюнстерберга»</h3>
              <p class="lead card-text">
                Цель игры: Найти как можно больше слов в предложенном тексте.
              </p>
              <p class="card-text">
                В начале игры вам будет предложено нажать на кнопку «Играть», чтобы начать тест.<br>
                Затем вам будет показан текст, содержащий случайные слова.<br>
                После того как вы просмотрите текст, нажмите кнопку «Проверить количество найденных слов».<br>
                Вам будет предложено ответить, сколько слов вы нашли, выбрав один из предложенных вариантов чисел.<br>
                После отправки ответа вы получите обратную связь о правильности вашего ответа и сможете увидеть, сколько слов вы действительно нашли.<br>
              </p>

              <button v-if="!testStarted" class="btn btn-primary w-100 mb-3" @click="startTest">
                Играть
              </button>

              <div v-else>
                <p class="random-text bg-light p-3 rounded border" v-html="randomText"></p>
                <button class="btn btn-success w-100 mb-3" @click="checkWords">
                  Проверить количество найденных слов
                </button>

                <div v-if="foundCount !== null" class="quiz">
                  <h4 class="mb-3">Сколько слов было найдено?</h4>
                  <div class="d-flex flex-wrap gap-2 justify-content-center">
                    <button
                      v-for="option in options"
                      :key="option"
                      class="btn btn-outline-secondary"
                      @click="checkAnswer(option)"
                      :disabled="isAnswered"
                    >
                      {{ option }}
                    </button>
                  </div>
                  <p v-if="selectedOption !== null" class="feedback mt-3 fw-bold">
                    {{ feedback }}
                  </p>
                </div>

                <p v-if="isAnswered && feedback === 'Правильно!'" class="success-message text-success fw-bold">
                  Вы нашли {{ foundCount }} слов(а).
                </p>

                <div v-if="isAnswered" class="results mt-4">
                  <p>Время выполнения теста: <strong>{{ time }}</strong></p>
                  <p>Точность: <strong>{{ accuracy }}%</strong></p>
                  <p>Вы выбрали: <strong>{{ selectedOption }}</strong></p>
                </div>

                <button v-if="isAnswered" class="btn btn-warning w-100 mb-3" @click="retryTest">
                  Пройти тест еще раз
                </button>

                <router-link to="/tests" class="btn btn-secondary w-100">
                  Назад к тестам
                </router-link>
              </div>
            </div>
          </div>
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

      if (option === this.foundCount) {
        this.feedback = 'Правильно!';
        this.number_correct_answers = this.foundCount;
      } else {
        this.feedback = `Неправильно! Правильный ответ: ${this.foundCount}`;
        this.number_correct_answers = Math.min(option, this.foundCount);
      }

      this.isAnswered = true;
      this.calculateResults();
    },
    calculateResults() {
      const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
      this.time = this.formatTime(elapsedTime);

      if (this.selectedOption >= this.number_all_answers) {
        this.accuracy = ((this.number_all_answers / this.selectedOption) * 100).toFixed(2);
      } else {
        this.accuracy = ((this.number_correct_answers / this.number_all_answers) * 100).toFixed(2);
      }

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
      const scorePercentage = this.accuracy;

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
            score_percentage: Math.round(scorePercentage),
            time: this.time,
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

<style scoped>
.random-text {
  font-size: 18px;
  overflow-wrap: break-word;
}
.feedback {
  font-size: 18px;
}
.results {
  font-size: 18px;
}
</style>