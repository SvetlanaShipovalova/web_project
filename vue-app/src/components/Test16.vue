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
            <button class="btn btn-secondary" @click="retryTest">Пройти тест еще раз</button>
          </div>
        </div>
        <button v-else class="btn btn-primary" @click="startTest">Играть</button>
        <br />
        <router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
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
      const colors = ["#FF5733", "#FFBD33", "#33FF57", "#33FFBD", "#3357FF", "#FF33A8"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const similarColors = getSimilarColors(randomColor);
      colorOptions.value = [...similarColors, randomColor].sort(() => Math.random() - 0.5);
    };

    const getSimilarColors = (color) => {
      const similarColors = [];
      for (let i = 0; i < 3; i++) {
        let newColor = color;
        while (newColor === color) {
          newColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        }
        similarColors.push(newColor);
      }
      return similarColors;
    };

    const checkAnswer = (color) => {
      selectedColor.value = color;
      if (colorOptions.value.indexOf(color) === colorOptions.value.length - 1) {
        feedback.value = "Правильно!";
        score.value++;
      } else {
        feedback.value = "Неправильно! Лишний цвет: " + colorOptions.value[colorOptions.value.length - 1];
      }
      currentRound.value++;
      if (currentRound.value < totalRounds) {
        nextRound();
      } else {
        calculateResults();
      }
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
            score_percentage: Math.round((score.value / totalRounds) * 100),
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
      startTest,
      nextRound,
      generateColorOptions,
      getSimilarColors,
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
