export type Language = "es" | "en";

interface Dictionary {
  onboarding: {
    subtitle: string;
    birthYearLabel: string;
    hubLabel: string;
    modeLegend: string;
    modeSimpleTitle: string;
    modeSimpleDesc: string;
    modeDigitalTitle: string;
    modeDigitalDesc: string;
    consent: string;
    errorInvalidYear: string;
    errorConsent: string;
    errorSave: string;
    loading: string;
    start: string;
  };
  phase1: {
    loadError: string;
    preparing: string;
  };
  phase2: {
    loadError: string;
    loading: string;
    trainingLabel: string;
    aiGenerated: string;
    realImage: string;
    finish: string;
    next: string;
  };
  results: {
    loading: string;
    title: string;
    description: string;
    wasAiGenerated: string;
    wasReal: string;
    correct: string;
    incorrect: string;
    learnMore: string;
    backHome: string;
  };
  imageCard: {
    swipeHint: string;
    real: string;
    aiGenerated: string;
    alt: string;
  };
}

const es: Dictionary = {
  onboarding: {
    subtitle:
      "¿Sabrías distinguir una imagen real de una generada por IA? Averígualo en un minuto.",
    birthYearLabel: "Año de nacimiento",
    hubLabel: "Tu hub / ciudad",
    modeLegend: "Elige tu modo",
    modeSimpleTitle: "Modo simple",
    modeSimpleDesc: "Botones grandes, sin gestos",
    modeDigitalTitle: "Modo rápido",
    modeDigitalDesc: "Desliza izquierda / derecha",
    consent:
      "Acepto que se guarden mi año de nacimiento y hub de forma anónima, únicamente con fines estadísticos del proyecto.",
    errorInvalidYear: "Introduce un año de nacimiento válido.",
    errorConsent: "Necesitamos tu consentimiento para guardar datos anónimos.",
    errorSave: "No se pudo guardar. Inténtalo de nuevo.",
    loading: "Cargando...",
    start: "Empezar",
  },
  phase1: {
    loadError: "No se pudo cargar el contenido de tu hub. Inténtalo de nuevo.",
    preparing: "Preparando preguntas...",
  },
  phase2: {
    loadError: "No se pudo cargar el contenido formativo de tu hub.",
    loading: "Cargando entrenamiento...",
    trainingLabel: "Entrenamiento",
    aiGenerated: "Generada por IA",
    realImage: "Imagen real",
    finish: "Terminar",
    next: "Siguiente",
  },
  results: {
    loading: "Cargando resultados...",
    title: "Resultado",
    description:
      "Esto es lo que has acertado y lo que no. No pasa nada: para eso existe la fase de entrenamiento.",
    wasAiGenerated: "Era generada por IA",
    wasReal: "Era una imagen real",
    correct: "Acertaste",
    incorrect: "Fallaste",
    learnMore: "Quiero aprender a identificarlas mejor",
    backHome: "Volver al inicio",
  },
  imageCard: {
    swipeHint:
      "Desliza derecha si crees que es real, izquierda si crees que es IA. También puedes usar los botones.",
    real: "Real",
    aiGenerated: "Generada por IA",
    alt: "Imagen a evaluar",
  },
};

const en: Dictionary = {
  onboarding: {
    subtitle:
      "Could you tell a real photo from an AI-generated one? Find out in a minute.",
    birthYearLabel: "Birth year",
    hubLabel: "Your hub / city",
    modeLegend: "Choose your mode",
    modeSimpleTitle: "Simple mode",
    modeSimpleDesc: "Large buttons, no gestures",
    modeDigitalTitle: "Quick mode",
    modeDigitalDesc: "Swipe left / right",
    consent:
      "I agree to store my birth year and hub anonymously, for the project's statistical purposes only.",
    errorInvalidYear: "Enter a valid birth year.",
    errorConsent: "We need your consent to store anonymous data.",
    errorSave: "Couldn't save. Please try again.",
    loading: "Loading...",
    start: "Start",
  },
  phase1: {
    loadError: "Couldn't load your hub's content. Please try again.",
    preparing: "Preparing questions...",
  },
  phase2: {
    loadError: "Couldn't load your hub's training content.",
    loading: "Loading training...",
    trainingLabel: "Training",
    aiGenerated: "AI-generated",
    realImage: "Real image",
    finish: "Finish",
    next: "Next",
  },
  results: {
    loading: "Loading results...",
    title: "Result",
    description:
      "Here's what you got right and wrong. No worries: that's exactly what the training phase is for.",
    wasAiGenerated: "It was AI-generated",
    wasReal: "It was a real image",
    correct: "Correct",
    incorrect: "Incorrect",
    learnMore: "I want to learn to identify them better",
    backHome: "Back to start",
  },
  imageCard: {
    swipeHint:
      "Swipe right if you think it's real, left if you think it's AI. You can also use the buttons.",
    real: "Real",
    aiGenerated: "AI-generated",
    alt: "Image to evaluate",
  },
};

const DICTIONARIES: Record<Language, Dictionary> = { es, en };

export function getDictionary(language?: string | null): Dictionary {
  return DICTIONARIES[language as Language] ?? DICTIONARIES.es;
}
