/* =========================================================
   HOMEM E A MÁQUINA
   APP.JS
   PARTE 1
   NÚCLEO DA APLICAÇÃO + ESTADO + NAVEGAÇÃO
   ========================================================= */

const HM = (() => {

  "use strict";

  /* =======================================================
     CONFIGURAÇÃO PRINCIPAL
     ======================================================= */

  const CONFIG = {
    appName: "Homem e a Máquina",
    version: "1.0.0",
    defaultLanguage: "pt-MZ",
    defaultVoice: "duarte",

    screens: {
      machine: "screen-machine",
      conversation: "screen-conversation",
      creator: "screen-creator",
      accountAnalysis: "screen-account-analysis",
      contentAnalysis: "screen-content-analysis",
      audience: "screen-audience",
      trends: "screen-trends",
      strategy: "screen-strategy",
      ideas: "screen-ideas",
      scripts: "screen-scripts",
      images: "screen-images",
      videos: "screen-videos",
      planning: "screen-planning",
      accounts: "screen-accounts",
      myAccounts: "screen-my-accounts",
      authorizations: "screen-authorizations",
      metrics: "screen-metrics",
      results: "screen-results",
      resultDetails: "screen-result-details",
      autonomous: "screen-autonomous",
      evolution: "screen-evolution",
      settings: "screen-settings",
      account: "screen-account",
      profile: "screen-profile",
      voice: "screen-voice",
      language: "screen-language",
      conversationSettings: "screen-conversation-settings",
      privacy: "screen-privacy",
      appearance: "screen-appearance",
      terms: "screen-terms",
      plan: "screen-plan",
      planPro: "screen-plan-pro",
      planAutonomous: "screen-plan-autonomous",
      login: "screen-login",
      register: "screen-register",
      forgotPassword: "screen-forgot-password",
      termsAcceptance: "screen-terms-acceptance",
      keyboard: "screen-keyboard",
      resultView: "screen-result-view",
      connection: "screen-connection",
      confirmation: "screen-confirmation",
      createAccount: "screen-create-account",
      machineWork: "screen-machine-work",
      document: "screen-document",
      machineProfile: "screen-machine-profile"
    }
  };


  /* =======================================================
     ESTADO GLOBAL
     ======================================================= */

  const state = {

    initialized: false,

    screen: "machine",

    previousScreen: null,

    navigationHistory: [],

    language: CONFIG.defaultLanguage,

    voice: CONFIG.defaultVoice,

    machineState: "idle",

    isListening: false,

    isSpeaking: false,

    isThinking: false,

    isWaiting: false,

    isWorking: false,

    isPaused: false,

    isOnline: navigator.onLine,

    isAuthenticated: false,

    user: null,

    session: null,

    conversation: {
      active: false,
      continuous: true,
      lastUserMessage: "",
      lastMachineMessage: "",
      history: [],
      subject: null,
      intent: null
    },

    task: {
      active: false,
      type: null,
      status: "idle",
      progress: 0,
      result: null
    },

    preferences: {
      conversationMode: "natural",
      continuousConversation: true,
      pauseRecognition: true,
      voiceInterruption: true,
      voiceResponse: true,
      theme: "system",
      animations: true,
      reducedMotion: false
    },

    profile: {
      name: "",
      email: "",
      photo: ""
    },

    evolution: {
      stage: 1,
      progress: 0,
      nextStage: 2,
      permanentCapabilities: [],
      temporaryConcessions: []
    },

    creator: {
      niche: null,
      audience: null,
      goals: [],
      accounts: []
    },

    lastResult: null,

    error: null
  };


  /* =======================================================
     DOM
     ======================================================= */

  const DOM = {};

  function cacheDOM() {

    DOM.app = document.getElementById("app");

    DOM.machine = document.getElementById("machine");

    DOM.machineHomeButton =
      document.getElementById("machineHomeButton");

    DOM.settingsButton =
      document.getElementById("settingsButton");

    DOM.voiceButton =
      document.getElementById("voiceButton");

    DOM.keyboardButton =
      document.getElementById("keyboardButton");

    DOM.machineResponse =
      document.getElementById("machineResponse");

    DOM.machineStatusBar =
      document.getElementById("machineStatusBar");

    DOM.processingIndicator =
      document.getElementById("processingIndicator");

    DOM.globalToast =
      document.getElementById("globalToast");

    DOM.globalKeyboardLayer =
      document.getElementById("globalKeyboardLayer");

    DOM.globalVoiceLayer =
      document.getElementById("globalVoiceLayer");

    DOM.connectionIndicator =
      document.getElementById("connectionIndicator");

    DOM.appNavigation =
      document.getElementById("appNavigation");

    DOM.profileForm =
      document.getElementById("profileForm");

    DOM.profileName =
      document.getElementById("profileName");

    DOM.profileEmail =
      document.getElementById("profileEmail");

    DOM.profileFormMessage =
      document.getElementById("profileFormMessage");

    DOM.keyboardInput =
      document.getElementById("keyboardInput");

    DOM.keyboardCounter =
      document.getElementById("keyboardCounter");

    DOM.globalKeyboardInput =
      document.getElementById("globalKeyboardInput");

    DOM.globalKeyboardCounter =
      document.getElementById("globalKeyboardCounter");

    DOM.globalKeyboardSend =
      document.getElementById("globalKeyboardSend");

    DOM.voiceState =
      document.getElementById("voiceState");

    DOM.voiceHint =
      document.getElementById("voiceHint");
  }


  /* =======================================================
     UTILITÁRIOS
     ======================================================= */

  function $(selector, parent = document) {
    return parent.querySelector(selector);
  }

  function $$(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
  }

  function exists(element) {
    return element !== null && element !== undefined;
  }

  function normalizeText(text) {
    return String(text || "")
      .trim()
      .replace(/\s+/g, " ");
  }

  function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = String(text || "");
    return div.innerHTML;
  }


  /* =======================================================
     ESTADO DA MÁQUINA
     ======================================================= */

  const MACHINE_STATES = {
    IDLE: "idle",
    LISTENING: "listening",
    THINKING: "thinking",
    SPEAKING: "speaking",
    WAITING: "waiting",
    WORKING: "working",
    ERROR: "error"
  };


  function setMachineState(newState) {

    if (!newState) {
      newState = MACHINE_STATES.IDLE;
    }

    state.machineState = newState;

    state.isListening =
      newState === MACHINE_STATES.LISTENING;

    state.isThinking =
      newState === MACHINE_STATES.THINKING;

    state.isSpeaking =
      newState === MACHINE_STATES.SPEAKING;

    state.isWaiting =
      newState === MACHINE_STATES.WAITING;

    state.isWorking =
      newState === MACHINE_STATES.WORKING;

    if (DOM.machine) {
      DOM.machine.dataset.state = newState;
    }

    updateMachineStatus();
  }


  function updateMachineStatus() {

    if (!DOM.machineStatusBar) {
      return;
    }

    const labels = {
      idle: "Pronta",
      listening: "A ouvir",
      thinking: "A pensar",
      speaking: "A falar",
      waiting: "À espera",
      working: "A trabalhar",
      error: "Erro"
    };

    DOM.machineStatusBar.textContent =
      labels[state.machineState] || "Pronta";
  }


  /* =======================================================
     NAVEGAÇÃO
     ======================================================= */

  function getScreenElement(screenName) {

    const id = CONFIG.screens[screenName] || screenName;

    return document.getElementById(id);
  }


  function showScreen(screenName, options = {}) {

    const target = getScreenElement(screenName);

    if (!target) {
      console.warn(
        "[HM] Ecrã não encontrado:",
        screenName
      );
      return false;
    }

    const current = state.screen;

    if (
      current !== screenName &&
      !options.skipHistory
    ) {
      state.navigationHistory.push(current);
      state.previousScreen = current;
    }

    $$(".screen").forEach(screen => {
      screen.classList.remove("active");
    });

    target.classList.add("active");

    state.screen = screenName;

    updateNavigation();

    window.scrollTo({
      top: 0,
      behavior: "auto"
    });

    return true;
  }


  function goBack() {

    if (state.navigationHistory.length === 0) {
      return showScreen("machine", {
        skipHistory: true
      });
    }

    const previous =
      state.navigationHistory.pop();

    return showScreen(previous, {
      skipHistory: true
    });
  }


  function goHome() {

    state.navigationHistory = [];

    return showScreen("machine", {
      skipHistory: true
    });
  }


  function updateNavigation() {

    if (!DOM.appNavigation) {
      return;
    }

    const buttons =
      $$("button", DOM.appNavigation);

    buttons.forEach(button => {

      const target =
        button.dataset.screen ||
        button.dataset.navigate;

      button.classList.toggle(
        "active",
        target === state.screen
      );

    });
  }


  /* =======================================================
     TOAST
     ======================================================= */

  let toastTimer = null;

  function toast(message, type = "info") {

    if (!DOM.globalToast) {
      return;
    }

    clearTimeout(toastTimer);

    DOM.globalToast.textContent =
      normalizeText(message);

    DOM.globalToast.dataset.type = type;

    DOM.globalToast.classList.add("active");

    toastTimer = setTimeout(() => {
      DOM.globalToast.classList.remove("active");
    }, 3000);
  }


  /* =======================================================
     RESPOSTA DA MÁQUINA
     ======================================================= */

  function showMachineResponse(message) {

    if (!DOM.machineResponse) {
      return;
    }

    DOM.machineResponse.innerHTML =
      escapeHTML(message);

    DOM.machineResponse.classList.add("active");
  }


  function clearMachineResponse() {

    if (!DOM.machineResponse) {
      return;
    }

    DOM.machineResponse.textContent = "";

    DOM.machineResponse.classList.remove("active");
  }


  /* =======================================================
     PROCESSAMENTO
     ======================================================= */

  function setProcessing(active) {

    if (!DOM.processingIndicator) {
      return;
    }

    DOM.processingIndicator.classList.toggle(
      "active",
      Boolean(active)
    );
  }


  /* =======================================================
     CONVERSAÇÃO
     ======================================================= */

  function startConversation() {

    state.conversation.active = true;
    state.isPaused = false;

    setMachineState(
      MACHINE_STATES.LISTENING
    );

    toast("A Máquina está a ouvir.");
  }


  function pauseConversation() {

    state.isPaused = true;

    setMachineState(
      MACHINE_STATES.WAITING
    );

    toast("A Máquina está à espera.");
  }


  function resumeConversation() {

    state.isPaused = false;
    state.conversation.active = true;

    setMachineState(
      MACHINE_STATES.LISTENING
    );

    toast("A Máquina voltou a ouvir.");
  }


  function stopConversation() {

    state.conversation.active = false;
    state.isPaused = false;

    setMachineState(
      MACHINE_STATES.IDLE
    );
  }


  /* =======================================================
     INTERPRETAÇÃO INICIAL
     ======================================================= */

  function interpretMessage(text) {

    const message =
      normalizeText(text).toLowerCase();

    if (!message) {
      return {
        intent: "empty",
        subject: null,
        text: ""
      };
    }

    if (
      message.includes("espera máquina") ||
      message.includes("espera maquina") ||
      message.includes("volto já") ||
      message.includes("volto ja")
    ) {
      return {
        intent: "pause",
        subject: "conversation",
        text: message
      };
    }

    if (
      message === "voltei" ||
      message.includes("já voltei") ||
      message.includes("ja voltei")
    ) {
      return {
        intent: "resume",
        subject: "conversation",
        text: message
      };
    }

    if (
      message.includes("para máquina") ||
      message.includes("para maquina") ||
      message.includes("pára máquina") ||
      message.includes("pára maquina")
    ) {
      return {
        intent: "stop",
        subject: "conversation",
        text: message
      };
    }

    if (
      message.includes("analisa minha conta") ||
      message.includes("analisar minha conta") ||
      message.includes("analisa a minha conta")
    ) {
      return {
        intent: "analyze_account",
        subject: "creator_account",
        text: message
      };
    }

    if (
      message.includes("tendências") ||
      message.includes("tendencias") ||
      message.includes("o que está viral") ||
      message.includes("o que esta viral")
    ) {
      return {
        intent: "trends",
        subject: "trends",
        text: message
      };
    }

    if (
      message.includes("ideias de conteúdo") ||
      message.includes("ideias de conteudo") ||
      message.includes("cria ideias")
    ) {
      return {
        intent: "ideas",
        subject: "content",
        text: message
      };
    }

    if (
      message.includes("roteiro") ||
      message.includes("roteiros")
    ) {
      return {
        intent: "scripts",
        subject: "content",
        text: message
      };
    }

    if (
      message.includes("planejamento") ||
      message.includes("planeamento") ||
      message.includes("calendário") ||
      message.includes("calendario")
    ) {
      return {
        intent: "planning",
        subject: "content",
        text: message
      };
    }

    return {
      intent: "general_conversation",
      subject: "general",
      text: message
    };
  }


  /* =======================================================
     EXECUÇÃO DE MENSAGEM
     ======================================================= */

  async function processMessage(text) {

    const message = normalizeText(text);

    if (!message) {
      return;
    }

    state.conversation.lastUserMessage =
      message;

    state.conversation.history.push({
      role: "user",
      content: message,
      timestamp: Date.now()
    });

    const interpretation =
      interpretMessage(message);

    state.conversation.intent =
      interpretation.intent;

    state.conversation.subject =
      interpretation.subject;

    if (interpretation.intent === "pause") {
      pauseConversation();
      return;
    }

    if (interpretation.intent === "resume") {
      resumeConversation();
      return;
    }

    if (interpretation.intent === "stop") {
      stopConversation();
      return;
    }

    setMachineState(
      MACHINE_STATES.THINKING
    );

    setProcessing(true);

    try {

      const result =
        await routeIntent(interpretation);

      if (result) {
        state.lastResult = result;
      }

    } catch (error) {

      console.error(
        "[HM] Erro ao processar mensagem:",
        error
      );

      state.error = error;

      setMachineState(
        MACHINE_STATES.ERROR
      );

      toast(
        "Ocorreu um erro ao processar o pedido.",
        "error"
      );

    } finally {

      setProcessing(false);
    }
  }


  /* =======================================================
     ORQUESTRAÇÃO INICIAL
     ======================================================= */

  async function routeIntent(interpretation) {

    switch (interpretation.intent) {

      case "analyze_account":

        showScreen("accountAnalysis");

        return {
          type: "account_analysis",
          status: "pending",
          message:
            "Vou preparar a análise da conta."
        };


      case "trends":

        showScreen("trends");

        return {
          type: "trends",
          status: "pending",
          message:
            "Vou preparar a análise das tendências."
        };


      case "ideas":

        showScreen("ideas");

        return {
          type: "ideas",
          status: "pending",
          message:
            "Vou preparar ideias de conteúdo."
        };


      case "scripts":

        showScreen("scripts");

        return {
          type: "scripts",
          status: "pending",
          message:
            "Vou preparar os roteiros."
        };


      case "planning":

        showScreen("planning");

        return {
          type: "planning",
          status: "pending",
          message:
            "Vou preparar o planeamento."
        };


      case "general_conversation":

        showScreenResponse(
          "Estou contigo. Diz-me o que precisas."
        );

        return {
          type: "conversation",
          status: "ready"
        };


      default:

        showScreenResponse(
          "Entendi. Vou analisar o teu pedido."
        );

        return {
          type: "unknown",
          status: "pending"
        };
    }
  }


  function showScreenResponse(message) {

    showMachineResponse(message);

    state.conversation.lastMachineMessage =
      message;

    state.conversation.history.push({
      role: "machine",
      content: message,
      timestamp: Date.now()
    });

    setMachineState(
      MACHINE_STATES.SPEAKING
    );

    setTimeout(() => {

      if (
        state.conversation.active &&
        !state.isPaused
      ) {
        setMachineState(
          MACHINE_STATES.LISTENING
        );
      } else {
        setMachineState(
          MACHINE_STATES.IDLE
        );
      }

    }, 1200);
  }


  /* =======================================================
     EVENTOS BÁSICOS
     ======================================================= */

  function bindNavigationEvents() {

    $$(".back-button").forEach(button => {

      button.addEventListener("click", () => {
        goBack();
      });

    });


    $("[data-back]") &&
      $$("[data-back]").forEach(button => {

        button.addEventListener("click", () => {

          const target =
            button.dataset.back;

          if (target) {
            showScreen(target);
          } else {
            goBack();
          }

        });

      });


    $$("[data-screen]").forEach(button => {

      button.addEventListener("click", () => {

        const target =
          button.dataset.screen;

        if (target) {
          showScreen(target);
        }

      });

    });


    $$("[data-navigate]").forEach(button => {

      button.addEventListener("click", () => {

        const target =
          button.dataset.navigate;

        if (target) {
          showScreen(target);
        }

      });

    });
  }


  function bindMachineEvents() {

    if (DOM.machineHomeButton) {

      DOM.machineHomeButton
        .addEventListener("click", goHome);

    }


    if (DOM.settingsButton) {

      DOM.settingsButton
        .addEventListener("click", () => {
          showScreen("settings");
        });

    }


    if (DOM.voiceButton) {

      DOM.voiceButton
        .addEventListener("click", () => {

          if (state.isPaused) {
            resumeConversation();
            return;
          }

                    if (state.conversation.active) {
            pauseConversation();
            return;
          }

          startConversation();

        });

    }


    if (DOM.keyboardButton) {

      DOM.keyboardButton
        .addEventListener("click", () => {

          showScreen("keyboard");

        });

    }
  }


  /* =======================================================
     TECLADO
     ======================================================= */

  function bindKeyboardEvents() {

    const inputs = [
      DOM.keyboardInput,
      DOM.globalKeyboardInput
    ].filter(Boolean);

    inputs.forEach(input => {

      input.addEventListener("input", () => {

        const counter =
          input === DOM.keyboardInput
            ? DOM.keyboardCounter
            : DOM.globalKeyboardCounter;

        if (counter) {
          counter.textContent =
            input.value.length;
        }

      });


      input.addEventListener("keydown", event => {

        if (
          event.key === "Enter" &&
          !event.shiftKey
        ) {

          event.preventDefault();

          processMessage(input.value);

          input.value = "";

        }

      });

    });


    if (DOM.globalKeyboardSend) {

      DOM.globalKeyboardSend
        .addEventListener("click", () => {

          if (!DOM.globalKeyboardInput) {
            return;
          }

          const value =
            DOM.globalKeyboardInput.value;

          processMessage(value);

          DOM.globalKeyboardInput.value = "";

        });

    }
  }


  /* =======================================================
     CONEXÃO
     ======================================================= */

  function updateConnectionState() {

    state.isOnline = navigator.onLine;

    document.body.classList.toggle(
      "is-online",
      state.isOnline
          );

    document.body.classList.toggle(
      "is-offline",
      !state.isOnline
    );

    if (DOM.connectionIndicator) {

      DOM.connectionIndicator
        .setAttribute(
          "data-status",
          state.isOnline
            ? "online"
            : "offline"
        );

    }
  }


  /* =======================================================
     EVENTOS DE INTERNET
     ======================================================= */

  function bindConnectionEvents() {

    window.addEventListener(
      "online",
      updateConnectionState
    );

    window.addEventListener(
      "offline",
      updateConnectionState
    );

    updateConnectionState();
  }


  /* =======================================================
     INICIALIZAÇÃO
     ======================================================= */

  function initialize() {

    if (state.initialized) {
      return;
    }

    cacheDOM();

    bindNavigationEvents();

    bindMachineEvents();

    bindKeyboardEvents();

    bindConnectionEvents();

    setMachineState(
      MACHINE_STATES.IDLE
    );

    showScreen(
      "machine",
      {
        skipHistory: true
      }
    );

    state.initialized = true;

    console.log(
      `[HM] ${CONFIG.appName} ${CONFIG.version} iniciado.`
    );
  }


  /* =======================================================
     API INTERNA
     ======================================================= */

  return {

    CONFIG,
    state,
    DOM,
    MACHINE_STATES,

    initialize,

    showScreen,
         goBack,
    goHome,

    setMachineState,

    startConversation,
    pauseConversation,
    resumeConversation,
    stopConversation,

    processMessage,

    toast,

    showMachineResponse,
    clearMachineResponse,

    getScreenElement
  };

})();


