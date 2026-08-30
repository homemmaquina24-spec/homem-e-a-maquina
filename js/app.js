/* =====================================================
   HOMEM E A MÁQUINA
   TELA PRINCIPAL V1
   CONTROLO VISUAL DA MÁQUINA
===================================================== */

const machine = document.querySelector(".machine");
const voiceButton = document.querySelector(".test-voice");
const keyboardButton = document.querySelector(".test-keyboard");


/* =========================
   ESTADO DA MÁQUINA
========================= */

function setMachineState(state) {

    if (!machine) {
        return;
    }

    machine.dataset.state = state;
}


/* =========================
   CICLO VISUAL DE DEMONSTRAÇÃO
========================= */

function startMachineDemo() {

    setMachineState("idle");

    setTimeout(() => {
        setMachineState("presence");
    }, 7000);

    setTimeout(() => {
        setMachineState("listening");
    }, 10000);

    setTimeout(() => {
        setMachineState("thinking");
    }, 15000);

    setTimeout(() => {
        setMachineState("speaking");
    }, 20000);

    setTimeout(() => {
        setMachineState("pause");
    }, 25000);

    setTimeout(() => {
        setMachineState("idle");
    }, 30000);
}


/* =========================
   REPETIR DEMONSTRAÇÃO
========================= */

function repeatDemo() {

    startMachineDemo();

    setInterval(() => {
        startMachineDemo();
    }, 37000);
}


/* =========================
   CONTROLO DO BOTÃO DE VOZ
========================= */

if (voiceButton) {

    voiceButton.addEventListener("click", () => {

        setMachineState("listening");

    });

}


/* =========================
   CONTROLO DO TECLADO
========================= */

if (keyboardButton) {

    keyboardButton.addEventListener("click", () => {

        setMachineState("presence");

    });

}


/* =========================
   INICIALIZAÇÃO
========================= */

startMachineDemo();
