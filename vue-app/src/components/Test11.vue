<template>
  <Navbar />
  <div class="container mt-5 text-center">
    <h2>{{ $route.params.name }}</h2>
    <div id="app">
      <h2>Найди звуки животных!</h2>
      <div v-if="!gameStarted && !gameFinished">
        <button @click="startGame">Старт</button>
      </div>
      <div v-else-if="!gameFinished">
        <div class="game-container">
          <div class="animal-cards">
            <h4>Карточки с животными</h4>
            <div class="card-container">
              <div
                v-for="(animal, index) in shuffledAnimals"
                :key="animal.name"
                class="card"
                :class="{ 
                  matched: isMatched(animal),
                  'selected-animal': selectedAnimals.includes(animal),
                  incorrect: isIncorrect(animal)
                }"
                @click="selectAnimal(animal)"
              >
                <img :src="animal.image" alt="animal" />
              </div>
            </div>
            <p>Осталось времени: {{ timeLeft }}</p>
            <p>Набранные проценты: {{ accuracy }}%</p>
          </div>
          <div class="sound-cards">
            <h4>Карточки со звуками</h4>
            <div class="sound-container">
              <div 
                v-for="(sound, index) in shuffledSounds"
                :key="sound.name" 
                class="sound-card"
                :class="{ 
                  matched: isMatched(sound),
                  'selected-sound': selectedSounds.includes(sound),
                  incorrect: isIncorrect(sound)
                }"
              >
                <audio controls>
                  <source :src="sound.audio" type="audio/mpeg">
                </audio>
                <button @click="selectSound(sound)">
                  Нажмите для выбора
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-if="selectedPairs.length > 0">
          <h4>Правильно подобранные пары:</h4>
          <ul>
            <li v-for="(pair, index) in selectedPairs" :key="index">
              {{ pair.animal.name }} - {{ pair.sound.name }}
            </li>
          </ul>
        </div>
      </div>
      <div v-else>
        <h2>Игра окончена!</h2>
        <p>Вы набрали: {{ accuracy }}%!</p>
        <p>Время выполнения: {{ timeFormatted }}</p>
        <p>Правильных ответов: {{ number_correct_answers }} из {{ number_all_answers }}</p>
        <button @click="restartGame">Начать заново</button>
      </div>
    </div>
    <router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
  </div>
</template>

<script>
import Navbar from "../view/Navbar.vue";
import dogImage from "../assets/test_res/dog.png";
import catImage from "../assets/test_res/cat.png";
import horseImage from "../assets/test_res/horse.png";
import cowImage from "../assets/test_res/cow.png";
import birdImage from "../assets/test_res/bird.png";
import sheepImage from "../assets/test_res/sheep.png";
import ratImage from "../assets/test_res/rat.png";
import pigImage from "../assets/test_res/pig.png";
import duckImage from "../assets/test_res/duck.png";
import wildBoarImage from "../assets/test_res/wild_boar.png";

import dogSound from "../assets/test_res/dog.mp3";
import catSound from "../assets/test_res/cat.mp3";
import horseSound from "../assets/test_res/horse.mp3";
import cowSound from "../assets/test_res/cow.mp3";
import birdSound from "../assets/test_res/bird.mp3";
import sheepSound from "../assets/test_res/sheep.mp3";
import ratSound from "../assets/test_res/rat.mp3";
import pigSound from "../assets/test_res/pig.mp3";
import duckSound from "../assets/test_res/duck.mp3";
import wildBoarSound from "../assets/test_res/wild_boar.mp3";

import { useAuthStore } from '../store/authStore';

