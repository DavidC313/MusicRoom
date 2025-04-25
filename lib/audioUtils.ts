import * as Tone from 'tone';

export async function exportToMP3(tracks: any[], effects: any[]) {
    try {
        // Create an offline context for rendering
        const offlineContext = new Tone.OfflineContext(2, 30, 44100);
        
        // Calculate total duration based on tracks
        const maxNotePosition = Math.max(
            ...tracks.flatMap(track => 
                track.notes.map((note: any) => note.x)
            ),
            0
        );
        
        // Calculate time per step based on tempo (assuming 120 BPM as default)
        const tempo = 120;
        const timePerStep = (60 / tempo) / 4; // 16th notes per beat
        const totalDuration = (maxNotePosition + 1) * timePerStep;

        // Create synths and effects for each track
        const trackSynths = tracks.map(track => {
            const synth = new Tone.Synth().toDestination();
            
            // Add effects if specified
            if (Array.isArray(track.effects) && track.effects.length > 0) {
                track.effects.forEach((effectName: string) => {
                    switch (effectName) {
                        case 'reverb':
                            const reverb = new Tone.Reverb(2.5).toDestination();
                            synth.connect(reverb);
                            break;
                        case 'delay':
                            const delay = new Tone.FeedbackDelay(0.25, 0.5).toDestination();
                            synth.connect(delay);
                            break;
                        case 'distortion':
                            const distortion = new Tone.Distortion(0.8).toDestination();
                            synth.connect(distortion);
                            break;
                        case 'chorus':
                            const chorus = new Tone.Chorus(1.5, 3.5, 0.7).toDestination();
                            synth.connect(chorus);
                            break;
                    }
                });
            }
            
            return synth;
        });

        // Schedule all notes
        tracks.forEach((track, trackIndex) => {
            if (!track.muted) {
                track.notes.forEach((note: any) => {
                    const time = note.x * timePerStep;
                    const duration = timePerStep;
                    trackSynths[trackIndex].triggerAttackRelease(
                        note.pitch,
                        duration,
                        time
                    );
                });
            }
        });

        // Render audio
        const renderedBuffer = await Tone.Offline(() => {
            // Trigger all scheduled events
            tracks.forEach((track, trackIndex) => {
                if (!track.muted) {
                    track.notes.forEach((note: any) => {
                        const time = note.x * timePerStep;
                        const duration = timePerStep;
                        trackSynths[trackIndex].triggerAttackRelease(
                            note.pitch,
                            duration,
                            time
                        );
                    });
                }
            });
        }, totalDuration);

        // Clean up
        trackSynths.forEach(synth => synth.dispose());

        return renderedBuffer.get();
    } catch (error) {
        console.error('Error exporting to MP3:', error);
        throw error;
    }
} 