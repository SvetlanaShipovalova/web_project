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
                :key="index"
                class="card"
                :class="{ matched: isMatched(animal) }"
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
              <div v-for="(sound, index) in shuffledSounds" :key="index" class="sound-card">
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
      </div>
      <div v-else>
        <h2>Игра окончена!</h2>
        <p>Вы набрали: {{ accuracy }}%!</p>
        <p>Время выполнения: {{ time }} секунд!</p>
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
export default {
  components: { Navbar },
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
      matchedPairs: [],
      selectedAnimal: null,
      selectedSound: null,
      time: 0,
      timeLeft: 60,
      gameFinished: false,
      gameStarted: false,
      timer: null,
      shuffledAnimals: [],
      shuffledSounds: []
    };
  },
  computed: {
    accuracy() {
      return this.matchedPairs.length / this.animals.length * 100 || 0;
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
      this.selectedAnimal = animal;
      this.checkMatch();
    },
    selectSound(sound) {
      this.selectedSound = sound;
      this.checkMatch();
    },
    checkMatch() {
      if (this.selectedAnimal && this.selectedSound) {
        if (this.selectedAnimal.name === this.selectedSound.name && !this.isMatched(this.selectedAnimal)) {
          this.matchedPairs.push(this.selectedAnimal);
        }
        this.selectedAnimal = null;
        this.selectedSound = null;

        if (this.matchedPairs.length === this.animals.length) {
          this.endGame();
        }
      }
    },
    isMatched(animal) {
      return this.matchedPairs.includes(animal);
    },
    startTimer() {
      const startTime = Date.now(); // Запоминаем время начала игры
      this.timer = setInterval(() => {
        this.timeLeft--;
        if (this.timeLeft <= 0) {
          clearInterval(this.timer);
          this.endGame();
        }
      }, 1000);

      // Устанавливаем интервал для подсчета времени выполнения
      setInterval(() => {
        if (this.gameStarted && !this.gameFinished) {
          this.time = Math.floor((Date.now() - startTime) / 1000); // Обновляем общее время
        }
      }, 1000);
    },
    endGame() {
      this.gameFinished = true;
      clearInterval(this.timer);
    },
    restartGame() {
      this.score = 0;
      this.timeLeft = 60;
      this.matchedPairs = [];
      this.time = 0;
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
  width: 100%; /* Занять полную ширину */
}
.sound-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Два столбца */
  gap: 10px; /* Промежуток между карточками звуков */
}

.sound-card {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  padding: 5px;
  margin: 5px;
  background-color: #f9f9f9;
  height: 80px; /* Установите небольшую высоту для блоков со звуками */
}
</style>