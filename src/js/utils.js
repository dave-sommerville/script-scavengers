'use strict';
/*-------------------------------------------------------------------------->
  UTILITY FUNCTIONS
<--------------------------------------------------------------------------*/
export function select(selector, scope = document) {
  return scope.querySelector(selector);
}

export function listen(event, element, callback) {
  return element.addEventListener(event, callback);
}

export function create(element) {
  const newElement = document.createElement(element); 
  return newElement;
}

export function addClass(element, customClass) {
  element.classList.add(customClass);
  return element;
}

export function removeClass(element, customClass) {
  element.classList.remove(customClass);
  return element;
}