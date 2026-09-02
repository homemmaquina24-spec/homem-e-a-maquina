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
