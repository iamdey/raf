/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://www.wtfpl.net/ for more details. */

import { model, synth } from '@coderline/alphatab';
import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';

const SCREEN_HEIGHT = 300;
const SCREEN_WIDTH = 600;
const GUITAR_HEIGHT = 160;
const MARGIN_Y = (SCREEN_HEIGHT - GUITAR_HEIGHT) / 2;
const STRING_HEIGHT = 3;
const NOTE_HEIGHT = 14;
const NOTE_RADIUS = 6;
const NOTE_SIXTEENTH_WIDTH = NOTE_HEIGHT;
const NOTE_SIXTEENTH_DISTANCE = NOTE_SIXTEENTH_WIDTH;
const NOTE_WHOLE_WIDTH = NOTE_SIXTEENTH_DISTANCE * 16;
const NOTE_WHOLE_DISTANCE = NOTE_SIXTEENTH_DISTANCE * 16;
// 4-4 bar
const BAR_WIDTH = NOTE_WHOLE_DISTANCE;

const X_START = SCREEN_WIDTH - 300;

const posYGstrings = {
  6: MARGIN_Y,
  5: MARGIN_Y + GUITAR_HEIGHT / 5,
  4: MARGIN_Y + (GUITAR_HEIGHT / 5) * 2,
  3: MARGIN_Y + (GUITAR_HEIGHT / 5) * 3,
  2: MARGIN_Y + (GUITAR_HEIGHT / 5) * 4,
  1: MARGIN_Y + (GUITAR_HEIGHT / 5) * 5,
};
const FPS = 60;

type IGString = keyof typeof posYGstrings;

const computeBeatWidth = (beat: model.Beat) => {
  if (beat.duration < 0) {
    return -beat.duration * NOTE_WHOLE_WIDTH;
  } else {
    return NOTE_WHOLE_WIDTH / beat.duration;
  }
};

const bpm = 82;

// nb pulse per quarter note (or division per quarter note)
// cf. hardcoded in alphaTab
const PPQ = 960;

/**
 * From alphaTab midi/MidiUtils
 * Converts the given midi tick duration into milliseconds.
 *
 * https://stackoverflow.com/questions/2038313/converting-midi-ticks-to-actual-playback-seconds
 * 60000 / (BPM * PPQ)
 *
 * @param ticks The duration in midi ticks
 * @param tempo The current tempo in BPM.
 * @returns The converted duration in milliseconds.
 */
function ticksToMillis(ticks: number, tempo: number): number {
  return (ticks * (60000.0 / (tempo * PPQ))) | 0;
}

/**
 * e.g.
 * bar_duration:
 *  - 3840 ticks
 *  - 2926 ms
 * velocity: 1.276px / frame
 *
 * f0
 * f60 - 1sec : velocity * 60 = 76.56px;
 * f175 - 2.926sec : velocity * 175 = 223,3px
 */
const computeVelocity = (bar: model.MasterBar, speed: number) => {
  const barInTicks = bar.calculateDuration();
  const barDurationInS = ticksToMillis(barInTicks, bpm) / 1000;
  const velocity = BAR_WIDTH / barDurationInS / FPS;

  return velocity * speed;
};

/**
 * retrieve correct x pos according to time
 */
const computeNextTrackX = (velocity: number, time: number) => {
  return SCREEN_WIDTH / 2 - (velocity * FPS * time) / 1000;
};

class UINote {
  constructor(note: model.Note, x: number) {
    this._note = note;
    this.initWidth();
    this.background = new Graphics();
    this.background.beginFill(0x33c7de);
    this.background.drawRoundedRect(0, 0, this.w, NOTE_HEIGHT, NOTE_RADIUS);
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

  initWidth() {
    this.w = computeBeatWidth(this._note.beat);
  }

  background: Graphics;
  fret: Text;
  _note: model.Note;
  w: number = 0;

  _setY(gString: IGString) {
    this.background.y = posYGstrings[gString] - NOTE_HEIGHT / 2;
    this.fret.y = posYGstrings[gString] - NOTE_HEIGHT / 2;
  }

  render(container: Container) {
    container.addChild(this.background);
    container.addChild(this.fret);
  }
}

class Separator {
  constructor(x: number) {
    this.bar = new Graphics();
    this.bar.beginFill(0x777777);
    this.bar.drawRect(0, 0, 1, GUITAR_HEIGHT);
    this.bar.endFill();
    this.bar.x = x;
    this.bar.y = MARGIN_Y;
  }
  bar: Graphics;

