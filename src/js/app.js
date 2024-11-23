'use strict';
/*-------------------------------------------------------------------------->
		Word bank
<--------------------------------------------------------------------------*/
const wordBank = [
	'dinosaur', 'love', 'pineapple', 'calendar', 'robot', 'building',
	'population', 'weather', 'bottle', 'history', 'dream', 'character', 'money',
	'absolute', 'discipline', 'machine', 'accurate', 'connection', 'rainbow',
	'bicycle', 'eclipse', 'calculator', 'trouble', 'watermelon', 'developer',
	'philosophy', 'database', 'periodic', 'capitalism', 'abominable', 'phone',
	'component', 'future', 'pasta', 'microwave', 'jungle', 'wallet', 'canada',
	'velvet', 'potion', 'treasure', 'beacon', 'labyrinth', 'whisper', 'breeze',
	'coffee', 'beauty', 'agency', 'chocolate', 'eleven', 'technology',
	'alphabet', 'knowledge', 'magician', 'professor', 'triangle', 'earthquake',
	'baseball', 'beyond', 'evolution', 'banana', 'perfume', 'computer',
	'butterfly', 'discovery', 'ambition', 'music', 'eagle', 'crown',
	'chess', 'laptop', 'bedroom', 'delivery', 'enemy', 'button', 'door', 'bird',
	'superman', 'library', 'unboxing', 'bookstore', 'language', 'homework',
	'beach', 'economy', 'interview', 'awesome', 'challenge', 'science',
	'mystery', 'famous', 'league', 'memory', 'leather', 'planet', 'software',
	'update', 'yellow', 'keyboard', 'window', 'beans', 'truck', 'sheep',
	'blossom', 'secret', 'wonder', 'enchantment', 'destiny', 'quest', 'sanctuary',
	'download', 'blue', 'actor', 'desk', 'watch', 'giraffe', 'brazil',
	'audio', 'school', 'detective', 'hero', 'progress', 'winter', 'passion',
	'rebel', 'amber', 'jacket', 'article', 'paradox', 'social', 'resort',
	'mask', 'escape', 'promise', 'band', 'level', 'hope', 'moonlight', 'media',
	'orchestra', 'volcano', 'guitar', 'raindrop', 'inspiration', 'diamond',
	'illusion', 'firefly', 'ocean', 'cascade', 'journey', 'laughter', 'horizon',
	'exploration', 'serendipity', 'infinity', 'silhouette', 'wanderlust',
	'marvel', 'nostalgia', 'serenity', 'reflection', 'twilight', 'harmony',
	'symphony', 'solitude', 'essence', 'melancholy', 'melody', 'vision',
	'silence', 'whimsical', 'eternity', 'cathedral', 'embrace', 'poet', 'ricochet',
	'mountain', 'dance', 'sunrise', 'dragon', 'adventure', 'galaxy', 'echo',
	'fantasy', 'radiant', 'serene', 'legend', 'starlight', 'light', 'pressure',
	'bread', 'cake', 'caramel', 'juice', 'mouse', 'charger', 'pillow', 'candle',
	'film', 'jupiter'
];

/*-------------------------------------------------------------------------->
		Class Declartation
<--------------------------------------------------------------------------*/
class Score {
	#date;
	#hits;
	#percentage;

	constructor(date, hits, percentage){
		this.date = date;
		this.hits = hits;
		this.percentage = percentage;
	}

	set date(date){
		this.#date = date;
	}
	set hits(hits) {
		this.#hits = hits;
	}
	set percentage(percentage) {
		this.#percentage = percentage;
	}

	get date() {
		return this.#date;
	}
	get hits() {
		return this.#hits;
	}
	get percentage() {
		return this.#percentage;
	}
}

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
		Selectors
<--------------------------------------------------------------------------*/
const startButton = select('.start-btn');
const startScrn = select('.start-scrn');
const gameArea = select('.game-area');
const beginGame = select('.restart-reset');
const wordDisplay = select('.word-display');
const userInput = select('.word-entry');
const timer = select('.timer');
const scoreboard = select('.scoreboard');
const backgroundMusic = select('.background-music');
const pointSoundEffect = select('.sound-effect');
const endgameSound = select('.endgame-sound');
const timerIcon = select('.fa-hourglass-half');

/*-------------------------------------------------------------------------->
		Variable Declarations
<--------------------------------------------------------------------------*/

let maxTime = 99;  
let gameOver = false;
let hits = 0;  
let totalWords;  
//	Um, for some reason I can't use const with this?? 
let shuffledWords = shuffleWords(wordBank);  
let startTime = new Date();  
let timerInterval; 
const scoresStorage = [];

/*-------------------------------------------------------------------------->
		Shuffle Function 
<--------------------------------------------------------------------------*/

function shuffleWords(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/*-------------------------------------------------------------------------->
		Timer Functions 
<--------------------------------------------------------------------------*/

function updateTimer() {
  const remainingTime = maxTime - Math.floor((new Date() - startTime) / 1000);
  const formattedTime = remainingTime < 10 ? `0${remainingTime}` : remainingTime;

  // Show "00" when time is up
  if (remainingTime <= 0) {
    timer.innerText = '00';
    timerIcon.classList.remove('wobble');  
  } else {
    timer.innerText = formattedTime;
    if (remainingTime <= 10 && !timerIcon.classList.contains('wobble')) {
      timerIcon.classList.add('wobble'); 
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

function listenForTyping() {
  listen('input', userInput, function () {
    if (gameOver) return;

    const currentWord = wordDisplay.innerText.toLowerCase();  // Convert the displayed word to lowercase
    const userTyped = userInput.value.trimStart().toLowerCase();  // Remove leading spaces and convert to lowercase

    const wordSpans = wordDisplay.querySelectorAll('span');

    wordSpans.forEach((span, index) => {
      if (userTyped[index] === span.innerText.toLowerCase()) { // Compare each character in lowercase
        addClass(span, 'correct'); 
      } else {
        removeClass(span, 'correct'); 
      }
    });

    if (userTyped === currentWord) {
      hits++;
      pointSoundEffect.play();
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
  });

  listen('keydown', userInput, function (e) {
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
  });
}

function displayHits() {
  scoreboard.innerText = hits;
}

setInterval(function(){
  displayHits;
}, 1000);

function calculateScore() {
  const elapsedTime = getTimerTime();  
  const percentage = Math.floor((hits / totalWords) * 100);  
  const score = new Score(new Date(), hits, percentage);  
  scoresStorage.push(score);  
  console.log(score);  // Will Remove eventually 
}

