<template>
  <Navbar />
  <div class="container mt-5">
    <div class="card p-4 shadow-lg mx-5 mb-5">
      <h2 class="text-center mb-4">Введите информацию о себе</h2>

      <form @submit.prevent="saveProfile">
        <!-- Возраст -->
        <div class="mb-3">
          <label class="form-label">Возраст</label>
          <input v-model="form.age" type="number" class="form-control" :disabled="!isEditing" placeholder="Введите возраст" required />
        </div>

        <!-- Эмоциональное состояние -->
        <div class="mb-3">
          <label class="form-label d-block">Как вы себя чувствуете сейчас?</label>
          <div class="d-flex justify-content-around">
            <span v-for="(emoji, index) in emotions" :key="index"
                  class="emoji" :class="{ active: form.mood === index }"
                  @click="isEditing ? form.mood = index : null">
              {{ emoji }}
            </span>
          </div>
        </div>

        <!-- Образование -->
        <div class="mb-3">
          <label class="form-label">Базовое образование</label>
          <select v-model="form.education" class="form-select" :disabled="!isEditing">
            <option disabled value="">Выберите</option>
            <option>Среднее</option>
            <option>Средне-специальное</option>
            <option>Высшее</option>
          </select>
        </div>

        <!-- Специальность -->
        <div class="mb-3">
          <label class="form-label">Специальность</label>
          <input v-model="form.speciality" type="text" class="form-control" :disabled="!isEditing" placeholder="Введите специальность" />
        </div>

        <!-- Место проживания -->
        <div class="mb-3">
          <label class="form-label">Место основного проживания</label>
          <input v-model="form.residence" type="text" class="form-control" :disabled="!isEditing" placeholder="Введите город" />
        </div>

        <!-- Рост и вес -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Рост (см)</label>
            <input v-model="form.height" type="number" class="form-control" :disabled="!isEditing" placeholder="Введите рост" />
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Вес (кг)</label>
            <input v-model="form.weight" type="number" class="form-control" :disabled="!isEditing" placeholder="Введите вес" />
          </div>
        </div>

        <!-- Ведущая рука -->
        <div class="mb-3">
          <label class="form-label">Какая у вас основная рука?</label>
          <select v-model="form.lead_hand" class="form-select" :disabled="!isEditing">
            <option disabled value="">Выберите</option>
            <option>Правая</option>
            <option>Левая</option>
            <option>Обе</option>
          </select>
        </div>

        <!-- Заболевания -->
        <div class="mb-3">
          <label class="form-label">Хронические заболевания (если есть)</label>
          <input v-model="form.diseases" type="text" class="form-control" :disabled="!isEditing" placeholder="Введите заболевания" />
        </div>

        <!-- Спорт -->
        <div class="mb-3">
          <label class="form-label">Занимаетесь ли спортом?</label>
          <input v-model="form.sport" type="text" class="form-control" :disabled="!isEditing" placeholder="Введите вид спорта или 'Нет'" />
        </div>

        <!-- Курение -->
        <div class="mb-3 form-check form-switch">
          <input v-model="form.smoking" class="form-check-input" type="checkbox" id="smokingSwitch" :disabled="!isEditing">
          <label class="form-check-label" for="smokingSwitch">Курение</label>
        </div>

        <!-- Алкоголь -->
        <div class="mb-3">
          <label class="form-label">Как часто употребляете алкоголь?</label>
          <select v-model="form.alcohol" class="form-select" :disabled="!isEditing">
            <option disabled value="">Выберите</option>
            <option>Не употребляю</option>
            <option>Редко</option>
            <option>Часто</option>
          </select>
        </div>

        <!-- Бессонница -->
        <div class="mb-3 form-check form-switch">
          <input v-model="form.insomnia" class="form-check-input" type="checkbox" id="insomniaSwitch" :disabled="!isEditing">
          <label class="form-check-label" for="insomniaSwitch">Бессонница</label>
        </div>

        <!-- Геймер -->
        <div class="mb-3 form-check form-switch">
          <input v-model="form.gaming" class="form-check-input" type="checkbox" id="gamingSwitch" :disabled="!isEditing">
          <label class="form-check-label" for="gamingSwitch">Являетесь ли геймером?</label>
        </div>

        <!-- Текущее здоровье -->
        <div class="mb-3">
          <label class="form-label">Текущее состояние здоровья (1-10)</label>
          <input v-model="form.current_health" type="number" min="1" max="10" class="form-control" :disabled="!isEditing" placeholder="Оцените от 1 до 10" />
        </div>

        <!-- Кнопки -->
        <button v-if="isEditing" type="submit" class="btn btn-success w-100 mt-3">Сохранить</button>
        <button v-else type="button" class="btn btn-primary w-100 mt-3" @click="editProfile">Редактировать</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Navbar from "../view/Navbar.vue";
import { useAuthStore } from "../store/authStore";

const authStore = useAuthStore();
const isEditing = ref(false);

const form = ref({
  age: 25,
  mood: 3,
  education: "Высшее",
  speciality: "Программист",
  residence: "Москва",
  height: 175,
  weight: 70,
  lead_hand: "",
  diseases: "",
  sport: "",
  smoking: false,
  alcohol: "Редко",
  insomnia: false,
  gaming: true,
  current_health: null
});

const emotions = ["😢", "😟", "😐", "😊", "😁"];

const saveProfile = async () => {
  if (!authStore.user || !authStore.user.id) {
    alert("Пользователь не авторизован. Пожалуйста, войдите в систему.");
    return;
  }

  const data = {
    user: authStore.user.id,
    ...form.value,
  };

  try {
    const response = await fetch("http://127.0.0.1:8000/api/profile/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert("Анкета успешно сохранена!");
      isEditing.value = false;
    } else {
      const errorData = await response.json();
      alert(errorData.error || "Ошибка при сохранении анкеты");
    }
  } catch (error) {
    console.error("Ошибка при отправке данных:", error);
    alert("Ошибка при отправке данных");
  }
};

const editProfile = () => {
  isEditing.value = true;
};
</script>
