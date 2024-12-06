'use strict';
import { wordBank } from "./word-bank.js";
/*-------------------------------------------------------------------------->
		Utility Functions
<--------------------------------------------------------------------------*/
function create(element) {
  const newElement = document.createElement(element); 
  return newElement;
}

function select(selector, scope = document) {
  return scope.querySelector(selector);
}

function listen(event, element, callback) {
  return element.addEventListener(event, callback);
}

function addClass(element, customClass) {
  element.classList.add(customClass);
  return element;
}

function removeClass(element, customClass) {
  element.classList.remove(customClass);
  return element;
}

/*-------------------------------------------------------------------------->
	Element Selectors
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
const scoresList = select('ul');

/*-------------------------------------------------------------------------->
		Variable Declarations
<--------------------------------------------------------------------------*/

// One Line Shuffle Function
const shuffleWords = arr => arr.sort(() => Math.random() - 0.5);

let maxTime = 25;  
let gameOver = false;
let hits = 0;  
let totalWords;  
//	Um, for some reason I can't use const with this?? 
let shuffledWords = shuffleWords(wordBank);  
let startTime = new Date();  
let timerInterval; 
const scoresStorage = [];


/*-------------------------------------------------------------------------->
		Date Display Function 
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
		Timer Functions 
<--------------------------------------------------------------------------*/

function updateTimer() {
  const remainingTime = maxTime - Math.floor((new Date() - startTime) / 1000);
  const formattedTime = remainingTime < 10 ? `0${remainingTime}` : remainingTime;

  if (remainingTime <= 0) {
    timer.innerText = '00';
    timerIcon.classList.remove('zoomier');  
    timerIcon.classList.remove('zoom');  
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
  timer.innerText = '99'; 
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

function getTimerTime() {
  return maxTime - Math.floor((new Date() - startTime) / 1000);
}

/*-------------------------------------------------------------------------->
		Display Word
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
		Start Game - Landing Screen
<--------------------------------------------------------------------------*/

function startGame() {
  userInput.disabled = false;
  shuffledWords = shuffleWords(wordBank);  
  totalWords = shuffledWords.length; 
  hits = 0;  
  gameOver = false; 
  startTimer();  
  renderNextWord(shuffledWords); 
  listenForTyping(); 
  backgroundMusic.currentTime = 0;  
  backgroundMusic.play();          
  userInput.focus();
}


/*-------------------------------------------------------------------------->
		Event Observers 
<--------------------------------------------------------------------------*/

listen('click', startButton, function () {
		startScrn.classList.toggle('hidden');
		startScrn.classList.toggle('visible');
		
		gameArea.classList.toggle('hidden');
		gameArea.classList.toggle('visible');
	startGame();  
	userInput.focus();
});

listen('click', beginGame, function () {
  startGame(); 
});

listen('click', viewScores, () => {
  scoresWrapper.showModal();
});

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

// May need to change this a little still, but I kind of like it
function listenForTyping() {
  listen('input', userInput, handleInput);
  listen('keydown', userInput, handleKeydown);
}

function displayHits() {
  scoreboard.innerText = hits;
}

setInterval(function(){
  displayHits;
}, 1000);


function createScoreListItem(score) {
  const li = create('li');
  addClass(li, 'score-item'); 

  const details = `
      <span class="score-date">${score.date}</span> | 
      <span class="score-hits">Hits: ${score.hits}</span> | 
      <span class="score-percentage">Accuracy: ${score.percentage}%</span>
  `;

  li.innerHTML = details;

  return li; 
}

function calculateScore() {
  const elapsedTime = getTimerTime();
  const percentage = Math.floor((hits / totalWords) * 100);
  const date = getDate();
  const newScore = {
    date: date, 
    hits: hits, 
    percentage: percentage
  };

  let insertIndex = scoresStorage.length; 

  for (let i = 0; i < scoresStorage.length; i++) {
      if (hits > scoresStorage[i].hits) {
          insertIndex = i;
          break; 
      }
  }

  scoresStorage.splice(insertIndex, 0, newScore); 
  saveScoresToLocalStorage();
  console.log(newScore);
  console.log(scoresStorage); 
  console.log(localStorage); 
}

function populateScoreList(scores) {
  scoresList.innerHTML = '';

  scores.forEach(score => {
      const li = createScoreListItem(score); 
      scoresList.appendChild(li);            
  });
}


function saveScoresToLocalStorage() {
  const scoresJSON = JSON.stringify(scoresStorage);
  localStorage.setItem('scores', scoresJSON);
}

//  saveScoresToLocalStorage();

//  I Think this needs to be changed to increase validation (not in love with the if statement)
function loadScoresFromLocalStorage() {
  const scoresJSON = localStorage.getItem('scores');
  if (scoresJSON) {
      scoresStorage.length = 0; // Clear the current array
      scoresStorage.push(...JSON.parse(scoresJSON)); // Repopulate with parsed data
  }
}

//  loadScoresFromLocalStorage();
