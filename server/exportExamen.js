const audioconcat = require('audioconcat');

module.exports = (dir, introDelay, promptDelays, closing) => {
  return; // TODO: fix this
  const files = [];

  files.push(dir + '/introduction.mp3');
  for (let i = 0; i < introDelay; i += 1) {
    files.push(dir + '/5-seconds-of-silence.mp3');
  }

  for (let i = 0; i < promptDelays.length; i++) {
    files.push(`${dir}/prompt-${i}.mp3`);

    for (let j = 0; j < promptDelays[i]; j += 1) {
      files.push(dir + '/5-seconds-of-silence.mp3');
    }
  }

  files.push(dir + '/closing.mp3');

  console.log(files);

  audioconcat(files)
    .concat(dir + 'export.mp3')
    .on('start', function (command) {
      console.log('ffmpeg process started:', command)
    })
    .on('error', function (err, stdout, stderr) {
      console.error('Error:', err)
      console.error('ffmpeg stderr:', stderr)
    })
    .on('end', function (output) {
      console.error('Audio created in:', output)
    })
}