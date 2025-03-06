import * as Tone from 'tone';

// Ensure Tone.js only runs in the browser
const isClient = typeof window !== 'undefined';

let guitarSynth, bassSynth, drumsSynth, metronomeSynth;
let effects = {};

if (isClient) {
    guitarSynth = new Tone.Synth().toDestination();
    bassSynth = new Tone.Synth().toDestination();
    drumsSynth = new Tone.MembraneSynth().toDestination();
    metronomeSynth = new Tone.MembraneSynth().toDestination();

    // Effects
    effects = {
        chorus: new Tone.Chorus(4, 2.5, 0.5).toDestination(),
        distortion: new Tone.Distortion(0.4).toDestination(),
        phaser: new Tone.Phaser({ frequency: 15, octaves: 5, baseFrequency: 1000 }).toDestination()
    };
}

// Play Note Function
export function playNote(instrument, note) {
    if (!isClient) return;

    if (instrument === 'guitar' && guitarSynth) {
        guitarSynth.triggerAttackRelease(note, '8n');
    } else if (instrument === 'bass' && bassSynth) {
        bassSynth.triggerAttackRelease(note, '8n');
    } else if (instrument === 'drums' && drumsSynth) {
        drumsSynth.triggerAttackRelease(note, '8n');
    }
}

// Apply Effect Function
export function applyEffect(effectName) {
    if (!isClient || !effects[effectName]) return;
    guitarSynth.connect(effects[effectName]);
    bassSynth.connect(effects[effectName]);
    drumsSynth.connect(effects[effectName]);
}

// Metronome Toggle
export function toggleMetronome(isEnabled) {
    if (!isClient) return;
    if (isEnabled) {
        Tone.Transport.scheduleRepeat(() => {
            metronomeSynth.triggerAttackRelease('C4', '8n');
        }, '4n');
    } else {
        Tone.Transport.cancel();
    }
}
