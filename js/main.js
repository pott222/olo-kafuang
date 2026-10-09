document.addEventListener("DOMContentLoaded", () => {
    // Находим кнопку бургер-меню и сам блок с ссылками
    // Замени '.burger' и '.nav-links' на те классы, которые используются в твоем HTML!
    const burger = document.querySelector('.burger'); 
    const nav = document.querySelector('.nav-links');

    if (burger && nav) {
        burger.addEventListener('click', () => {
            // При клике добавляем или убираем класс 'active'
            nav.classList.toggle('active');
            burger.classList.toggle('active');
        });
    }
});
