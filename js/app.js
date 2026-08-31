/* =====================================================
   HOMEM E A MÁQUINA
   VOZ V4 — SESSÃO CONTÍNUA / TURNOS / ESPERA

   PRINCÍPIOS:
   - Um toque inicia a sessão.
   - A sessão não é uma gravação contínua.
   - Cada intervenção é um turno separado.
   - Pausas curtas não encerram o turno.
   - O microfone não é desligado entre turnos.
   - "Espera" pausa a escuta.
   - "Voltei" retoma.
   - Comandos de encerramento terminam a sessão.
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

let recognition = null;

let conversationActive = false;

let recognitionRunning = false;

let turnActive = false;

let finalTranscript = "";

let restartRecognition = true;


/* =====================================================
   CONFIGURAÇÃO
===================================================== */

const LANGUAGE = "pt-MZ";

const RESTART_DELAY = 300;


/* =====================================================
   ALTERAR ESTADO
===================================================== */

function setState(newState) {

    state = newState;

    if (machine) {
        machine.dataset.state = newState;
    }

    console.log(
        "Estado da Máquina:",
        newState
    );
}


/* =====================================================
   SUPORTE
===================================================== */

function supported() {

    if (!SpeechRecognition) {

        console.error(
            "Este navegador não suporta reconhecimento de fala."
        );

        return false;
    }

    return true;
}


/* =====================================================
   NORMALIZAR TEXTO
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
   INTENÇÃO: ESPERA
===================================================== */

function isWaitingCommand(text) {

    const commands = [

        "espera",

        "espera maquina",

        "maquina espera",

        "espera um pouco",

        "espera um bocadinho",

        "volto ja",

        "fica em espera",

        "fica ai",

        "aguarda um pouco"

    ];

    return commands.some(
        command =>
            text === command ||
            text.includes(command)
    );
}


/* =====================================================
   INTENÇÃO: RETOMAR
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
   INTENÇÃO: ENCERRAR
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

        "ate logo maquina",

        "ate logo"

    ];

    return commands.some(
        command =>
            text === command ||
            text.includes(command)
    );
}


/* =====================================================
   INTENÇÃO: PARAR A FALA
===================================================== */

function isStopSpeakingCommand(text) {

    const commands = [

        "para de falar",

        "pare de falar",

        "podes parar de falar",

        "pode parar de falar",

        "espera maquina",

        "maquina espera"

    ];

    return commands.some(
        command =>
            text === command ||
            text.includes(command)
    );
}


/* =====================================================
   PROCESSAR TURNO
===================================================== */

