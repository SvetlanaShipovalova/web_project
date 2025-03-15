<template>  
    <Navbar />
    <div class="container mt-5 text-center">
      <h2>{{ $route.params.name }}</h2>
      <div id="app">
        <div v-if="!gameStarted && !gameEnded">
          <h1>Тест: Сравнение объектов</h1>
          <p><strong>Игра:</strong> "Сравнение объектов" — это когнитивная игра для тренировки внимания, концентрации и способности к быстрому анализу визуальной информации.</p>
          <p><strong>Цель игры:</strong> сравнить два изображения и определить, совпадают ли они.</p>
          <p>Нажмите "Начать игру", после чего на экране появится два набора изображений. Ваша задача — внимательно сравнить их и выбрать правильный ответ, нажав "Да", если изображения идентичны, или "Нет", если они различаются. За каждую ошибку теряется одна жизнь. Время выполнения теста 30 секунд.</p>
          <button class="start-button" @click="startGame">Начать игру</button>
        </div>

        <div v-else-if="gameStarted">
          <text>Оставшееся время: {{ formattedTime }}</text> <br>
          <text>Жизни: {{ lives }}</text> <br>
          <text>Раунд: {{ number_all_answers }}</text> <br>
          <text>Правильные ответы: {{ number_correct_answers }} / {{ number_all_answers }}</text>
          <p class="instruction mt-2"><strong>Совпадают ли изображения?</strong></p>
          <div class="game-area d-flex justify-content-center">
            <div class="image-container border p-3 mx-2">
              <div v-for="(symbol, index) in leftImage" :key="'left-' + index" class="symbol">
                {{ symbol }}
              </div>
            </div>
            <div class="image-container border p-3 mx-2">
              <div v-for="(symbol, index) in rightImage" :key="'right-' + index" class="symbol">
                {{ symbol }}
              </div>
            </div>
          </div>
          <div class="choices d-flex justify-content-center">
            <button class="choice-button btn btn-danger mx-2" @click="handleAnswer(false)">Нет</button>
            <button class="choice-button btn btn-success mx-2" @click="handleAnswer(true)">Да</button>
          </div>
          <p class="message" :class="{ correct: isCorrect, incorrect: !isCorrect }">{{ message }}</p>
        </div>
        <div v-if="gameEnded" class="end-message">
          <h3>Игра завершена!</h3>
          <text>Правильные ответы: {{ number_correct_answers }} из {{ number_all_answers }}</text> <br>
          <text>Точность: {{ accuracy }}%</text> <br>
          <text>Время выполнения: {{ time }}</text> <br>
          <text>Совет: Постарайтесь улучшить свою скорость и точность, тренируя внимательность и концентрацию.</text>
        </div>
      </div>
      <br><router-link to="/tests" class="btn btn-secondary">Назад к тестам</router-link>
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
            gameStarted: false,
            gameEnded: false,
            timeRemaining: 30,
            timer: null,
            lives: 3,
            symbolsCount: 2,
            maxSymbolsCount: 6,
            leftImage: [],
            rightImage: [],
            imagesMatch: false,
            message: "",
            isCorrect: null,
            number_all_answers: 0, 
            number_correct_answers: 0, 
            startTime: null,
            time: "00:00:00",
            symbols: ["🔲", "⚫", "⬛", "▷", "▼", "▲", "▽", "🔘"],
        };
    },
    computed: {
        formattedTime() {
            return this.formatTime(this.timeRemaining);
        },
        accuracy() {
            return this.number_all_answers > 0
                ? ((this.number_correct_answers / this.number_all_answers) * 100).toFixed(2)
                : "0.00";
        },
    },
    methods: {
        startGame() {
            this.gameStarted = true;
            this.gameEnded = false;
            this.lives = 3;
            this.number_all_answers = 0;
            this.number_correct_answers = 0;
            this.timeRemaining = 30;
            this.startTime = Date.now();
            this.generateImages();
            this.startTimer();
        },
        startTimer() {
            clearInterval(this.timer);
            this.timer = setInterval(() => {
                if (this.timeRemaining > 0) {
                    this.timeRemaining--;
                } else {
                    clearInterval(this.timer);
                    this.endGame(true);
                }
            }, 1000);
        },
        generateImages() {
            const leftImage = Array.from({ length: this.symbolsCount }, () =>
                this.symbols[Math.floor(Math.random() * this.symbols.length)]
            );
            const rightImage = [...leftImage];

            this.imagesMatch = Math.random() < 0.7;
            if (!this.imagesMatch) {
                const randomIndex = Math.floor(Math.random() * rightImage.length);
                let randomSymbol;
                do {
                    randomSymbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
                } while (randomSymbol === rightImage[randomIndex]);
                rightImage[randomIndex] = randomSymbol;
            }

            this.leftImage = leftImage;
            this.rightImage = rightImage;
            this.number_all_answers++; 
        },
        handleAnswer(answer) {
            if (this.gameEnded) return;

            if (answer === this.imagesMatch) {
                this.message = "Правильно!";
                this.isCorrect = true;
                this.number_correct_answers++; 
            } else {
                this.message = "Неправильно!";
                this.isCorrect = false;
                this.lives--;
            }

            if (this.lives === 0) {
                this.endGame();
            } else {
                if (this.number_all_answers % 3 === 0 && this.symbolsCount < this.maxSymbolsCount) {
                    this.symbolsCount++;
                }
                setTimeout(() => {
                    this.message = "";
                    this.generateImages();
                }, 1000);
            }
        },
        endGame(forceStop = false) {
            if (this.gameEnded) return;
            this.gameEnded = true;
            clearInterval(this.timer);

            const totalSeconds = forceStop ? 30 : Math.min(30, Math.floor((Date.now() - this.startTime) / 1000));
            this.time = this.formatTime(totalSeconds);

            this.saveResults();
        },
        formatTime(seconds) {
            const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
            const sec = String(seconds % 60).padStart(2, '0');
            return `${hours}:${minutes}:${sec}`;
        },
        async saveResults() {
            const testId = 6;
            const scorePercentage = this.accuracy;

            try {
                const response = await fetch("https://svetasy.pythonanywhere.com/api/result/", {
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
    },
};
</script>

<style src="../assets/style.css"></style>
