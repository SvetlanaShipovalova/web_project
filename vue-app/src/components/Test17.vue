<template>
    <Navbar />
    <div class="container mt-5 text-center">
      <h2>Тест №{{ $route.params.id }}</h2>
      <div id="app">
        <!-- Начальный экран -->
        <div v-if="!testStarted && !testFinished">
          <h1>Тест на цветовую последовательность</h1>
          <p>Перетащите и отпустите ящики, чтобы расположить оттенки между крайними цветами в правильной последовательности.</p>
          <button class="start-button btn btn-primary" @click="startTest">Начать тест</button>
        </div>
        
        <!-- Экран прохождения теста -->
        <div v-else-if="testStarted && !testFinished">
          <p>Раунд {{ round }} из 16</p>
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
        
        <!-- Результаты раунда -->
        <div v-if="testCompleted && !testFinished">
          <p>Вы правильно расположили {{ correctMovableColors }} из {{ movableColors.length }} оттенков!</p>
          <button v-if="round < 16" class="btn btn-primary" @click="nextRound">Следующий раунд</button>
          <button v-else class="btn btn-primary" @click="finishTest">Завершить тест</button>
        </div>
        
        <!-- Финальный экран -->
        <div v-if="testFinished" class="end-message">
          <p>Тест завершён! Вы правильно расположили {{ totalCorrect }} из 256 оттенков.</p>
          <p>Точность выполнения: {{ accuracy }}%</p>
          <p>Время прохождения теста: {{ time }} секунд</p>
        </div>
        <router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
      </div>
    </div>
  </template>
  
  <script>
  import Navbar from "../view/Navbar.vue";
  export default {
    components: { Navbar },
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
        totalCorrect: 0,
        totalPossible: 0, // Общее количество оттенков (для всех раундов)
        correctPercentages: [], // Массив процентов правильности для каждого раунда
        startTime: 0, // Время начала раунда
        roundTime: 0, // Время, затраченное на текущий раунд
        totalTime: 0, // Общее время прохождения всех раундов
        time: 0, // Общее время теста в секундах
        accuracy: 0, // Средняя точность выполнения
      };
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
        this.totalPossible += count;
      },
      hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        return {
          r: (bigint >> 16) & 255,
          g: (bigint >> 8) & 255,
          b: bigint & 255,
        };
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
        this.totalCorrect += this.correctMovableColors;
        const roundAccuracy = (this.correctMovableColors / this.movableColors.length) * 100;
        this.correctPercentages.push(roundAccuracy);
        this.testCompleted = true;
      },
      nextRound() {
        this.roundTime = Math.floor((Date.now() - this.startTime) / 1000);
        this.totalTime += this.roundTime;
        this.round++;
        this.testCompleted = false;
        this.generateColors();
        this.startTime = Date.now();
      },
      finishTest() {
        this.roundTime = Math.floor((Date.now() - this.startTime) / 1000);
        this.totalTime += this.roundTime;
        this.time = this.totalTime;
        this.testFinished = true;
        const totalAccuracy = this.correctPercentages.reduce((acc, curr) => acc + curr, 0);
        this.accuracy = (totalAccuracy / this.correctPercentages.length).toFixed(2);
      },
      startTest() {
        // Сброс данных для нового теста
        this.round = 1;
        this.correctMovableColors = 0;
        this.totalCorrect = 0;
        this.totalPossible = 0;
        this.correctPercentages = [];
        this.testStarted = true;
        this.testCompleted = false;
        this.testFinished = false;
        this.totalTime = 0;
        this.time = 0;
        this.accuracy = 0;
        this.startTime = Date.now();
        this.generateColors();
      },
    },
  };
  </script> 
  
  <style src="../assets/style.css"></style>
