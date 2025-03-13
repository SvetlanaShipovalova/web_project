<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>Найдите неточность</h2>
    <div id="app">
      <div v-if="!testStarted && !testFinished">
        <p>
          <strong>"Найдите неточность"</strong> — это игра для тренировки концентрации и зрительного восприятия.
        </p>
        <p>
          <strong>Цель игры:</strong> Сравнить строки и найти лишний символ, выбрать его в приведённой таблице.
        </p>
        <button class="btn btn-primary btn-lg" @click="startTest">Начать</button>
      </div>

      <div v-else-if="testStarted">
        <p class="h5">Сравните строки и найдите лишний символ!</p>
        <p class="h5">Оставшееся время: {{ formattedTime }}</p> <!-- Отображение обратного отсчёта -->
        <div class="row mb-4">
          <div class="col-12">
            <h4 class="display-5">{{ string1 }}</h4>
            <h4 class="display-5">{{ string2 }}</h4>
          </div>
        </div>
        <div class="row mb-4">
          <div
            v-for="(char, index) in allCharacters"
            :key="index"
            class="col-2 border d-flex justify-content-center align-items-center p-3"
            :class="{'bg-success': selectedChar === char && char === extraChar, 'bg-danger': selectedChar === char && char !== extraChar}"
            @click="selectCharacter(char)"
          >
            {{ char }}
          </div>
        </div>
      </div>

      <div v-if="testFinished">
        <h3 class="display-5">Тест завершен!</h3>
        <p>⏳ Время выполнения: {{ formattedTimeSpent }}</p>
        <p>✅ Правильные ответы: {{ number_correct_answers }} из {{ number_all_answers }}</p>
        <p>🎯 Точность: {{ accuracy }}%</p>
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
  data() {
    return {
      testStarted: false,
      testFinished: false,
      string1: '',
      string2: '',
      extraChar: '',
      allCharacters: [],
      selectedChar: null,
      number_all_answers: 1,
      number_correct_answers: 0,
      initialTime: 60, // Начальное время (60 секунд)
      timeLeft: 60, // Оставшееся время
      time: 0, // Время выполнения
      timer: null,
    };
  },
  computed: {
    formattedTime() {
      const minutes = Math.floor(this.timeLeft / 60);
      const seconds = this.timeLeft % 60;
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    },
    formattedTimeSpent() {
      const minutes = Math.floor(this.time / 60);
      const seconds = this.time % 60;
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    },
    accuracy() {
      return this.number_all_answers > 0 ? ((this.number_correct_answers / this.number_all_answers) * 100).toFixed(2) : 0;
    },
  },
  methods: {
    startTest() {
      this.testStarted = true;
      this.testFinished = false;
      this.timeLeft = this.initialTime; // Сбрасываем оставшееся время
      this.time = 0; // Сбрасываем затраченное время
      this.generateStrings();
      this.startTimer();
    },
    generateStrings() {
      const symbols = "ⶍ⇈⑸⋍⸛ⱗ⸀≴⬻⥏ⴈ⩡⇭⭑⭜⚱⫈";
      const array = symbols.split('');
      this.extraChar = array[Math.floor(Math.random() * array.length)];
      
      // Создаем две строки, где одна строка содержит лишний символ
      this.string1 = this.shuffle(array.slice()).join('') + this.extraChar; // Строка с лишним символом
      this.string2 = this.shuffle(array.slice()).join(''); // Строка без лишнего символа

      // Подготавливаем все символы для выбора
      this.allCharacters = [...new Set(this.string1.split('').concat(this.string2.split('')))];
      this.allCharacters = this.shuffle(this.allCharacters); // Перемешиваем для случайного отображения
    },
    shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    },
    selectCharacter(char) {
      this.selectedChar = char;
      if (char === this.extraChar) {
         this.number_correct_answers++;
         alert("Правильно!");
      } else {
        alert(`Неправильно! Лишний символ: ${this.extraChar}`);
      }
      this.finishTest(); // Завершение теста после выбора
    },
    finishTest() {
      this.testFinished = true;
      clearInterval(this.timer); // Останавливаем таймер
      this.time = this.initialTime - this.timeLeft; // Фиксируем затраченное время
      this.saveResults(); // Сохраняем результаты
    },
    startTimer() {
      this.timer = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          this.finishTest(); // Завершение теста при истечении времени
        }
      }, 1000);
    },
    async saveResults() {
      const authStore = useAuthStore();
      if (!authStore.user) {
        alert("Пользователь не авторизован. Войдите в систему.");
        return;
      }
      try {
        const response = await fetch("https://svetasy.pythonanywhere.com/api/result/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            test: 18, // ID теста
            user: authStore.user.id,
            score_percentage: Math.round(this.accuracy),
            time: this.time, // Время выполнения в секундах
            number_all_answers: this.number_all_answers, // Всегда 1
            number_correct_answers: this.number_correct_answers, // Сколько правильно
          }),
        });

        if (response.ok) {
          alert("Результаты успешно сохранены!");
        } else {
          const errorData = await response.json();
          console.error("Ошибка сервера:", errorData);
          alert(errorData.error || "Ошибка при сохранении результатов");
        }
      } catch (error) {
        console.error("Ошибка при отправке результатов:", error);
      }
    },
  },
  beforeUnmount() {
    clearInterval(this.timer); // Останавливаем таймер при размонтировании компонента
  },
};
</script>

<style scoped>
/* Стили не используются, но можно добавить дополнительные стили, если потребуется */
</style>