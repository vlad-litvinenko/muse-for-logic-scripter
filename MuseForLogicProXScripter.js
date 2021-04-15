//Triadex Muse Algorithm ########################################################
//
//Originally implemented by J. Donald Tillman: http://www.till.com/articles/muse
//
//Adapted for Logic Pro Scripter and extended by Vlad Lytvynenko: vla2020@icloud.com
//
//The actual Muse was invented in 1969 by Marvin Minsky and Edward Fredkin at MIT.
//
var count32 = 1;
var count6 = 0;
var shiftregister = 0;
var theme = [0, 0, 0, 0];
var interval = [0, 0, 0, 0];
var rest = 1; // 0: rest, 1: normal
var velocity = 100;
var basePitch = 60;

var modes = [
	[0, 2, 4, 5, 7, 9, 11, 12], //Ionian
	[0, 2, 4, 6, 7, 9, 11, 10], //Lydian
	[0, 2, 3, 5, 7, 9, 10, 12], //Dorian
	[0, 1, 3, 5, 7, 8, 10, 12], //Phrygian
	[0, 2, 4, 5, 7, 9, 10, 12], //Mixolydian
	[0, 2, 3, 5, 7, 8, 10, 12], //Aeolian
	[0, 1, 3, 5, 6, 8, 10, 12], //Locrian
];
		
var modeIndex = 0;

var previousNote = null;
var currentNote = null;

function reset() {
	count32 = 1;
	count6 = 0;
	shiftregister = 0;
	currentNote = null;
}

function step() {
	click();
	makeNote();
}

// advances the 5-bit binary counter, the divide-by-6 counter,
// and the shift register
function click() {
	// get the XNOR value for the shift register from the previous state
	// (need to double check this behavior with a real Muse)
	var newbit = 1;
	for (var i = 0; i < 4; i++) {
	    newbit ^= select(theme[i]);
	}

	// increment the 5-bit counter
	// bit 0 is "C 1/2" which is the clock signal in the actual Muse
	count32 = 0x1f & (count32 + 1);

	// the clock signal going zero triggers the divide-by-6 counter
	// and the shift register
	if (0 == (count32 & 0x1)) {

	    // divide-by-6:
	    // bits 0,1  count 0,1,3,...
	    // read from bits 2,3
	    count6 += 1;
	    if (0x2 == (count6 & 0x3)) {
		count6 += 1;
	    }
	    
	    // and the shift register
	    shiftregister = (shiftregister << 1) | newbit;
	}
}

// 0..15, or null for a rest
function makeNote() {
	// in the Muse, CBA address into a major scale, 0..7, and D raises it an octave
	// so the octave C note gets repeated
	var dcba = getNoteBits();
	var pitch = modes[modeIndex][0x7 & dcba] + 12 * (dcba >> 3);
	
	previousNote = currentNote;
	
	// rest switch
	if (0 === pitch && 0 === rest) {
		currentNote = null;
		return;
	}
	currentNote = pitch + basePitch;
}

// Return the current 4-bit value of the note selected by the interval
// switches.
function getNoteBits() {
	var dcba = 0;
	for (var i = 0; i < 4; i ++) {
	    dcba |= select(interval[i]) << i;
	}
	return dcba;
}

// return the value for one of the 40 position switches from the state
// i is between 0 and 39.
function select(i) {
	if (0 == i) {
	    // bit 0 is "off"
	    return 0;
	} else if (1 == i) {
	    // bit 1 is "on"
	    return 1;
	} else if (i < 7) {
	    // bits 2..6 are "C 1/2 to C8"
	    return 0x1 & (count32 >> (i - 2));
	} else if (i < 9) {
	    // bits 7,8 are from the divide-by-6, bits 2,3
	    return 0x1 & (count6 >> (i - 5));
	} else if (i < 40) {
	    // bits 9..39 are the shift register
	    return 0x1 & (shiftregister >> (i - 9));
	}
}

//######################################################################

var sliderRows = ['OFF', 'ON', 'C 1/2', 'C1', 'C2', 'C4', 'C8', 'C3', 'C6'];
for (var i = 1; i <= 31; i++) {
	sliderRows.push('B' + i);
}

var modeNames = ["Ionian", "Lydian", "Dorian", "Phrygian", "Mixolydian", "Aeolian", "Locrian"];

