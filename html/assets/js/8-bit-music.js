function sine(t) {
    return Math.sin(2 * Math.PI * t);
}

function square(t) {
    return Math.sign(Math.sin(2 * Math.PI * t));

}

function triangle(t) {
    return Math.abs(4 * (t - Math.floor(t + 0.5))) - 1;
}

function sawtooth(t) {
    return 2 * (t - Math.floor(t + 0.5));
}


// play a sound
function playSound(sound, duration, freq) {
    let context = new AudioContext();
    let o = context.createOscillator();
    let g = context.createGain();
    o.connect(g);
    o.type = sound;
    o.frequency.value = freq;
    g.connect(context.destination);
    o.start(0);
    g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + duration);
}


function cmag(a) {
    let [real, imaginary] = a;
    return Math.sqrt(real * real + imaginary * imaginary);
}

function sample_wave(wave, freq, duration, sample_rate) {
    let samples = [];
    for (let i = 0; i < duration * sample_rate; i++) {
        samples.push(wave(i / sample_rate * freq));
    }
    return samples;
}


function mono_to_stereo(data) {
    let stereo = [];
    for (let i = 0; i < data.length; i++) {
        stereo.push([]);
        stereo[i].push(data[i]);
        stereo[i].push(data[i]);
    }
    return stereo;
}

function stereo_to_mono(data) {
    let mono = [];
    for (let i = 0; i < data.length; i++) {
        mono.push((data[i][0] + data[i][1]) / 2);
    }
    return mono;
}

let freq = 440;
const SAMPLE_RATE = 44100;

let sample = sample_wave(sine, freq, 1, SAMPLE_RATE);

let result = math.fft(sample);
console.log(result);


// shift the result an octave down
for (let i = 0; i < result.length / 2; i++) {
    result[i] = result[i + result.length / 2];
}
console.log(result);

let inverse = math.ifft(result);
// convert to mono
for (let i= 0; i < inverse.length; i++) {
    inverse[i] = inverse[i].re;
}




// // plot the result
// let freqs = [];
// for (let i = 0; i < magnitudes.length / 2; i++) {
//     freqs.push(i);
// }
//
//
// let SINE = document.getElementById('sine');
// Plotly.newPlot( SINE, [{
// type: 'scatter',
// x: freqs,
// y: magnitudes,
// marker: {         // marker is an object, valid marker keys: #scatter-marker
//             color: 'rgb(16, 32, 77)' // more about "marker.color": #scatter-marker-color
//         }
// }],
// {margin: {t: 0}});



function playStereoSample(samples, sampleRate) {
    let context = new (window.AudioContext || window.webkitAudioContext)();
    let buffer = context.createBuffer(2, samples.length, sampleRate);

    // Copy samples to channels
    buffer.copyToChannel(new Float32Array(samples), 0);
    buffer.copyToChannel(new Float32Array(samples), 1);

    // Create a buffer source
    let source = context.createBufferSource();
    source.buffer = buffer;

    // Connect the source to the destination (speakers)
    source.connect(context.destination);

    // Start playback after the context is resumed
    context.resume().then(() => {
        source.start(0);
    });
}


function playMonoSample(samples, sampleRate) {
    let context = new (window.AudioContext || window.webkitAudioContext)();
    let buffer = context.createBuffer(1, samples.length, sampleRate);

    // Copy samples to channels
    buffer.copyToChannel(new Float32Array(samples), 0);

    // Create a buffer source
    let source = context.createBufferSource();
    source.buffer = buffer;

    // Connect the source to the destination (speakers)
    source.connect(context.destination);

    // Start playback after the context is resumed
    context.resume().then(() => {
        source.start(0);
    });
}

function playSine() {
    playMonoSample(sample, SAMPLE_RATE);
}

function playInverse() {
    playSample(inverse, SAMPLE_RATE);
}
