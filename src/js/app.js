'use strict';
import { wordBank } from "./word-bank.js";
import { select, listen, create, addClass, removeClass } from './utils.js';

/*-------------------------------------------------------------------------->
	ELEMENT SELECTORS 
<--------------------------------------------------------------------------*/
const startButton = select('.start-btn');
const startScrn = select('.start-scrn-wrapper');
const gameArea = select('.game-area');
const beginGame = select('.restart-reset');
const wordDisplay = select('.word-display');
const userInput = select('.word-entry');
const timer = select('.timer');
const scoreboard = select('.scoreboard');
const stashBackground = select('.circle-bg');
const backgroundMusic = select('.background-music');
const pointSoundEffect = select('.sound-effect');
const endgameSound = select('.endgame-sound');
const timerIcon = select('.dynamite');
const viewScores = select('.view-scores');
const scoresWrapper = select('.scores-wrapper');
const scoresList = select('.high-scores-list');
const homeButton = select('.home');
const muteButton = select('.mute');
const boomButton = select('.boom');
const boomImage = select('.boom-img');

/*-------------------------------------------------------------------------->
	VARIABLE DECLARATIONS
<--------------------------------------------------------------------------*/

const shuffleWords = arr => arr.sort(() => Math.random() - 0.5);

let maxTime = 60;  
let gameOver = false;
let hits = 0;  
let totalWords;  

let shuffledWords = shuffleWords(wordBank);  
let startTime = new Date();  
let timerInterval; 


/*-------------------------------------------------------------------------->
	DATE
<--------------------------------------------------------------------------*/

function getDate() {
  const options = {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }

  return new Date().toLocaleDateString('en-ca', options);
}

/*-------------------------------------------------------------------------->
	TIMER
<--------------------------------------------------------------------------*/

function updateTimer() {
  const remainingTime = maxTime - Math.floor((new Date() - startTime) / 1000);
  const formattedTime = remainingTime < 10 ? `0${remainingTime}` : remainingTime;

  if (remainingTime <= 0) {
    timer.innerText = '00';
    timerIcon.classList.remove('zoomier');  
    timerIcon.classList.remove('zoom');  
    toggleClassWithTimeout();
  } else {
    timer.innerText = formattedTime;
    if (remainingTime <= 15 && !timerIcon.classList.contains('zoom')) {
      timerIcon.classList.add('zoom'); 
    }
    if (remainingTime <= 5 && !timerIcon.classList.contains('zoomier')) {
      timerIcon.classList.remove('zoom');  
      timerIcon.classList.add('zoomier'); 
    }
  }
}

function startTimer() {
  startTime = new Date();  
  timer.innerText = '60'; 
  gameOver = false; 

  timerInterval = setInterval(() => {
    if (gameOver) {
      clearInterval(timerInterval); 
      return;
    }

    const remainingTime = maxTime - Math.floor((new Date() - startTime) / 1000);

    if (remainingTime <= 0) {
      gameOver = true;
      backgroundMusic.pause();
      endgameSound.play();  
      userInput.value = '';
      userInput.disabled = true;
      clearInterval(timerInterval);  
      calculateScore();
      updateTimer(); 
    } else {
      updateTimer();  
    }
  }, 1000);  
}


/*-------------------------------------------------------------------------->
	DISPLAY TARGET WORDS
<--------------------------------------------------------------------------*/

function renderNextWord(arr) {
  const word = arr[0];  
  wordDisplay.innerHTML = ''; 
  
  const spansArray = word.split('').map(character => {
    const characterSpan = create('span');
    characterSpan.innerText = character;
    return characterSpan;  
  });
  spansArray.forEach(span => wordDisplay.appendChild(span));
  return spansArray;
}

/*-------------------------------------------------------------------------->
	START GAME
<--------------------------------------------------------------------------*/
function startGame() {
  userInput.disabled = false;
  shuffledWords = shuffleWords(wordBank);  
  totalWords = shuffledWords.length; 
  hits = 0; 
  gameOver = false;
  timerIcon.classList.remove('zoom', 'zoomier');

  startTimer();  
  renderNextWord(shuffledWords); 
  backgroundMusic.currentTime = 0;  
  backgroundMusic.play();          
  userInput.focus();
  const topScores = loadScoresFromLocalStorage();
  if (topScores.length > 0) {
    viewScores.classList.remove('hidden');
    viewScores.classList.add('visible');
  } else {
    viewScores.classList.remove('visible');
    viewScores.classList.add('hidden');
  }
}

/*-------------------------------------------------------------------------->
	INPUT HANDLERS
<--------------------------------------------------------------------------*/

function pointAnimation() {
  stashBackground.classList.add('bg-color');

  setTimeout(() => {
      stashBackground.classList.remove('bg-color');
  }, 200); 
}

function handleInput() {
  if (gameOver) return;

  const currentWord = wordDisplay.innerText.toLowerCase();  
  const userTyped = userInput.value.trimStart().toLowerCase();  

  const wordSpans = wordDisplay.querySelectorAll('span');

  wordSpans.forEach((span, index) => {
      if (userTyped[index] === span.innerText.toLowerCase()) { 
          addClass(span, 'correct'); 
      } else {
          removeClass(span, 'correct'); 
      }
  });

  if (userTyped === currentWord) {
      hits++;
      pointSoundEffect.play();
      pointAnimation();
      shuffledWords.shift();  
      userInput.value = ''; 

      displayHits();

      if (shuffledWords.length === 0) { 
          gameOver = true;  
          backgroundMusic.pause();
          endgameSound.play();
          userInput.disabled = true;
          calculateScore();  
          clearInterval(timerInterval); 
      } else {
          renderNextWord(shuffledWords); 
      }
  }
}

