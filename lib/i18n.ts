export type Language = "es" | "en" | "pt" | "hi" | "mr";

interface Dictionary {
  onboarding: {
    subtitle: string;
    birthYearLabel: string;
    hubLabel: string;
    hubSearchPlaceholder: string;
    hubNoResults: string;
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
    shareTitle: string;
    shareInvite: string;
    shareWhatsapp: string;
    shareCopy: string;
    shareCopied: string;
  };
  imageCard: {
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
    hubSearchPlaceholder: "Busca tu hub...",
    hubNoResults: "No se encontró ningún hub con ese nombre.",
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
    shareTitle: "Comparte tu resultado",
    shareInvite: "¿Sabrías distinguir una foto real de una de IA? Pruébalo:",
    shareWhatsapp: "WhatsApp",
    shareCopy: "Copiar",
    shareCopied: "¡Copiado!",
  },
  imageCard: {
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
    hubSearchPlaceholder: "Search your hub...",
    hubNoResults: "No hub found with that name.",
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
    shareTitle: "Share your result",
    shareInvite: "Can you tell a real photo from an AI one? Try it:",
    shareWhatsapp: "WhatsApp",
    shareCopy: "Copy",
    shareCopied: "Copied!",
  },
  imageCard: {
    real: "Real",
    aiGenerated: "AI-generated",
    alt: "Image to evaluate",
  },
};

const pt: Dictionary = {
  onboarding: {
    subtitle:
      "Conseguirias distinguir uma foto real de uma gerada por IA? Descobre num minuto.",
    birthYearLabel: "Ano de nascimento",
    hubLabel: "O teu hub / cidade",
    hubSearchPlaceholder: "Procura o teu hub...",
    hubNoResults: "Não foi encontrado nenhum hub com esse nome.",
    consent:
      "Aceito que o meu ano de nascimento e hub sejam guardados de forma anónima, apenas para fins estatísticos do projeto.",
    errorInvalidYear: "Indica um ano de nascimento válido.",
    errorConsent: "Precisamos do teu consentimento para guardar dados anónimos.",
    errorSave: "Não foi possível guardar. Tenta novamente.",
    loading: "A carregar...",
    start: "Começar",
  },
  phase1: {
    loadError: "Não foi possível carregar o conteúdo do teu hub. Tenta novamente.",
    preparing: "A preparar perguntas...",
  },
  phase2: {
    loadError: "Não foi possível carregar o conteúdo formativo do teu hub.",
    loading: "A carregar treino...",
    trainingLabel: "Treino",
    aiGenerated: "Gerada por IA",
    realImage: "Imagem real",
    finish: "Terminar",
    next: "Seguinte",
  },
  results: {
    loading: "A carregar resultados...",
    title: "Resultado",
    description:
      "Isto é o que acertaste e o que erraste. Não faz mal: é para isso que existe a fase de treino.",
    wasAiGenerated: "Era gerada por IA",
    wasReal: "Era uma imagem real",
    correct: "Acertaste",
    incorrect: "Erraste",
    learnMore: "Quero aprender a identificá-las melhor",
    backHome: "Voltar ao início",
    shareTitle: "Partilha o teu resultado",
    shareInvite: "Consegues distinguir uma foto real de uma gerada por IA? Experimenta:",
    shareWhatsapp: "WhatsApp",
    shareCopy: "Copiar",
    shareCopied: "Copiado!",
  },
  imageCard: {
    real: "Real",
    aiGenerated: "Gerada por IA",
    alt: "Imagem a avaliar",
  },
};

