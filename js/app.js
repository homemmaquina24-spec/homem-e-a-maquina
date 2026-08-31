/* =====================================================
   HOMEM E A MÁQUINA
   V6 — ÁUDIO ESTÁVEL + RECONHECIMENTO CONTROLADO
===================================================== */

const machine = document.querySelector(".machine");
const voiceButton = document.querySelector(".test-voice");

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


/* =====================================================
   ESTADOS
===================================================== */

const STATE = {
    IDLE: "idle",
    LISTENING: "listening",
    THINKING: "thinking",
    SPEAKING: "speaking",
    WAITING: "waiting"
};

let state = STATE.IDLE;


/* =====================================================
   ÁUDIO
===================================================== */

let audioStream = null;
let audioContext = null;
let analyser = null;
let microphoneSource = null;
let animationFrame = null;

let microphoneActive = false;


/* =====================================================
   RECONHECIMENTO
===================================================== */

let recognition = null;
let recognitionRunning = false;

let recognitionWanted = false;

let finalTranscript = "";

let turnActive = false;


/* =====================================================
   CONFIGURAÇÃO
===================================================== */

const LANGUAGE = "pt-MZ";

const FFT_SIZE = 512;


/* =====================================================
   ESTADO VISUAL
===================================================== */

function setMachineState(newState) {

    state = newState;

    if (machine) {
        machine.dataset.state = newState;
    }

    console.log(
        "Estado:",
        newState
    );
}


/* =====================================================
   NORMALIZAÇÃO
===================================================== */

function normalizeText(text) {

    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[.,!?;:]/g,
            " "
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();
}


/* =====================================================
   COMANDO DE ESPERA
===================================================== */

function isWaitingCommand(text) {

    const commands = [
        "espera",
        "espera maquina",
        "maquina espera",
        "espera um pouco",
        "espera um bocadinho",
        "fica em espera",
        "aguarda um pouco",
        "volto ja"
    ];

    return commands.some(
        command =>
            text === command ||
            text.includes(command)
    );
}


/* =====================================================
   COMANDO DE RETOMA
===================================================== */

function isResumeCommand(text) {

    const commands = [
        "voltei",
        "maquina voltei",
        "ja voltei",
        "podemos continuar",
        "vamos continuar",
        "continua",
        "maquina continua"
    ];

    return commands.some(
        command =>
            text === command ||
            text.includes(command)
    );
}


/* =====================================================
   COMANDO DE ENCERRAMENTO
===================================================== */

function isCloseCommand(text) {

    const commands = [
        "encerra a conversa",
        "encerrar a conversa",
        "podes encerrar a conversa",
        "pode encerrar a conversa",
        "fecha a conversa",
        "fechar a conversa",
        "encerra a sessao",
        "encerrar a sessao",
        "fecha a sessao",
        "fechar a sessao",
        "vamos parar por aqui",
        "ate logo maquina"
    ];

    return commands.some(
        command =>
            text === command ||
            text.includes(command)
    );
}


/* =====================================================
   PROCESSAR TEXTO
===================================================== */

function processTranscript() {

    const text =
        finalTranscript.trim();


    if (!text) {
        resetTurn();
        return;
    }


    console.log(
        "TURNO:",
        text
    );


    const normalized =
        normalizeText(text);


    /* ---------------------------------------------
       ENCERRAR
    --------------------------------------------- */

    if (
        isCloseCommand(normalized)
    ) {

        resetTurn();

        closeConversation();

        return;
    }


    /* ---------------------------------------------
       ESPERA
    --------------------------------------------- */

    if (
        isWaitingCommand(normalized)
    ) {

        resetTurn();

        enterWaitingMode();

        return;
    }


    /* ---------------------------------------------
       RETOMAR
    --------------------------------------------- */

    if (
        isResumeCommand(normalized)
    ) {

        resetTurn();

        resumeConversation();

        return;
    }


    /* ---------------------------------------------
       TURNO NORMAL
    --------------------------------------------- */

    console.log(
        "Turno normal recebido."
    );


    setState(
        STATE.THINKING
    );


    /*
       A inteligência da Máquina será adicionada
       posteriormente.

       Por enquanto apenas validamos
       o fluxo de voz.
    */


    setTimeout(() => {

        if (
            microphoneActive &&
            state === STATE.THINKING
        ) {

            setState(
                STATE.LISTENING
            );
        }

    }, 500);


    resetTurn();
}


