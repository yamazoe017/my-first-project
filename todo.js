// localStorageに保存するときのキー名
const STORAGE_KEY = "todo-tasks";

const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const addButton = document.getElementById("addButton");
const clearDoneButton = document.getElementById("clearDoneButton");
const filterButtons = document.querySelectorAll(".filter-button");
const remainingCount = document.getElementById("remainingCount");
const emptyMessage = document.getElementById("emptyMessage");

// タスクは { id, text, done } の配列として管理する
let tasks = loadTasks();

// 画面に表示する条件："all"（すべて） / "active"（未完了） / "done"（完了済み）
let currentFilter = "all";

// 編集中のタスクのid（編集していないときはnull）
let editingId = null;

// 画面を開いたときに、保存されているタスクを表示する
renderTasks();

// 「追加」ボタンをクリックしたときにタスクを追加する
addButton.addEventListener("click", addTask);

// 入力欄でEnterキーを押したときにもタスクを追加する
taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});

// 「完了済みを一括削除」ボタンをクリックしたときの処理
clearDoneButton.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.done);
  saveTasks();
  renderTasks();
});

// フィルターボタン（すべて／未完了／完了済み）の切り替え
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((b) => b.classList.remove("is-active"));
    button.classList.add("is-active");

    renderTasks();
  });
});

function addTask() {
  const taskText = taskInput.value.trim();

  if (taskText === "") {
    alert("タスクを入力してください");
    return;
  }

  tasks.push({
    id: Date.now(),
    text: taskText,
    done: false,
  });

  saveTasks();
  renderTasks();

  taskInput.value = "";
}

function toggleDone(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.done = !task.done;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderTasks();
}

function startEditing(id) {
  editingId = id;
  renderTasks();
}

function finishEditing(id, newText) {
  const trimmed = newText.trim();
  const task = tasks.find((t) => t.id === id);

  // 空文字にした場合は変更をキャンセルする
  if (task && trimmed !== "") {
    task.text = trimmed;
    saveTasks();
  }

  editingId = null;
  renderTasks();
}

// 現在のフィルター条件に合うタスクだけを取り出す
function getFilteredTasks() {
  if (currentFilter === "active") {
    return tasks.filter((task) => !task.done);
  }
  if (currentFilter === "done") {
    return tasks.filter((task) => task.done);
  }
  return tasks;
}

// tasks配列の内容でリスト表示を作り直す
function renderTasks() {
  taskList.innerHTML = "";

  const filteredTasks = getFilteredTasks();

  emptyMessage.style.display = filteredTasks.length === 0 ? "block" : "none";

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => toggleDone(task.id));
    li.appendChild(checkbox);

    if (editingId === task.id) {
      // 編集中はテキストの代わりに入力欄を表示する
      const editInput = document.createElement("input");
      editInput.type = "text";
      editInput.className = "task-edit-input";
      editInput.value = task.text;

      editInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          finishEditing(task.id, editInput.value);
        }
        if (event.key === "Escape") {
          editingId = null;
          renderTasks();
        }
      });

      editInput.addEventListener("blur", () => {
        finishEditing(task.id, editInput.value);
      });

      li.appendChild(editInput);
      editInput.focus();
    } else {
      const span = document.createElement("span");
      span.textContent = task.text;
      span.className = task.done ? "task-text done" : "task-text";
      li.appendChild(span);

      const editButton = document.createElement("button");
      editButton.textContent = "✎";
      editButton.className = "icon-button";
      editButton.title = "タスク名を編集";
      editButton.addEventListener("click", () => startEditing(task.id));
      li.appendChild(editButton);
    }

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "🗑";
    deleteButton.className = "icon-button delete-button";
    deleteButton.title = "削除";
    deleteButton.addEventListener("click", () => deleteTask(task.id));
    li.appendChild(deleteButton);

    taskList.appendChild(li);
  });

  const remaining = tasks.filter((task) => !task.done).length;
  remainingCount.textContent = `${remaining}件の未完了タスク`;
}

// tasks配列を文字列（JSON）に変換してlocalStorageに保存する
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// localStorageから保存済みのタスクを読み込む（無ければ空の配列）
function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}
