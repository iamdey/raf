/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://www.wtfpl.net/ for more details. */

import './style.css';
import { loadScoreFromFile, loadScoreFromPath, setup } from './setup';
import { model, Settings } from '@coderline/alphatab';

const gpFile = '/test.gp3';

const selectElems = () => {
  const scoreEl: null | HTMLElement = document.querySelector('#score');
  const stopEl: null | HTMLElement = document.querySelector('#stop');
  const startEl: null | HTMLElement = document.querySelector('#start');
  const speedEl: null | HTMLInputElement = document.querySelector('#speed');
  const tempoEl: null | HTMLElement = document.querySelector('#tempo');
  const contentEl: null | HTMLElement = document.querySelector('#content');
  const trackEl: null | HTMLSelectElement = document.querySelector('#track');

  if (
    !scoreEl ||
    !stopEl ||
    !startEl ||
    !speedEl ||
    !tempoEl ||
    !contentEl ||
    !trackEl
  ) {
    return;
  }

  return {
    scoreEl,
    stopEl,
    startEl,
    speedEl,
    tempoEl,
    contentEl,
    trackEl,
  };
};

const template = `
<p id="score">Loading …</p>
<div id="content"></div>
<div><button id="stop">Stop</button> <button id="start">Start</button> <label for="speed">Speed</speed> <input
      id="speed" type="number" value="100" max="120" min="10" /> %</div>
<div>Tempo: <span id="tempo" /> ♩</div>
<div>Track: <select id="track">
    <option value="0" disabled="">Loading …</option>
  </select></div>
<div><label for="load">Open score (.gp,.gp2-5,.gpx,.xml,.cap):</label> <input id="load" type="file"
    accept=".gp,.gp3,.gp4,.gp5,.gpx,.xml,.cap" /></div>
`;

const cleanup = () => {
  const elems = selectElems();
  // make sure song is stoped
  elems?.stopEl.dispatchEvent(new Event('click'));
};

const load = async (file?: File) => {
  const app: null | HTMLElement = document.querySelector('#app');
  if (!app) {
    return;
  }

  app.innerHTML = template;

  const loadEl: null | HTMLInputElement = document.querySelector('#load');

  loadEl?.addEventListener('change', () => {
    cleanup();
    const file = loadEl.files?.[0];
    if (!file) {
      return;
    }

    load(file);
  });

  const elems = selectElems();
  if (!elems) {
    return;
  }

  let score: model.Score | undefined;
  const settings = new Settings();

  if (!file) {
    score = await loadScoreFromPath(gpFile, settings);
  } else {
    score = await loadScoreFromFile(file, settings);
  }

  if (!score) {
    return;
  }

  setup({
    score,
    settings,
    ...elems,
  });
};

load();
