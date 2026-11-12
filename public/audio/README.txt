THE AMBIENT TRACK

float.mp3 is the web copy of "Float" by Out of Flux & Danny Shields: the music that plays
behind the site. It is made from the original MP3 in the project folder by:

    npm run assets

To use another track
1. Put ONE music file in this folder (MP3 is safest; keep it under about 5 MB).
2. Open  src/content/site.js  and find  audio → music.
   Change  file,  title  and  artist.
3. Publish the site.

What the site does by itself
- It tries to start the track when the site opens. Most browsers only allow sound after the
  visitor has clicked, tapped or pressed a key, so that is usually when it starts.
- It loops, fades in and out, keeps playing while the visitor moves between pages, and rests
  while the browser tab is in the background.
- The visitor can pause it, set its volume, or mute everything from the speaker button.

Only use music you made, bought a licence for, or that is free to use on a public website.
