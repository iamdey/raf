/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://www.wtfpl.net/ for more details. */

import { synth, midi } from '@coderline/alphatab';
import { RafDisplay } from './renderer';

export const setupPlayer = (
  midiFile: midi.MidiFile,
  soundFont: Uint8Array,
  display: RafDisplay,
  {
    startEl,
    stopEl,
    speedEl,
  }: {
    startEl: HTMLElement;
    stopEl: HTMLElement;
    speedEl: HTMLInputElement;
  }
) => {
  const player = new synth.AlphaSynth(
    new synth.AlphaSynthScriptProcessorOutput(),
    10000
  );
  player.loadSoundFont(soundFont, false);
  player.loadMidiFile(midiFile);

  startEl.addEventListener('click', () => {
    player.play();
    display.play(player);
  });
  stopEl.addEventListener('click', () => {
    player.pause();
    display.pause();
  });

  speedEl.addEventListener('change', (ev) => {
    // @ts-ignore
    if (!ev.currentTarget?.value) {
      return;
    }

    // @ts-ignore
    player.playbackSpeed = Number(ev.currentTarget?.value) / 100;
  });

  speedEl;
};
