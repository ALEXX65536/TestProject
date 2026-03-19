const listEl = document.getElementById("list");
const searchEl = document.getElementById("search");
const statusEl = document.getElementById("status");
const countEl = document.getElementById("count");

const modal = document.getElementById("modal");
const todoTemplate = document.getElementById("todo-template");
const modalTemplate = document.getElementById("modal-template");

let todos = [];
let users = [];

// Загрузка данных
async function loadData() {
  try {
    listEl.textContent = "Loading...";

    const [todosRes, usersRes] = await Promise.all([
      fetch("https://jsonplaceholder.typicode.com/todos"),
      fetch("https://jsonplaceholder.typicode.com/users"),
    ]);

    if (!todosRes.ok || !usersRes.ok) {
      throw new Error("Ошибка загрузки!");
    }

    todos = await todosRes.json();
    users = await usersRes.json();

    render();
  } catch (err) {
    listEl.textContent = "Error: " + err.message;
  }
}

// Фильтрация и сортировка задач
function getFilteredTodos() {
  const search = searchEl.value.toLowerCase();
  const status = statusEl.value;

  return todos
    .filter(t => t.title.toLowerCase().includes(search))
    .filter(t => {
      if (status === "completed") return t.completed;
      if (status === "active") return !t.completed;
      return true;
    })
    .sort((a, b) => a.title.localeCompare(b.title)) // сортировка по алфавиту
    .slice(0, 15);
}

// Отрисовка карточек
function render() {
  const filtered = getFilteredTodos();
  countEl.textContent = `Найдено: ${filtered.length}`;

  listEl.innerHTML = "";
  if (!filtered.length) {
    listEl.textContent = "No tasks found";
    return;
  }

  filtered.forEach(todo => {
    const clone = todoTemplate.content.cloneNode(true);
    clone.querySelector("h3").textContent = todo.title;
    clone.querySelector(".status").textContent = "Status: " + (todo.completed ? "✅ Done" : "❌ Not done");
    clone.querySelector(".user-id").textContent = `User ID: ${todo.userId}`;

    clone.querySelector(".card").addEventListener("click", () => openModal(todo));

    listEl.appendChild(clone);
  });
}

// Открытие модального окна через шаблон
function openModal(todo) {
  modal.innerHTML = "";

  const modalClone = modalTemplate.content.cloneNode(true);

  modalClone.querySelector(".title").textContent = todo.title;
  modalClone.querySelector(".status").textContent = "Status: " + (todo.completed ? "✅ Done" : "❌ Not done");
  modalClone.querySelector(".id").textContent = `ID: ${todo.id}`;
  modalClone.querySelector(".user-id").textContent = `User ID: ${todo.userId}`;

  const user = users.find(u => u.id === todo.userId);
  const userInfoEl = modalClone.querySelector(".user-info");
  if (user) {
    userInfoEl.textContфent = ""; 
    const nameEl = document.createElement("p");
    nameEl.textContent = `Name: ${user.name}`;
    const emailEl = document.createElement("p");
    emailEl.textContent = `Email: ${user.email}`;
    userInfoEl.appendChild(nameEl);
    userInfoEl.appendChild(emailEl);
  }

  // Обработчик закрытия модального окна
  modalClone.querySelector(".close-btn").addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  modal.appendChild(modalClone);
  modal.classList.remove("hidden");
}

// Закрытие модального окна при клике на overlay
modal.addEventListener("click", e => {
  if (e.target === modal) modal.classList.add("hidden");
});

// События фильтров
searchEl.addEventListener("input", render);
statusEl.addEventListener("change", render);

// Инициализация
loadData();