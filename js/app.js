/* =====================================================
   HOMEM E A MÁQUINA
   TESTE 01 — AUDIÇÃO REAL
===================================================== */

const machine = document.querySelector(".machine");
const voiceButton = document.querySelector(".test-voice");

let audioContext = null;
let analyser = null;
let microphone = null;
let audioStream = null;
let listening = false;


/* =====================================================
   ESTADO VISUAL
===================================================== */

function setMachineState(state) {

    if (!machine) {
        return;
    }

    machine.dataset.state = state;
}


/* =====================================================
   INICIAR MICROFONE
===================================================== */

async function startMicrophone() {

    if (listening) {
        return;
    }

    try {

        audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        audioContext =
            new (window.AudioContext ||
            window.webkitAudioContext)();

        analyser =
            audioContext.createAnalyser();

        analyser.fftSize = 256;

        microphone =
            audioContext.createMediaStreamSource(
                audioStream
            );

        microphone.connect(analyser);

        listening = true;

        setMachineState("listening");

        monitorAudio();

    } catch (error) {

        console.error(
            "Não foi possível acessar o microfone:",
            error
        );

        setMachineState("idle");
    }
}


/* =====================================================
   MONITORAR ÁUDIO
===================================================== */

function monitorAudio() {

    if (!listening || !analyser) {
        return;
    }

    const data =
        new Uint8Array(
            analyser.fftSize
        );

    analyser.getByteTimeDomainData(data);


    let total = 0;

    for (let i = 0; i < data.length; i++) {

        const value =
            (data[i] - 128) / 128;

        total += value * value;
    }


    const volume =
        Math.sqrt(
            total / data.length
        );


    const intensity =
        Math.min(
            1,
            volume * 8
        );


    if (machine) {

        machine.style.setProperty(
            "--voice-intensity",
            intensity.toFixed(3)
        );

    }


    requestAnimationFrame(
        monitorAudio
    );
}


/* =====================================================
   PARAR MICROFONE
===================================================== */

function stopMicrophone() {

    listening = false;

    if (audioStream) {

        audioStream
            .getTracks()
            .forEach(track => track.stop());

        audioStream = null;
    }

    if (audioContext) {

        audioContext.close();

        audioContext = null;
    }

    analyser = null;
    microphone = null;

    if (machine) {

        machine.style.setProperty(
            "--voice-intensity",
            "0"
        );

    }

    setMachineState("idle");
}


/* =====================================================
   BOTÃO 🎙️
===================================================== */

if (voiceButton) {

    voiceButton.addEventListener(
        "click",
        async () => {

            if (listening) {

                stopMicrophone();

            } else {

                await startMicrophone();

            }

        }
    );
}


/* =====================================================
   ESTADO INICIAL
===================================================== */

setMachineState("idle");