function processTurn() {

    const text =
        finalTranscript.trim();

    if (!text) {

        resetTurn();

        setState(
            STATE.LISTENING
        );

        return;
    }


    console.log(
        "--------------------------------"
    );

    console.log(
        "TURNO DO HOMEM:"
    );

    console.log(text);

    console.log(
        "--------------------------------"
    );


    const normalized =
        normalizeText(text);


    /* ---------------------------------------------
       ENCERRAMENTO
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
       PARAR A FALA DA MÁQUINA
    --------------------------------------------- */

    if (
        isStopSpeakingCommand(normalized)
    ) {

        resetTurn();

        stopMachineSpeaking();

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

    setState(
        STATE.THINKING
    );


    /*
       IMPORTANTE:

       Ainda não existe IA nesta etapa.

       O texto abaixo representa o ponto
       exato onde futuramente entraremos com
       o processamento inteligente da Máquina.
    */

    console.log(
        "Turno separado para processamento."
    );


    /*
       Apenas para testar a transição
       de estados.
    */

    setTimeout(() => {

        if (
            conversationActive &&
            state === STATE.THINKING
        ) {

            setState(
                STATE.LISTENING
            );
        }

    }, 800);


    resetTurn();
}


/* =====================================================
   RESETAR TURNO
===================================================== */

function resetTurn() {

    turnActive = false;

    finalTranscript = "";
}


/* =====================================================
   CRIAR RECONHECIMENTO
===================================================== */

function createRecognition() {

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

            let newFinal = "";


            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {

                const result =
                    event.results[i];


                const transcript =
                    result[0]
                        .transcript
                        .trim();


                if (!transcript) {
                    continue;
                }


                if (
                    result.isFinal
                ) {

                    newFinal +=
                        transcript + " ";

                    turnActive = true;
                }
            }


            if (
                newFinal.trim()
            ) {

                finalTranscript +=
                    newFinal;
            }


            console.log(
                "Turno atual:",
                finalTranscript.trim()
            );
        };


    /* =================================================
       FALA COMEÇOU
    ================================================= */

    recognizer.onspeechstart =
        function() {

            if (
                !conversationActive ||
                state === STATE.WAITING
            ) {
                return;
            }


            turnActive = true;

            setState(
                STATE.LISTENING
            );

            console.log(
                "Fala detectada."
            );
        };


    /* =================================================
       FALA TERMINOU
    ================================================= */

    recognizer.onspeechend =
        function() {

            /*
               ATENÇÃO:

               Este evento NÃO encerra a sessão.

               Ele apenas informa que o navegador
               deixou de detectar fala naquele momento.

               O turno é processado apenas se
               realmente houver texto.
            */

            if (
                !conversationActive ||
                state === STATE.WAITING
            ) {
                return;
            }


            if (turnActive) {

                processTurn();
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
               Erros transitórios não encerram
               a sessão automaticamente.
            */

            if (
                event.error ===
                "aborted"
            ) {
                return;
            }
        };


    /* =================================================
       FIM INTERNO DO RECONHECIMENTO
    ================================================= */

    recognizer.onend =
        function() {

            recognitionRunning =
                false;


            console.log(
                "Reconhecimento terminou internamente."
            );


            /*
               Se a sessão continua ativa,
               tentamos reabrir somente o
               reconhecimento.

               NÃO estamos regravando a conversa.
            */

            if (
                conversationActive &&
                restartRecognition &&
                state !== STATE.WAITING
            ) {

                setTimeout(
                    startRecognition,
                    RESTART_DELAY
                );
            }
        };


    return recognizer;
}


/* =====================================================
   INICIAR RECONHECIMENTO
===================================================== */

function startRecognition() {

    if (
        !conversationActive ||
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


    try {

        recognition.start();

        recognitionRunning =
            true;

        setState(
            STATE.LISTENING
        );

        console.log(
            "Reconhecimento ativo."
        );

    } catch (error) {

        console.log(
            "Reconhecimento ainda não pode iniciar:",
            error
        );


        recognitionRunning =
            false;
    }
}


/* =====================================================
   DESPERTAR CONVERSA
===================================================== */

function startConversation() {

    if (!supported()) {
        return;
    }


    if (conversationActive) {
        return;
    }


    conversationActive =
        true;


    restartRecognition =
        true;


    resetTurn();


    recognition =
        createRecognition();


    setState(
        STATE.LISTENING
    );


    startRecognition();
}


/* =====================================================
   MODO ESPERA
===================================================== */

function enterWaitingMode() {

    console.log(
        "Máquina entrou em ESPERA."
    );


    setState(
        STATE.WAITING
    );


    /*
       O reconhecimento é parado.

       O microfone não fica sendo utilizado
       enquanto a pessoa pediu para esperar.
    */

    if (recognition) {

        try {

            recognition.stop();

        } catch (error) {

            console.log(
                "Reconhecimento já estava parado."
            );
        }
    }


    recognitionRunning =
        false;
}


/* =====================================================
   RETOMAR
===================================================== */

function resumeConversation() {

    if (
        !conversationActive
    ) {
        return;
    }


    setState(
        STATE.LISTENING
    );


    restartRecognition =
        true;


    startRecognition();
}


/* =====================================================
   PARAR FALA DA MÁQUINA
===================================================== */

function stopMachineSpeaking() {

    /*
       Nesta etapa a Máquina ainda não possui
       síntese de voz.

       Quando adicionarmos a voz real,
       esta função chamará speechSynthesis.cancel()
       ou o sistema de voz escolhido.
    */

    console.log(
        "Comando para interromper a fala recebido."
    );


    setState(
        STATE.LISTENING
    );
}


/* =====================================================
   ENCERRAR CONVERSA
===================================================== */

function closeConversation() {

    console.log(
        "Encerrando sessão."
    );


    conversationActive =
        false;


    restartRecognition =
        false;


    resetTurn();


    if (recognition) {

        try {

            recognition.stop();

        } catch (error) {

            console.log(
                "Reconhecimento já estava parado."
            );
        }
    }


    recognition =
        null;


    recognitionRunning =
        false;


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
        function() {

            if (
                !conversationActive
            ) {

                startConversation();

            } else {

                closeConversation();

            }

        }
    );
}


/* =====================================================
   ESTADO INICIAL
===================================================== */

setState(
    STATE.IDLE
);
