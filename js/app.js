/* =====================================================
   HOMEM E A MÁQUINA
   TELA PRINCIPAL V1.2
   COMPORTAMENTO VISUAL DA MÁQUINA
===================================================== */

const machine = document.querySelector(".machine");
const voiceButton = document.querySelector(".test-voice");
const keyboardButton = document.querySelector(".test-keyboard");


/* =====================================================
   ESTADO ATUAL
===================================================== */

let currentState = "idle";


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
   CICLO DA PRESENÇA
===================================================== */

function machinePresenceCycle() {

    setMachineState("idle");

    setTimeout(() => {

        setMachineState("presence");

    }, 6500);


    setTimeout(() => {

        setMachineState("idle");

    }, 9500);
}


/* =====================================================
   DEMONSTRAÇÃO DE ESCUTA
===================================================== */

function demonstrateListening() {

    setMachineState("listening");


    setTimeout(() => {

        setMachineState("thinking");

    }, 4200);


    setTimeout(() => {

        setMachineState("speaking");

    }, 8200);


    setTimeout(() => {

        setMachineState("pause");

    }, 11800);


    setTimeout(() => {

        setMachineState("idle");

    }, 15000);
}


/* =====================================================
   CICLO AUTOMÁTICO
===================================================== */

function startPresence() {

    machinePresenceCycle();


    setTimeout(() => {

        demonstrateListening();

    }, 11000);
}


/* =====================================================
   BOTÃO DE VOZ
===================================================== */

if (voiceButton) {

    voiceButton.addEventListener("click", () => {

        setMachineState("listening");

    });

}


/* =====================================================
   BOTÃO DE TECLADO
===================================================== */

if (keyboardButton) {

    keyboardButton.addEventListener("click", () => {

        setMachineState("presence");

    });

}


/* =====================================================
   INÍCIO
===================================================== */

setMachineState("idle");

startPresence();


/* =====================================================
   REPETIÇÃO CONTROLADA
===================================================== */

setInterval(() => {

    if (currentState === "idle") {

        startPresence();

    }

}, 28000);
