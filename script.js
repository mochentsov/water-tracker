const dailyGoal = 2000;
let currentChart = null; // Переменная для хранения текущего экземпляра графика

// Функция для обновления отображения текущего потребления
function updateDisplay() {
    const currentIntake = getCurrentIntake();
    document.getElementById('water-consumed').textContent = `Выпито: ${currentIntake} мл`;
}

// Функция для добавления воды
function addWater(amount) {
    const timestamp = new Date().toISOString().slice(0, 16); // формат ГГГГ-ММ-ДД ЧЧ:ММ
    const waterData = getWaterData();

    // Добавляем воду к текущему времени
    if (!waterData[timestamp]) waterData[timestamp] = 0;
    waterData[timestamp] += amount;

    localStorage.setItem('waterData', JSON.stringify(waterData));
    updateDisplay();
    loadMinuteStats();
}

// Функция для добавления воды вручную
function manualAdd() {
    const input = document.getElementById('manual-input');
    const amount = parseInt(input.value);
    if (!isNaN(amount) && amount > 0) {
        addWater(amount);
        input.value = '';
    }
}

// Получение данных о воде из localStorage
function getWaterData() {
    return JSON.parse(localStorage.getItem('waterData')) || {};
}

// Получение текущего потребления воды за последний час
function getCurrentIntake() {
    const currentHour = new Date().toISOString().slice(0, 13); // текущий час ГГГГ-ММ-ДД ЧЧ
    const waterData = getWaterData();
    let intake = 0;

    // Суммируем данные за текущий час
    for (const [time, amount] of Object.entries(waterData)) {
        if (time.startsWith(currentHour)) intake += amount;
    }
    return intake;
}

// Загрузка статистики по минутам
function loadMinuteStats() {
    const ctx = document.getElementById('chart').getContext('2d');
    const waterData = getWaterData();
    const currentHour = new Date().toISOString().slice(0, 13); // текущий час ГГГГ-ММ-ДД ЧЧ

    const labels = [];
    const data = [];

    // Собираем данные за последние 60 минут
    for (let i = 0; i < 60; i++) {
        const minute = `${currentHour}:${String(i).padStart(2, '0')}`;
        labels.push(`Минут ${i + 1}`);
        data.push(waterData[minute] || 0);
    }

    // Уничтожаем предыдущий график, если он существует
    if (currentChart) {
        currentChart.destroy();
    }

    // Создаём новый график
    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Выпитая вода (мл)',
                data: data,
                borderColor: 'blue',
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        font: {
                            family: 'Arial',
                        }
                    }
                }
            }
        }
    });
}

// Загрузка данных при открытии страницы
window.onload = () => {
    updateDisplay();
    loadMinuteStats();
};