function handleKeydown(e) {
  if (gameOver) return;

  const currentWord = wordDisplay.innerText.toLowerCase();  
  const userTyped = userInput.value.trimStart().toLowerCase();  

  if (e.key === 'Backspace' && userTyped.length > 0) {
      const lastTypedIndex = userTyped.length - 1;

      const isCorrectSoFar = userTyped
          .slice(0, lastTypedIndex + 1)
          .split('')
          .every((char, index) => char === currentWord[index]);

      if (isCorrectSoFar && userTyped[lastTypedIndex] === currentWord[lastTypedIndex]) {
          e.preventDefault();
      }
  }
}


/*-------------------------------------------------------------------------->
	ORDERED FUNCTIONS 
<--------------------------------------------------------------------------*/
 
function displayHits() {
  scoreboard.innerText = hits.toString().padStart(2, '0');
}
setInterval(function() {
  displayHits;
}, 1000);

function saveScoresToLocalStorage(scores) {
  const topScores = scores.slice(0, 10);
  const scoresJSON = JSON.stringify(topScores);
  localStorage.setItem('scores', scoresJSON);
}

function loadScoresFromLocalStorage() {
  const scoresJSON = localStorage.getItem('scores');
  if (scoresJSON) {
    let scores = JSON.parse(scoresJSON);
    scores = scores.filter(score => score.hits > 0).slice(0, 10);
    return scores;
  }
  return [];
}

/*-------------------------------------------------------------------------->
	SCORE LIST GENERATOR
<--------------------------------------------------------------------------*/
function createScoreListItem(score) {
  const li = create('li');
  addClass(li, 'score-item'); 

  const details = `
      <span class="score-date">${score.date}</span> | 
      <span class="score-hits">${score.hits}</span> | 
      <span class="score-percentage">${score.percentage}%</span>
  `;

  li.innerHTML = details;

  return li; 
}

function populateScoreList(scores) {
  scoresList.innerHTML = ''; 
  scores.forEach((score, index) => {
    const li = createScoreListItem(score);
    // Andre, was this the idea behind the new way you mentioned?
    li.style.animationDelay = `${index * 0.2}s`; 
    li.classList.add('li-animation'); 
    scoresList.appendChild(li);
  });
}
/*-------------------------------------------------------------------------->
	CALCULATE SCORE 
<--------------------------------------------------------------------------*/

function calculateScore() {
  const percentage = Math.floor((hits / totalWords) * 100);
  const date = getDate();
  const newScore = {
    date: date,
    hits: hits.toString().padStart(2, '0'),
    percentage: percentage.toString().padStart(2, '0'),
  };

  let existingScores = loadScoresFromLocalStorage();

  existingScores = existingScores.filter(score => score.hits > 0);

  let insertIndex = existingScores.length;
  for (let i = 0; i < existingScores.length; i++) {
    if (hits > existingScores[i].hits) {
      insertIndex = i;
      break;
    }
  }
  existingScores.splice(insertIndex, 0, newScore); 

  if (existingScores.length > 10) {
    existingScores = existingScores.slice(0, 10);
  }
  saveScoresToLocalStorage(existingScores);
  populateScoreList(existingScores);
}

/*-------------------------------------------------------------------------->
	MISC
<--------------------------------------------------------------------------*/
function toGameArea () {
  startScrn.classList.toggle('hidden');
  startScrn.classList.toggle('visible');
  
  gameArea.classList.toggle('hidden');
  gameArea.classList.toggle('visible');
  if (muteButton.classList.contains('hidden')) {
    muteButton.classList.remove('hidden');
  }  
}

function returnHome() {
  startScrn.classList.toggle('hidden');
  startScrn.classList.toggle('visible');

  gameArea.classList.toggle('hidden');
  gameArea.classList.toggle('visible');
}

function muteMusic() {
  backgroundMusic.muted = !backgroundMusic.muted; 

  if (backgroundMusic.muted) {
    muteButton.classList.remove('unmuted');
    muteButton.classList.add('muted');
  } else {
    muteButton.classList.remove('muted');
    muteButton.classList.add('unmuted');
  }
}

function toggleClassWithTimeout() {
  if (boomImage.classList.contains('hidden')) {
    boomImage.classList.remove('hidden');
  }

  boomImage.classList.add('anim');

  setTimeout(() => {
    boomImage.classList.remove('anim');
    boomImage.classList.add('hidden');
  }, 2000);
}


/*-------------------------------------------------------------------------->
	EVENT LISTENERS
<--------------------------------------------------------------------------*/

listen('click', startButton, function () {
	startGame();  
  toGameArea();
	userInput.focus();
});

listen('click', beginGame, function () {
  startGame(); 
});

listen('click', viewScores, () => {
  scoresWrapper.showModal();
});

listen('input', userInput, handleInput);
listen('keydown', userInput, handleKeydown);

listen('click', viewScores, () => {
  const topScores = loadScoresFromLocalStorage();
  populateScoreList(topScores);
});

listen('click', scoresWrapper, function(ev) {
  const rect = this.getBoundingClientRect();
  if (ev.clientY < rect.top || ev.clientY > rect.bottom || 
    ev.clientX < rect.left || ev.clientX > rect.right) {
      scoresWrapper.close();
  }
});
  
listen('click', muteButton, () => {
  muteMusic();
});

listen('click', homeButton, () => {
  returnHome();
});

listen('click', boomButton, () => {
  endgameSound.currentTime = 0;
  endgameSound.play();
});