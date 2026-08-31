/* =====================================================
   HOMEM E A MÁQUINA
   VOZ V5 — MICROFONE ESTÁVEL

   OBJETIVO DESTA ETAPA:
   - Abrir o microfone uma única vez.
   - Não reiniciar o microfone durante silêncio.
   - Não gravar a sessão inteira.
   - Não criar sons pelo JavaScript.
   - Testar somente o ciclo de vida do áudio.
===================================================== */

const machine = document.querySelector(".machine");
const voiceButton = document.querySelector(".test-voice");


/* =====================================================
   ESTADO
===================================================== */

let audioStream = null;
let audioContext = null;
let analyser = null;
let microphoneSource = null;

let microphoneActive = false;
let animationFrame = null;


/* =====================================================
   CONFIGURAÇÃO
===================================================== */

const FFT_SIZE = 512;


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
   INICIAR MICROFONE
===================================================== */

async function startMicrophone() {

    /*
       Proteção contra chamadas duplicadas.
    */

    if (microphoneActive) {
        return;
    }


    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        console.error(
            "O navegador não disponibiliza acesso ao microfone."
        );

        return;
    }


    try {

        /*
           IMPORTANTE:

           getUserMedia é chamado apenas UMA VEZ
           para esta sessão.
        */

        audioStream =
            await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });


        /*
           Criar o contexto de áudio.
        */

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


        /*
           Analisador.

           Ele NÃO grava o áudio.
           Apenas permite medir o sinal
           em tempo real.
        */

        analyser =
            audioContext.createAnalyser();


        analyser.fftSize =
            FFT_SIZE;


        analyser.smoothingTimeConstant =
            0.75;


        /*
           Conectar o microfone ao analisador.
        */

        microphoneSource =
            audioContext.createMediaStreamSource(
                audioStream
            );


        microphoneSource.connect(
            analyser
        );


        microphoneActive =
            true;


        setMachineState(
            "listening"
        );


        console.log(
            "Microfone iniciado uma única vez."
        );


        monitorAudio();


    } catch (error) {

        console.error(
            "Erro ao acessar o microfone:",
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


    /*
       Calcular energia do sinal.
    */

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
       Intensidade visual.

       Isto não grava o áudio.
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
       Próxima leitura.
    */

    animationFrame =
        requestAnimationFrame(
            monitorAudio
        );
}


/* =====================================================
   ENCERRAR MICROFONE
===================================================== */

function cleanupMicrophone() {

    microphoneActive =
        false;


    /*
       Parar o monitoramento visual.
    */

    if (animationFrame) {

        cancelAnimationFrame(
            animationFrame
        );

        animationFrame = null;
    }


    /*
       Desconectar o analisador.
    */

    if (microphoneSource) {

        try {

            microphoneSource.disconnect();

        } catch (error) {

            console.log(
                "Fonte de áudio já desconectada."
            );
        }

        microphoneSource = null;
    }


    analyser = null;


    /*
       SOMENTE aqui liberamos
       o microfone físico.
    */

    if (audioStream) {

        audioStream
            .getTracks()
            .forEach(
                track => track.stop()
            );

        audioStream = null;
    }


    /*
       Fechar contexto de áudio.
    */

    if (audioContext) {

        try {

            audioContext.close();

        } catch (error) {

            console.log(
                "Contexto de áudio já encerrado."
            );
        }

        audioContext = null;
    }


    if (machine) {

        machine.style.setProperty(
            "--voice-intensity",
            "0"
        );
    }


    setMachineState(
        "idle"
    );


    console.log(
        "Microfone encerrado."
    );
}


/* =====================================================
   BOTÃO 🎙️
===================================================== */

if (voiceButton) {

    voiceButton.addEventListener(
        "click",
        async function() {

            if (
                microphoneActive
            ) {

                /*
                   Segundo toque:
                   encerra a sessão.
                */

                cleanupMicrophone();

            } else {

                /*
                   Primeiro toque:
                   inicia a sessão.
                */

                await startMicrophone();
            }

        }
    );
}


/* =====================================================
   ESTADO INICIAL
===================================================== */

setMachineState(
    "idle"
);
