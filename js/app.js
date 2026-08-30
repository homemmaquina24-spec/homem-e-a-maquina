/* =====================================================
   HOMEM E A MÁQUINA
   TESTE 02 — CONVERSAÇÃO CONTÍNUA
   DETECÇÃO DE TURNOS
===================================================== */

const machine = document.querySelector(".machine");
const voiceButton = document.querySelector(".test-voice");

let audioContext = null;
let analyser = null;
let microphone = null;
let audioStream = null;

let conversationActive = false;
let speechActive = false;

let speechStartedAt = 0;
let lastSoundAt = 0;

let animationFrame = null;


/* =====================================================
   CONFIGURAÇÃO
===================================================== */

/*
   Estes valores são apenas para o primeiro teste.
   Não são os valores finais da Máquina.
*/

const SPEECH_THRESHOLD = 0.035;

const START_CONFIRMATION_MS = 180;

const END_SILENCE_MS = 1500;

const MIN_SPEECH_MS = 250;


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
   INICIAR CONVERSA
===================================================== */

async function startConversation() {

    if (conversationActive) {
        return;
    }

    try {

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            console.error(
                "Este navegador não disponibiliza acesso ao microfone."
            );

            return;
        }


        audioStream =
            await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });


        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();


        if (audioContext.state === "suspended") {
            await audioContext.resume();
        }


        analyser =
            audioContext.createAnalyser();

        analyser.fftSize = 512;

        analyser.smoothingTimeConstant = 0.72;


        microphone =
            audioContext.createMediaStreamSource(
                audioStream
            );


        microphone.connect(analyser);


        conversationActive = true;

        speechActive = false;

        speechStartedAt = 0;

        lastSoundAt = 0;


        setMachineState("listening");


        monitorMicrophone();

    } catch (error) {

        console.error(
            "Erro ao iniciar o microfone:",
            error
        );

        stopConversation();
    }
}


/* =====================================================
   MEDIR ENERGIA DO ÁUDIO
===================================================== */

function getAudioLevel(data) {

    let total = 0;

    for (let i = 0; i < data.length; i++) {

        const value =
            (data[i] - 128) / 128;

        total += value * value;
    }

    return Math.sqrt(
        total / data.length
    );
}


/* =====================================================
   MONITORAR MICROFONE
===================================================== */

function monitorMicrophone() {

    if (
        !conversationActive ||
        !analyser
    ) {
        return;
    }


    const data =
        new Uint8Array(
            analyser.fftSize
        );


    analyser.getByteTimeDomainData(data);


    const level =
        getAudioLevel(data);


    const now =
        performance.now();


    /*
       Reação visual baseada no áudio real.
    */

    const intensity =
        Math.min(
            1,
            level * 8
        );


    if (machine) {

        machine.style.setProperty(
            "--voice-intensity",
            intensity.toFixed(3)
        );

    }


    /*
       =================================================
       INÍCIO DA FALA
       =================================================
    */

    if (
        level > SPEECH_THRESHOLD &&
        !speechActive
    ) {

        if (!speechStartedAt) {

            speechStartedAt = now;

        }


        /*
           O som precisa permanecer acima
           do limite por alguns milissegundos.
        */

        if (
            now - speechStartedAt >=
            START_CONFIRMATION_MS
        ) {

            speechActive = true;

            speechStartedAt = now;

            lastSoundAt = now;

            setMachineState("listening");

        }

    }


    /*
       =================================================
       FALA CONTINUA
       =================================================
    */

    if (
        level > SPEECH_THRESHOLD &&
        speechActive
    ) {

        lastSoundAt = now;

    }


    /*
       =================================================
       FIM DO TURNO
       =================================================
    */

    if (
        speechActive &&
        lastSoundAt > 0 &&
        now - lastSoundAt >= END_SILENCE_MS
    ) {

        finishSpeechTurn();

    }


    animationFrame =
        requestAnimationFrame(
            monitorMicrophone
        );
}


/* =====================================================
   TERMINAR UM TURNO
===================================================== */

function finishSpeechTurn() {

    const duration =
        performance.now() -
        speechStartedAt;


    /*
       Ignora ruídos extremamente curtos.
    */

    if (duration < MIN_SPEECH_MS) {

        speechActive = false;

        speechStartedAt = 0;

        lastSoundAt = 0;

        return;
    }


    /*
       Neste momento ainda não existe
       reconhecimento das palavras.

       Estamos apenas provando que
       um turno terminou.
    */

    console.log(
        "Turno de fala terminado."
    );


    speechActive = false;

    speechStartedAt = 0;

    lastSoundAt = 0;


    /*
       A sessão continua aberta.
       A Máquina volta imediatamente
       para a escuta.
    */

    setMachineState("listening");
}


/* =====================================================
   ENCERRAR TODA A SESSÃO
===================================================== */

function stopConversation() {

    conversationActive = false;

    speechActive = false;

    speechStartedAt = 0;

    lastSoundAt = 0;


    if (animationFrame) {

        cancelAnimationFrame(
            animationFrame
        );

        animationFrame = null;
    }


    if (audioStream) {

        audioStream
            .getTracks()
            .forEach(
                track => track.stop()
            );

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

            if (conversationActive) {

                stopConversation();

            } else {

                await startConversation();

            }

        }
    );
}


/* =====================================================
   ESTADO INICIAL
===================================================== */

setMachineState("idle");
