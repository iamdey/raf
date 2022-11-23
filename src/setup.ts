/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://www.wtfpl.net/ for more details. */

import { Settings, importer, model, midi } from '@coderline/alphatab';
import { setupPlayer } from './player';
import { RafDisplay, setupRenderer } from './renderer';

const gpFile = '/test.gp3';

const getMidi = (score: model.Score, settings: Settings) => {
  const midiFile = new midi.MidiFile();

  const handler = new midi.AlphaSynthMidiFileHandler(midiFile);
  const generator = new midi.MidiFileGenerator(score, settings, handler);

  // start generation
  generator.generate();

  return midiFile;
};

const setUpTrack = (
  score: model.Score,
  display: RafDisplay,
  { trackEl }: { trackEl: HTMLSelectElement }
) => {
  const trackOptions = score.tracks.map((track, idx) => ({
    label: `${track.name} (${track.playbackInfo.program})`,
    value: idx,
  }));

  const html = trackOptions
    .map(({ label, value }) => `<option value="${value}">${label}</option>`)
    .join('');

  trackEl.innerHTML = `<option selected="" disabled="">Select</option>${html}`;

  trackEl.addEventListener('change', (ev) => {
    // @ts-ignore
    const trackIdx = ev.currentTarget?.value;
    if (!trackIdx) {
      return;
    }
    display.load(score, trackIdx);
  });
};

const setup = async ({
  scoreEl,
  startEl,
  stopEl,
  speedEl,
  tempoEl,
  contentEl,
  trackEl,
}: {
  scoreEl: null | HTMLElement;
  stopEl: null | HTMLElement;
  startEl: null | HTMLElement;
  speedEl: null | HTMLInputElement;
  tempoEl: null | HTMLElement;
  contentEl: null | HTMLElement;
  trackEl: null | HTMLSelectElement;
}) => {
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
  try {
    const settings = new Settings();
    const score = await new Promise<model.Score>((resolve, reject) => {
      importer.ScoreLoader.loadScoreAsync(gpFile, resolve, reject, settings);
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

    const midiFile = getMidi(score, settings);

    const display = setupRenderer({ contentEl });
    setUpTrack(score, display, { trackEl });
    setupPlayer(midiFile, soundFont, display, { startEl, stopEl, speedEl });
  } catch (e) {}
};

export { setup };
