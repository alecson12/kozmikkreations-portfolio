BACKGROUND MUSIC FOR THE SITE

1. Put ONE music file in this folder (MP3 is safest; keep it under about 5 MB).
   Suggested name:  kozmik-ambient.mp3
2. Open  src/content/site.js  and find  audio → music.
   Write the file name there, for example:   file: 'kozmik-ambient.mp3'
   You can also give it a title to show while it plays.
3. Publish the site. The "Music" control in the sound panel now plays it.

Rules the site follows by itself:
- Music never starts on its own. The visitor has to press play.
- It fades in and out, loops, and rests while the browser tab is in the background.
- It is quiet by default (see  level  in the same place in site.js).

Only use music you made, bought a licence for, or that is free to use on a public website.
