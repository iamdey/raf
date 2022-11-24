/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://www.wtfpl.net/ for more details. */

import { model } from '@coderline/alphatab';
import {
  Application,
  Container,
  Graphics,
  ICanvas,
  Text,
  TextStyle,
} from 'pixi.js';

const SCREEN_HEIGHT = 300;
const SCREEN_WIDTH = 600;
const GUITAR_HEIGHT = 200;
const MARGIN_Y = (SCREEN_HEIGHT - GUITAR_HEIGHT) / 2;
const STRING_HEIGHT = 3;
const NOTE_HEIGHT = 13;
const NOTE_RADIUS = 4;
const NOTE_SIXTEENTH_WIDTH = NOTE_HEIGHT;
const NOTE_WHOLE_WIDTH = NOTE_SIXTEENTH_WIDTH * 16;
const NOTE_SIXTEENTH_DISTANCE = NOTE_SIXTEENTH_WIDTH + 4;

const posYGstrings = {
  6: MARGIN_Y + GUITAR_HEIGHT / 6,
  5: MARGIN_Y + (GUITAR_HEIGHT / 6) * 2,
  4: MARGIN_Y + (GUITAR_HEIGHT / 6) * 3,
  3: MARGIN_Y + (GUITAR_HEIGHT / 6) * 4,
  2: MARGIN_Y + (GUITAR_HEIGHT / 6) * 5,
  1: MARGIN_Y + GUITAR_HEIGHT,
};

type IGString = keyof typeof posYGstrings;

const computeNextX = (currentX: number, note: void | Note) =>
  currentX + NOTE_SIXTEENTH_DISTANCE * 1;

class Note {
  constructor(note: model.Note, x: number) {
    this._note = note;
    this.background = new Graphics();
    this.background.beginFill(0x33c7de);
    this.background.drawRoundedRect(
      0,
      0,
      NOTE_SIXTEENTH_WIDTH,
      NOTE_HEIGHT,
      NOTE_RADIUS
    );
    this.background.endFill();
    // tmp
    this.background.x = x;

    const style = new TextStyle({
      fontSize: 10,
    });
    this.fret = new Text(note.fret.toString(), style);
    this.fret.x = x + 3;

    this._setY(note.string as IGString);
  }

  background: Graphics;
  fret: Text;
  _note: model.Note;

  _setY(gString: IGString) {
    this.background.y = posYGstrings[gString] - NOTE_HEIGHT / 2;
    this.fret.y = posYGstrings[gString] - NOTE_HEIGHT / 2;
  }

  render(container: Container) {
    container.addChild(this.background);
    container.addChild(this.fret);
  }
}

export class RafDisplay {
  constructor(app: Application) {
    this.__app = app;
  }

  __app;
  uiTrack: undefined | Container;
  load(score: model.Score, trackIdx: number) {
    const track = score.tracks[trackIdx];
    console.log({
      score,
      notes: track.staves[0].bars[0].voices[0].beats[0].notes,
    });

    if (this.uiTrack) {
      this.__app.stage.removeChild(this.uiTrack);
    }

    this.uiTrack = new Container();
    this.uiTrack.x = SCREEN_WIDTH;
    this.__app.stage.addChild(this.uiTrack);

    let x = 0;
    track.staves.forEach((stave) => {
      stave.bars.forEach((bar) => {
        // only one voice on guitar is supported for now
        bar.voices[0].beats.forEach((beat) => {
          let rafNote;
          beat.notes.forEach((note) => {
            if (!this.uiTrack) {
              return;
            }
            rafNote = new Note(note, x);
            rafNote.render(this.uiTrack);
          });
          x = computeNextX(x, rafNote);
        });
        x += 25;
      });
    });
  }
  play() {
    this.__app.ticker.add((delta) => {
      if (!this.uiTrack) {
        return;
      }
      this.uiTrack.x -= 1 * delta;
    });
  }
  pause() {
    this.__app.ticker.stop();
  }
}

export const setupRenderer = ({ contentEl }: { contentEl: HTMLElement }) => {
  const app = new Application({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#002B36',
  });

  const gStringTemplate = new Graphics();
  gStringTemplate.beginFill(0x8a919b);
  gStringTemplate.drawRect(0, 0, SCREEN_WIDTH, STRING_HEIGHT);
  gStringTemplate.endFill();

  const gStrings = [];
  Object.entries(posYGstrings).forEach(([, posY]) => {
    let gString = new Graphics(gStringTemplate.geometry);
    gString.y = posY - STRING_HEIGHT / 2;

    gStrings.push(gString);
    app.stage.addChild(gString);
  });

  const center = new Graphics();
  center.beginFill(0xff0000);
  center.drawRect(300, 0, 1, 300);
  center.endFill();

  app.stage.addChild(center);

  // @ts-ignore
  contentEl.appendChild(app.view);

  return new RafDisplay(app);
};