  render(container: Container) {
    container.addChild(this.bar);
  }
}

class UIBar {
  constructor(bar: model.Bar) {
    this.masterBar = bar.masterBar;
    this.bar = bar;
  }
  bar: model.Bar;
  masterBar: model.MasterBar;

  render(uiTrack: Container, currentX: number) {
    const container = new Container();
    container.x = currentX;
    uiTrack.addChild(container);
    let relativeX = 0;

    // only one voice on guitar is supported for now
    this.bar.voices[0].beats.forEach((beat) => {
      beat.notes.forEach((note) => {
        const rafNote = new UINote(note, relativeX);
        rafNote.render(container);
      });

      relativeX = relativeX + computeBeatWidth(beat);
    });
    const rafSeparator = new Separator(currentX + BAR_WIDTH - 2);
    rafSeparator.render(uiTrack);
  }
}

export class RafDisplay {
  constructor(app: Application) {
    this.__app = app;
    this.uiFps = new Text('60', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xcccccc,
      align: 'right',
    });
    const fpsLabel = new Text('fps', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xcccccc,
      align: 'right',
    });
    fpsLabel.x = 30;
    const fpsContainer = new Container();
    fpsContainer.x = SCREEN_WIDTH - 70;
    fpsContainer.y = SCREEN_HEIGHT - 30;
    fpsContainer.addChild(this.uiFps);
    fpsContainer.addChild(fpsLabel);
    this.__app.stage.addChild(fpsContainer);

    this.uiTime = new Text('0', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xcccccc,
      align: 'left',
    });
    const timeContainer = new Container();
    timeContainer.x = 30;
    timeContainer.y = SCREEN_HEIGHT - 30;
    timeContainer.addChild(this.uiTime);
    this.__app.stage.addChild(timeContainer);
  }

  __app;
  uiTrack: undefined | Container;
  uiFps: Text;
  uiTime: Text;
  state: undefined | 'started' | 'pause';
  score: undefined | model.Score;

  getMasterBar(index: number) {
    return this.score?.masterBars[index];
  }

  load(score: model.Score, trackIdx: number) {
    this.score = score;
    const track = score.tracks[trackIdx];

    if (this.uiTrack) {
      this.__app.stage.removeChild(this.uiTrack);
    }

    this.uiTrack = new Container();
    this.uiTrack.x = X_START;
    this.__app.stage.addChild(this.uiTrack);

    let x = 0;
    track.staves.forEach((stave) => {
      stave.bars.forEach((bar) => {
        let { repeatCount = 1 } = bar.masterBar || {};
        if (repeatCount < 1) {
          // force bar to be rendered at least one time, regular bar has repeatCount = 0
          repeatCount = 1;
        }

        for (let i = 0; i < repeatCount; i++) {
          if (!this.uiTrack) {
            return;
          }
          const uiBar = new UIBar(bar);
          uiBar.render(this.uiTrack, x);
          x += BAR_WIDTH;
        }
      });
    });
  }

  play(player: synth.AlphaSynth) {
    const masterBar = this.score?.masterBars[0];

    if (!masterBar) {
      return;
    }

    const velocity = computeVelocity(masterBar, player.playbackSpeed);

    // TODO: move to constructor
    if (this.state === undefined) {
      let lastUpdate = 0;
      this.__app.ticker.add((delta) => {
        if (!this.uiTrack) {
          return;
        }

        if (this.__app.ticker.lastTime - lastUpdate > 1000) {
          lastUpdate = this.__app.ticker.lastTime;

          // sync pos
          const nextPosX = computeNextTrackX(velocity, player.timePosition);
          this.uiTrack.x = Math.round(nextPosX);

          this.uiFps.text = Math.floor(this.__app.ticker.FPS);
          this.uiTime.text =
            Math.floor(Math.round(player.timePosition / 10) / 60) / 100;
          return;
        }
        // since pos update is not exact (no float pixels), position needs to resync, see above
        this.uiTrack.x -= Math.round(velocity * delta);
      });
    }

    if (this.state != 'started') {
      this.state = 'started';
      this.__app.ticker.start();
      return;
    }
  }

  pause() {
    this.state = 'pause';
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
  // move center line a bit before for better eye sensation
  center.drawRect(SCREEN_WIDTH / 2 - 15, 0, 1, SCREEN_HEIGHT);
  center.endFill();

  app.stage.addChild(center);

  // cleanup previous preview
  contentEl.innerHTML = '';
  // @ts-ignore
  contentEl.appendChild(app.view);

  return new RafDisplay(app);
};