/* =========================================================
   INICIALIZAÇÃO DA APLICAÇÃO
   ========================================================= */

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    () => HM.initialize(),
    { once: true }
  );

} else {

  HM.initialize();

     }
/* =========================================================
   HOMEM E A MÁQUINA
   APP.JS — PARTE 2
   CONTROLO DE NAVEGAÇÃO E INTERFACE
   ========================================================= */


/* =========================================================
   NAVEGAÇÃO ENTRE ECRÃS
   ========================================================= */

function navigateTo(screen, options = {}) {

  if (!window.HM) {
    return false;
  }

  return HM.showScreen(screen, options);
}


function navigateBack() {

  if (!window.HM) {
    return false;
  }

  return HM.goBack();
}


function navigateHome() {

  if (!window.HM) {
    return false;
  }

  return HM.goHome();
}


/* =========================================================
   ABRIR ECRÃ ATRAVÉS DE DATA-ACTION
   ========================================================= */

function handleNavigationAction(element) {

  if (!element) {
    return;
  }

  const screen =
    element.dataset.screen ||
    element.dataset.navigate ||
    element.dataset.target;

  if (!screen) {
    return;
  }

  navigateTo(screen);
}


/* =========================================================
   EVENTOS GLOBAIS DE NAVEGAÇÃO
   ========================================================= */

