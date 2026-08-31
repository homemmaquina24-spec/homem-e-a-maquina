/* =====================================================
   HOMEM E A MÁQUINA
   V6.4 — ÁUDIO ESTÁVEL + REAÇÃO À VOZ + MACHINE VOICE
===================================================== */


/* =====================================================
   ELEMENTOS
===================================================== */

const machine =
    document.querySelector(".machine");

const voiceButton =
    document.querySelector(".test-voice");


const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


/* =====================================================
   ESTADOS
===================================================== */

const STATE = {

    IDLE:
        "idle",

    LISTENING:
        "listening",

    THINKING:
        "thinking",

    SPEAKING:
        "speaking",

    WAITING:
        "waiting"
};


let state =
    STATE.IDLE;


/* =====================================================
   ÁUDIO
===================================================== */

let audioStream =
    null;

let audioContext =
    null;

let analyser =
    null;

let microphoneSource =
    null;

let animationFrame =
    null;

let microphoneActive =
    false;


/* =====================================================
   RECONHECIMENTO
===================================================== */

let recognition =
    null;

let recognitionRunning =
    false;

let recognitionWanted =
    false;

let finalTranscript =
    "";

let turnActive =
    false;


/* =====================================================
   CONFIGURAÇÃO
===================================================== */

const LANGUAGE =
    "pt-MZ";

const FFT_SIZE =
    512;


/* =====================================================
   REAÇÃO VISUAL
===================================================== */

const AUDIO_NOISE_FLOOR =
    0.008;

const AUDIO_VOICE_LEVEL =
    0.055;

let visualIntensity =
    0;


/* =====================================================
   ESTADO DA MÁQUINA
===================================================== */

function setMachineState(
    newState
) {

    state =
        newState;


    if (machine) {

        machine.dataset.state =
            newState;
    }


    console.log(
        "Estado:",
        newState
    );
}


/* =====================================================
   NORMALIZAÇÃO
===================================================== */

