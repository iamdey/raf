# RAF

An open-source software to learn music instruments by playing songs. For now,
the priority is to support guitar, but it is meant to support multiple
instruments as bass, piano, singing and even drum.

_RAF means a lot of things. Choose whatever you prefer._

RAF is in very early stage, don't expect anything, but main branch should always
be working.

## Concept

You may know Guitar pro, tux guitar, Rocksmith 2017, Yousician, Rocksmith+?.
Well those are cool and probably match your expectations better than RAF. I just
want to have something simple (well I try), play a song, display the tablature
progressively and choose the speed of the song.

## Technically

For now it's web-based using [alphaTab](https://www.alphatab.net) to load `.gp`
files and play song with midi instruments. To display tablatures, it could use
webgl and canvas or just html+css. This is a prove of concept, later it could be
anything, python, java, rust, wasm….

## Contributions

It's open see below if you want to contribute.

### TODO (Reste À Faire)

_add `<--- your name` if you want to contribute_

- [ ] Choose a Design system
- [ ] Choose a frontend technology (webcomponent|preact|…)
- [ ] UI mockups
- [x] basic player: start/stop controls
- [x] select speed
- [ ] design song data for the display
- [ ] tablature display **<--- dey**
- [ ] tabs database
- [ ] check legals for the tabs database (can it be redistributed freely)
- …

### Dev

Pre requisite:

- yarn https://yarnpkg.com/
- clone the repo

#### Clone the repo

```bash
git clone  TODO
```

#### Install deps

```bash
yarn
```

#### Download a gp file

[Download a gp3 file](https://duckduckgo.com/?q=gp3+tabs) (alphaTab also
[support different kind of files](https://www.alphatab.net/docs/introduction#the-file-importers))

Rename it `test.gp3` and move it into the `public` folder.

(you can you other format instead of gp3 but you need to change the name in the
`score.ts` file)

#### Copy soundfont (temporary)

Copy soundfont to the public directory:

```bash
cp node_modules/@coderline/alphatab/dist/soundfont/sonivox.sf2 public/
```

#### Start dev server

```bash
yarn dev
```

## Current state of the app

- Load a `.gp` file
- retrieve artist and song
