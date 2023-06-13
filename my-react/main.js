import './style.css'
import { createElement, render, useState } from './micro-react';
// diff-》demo
// const handleInput = (v) => {
//   renderer(v.target.value);
// }
// const dom = document.querySelector('#root');
// const renderer = (value) => {
//   const elem = createElement(
//     'div',
//     {style: "width: 100%; margin: 20px; color: #ff0203"},
//     createElement('input', {oninput: (e) => handleInput(e)}, null),
//     createElement('h1', null, value)
//   );
//   render(elem, dom);
// }
// renderer('hello');
// 函数式组件
// const App = (props) => {
//   return createElement('h1', null, 'May i kiss you?', props.name);
// }
// const elem = createElement(App, {name: 'mm'});
// const dom = document.querySelector('#root');

// render(elem, dom);

const dom = document.querySelector('#root');
const Counter = () => {
  const [state, setState] = useState(0);
  return createElement(
    'h1',
    {onclick: () => setState(prev => prev + 1)},
    state
  )
}
const elem = createElement(Counter);
render(elem, dom);