const hi: Dictionary = {
  onboarding: {
    subtitle:
      "क्या आप असली फोटो और AI से बनी फोटो में फर्क बता सकते हैं? एक मिनट में पता लगाएँ।",
    birthYearLabel: "जन्म वर्ष",
    hubLabel: "आपका हब / शहर",
    hubSearchPlaceholder: "अपना हब खोजें...",
    hubNoResults: "इस नाम से कोई हब नहीं मिला।",
    consent:
      "मैं सहमत हूँ कि मेरा जन्म वर्ष और हब गुमनाम रूप से केवल परियोजना के सांख्यिकीय उद्देश्यों के लिए सहेजे जाएँ।",
    errorInvalidYear: "एक वैध जन्म वर्ष दर्ज करें।",
    errorConsent: "गुमनाम डेटा सहेजने के लिए हमें आपकी सहमति चाहिए।",
    errorSave: "सहेजा नहीं जा सका। कृपया फिर से कोशिश करें।",
    loading: "लोड हो रहा है...",
    start: "शुरू करें",
  },
  phase1: {
    loadError: "आपके हब की सामग्री लोड नहीं हो सकी। कृपया फिर से कोशिश करें।",
    preparing: "प्रश्न तैयार किए जा रहे हैं...",
  },
  phase2: {
    loadError: "आपके हब की प्रशिक्षण सामग्री लोड नहीं हो सकी।",
    loading: "प्रशिक्षण लोड हो रहा है...",
    trainingLabel: "प्रशिक्षण",
    aiGenerated: "AI-जनित",
    realImage: "असली तस्वीर",
    finish: "समाप्त करें",
    next: "अगला",
  },
  results: {
    loading: "परिणाम लोड हो रहे हैं...",
    title: "परिणाम",
    description:
      "यह रहा आपने क्या सही और क्या गलत किया। कोई बात नहीं: प्रशिक्षण चरण इसीलिए है।",
    wasAiGenerated: "यह AI-जनित थी",
    wasReal: "यह एक असली तस्वीर थी",
    correct: "सही",
    incorrect: "गलत",
    learnMore: "मैं इन्हें बेहतर पहचानना सीखना चाहता हूँ",
    backHome: "शुरुआत पर लौटें",
    shareTitle: "अपना परिणाम साझा करें",
    shareInvite: "क्या आप असली फोटो और AI फोटो में फर्क बता सकते हैं? आज़माएँ:",
    shareWhatsapp: "व्हाट्सएप",
    shareCopy: "कॉपी करें",
    shareCopied: "कॉपी हो गया!",
  },
  imageCard: {
    real: "असली",
    aiGenerated: "AI-जनित",
    alt: "आकलन के लिए तस्वीर",
  },
};

const mr: Dictionary = {
  onboarding: {
    subtitle:
      "खरा फोटो आणि AI ने तयार केलेला फोटो यातला फरक तुम्ही ओळखू शकता का? एका मिनिटात शोधा.",
    birthYearLabel: "जन्म वर्ष",
    hubLabel: "तुमचा हब / शहर",
    hubSearchPlaceholder: "तुमचा हब शोधा...",
    hubNoResults: "या नावाचा कोणताही हब सापडला नाही.",
    consent:
      "मी सहमत आहे की माझे जन्म वर्ष आणि हब निनावीपणे फक्त प्रकल्पाच्या सांख्यिकीय उद्देशांसाठी साठवले जावेत.",
    errorInvalidYear: "वैध जन्म वर्ष टाका.",
    errorConsent: "निनावी माहिती साठवण्यासाठी आम्हाला तुमची संमती हवी आहे.",
    errorSave: "साठवता आले नाही. कृपया पुन्हा प्रयत्न करा.",
    loading: "लोड होत आहे...",
    start: "सुरू करा",
  },
  phase1: {
    loadError: "तुमच्या हबची माहिती लोड होऊ शकली नाही. कृपया पुन्हा प्रयत्न करा.",
    preparing: "प्रश्न तयार केले जात आहेत...",
  },
  phase2: {
    loadError: "तुमच्या हबची प्रशिक्षण माहिती लोड होऊ शकली नाही.",
    loading: "प्रशिक्षण लोड होत आहे...",
    trainingLabel: "प्रशिक्षण",
    aiGenerated: "AI-निर्मित",
    realImage: "खरा फोटो",
    finish: "संपवा",
    next: "पुढे",
  },
  results: {
    loading: "निकाल लोड होत आहेत...",
    title: "निकाल",
    description:
      "हे बघा तुम्ही काय बरोबर आणि काय चूक केले. काही हरकत नाही: यासाठीच प्रशिक्षण टप्पा आहे.",
    wasAiGenerated: "हा AI-निर्मित होता",
    wasReal: "हा एक खरा फोटो होता",
    correct: "बरोबर",
    incorrect: "चूक",
    learnMore: "मला हे अधिक चांगल्या प्रकारे ओळखायला शिकायचे आहे",
    backHome: "सुरुवातीला परत जा",
    shareTitle: "तुमचा निकाल शेअर करा",
    shareInvite: "खरा फोटो आणि AI फोटो यातला फरक तुम्ही ओळखू शकता का? करून बघा:",
    shareWhatsapp: "व्हॉट्सअॅप",
    shareCopy: "कॉपी करा",
    shareCopied: "कॉपी झाले!",
  },
  imageCard: {
    real: "खरे",
    aiGenerated: "AI-निर्मित",
    alt: "मूल्यांकनासाठी फोटो",
  },
};

const DICTIONARIES: Record<Language, Dictionary> = { es, en, pt, hi, mr };

export function getDictionary(language?: string | null): Dictionary {
  return DICTIONARIES[language as Language] ?? DICTIONARIES.es;
}
