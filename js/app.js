/* =====================================================
   HOMEM E A MÁQUINA
   TESTE 03 — RECONHECIMENTO DE FALA POR TURNOS

   OBJETIVOS:
   - Um toque desperta a conversa
   - Microfone permanece aberto durante a sessão
   - Cada fala é tratada como um turno
   - Pausas não encerram a sessão
   - Novo turno não é misturado ao anterior
   - Comandos de encerramento são reconhecidos
   - Estrutura preparada para a futura inteligência
===================================================== */


const machine = document.querySelector(".machine");
const voiceButton = document.querySelector(".test-voice");


/* =====================================================
   RECONHECIMENTO DE VOZ
===================================================== */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


/* =====================================================
   ESTADO
===================================================== */

let recognition = null;

let conversationActive = false;

let machineSpeaking = false;

let currentTranscript = "";

let finalTranscript = "";

let turnActive = false;

let restartRecognition = true;


/* =====================================================
   CONFIGURAÇÃO
===================================================== */

const LANGUAGE = "pt-MZ";

const MAX_INTERIM_LENGTH = 1000;


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
   VERIFICAR SUPORTE
===================================================== */

function speechSupported() {

    if (!SpeechRecognition) {

        console.error(
            "O navegador não disponibiliza reconhecimento de fala."
        );

        return false;
    }

    return true;
}


/* =====================================================
   CRIAR RECONHECEDOR
===================================================== */

function createRecognition() {

    if (!speechSupported()) {
        return null;
    }


    const recognizer =
        new SpeechRecognition();


    /*
       Não queremos que uma pequena pausa
       termine a sessão inteira.
    */

    recognizer.continuous = true;


    /*
       Precisamos de resultados provisórios
       para acompanhar a fala enquanto ela acontece.
    */

    recognizer.interimResults = true;


    /*
       Idioma principal.
    */

    recognizer.lang = LANGUAGE;


    /*
       Uma alternativa é suficiente neste teste.
    */

    recognizer.maxAlternatives = 1;


    /* =================================================
       RESULTADO
    ================================================= */

    recognizer.onresult = function(event) {

        let interim = "";
        let newFinal = "";


        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {

            const result =
                event.results[i];


            const text =
                result[0].transcript.trim();


            if (!text) {
                continue;
            }


            if (result.isFinal) {

                newFinal +=
                    text + " ";

            } else {

                interim +=
                    text + " ";
            }
        }


        /*
           Resultado final pertence ao turno atual.
        */

        if (newFinal.trim()) {

            finalTranscript +=
                newFinal.trim() + " ";

            turnActive = true;

            setMachineState("listening");

        }


        /*
           Resultado provisório.
        */

        currentTranscript =
            (
                finalTranscript +
                interim
            ).trim();


        /*
           Limite apenas para impedir
           crescimento exagerado durante o teste.
        */

        if (
            currentTranscript.length >
            MAX_INTERIM_LENGTH
        ) {

            currentTranscript =
                currentTranscript.slice(
                    -MAX_INTERIM_LENGTH
                );

        }


        console.log(
            "Fala atual:",
            currentTranscript
        );
    };


    /* =================================================
       INÍCIO DA FALA
    ================================================= */

    recognizer.onspeechstart = function() {

        turnActive = true;

        setMachineState("listening");

        console.log(
            "Homem começou a falar."
        );
    };


    /* =================================================
       FIM DA FALA
    ================================================= */

    recognizer.onspeechend = function() {

        /*
           Isto significa apenas que o navegador
           detectou o fim deste momento de fala.

           NÃO encerramos a conversa.
        */

        console.log(
            "Pausa/fim deste momento de fala."
        );


        if (turnActive) {

            finishTurn();
        }
    };


    /* =================================================
       ERRO
    ================================================= */

    recognizer.onerror = function(event) {

        console.error(
            "Reconhecimento de fala:",
            event.error
        );


        /*
           Erros transitórios não encerram
           automaticamente a sessão.
        */

        if (
            event.error === "no-speech" ||
            event.error === "audio-capture" ||
            event.error === "network"
        ) {

            return;
        }
    };


    /* =================================================
       RECONHECIMENTO TERMINOU
    ================================================= */

    recognizer.onend = function() {

        console.log(
            "Reconhecimento terminou."
        );


        /*
           O navegador pode encerrar internamente
           o reconhecimento mesmo com a sessão ativa.

           Se a conversa continuar ativa,
           iniciamos novamente.
        */

        if (
            conversationActive &&
            restartRecognition
        ) {

            setTimeout(() => {

                try {

                    recognizer.start();

                } catch (error) {

                    /*
                       Evita erro caso o navegador
                       ainda esteja encerrando a sessão.
                    */

                    console.log(
                        "Reconhecimento aguardando reinício."
                    );
                }

            }, 250);
        }
    };


    return recognizer;
}


/* =====================================================
   TERMINAR UM TURNO
===================================================== */

