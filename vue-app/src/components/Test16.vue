<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <div class="container">
        <h2 v-if="!testStarted">Тест на определение лишнего цвета</h2>
        <p>Цель игры: Найти и выбрать цвет, который не вписывается в предложенный ряд.</p>
        <div v-if="testStarted">
          <div v-if="currentRound < totalRounds">
            <h3>Раунд {{ currentRound + 1 }}</h3>
            <div class="row">
              <div v-for="color in colorOptions" :key="color" class="col-3">
                <div
                  :style="{ backgroundColor: color, height: '80px', border: '2px solid #000', cursor: 'pointer' }"
                  @click="checkAnswer(color)"
                ></div>
              </div>
            </div>
            <p v-if="selectedColor">{{ feedback }}</p>
          </div>
          <div v-else>
            <h2>Тест завершён!</h2>
            <p>Ваш результат: {{ score }} из {{ totalRounds }}</p>
            <p>Время выполнения теста: {{ time }}</p>
            <p>Точность выполнения: {{ accuracy }}%</p> <!-- Используем accuracy вместо score_percentage -->
            <button class="btn btn-secondary" @click="retryTest">Пройти тест еще раз</button>
          </div>
        </div>
        <button v-else class="btn btn-primary" @click="startTest">Играть</button>
      </div>
    </div>
    <br />
        <router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import Navbar from "../view/Navbar.vue"; // Assuming Navbar.vue is in the same directory

export default {
  components: {
    Navbar,
  },
  setup() {
    const authStore = ref({ user: null }); // Replace with actual auth store logic
    const totalRounds = 6;
    const currentRound = ref(0);
    const score = ref(0);
    const colorOptions = ref([]);
    const selectedColor = ref(null);
    const feedback = ref("");
    const testStarted = ref(false);
    const time = ref("00:00:00");
    const startTime = ref(null);
    const oddColorIndex = ref(-1); // Индекс лишнего цвета

    const accuracy = computed(() => {
      return ((score.value / totalRounds) * 100).toFixed(2); // Вычисляем точность выполнения
    });

    const startTest = () => {
      testStarted.value = true;
      startTime.value = Date.now();
      nextRound();
    };

    const nextRound = () => {
      selectedColor.value = null;
      feedback.value = "";
      generateColorOptions();
    };

    const generateColorOptions = () => {
      const baseColor = getRandomColor();
      const similarColors = getSimilarColors(baseColor, 3); // Генерируем 3 похожих цвета
      const oddColor = getDifferentColor(baseColor); // Генерируем один явно отличающийся цвет
      colorOptions.value = [...similarColors, oddColor].sort(() => Math.random() - 0.5);
      oddColorIndex.value = colorOptions.value.indexOf(oddColor); // Сохраняем индекс лишнего цвета
    };

    const getRandomColor = () => {
      return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    };

    const getSimilarColors = (baseColor, count) => {
      const similarColors = [];
      for (let i = 0; i < count; i++) {
        const color = adjustColor(baseColor, 30); // Немного изменяем базовый цвет
        similarColors.push(color);
      }
      return similarColors;
    };

    const getDifferentColor = (baseColor) => {
      let differentColor;
      do {
        differentColor = getRandomColor();
      } while (isSimilar(differentColor, baseColor, 100)); // Убедимся, что цвет действительно отличается
      return differentColor;
    };

    const adjustColor = (color, amount) => {
      let r = parseInt(color.slice(1, 3), 16);
      let g = parseInt(color.slice(3, 5), 16);
      let b = parseInt(color.slice(5, 7), 16);

      r = Math.min(255, Math.max(0, r + amount));
      g = Math.min(255, Math.max(0, g + amount));
      b = Math.min(255, Math.max(0, b + amount));

      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    const checkAnswer = (color) => {
      selectedColor.value = color;
      const selectedIndex = colorOptions.value.indexOf(color);
      if (selectedIndex === oddColorIndex.value) {
        feedback.value = "Правильно!";
        score.value++;
      } else {
        feedback.value = `Неправильно! Лишний цвет: ${colorOptions.value[oddColorIndex.value]}`;
      }
      currentRound.value++;
      if (currentRound.value < totalRounds) {
        nextRound();
      } else {
        calculateResults();
      }
    };

    const isSimilar = (color1, color2, threshold) => {
      const r1 = parseInt(color1.slice(1, 3), 16);
      const g1 = parseInt(color1.slice(3, 5), 16);
      const b1 = parseInt(color1.slice(5, 7), 16);
      const r2 = parseInt(color2.slice(1, 3), 16);
      const g2 = parseInt(color2.slice(3, 5), 16);
      const b2 = parseInt(color2.slice(5, 7), 16);

      const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
      return diff < threshold;
    };

    const calculateResults = () => {
      const elapsedTime = Math.floor((Date.now() - startTime.value) / 1000);
      time.value = formatTime(elapsedTime);
      saveResults();
    };

    const formatTime = (seconds) => {
      const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
      const remainingSeconds = String(seconds % 60).padStart(2, "0");
      return `00:${minutes}:${remainingSeconds}`;
    };

    const saveResults = async () => {
      if (!authStore.value.user) {
        alert("Пользователь не авторизован. Войдите в систему.");
        return;
      }
      try {
        await fetch("https://svetasy.pythonanywhere.com/api/result/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            test: 20,
            user: authStore.value.user.id,
            accuracy: parseFloat(accuracy.value), // Используем accuracy вместо score_percentage
            time: time.value,
            number_all_answers: totalRounds,
            number_correct_answers: score.value,
          }),
        });
        alert("Результаты успешно сохранены!");
      } catch (error) {
        console.error("Ошибка при сохранении результатов:", error);
      }
    };

    const retryTest = () => {
      currentRound.value = 0;
      score.value = 0;
      colorOptions.value = [];
      selectedColor.value = null;
      feedback.value = "";
      testStarted.value = false;
      time.value = "00:00:00";
    };

    return {
      totalRounds,
      currentRound,
      score,
      colorOptions,
      selectedColor,
      feedback,
      testStarted,
      time,
      accuracy, // Возвращаем accuracy для использования в шаблоне
      startTest,
      nextRound,
      generateColorOptions,
      checkAnswer,
      calculateResults,
      formatTime,
      saveResults,
      retryTest,
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
}

.row {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
}

.col-3 {
  flex: 1;
  margin: 0 10px;
}

.feedback {
  margin-top: 20px;
  font-size: 1.2em;
  color: green;
}
</style>
