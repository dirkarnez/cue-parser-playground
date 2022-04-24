parse(`REM GENRE R&B
REM DATE 2016
REM DISCID 720CEB0A
REM COMMENT "ExactAudioCopy v1.1"
PERFORMER "Michael Kiwanuka"
TITLE "Love And Hate"
FILE "Michael Kiwanuka - Love And Hate.flac" WAVE
  TRACK 01 AUDIO
    TITLE "Cold Little Heart"
    PERFORMER "Michael Kiwanuka"
    INDEX 01 00:00:00
  TRACK 02 AUDIO
    TITLE "Black Man In A White World"
    PERFORMER "Michael Kiwanuka"
    INDEX 00 09:58:54
    INDEX 01 10:10:36
  TRACK 03 AUDIO
    TITLE "Falling"
    PERFORMER "Michael Kiwanuka"
    INDEX 01 14:29:33
  TRACK 04 AUDIO
    TITLE "Place I Belong"
    PERFORMER "Michael Kiwanuka"
    INDEX 01 18:46:24
  TRACK 05 AUDIO
    TITLE "Love And Hate"
    PERFORMER "Michael Kiwanuka"
    INDEX 01 23:33:63
  TRACK 06 AUDIO
    TITLE "One More Night"
    PERFORMER "Michael Kiwanuka"
    INDEX 01 30:40:70
  TRACK 07 AUDIO
    TITLE "I'll Never Love"
    PERFORMER "Michael Kiwanuka"
    INDEX 01 34:34:26
  TRACK 08 AUDIO
    TITLE "Rule The World"
    PERFORMER "Michael Kiwanuka"
    INDEX 01 37:20:25
  TRACK 09 AUDIO
    TITLE "Father's Child"
    PERFORMER "Michael Kiwanuka"
    INDEX 01 43:03:12
    INDEX 02 50:06:41
  TRACK 10 AUDIO
    TITLE "The Final Frame"
    PERFORMER "Michael Kiwanuka"
    INDEX 00 50:06:41
    INDEX 01 50:08:23
`
);

parse(`REM DATE 2005
REM DISCID 1411B112
REM COMMENT "ExactAudioCopy v1.1"
PERFORMER "Schiller"
TITLE "Day and Night"
FILE "Schiller - Day and Night.flac" WAVE
  TRACK 01 AUDIO
    TITLE "Welcome"
    PERFORMER "Schiller"
    INDEX 01 00:00:00
  TRACK 02 AUDIO
    TITLE "Nightflight"
    PERFORMER "Schiller"
    INDEX 01 01:09:47
  TRACK 03 AUDIO
    TITLE "Tired of Being Alone"
    PERFORMER "Schiller"
    INDEX 01 06:55:22
  TRACK 04 AUDIO
    TITLE "What's Coming"
    PERFORMER "Schiller"
    INDEX 01 10:57:36
  TRACK 05 AUDIO
    TITLE "Sunrise"
    PERFORMER "Schiller"
    INDEX 01 15:23:43
  TRACK 06 AUDIO
    TITLE "Miles and Miles"
    PERFORMER "Schiller"
    INDEX 01 18:36:31
  TRACK 07 AUDIO
    TITLE "Das Meer"
    PERFORMER "Schiller"
    INDEX 01 22:30:57
  TRACK 08 AUDIO
    TITLE "I Know (feat. Jette Von Roth)"
    PERFORMER "Schiller"
    INDEX 01 27:21:18
  TRACK 09 AUDIO
    TITLE "Morning Dew"
    PERFORMER "Schiller"
    INDEX 01 32:19:36
  TRACK 10 AUDIO
    TITLE "Berlin Bombay"
    PERFORMER "Schiller"
    INDEX 01 36:22:07
  TRACK 11 AUDIO
    TITLE "The Smile"
    PERFORMER "Schiller"
    INDEX 01 41:11:63
  TRACK 12 AUDIO
    TITLE "Lightstorm (feat. Kim Sanders)"
    PERFORMER "Schiller"
    INDEX 01 44:26:20
  TRACK 13 AUDIO
    TITLE "Falling"
    PERFORMER "Schiller"
    INDEX 01 47:45:33
  TRACK 14 AUDIO
    TITLE "Rings of Time"
    PERFORMER "Schiller"
    INDEX 01 53:02:26
  TRACK 15 AUDIO
    TITLE "I Saved You (feat. Kim Sanders)"
    PERFORMER "Schiller"
    INDEX 01 56:52:66
  TRACK 16 AUDIO
    TITLE "Misguiding Light"
    PERFORMER "Schiller"
    INDEX 01 61:31:43
  TRACK 17 AUDIO
    TITLE "Fireworks"
    PERFORMER "Schiller"
    INDEX 01 64:49:60
  TRACK 18 AUDIO
    TITLE "Sleepy Storm (feat. Jette Von Roth)"
    PERFORMER "Schiller"
    INDEX 01 69:54:21
`
);

function parse(content) {

    const data = {
        tracks: [],
    };
    const lines = content.split('\n').map(line => line.replace('\r', '')).filter(line => line.length > 0);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.startsWith('FILE')) {
            const result = /^FILE\s+"([^\\"]+)"\s+([^\s]+)$/i.exec(line);
            data.fileName = result[1];
            data.fileFormat = result[2];
        } else if (line.startsWith('TRACK')) {
            const track = {};
            const result = /^TRACK ([\\d]+) AUDIO$/i.exec(line);
            track.index = Number(result[1]);
            const childLines = [];

            let childLinesIndex = i + 1;
            let newLine = lines[childLinesIndex];

            while (newLine.startsWith('  ')) {
                newLine = lines[childLinesIndex];
                childLinesIndex++;
                if (!newLine || !newLine.startsWith('  ')) break;
                childLines.push(newLine.trim());
            }

            for (const childLine of childLines) {
                if (childLine.startsWith('TITLE')) {
                    const result = /^TITLE "([a-z0-9\. ]*)"$/i.exec(childLine);
                    track.title = result[1];
                } else if (childLine.startsWith('INDEX 01')) {
                    const result = /^INDEX 01 ([0-9:]*)$/i.exec(childLine);
                    track.timeCode = result[1];
                    track.timeInSeconds = this.formatCUETimeAsSecond(result[1]);
                }
            }
            data.tracks[track.index - 1] = track;
            i = (childLinesIndex - 2);
        } else {
            console.info('Unknown Line', line, i)
        }
    }
    return data;
}

function formatCUETimeAsSecond(time) {
    if (!isNaN(time)) return time;
    if (!time) time = '0:0:00';
    const parts = time.split(':');
    let date = new Date(null);
    date.setMinutes(Number(parts[0]));
    date.setSeconds(Number(parts[1]));
    date.setMilliseconds(Number(parts[2]) * 10);
    return date.getTime() / 1000;
}