<template>
    <Navbar />
    <div class="container mt-5 text-center">
      <h2>{{ $route.params.name }}</h2>
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
    import { useAuthStore } from '../store/authStore'; // Импортируем authStore

    export default {
      components: { Navbar },
      setup() {
        const authStore = useAuthStore(); // Используем хранилище
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
          totalCorrect: 0,
          totalPossible: 0,
          correctPercentages: [],
          startTime: 0,
          roundTime: 0,
          totalTime: 0,
          time: 0,
          accuracy: 0,
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
          this.saveResults(); // Сохраняем результаты
        },
        startTest() {
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
        async saveResults() {
          if (!this.authStore.user) {
            alert("Пользователь не авторизован. Пожалуйста, войдите в систему.");
            return;
          }

          const testId = 17; // ID семнадцатого теста
          const scorePercentage = parseInt(this.accuracy, 10); // Точность в процентах

          // Проверка данных
          if (isNaN(scorePercentage)) {
            alert("Ошибка: некорректное значение точности.");
            return;
          }

          // Логирование данных
          console.log("Отправляемые данные:", {
            test: testId,
            user: this.authStore.user.id,
            score_percentage: scorePercentage,
          });

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
              console.error("Ошибка сервера:", errorData);
              alert(errorData.error || "Ошибка при сохранении результатов");
            }
          } catch (error) {
            console.error("Ошибка при отправке результатов:", error);
          }
        },
      },
    };
  </script>
  
  <style src="../assets/style.css"></style>