document.addEventListener("click", event => {

  const navigationElement =
    event.target.closest(
      "[data-screen], [data-navigate], [data-target]"
    );

  if (!navigationElement) {
    return;
  }

  if (
    navigationElement.classList.contains(
      "back-button"
    )
  ) {
    return;
  }

  handleNavigationAction(
    navigationElement
  );

});


/* =========================================================
   BOTÕES DE VOLTAR
   ========================================================= */

document.addEventListener("click", event => {

  const button =
    event.target.closest(
      ".back-button"
    );

  if (!button) {
    return;
  }

  const explicitBack =
    button.dataset.back;

  if (explicitBack) {

    navigateTo(
      explicitBack,
      {
        skipHistory: true
      }
    );

    return;
  }

  navigateBack();

});


/* =========================================================
   ATUALIZAÇÃO DO TÍTULO DO DOCUMENTO
   ========================================================= */

const screenTitles = {

  machine:
    "Homem e a Máquina",

  conversation:
    "Conversação",

  creator:
    "Criador",

  accountAnalysis:
    "Análise da Conta",

  contentAnalysis:
    "Análise de Conteúdo",

  audience:
    "Público",

  trends:
    "Tendências",

  strategy:
    "Estratégia",

  ideas:
    "Ideias",

  scripts:
    "Roteiros",

  images:
    "Imagens",

  videos:
    "Vídeos",

  planning:
    "Planeamento",

  accounts:
    "Contas",

  myAccounts:
    "Minhas Contas",

  authorizations:
    "Autorizações",

  metrics:
    "Métricas",

  results:
    "Resultados",

  resultDetails:
    "Detalhes do Resultado",

  autonomous:
    "Modo Autónomo",

  evolution:
    "Evolução da Máquina",

  settings:
    "Configurações",

  account:
    "Conta",

  profile:
    "Perfil",

  voice:
    "Voz",

  language:
    "Idioma",

  conversationSettings:
    "Conversação",

  privacy:
    "Privacidade",

  appearance:
    "Aparência",

  terms:
    "Termos",

  plan:
    "Plano",

  planPro:
    "Plano Pro",

  planAutonomous:
    "Máquina Autónoma",

  login:
    "Entrar",

  register:
    "Criar Conta",

  forgotPassword:
    "Recuperar Palavra-passe",

  keyboard:
    "Escrever",

  resultView:
    "Resultado",

  connection:
    "Ligação",

  createAccount:
    "Criar Conta",

  machineWork:
    "A Máquina está a trabalhar",

  document:
    "Documento",

  machineProfile:
    "Perfil da Máquina"
};


