const holes = document.querySelectorAll('.hole');
const scoreBoard = document.getElementById('score');
const levelBoard = document.getElementById('level');
const timerBoard = document.getElementById('timer'); // 新增計時器元素
const startBtn = document.getElementById('startBtn');
const hammer = document.getElementById('hammer');
const bonkSound = document.getElementById('bonkSound');
const bgm = document.getElementById('bgm');
const bombSound = document.getElementById('bombSound');
const starSound = document.getElementById('starSound');

let lastHole;
let timeUp = false;
let score = 0;
let level = 1;
let moleSpeed = 1200;
let bombChance = 0.3;
let starChance = 0;
let time = 45; // **每關時間為 45 秒**
let countdown; // 儲存計時器 ID

function randomTime(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function randomHole(holes) {
  const idx = Math.floor(Math.random() * holes.length);
  const hole = holes[idx];
  if (hole === lastHole) {
    return randomHole(holes);
  }
  lastHole = hole;
  return hole;
}

function peep() {
  const time = randomTime(moleSpeed * 0.5, moleSpeed);
  const hole = randomHole(holes);
  
  const mole = hole.querySelector('.mole');
  const bomb = hole.querySelector('.bomb');
  const star = hole.querySelector('.star');

  if (level > 5 && Math.random() < starChance) {
    star.classList.add('up');
    mole.classList.remove('up');
    bomb.classList.remove('up');
  } else if (Math.random() < bombChance) {
    bomb.classList.add('up');
    mole.classList.remove('up');
    star.classList.remove('up');
  } else {
    mole.classList.add('up');
    bomb.classList.remove('up');
    star.classList.remove('up');
  }

  setTimeout(() => {
    mole.classList.remove('up');
    bomb.classList.remove('up');
    star.classList.remove('up');
    if (!timeUp) peep();
  }, time);
}

function startLevel() {
  time = 45;
  timerBoard.textContent = `時間: ${time}`;
  
  // 每一秒鐘更新一次計時器
  countdown = setInterval(() => {
    time--;
    timerBoard.textContent = `時間: ${time}`;
    if (time <= 0) {
      stopLevel();
      alert(`遊戲結束！你的分數是：${score}，未能完成關卡目標`);
      startBtn.disabled = false;
    }
  }, 1000);
}

function stopLevel() {
  clearInterval(countdown);
  timeUp = true;
}

function startGame() {
  score = 0;
  level = 1;
  moleSpeed = 1200;
  bombChance = 0.3;
  starChance = 0;
  timeUp = false;
  scoreBoard.textContent = "分數: 0";
  levelBoard.textContent = "關卡: 1";
  startBtn.disabled = true;
  peep();
  startLevel();
  bgm.play();
}

function checkLevelUp() {
  // **修正：過關分數以倍數計分**
  const scoreGoal = 5 * Math.pow(2, level - 1);

  if (score >= scoreGoal && level < 15) {
    level++;
    levelBoard.textContent = `關卡: ${level}`;
    alert(`恭喜你！進入第 ${level} 關！目標分數：${scoreGoal * 2}`);
    
    moleSpeed = Math.max(200, moleSpeed - 50); 
    bombChance = Math.min(0.8, bombChance + 0.05); 
    
    if (level > 5) {
      starChance = Math.min(0.2, starChance + 0.05);
    }
    
    // **過關後重啟計時器**
    stopLevel();
    startLevel();
    
  } else if (score >= scoreGoal && level === 15) {
      alert("恭喜你！你已經完成了所有關卡！");
      stopLevel();
      startBtn.disabled = false;
  }
}

function bonk(e) {
  const targetElement = e.target.closest('.mole') || e.target.closest('.bomb') || e.target.closest('.star');
  if (!targetElement || !targetElement.classList.contains('up')) return;

  if (targetElement.classList.contains('mole')) {
    const moleImg = targetElement.querySelector('img');
    moleImg.src = "pet_head_bonked.png";
    score++;
    bonkSound.currentTime = 0;
    bonkSound.play();
    
    targetElement.classList.remove('up');
    
    checkLevelUp();
    
    setTimeout(() => {
      moleImg.src = "pet_head_normal.png";
    }, 1000);
    
  } else if (targetElement.classList.contains('bomb')) {
    score -= 5;
    bombSound.currentTime = 0;
    bombSound.play();
    alert("你打到炸彈了！分數 -5");
    
    targetElement.classList.remove('up');
  } else if (targetElement.classList.contains('star')) {
    score += 5;
    starSound.currentTime = 0;
    starSound.play();
    alert("恭喜！你打到星星了！分數 +5");
    
    targetElement.classList.remove('up');
  }
  
  scoreBoard.textContent = `分數: ${score}`;
  // 每次得分都檢查是否過關
  const scoreGoal = 5 * Math.pow(2, level - 1);
  if (score >= scoreGoal) {
    checkLevelUp();
  }
}

document.addEventListener('touchstart', e => {
  const touch = e.touches[0];
  hammer.style.left = (touch.pageX - 40) + "px";
  hammer.style.top = (touch.pageY - 40) + "px";
  hammer.style.display = "block";
  hammer.classList.add('active');
  
  bonk(e);
  
  setTimeout(() => hammer.classList.remove('active'), 200);
});

document.addEventListener('touchend', e => {
  hammer.style.display = "none";
});

startBtn.addEventListener('click', startGame);