/* =====================================================
   RESETAR TURNO
===================================================== */

function resetTurn() {

    finalTranscript = "";

    turnActive = false;
}


/* =====================================================
   CRIAR RECONHECIMENTO
===================================================== */

function createRecognition() {

    if (!SpeechRecognition) {

        console.error(
            "SpeechRecognition não suportado."
        );

        return null;
    }


    const recognizer =
        new SpeechRecognition();


    recognizer.lang =
        LANGUAGE;


    /*
       O reconhecimento pode receber
       vários resultados durante a sessão.
    */

    recognizer.continuous =
        true;


    recognizer.interimResults =
        true;


    recognizer.maxAlternatives =
        1;


    /* =================================================
       RESULTADO
    ================================================= */

    recognizer.onresult =
        function(event) {

            let transcript = "";


            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {

                const result =
                    event.results[i];


                const text =
                    result[0]
                        .transcript
                        .trim();


                if (!text) {
                    continue;
                }


                transcript +=
                    text + " ";


                if (
                    result.isFinal
                ) {

                    turnActive = true;
                }
            }


            if (
                transcript.trim()
            ) {

                finalTranscript +=
                    transcript;
            }


            console.log(
                "Reconhecido:",
                finalTranscript.trim()
            );
        };


    /* =================================================
       FALA
    ================================================= */

    recognizer.onspeechstart =
        function() {

            if (
                !microphoneActive ||
                state === STATE.WAITING
            ) {
                return;
            }


            turnActive = true;


            setState(
                STATE.LISTENING
            );
        };


    /* =================================================
       FIM DA FALA
    ================================================= */

    recognizer.onspeechend =
        function() {

            if (
                !microphoneActive ||
                state === STATE.WAITING
            ) {
                return;
            }


            /*
               NÃO desligamos o microfone.

               Apenas processamos o turno
               reconhecido.
            */

            if (
                turnActive &&
                finalTranscript.trim()
            ) {

                processTranscript();
            }
        };


    /* =================================================
       ERRO
    ================================================= */

    recognizer.onerror =
        function(event) {

            console.log(
                "Reconhecimento:",
                event.error
            );


            /*
               Um erro do reconhecimento
               não encerra a sessão de áudio.
            */
        };


    /* =================================================
       FIM DO RECONHECIMENTO
    ================================================= */

    recognizer.onend =
        function() {

            recognitionRunning =
                false;


            console.log(
                "Reconhecimento terminou."
            );


            /*
               IMPORTANTE:

               Não iniciamos novamente
               automaticamente nesta versão.

               O microfone continua separado.
            */
        };


    return recognizer;
}


/* =====================================================
   INICIAR RECONHECIMENTO
===================================================== */

function startRecognition() {

    if (
        !recognitionWanted ||
        !microphoneActive ||
        state === STATE.WAITING
    ) {
        return;
    }


    if (
        recognitionRunning
    ) {
        return;
    }


    if (!recognition) {

        recognition =
            createRecognition();
    }


    if (!recognition) {
        return;
    }


    try {

        recognition.start();

        recognitionRunning =
            true;

        console.log(
            "Reconhecimento iniciado."
        );

    } catch (error) {

        console.log(
            "Não foi possível iniciar reconhecimento:",
            error
        );


        recognitionRunning =
            false;
    }
}


/* =====================================================
   PARAR RECONHECIMENTO
===================================================== */

function stopRecognition() {

    recognitionWanted =
        false;


    if (
        !recognition
    ) {
        return;
    }


    try {

        recognition.stop();

    } catch (error) {

        console.log(
            "Reconhecimento já estava parado."
        );
    }


    recognitionRunning =
        false;
}


/* =====================================================
   INICIAR MICROFONE
===================================================== */