function updateDocumentTitle() {

  if (!window.HM) {
    return;
  }

  const title =
    screenTitles[HM.state.screen] ||
    "Homem e a Máquina";

  document.title =
    `${title} — Homem e a Máquina`;
}


/* =========================================================
   OBSERVADOR DE NAVEGAÇÃO
   ========================================================= */

function watchNavigation() {

  if (!window.HM) {
    return;
  }

  let lastScreen =
    HM.state.screen;

  setInterval(() => {

    if (
      HM.state.screen !== lastScreen
    ) {

      lastScreen =
        HM.state.screen;

      updateDocumentTitle();

    }

  }, 100);

}


/* =========================================================
   ABRIR CONVERSAÇÃO
   ========================================================= */

function openConversation() {

  navigateTo("conversation");

  if (
    HM.state.conversation &&
    !HM.state.conversation.active
  ) {
    HM.startConversation();
  }
}


/* =========================================================
   ABRIR TECLADO
   ========================================================= */

function openKeyboard() {

  navigateTo("keyboard");

  const input =
    document.getElementById(
      "keyboardInput"
    );

  if (input) {

    setTimeout(() => {
      input.focus();
    }, 100);

  }
}


/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

function openSettings() {
  navigateTo("settings");
}


function openProfile() {
  navigateTo("profile");
}


function openVoiceSettings() {
  navigateTo("voice");
}


function openLanguageSettings() {
  navigateTo("language");
}


function openConversationSettings() {
  navigateTo("conversationSettings");
}


function openPrivacySettings() {
  navigateTo("privacy");
}


function openAppearanceSettings() {
  navigateTo("appearance");
}


function openPlan() {
  navigateTo("plan");
}


/* =========================================================
   ÁREA DO CRIADOR
   ========================================================= */

function openCreator() {
  navigateTo("creator");
}


function openAccountAnalysis() {
  navigateTo("accountAnalysis");
}


function openContentAnalysis() {
  navigateTo("contentAnalysis");
}


function openAudience() {
  navigateTo("audience");
}


function openTrends() {
  navigateTo("trends");
}


function openStrategy() {
  navigateTo("strategy");
}


function openIdeas() {
  navigateTo("ideas");
}


function openScripts() {
  navigateTo("scripts");
}


function openImages() {
  navigateTo("images");
}


function openVideos() {
  navigateTo("videos");
}


function openPlanning() {
  navigateTo("planning");
}


/* =========================================================
   ÁREA DE CONTAS
   ========================================================= */

function openAccounts() {
  navigateTo("accounts");
}


function openMyAccounts() {
  navigateTo("myAccounts");
}


function openAuthorizations() {
  navigateTo("authorizations");
}


function openMetrics() {
  navigateTo("metrics");
}


/* =========================================================
   RESULTADOS
   ========================================================= */

function openResults() {
  navigateTo("results");
}


function openResultDetails() {
  navigateTo("resultDetails");
}


function openResultView() {
  navigateTo("resultView");
}


/* =========================================================
   EVOLUÇÃO
   ========================================================= */

function openEvolution() {
  navigateTo("evolution");
}


function openAutonomousMode() {
  navigateTo("autonomous");
}


/* =========================================================
   INICIALIZAÇÃO DESTE MÓDULO
   ========================================================= */

updateDocumentTitle();

watchNavigation();


/* =========================================================
   FIM DA PARTE 2
   ========================================================= */
/* =========================================================
   HOMEM E A MÁQUINA
   APP.JS — PARTE 3
   PERFIL + PREFERÊNCIAS + CONFIGURAÇÕES
   ========================================================= */


/* =========================================================
   PERFIL DO UTILIZADOR
   ========================================================= */

function loadProfile() {

  const profile =
    HM.state.profile;

  const nameInput =
    document.getElementById(
      "profileName"
    );

  const emailInput =
    document.getElementById(
      "profileEmail"
    );

  if (nameInput) {
    nameInput.value =
      profile.name || "";
  }

  if (emailInput) {
    emailInput.value =
      profile.email || "";
  }
}