function finishTurn() {

    const text =
        finalTranscript.trim();


    if (!text) {

        turnActive = false;

        return;
    }


    console.log(
        "================================"
    );

    console.log(
        "NOVO TURNO DO HOMEM:"
    );

    console.log(text);

    console.log(
        "================================"
    );


    /*
       =================================================
       COMANDOS DE CONTROLE
       =================================================
    */

    const normalized =
        normalizeText(text);


    /*
       Encerramento da sessão.
    */

    if (
        isCloseCommand(normalized)
    ) {

        handleCloseCommand();

        return;
    }


    /*
       Interrupção.
    */

    if (
        isStopCommand(normalized)
    ) {

        handleStopCommand();

        return;
    }


    /*
       =================================================
       FUTURO:
       AQUI ENTRARÁ A INTELIGÊNCIA DA MÁQUINA.

       Por enquanto apenas mostramos no console.
       Não estamos fingindo que a Máquina
       já compreendeu o significado.
       =================================================
    */

    setMachineState("thinking");


    console.log(
        "Turno separado e pronto para processamento."
    );


    /*
       Depois do processamento,
       a Máquina volta a escutar.
    */

    setTimeout(() => {

        if (conversationActive) {

            setMachineState("listening");
        }

    }, 700);


    /*
       Limpar o turno.
    */

    finalTranscript = "";

    currentTranscript = "";

    turnActive = false;
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
            ""
        )
        .trim();
}


/* =====================================================
   COMANDOS DE ENCERRAMENTO
===================================================== */

function isCloseCommand(text) {

    const commands = [

        "encerra a conversa",

        "encerrar a conversa",

        "podes encerrar a conversa",

        "pode encerrar a conversa",

        "fecha a conversa",

        "fechar a conversa",

        "fecha a sessao",

        "fechar a sessao",

        "encerra a sessao",

        "encerrar a sessao",

        "vamos parar por aqui",

        "ate logo maquina"

    ];


    return commands.some(
        command =>
            text.includes(command)
    );
}


/* =====================================================
   COMANDOS PARA PARAR A MÁQUINA DE FALAR
===================================================== */

function isStopCommand(text) {

    const commands = [

        "para",

        "pare",

        "podes parar",

        "pode parar",

        "para de falar",

        "pare de falar",

        "espera",

        "espera maquina",

        "maquina espera"

    ];


    return commands.some(
        command =>
            text.includes(command)
    );
}


/* =====================================================
   ENCERRAR SESSÃO
===================================================== */

function handleCloseCommand() {

    console.log(
        "Comando de encerramento reconhecido."
    );


    /*
       Primeiro impedimos o reinício automático.
    */

    restartRecognition = false;

    conversationActive = false;


    if (recognition) {

        try {

            recognition.stop();

        } catch (error) {

            console.log(
                "Reconhecimento já estava parado."
            );
        }
    }


    setMachineState("pause");


    finalTranscript = "";

    currentTranscript = "";

    turnActive = false;
}


/* =====================================================
   PARAR FALA DA MÁQUINA
===================================================== */

function handleStopCommand() {

    console.log(
        "Comando de interrupção reconhecido."
    );


    /*
       Neste momento ainda não temos
       síntese de voz real.

       Quando tivermos, esta função irá
       interromper imediatamente a fala.
    */

    machineSpeaking = false;

    setMachineState("listening");


    finalTranscript = "";

    currentTranscript = "";

    turnActive = false;
}


/* =====================================================
   INICIAR CONVERSA
===================================================== */

function startConversation() {

    if (!speechSupported()) {
        return;
    }


    if (conversationActive) {
        return;
    }


    conversationActive = true;

    restartRecognition = true;

    finalTranscript = "";

    currentTranscript = "";

    turnActive = false;


    recognition =
        createRecognition();


    if (!recognition) {
        return;
    }


    setMachineState("listening");


    try {

        recognition.start();

        console.log(
            "Sessão de conversa iniciada."
        );

    } catch (error) {

        console.error(
            "Não foi possível iniciar o reconhecimento:",
            error
        );

    }
}


/* =====================================================
   ENCERRAR MANUALMENTE
===================================================== */

function stopConversation() {

    conversationActive = false;

    restartRecognition = false;

    turnActive = false;


    if (recognition) {

        try {

            recognition.stop();

        } catch (error) {

            console.log(
                "Reconhecimento já estava parado."
            );
        }
    }


    recognition = null;

    finalTranscript = "";

    currentTranscript = "";


    setMachineState("idle");


    console.log(
        "Sessão encerrada manualmente."
    );
}


/* =====================================================
   BOTÃO 🎙️
===================================================== */

if (voiceButton) {

    voiceButton.addEventListener(
        "click",
        () => {

            if (conversationActive) {

                stopConversation();

            } else {

                startConversation();

            }

        }
    );
}


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

setMachineState("idle");