async function startMicrophone() {

    if (
        microphoneActive
    ) {
        return;
    }


    try {

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


        if (
            audioContext.state ===
            "suspended"
        ) {

            await audioContext.resume();
        }


        analyser =
            audioContext.createAnalyser();


        analyser.fftSize =
            FFT_SIZE;


        analyser.smoothingTimeConstant =
            0.75;


        microphoneSource =
            audioContext.createMediaStreamSource(
                audioStream
            );


        microphoneSource.connect(
            analyser
        );


        microphoneActive =
            true;


        setState(
            STATE.LISTENING
        );


        monitorAudio();


        /*
           O reconhecimento começa uma vez.
        */

        recognitionWanted =
            true;


        startRecognition();


        console.log(
            "Sessão de áudio iniciada."
        );

    } catch (error) {

        console.error(
            "Erro no microfone:",
            error
        );


        cleanupMicrophone();
    }
}


/* =====================================================
   MONITORAR ÁUDIO
===================================================== */

function monitorAudio() {

    if (
        !microphoneActive ||
        !analyser
    ) {
        return;
    }


    const data =
        new Uint8Array(
            analyser.fftSize
        );


    analyser.getByteTimeDomainData(
        data
    );


    let total = 0;


    for (
        let i = 0;
        i < data.length;
        i++
    ) {

        const value =
            (data[i] - 128) / 128;


        total +=
            value * value;
    }


    const level =
        Math.sqrt(
            total / data.length
        );


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


    animationFrame =
        requestAnimationFrame(
            monitorAudio
        );
}


/* =====================================================
   ESPERA
===================================================== */

function enterWaitingMode() {

    console.log(
        "MÁQUINA → ESPERA"
    );


    setState(
        STATE.WAITING
    );


    /*
       O microfone físico é liberado.

       Não fica ouvindo enquanto o Homem
       pediu privacidade.
    */

    stopRecognition();

    cleanupMicrophoneOnly();


    console.log(
        "Escuta suspensa."
    );
}


/* =====================================================
   RETOMAR
===================================================== */

async function resumeConversation() {

    if (
        microphoneActive
    ) {
        return;
    }


    console.log(
        "MÁQUINA → RETOMANDO"
    );


    setState(
        STATE.LISTENING
    );


    await startMicrophone();
}


/* =====================================================
   ENCERRAR
===================================================== */

function closeConversation() {

    console.log(
        "MÁQUINA → ENCERRADA"
    );


    stopRecognition();

    cleanupMicrophoneOnly();


    recognition =
        null;


    resetTurn();


    setState(
        STATE.IDLE
    );
}


/* =====================================================
   LIMPAR MICROFONE
===================================================== */

function cleanupMicrophoneOnly() {

    microphoneActive =
        false;


    if (animationFrame) {

        cancelAnimationFrame(
            animationFrame
        );

        animationFrame =
            null;
    }


    if (microphoneSource) {

        try {

            microphoneSource.disconnect();

        } catch (error) {}

        microphoneSource =
            null;
    }


    analyser =
        null;


    if (audioStream) {

        audioStream
            .getTracks()
            .forEach(
                track => track.stop()
            );

        audioStream =
            null;
    }


    if (audioContext) {

        try {

            audioContext.close();

        } catch (error) {}

        audioContext =
            null;
    }


    if (machine) {

        machine.style.setProperty(
            "--voice-intensity",
            "0"
        );
    }
}


/* =====================================================
   LIMPEZA COMPLETA
===================================================== */

function cleanupMicrophone() {

    stopRecognition();

    cleanupMicrophoneOnly();

    recognition =
        null;

    resetTurn();

    setState(
        STATE.IDLE
    );
}


/* =====================================================
   BOTÃO
===================================================== */

if (voiceButton) {

    voiceButton.addEventListener(
        "click",
        async function() {

            if (
                microphoneActive
            ) {

                closeConversation();

            } else {

                await startMicrophone();
            }

        }
    );
}


/* =====================================================
   INICIAL
===================================================== */

setMachineState(
    STATE.IDLE
);
