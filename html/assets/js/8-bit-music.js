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
    return Math.sqrt(a.re * a.re + a.im * a.im);
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

const SAMPLE_RATE = 44100;

// let sample = sample_wave(square, freq, 1, SAMPLE_RATE);

let sample = [];


let inverse = [];


function get_magnitudes(result) {
    let magnitudes = [];
    for (let i = 0; i < result.length; i++) {
        magnitudes.push(cmag(result[i]));
    }
    return magnitudes;
}

function max_freq(magnitudes) {
    let max = 0;
    let max_index = 0;
    for (let i = 0; i < magnitudes.length / 2; i++) {
        if (magnitudes[i] > max) {
            max = magnitudes[i];
            max_index = i;
        }
    }
    return max_index;
}

function generate_zeros(len) {
    let res = [];
    for (let i = 0; i < len; i++) {
        res.push(math.complex(0, 0));
    }
    return res;
}

function pitch_shift(sample, new_freq) {
    let result = math.fft(sample);
    let len = result.length;

    // find the frequency of the result
    let magnitudes = get_magnitudes(result);
    let freq = max_freq(magnitudes);
    console.log(freq);

    if (freq === new_freq) {
        return sample;
    }

    if (freq < new_freq) {
        // insert zeros at beginning
        let zeros = generate_zeros(new_freq - freq);
        result = zeros.concat(result);
        // preserve length
        result = result.slice(0, len);

    }
    else if (freq > new_freq) {
        // remove beginning
        result = result.slice(freq - new_freq);
        // fill end with zeros preserve length
        result = result.concat(generate_zeros(len - result.length));
    }

    let new_sample = math.ifft(result);

    // convert to mono
    for (let i= 0; i < new_sample.length; i++) {
        new_sample[i] = new_sample[i].re;
    }return new_sample;

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
    playMonoSample(inverse, SAMPLE_RATE);
}

async function loadAndDecodeMP3(filePath) {
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();

    return new Promise((resolve, reject) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        audioContext.decodeAudioData(arrayBuffer, (buffer) => {
            resolve(buffer);
        }, (error) => {
            reject(error);
        });
    });
}


function init() {
    const filename = 'assets/audio/c.mp3';
    loadAndDecodeMP3(filename).then((buffer) => {
        sample = buffer.getChannelData(0);
        // convert to array
        sample = Array.from(sample);


        console.log(sample);
        inverse = pitch_shift(sample, 559 * 2 + 559 / 2);
    });
}