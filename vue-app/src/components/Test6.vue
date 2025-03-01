<template> 
    <Navbar />
    <div class="container mt-5 text-center">
      <h2>{{ $route.params.name }}</h2>
      <div id="app">
        <div v-if="!gameStarted && !gameEnded">
          <h1>Игра "Сравнение объектов"</h1>
          <p><strong>"Сравнение объектов"</strong> — это игра для развития произвольного внимания и концентрации.</p>
          <p><strong>Цель игры:</strong> сравнить два изображения и определить, совпадают ли они.</p>
          <p>Игра помогает тренировать внимание, увеличивать концентрацию и улучшать способность к быстрому анализу.</p>
          <button class="start-button btn btn-primary" @click="startGame">Начать игру</button>
        </div>

        <div v-else-if="gameStarted">
          <p>Оставшееся время: {{ formattedTime }}</p>
          <p>Жизни: {{ lives }}</p>
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
          <p class="instruction">Совпадают ли изображения?</p>
          <div class="choices d-flex justify-content-center">
            <button class="choice-button btn btn-danger mx-2" @click="handleAnswer(false)">Нет</button>
            <button class="choice-button btn btn-success mx-2" @click="handleAnswer(true)">Да</button>
          </div>
          <p class="message" :class="{ correct: isCorrect, incorrect: !isCorrect }">{{ message }}</p>
        </div>

        <div v-if="gameEnded" class="end-message">
          <h3>Игра завершена!</h3>
          <p>Правильных ответов: {{ number_all_answers }} из {{ number_correct_answers }}</p>
          <p>Точность: {{ accuracy }}%</p>
          <p>Время выполнения: {{ time }}</p>
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
            gameStarted: false,
            gameEnded: false,
            timeRemaining: 30, // Таймер от 30 секунд вниз
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
            startTime: null, // Время начала теста
            time: "00:00:00", // Фактическое время выполнения (добавлено)
            symbols: ["🔲", "⚫", "⬛", "▷", "▼", "▲", "▽", "🔘"],
        };
    },
    computed: {
        formattedTime() {
            return this.formatTime(this.timeRemaining);
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
            this.startTime = Date.now(); // Фиксируем время начала игры
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
                    this.endGame(true); // true = принудительное завершение по таймеру
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
            this.number_correct_answers++;
        },
        handleAnswer(answer) {
            if (this.gameEnded) return;

            if (answer === this.imagesMatch) {
                this.message = "Правильно!";
                this.isCorrect = true;
                this.number_all_answers++;
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

            // Фиксируем время выполнения в переменную time
            const totalSeconds = forceStop ? 30 : Math.min(30, Math.floor((Date.now() - this.startTime) / 1000));
            this.time = this.formatTime(totalSeconds);

            // Точность вычисляется правильно
            this.accuracy = this.number_correct_answers > 0 
                ? ((this.number_all_answers / this.number_correct_answers) * 100).toFixed(2) 
                : "0.00";
            if (this.number_all_answers === this.number_correct_answers) {
                this.accuracy = "100.00";
            }

            this.saveResults();
        },
        formatTime(seconds) {
            const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
            const sec = String(seconds % 60).padStart(2, '0');
            return `${hours}:${minutes}:${sec}`;
        },
        async saveResults() {
            if (!this.authStore.user) {
                alert("Пользователь не авторизован. Пожалуйста, войдите в систему.");
                return;
            }

            const testId = 6;
            const scorePercentage = parseFloat(this.accuracy);

            try {
                const response = await fetch("http://127.0.0.1:8000/api/result/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                        test: testId,
                        user: this.authStore.user.id,
                        score_percentage: scorePercentage,
                        time_spent: this.time, // Сохраняем время выполнения
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