function saveProfile() {

  const nameInput =
    document.getElementById(
      "profileName"
    );

  const message =
    document.getElementById(
      "profileFormMessage"
    );

  if (!nameInput) {
    return;
  }

  const name =
    nameInput.value.trim();

  if (!name) {

    if (message) {
      message.textContent =
        "Introduz o teu nome.";
    }

    return;
  }

  HM.state.profile.name =
    name;

  if (message) {
    message.textContent =
      "Perfil atualizado.";
  }

  HM.toast(
    "O teu perfil foi atualizado.",
    "success"
  );
}


/* =========================================================
   EVENTO DO PERFIL
   ========================================================= */

document.addEventListener(
  "submit",
  event => {

    if (
      event.target.id !==
      "profileForm"
    ) {
      return;
    }

    event.preventDefault();

    saveProfile();

  }
);


/* =========================================================
   PREFERÊNCIA DE VOZ
   ========================================================= */

const voiceOptions =
  document.querySelectorAll(
    "[data-voice]"
  );


voiceOptions.forEach(option => {

  option.addEventListener(
    "click",
    () => {

      const voice =
        option.dataset.voice;

      if (!voice) {
        return;
      }

      HM.state.voice =
        voice;

      voiceOptions.forEach(item => {
        item.classList.remove(
          "active"
        );
      });

      option.classList.add(
        "active"
      );

      HM.toast(
        "Voz selecionada.",
        "success"
      );
    }
  );

});


/* =========================================================
   PREFERÊNCIA DE IDIOMA
   ========================================================= */

const languageOptions =
  document.querySelectorAll(
    "[data-language]"
  );


languageOptions.forEach(option => {

  option.addEventListener(
    "click",
    () => {

      const language =
        option.dataset.language;

      if (!language) {
        return;
      }

      HM.state.language =
        language;

      languageOptions.forEach(item => {
        item.classList.remove(
          "active"
        );
      });

      option.classList.add(
        "active"
      );

      HM.toast(
        "Idioma atualizado.",
        "success"
      );

    }
  );

});


/* =========================================================
   MODO DE CONVERSAÇÃO
   ========================================================= */

const conversationModes =
  document.querySelectorAll(
    "[data-conversation-mode]"
  );


conversationModes.forEach(option => {

  option.addEventListener(
    "click",
    () => {

      const mode =
        option.dataset.conversationMode;

      if (!mode) {
        return;
      }

      HM.state.preferences
        .conversationMode = mode;

      conversationModes.forEach(item => {
        item.classList.remove(
          "active"
        );
      });

      option.classList.add(
        "active"
      );

      HM.toast(
        "Modo de conversação atualizado.",
        "success"
      );

    }
  );

});


/* =========================================================
   TEMA
   ========================================================= */

function applyTheme(theme) {

  document.body.classList.remove(
    "light-theme"
  );

  if (theme === "light") {
    document.body.classList.add(
      "light-theme"
    );
  }

  if (theme === "system") {

    const prefersLight =
      window.matchMedia &&
      window.matchMedia(
        "(prefers-color-scheme: light)"
      ).matches;

    if (prefersLight) {
      document.body.classList.add(
        "light-theme"
      );
    }
  }

  HM.state.preferences.theme =
    theme;
}


const appearanceOptions =
  document.querySelectorAll(
    "[data-theme]"
  );


appearanceOptions.forEach(option => {

  option.addEventListener(
    "click",
    () => {

      const theme =
        option.dataset.theme;

      if (!theme) {
        return;
      }

      appearanceOptions.forEach(item => {
        item.classList.remove(
          "active"
        );
      });

      option.classList.add(
        "active"
      );

      applyTheme(theme);

    }
  );

});


/* =========================================================
   TOGGLES DE CONFIGURAÇÃO
   ========================================================= */

function bindToggle(
  selector,
  stateKey
) {

  const elements =
    document.querySelectorAll(
      selector
    );

  elements.forEach(element => {

    element.addEventListener(
      "change",
      () => {

        HM.state.preferences[
          stateKey
        ] = element.checked;

      }
    );

  });
}


bindToggle(
  "[data-setting='continuousConversation']",
  "continuousConversation"
);

bindToggle(
  "[data-setting='pauseRecognition']",
  "pauseRecognition"
);

bindToggle(
  "[data-setting='voiceInterruption']",
  "voiceInterruption"
);

bindToggle(
  "[data-setting='voiceResponse']",
  "voiceResponse"
);

bindToggle(
  "[data-setting='animations']",
  "animations"
);

bindToggle(
  "[data-setting='reducedMotion']",
  "reducedMotion"
);


/* =========================================================
   CARREGAR PERFIL QUANDO ABRIR O ECRÃ
   ========================================================= */

document.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        "[data-screen='profile']"
      );

    if (!button) {
      return;
    }

    setTimeout(
      loadProfile,
      50
    );

  }
);


/* =========================================================
   FIM DA PARTE 3
   ========================================================= */
/* =========================================================
   HOMEM E A MÁQUINA
   APP.JS — PARTE 4
   VOZ + SÍNTESE + RECONHECIMENTO DE FALA
   ========================================================= */


/* =========================================================
   CONFIGURAÇÃO DAS VOZES
   ========================================================= */

const MACHINE_VOICES = {

  duarte: {
    name: "Duarte",
    pitch: -10,
    rate: 0.90,
    volume: 1
  },

  antonio: {
    name: "António",
    pitch: -5,
    rate: 0.92,
    volume: 1
  },

  "female-1": {
    name: "Voz 3",
    pitch: 0,
    rate: 0.95,
    volume: 1
  },

  "female-2": {
    name: "Voz 4",
    pitch: 2,
    rate: 0.95,
    volume: 1
  }

};


/* =========================================================
   SÍNTESE DE VOZ
   ========================================================= */

const speechSynthesisController = {

  supported:
    "speechSynthesis" in window,

  speaking: false,

  voices: [],

  loadVoices() {

    if (!this.supported) {
      return;
    }

    this.voices =
      window.speechSynthesis
        .getVoices();

  },

  findVoice() {

    const language =
      HM.state.language || "pt-MZ";

    const voices =
      this.voices.length
        ? this.voices
        : window.speechSynthesis.getVoices();

    return (
      voices.find(
        voice =>
          voice.lang === language
      ) ||
      voices.find(
        voice =>
          voice.lang.startsWith(
            language.split("-")[0]
          )
      ) ||
      voices.find(
        voice =>
          voice.lang.startsWith("pt")
      ) ||
      voices[0] ||
      null
    );
  },

  stop() {

    if (!this.supported) {
      return;
    }

    window.speechSynthesis.cancel();

    this.speaking = false;

    if (
      HM.state.machineState ===
      HM.MACHINE_STATES.SPEAKING
    ) {
      HM.setMachineState(
        HM.MACHINE_STATES.IDLE
      );
    }
  },

  speak(text) {

    if (!this.supported) {
      return Promise.resolve();
    }

    const message =
      String(text || "").trim();

    if (!message) {
      return Promise.resolve();
    }

    this.stop();

    const selected =
      MACHINE_VOICES[
        HM.state.voice
      ] ||
      MACHINE_VOICES.duarte;

    const utterance =
      new SpeechSynthesisUtterance(
        message
      );

    const voice =
      this.findVoice();

    if (voice) {
      utterance.voice = voice;
    }

    utterance.lang =
      HM.state.language;

    utterance.pitch =
      selected.pitch;

    utterance.rate =
      selected.rate;

    utterance.volume =
      selected.volume;

    this.speaking = true;

    HM.setMachineState(
      HM.MACHINE_STATES.SPEAKING
    );

    return new Promise(resolve => {

      utterance.onend = () => {

        this.speaking = false;

        resolve();

        if (
          HM.state.conversation.active &&
          !HM.state.isPaused
        ) {
          HM.setMachineState(
            HM.MACHINE_STATES.LISTENING
          );
        } else {
          HM.setMachineState(
            HM.MACHINE_STATES.IDLE
          );
        }

      };

      utterance.onerror = error => {

        console.warn(
          "[HM] Erro na voz:",
          error
        );

        this.speaking = false;

        resolve();

        HM.setMachineState(
          HM.MACHINE_STATES.IDLE
        );

      };

      window.speechSynthesis
        .speak(utterance);

    });
  }
};


