/* =====================================================
   HOMEM E A MÁQUINA
   TELA PRINCIPAL V1.4
   PRESENÇA ORGÂNICA
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
   PRESENÇA ESPONTÂNEA
===================================================== */

function spontaneousPresence() {

    if (currentState !== "idle") {
        return;
    }

    setMachineState("presence");

    const duration =
        1400 +
        Math.random() * 2200;

    setTimeout(() => {

        if (currentState === "presence") {
            setMachineState("idle");
        }

    }, duration);
}


/* =====================================================
   AGENDAR PRÓXIMA VARIAÇÃO
===================================================== */

function schedulePresence() {

    clearTimeout(presenceTimer);

    const delay =
        5500 +
        Math.random() * 10500;

    presenceTimer = setTimeout(() => {

        spontaneousPresence();

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
   TECLADO
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
   INICIALIZAÇÃO
===================================================== */

setMachineState("idle");

schedulePresence();