var pitchLabels = [];
var octave = 2;
var note = 7;
var notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
while (pitchLabels.length < 42) {
	pitchLabels.push(notes[note]+octave)
	
	if (note == 11) {
		note = 0;
		octave ++;
	}
	else {
		note ++;
	}
}

var PluginParameters = [	
						{name:'Reset', type:'momentary'},
						{name:'Rest', type:'menu', valueStrings:['Rest', 'Normal'], defaultValue:1},
						{name:'Velocity', type:'linear', numberOfSteps:127, minValue:0, maxValue:127,defaultValue:100},
						{name:'Pitch', type:'menu', valueStrings:pitchLabels, defaultValue:17},
						{name:'Mode', type:'menu', valueStrings:modeNames, defaultValue:0},
						{name:'Channel', type:'linear', numberOfSteps:15, minValue:1,maxValue:16, defaultValue:1},
						{name:'Roll the Dice!', type:'momentary'},
						{name:'Interval', type:'text'},
						{name:'A', type:'menu', valueStrings:sliderRows, defaultValue:0},
						{name:'B', type:'menu', valueStrings:sliderRows, defaultValue:0},
						{name:'C', type:'menu', valueStrings:sliderRows, defaultValue:0},
						{name:'D', type:'menu', valueStrings:sliderRows, defaultValue:0},
						{name:'Theme', type:'text'},
						{name:'W', type:'menu', valueStrings:sliderRows, defaultValue:0},
						{name:'X', type:'menu', valueStrings:sliderRows, defaultValue:0},
						{name:'Y', type:'menu', valueStrings:sliderRows, defaultValue:0},
						{name:'Z', type:'menu', valueStrings:sliderRows, defaultValue:0},
					];

function onInterval(index, val) {
	interval[index] = val
}

function onTheme(index, val) {
	theme[index] = val
}

function onRollDaDice() {
	var intervals = ["A", "B", "C", "D"];
	for (var i = 0; i < intervals.length; i++) {
		var value = Math.floor(Math.random() * sliderRows.length)	
		onInterval(i, value);
		SetParameter(intervals[i], value);
	}
	
	var themes = ["W", "X", "Y", "Z"];
	for (var j = 0; j < themes.length; j++) {
		var value = Math.floor(Math.random() * sliderRows.length)	
		onInterval(j, value);
		SetParameter(themes[j], value);
	}
}

function ParameterChanged(param, value) {
	if (param == 0) { reset() }
	else if (param == 1) { rest = value }
	else if (param == 2) { velocity = value }
	else if (param == 3) { basePitch = value + 43 }
	else if (param == 4) { modeIndex = value }
	else if (param == 5) { channel = value }
	else if (param == 6) { onRollDaDice() }
	else if (param == 8) { onInterval(0, value) }
	else if (param == 9) { onInterval(1, value) }
	else if (param == 10) { onInterval(2, value) }
	else if (param == 11) { onInterval(3, value) }
	else if (param == 13) { onTheme(0, value) }
	else if (param == 14) { onTheme(1, value) }
	else if (param == 15) { onTheme(2, value) }
	else if (param == 16) { onTheme(3, value) }
}

var NeedsTimingInfo = true;

var channel = 1;
var recentBeat = 0
var recentOn = null;

function sendOff() {
	var off = new NoteOff(recentOn)
	off.send()
}

function ProcessMIDI() {
	var info = GetTimingInfo()
	if (!info.playing && recentOn != null) {
		sendOff()
		recentOn = null;
		return 
	}
	
	var multiplier = 10 
	var base = 5
	
	var end = Math.floor(info.blockEndBeat * multiplier)
	if (end % base > 0) {
		return
	}
	if (info.cycling) {
		var loopStart = Math.floor(info.leftCycleBeat * multiplier)
		var loopEnd = Math.floor(info.rightCycleBeat * multiplier)
		if (end == loopStart && recentBeat == loopEnd) {
			return
		}
	}
	
	if (end != recentBeat) {
		recentBeat = end 
		
		step()
		
		if (previousNote != currentNote) {
			sendOff()
		}
		else {
			return
		}

		if (currentNote != null) {
			var on = new NoteOn 
			on.pitch = currentNote
			on.channel = channel
			on.sendAtBeat(recentBeat / multiplier)
			recentOn = on
		}
	} 
} 