/* =========================================================
   CARREGAR VOZES DISPONÍVEIS
   ========================================================= */

if (
  "speechSynthesis" in window
) {

  speechSynthesisController
    .loadVoices();

  window.speechSynthesis
    .onvoiceschanged = () => {

      speechSynthesisController
        .loadVoices();

    };
}


/* =========================================================
   RECONHECIMENTO DE FALA
   ========================================================= */

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;


const speechRecognitionController = {

  supported:
    Boolean(SpeechRecognition),

  recognition: null,

  active: false,

  restarting: false,

  init() {

    if (!this.supported) {
      return false;
    }

    this.recognition =
      new SpeechRecognition();

    this.recognition.lang =
      HM.state.language;

    this.recognition.continuous =
      true;

    this.recognition.interimResults =
      true;

    this.recognition.maxAlternatives =
      1;

    this.bindEvents();

    return true;
  },

  bindEvents() {

    if (!this.recognition) {
      return;
    }

    this.recognition.onstart = () => {

      this.active = true;

      HM.state.isListening = true;

      HM.setMachineState(
        HM.MACHINE_STATES.LISTENING
      );

    };


    this.recognition.onresult =
      event => {

        let finalText = "";

        for (
          let i = event.resultIndex;
          i < event.results.length;
          i++
        ) {

          const result =
            event.results[i];

          if (
            result.isFinal
          ) {

            finalText +=
              result[0].transcript;

          }

        }

        finalText =
          finalText.trim();

        if (finalText) {

          HM.processMessage(
            finalText
          );

        }

      };


    this.recognition.onerror =
      event => {

        console.warn(
          "[HM] Reconhecimento:",
          event.error
        );

        if (
          event.error ===
          "not-allowed"
        ) {

          HM.toast(
            "O acesso ao microfone foi bloqueado.",
            "error"
          );

          this.active = false;

          HM.setMachineState(
            HM.MACHINE_STATES.ERROR
          );
        }

      };


    this.recognition.onend = () => {

      this.active = false;

      if (
        HM.state.conversation.active &&
        !HM.state.isPaused &&
        HM.state.preferences
          .continuousConversation
      ) {

        this.restart();

      } else {

        HM.setMachineState(
          HM.MACHINE_STATES.IDLE
        );

      }

    };
  },

  start() {

    if (!this.supported) {

      HM.toast(
        "O reconhecimento de voz não é suportado neste navegador.",
        "error"
      );

      return false;
    }

    if (!this.recognition) {
      this.init();
    }

    if (this.active) {
      return true;
    }

    this.recognition.lang =
      HM.state.language;

    try {

      this.recognition.start();

      return true;

    } catch (error) {

      console.warn(
        "[HM] Não foi possível iniciar o microfone:",
        error
      );

      return false;
    }
  },

  stop() {

    if (
      !this.recognition ||
      !this.active
    ) {
      return;
    }

    try {
      this.recognition.stop();
    } catch (error) {
      console.warn(
        "[HM] Erro ao parar reconhecimento:",
        error
      );
    }

    this.active = false;
  },

  restart() {

    if (this.restarting) {
      return;
    }

    this.restarting = true;

    setTimeout(() => {

      this.restarting = false;

      if (
        HM.state.conversation.active &&
        !HM.state.isPaused
      ) {
        this.start();
      }

    }, 350);
  }
};


/* =========================================================
   CONECTAR VOZ À CONVERSAÇÃO
   ========================================================= */

function startMachineVoice() {

  if (
    !HM.state.conversation.active
  ) {
    HM.startConversation();
  }

  speechRecognitionController.start();
}


function pauseMachineVoice() {

  speechRecognitionController.stop();

  HM.pauseConversation();
}


function stopMachineVoice() {

  speechRecognitionController.stop();

  speechSynthesisController.stop();

  HM.stopConversation();
}


/* =========================================================
   BOTÃO PRINCIPAL DE VOZ
   ========================================================= */

if (HM.DOM.voiceButton) {

  HM.DOM.voiceButton
    .addEventListener(
      "click",
      () => {

        if (
          HM.state.isPaused
        ) {

          HM.resumeConversation();

          speechRecognitionController
            .start();

          return;
        }

        if (
          HM.state.conversation.active
        ) {

          pauseMachineVoice();

        } else {

          startMachineVoice();

        }

      }
    );
}


/* =========================================================
   FIM DA PARTE 4
   ========================================================= */
/* =========================================================
   HOMEM E A MÁQUINA
   app.js — PARTE 5
   ORQUESTRAÇÃO • CONTEXTO • TAREFAS • RESULTADOS
   ========================================================= */

