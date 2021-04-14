# The Triadex Muse algorithm for Logic Pro X Scripter plug-in.

Based on the implementation by J. Donald Tillman. Made with author's kind permission.
You'll find the Muse emulation, extensive explanation and links to the manuals at Donald's website: http://www.till.com/articles/muse

The actual Muse was invented in 1969 by Marvin Minsky and Edward Fredkin at MIT.

### Usage
1. Load Scripter MIDI Plug-In
2. Open Script Editor
3. Copy and paste the code from MuseForLogicProXScripter.js
4. Click RunScript button

Multiple instances of the Scripter can be loaded to the same track allowing polyphony.

If you're using multi-timbral instrument, you can route different instances of the script to different
channels with Cannel setting. Make sure to have track channel set to All.

Because this version is tempo synced and driven by DAW playback, controls such as start/hold/tempo are not implemented.