function normalizeText(
    text
) {

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

function isWaitingCommand(
    text
) {

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

function isResumeCommand(
    text
) {

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

function isCloseCommand(
    text
) {

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
        isCloseCommand(
            normalized
        )
    ) {

        resetTurn();

        closeConversation();

        return;
    }


    /* ---------------------------------------------
       ESPERA
    --------------------------------------------- */

    if (
        isWaitingCommand(
            normalized
        )
    ) {

        resetTurn();

        enterWaitingMode();

        return;
    }


    /* ---------------------------------------------
       RETOMAR
    --------------------------------------------- */

    if (
        isResumeCommand(
            normalized
        )
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
       A inteligência da Máquina
       será ligada posteriormente.
    */


    setTimeout(
        () => {

            if (
                microphoneActive &&
                state === STATE.THINKING
            ) {

                setMachineState(
                    STATE.LISTENING
                );
            }

        },
        500
    );


    resetTurn();
}


/* =====================================================
   RESETAR TURNO
===================================================== */

function resetTurn() {

    finalTranscript =
        "";

    turnActive =
        false;
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

            let transcript =
                "";


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

                    turnActive =
                        true;
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


            turnActive =
                true;


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
               Não reiniciamos automaticamente.
               Mantemos a estabilidade validada.
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


    if (!recognition) {

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
            await navigator.mediaDevices
                .getUserMedia({

                    audio: {

                        echoCancellation:
                            true,

                        noiseSuppression:
                            true,

                        autoGainControl:
                            true
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
            audioContext
                .createMediaStreamSource(
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
            value * value;
    }


    const level =
        Math.sqrt(
            total /
            data.length
        );


    const usableLevel =
        Math.max(
            0,
            level -
            AUDIO_NOISE_FLOOR
        );


    const targetIntensity =
        Math.min(
            1,
            usableLevel /
            AUDIO_VOICE_LEVEL
        );


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
       Se a Máquina estiver falando,
       a fala também será interrompida.
    */

    if (
        typeof MachineVoice !==
        "undefined"
    ) {

        MachineVoice.stopSpeaking();
    }


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

    if (
        typeof MachineVoice !==
        "undefined"
    ) {

        MachineVoice.stopSpeaking();
    }


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
               Um toque inicia.

               Outro toque encerra.

               Pequenas pausas na fala
               não desligam o microfone.
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
   MACHINE VOICE — V6.4
   FALLBACK GRATUITO DO NAVEGADOR
===================================================== */

const MachineVoice = {

    provider:
        "browser",

    voiceName:
        "",

    language:
        "pt-PT",

    gender:
        "male",

    speed:
        0.95,

    pitch:
        0.80,

    volume:
        1.0,

    speaking:
        false,

    currentUtterance:
        null,


    /* =================================================
       LISTAR VOZES
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
       CONFIGURAR
    ================================================= */

    configure(
        options = {}
    ) {

        if (
            typeof options.provider ===
            "string"
        ) {

            this.provider =
                options.provider;
        }


        if (
            typeof options.voiceName ===
            "string"
        ) {

            this.voiceName =
                options.voiceName;
        }


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
            typeof options.speed ===
            "number"
        ) {

            this.speed =
                Math.max(
                    0.1,
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
       ESCOLHER VOZ
    ================================================= */

    selectVoice() {

        const voices =
            this.getVoices();


        if (!voices.length) {

            return null;
        }


        if (this.voiceName) {

            const exact =
                voices.find(
                    voice =>
                        voice.name ===
                        this.voiceName
                );


            if (exact) {

                return exact;
            }
        }


        const language =
            this.language
                .toLowerCase();


        const languageVoices =
            voices.filter(
                voice =>
                    voice.lang
                        .toLowerCase()
                        .startsWith(
                            language
                                .split("-")[0]
                        )
            );


        if (!languageVoices.length) {

            return null;
        }


        /*
           Se o navegador fornecer
           indicação de género no nome,
           tentamos respeitar a escolha.
        */

        if (
            this.gender
        ) {

            const gender =
                this.gender
                    .toLowerCase();


            const genderVoice =
                languageVoices.find(
                    voice =>
                        voice.name
                            .toLowerCase()
                            .includes(gender)
                );


            if (genderVoice) {

                return genderVoice;
            }
        }


        return languageVoices[0];
    },


    /* =================================================
       FALAR
    ================================================= */

    speak(
        text
    ) {

        return new Promise(
            resolve => {

                if (
                    !text ||
                    !text.trim()
                ) {

                    resolve();

                    return;
                }


                if (
                    !("speechSynthesis" in window)
                ) {

                    console.warn(
                        "Speech Synthesis não disponível."
                    );

                    resolve();

                    return;
                }


                this.stopSpeaking();


                const utterance =
                    new SpeechSynthesisUtterance(
                        text
                    );


                const voice =
                    this.selectVoice();


                if (voice) {

                    utterance.voice =
                        voice;

                    utterance.lang =
                        voice.lang;

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
===================================================== */

MachineVoice.configure({

    language:
        "pt-PT",

    gender:
        "male",

    speed:
        0.95,

    pitch:
        0.80,

    volume:
        1.0
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
===================================================== */

window.testMachineVoice =
    function() {

        MachineVoice.speak(
            "Olá. Eu sou a Máquina. Estou aqui contigo."
        );
    };


/* =====================================================
   DEBUG
===================================================== */

console.log(
    "MachineVoice disponível:",
    MachineVoice
);

console.log(
    "Voz configurada:",
    MachineVoice.voiceName
);

console.log(
    "Idioma configurado:",
    MachineVoice.language
);

console.log(
    "MachineVoice V6.4 carregada."
);


/* =====================================================
   INICIAL
===================================================== */

setMachineState(
    STATE.IDLE
);