(function () {
  "use strict";

  const HM = window.HM;

  if (!HM) {
    console.error("HM não foi inicializado.");
    return;
  }

  /* =========================================================
     1. CONTEXTO DA CONVERSA
     ========================================================= */

  HM.context = {
    currentSubject: null,
    currentIntent: null,
    lastQuestion: null,
    lastAnswer: null,
    lastResult: null,
    lastScreen: null,
    entities: {},
    pendingAction: null,

    set(subject, intent, message) {
      this.currentSubject = subject || this.currentSubject;
      this.currentIntent = intent || this.currentIntent;
      this.lastQuestion = message || this.lastQuestion;

      if (HM.state && HM.state.conversation) {
        HM.state.conversation.subject = this.currentSubject;
        HM.state.conversation.intent = this.currentIntent;
      }
    },

    setAnswer(answer) {
      this.lastAnswer = answer || null;
    },

    setResult(result) {
      this.lastResult = result || null;

      if (HM.state) {
        HM.state.lastResult = result || null;
      }
    },

    clearPending() {
      this.pendingAction = null;
    }
  };


  /* =========================================================
     2. MEMÓRIA DE CONVERSAÇÃO
     ========================================================= */

  HM.memory = {
    addUserMessage(message) {
      if (!message) return;

      if (!HM.state.conversation.history) {
        HM.state.conversation.history = [];
      }

      HM.state.conversation.history.push({
        role: "user",
        content: message,
        timestamp: Date.now()
      });

      this.limit();
    },

    addMachineMessage(message) {
      if (!message) return;

      if (!HM.state.conversation.history) {
        HM.state.conversation.history = [];
      }

      HM.state.conversation.history.push({
        role: "machine",
        content: message,
        timestamp: Date.now()
      });

      this.limit();
    },

    limit() {
      const history = HM.state.conversation.history;

      if (history.length > 50) {
        HM.state.conversation.history = history.slice(-50);
      }
    },

    lastUserMessage() {
      const history = HM.state.conversation.history || [];

      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].role === "user") {
          return history[i].content;
        }
      }

      return null;
    },

    lastMachineMessage() {
      const history = HM.state.conversation.history || [];

      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].role === "machine") {
          return history[i].content;
        }
      }

      return null;
    },

    clear() {
      HM.state.conversation.history = [];
      HM.context.currentSubject = null;
      HM.context.currentIntent = null;
      HM.context.lastQuestion = null;
      HM.context.lastAnswer = null;
      HM.context.lastResult = null;
    }
  };


  /* =========================================================
     3. GERENCIADOR DE TAREFAS
     ========================================================= */

  HM.taskManager = {
    create(type, label) {
      const id = "task_" + Date.now();

      const task = {
        id,
        type: type || "general",
        label: label || "A Máquina está a trabalhar",
        status: "pending",
        progress: 0,
        startedAt: null,
        finishedAt: null,
        result: null,
        error: null
      };

      HM.state.task = task;

      return task;
    },

    start(task) {
      if (!task) return;

      task.status = "working";
      task.progress = 5;
      task.startedAt = Date.now();

      HM.setMachineState("WORKING");
      this.updateUI(task);
    },

    progress(value, message) {
      const task = HM.state.task;

      if (!task) return;

      task.progress = Math.max(
        0,
        Math.min(100, Number(value) || 0)
      );

      if (message) {
        task.label = message;
      }

      this.updateUI(task);
    },

    finish(result) {
      const task = HM.state.task;

      if (!task) return;

      task.status = "completed";
      task.progress = 100;
      task.finishedAt = Date.now();
      task.result = result || null;

      this.updateUI(task);

      HM.context.setResult(result);
    },

    fail(error) {
      const task = HM.state.task;

      if (!task) return;

      task.status = "error";
      task.error = error || "Erro desconhecido";
      task.finishedAt = Date.now();

      HM.setMachineState("ERROR");
      this.updateUI(task);
    },

    updateUI(task) {
      if (!task) return;

      const progress = document.querySelector(
        "[data-task-progress]"
      );

      const status = document.querySelector(
        "[data-task-status]"
      );

      const label = document.querySelector(
        "[data-task-label]"
      );

      if (progress) {
        progress.style.width = task.progress + "%";
        progress.setAttribute(
          "aria-valuenow",
          String(task.progress)
        );
      }

      if (status) {
        status.textContent = task.status;
      }

      if (label) {
        label.textContent = task.label;
      }
    },

    clear() {
      HM.state.task = null;
    }
  };


  /* =========================================================
     4. ORQUESTRADOR DA MÁQUINA
     ========================================================= */

  HM.orchestrator = {

    async execute(intentData) {
      const data = intentData || {};

      const intent = data.intent || "general";
      const message = data.message || "";

      HM.context.set(
        data.subject,
        intent,
        message
      );

      switch (intent) {
        case "analyze_account":
          return this.accountAnalysis(message);

        case "analyze_content":
          return this.contentAnalysis(message);

        case "audience":
          return this.audience(message);

        case "trends":
          return this.trends(message);

        case "strategy":
          return this.strategy(message);

        case "ideas":
          return this.ideas(message);

        case "scripts":
          return this.scripts(message);

        case "planning":
          return this.planning(message);

        default:
          return this.general(message);
      }
    },


    async general(message) {
      return {
        type: "conversation",
        title: "Resposta da Máquina",
        text:
          "Entendi. Estou a acompanhar o que estás a dizer. " +
          "Podemos continuar esta conversa e, quando for necessário, " +
          "a Máquina pode transformar o teu pedido numa tarefa.",
        source: "machine"
      };
    },


    async accountAnalysis(message) {
      return this.runTask(
        "account_analysis",
        "A Máquina está a preparar a análise da conta.",
        [
          "A identificar a conta solicitada.",
          "A preparar os dados necessários.",
          "A organizar os pontos que precisam de análise."
        ]
      );
    },


    async contentAnalysis(message) {
      return this.runTask(
        "content_analysis",
        "A Máquina está a preparar a análise do conteúdo.",
        [
          "A identificar o conteúdo.",
          "A organizar os elementos relevantes.",
          "A preparar a análise."
        ]
      );
    },


    async audience(message) {
      return this.runTask(
        "audience",
        "A Máquina está a preparar a análise do público.",
        [
          "A identificar o contexto.",
          "A organizar os sinais disponíveis.",
          "A preparar o perfil do público."
        ]
      );
    },


    async trends(message) {
      return this.runTask(
        "trends",
        "A Máquina está a preparar a análise de tendências.",
        [
          "A identificar o contexto da conta.",
          "A separar tendências relevantes.",
          "A preparar oportunidades relacionadas com o nicho."
        ]
      );
    },


    async strategy(message) {
      return this.runTask(
        "strategy",
        "A Máquina está a preparar uma estratégia.",
        [
          "A compreender o objetivo.",
          "A organizar os pontos estratégicos.",
          "A preparar uma direção de ação."
        ]
      );
    },


    async ideas(message) {
      return this.runTask(
        "ideas",
        "A Máquina está a preparar ideias.",
        [
          "A compreender o nicho.",
          "A procurar ângulos possíveis.",
          "A organizar ideias adequadas ao contexto."
        ]
      );
    },


    async scripts(message) {
      return this.runTask(
        "scripts",
        "A Máquina está a preparar roteiros.",
        [
          "A definir o objetivo do conteúdo.",
          "A organizar a estrutura.",
          "A preparar os roteiros."
        ]
      );
    },


    async planning(message) {
      return this.runTask(
        "planning",
        "A Máquina está a preparar o planeamento.",
        [
          "A organizar os objetivos.",
          "A estruturar as ações.",
          "A preparar o plano."
        ]
      );
    },


    async runTask(type, label, stages) {
      const task = HM.taskManager.create(
        type,
        label
      );

      HM.taskManager.start(task);

      for (let i = 0; i < stages.length; i++) {
        HM.taskManager.progress(
          Math.round(((i + 1) / (stages.length + 1)) * 100),
          stages[i]
        );

        await new Promise(resolve =>
          setTimeout(resolve, 180)
        );
      }

      const result = {
        type,
        title: this.getResultTitle(type),
        summary: this.getResultSummary(type),
        data: {
          status: "prepared",
          source: "machine-orchestrator"
        }
      };

      HM.taskManager.finish(result);

      return result;
    },


    getResultTitle(type) {
      const titles = {
        account_analysis: "Análise da conta",
        content_analysis: "Análise do conteúdo",
        audience: "Análise do público",
        trends: "Tendências",
        strategy: "Estratégia",
        ideas: "Ideias",
        scripts: "Roteiros",
        planning: "Planeamento"
      };

      return titles[type] || "Resultado da Máquina";
    },


    getResultSummary(type) {
      const summaries = {
        account_analysis:
          "A análise da conta foi preparada.",

        content_analysis:
          "A análise do conteúdo foi preparada.",

        audience:
          "A análise do público foi preparada.",

        trends:
          "A análise de tendências foi preparada.",

        strategy:
          "A estratégia foi preparada.",

        ideas:
          "As ideias foram preparadas.",

        scripts:
          "Os roteiros foram preparados.",

        planning:
          "O planeamento foi preparado."
      };

      return summaries[type] ||
        "O resultado foi preparado pela Máquina.";
    }
  };


  /* =========================================================
     5. RESULTADOS
     ========================================================= */

  HM.results = {

    current: null,

    show(result) {
      if (!result) return;

      this.current = result;
      HM.context.setResult(result);

      const title = document.querySelector(
        "[data-result-title]"
      );

      const summary = document.querySelector(
        "[data-result-summary]"
      );

      if (title) {
        title.textContent =
          result.title || "Resultado";
      }

      if (summary) {
        summary.textContent =
          result.summary || "";
      }

      const resultScreen =
        HM.getScreenElement &&
        HM.getScreenElement("results");

      if (resultScreen) {
        HM.showScreen("results");
      }

      HM.showMachineResponse(
        result.summary || "Resultado preparado."
      );
    },

    showDetails() {
      if (!this.current) {
        HM.showToast(
          "Ainda não existe um resultado para mostrar."
        );
        return;
      }

      HM.showScreen("result-details");
    },

    clear() {
      this.current = null;
      HM.context.setResult(null);
    }
  };


  /* =========================================================
     6. CONVERSAÇÃO CONTÍNUA COM CONTEXTO
     ========================================================= */

  HM.conversation = {

    rememberUser(message) {
      HM.memory.addUserMessage(message);
    },

    rememberMachine(message) {
      HM.memory.addMachineMessage(message);
      HM.context.setAnswer(message);
    },

    getContext() {
      return {
        subject: HM.context.currentSubject,
        intent: HM.context.currentIntent,
        lastQuestion: HM.context.lastQuestion,
        lastAnswer: HM.context.lastAnswer,
        history: HM.state.conversation.history || []
      };
    },

    hasContext() {
      return Boolean(
        HM.context.currentSubject ||
        HM.context.currentIntent ||
        HM.context.lastQuestion
      );
    },

    continueFromContext(message) {
      if (!message) return null;

      const text = HM.normalizeText(message);

      if (
        /^(explica|explique|detalha|detalhe|como assim)/.test(text)
      ) {
        return {
          intent: HM.context.currentIntent || "general",
          subject: HM.context.currentSubject,
          message,
          continuation: true
        };
      }

      return null;
    }
  };


  /* =========================================================
     7. RESULTADO → RESPOSTA NATURAL DA MÁQUINA
     ========================================================= */

  HM.responseController = {

    present(result) {
      if (!result) return;

      const text =
        result.summary ||
        result.text ||
        "Terminei esta tarefa.";

      HM.conversation.rememberMachine(text);

      HM.showMachineResponse(text);

      if (HM.speechSynthesisController &&
          HM.state.preferences &&
          HM.state.preferences.voiceResponse !== false) {

        HM.speechSynthesisController.speak(text);
      } else {
        HM.setMachineState("WAITING");
      }
    }
  };


  /* =========================================================
     8. SUBSTITUIR O PROCESSAMENTO BÁSICO PELO ORQUESTRADOR
     ========================================================= */

  HM.processMessageAdvanced = async function (message) {
    const text = String(message || "").trim();

    if (!text) return null;

    HM.conversation.rememberUser(text);

    const continuation =
      HM.conversation.continueFromContext(text);

    let interpreted;

    if (continuation) {
      interpreted = continuation;
    } else if (typeof HM.interpretMessage === "function") {
      interpreted = HM.interpretMessage(text);
    } else {
      interpreted = {
        intent: "general",
        subject: null,
        message: text
      };
    }

    HM.context.set(
      interpreted.subject,
      interpreted.intent,
      text
    );

    HM.setMachineState("THINKING");

    try {
      const result =
        await HM.orchestrator.execute({
          ...interpreted,
          message: text
        });

      HM.responseController.present(result);

      return result;

    } catch (error) {
      console.error(
        "Erro no orquestrador:",
        error
      );

      HM.taskManager.fail(
        "Não foi possível concluir a tarefa."
      );

      HM.showToast(
        "A Máquina encontrou um problema."
      );

      return null;
    }
  };


  /* =========================================================
     9. EXPOR FUNÇÕES ÚTEIS
     ========================================================= */

  HM.createTask = function (type, label) {
    return HM.taskManager.create(type, label);
  };

  HM.startTask = function (task) {
    return HM.taskManager.start(task);
  };

  HM.finishTask = function (result) {
    return HM.taskManager.finish(result);
  };

  HM.showResult = function (result) {
    return HM.results.show(result);
  };

  HM.showResultDetails = function () {
    return HM.results.showDetails();
  };


  /* =========================================================
     10. CORREÇÃO DO BOTÃO DE VOZ
     Evita que múltiplos listeners anteriores provoquem
     start + pause no mesmo toque.
     ========================================================= */

  if (HM.DOM && HM.DOM.voiceButton) {
    const voiceButton = HM.DOM.voiceButton;

    if (!voiceButton.dataset.hmVoiceController) {
      voiceButton.dataset.hmVoiceController = "active";

      voiceButton.addEventListener(
        "click",
        function (event) {
          event.stopImmediatePropagation();
        },
        true
      );

      voiceButton.addEventListener(
        "click",
        function () {
          if (!HM.speechRecognitionController ||
              !HM.speechRecognitionController.supported) {

            HM.showToast(
              "O reconhecimento de voz não está disponível neste navegador."
            );

            return;
          }

          if (
            HM.state.listening ||
            HM.speechRecognitionController.active
          ) {
            HM.speechRecognitionController.stop();
            HM.setMachineState("WAITING");
            return;
          }

          HM.speechRecognitionController.start();
        },
        false
      );
    }
  }


  /* =========================================================
     11. INDICADOR DE CONEXÃO
     ========================================================= */

  HM.connection = {

    update() {
      const online = navigator.onLine;

      HM.state.online = online;

      document.documentElement.classList.toggle(
        "is-offline",
        !online
      );

      document.documentElement.classList.toggle(
        "is-online",
        online
      );

      const indicator = document.querySelector(
        "[data-connection-indicator]"
      );

      if (indicator) {
        indicator.textContent =
          online ? "Online" : "Offline";
      }
    }
  };


  window.addEventListener(
    "online",
    () => HM.connection.update()
  );

  window.addEventListener(
    "offline",
    () => HM.connection.update()
  );

  HM.connection.update();


  /* =========================================================
     FIM DA PARTE 5
     ========================================================= */

})();
