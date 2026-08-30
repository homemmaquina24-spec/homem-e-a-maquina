/* =====================================================
   HOMEM E A MÁQUINA
   TELA PRINCIPAL V1.3
   PRESENÇA VIVA
===================================================== */

const machine = document.querySelector(".machine");
const voiceButton = document.querySelector(".test-voice");
const keyboardButton = document.querySelector(".test-keyboard");


/* =====================================================
   ESTADO
===================================================== */

let currentState = "idle";
let presenceTimer = null;


/* =====================================================
   ALTERAR ESTADO
===================================================== */

function setMachineState(state) {

    if (!machine) {
        return;
    }

    currentState = state;

    machine.dataset.state = state;
}


/* =====================================================
   PEQUENAS VARIAÇÕES DE PRESENÇA
===================================================== */

function subtlePresence() {

    if (currentState !== "idle") {
        return;
    }

    setMachineState("presence");

    setTimeout(() => {

        if (currentState === "presence") {
            setMachineState("idle");
        }

    }, 1800 + Math.random() * 1800);
}


/* =====================================================
   PRÓXIMA OBSERVAÇÃO
===================================================== */

function schedulePresence() {

    clearTimeout(presenceTimer);

    const delay =
        5000 +
        Math.random() * 9000;

    presenceTimer = setTimeout(() => {

        subtlePresence();

        schedulePresence();

    }, delay);
}


/* =====================================================
   ESCUTA
===================================================== */

function startListening() {

    setMachineState("listening");

}


/* =====================================================
   PRESENÇA AO ESCREVER
===================================================== */

function startWritingPresence() {

    setMachineState("presence");

}


/* =====================================================
   BOTÃO DE VOZ
===================================================== */

if (voiceButton) {

    voiceButton.addEventListener("click", () => {

        startListening();

    });

}


/* =====================================================
   BOTÃO DE TECLADO
===================================================== */

if (keyboardButton) {

    keyboardButton.addEventListener("click", () => {

        startWritingPresence();

    });

}


/* =====================================================
   INÍCIO
===================================================== */

setMachineState("idle");

schedulePresence();
