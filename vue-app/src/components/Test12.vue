<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <div v-if="currentView === 'start'">
        <h1>Тест концентрации внимания</h1>
        <button id="start-button" @click="startTest">Начать тест</button>
      </div>

      <div v-else-if="currentView === 'test'">
        <h2>Раунд {{ round }}</h2>
        <p>Читаем текст, подчеркните как можно быстрее следующие слова:</p>
        <p>Время выполнения задания — 2 минуты.</p>
        <p>Текст для поиска:</p>
        <div class="test-text" v-html="textToHighlight"></div>

        <div class="timer">
          Время осталось: {{ remainingTime }} сек
        </div>
      </div>

      <div v-else-if="currentView === 'result'">
        <h1>Результаты</h1>
        <p>Раунд {{ round }} завершён!</p>
        <p>Точность: {{ accuracy }}%</p>
        <p>Время: {{ time }}</p>
        <p>Всего слов: {{ totalWords }}</p>
        <p>Правильно подчеркнутых слов: {{ correctWords }}</p>
        <button @click="restartTest">Повторить</button>
        <button @click="goBack">Назад</button>
      </div>
      <router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
    </div>
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
      remainingTime: 120, // 2 минуты
      text: 'бсолнцевтргщоцрайонзгучновостьхэьгчяфактуекэкзаментрочягшгцкпрокуроргурстабюетеорияентсджэбьамхоккейтрсицыфцуйгзхтелевизорсолджщзхюэлгщьбапамятьшогхеюжп',
      highlightedWords: ['новость', 'память', 'теория', 'телевизор', 'любовь'],
      wordsFound: [],
      totalWords: 0,
      correctWords: 0,
      totalTime: 0,
      userInput: "",
    };
  },
  computed: {
    time() {
      return this.formatTime(this.totalTime);
    },
    accuracy() {
      if (this.totalWords === 0) return 0;
      const calculated = (this.correctWords / this.totalWords) * 100;
      return Math.round(calculated);
    },
    textToHighlight() {
      return this.highlightText(this.text);
    }
  },
  methods: {
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    },

    highlightText(text) {
      let highlightedText = text;
      this.highlightedWords.forEach(word => {
        const regex = new RegExp(`(${word})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<span class="highlight">$1</span>');
      });
      return highlightedText;
    },

    startTest() {
      this.currentView = 'test';
      this.startRound();
    },

    startRound() {
      this.totalWords = this.highlightedWords.length;
      this.correctWords = 0;
      this.remainingTime = 120;
      this.userInput = "";

      // Таймер
      const countdown = setInterval(() => {
        this.remainingTime--;
        this.totalTime++;

        if (this.remainingTime <= 0) {
          clearInterval(countdown);
          this.endRound();
        }
      }, 1000);
    },

    endRound() {
      this.currentView = 'result';
      this.saveResults();
    },

    checkAnswer(word) {
      if (this.highlightedWords.includes(word) && !this.wordsFound.includes(word)) {
        this.wordsFound.push(word);
        this.correctWords++;
      }
    },

    restartTest() {
      this.round = 1;
      this.currentView = 'start';
      this.totalTime = 0;
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
          test: 1, // Тест концентрации внимания
          user: this.authStore.user.id,
          score_percentage: this.accuracy,
          time: this.time,
          number_all_answers: this.totalWords,
          number_correct_answers: this.correctWords
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

.test-text {
  font-size: 1.5rem;
  margin: 20px 0;
}

.highlight {
  background-color: yellow;
}

.timer {
  font-size: 1.2rem;
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
}
</style>
