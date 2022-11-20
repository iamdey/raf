/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://www.wtfpl.net/ for more details. */

import { Settings, importer, model } from '@coderline/alphatab';
import { player } from './player';

const gpFile = '/test.gp3';

const setup = async ({
  scoreEl,
  startEl,
  stopEl,
}: {
  scoreEl: null | HTMLElement;
  stopEl: null | HTMLElement;
  startEl: null | HTMLElement;
}) => {
  if (!scoreEl || !stopEl || !startEl) {
    return;
  }
  try {
    const score = await new Promise<model.Score>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', gpFile, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = () => {
        const data = new Uint8Array(xhr.response);
        const settings = new Settings();
        const loaded = importer.ScoreLoader.loadScoreFromBytes(data, settings);
        resolve(loaded);
      };
      xhr.send();
    });
    scoreEl.innerHTML = `${score.artist} - ${score.title}`;

    // player(score, { startEl, stopEl });
  } catch (e) {}
};

export { setup };
