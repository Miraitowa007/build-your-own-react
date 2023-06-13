import './style.css'
import { createElement, render } from './micro-react';
const handleInput = (v) => {
  console.log('----', v);
  renderer(v.target.value);
}
const dom = document.querySelector('#root');
const renderer = (value) => {
  const elem = createElement(
    'input',
    null,
    createElement('input', {oninput: (e) => handleInput(e)}, null),
    createElement('h3', null, value)
  );
  render(elem, dom);
}
renderer('hello');
