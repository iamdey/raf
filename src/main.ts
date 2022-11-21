/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://www.wtfpl.net/ for more details. */

import './style.css';
import { setup } from './setup';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<h1>RAF</h1>
<p id="score">Loading …</p>
<div id="content"></div>
<div><button id="stop">Stop</button> <button id="start">Start</button> <label for="speed">Speed</speed> <input id="speed" type="number" value="100" max="120" min="10" /> %</div>
<div>Tempo: <span id="tempo" /> ♩</div>
`;

setup({
  scoreEl: document.querySelector('#score'),
  stopEl: document.querySelector('#stop'),
  startEl: document.querySelector('#start'),
  speedEl: document.querySelector('#speed'),
  tempoEl: document.querySelector('#tempo'),
  contentEl: document.querySelector('#content'),
});
