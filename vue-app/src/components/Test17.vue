<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <div v-if="!testStarted && !testFinished">
        <h1>Тест на цветовую последовательность</h1>
        <p>Перетащите и отпустите ящики, чтобы расположить оттенки в правильной последовательности.</p>
        <button class="start-button btn btn-primary" @click="startTest">Начать тест</button>
      </div>
      
      <div v-else-if="testStarted && !testFinished">
        <p>Раунд {{ round }} из 7</p>
        <div class="color-container">
          <div class="color-box fixed" :style="{ backgroundColor: leftColor }"></div>
          <div
            v-for="(color, index) in movableColors"
            :key="index"
            class="color-box"
            :style="{ backgroundColor: color }"
            draggable="true"
            @dragstart="dragStart(index)"
            @dragover.prevent
            @drop="drop(index)"
          ></div>
          <div class="color-box fixed" :style="{ backgroundColor: rightColor }"></div>
        </div>
        <button class="btn btn-primary" @click="checkResult">Проверить</button>
      </div>
      
      <div v-if="testCompleted && !testFinished">
        <p>Вы правильно расположили {{ correctMovableColors }} из {{ movableColors.length }} оттенков!</p>
        <button v-if="round < 7" class="btn btn-primary" @click="nextRound">Следующий раунд</button>
        <button v-else class="btn btn-primary" @click="finishTest">Завершить тест</button>
      </div>
      
      <div v-if="testFinished" class="end-message">
        <p>Тест завершён! Вы правильно расположили {{ number_correct_answers }} из {{ number_all_answers }} оттенков.</p>
        <p>Точность выполнения: {{ accuracy }}%</p>
        <p>Общее время прохождения: {{ time }}</p>
      </div>
      <router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
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
      round: 1,
      leftColor: "",
      rightColor: "",
      originalMovableColors: [],
      movableColors: [],
      draggedIndex: null,
      testStarted: false,
      testCompleted: false,
      testFinished: false,
      correctMovableColors: 0,
      number_correct_answers: 0, // Количество правильных ответов
      number_all_answers: 0, // Общее количество всех вопросов
      startTime: 0,
      endTime: 0,
      time: "00:00:00", // Время в формате ЧЧ:ММ:СС
    };
  },
  computed: {
    accuracy() {
      return this.number_all_answers > 0
        ? ((this.number_correct_answers / this.number_all_answers) * 100).toFixed(2)
        : "0.00";
    },
  },
  methods: {
    generateColors() {
      const count = 3 + Math.floor(this.round / 2);
      const gradients = [
        ["#FFFF00", "#00FF00"],
        ["#0000FF", "#FF0000"],
        ["#FF00FF", "#00FFFF"],
        ["#FFA500", "#800080"],
      ];
      const gradientIndex = (this.round - 1) % gradients.length;
      [this.leftColor, this.rightColor] = gradients[gradientIndex];
      const [startColor, endColor] = [this.leftColor, this.rightColor].map(this.hexToRgb);
      const step = {
        r: (endColor.r - startColor.r) / (count + 1),
        g: (endColor.g - startColor.g) / (count + 1),
        b: (endColor.b - startColor.b) / (count + 1),
      };
      this.originalMovableColors = Array.from({ length: count }, (_, i) => {
        const r = Math.round(startColor.r + step.r * (i + 1));
        const g = Math.round(startColor.g + step.g * (i + 1));
        const b = Math.round(startColor.b + step.b * (i + 1));
        return `rgb(${r}, ${g}, ${b})`;
      });
      this.movableColors = [...this.originalMovableColors].sort(() => Math.random() - 0.5);
      this.number_all_answers += count; // Учитываем все вопросы
    },
    hexToRgb(hex) {
      const bigint = parseInt(hex.slice(1), 16);
      return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
      };
    },
    formatTime(seconds) {
      const hours = Math.floor(seconds / 3600).toString().padStart(2, "0");
      const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
      const secs = (seconds % 60).toString().padStart(2, "0");
      return `${hours}:${minutes}:${secs}`;
    },
    dragStart(index) {
      this.draggedIndex = index;
    },
    drop(index) {
      const draggedColor = this.movableColors[this.draggedIndex];
      this.movableColors.splice(this.draggedIndex, 1);
      this.movableColors.splice(index, 0, draggedColor);
    },
    checkResult() {
      this.correctMovableColors = this.movableColors.reduce(
        (acc, color, index) => (color === this.originalMovableColors[index] ? acc + 1 : acc),
        0
      );
      this.number_correct_answers += this.correctMovableColors; // Обновляем количество правильных ответов
      this.testCompleted = true;
    },
    nextRound() {
      this.round++;
      this.testCompleted = false;
      this.generateColors();
    },
    finishTest() {
      this.endTime = Date.now();
      const elapsedSeconds = Math.floor((this.endTime - this.startTime) / 1000);
      this.time = this.formatTime(elapsedSeconds);
      this.testFinished = true;
      this.saveResults();
    },
    startTest() {
      this.round = 1;
      this.number_correct_answers = 0;
      this.number_all_answers = 0;
      this.testStarted = true;
      this.testCompleted = false;
      this.testFinished = false;
      this.startTime = Date.now();
      this.generateColors();
    },
    async saveResults() {
      if (!this.authStore.user) {
        alert("Пользователь не авторизован.");
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
            test: 17,
            user: this.authStore.user.id,
            score_percentage: Math.round(this.accuracy),
            time: this.time,
            number_all_answers: this.number_all_answers,
            number_correct_answers: this.number_correct_answers,
          }),
        });

        if (!response.ok) throw new Error("Ошибка при сохранении данных");
        alert("Результаты успешно сохранены!");
      } catch (error) {
        console.error("Ошибка:", error);
      }
    },
  },
};
</script>

<style src="../assets/style.css"></style>
