// Gestion des onglets
const tabs = document.querySelectorAll('.tab');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    tab.classList.add('active');
    document.getElementById(tab.dataset.target).classList.add('active');
  });
});

// Timer
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-timer-btn');
const circle = document.querySelector('.progress-ring__circle');
const inputMinutes = document.getElementById('timer-minutes');

let timerDuration = 0;
let timeLeft = 0;
let timerInterval;
const radius = circle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;

circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = circumference;

function setProgress(percent) {
  const offset = circumference - (percent / 100) * circumference;
  circle.style.strokeDashoffset = offset;
}

startBtn.addEventListener('click', () => {
  if (timerInterval) clearInterval(timerInterval);
  timerDuration = parseInt(inputMinutes.value, 10);
  if (isNaN(timerDuration) || timerDuration <= 0) {
    alert('Entre un temps valide');
    return;
  }
  timeLeft = timerDuration * 60;
  updateTimerDisplay();
  setProgress(0);

  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert('Timer terminé ! Tu gagnes 10 🪙');
      coins += 10;
      updateCoinsDisplay();
      saveData();
      setProgress(100);
      return;
    }
    updateTimerDisplay();
    setProgress(((timerDuration * 60 - timeLeft) / (timerDuration * 60)) * 100);
  }, 1000);
});

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
}

// Notes
const notesTextarea = document.getElementById('notes-textarea');
notesTextarea.addEventListener('input', saveData);

// To-Do List
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');

addTaskBtn.addEventListener('click', () => {
  const text = taskInput.value.trim();
  if (!text) return;
  addTask(text);
  taskInput.value = '';
  saveData();
});

function addTask(text, done = false) {
  const li = document.createElement('li');
  li.textContent = text;
  if(done) li.classList.add('done');

  li.addEventListener('click', () => {
    li.classList.toggle('done');
    saveData();
  });

  li.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if(confirm('Supprimer cette tâche ?')) {
      li.remove();
      saveData();
    }
  });

  taskList.appendChild(li);
}

// Boutique récompenses
const rewardsList = document.getElementById('rewards-list');
const buyRewardBtn = document.getElementById('buy-reward-btn');

const rewards = [
  {name: 'Pause 5 minutes', cost: 20},
  {name: 'Ouvrir Brave', cost: 50},
  {name: 'Ouvrir VSCode', cost: 50}
];

rewards.forEach((r, i) => {
  const li = document.createElement('li');
  li.textContent = `${r.name} (${r.cost} 🪙)`;
  li.dataset.cost = r.cost;
  li.addEventListener('click', () => {
    document.querySelectorAll('#rewards-list li').forEach(el => el.classList.remove('selected'));
    li.classList.add('selected');
    selectedRewardIndex = i;
  });
  rewardsList.appendChild(li);
});

let selectedRewardIndex = null;
let coins = 0;

function updateCoinsDisplay() {
  buyRewardBtn.textContent = `Acheter Récompense (${coins} 🪙)`;
}

buyRewardBtn.addEventListener('click', () => {
  if(selectedRewardIndex === null) {
    alert('Sélectionne une récompense');
    return;
  }
  const reward = rewards[selectedRewardIndex];
  if(coins < reward.cost) {
    alert('Pas assez de pièces');
    return;
  }
  coins -= reward.cost;
  updateCoinsDisplay();

  switch(reward.name) {
    case 'Pause 5 minutes':
      alert('Pause activée : 5 minutes');
      break;
    case 'Ouvrir Brave':
      window.electronAPI.openExternal('brave://newtab');
      break;
    case 'Ouvrir VSCode':
      
      window.electronAPI.openPath('C:\\Program Files\\Microsoft VS Code\\Code.exe');
      break;
  }
  saveData();
});

updateCoinsDisplay();

// Sauvegarde & chargement localStorage
function saveData() {
  const tasks = [];
  taskList.querySelectorAll('li').forEach(li => {
    tasks.push({text: li.textContent, done: li.classList.contains('done')});
  });
  const data = {
    coins,
    tasks,
    notes: notesTextarea.value
  };
  localStorage.setItem('kofu-data', JSON.stringify(data));
}

function loadData() {
  const data = JSON.parse(localStorage.getItem('kofu-data'));
  if(!data) return;
  coins = data.coins || 0;
  updateCoinsDisplay();
  notesTextarea.value = data.notes || '';
  if(Array.isArray(data.tasks)) {
    data.tasks.forEach(t => addTask(t.text, t.done));
  }
}

loadData();
