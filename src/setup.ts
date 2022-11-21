/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://www.wtfpl.net/ for more details. */

import { Settings, importer, model, midi } from '@coderline/alphatab';
import { setupPlayer } from './player';
import { setupRenderer } from './renderer';

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
  speedEl,
  tempoEl,
  contentEl,
}: {
  scoreEl: null | HTMLElement;
  stopEl: null | HTMLElement;
  startEl: null | HTMLElement;
  speedEl: null | HTMLInputElement;
  tempoEl: null | HTMLElement;
  contentEl: null | HTMLElement;
}) => {
  if (!scoreEl || !stopEl || !startEl || !speedEl || !tempoEl || !contentEl) {
    return;
  }
  try {
    const score = await new Promise<model.Score>((resolve, reject) => {
      importer.ScoreLoader.loadScoreAsync(gpFile, resolve, reject);
    });

    scoreEl.innerHTML = `${score.artist} - ${score.title}`;
    tempoEl.innerHTML = score.tempo.toString();

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
    setupPlayer(midiFile, soundFont, { startEl, stopEl, speedEl });
    setupRenderer({ contentEl });
  } catch (e) {}
};

export { setup };