export default {
  components: { Navbar },
  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },
  data() {
    return {
      animals: [
        { name: "Собака", image: dogImage },
        { name: "Кошка", image: catImage },
        { name: "Лошадь", image: horseImage },
        { name: "Корова", image: cowImage },
        { name: "Птица", image: birdImage },
        { name: "Овца", image: sheepImage },
        { name: "Крыса", image: ratImage },
        { name: "Свинья", image: pigImage },
        { name: "Утка", image: duckImage },
        { name: "Кабан", image: wildBoarImage },
      ],
      sounds: [
        { name: "Собака", audio: dogSound },
        { name: "Кошка", audio: catSound },
        { name: "Лошадь", audio: horseSound },
        { name: "Корова", audio: cowSound },
        { name: "Птица", audio: birdSound },
        { name: "Овца", audio: sheepSound },
        { name: "Крыса", audio: ratSound },
        { name: "Свинья", audio: pigSound },
        { name: "Утка", audio: duckSound },
        { name: "Кабан", audio: wildBoarSound },
      ],
      selectedPairs: [], 
      selectedAnimals: [], 
      selectedSounds: [], 
      timeLeft: 60, 
      timeFormatted: "00:00:00",
      gameFinished: false,
      gameStarted: false,
      timer: null,
      shuffledAnimals: [],
      shuffledSounds: [],
      number_correct_answers: 0,
      number_all_answers: 10,
    };
  },
  computed: {
    accuracy() {
      const correctPairs = this.selectedPairs.filter(
        pair => pair.animal.name === pair.sound.name
      ).length;
      this.number_correct_answers = correctPairs;
      const calculated = (correctPairs / this.number_all_answers) * 100;
      return Number(calculated.toFixed(2));
    },
  },
  methods: {
    shuffleAnimals() {
      this.shuffledAnimals = this.animals.sort(() => Math.random() - 0.5);
    },
    shuffleSounds() {
      this.shuffledSounds = this.sounds.sort(() => Math.random() - 0.5);
    },
    selectAnimal(animal) {
      if (this.isMatched(animal)) return;
      this.selectedAnimals = [animal];
      this.checkMatch();
    },
    selectSound(sound) {
      if (this.isMatched(sound)) return;
      this.selectedSounds = [sound];
      this.checkMatch();
    },
    isMatched(item) {
      return this.selectedPairs.some(
        pair => pair.animal.name === item.name || pair.sound.name === item.name
      );
    },
    isIncorrect(item) {
      return item.incorrect;
    },
    checkMatch() {
      if (this.selectedAnimals.length > 0 && this.selectedSounds.length > 0) {
        const animal = this.selectedAnimals[0];
        const sound = this.selectedSounds[0];

        if (animal.name === sound.name) {
          this.selectedPairs.push({
            animal: animal,
            sound: sound,
          });

          console.log("Пара добавлена:", animal.name, sound.name);
        } else {
          this.$nextTick(() => {
            animal.incorrect = true;
            sound.incorrect = true;
          });
        }

        this.selectedAnimals = [];
        this.selectedSounds = [];

        if (this.selectedPairs.length === this.animals.length) {
          console.log("Все пары сопоставлены!");
          this.endGame();
        }
      }
    },
    formatTime(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    },
    startTimer() {
      const startTime = Date.now();
      this.timer = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        this.timeFormatted = this.formatTime(elapsedSeconds);

        this.timeLeft--;
        if (this.timeLeft <= 0) {
          clearInterval(this.timer);
          this.endGame();
        }
      }, 1000);
    },
    endGame() {
      this.gameFinished = true;
      clearInterval(this.timer);
      console.log("Игра завершена!");
      this.saveResults();
    },
    restartGame() {
      this.animals.forEach(animal => (animal.incorrect = false));
      this.sounds.forEach(sound => (sound.incorrect = false));

      this.selectedPairs = [];
      this.selectedAnimals = [];
      this.selectedSounds = [];

      this.timeLeft = 60;
      this.timeFormatted = "00:00:00";
      this.gameFinished = false;
      this.gameStarted = false;

      this.shuffleAnimals();
      this.shuffleSounds();
    },
    startGame() {
      this.gameStarted = true;
      this.shuffleAnimals();
      this.shuffleSounds();
      this.startTimer();
    },
    async saveResults() {
      if (!this.authStore.user) {
        alert("Пользователь не авторизован. Пожалуйста, войдите в систему.");
        return;
      }

      const testId = 11;
      const payload = {
        test: testId,
        user: this.authStore.user.id,
        score_percentage: Math.round(this.accuracy),
        time: this.timeFormatted,
        number_all_answers: this.number_all_answers,
        number_correct_answers: this.number_correct_answers,
        accuracy: Math.round(this.accuracy)
      };

      // Проверка числовых значений
      if (isNaN(payload.score_percentage) || isNaN(payload.accuracy)) {
        console.error("Некорректные значения:", payload);
        return;
      }

      console.log("Отправляемые данные:", payload);

      try {
        const response = await fetch("http://127.0.0.1:8000/api/result/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || data.error || JSON.stringify(data));
        }

        alert("Результаты успешно сохранены!");
      } catch (error) {
        console.error("Ошибка сохранения:", error);
        alert(`Ошибка: ${error.message}`);
      }
    },
  },
  mounted() {
    this.shuffleAnimals();
    this.shuffleSounds();
  },
};
</script>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  margin: 20px;
}

.animal-cards {
  margin-bottom: 20px;
}

.card-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.card {
  width: fit-content;
  display: flex;
  justify-content: center;
  border: 1px solid #ccc;
  padding: 10px;
  margin: 10px;
  cursor: pointer;
}

.card img {
  max-width: 100px;
  max-height: 100px;
}

.sound-cards {
  width: 100%;
}

.sound-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.sound-card {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  padding: 5px;
  margin: 5px;
  background-color: #f9f9f9;
  height: 80px;
}

.selected-animal {
  border: 3px solid blue;
  box-shadow: 0 0 10px blue;
}

.selected-sound {
  border: 3px solid blue;
  box-shadow: 0 0 10px blue;
}

.matched {
  border: 3px solid green;
  box-shadow: 0 0 10px green;
}

.incorrect {
  border: 3px solid red;
  box-shadow: 0 0 10px red;
}
</style>