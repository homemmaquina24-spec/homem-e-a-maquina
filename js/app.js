/* =====================================================
   HOMEM E A MÁQUINA
   V6.1 — ÁUDIO ESTÁVEL + REAÇÃO À VOZ
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


/*
   Parâmetros usados SOMENTE para a reação visual.

   Não controlam o microfone.
   Não desligam o microfone.
   Não encerram a conversa.
*/

const AUDIO_NOISE_FLOOR = 0.008;
const AUDIO_VOICE_LEVEL = 0.055;

let visualIntensity = 0;


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


    setMachineState(
        STATE.THINKING
    );


    /*
       A inteligência da Máquina será adicionada
       posteriormente.
    */


    setTimeout(() => {

        if (
            microphoneActive &&
            state === STATE.THINKING
        ) {

            setMachineState(
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
       INÍCIO DA FALA
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


            /*
               Mantemos o estado LISTENING.

               A reação à intensidade real
               é feita separadamente pelo
               analisador de áudio.
            */

            if (
                state !== STATE.THINKING &&
                state !== STATE.SPEAKING
            ) {

                setMachineState(
                    STATE.LISTENING
                );
            }
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
               NÃO reiniciamos automaticamente.

               Isso preserva a estabilidade
               que acabámos de validar.
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


        visualIntensity =
            0;


        setMachineState(
            STATE.LISTENING
        );


        monitorAudio();


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


    /*
       Retiramos uma pequena faixa de ruído
       ambiente para que a Máquina não
       fique reagindo exageradamente.
    */

    const usableLevel =
        Math.max(
            0,
            level - AUDIO_NOISE_FLOOR
        );


    /*
       Transformamos o áudio em uma escala
       visual de 0 a 1.
    */

    const targetIntensity =
        Math.min(
            1,
            usableLevel /
            AUDIO_VOICE_LEVEL
        );


    /*
       Suavização.

       Evita que a Máquina fique tremendo
       de forma artificial a cada pequena
       variação do microfone.
    */

    visualIntensity +=
        (
            targetIntensity -
            visualIntensity
        ) * 0.22;


    if (machine) {

        machine.style.setProperty(
            "--voice-intensity",
            visualIntensity.toFixed(3)
        );
    }


    /*
       A intensidade visual NÃO liga
       nem desliga o microfone.

       Ela apenas controla a presença
       visual da Máquina.
    */


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


    setMachineState(
        STATE.WAITING
    );


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


    setMachineState(
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


    setMachineState(
        STATE.IDLE
    );
}


/* =====================================================
   LIMPAR MICROFONE
===================================================== */

function cleanupMicrophoneOnly() {

    microphoneActive =
        false;


    visualIntensity =
        0;


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

    setMachineState(
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
/* =====================================================
   HOMEM E A MÁQUINA
   V6.2 — PARTE 2/2
   ÁUDIO ESTÁVEL + REAÇÃO À VOZ + MACHINE VOICE
===================================================== */


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


        visualIntensity =
            0;


        setMachineState(
            STATE.LISTENING
        );


        monitorAudio();


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


    let total =
        0;


    for (
        let i = 0;

        i < data.length;

        i++
    ) {

        const value =
            (
                data[i] -
                128
            ) / 128;


        total +=
            value *
            value;
    }


    const level =
        Math.sqrt(
            total /
            data.length
        );


    /*
       Pequena zona morta contra
       ruído ambiente.
    */

    const usableLevel =
        Math.max(

            0,

            level -
            AUDIO_NOISE_FLOOR

        );


    /*
       Intensidade visual.
    */

    const targetIntensity =
        Math.min(

            1,

            usableLevel /
            AUDIO_VOICE_LEVEL

        );


    /*
       Suavização da reação.

       Isto NÃO controla:
       - microfone
       - reconhecimento
       - encerramento
       - pausa
    */

    visualIntensity +=

        (
            targetIntensity -
            visualIntensity
        ) * 0.22;


    if (machine) {

        machine.style.setProperty(

            "--voice-intensity",

            visualIntensity.toFixed(3)

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


    setMachineState(
        STATE.WAITING
    );


    /*
       Paramos o reconhecimento
       e liberamos o microfone físico.

       A Máquina NÃO fica ouvindo
       enquanto o utilizador pediu
       para esperar.
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


    setMachineState(
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


    /*
       Se a Máquina estiver falando
       no futuro, a fala também será
       interrompida.
    */

    MachineVoice.stopSpeaking();


    stopRecognition();

    cleanupMicrophoneOnly();


    recognition =
        null;


    resetTurn();


    setMachineState(
        STATE.IDLE
    );
}


/* =====================================================
   LIMPAR MICROFONE
===================================================== */

function cleanupMicrophoneOnly() {

    microphoneActive =
        false;


    visualIntensity =
        0;


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

                track =>
                    track.stop()

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

    MachineVoice.stopSpeaking();


    stopRecognition();


    cleanupMicrophoneOnly();


    recognition =
        null;


    resetTurn();


    setMachineState(
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

            /*
               Um toque inicia a sessão.

               Outro toque encerra.

               A sessão de escuta não é
               desligada por pequenas pausas
               na fala.
            */

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


/* =====================================================
   DEBUG DA MACHINE VOICE
   -----------------------------------------------------
   Não inicia nenhuma voz.
   Serve apenas para confirmar que
   a camada foi carregada corretamente.
===================================================== */

console.log(
    "MachineVoice disponível:",
    MachineVoice
);

console.log(
    "Voz configurada:",
    MachineVoice.voice
);

console.log(
    "Idioma configurado:",
    MachineVoice.language
);
/* =====================================================
   MACHINE VOICE — V6.3
   MOTOR DE VOZ + FALLBACK GRATUITO

   IMPORTANTE:
   - Não controla o microfone.
   - Não controla o reconhecimento.
   - Não encerra a conversa.
   - Não altera a reação visual à voz.
   - Não usa API paga.
===================================================== */

const MachineVoice = {

    /* =================================================
       CONFIGURAÇÃO
    ================================================= */

    provider: "browser",

    voiceName: "",

    language: "pt-PT",

    gender: "male",

    speed: 0.95,

    pitch: 0.80,

    volume: 1.0,

    speaking: false,

    currentUtterance: null,


    /* =================================================
       LISTAR VOZES DISPONÍVEIS
    ================================================= */

    getVoices() {

        if (
            !("speechSynthesis" in window)
        ) {

            console.warn(
                "Speech Synthesis não disponível."
            );

            return [];
        }


        return window
            .speechSynthesis
            .getVoices();
    },


    /* =================================================
       ENCONTRAR VOZ
    ================================================= */

    findVoice() {

        const voices =
            this.getVoices();


        if (!voices.length) {

            return null;
        }


        /*
           Primeiro procuramos exatamente
           o idioma configurado.
        */

        let voice =
            voices.find(
                item =>
                    item.lang ===
                    this.language
            );


        /*
           Depois procuramos português
           independentemente da região.
        */

        if (!voice) {

            voice =
                voices.find(
                    item =>
                        item.lang
                            .toLowerCase()
                            .startsWith("pt")
                );
        }


        return voice || null;
    },


    /* =================================================
       CONFIGURAR
    ================================================= */

    configure(options = {}) {

        if (
            typeof options.language ===
            "string"
        ) {

            this.language =
                options.language;
        }


        if (
            typeof options.gender ===
            "string"
        ) {

            this.gender =
                options.gender;
        }


        if (
            typeof options.voiceName ===
            "string"
        ) {

            this.voiceName =
                options.voiceName;
        }


        if (
            typeof options.speed ===
            "number"
        ) {

            this.speed =
                Math.max(
                    0.5,
                    Math.min(
                        2,
                        options.speed
                    )
                );
        }


        if (
            typeof options.pitch ===
            "number"
        ) {

            this.pitch =
                Math.max(
                    0,
                    Math.min(
                        2,
                        options.pitch
                    )
                );
        }


        if (
            typeof options.volume ===
            "number"
        ) {

            this.volume =
                Math.max(
                    0,
                    Math.min(
                        1,
                        options.volume
                    )
                );
        }


        console.log(
            "MachineVoice configurada:",
            {
                provider:
                    this.provider,

                language:
                    this.language,

                gender:
                    this.gender,

                voiceName:
                    this.voiceName,

                speed:
                    this.speed,

                pitch:
                    this.pitch
            }
        );
    },


    /* =================================================
       FALAR
    ================================================= */

    speak(text) {

        return new Promise(
            (resolve, reject) => {

                const cleanText =
                    String(
                        text || ""
                    ).trim();


                if (!cleanText) {

                    resolve();

                    return;
                }


                if (
                    !("speechSynthesis" in window)
                ) {

                    console.warn(
                        "Este navegador não possui TTS."
                    );

                    resolve();

                    return;
                }


                /*
                   Evita duas falas simultâneas.
                */

                this.stopSpeaking();


                const utterance =
                    new SpeechSynthesisUtterance(
                        cleanText
                    );


                const selectedVoice =
                    this.findVoice();


                if (selectedVoice) {

                    utterance.voice =
                        selectedVoice;

                    utterance.lang =
                        selectedVoice.lang;

                } else {

                    utterance.lang =
                        this.language;
                }


                utterance.rate =
                    this.speed;


                utterance.pitch =
                    this.pitch;


                utterance.volume =
                    this.volume;


                this.currentUtterance =
                    utterance;


                utterance.onstart =
                    () => {

                        this.speaking =
                            true;


                        if (
                            typeof setMachineState ===
                            "function"
                        ) {

                            setMachineState(
                                STATE.SPEAKING
                            );
                        }


                        console.log(
                            "MachineVoice → falando"
                        );
                    };


                utterance.onend =
                    () => {

                        this.speaking =
                            false;

                        this.currentUtterance =
                            null;


                        if (
                            typeof setMachineState ===
                            "function"
                        ) {

                            if (
                                microphoneActive
                            ) {

                                setMachineState(
                                    STATE.LISTENING
                                );

                            } else {

                                setMachineState(
                                    STATE.IDLE
                                );
                            }
                        }


                        console.log(
                            "MachineVoice → terminou"
                        );


                        resolve();
                    };


                utterance.onerror =
                    (event) => {

                        this.speaking =
                            false;

                        this.currentUtterance =
                            null;


                        console.warn(
                            "MachineVoice:",
                            event.error
                        );


                        if (
                            typeof setMachineState ===
                            "function"
                        ) {

                            setMachineState(
                                microphoneActive
                                    ? STATE.LISTENING
                                    : STATE.IDLE
                            );
                        }


                        resolve();
                    };


                window
                    .speechSynthesis
                    .speak(
                        utterance
                    );
            }
        );
    },


    /* =================================================
       PARAR
    ================================================= */

    stopSpeaking() {

        if (
            !("speechSynthesis" in window)
        ) {

            return;
        }


        try {

            window
                .speechSynthesis
                .cancel();

        } catch (error) {

            console.warn(
                "Não foi possível parar a voz.",
                error
            );
        }


        this.speaking =
            false;


        this.currentUtterance =
            null;
    },


    /* =================================================
       ESTADO
    ================================================= */

    isSpeaking() {

        return this.speaking;
    }
};


/* =====================================================
   CONFIGURAÇÃO INICIAL

   Estes valores são apenas para teste.
   NÃO significam que esta será a voz definitiva.
===================================================== */

MachineVoice.configure({

    language: "pt-PT",

    gender: "male",

    speed: 0.95,

    pitch: 0.80,

    volume: 1.0
});


/* =====================================================
   CARREGAR VOZES DO NAVEGADOR
===================================================== */

if (
    "speechSynthesis" in window
) {

    window
        .speechSynthesis
        .addEventListener(
            "voiceschanged",
            function() {

                const voices =
                    MachineVoice.getVoices();


                console.log(
                    "Vozes disponíveis:",
                    voices
                );


                const portugueseVoices =
                    voices.filter(
                        voice =>
                            voice.lang
                                .toLowerCase()
                                .startsWith("pt")
                    );


                console.log(
                    "Vozes portuguesas:",
                    portugueseVoices
                );
            }
        );
}


/* =====================================================
   TESTE MANUAL
   -----------------------------------------------------
   Não é chamado automaticamente.
===================================================== */

window.testMachineVoice =
    function() {

        MachineVoice.speak(
            "Olá. Eu sou a Máquina. Estou aqui contigo."
        );
    };


console.log(
    "MachineVoice V6.3 carregada."
);
