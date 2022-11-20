/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://www.wtfpl.net/ for more details. */

import { Settings, importer, model, midi } from '@coderline/alphatab';
import { setupPlayer } from './player';

const gpFile = '/test.gp3';

const getMidi = (score: model.Score) => {
  const settings = new Settings();
  const midiFile = new midi.MidiFile();

  const handler = new midi.AlphaSynthMidiFileHandler(midiFile);
  const generator = new midi.MidiFileGenerator(score, settings, handler);

  // start generation
  generator.generate();

  return midiFile;
};

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

    const soundFont = await new Promise<Uint8Array>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/sonivox.sf2', true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = () => {
        const data = new Uint8Array(xhr.response);
        resolve(data);
      };
      xhr.send();
    });

    const midiFile = getMidi(score);
    setupPlayer(midiFile, soundFont, { startEl, stopEl });
  } catch (e) {}
};

export { setup };
