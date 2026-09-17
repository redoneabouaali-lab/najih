export type Lang = "ar" | "fr";

export const LANG_COOKIE = "najih-lang";

export function normalizeLang(v: string | null | undefined): Lang {
  return v === "fr" ? "fr" : "ar";
}

export function getClientLang(): Lang {
  if (typeof document === "undefined") return "ar";
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith("najih-lang="))
    ?.split("=")[1];
  return normalizeLang(match);
}

export function setClientLang(lang: Lang) {
  document.cookie = `najih-lang=${lang}; path=/; max-age=31536000`;
}

const dict: Record<string, { ar: string; fr: string }> = {
  appName: { ar: "ناجِح", fr: "Najih" },
  tagline: { ar: "تحضيرك للباكالوريا — بذكاء وبدون إنترنت", fr: "Préparation au Bac — intelligente et hors-ligne" },
  navHome: { ar: "الرئيسية", fr: "Accueil" },
  navBranches: { ar: "الشعب", fr: "Filières" },
  navAi: { ar: "المرشد الذكي", fr: "Tuteur IA" },
  navProgress: { ar: "تقدمي", fr: "Progression" },
  homeHeroTitle: { ar: "ناجِح: أعدّك للباكالوريا", fr: "Najih : ton Bac, enfin à ta portée" },
  homeHeroSub: {
    ar: "بنك أسئلة من الامتحانات الوطنية، اختبارات تفاعلية ومرشد ذكي. مجاني 100% ويعمل بدون إنترنت.",
    fr: "Banque de questions des examens nationaux, quiz interactifs et tuteur IA. 100% gratuit, 100% hors-ligne.",
  },
  homeStart: { ar: "ابدأ الآن", fr: "C'est parti" },
  homeBrowse: { ar: "تصفح الشعب", fr: "Voir les filières" },
  homeFeat1t: { ar: "مجاني 100%", fr: "Gratuit 100%" },
  homeFeat1d: { ar: "بدون دفع، بدون حدود", fr: "Sans payement, sans limites" },
  homeFeat2t: { ar: "يعمل بدون إنترنت", fr: "Fonctionne hors-ligne" },
  homeFeat2d: { ar: "تثبّت التطبيق واستعمله في أي مكان", fr: "Installe l'app et réutilise-la partout" },
  homeFeat3t: { ar: "أسئلة المباريات الوطنية", fr: "Questions d'examens nationaux" },
  homeFeat3d: { ar: "مصنفة حسب الشعبة والمادة والدرس", fr: "Classées par filière, matière et leçon" },
  homeFeat4t: { ar: "مرشد ذكي مجاني", fr: "Tuteur IA gratuit" },
  homeFeat4d: { ar: "يشرح أي سؤال بالعربية أو الفرنسية", fr: "Explique n'importe quelle question en AR/FR" },
  homePopular: { ar: "انطلق بحسب شعبتك", fr: "Lance-toi par filière" },
  branchesTitle: { ar: "اختر شعبتك", fr: "Choisis ta filière" },
  branchesSub: { ar: "كل شعبة تجمع موادها ودروسها واختباراتها", fr: "Chaque filière regroupe matières, leçons et quiz" },
  subjectsOf: { ar: "مواد الشعبة", fr: "Matières de la filière" },
  subjectsOf2: { ar: "دروس الشعبة", fr: "Leçons de la filière" },
  questions: { ar: "سؤالًا", fr: "questions" },
  chapters: { ar: "الدروس", fr: "Leçons" },
  startQuiz: { ar: "ابدأ الاختبار", fr: "Démarrer le quiz" },
  retry: { ar: "أعد المحاولة", fr: "Rejouer" },
  nextQ: { ar: "السؤال التالي", fr: "Question suivante" },
  finish: { ar: "إنهاء الاختبار", fr: "Terminer" },
  score: { ar: "نتيجتك", fr: "Ton score" },
  correct: { ar: "إجابة صحيحة", fr: "Bonne réponse" },
  wrong: { ar: "إجابة خاطئة", fr: "Mauvaise réponse" },
  explanation: { ar: "الشرح", fr: "Explication" },
  source: { ar: "المصدر", fr: "Source" },
  noQuestions: { ar: "لا توجد أسئلة بعد في هذا الدرس", fr: "Pas encore de questions pour cette leçon" },
  backToLessons: { ar: "العودة إلى الدروس", fr: "Retour aux leçons" },
  of: { ar: "من", fr: "sur" },
  progressTitle: { ar: "تقدمك", fr: "Ta progression" },
  progressEmpty: { ar: "لم تُجرِ أي اختبار بعد. ابدأ الآن!", fr: "Aucun quiz pour l'instant. Lance-toi !" },
  progressTotal: { ar: "اختبارات", fr: "quiz" },
  progressAvg: { ar: "متوسط النتيجة", fr: "Score moyen" },
  progressBest: { ar: "أفضل نتيجة", fr: "Meilleur score" },
  chatTitle: { ar: "المرشد الذكي", fr: "Tuteur IA" },
  chatSub: {
    ar: "اسأل عن أي درس أو سؤال، وسأشرح لك بالعربية أو الفرنسية.",
    fr: "Pose une question sur n'importe quelle leçon, je t'explique en arabe ou en français.",
  },
  chatPlaceholder: { ar: "اكتب سؤالك هنا...", fr: "Écris ta question ici..." },
  chatSend: { ar: "إرسال", fr: "Envoyer" },
  chatThinking: { ar: "يجيب المرشد...", fr: "Le tuteur réfléchit..." },
  chatExample: { ar: "مثال: اشرح لي النهايات بطريقة مبسطة", fr: "Ex : explique-moi les limites simplement" },
  langLabel: { ar: "اللغة", fr: "Langue" },
  footer: { ar: "ناجِح — تحضير مجاني للباكالوريا المغربية 🇲🇦", fr: "Najih — préparation gratuite au Bac Maroc 🇲🇦" },
  examYear: { ar: "الامتحان الوطني", fr: "Examen national" },
  navResources: { ar: "الامتحانات", fr: "Examens" },
  resourcesTitle: { ar: "الامتحانات الوطنية", fr: "Examens nationaux" },
  resourcesSub: {
    ar: "مواضيع وتصحيحات الامتحانات الوطنية — تُفتح مباشرة من المصدر الأصلي، بدون تخزين",
    fr: "Sujets et corrections des examens nationaux — ouverts directement à la source, sans stockage",
  },
  sessionNormal: { ar: "الدورة العادية", fr: "Session normale" },
  sessionRattrapage: { ar: "الدورة الاستدراكية", fr: "Session de rattrapage" },
  kSujet: { ar: "الموضوع", fr: "Sujet" },
  kCorrection: { ar: "التصحيح", fr: "Correction" },
  kExam: { ar: "تمرين", fr: "Exercice" },
  openSource: { ar: "فتح المصدر", fr: "Ouvrir la source" },
  noResources: {
    ar: "لا توجد امتحانات مضافة بعد لهذه الشعبة",
    fr: "Aucun examen pour cette filière pour l'instant",
  },
  countExams: { ar: "امتحان", fr: "examens" },
  onboardTitleBranches: {
    ar: "مرحبًا بيك! في أي شعبة تدرس؟",
    fr: "Bienvenue ! Dans quelle filière étudies-tu ?",
  },
  onboardSubBranches: {
    ar: "اختر شعبتك وسنعرض لك الدروس والاختبارات والامتحانات المناسبة لك",
    fr: "Choisis ta filière : on t'affiche les leçons, quiz et examens adaptés",
  },
  onboardTitleLang: { ar: "أي لغة تدرس بها؟", fr: "Dans quelle langue étudies-tu ?" },
  onboardSubLang: {
    ar: "سنشرح لك المحتوى بنفس اللغة التي تُرتَاح لها",
    fr: "On affichera les cours et explications dans ta langue",
  },
  onboardArabic: { ar: "العربية", fr: "Arabe" },
  onboardFrench: { ar: "الفرنسية", fr: "Français" },
  onboardPickBranch: { ar: "اختر شعبتك 🎯", fr: "Choisis ta filière 🎯" },
  onboardPickLang: { ar: "اختر لغتك 🗣️", fr: "Choisis ta langue 🗣️" },
  onboardDoneTitle: { ar: "تم تجهيز تجربتك!", fr: "Ton parcours est prêt !" },
  onboardDoneSub: {
    ar: "يتم الآن عرض المحتوى المناسب لك...",
    fr: "On charge ton contenu personnalisé…",
  },
  helloBranch: { ar: "أهلاً بك في", fr: "Bienvenue en" },
  myDash: { ar: "محتواك المخصص", fr: "Ton contenu personnalisé" },
  cardQuizTitle: { ar: "اختبارات شعبتي", fr: "Mes quiz" },
  cardQuizDesc: {
    ar: "تمارين ودروس حسب برنامج شعبتك",
    fr: "Exercices et leçons selon ton programme",
  },
  cardExamTitle: { ar: "الامتحانات الوطنية", fr: "Examens nationaux" },
  cardExamDesc: {
    ar: "مواضيع وتصحيحات خاصة بشعبتك",
    fr: "Sujets et corrections de ta filière",
  },
  cardAiTitle: { ar: "المرشد الذكي", fr: "Tuteur IA" },
  cardAiDesc: {
    ar: "اطرح أي سؤال واحصل على الشرح",
    fr: "Pose une question, reçois une explication",
  },
  cardLessonTitle: { ar: "دروس شعبتي", fr: "Mes cours" },
  cardLessonDesc: {
    ar: "ملخصات مراجعة شاملة لكل درس",
    fr: "Fiches de révision complètes pour chaque cours",
  },
  changeProfile: { ar: "تغيير شعبتي", fr: "Changer de filière" },
  lessonCount: { ar: "سؤالًا في دروسك", fr: "questions dans tes leçons" },
  lessons: { ar: "درس", fr: "cours" },
  examCount: { ar: "امتحانًا وطنيًا", fr: "examens nationaux" },
  lessonView: { ar: "الدرس", fr: "Leçon" },
  lessonPdfSection: { ar: "ملخصات وكتب الدروس PDF", fr: "Résumés et livres de cours PDF" },
  exerciseSection: { ar: "تمارين تفاعلية", fr: "Exercices interactifs" },
  examSection: { ar: "الامتحانات الوطنية", fr: "Examens nationaux" },
  noExercises: {
    ar: "لا توجد تمارين لهذه الشعبة بعد",
    fr: "Aucun exercice pour cette filière pour l'instant",
  },
  lessonNotFound: { ar: "لم يُضف هذا الدرس بعد", fr: "Cette leçon n'est pas encore disponible" },
  matiere: { ar: "المادة", fr: "Matière" },
  pickBranchFirst: { ar: "اختر شعبتك لبدء التعلم", fr: "Choisis ta filière pour commencer" },
  pickMatiere: { ar: "اختر المادة", fr: "Choisis la matière" },
  pickMatiereSub: {
    ar: "داخل كل مادة ستجد الدروس والاختبارات السريعة والتمارين وامتحانات المادة",
    fr: "Dans chaque matière : leçons, quiz rapides, exercices et examens de la matière",
  },
  lessonsAndQuiz: { ar: "الدروس والاختبارات", fr: "Leçons et quiz" },
  fastQuiz: { ar: "اختبار سريع", fr: "Quiz rapide" },
  moduleLessons: { ar: "الدروس", fr: "Leçons" },
  noMatieres: { ar: "لا توجد مواد لهذه الشعبة بعد", fr: "Aucune matière pour cette filière pour l'instant" },
  soon: { ar: "قريباً", fr: "Bientôt" },
  noLessonsMatiere: {
    ar: "لا توجد دروس لهذه المادة بعد",
    fr: "Aucune leçon pour cette matière pour l'instant",
  },
};

export function t(lang: Lang, key: string): string {
  return dict[key]?.[lang] ?? key;
}