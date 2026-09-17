import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

type QSeed = {
  ar: string;
  fr: string;
  expAr: string;
  expFr: string;
  opts: { ar: string; fr: string; ok?: boolean }[]; // first marked ok (or default false)
};

type ChapterDef = {
  slug: string;
  titleAr: string;
  titleFr: string;
  lessonAr: string;
  lessonFr: string;
  questions: QSeed[];
};

// ---------------------------------------------------------------- PHILOSOPHIE
const philoChapters: ChapterDef[] = [
  {
    slug: "etre-et-verite",
    titleAr: "الوجود والحقيقة",
    titleFr: "L'être et la vérité",
    lessonAr: `## الوجود والحقيقة
الفلسفة سؤال جوهري عن الوجود والحقيقة. منذ سقراط وأفلاطون يُطرح السؤال: ما الوجود؟ وما الحقيقة؟

- **الوجود**: ما هو كائنٌ بصرف النظر عن تصورنا له.
- **الحقيقة**: مطابقة القول للواقع (النظرية التطابقية).
- سؤال "من أنا؟" يربط الوجود بالذات وبالآخر.

### ماذا نستفيد؟
- التمييز بين الوجود والماهية.
- مناقشة السؤال الكانطي: ما الذي أستطيع أن أعرفه؟
- الفلسفة الوجودية (سارتر): الوجود يسبق الماهية.`,
    lessonFr: `## L'être et la vérité
La philosophie est d'abord un questionnement radical sur l'être et la vérité. Depuis Socrate et Platon, on demande : qu'est-ce que l'être ? Qu'est-ce que la vérité ?

- **L'être** : ce qui est, indépendamment de notre représentation.
- **La vérité** : l'adéquation entre le discours et la réalité (théorie de la correspondance).
- La question « qui suis-je ? » relie l'être au sujet et à l'autre.

### Ce qu'il faut retenir
- Distinguer l'être et l'essence.
- S'interroger avec Kant : que puis-je connaître ?
- L'existentialisme (Sartre) : l'existence précède l'essence.`,
    questions: [
      {
        ar: "سؤال « من أنا؟ » في الفلسفة يهمّ أساسا:",
        fr: "La question « qui suis-je ? » concerne prioritairement :",
        expAr: "السؤال يتعلق بالذات والوجود وبالعلاقة بالآخر.",
        expFr: "La question porte sur le sujet, l'existence et le rapport à l'autre.",
        opts: [
          { ar: "الذات والوجود", fr: "L'identité et l'existence", ok: true },
          { ar: "الحساب العددي", fr: "Le calcul numérique" },
          { ar: "الأنشطة الرياضية", fr: "Les activités sportives" },
          { ar: "الشؤون المالية", fr: "Les affaires financières" },
        ],
      },
      {
        ar: "النظرية التطابقية تعرّف الحقيقة بأنها:",
        fr: "La théorie de la correspondance définit la vérité comme :",
        expAr: "الحقيقة مطابقة القول أو الفكر للواقع.",
        expFr: "La vérité est l'adéquation entre le discours et la réalité.",
        opts: [
          { ar: "مطابقة القول للواقع", fr: "L'adéquation du discours à la réalité", ok: true },
          { ar: "رأي الأغلبية", fr: "L'opinion de la majorité" },
          { ar: "حلم ذهني محض", fr: "Un pur rêve mental" },
          { ar: "إرادة القوة", fr: "La volonté de puissance" },
        ],
      },
      {
        ar: "عند سارتر، الوجود:",
        fr: "Chez Sartre, l'existence :",
        expAr: "الوجود يسبق الماهية، أي أن الإنسان يوجد أولاً ثم يحدد ذاته باختياراته.",
        expFr: "L'existence précède l'essence : l'homme existe d'abord puis se définit par ses choix.",
        opts: [
          { ar: "يسبق الماهية", fr: "Précède l'essence", ok: true },
          { ar: "يتبع الماهية", fr: "Suit l'essence" },
          { ar: "ملغى", fr: "Est annulée" },
          { ar: "خيالي", fr: "Est imaginaire" },
        ],
      },
      {
        ar: "الميتافيزيقا تُعنى بدراسة:",
        fr: "La métaphysique s'occupe de :",
        expAr: "الميتافيزيقا دراسة ما وراء الطبيعة: الوجود، الله، النفس...",
        expFr: "La métaphysique étudie ce qui dépasse la nature : l'être, Dieu, l'âme…",
        opts: [
          { ar: "ما وراء الطبيعة", fr: "Ce qui dépasse la nature", ok: true },
          { ar: "القوانين الفيزيائية", fr: "Les lois physiques" },
          { ar: "علم الاقتصاد", fr: "Les sciences économiques" },
          { ar: "دراسة الألوان", fr: "L'étude des couleurs" },
        ],
      },
    ],
  },
  {
    slug: "connaissance",
    titleAr: "المعرفة والحقيقة",
    titleFr: "Le savoir et la vérité",
    lessonAr: `## المعرفة والحقيقة
كيف نعرف الأشياء؟ مصادر المعرفة متعددة: الحواس، العقل، التجربة، والحدس.

- **التجريبية**: المعرفة مصدرها التجربة الحسية (لوك، هيوم).
- **العقلانية**: المعرفة تصدر عن العقل والفطرة (ديكارت، لايبنتز).
- **الشك المنهجي** عند ديكارت: "أنا أشك إذن أنا أفكر".
- الحقيقة العلمية ليست نهائية؛ فهي قابلة للمراجعة.

### خلاصة
المعرفة بناء مركّب: الإحساس يمدّنا بالمادة، والعقل يضفي الصيغ والعلاقات.`,
    lessonFr: `## Le savoir et la vérité
Comment connaissons-nous les choses ? Les sources du savoir sont multiples : les sens, la raison, l'expérience, l'intuition.

- **L'empirisme** : la connaissance vient de l'expérience sensible (Locke, Hume).
- **Le rationalisme** : la connaissance vient de la raison (Descartes, Leibniz).
- Le doute méthodique de Descartes : « je doute donc je pense ».
- La vérité scientifique n'est pas définitive : elle est révisable.

### Bilan
La connaissance est une construction : la sensation fournit la matière, la raison impose formes et relations.`,
    questions: [
      {
        ar: "الموقف القائل بأن المعرفة مصدرها التجربة الحسية يسمى:",
        fr: "La doctrine selon laquelle le savoir vient de l'expérience s'appelle :",
        expAr: "التجريبية (الإمبيريقية) تنسب المعرفة إلى التجربة الحسية.",
        expFr: "L'empirisme attribue la connaissance à l'expérience sensible.",
        opts: [
          { ar: "التجريبية", fr: "L'empirisme", ok: true },
          { ar: "العقلانية", fr: "Le rationalisme" },
          { ar: "الأفلاطونية", fr: "Le platonisme" },
          { ar: "التصوف", fr: "Le mysticisme" },
        ],
      },
      {
        ar: "« أنا أشك إذن أنا أفكر » مقولة لـ:",
        fr: "« Je doute donc je pense » est une formule de :",
        expAr: "ديكارت أسس الشك المنهجي انطلاقاً من مقولة «أنا أشك إذن أنا أفكر».",
        expFr: "Descartes fonde le doute méthodique sur « je doute donc je pense ».",
        opts: [
          { ar: "ديكارت", fr: "Descartes", ok: true },
          { ar: "نيتشه", fr: "Nietzsche" },
          { ar: "ماركس", fr: "Marx" },
          { ar: "أرسطو", fr: "Aristote" },
        ],
      },
      {
        ar: "عند بوبر، الحقيقة العلمية :",
        fr: "Pour Popper, la vérité scientifique est :",
        expAr: "الحقيقة العلمية قابلة للتكذيب (falsifiability) وليست نهائية.",
        expFr: "La vérité scientifique est falsifiable, jamais définitive.",
        opts: [
          { ar: "قابلة للتكذيب", fr: "Falsifiable", ok: true },
          { ar: "نهائية ومطلقة", fr: "Définitive et absolue" },
          { ar: "بديهية", fr: "Évidente" },
          { ar: "إلهية", fr: "Divine" },
        ],
      },
      {
        ar: "العقلانية تنسب المعرفة إلى:",
        fr: "Le rationalisme attribue la connaissance à :",
        expAr: "العقلانية ترى أن المعرفة تصدر عن العقل والأفكار الفطرية.",
        expFr: "Le rationalisme voit dans la raison la source du savoir.",
        opts: [
          { ar: "العقل", fr: "La raison", ok: true },
          { ar: "الحواس", fr: "Les sens" },
          { ar: "العاطفة", fr: "L'émotion" },
          { ar: "الخيال", fr: "L'imagination" },
        ],
      },
    ],
  },
  {
    slug: "liberte-droits",
    titleAr: "الحرية والواجب",
    titleFr: "Liberté et devoir",
    lessonAr: `## الحرية والواجب
هل الإنسان حرّ؟ المشكل: الحرية ممارسة تُتخذ وتتحقق داخل القانون والمسؤولية.

- **الحرية**: إمكانية الاختيار وتحمل المسؤولية.
- **الواجب**: مطلب أخلاقي وقانوني ينظم الحياة الجماعية.
- حرية الفرد تنتهي حيث تبدأ حرية الآخر.
- المواطنة: حقوق وواجبات متبادلة في إطار دولة الحق والقانون.

### خلاصة
الحرية والواجب وجهان لعملة واحدة: فبدون واجب تتحول الحرية إلى فوضى.`,
    lessonFr: `## Liberté et devoir
L'homme est-il libre ? Problème : la liberté est une pratique qui se conquiert et s'exerce dans la loi et la responsabilité.

- **La liberté** : la possibilité de choisir et d'assumer.
- **Le devoir** : une exigence morale et légale qui organise la vie collective.
- La liberté des uns s'arrête où commence celle des autres.
- La citoyenneté : droits et devoirs réciproques dans l'État de droit.

### Bilan
Liberté et devoir sont inséparables : sans devoir, la liberté devient anarchie.`,
    questions: [
      {
        ar: "الحرية الحقيقية تقتضي:",
        fr: "La vraie liberté suppose :",
        expAr: "الحرية ترتبط بالمسؤولية وتحمل تبعات الاختيار.",
        expFr: "La liberté est liée à la responsabilité et à l'assomption des choix.",
        opts: [
          { ar: "المسؤولية", fr: "La responsabilité", ok: true },
          { ar: "الفوضى", fr: "L'anarchie" },
          { ar: "غياب القانون", fr: "L'absence de loi" },
          { ar: "العزلة", fr: "L'isolement" },
        ],
      },
      {
        ar: "الواجب يمكن تعريفه بأنه:",
        fr: "Le devoir se définit comme :",
        expAr: "الواجب مطلب أخلاقي وقانوني يوجه السلوك الاجتماعي.",
        expFr: "Le devoir est une exigence morale et légale qui oriente la conduite.",
        opts: [
          { ar: "مطلب أخلاقي وقانوني", fr: "Une exigence morale et légale", ok: true },
          { ar: "هبة طبيعية", fr: "Un don naturel" },
          { ar: "رغبة لا تقاوم", fr: "Un désir irrépressible" },
          { ar: "محض صدفة", fr: "Une pure coïncidence" },
        ],
      },
      {
        ar: "مبدأ « حرية الفرد تنتهي عند حرية الآخر »:",
        fr: "Le principe « la liberté commence là où commence celle d'autrui » :",
        expAr: "هذا المبدأ ينظم الحياة الجماعية ويمنع تضارب الحريات.",
        expFr: "Ce principe organise la vie collective et prévient le conflit des libertés.",
        opts: [
          { ar: "ينظم الحياة الجماعية", fr: "Organise la vie collective", ok: true },
          { ar: "يلغي كل حرية", fr: "Supprime toute liberté" },
          { ar: "يبرر الاستبداد", fr: "Justifie la tyrannie" },
          { ar: "بلا أثر عملي", fr: "Sans effet pratique" },
        ],
      },
      {
        ar: "المواطنة تعني:",
        fr: "La citoyenneté implique :",
        expAr: "المواطنة انتماء يترتب عنه حقوق وواجبات تجاه الدولة والمجتمع.",
        expFr: "La citoyenneté est une appartenance qui implique droits et devoirs.",
        opts: [
          { ar: "حقوقاً وواجبات متبادلة", fr: "Des droits et des devoirs réciproques", ok: true },
          { ar: "طاعة عمياء", fr: "Une obéissance aveugle" },
          { ar: "عبادة شخصية", fr: "Un culte de la personne" },
          { ar: "مجرد سكن جغرافي", fr: "Un simple lieu de résidence" },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------- FRANCAIS
const francaisChapters: ChapterDef[] = [
  {
    slug: "textes-argumentatifs",
    titleAr: "النص الحجاجي",
    titleFr: "Le texte argumentatif",
    lessonAr: `## النص الحجاجي
النص الحجاجي نص يهدف إلى إقناع المتلقي برأي معين.

- **الأطروحة**: الفكرة التي يدافع عنها الكاتب.
- **الحجج**: أدلة منطقية أو أمثلة تدعم الأطروحة.
- **الروابط المنطقية**: لكن، وبالتالي، ومن ثم…
- الفرق بين الحجاج والتفسير: الحجاج يطلب الالتزام، والتفسير يوضّح.

### أمثلة
- حجة بالمنطق: استنتاج مبني على قياس سليم.
- حجة بالمثال: حالة واقعية تدعم القول.`,
    lessonFr: `## Le texte argumentatif
Le texte argumentatif vise à convaincre le lecteur d'une thèse.

- **La thèse** : l'idée défendue par l'auteur.
- **Les arguments** : preuves logiques ou exemples qui soutiennent la thèse.
- **Les connecteurs** : mais, donc, par conséquent…
- Distinguer argumentation et explication : l'une engage, l'autre éclaire.

### Exemples
- Argument logique : un raisonnement construit.
- Argument par l'exemple : une situation réelle qui étaye.`,
    questions: [
      {
        ar: "الأطروحة في النص الحجاجي هي:",
        fr: "Dans un texte argumentatif, la thèse est :",
        expAr: "الأطروحة هي الفكرة المركزية التي يدافع عنها الكاتب.",
        expFr: "La thèse est l'idée centrale défendue par l'auteur.",
        opts: [
          { ar: "الفكرة المدافع عنها", fr: "L'idée défendue", ok: true },
          { ar: "الخاتمة", fr: "La conclusion" },
          { ar: "العنوان", fr: "Le titre" },
          { ar: "الحاشية", fr: "La note de bas de page" },
        ],
      },
      {
        ar: "الرابط « لكن » تعبّر عن:",
        fr: "Le connecteur « mais » exprime :",
        expAr: "« لكن » تعبر عن معارضة أو تقييد للرأي السابق.",
        expFr: "« Mais » exprime une opposition ou une concession.",
        opts: [
          { ar: "المعارضة", fr: "L'opposition", ok: true },
          { ar: "التعليل", fr: "La cause" },
          { ar: "الزمان", fr: "Le temps" },
          { ar: "الإضافة", fr: "L'addition" },
        ],
      },
      {
        ar: "الغرض الأساسي من الحجاج:",
        fr: "L'objectif premier de l'argumentation :",
        expAr: "يهدف الحجاج إلى إقناع القارئ أو دفعه إلى الاقتناع.",
        expFr: "L'argumentation vise à convaincre le lecteur.",
        opts: [
          { ar: "إقناع القارئ", fr: "Convaincre le lecteur", ok: true },
          { ar: "تسلية القارئ", fr: "Divertir le lecteur" },
          { ar: "وصف المكان", fr: "Décrire un lieu" },
          { ar: "إطالة النص", fr: "Allonger le texte" },
        ],
      },
      {
        ar: "المثال في النص الحجاجي:",
        fr: "L'exemple dans un texte argumentatif :",
        expAr: "المثال يقوّي الحجة ويجعلها ملموسة وقابلة للتصديق.",
        expFr: "L'exemple renforce l'argument et le rend concret.",
        opts: [
          { ar: "يدعم الحجة", fr: "Renforce l'argument", ok: true },
          { ar: "يناقضها", fr: "Le contredit" },
          { ar: "يحذفها", fr: "Le supprime" },
          { ar: "ينقل عناوين جديدة", fr: "Introduit de nouveaux titres" },
        ],
      },
    ],
  },
  {
    slug: "discours-indirect",
    titleAr: "الأسلوب المباشر وغير المباشر",
    titleFr: "Le discours direct / indirect",
    lessonAr: `## الأسلوب المباشر وغير المباشر
- **المباشر**: نقل كلام المتكلم كما هو بين علامتي تنصيص («…»).
- **غير المباشر**: إعادة صياغته في جملة تابعة بعد فعل ناقل (il dit que…).
- التحويل: تغيير الضمائر، وأزمنة الفعل، ومؤشرات الزمان والمكان.
- مثال: «سأعود غدا» ← Il dit qu'il reviendra le lendemain.

### انتبه
- تحويل الاستفهام: Il demande si…
- تحويل الأمر: Il lui dit de…`,
    lessonFr: `## Le discours direct / indirect
- **Direct** : on rapporte les paroles telles quelles entre guillemets (« … »).
- **Indirect** : on les reformule en subordonnée après un verbe introducteur (il dit que…).
- Conversion : changement des pronoms, des temps verbaux et des indicateurs de temps/lieu.
- Exemple : « Je reviendrai demain » → Il dit qu'il reviendra le lendemain.

### Attention
- Question : Il demande si…
- Ordre : Il lui dit de…`,
    questions: [
      {
        ar: "في الأسلوب غير المباشر:",
        fr: "Dans le discours indirect :",
        expAr: "الكلام المنقول لا يوضع بين علامتي تنصيص.",
        expFr: "Les paroles rapportées ne sont pas entre guillemets.",
        opts: [
          { ar: "لا نستخدم علامات التنصيص", fr: "Pas de guillemets", ok: true },
          { ar: "نستعمل علامات التنصيص", fr: "Des guillemets" },
          { ar: "نرسم صورة", fr: "Un dessin" },
          { ar: "نغيّر الموضوع", fr: "Un changement de sujet" },
        ],
      },
      {
        ar: "«سأسافر» ← Il a dit qu'il…",
        fr: "« Je partirai » → Il a dit qu'il…",
        expAr: "المستقبل بعد فعل ناقل في الماضي يصبح شرطاً (forme en -rait).",
        expFr: "Le futur après un verbe introducteur au passé devient le conditionnel.",
        opts: [
          { ar: "partirait", fr: "partirait", ok: true },
          { ar: "partira", fr: "partira" },
          { ar: "part", fr: "part" },
          { ar: "partait", fr: "partait" },
        ],
      },
      {
        ar: "مؤشر الزمان «غداً» يصبح في غير المباشر:",
        fr: "L'indicateur « demain » devient au discours indirect :",
        expAr: "« غداً » تتحول إلى « le lendemain » عند النقل غير المباشر.",
        expFr: "« demain » devient « le lendemain » au discours indirect.",
        opts: [
          { ar: "le lendemain", fr: "le lendemain", ok: true },
          { ar: "hier", fr: "hier" },
          { ar: "ce jour", fr: "ce jour" },
          { ar: "la veille", fr: "la veille" },
        ],
      },
      {
        ar: "الرابط الأكثر شيوعاً في غير المباشر:",
        fr: "Le connecteur le plus courant au discours indirect :",
        expAr: "الرابط « que » يقدم الجملة المنقولة في غير المباشر.",
        expFr: "« que » introduit la subordonnée au discours indirect.",
        opts: [
          { ar: "que", fr: "que", ok: true },
          { ar: "mais", fr: "mais" },
          { ar: "donc", fr: "donc" },
          { ar: "ou", fr: "ou" },
        ],
      },
    ],
  },
  {
    slug: "production-ecrite",
    titleAr: "الإنشاء الأدبي",
    titleFr: "La production écrite",
    lessonAr: `## الإنشاء الأدبي (المقال)
خطوات كتابة المقالة:
1. **الفهم**: قراءة الموضوع واستخراج المطلوب.
2. **التخطيط**: بناء مخطط متوازن (مقدمة، عرض، خاتمة).
3. **الصياغة**: فقرات مترابطة بأدوات الربط وأمثلة دقيقة.
4. **المراجعة**: التدقيق النحوي والإملائي والأسلوبي.

### نصائح
- التزم بسؤال الموضوع.
- نوّع الجمل (خبرية، استفهامية، نافية).
- اختم بخلاصة تركّب الأفكار المطروحة.`,
    lessonFr: `## La production écrite (la dissertation)
Étapes pour rédiger :
1. **Comprendre** : lire le sujet et repérer la consigne.
2. **Planifier** : élaborer un plan (introduction, développement, conclusion).
3. **Rédiger** : des paragraphes liés par des connecteurs, avec des exemples précis.
4. **Réviser** : vérifier syntaxe, orthographe et style.

### Conseils
- Restez dans le sujet.
- Variez les phrases (déclaratives, interrogatives, négatives).
- Terminez par une synthèse des idées.`,
    questions: [
      {
        ar: "الخطوة الأولى في كتابة المقال:",
        fr: "La première étape de la dissertation :",
        expAr: "البداية تكون بفهم الموضوع وتحديد المطلوب قبل أي كتابة.",
        expFr: "On commence par comprendre le sujet et la consigne.",
        opts: [
          { ar: "فهم الموضوع", fr: "Comprendre le sujet", ok: true },
          { ar: "كتابة الخاتمة", fr: "Écrire la conclusion" },
          { ar: "التزيين", fr: "L'ornement" },
          { ar: "النسخ", fr: "La copie" },
        ],
      },
      {
        ar: "وظيفة المقدمة:",
        fr: "Le rôle de l'introduction :",
        expAr: "المقدمة تطرح الموضوع والإشكال وتحدد المنهج.",
        expFr: "L'introduction pose le sujet, le problème et annonce le plan.",
        opts: [
          { ar: "طرح الموضوع والإشكال", fr: "Pose le sujet et le problème", ok: true },
          { ar: "الإطالة", fr: "Allonger le texte" },
          { ar: "الحواشي", fr: "Les notes de bas de page" },
          { ar: "الترجمة", fr: "La traduction" },
        ],
      },
      {
        ar: "فقرات المقال ترتبط بواسطة:",
        fr: "Les paragraphes sont reliés par :",
        expAr: "أدوات الربط المنطقية تضمن تماسك الفقرات.",
        expFr: "Les connecteurs logiques assurent la cohérence des paragraphes.",
        opts: [
          { ar: "أدوات الربط المنطقية", fr: "Les connecteurs logiques", ok: true },
          { ar: "علامات التنصيص فقط", fr: "Les guillemets seulement" },
          { ar: "الحواشي", fr: "Les notes" },
          { ar: "الصور", fr: "Les images" },
        ],
      },
      {
        ar: "الخاتمة تقدم عموماً:",
        fr: "La conclusion présente généralement :",
        expAr: "الخاتمة تقوم بتركيب الأفكار وطرح نتيجة أو انفتاح.",
        expFr: "La conclusion synthétise les idées et propose un aboutissement.",
        opts: [
          { ar: "خلاصة مركبة", fr: "Une synthèse", ok: true },
          { ar: "سؤالاً جديداً فقط", fr: "Une nouvelle question seulement" },
          { ar: "صورة", fr: "Une image" },
          { ar: "قائمة مراجع", fr: "Une bibliographie" },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------- ANGLAIS
const anglaisChapters: ChapterDef[] = [
  {
    slug: "tenses",
    titleAr: "الأزمنة الإنجليزية",
    titleFr: "English tenses",
    lessonAr: `## الأزمنة الإنجليزية
- **Present Simple**: حقائق وعادات (He works daily).
- **Present Perfect**: نتيجة رابطة بالماضي (I have finished).
- **Past Simple**: حدث منتهٍ في الماضي (She left at 8).
- **Future**: will/won't + فعل مجرد، و be going to للتخطيط.

### مفاتيح
- always, usually → present simple
- already, just, yet → present perfect
- yesterday, last week → past simple
- tomorrow, next → future`,
    lessonFr: `## Les temps anglais
- **Présent simple** : faits et habitudes (He works daily).
- **Present perfect** : résultat lié au passé (I have finished).
- **Prétérit** : action terminée (She left at 8).
- **Futur** : will/won't + base verbale, be going to pour un projet.

### Indices
- always, usually → présent simple
- already, just, yet → present perfect
- yesterday, last week → prétérit
- tomorrow, next → futur`,
    questions: [
      {
        ar: "أكمل: She … to school every day.",
        fr: "Complète : She … to school every day.",
        expAr: "كل يوم = عادة، نستعمل present simple (go → goes مع she).",
        expFr: "Every day = habitude → présent simple (go → goes).",
        opts: [
          { ar: "goes", fr: "goes", ok: true },
          { ar: "go", fr: "go" },
          { ar: "gone", fr: "gone" },
          { ar: "going", fr: "going" },
        ],
      },
      {
        ar: "أكمل: I … my homework already.",
        fr: "Complète : I … my homework already.",
        expAr: "already تدل على present perfect: have done.",
        expFr: "Already indique le present perfect : have done.",
        opts: [
          { ar: "have done", fr: "have done", ok: true },
          { ar: "did", fr: "did" },
          { ar: "will do", fr: "will do" },
          { ar: "do", fr: "do" },
        ],
      },
      {
        ar: "أكمل: He … to Marrakech yesterday.",
        fr: "Complète : He … to Marrakech yesterday.",
        expAr: "yesterday تدل على الماضي البسيط: went.",
        expFr: "Yesterday indique le prétérit : went.",
        opts: [
          { ar: "went", fr: "went", ok: true },
          { ar: "has gone", fr: "has gone" },
          { ar: "goes", fr: "goes" },
          { ar: "will go", fr: "will go" },
        ],
      },
      {
        ar: "أكمل: They … visit us next week.",
        fr: "Complète : They … visit us next week.",
        expAr: "next week = مستقبل → will + فعل مجرد.",
        expFr: "Next week = futur → will + base verbale.",
        opts: [
          { ar: "will", fr: "will", ok: true },
          { ar: "did", fr: "did" },
          { ar: "have", fr: "have" },
          { ar: "—", fr: "— (rien)" },
        ],
      },
    ],
  },
  {
    slug: "functions",
    titleAr: "الوظائف اللغوية",
    titleFr: "Language functions",
    lessonAr: `## الوظائف اللغوية
- **طلب المساعدة**: Can you…? Could you…?
- **الاعتذار**: I'm sorry for…, I apologize for…
- **النصيحة**: You'd better…, You should…
- **إبداء الرأي**: In my opinion…, I think…
- **الاقتراح**: What about…? Why don't we…?

### أمثلة
- Asking for help: Could you help me, please?
- Giving advice: You should revise before the exam.`,
    lessonFr: `## Les fonctions langagières
- **Demander** : Can you…? Could you…?
- **S'excuser** : I'm sorry for…, I apologize for…
- **Conseiller** : You'd better…, You should…
- **Donner son opinion** : In my opinion…, I think…
- **Suggérer** : What about…? Why don't we…?

### Exemples
- Demander : Could you help me, please ?
- Conseiller : You should revise before the exam.`,
    questions: [
      {
        ar: "أكثر طلب مهذّب لطلب المساعدة:",
        fr: "La demande d'aide la plus polie :",
        expAr: "Could you…? صيغة مهذبة لطلب المساعدة.",
        expFr: "Could you…? est la forme polie pour demander de l'aide.",
        opts: [
          { ar: "Could you help me?", fr: "Could you help me?", ok: true },
          { ar: "You help me!", fr: "You help me!" },
          { ar: "I want help!", fr: "I want help!" },
          { ar: "Help me now!", fr: "Help me now!" },
        ],
      },
      {
        ar: "« You'd better study » تعبر عن:",
        fr: "« You'd better study » exprime :",
        expAr: "You'd better = نصيحة أو توصية قوية.",
        expFr: "You'd better = une recommandation / un conseil.",
        opts: [
          { ar: "نصيحة", fr: "Un conseil", ok: true },
          { ar: "سؤالاً", fr: "Une question" },
          { ar: "تحية", fr: "Une salutation" },
          { ar: "اعتذاراً", fr: "Une excuse" },
        ],
      },
      {
        ar: "« In my opinion » تعبّر عن:",
        fr: "« In my opinion » exprime :",
        expAr: "In my opinion مدخل لإبداء الرأي الشخصي.",
        expFr: "In my opinion introduit l'opinion personnelle.",
        opts: [
          { ar: "الرأي", fr: "L'opinion", ok: true },
          { ar: "التعجب", fr: "L'exclamation" },
          { ar: "السؤال", fr: "La question" },
          { ar: "التحية", fr: "La salutation" },
        ],
      },
      {
        ar: "لاقتراح فكرة نستعمل:",
        fr: "Pour suggérer une idée, on utilise :",
        expAr: "Why don't we…? صيغة اقتراح.",
        expFr: "Why don't we…? est une formule de suggestion.",
        opts: [
          { ar: "Why don't we go?", fr: "Why don't we go?", ok: true },
          { ar: "Goodbye!", fr: "Goodbye!" },
          { ar: "Thank you!", fr: "Thank you!" },
          { ar: "Never mind!", fr: "Never mind!" },
        ],
      },
    ],
  },
  {
    slug: "writings",
    titleAr: "كتابة الإنشاء",
    titleFr: "English writing",
    lessonAr: `## أنواع الإنشاء بالإنجليزية
- **Opinion essay**: مقدمة، رأي + أسباب، خاتمة.
- **For and against**: مقارنة الإيجابيات والسلبيات.
- **Report**: بنية رسمية (title, introduction, findings, recommendation).

### أدوات الربط
- firstly, moreover, however, finally, in conclusion.`,
    lessonFr: `## Les types d'écrits (Writing)
- **Opinion essay** : introduction, opinion + raisons, conclusion.
- **For and against** : comparer les avantages et les inconvénients.
- **Report** : structure formelle (titre, introduction, résultats, recommandation).

### Connecteurs
- firstly, moreover, however, finally, in conclusion.`,
    questions: [
      {
        ar: "مقدمة مقال الرأي تعرض:",
        fr: "L'introduction d'un opinion essay présente :",
        expAr: "المقدمة تقدم الموضوع وموقف الكاتب منه.",
        expFr: "L'introduction présente le sujet et la position de l'auteur.",
        opts: [
          { ar: "الموضوع والرأي", fr: "Le sujet et l'opinion", ok: true },
          { ar: "الحواشي", fr: "Les notes" },
          { ar: "المراجع فقط", fr: "Les références seulement" },
          { ar: "النتائج فقط", fr: "Les résultats seulement" },
        ],
      },
      {
        ar: "كلمة « however » تعني:",
        fr: "« however » signifie :",
        expAr: "however = مع ذلك / لكن من ناحية أخرى.",
        expFr: "however = cependant / néanmoins.",
        opts: [
          { ar: "مع ذلك", fr: "Cependant", ok: true },
          { ar: "لذلك", fr: "Donc" },
          { ar: "أولاً", fr: "D'abord" },
          { ar: "أخيراً", fr: "Enfin" },
        ],
      },
      {
        ar: "التقرير (report) يُختم عادة بـ:",
        fr: "Un report se termine généralement par :",
        expAr: "التقرير ينتهي بتوصية (recommendation).",
        expFr: "Un report se conclut par une recommandation.",
        opts: [
          { ar: "توصية", fr: "Une recommandation", ok: true },
          { ar: "ثمن", fr: "Un prix" },
          { ar: "قفزة", fr: "Un saut" },
          { ar: "صورة", fr: "Une image" },
        ],
      },
      {
        ar: "« firstly, moreover, finally » أمثلة على:",
        fr: "« firstly, moreover, finally » sont des :",
        expAr: "هذه كلمات ربط ترتب الأفكار في النص.",
        expFr: "Ce sont des connecteurs qui organisent les idées.",
        opts: [
          { ar: "أدوات الربط", fr: "Connecteurs", ok: true },
          { ar: "أزمنة", fr: "Temps" },
          { ar: "أفعال", fr: "Verbes" },
          { ar: "صفات", fr: "Adjectifs" },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------- ARABE
const arabeChapters: ChapterDef[] = [
  {
    slug: "balagha",
    titleAr: "البلاغة",
    titleFr: "La rhétorique (balagha)",
    lessonAr: `## البلاغة
البلاغة علم يبحث في جمالية التعبير وقوته.

- **التشبيه**: تشبيه شيء بشيء (هو كالقمر في جماله).
- **الاستعارة**: تشبيه حُذف أحد طرفيه (أسد يزأر في المعركة).
- **الكناية**: تعبير لا يُقصد به المعنى الحرفي.
- **الطباق**: الجمع بين المتضادات في الجملة.

### مثال محلول
«الجهل ظلام والعلم نور» → طباق بين الباطن والظاهر.`,
    lessonFr: `## La rhétorique (balagha)
La balagha étudie la beauté de l'expression.

- **La comparaison** : comme la lune, comme une armée…
- **La métaphore** : comparaison sans outil (un lion rugit).
- **L'allusion (kinaya)** : dire sans nommer directement.
- **Le contraste (tibaq)** : rapprocher des contraires.

### Exemple corrigé
« L'ignorance est une ténèbre, le savoir une lumière » → tibaq.`,
    questions: [
      {
        ar: "« هو كالقمر في جماله » مثال عن:",
        fr: "« Il est comme la lune » est un exemple de :",
        expAr: "وجود أداة التشبيه « كـ » يعني أننا أمام تشبيه.",
        expFr: "La présence de l'outil « comme » indique une comparaison.",
        opts: [
          { ar: "التشبيه", fr: "La comparaison", ok: true },
          { ar: "الاستعارة", fr: "La métaphore" },
          { ar: "الكناية", fr: "La kinaya" },
          { ar: "الطباق", fr: "Le tibaq" },
        ],
      },
      {
        ar: "تقوم الاستعارة على:",
        fr: "La métaphore repose sur :",
        expAr: "الاستعارة تشبيه حُذف أحد طرفيه مع بقاء المصحة.",
        expFr: "La métaphore est une comparaison amputée d'un de ses termes.",
        opts: [
          { ar: "حذف أحد طرفي التشبيه", fr: "La suppression d'un terme", ok: true },
          { ar: "إضافة أداة التشبيه", fr: "L'ajout d'un outil" },
          { ar: "دعم الموسيقى", fr: "Le renfort musical" },
          { ar: "النقل الحرفي", fr: "La traduction littérale" },
        ],
      },
      {
        ar: "الطباق هو الجمع بين:",
        fr: "Le tibaq consiste à rapprocher :",
        expAr: "الطباق يقرن بين اللفظين المتضادين.",
        expFr: "Le tibaq associe deux termes antonymes.",
        opts: [
          { ar: "المتضادين", fr: "Les antonymes", ok: true },
          { ar: "المترادفين", fr: "Les synonymes" },
          { ar: "الحروف", fr: "Les lettres" },
          { ar: "الأعداد", fr: "Les nombres" },
        ],
      },
      {
        ar: "الكناية تعبير:",
        fr: "La kinaya est une expression :",
        expAr: "الكناية تبتعد عن المعنى الحرفي إلى معنى ضمني.",
        expFr: "La kinaya s'écarte du sens littéral vers un sens implicite.",
        opts: [
          { ar: "غير حرفي المعنى", fr: "Non littérale", ok: true },
          { ar: "حرفي تماماً", fr: "Tout à fait littérale" },
          { ar: "صوتي فقط", fr: "Uniquement sonore" },
          { ar: "عددي", fr: "Numérique" },
        ],
      },
    ],
  },
  {
    slug: "riwaya",
    titleAr: "القصة والرواية",
    titleFr: "Le roman et la nouvelle",
    lessonAr: `## القصة والرواية
- **الرواية**: جنس أدبي سردي نثري طويل بأحداث وشخصيات متعددة.
- **البناء**: عقدة، حبكة، شخصيات، زمن، مكان، راوٍ.
- **الراوي**: عالم (ضمير الغائب) أو مشارك (ضمير المتكلم).
- دراسة مقطع: استخراج الشخصيات والأحداث ووظائف السرد.

### مصطلحات
- الحبكة: تسلسل الأحداث وترابطها.
- الراوي: من يسرد الأحداث.`,
    lessonFr: `## Le roman et la nouvelle
- **Le roman** : genre narratif en prose, long, avec une intrigue et des personnages.
- **La narration** : intrigue, personnages, temps, espace, narrateur.
- **Le narrateur** : omniscient (il) ou participant (je).
- Étudier un extrait : repérer personnages, événements et fonctions.

### Vocabulaire
- L'intrigue : l'enchaînement des événements.
- Le narrateur : celui qui raconte.`,
    questions: [
      {
        ar: "الرواية جنس أدبي:",
        fr: "Le roman est un genre :",
        expAr: "الرواية جنس سردي نثري طويل.",
        expFr: "Le roman est un genre narratif en prose, long.",
        opts: [
          { ar: "سردي نثري", fr: "Narratif en prose", ok: true },
          { ar: "شعري", fr: "Poétique" },
          { ar: "مسرحي", fr: "Théâtral" },
          { ar: "خطابي", fr: "Oratoire" },
        ],
      },
      {
        ar: "الراوي الذي يقول «هو» :",
        fr: "Le narrateur qui dit « il » est :",
        expAr: "الراوي العالم يسرد بضمير الغائب.",
        expFr: "Le narrateur omniscient raconte à la troisième personne.",
        opts: [
          { ar: "راوٍ عالم", fr: "Un narrateur omniscient", ok: true },
          { ar: "راوٍ مشارك", fr: "Un narrateur personnage" },
          { ar: "راوٍ غائب", fr: "Un narrateur absent" },
          { ar: "متكلم مفرد", fr: "Un narrateur je" },
        ],
      },
      {
        ar: "« الحبكة » تعني:",
        fr: "« L'intrigue » désigne :",
        expAr: "الحبكة هي تسلسل الأحداث داخل الرواية.",
        expFr: "L'intrigue est l'enchaînement des événements.",
        opts: [
          { ar: "تسلسل الأحداث", fr: "L'enchaînement des événements", ok: true },
          { ar: "الحوار وحده", fr: "Le seul dialogue" },
          { ar: "العنوان فقط", fr: "Le seul titre" },
          { ar: "الصفحات الأولى", fr: "Les premières pages" },
        ],
      },
      {
        ar: "الزمان والمكان من عناصر:",
        fr: "L'espace et le temps sont des éléments :",
        expAr: "الزمان والمكان عنصران أساسيان في البناء السردي.",
        expFr: "L'espace et le temps sont des éléments du récit.",
        opts: [
          { ar: "السرد", fr: "Du récit", ok: true },
          { ar: "العروض", fr: "La métrique" },
          { ar: "البلاغة وحدها", fr: "De la seule balagha" },
          { ar: "اللغة الصوتية", fr: "De la phonétique" },
        ],
      },
    ],
  },
  {
    slug: "nawari",
    titleAr: "النثر والشعر",
    titleFr: "La prose et la poésie",
    lessonAr: `## النثر والشعر
- **الشعر**: نص موزون ومقفى؛ أنواعه: الغزل، المدح، الرثاء، الهجاء.
- **النثر**: نصوص غير موزونة (مقالة، خطابة، قصة).
- **العروض**: دراسة الوزن والقافية.
- المقارنة: الشعر يعتمد الموسيقى، والنثر يعتمد الفكرة المباشرة.`,
    lessonFr: `## La prose et la poésie
- **La poésie** : texte versifié et rimé ; genres : ghazal, éloge, élégie, satire.
- **La prose** : textes non versifiés (essai, discours, récit).
- **La métrique** : études du mètre et de la rime.
- Comparaison : la poésie joue sur la musique, la prose sur l'idée directe.`,
    questions: [
      {
        ar: "الشعر يتميز بـ:",
        fr: "La poésie se caractérise par :",
        expAr: "الشعر موزون ومقفى في جل قواعده.",
        expFr: "La poésie est versifiée et rimée.",
        opts: [
          { ar: "الوزن والقافية", fr: "Le mètre et la rime", ok: true },
          { ar: "غياب المعنى", fr: "L'absence de sens" },
          { ar: "النثر المطلق", fr: "La prose absolue" },
          { ar: "الإقصاء الدائم", fr: "L'exclusion permanente" },
        ],
      },
      {
        ar: "من أنواع الشعر:",
        fr: "Parmi les genres poétiques :",
        expAr: "المدح نوع شعري يثني على الممدوح.",
        expFr: "L'éloge (madih) est un genre poétique.",
        opts: [
          { ar: "المدح", fr: "L'éloge (madih)", ok: true },
          { ar: "التقرير", fr: "Le rapport" },
          { ar: "الميزانية", fr: "Le bilan" },
          { ar: "الملخص", fr: "Le résumé" },
        ],
      },
      {
        ar: "الخطابة تنتمي إلى:",
        fr: "L'éloquence (khitaba) appartient à :",
        expAr: "الخطابة نثر يعتمد الإقناع والتأثير.",
        expFr: "La khitaba est un discours en prose.",
        opts: [
          { ar: "النثر", fr: "La prose", ok: true },
          { ar: "الشعر", fr: "La poésie" },
          { ar: "العروض", fr: "La métrique" },
          { ar: "الإنشاد", fr: "Le chant" },
        ],
      },
      {
        ar: "القافية هي:",
        fr: "La rime (qafiya) est :",
        expAr: "القافية نهاية مقفاة تتكرر في الأبيات.",
        expFr: "La qafiya est la terminaison rimée des vers.",
        opts: [
          { ar: "نهاية مقفاة للأبيات", fr: "La fin rimée des vers", ok: true },
          { ar: "بداية القصيدة", fr: "Le début du poème" },
          { ar: "اسم الشاعر", fr: "Le nom du poète" },
          { ar: "نوع الخط", fr: "Le type d'écriture" },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------- TARBIA ISLAMIA
const tarbiaChapters: ChapterDef[] = [
  {
    slug: "aqida",
    titleAr: "العقيدة والتوحيد",
    titleFr: "Croyance et Tawhid",
    lessonAr: `## العقيدة والتوحيد
- **التوحيد**: إفراد الله بالعبادة والربوبية والأسماء والصفات.
- **آثاره**: الاطمئنان، والتحرر من الخوف والشرك.
- **مصادر العقيدة**: القرآن الكريم والسنة النبوية والإجماع.
- من المقاصد: صلاح القلب واستقامة السلوك.`,
    lessonFr: `## La croyance et le Tawhid
- **Le Tawhid** : vouer à Allah l'adoration, la seigneurie et les noms/attributs.
- **Effets** : quiétude du cœur, libération de la peur et de l'association.
- **Sources** : le Coran, la Sunna et le consensus (ijma).
- Finalité : droiture du cœur et de la conduite.`,
    questions: [
      {
        ar: "التوحيد هو إفراد الله بـ:",
        fr: "Le Tawhid, c'est vouer à Allah :",
        expAr: "التوحيد يشمل العبادة والربوبية والأسماء والصفات.",
        expFr: "Le Tawhid englobe l'adoration, la seigneurie et les attributs.",
        opts: [
          { ar: "العبادة والربوبية والأسماء والصفات", fr: "L'adoration, la seigneurie, les noms et attributs", ok: true },
          { ar: "المال فقط", fr: "Les biens seulement" },
          { ar: "المكان فقط", fr: "Le lieu seulement" },
          { ar: "الشهرة", fr: "La célébrité" },
        ],
      },
      {
        ar: "من آثار التوحيد:",
        fr: "Parmi les effets du Tawhid :",
        expAr: "التوحيد يجلب الطمأنينة والتحرر من الشرك.",
        expFr: "Le Tawhid apporte la quiétude et libère de l'association.",
        opts: [
          { ar: "اطمئنان القلب", fr: "La quiétude du cœur", ok: true },
          { ar: "الخوف", fr: "La peur" },
          { ar: "الحيرة", fr: "La perplexité" },
          { ar: "الغرور", fr: "L'orgueil" },
        ],
      },
      {
        ar: "مصادر العقيدة الإسلامية:",
        fr: "Les sources de la croyance islamique :",
        expAr: "العقيدة مبنية على القرآن والسنة والإجماع.",
        expFr: "La croyance se fonde sur le Coran, la Sunna et le consensus.",
        opts: [
          { ar: "القرآن والسنة والإجماع", fr: "Le Coran, la Sunna et l'ijma", ok: true },
          { ar: "الرأي الشخصي", fr: "L'opinion personnelle" },
          { ar: "الأحلام", fr: "Les rêves" },
          { ar: "الأساطير", fr: "Les mythes" },
        ],
      },
      {
        ar: "ضد التوحيد هو:",
        fr: "Le contraire du Tawhid est :",
        expAr: "الشرك هو نقيض التوحيد.",
        expFr: "L'association (chirk) est le contraire du Tawhid.",
        opts: [
          { ar: "الشرك", fr: "Le chirk", ok: true },
          { ar: "العلم", fr: "Le savoir" },
          { ar: "العمل", fr: "L'action" },
          { ar: "الصبر", fr: "La patience" },
        ],
      },
    ],
  },
  {
    slug: "ibadat",
    titleAr: "العبادات",
    titleFr: "Les actes d'adoration",
    lessonAr: `## العبادات
- **الصلاة**: عمود الدين؛ شروطها وأركانها وفضل أدائها.
- **الزكاة**: حق الله في المال؛ تطهر المال وتزكي النفوس.
- **الصوم**: تزكية للنفس وشكر للنعم.
- **الحج**: لقاء المسلمين وطاعة الله لمن استطاع إليه سبيلاً.`,
    lessonFr: `## Les actes d'adoration
- **La prière (salat)** : pilier de la religion ; conditions, piliers et mérite.
- **La zakat** : droit de Dieu sur les biens ; purifie les biens et les âmes.
- **Le jeûne (siyam)** : purification de l'âme et gratitude.
- **Le pèlerinage (hajj)** : rencontre des musulmans, pour qui en a les moyens.`,
    questions: [
      {
        ar: "عمود الدين هو:",
        fr: "Le pilier de la religion est :",
        expAr: "الصلاة عمود الدين.",
        expFr: "La prière (salat) est le pilier de la religion.",
        opts: [
          { ar: "الصلاة", fr: "La salat", ok: true },
          { ar: "شرب الماء", fr: "Boire de l'eau" },
          { ar: "السفر", fr: "Le voyage" },
          { ar: "الترفيه", fr: "Le divertissement" },
        ],
      },
      {
        ar: "الزكاة تطهر:",
        fr: "La zakat purifie :",
        expAr: "الزكاة تطهر المال وتزكي النفوس.",
        expFr: "La zakat purifie les biens et les âmes.",
        opts: [
          { ar: "المال والنفس", fr: "Les biens et l'âme", ok: true },
          { ar: "الطعام فقط", fr: "La nourriture seulement" },
          { ar: "الملابس", fr: "Les vêtements" },
          { ar: "الأثاث", fr: "Les meubles" },
        ],
      },
      {
        ar: "فرض الحج على:",
        fr: "Le hajj est obligatoire pour :",
        expAr: "الحج واجب على المستطيع.",
        expFr: "Le hajj est obligatoire pour celui qui en a les moyens.",
        opts: [
          { ar: "المستطيع", fr: "Celui qui en a les moyens", ok: true },
          { ar: "جميع الناس بدونه", fr: "Tout le monde sans condition" },
          { ar: "الأطفال فقط", fr: "Les enfants seulement" },
          { ar: "غير المسلمين", fr: "Les non-musulmans" },
        ],
      },
      {
        ar: "من مقاصد الصوم:",
        fr: "Parmi les finalités du jeûne :",
        expAr: "الصوم تزكية للنفس وتعويد على التقوى.",
        expFr: "Le jeûne vise la purification de l'âme et la piété.",
        opts: [
          { ar: "تزكية النفس", fr: "La purification de l'âme", ok: true },
          { ar: "إضعاف الجسد", fr: "L'affaiblissement du corps" },
          { ar: "العزلة", fr: "L'isolement" },
          { ar: "البخل", fr: "L'avarice" },
        ],
      },
    ],
  },
  {
    slug: "akhlaq",
    titleAr: "القيم والأخلاق الإسلامية",
    titleFr: "Valeurs et éthique islamique",
    lessonAr: `## القيم والأخلاق
- **الصدق والأمانة**: أساس التعامل والمعاملات.
- **العدل والرحمة**: من مقاصد الشريعة.
- **بر الوالدين وصلة الرحم**: من أعظم الطاعات.
- حسن المعاملة للجيران والرفق بالمخلوقات.`,
    lessonFr: `## Valeurs et éthique
- **La véracité et la confiance** : fondements des relations.
- **La justice et la miséricorde** : objectifs de la chari'a.
- **Honorer ses parents et maintenir les liens de parenté** : grands actes d'adoration.
- Bien traiter le voisin et la création.`,
    questions: [
      {
        ar: "« الأمانة » تعني:",
        fr: "« L'amana » (confiance) signifie :",
        expAr: "الأمانة أداء الحقوق والحفاظ على الودائع.",
        expFr: "L'amana consiste à rendre les droits et garder les dépôts.",
        opts: [
          { ar: "أداء الحقوق والحفاظ على الودائع", fr: "Rendre les droits et garder les dépôts", ok: true },
          { ar: "الكسل", fr: "La paresse" },
          { ar: "الغش", fr: "La tricherie" },
          { ar: "البخل", fr: "L'avarice" },
        ],
      },
      {
        ar: "بر الوالدين:",
        fr: "Honorer ses parents est :",
        expAr: "بر الوالدين من أعظم الطاعات والقربات.",
        expFr: "Honorer ses parents est un des plus grands actes d'adoration.",
        opts: [
          { ar: "من أعظم الطاعات", fr: "Un des plus grands actes d'adoration", ok: true },
          { ar: "مستحب فقط", fr: "Seulement recommandé" },
          { ar: "مكروه", fr: "Détestable" },
          { ar: "محرم", fr: "Interdit" },
        ],
      },
      {
        ar: "العدل قيمة:",
        fr: "La justice (adl) est une valeur :",
        expAr: "العدل من مقاصد الشريعة الغراء.",
        expFr: "La justice est un objectif majeur de la chari'a.",
        opts: [
          { ar: "من مقاصد الشريعة", fr: "Un objectif de la chari'a", ok: true },
          { ar: "اختيارية", fr: "Facultative" },
          { ar: "حديثة فقط", fr: "Seulement moderne" },
          { ar: "غربية فقط", fr: "Seulement occidentale" },
        ],
      },
      {
        ar: "صلة الرحم تعني:",
        fr: "Le maintien des liens de parenté (silat al-rahim) :",
        expAr: "صلة الرحم زيارة الأقارب والإحسان إليهم.",
        expFr: "Silat al-rahim consiste à visiter et aider la famille.",
        opts: [
          { ar: "زيارة الأقارب والإحسان إليهم", fr: "Visiter et aider les proches", ok: true },
          { ar: "مقاطعتهم", fr: "Les couper" },
          { ar: "نسيانهم", fr: "Les oublier" },
          { ar: "الخصام معهم", fr: "Se disputer avec eux" },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------- SVT (option SM)
const svtChapters: ChapterDef[] = [
  {
    slug: "genetique-humaine",
    titleAr: "الوراثة البشرية",
    titleFr: "Génétique humaine",
    lessonAr: `## الوراثة البشرية
- **الأنماط الوراثية**: دراسة انتقال الصفات في العائلات عبر شجرة الأنساب.
- **الصبيحات الجنسية**: XX عند الأنثى، XY عند الذكر.
- **الأمراض الوراثية**: مرتبطة بأليلات منحرفة (البيلة الفينيل كيتونية…).
- شجرة النسب تحدد النمط: مسيطر، متنحٍّ، أو مرتبط بالجنس.`,
    lessonFr: `## Génétique humaine
- **Anthropogénétique** : étude de la transmission des caractères via l'arbre généalogique.
- **Chromosomes sexuels** : XX chez la femme, XY chez l'homme.
- **Maladies héréditaires** : liées à des allèles anormaux (phénylcétonurie…).
- L'arbre généalogique révèle le mode de transmission : dominant, récessif, lié au sexe.`,
    questions: [
      {
        ar: "الصبيحات الجنسية عند الأنثى:",
        fr: "Les chromosomes sexuels de la femme sont :",
        expAr: "الأنثى تحمل صبيحين X (XX).",
        expFr: "La femme porte deux chromosomes X (XX).",
        opts: [
          { ar: "XX", fr: "XX", ok: true },
          { ar: "XY", fr: "XY" },
          { ar: "YY", fr: "YY" },
          { ar: "XZ", fr: "XZ" },
        ],
      },
      {
        ar: "لدراسة الوراثة البشرية نعتمد على:",
        fr: "Pour étudier l'hérédité humaine, on utilise :",
        expAr: "شجرة النسب (arbre généalogique) أداة أساسية في الوراثة البشرية.",
        expFr: "L'arbre généalogique est l'outil de base de la génétique humaine.",
        opts: [
          { ar: "شجرة النسب", fr: "L'arbre généalogique", ok: true },
          { ar: "الخلية العصبية", fr: "La cellule nerveuse" },
          { ar: "بيت زجاجي", fr: "Une serre" },
          { ar: "عدسة فقط", fr: "Une simple loupe" },
        ],
      },
      {
        ar: "صفة متنحية تظهر عند النمط:",
        fr: "Un caractère récessif s'exprime chez les sujets :",
        expAr: "الصفة المتنحية تظهر عند الأفراد المتماثلي الأليلات (homozygotes).",
        expFr: "Le caractère récessif s'exprime chez les homozygotes.",
        opts: [
          { ar: "المتماثل الأليلات", fr: "Homozygotes", ok: true },
          { ar: "المغاير", fr: "Hétérozygotes" },
          { ar: "بلا أليلات", fr: "Sans allèles" },
          { ar: "خامل", fr: "Inactifs" },
        ],
      },
      {
        ar: "مرض مرتبط بالصبغي X يصيب غالباً:",
        fr: "Une maladie liée au chromosome X touche surtout :",
        expAr: "الذكور يحملون X واحدا، فيظهر المرض عندهم كثيراً.",
        expFr: "L'homme n'a qu'un X, la maladie liée au X l'atteint plus souvent.",
        opts: [
          { ar: "الذكور", fr: "Les hommes", ok: true },
          { ar: "الإناث", fr: "Les femmes" },
          { ar: "الأطفال فقط", fr: "Les enfants seulement" },
          { ar: "كبار السن فقط", fr: "Les personnes âgées seulement" },
        ],
      },
    ],
  },
  {
    slug: "immunologie",
    titleAr: "علم المناعة",
    titleFr: "Immunologie (option SM)",
    lessonAr: `## علم المناعة
- **الدفاع اللانوعي**: حواجز طبيعية (الجلد، المخاط)، الالتهاب، البلعمة.
- **الدفاع النوعي**: الأجسام المضادة (المناعة الخلطية) واللمفاويات (المناعة الخلوية).
- **اللقاح**: مناعة اصطناعية بطيئة التنشيط وطويلة الأمد.
- **المصل**: نقل أضداد جاهزة (مناعة عاجلة).`,
    lessonFr: `## Immunologie
- **Défense non spécifique** : barrières naturelles (peau, mucus), inflammation, phagocytose.
- **Défense spécifique** : anticorps (humorale) et lymphocytes (cellulaire).
- **Vaccin** : immunité artificielle, activation lente mais durable.
- **Sérum** : apport d'anticorps prêts (immunité immédiate).`,
    questions: [
      {
        ar: "المناعة النوعية تعتمد على:",
        fr: "L'immunité spécifique repose sur :",
        expAr: "المناعة النوعية تشمل الأجسام المضادة واللمفاويات المختصة.",
        expFr: "L'immunité spécifique mobilise anticorps et lymphocytes spécialisés.",
        opts: [
          { ar: "الأجسام المضادة واللمفاويات", fr: "Les anticorps et les lymphocytes", ok: true },
          { ar: "الجلد فقط", fr: "La peau seulement" },
          { ar: "المخاط فقط", fr: "Le mucus seulement" },
          { ar: "الحرارة فقط", fr: "La température seulement" },
        ],
      },
      {
        ar: "اللقاح يمنح مناعة:",
        fr: "Le vaccin procure une immunité :",
        expAr: "اللقاح يعطي مناعة طويلة الأمد بعد تنشيط الجهاز المناعي.",
        expFr: "Le vaccin donne une immunité durable.",
        opts: [
          { ar: "طويلة الأمد", fr: "Durable", ok: true },
          { ar: "معدومة", fr: "Nulle" },
          { ar: "لحظية فقط", fr: "Immédiate seulement" },
          { ar: "جينية", fr: "Génique" },
        ],
      },
      {
        ar: "المصل يحتوي على:",
        fr: "Le sérum contient :",
        expAr: "المصل يحتوي على أضداد جاهزة للتدخل الفوري.",
        expFr: "Le sérum contient des anticorps prêts à agir.",
        opts: [
          { ar: "أضداد جاهزة", fr: "Des anticorps prêts", ok: true },
          { ar: "جراثيم حية", fr: "Des microbes vivants" },
          { ar: "سكريات", fr: "Des sucres" },
          { ar: "أملاح معدنية", fr: "Des sels minéraux" },
        ],
      },
      {
        ar: "عملية البلعمة هي دفاع:",
        fr: "La phagocytose est une défense :",
        expAr: "البلعمة دفاع لانوعي يقوم به تبلغية.",
        expFr: "La phagocytose est une défense non spécifique assurée par des phagocytes.",
        opts: [
          { ar: "لانوعي", fr: "Non spécifique", ok: true },
          { ar: "نوعي", fr: "Spécifique" },
          { ar: "جيني", fr: "Génique" },
          { ar: "وراثي", fr: "Héréditaire" },
        ],
      },
    ],
  },
  {
    slug: "ecologie",
    titleAr: "علم البيئة",
    titleFr: "Écologie (option SM)",
    lessonAr: `## علم البيئة
- **النظام البيئي**: مكونات حية (عوامل أحيائية) وغير حية (لا أحيائية).
- **العلاقات**: تغذية، تنافس، تعايش، تطفل.
- **تدفق الطاقة**: سلسلة غذائية وشبكة غذائية (بنسبة تقرب من 10%).
- التلوث: من النترات والفوسفات إلى ظاهرة التخثث (eutrophisation).`,
    lessonFr: `## Écologie
- **L'écosystème** : composantes biotiques (vivantes) et abiotiques (non vivantes).
- **Relations** : alimentation, concurrence, commensalisme, parasitisme.
- **Flux d'énergie** : chaîne et réseau trophiques (environ 10 %).
- Pollution : nitrates et phosphates entraînent l'eutrophisation.`,
    questions: [
      {
        ar: "النظام البيئي يتكون من:",
        fr: "L'écosystème est constitué de :",
        expAr: "النظام البيئي يجمع بين العوامل الحية وغير الحية.",
        expFr: "L'écosystème combine facteurs biotiques et abiotiques.",
        opts: [
          { ar: "عوامل حية وغير حية", fr: "Facteurs biotiques et abiotiques", ok: true },
          { ar: "الحيوانات فقط", fr: "Les animaux seulement" },
          { ar: "النباتات فقط", fr: "Les plantes seulement" },
          { ar: "الماء فقط", fr: "L'eau seulement" },
        ],
      },
      {
        ar: "المستوى الأول في سلسلة غذائية:",
        fr: "Le premier maillon d'une chaîne alimentaire est :",
        expAr: "تفتتح السلسلة الغذائية بالمنتجين (النباتات الخضراء).",
        expFr: "La chaîne alimentaire commence par les producteurs.",
        opts: [
          { ar: "منتج (نبات)", fr: "Un producteur (végétal)", ok: true },
          { ar: "مفترس", fr: "Un prédateur" },
          { ar: "محلل", fr: "Un décomposeur" },
          { ar: "زبالة", fr: "Un détritivore" },
        ],
      },
      {
        ar: "سبب ظاهرة التخثث (eutrophisation):",
        fr: "La cause de l'eutrophisation :",
        expAr: "النترات والفوسفات الزائدة تسبب تكاثر الطحالب والتخثث.",
        expFr: "Nitrates et phosphates en excès provoquent l'eutrophisation.",
        opts: [
          { ar: "النترات والفوسفات", fr: "Nitrates et phosphates", ok: true },
          { ar: "الأكسجين النقي", fr: "L'oxygène pur" },
          { ar: "الملح", fr: "Le sel" },
          { ar: "الرمل", fr: "Le sable" },
        ],
      },
      {
        ar: "علاقة التطفل:",
        fr: "Le parasitisme est une relation :",
        expAr: "التطفل نفع للمتطفل وضرر للعائل.",
        expFr: "Le parasitisme profite au parasite et nuit à l'hôte.",
        opts: [
          { ar: "ينتفع فيها أحدهما ويتضرر الآخر", fr: "Profite à l'un, nuit à l'autre", ok: true },
          { ar: "متبادلة المنفعة", fr: "Mutualiste" },
          { ar: "محايدة", fr: "Neutre" },
          { ar: "غير موجودة", fr: "Inexistante" },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------- MATH (option éco)
const mathEcoChapters: ChapterDef[] = [
  {
    slug: "probabilites-eco",
    titleAr: "الاحتمالات",
    titleFr: "Probabilités",
    lessonAr: `## الاحتمالات
- **التجربة العشوائية**: تجربة نتائجها غير متوقعة بدقة (رمي النرد).
- **الحدث**: مجموعة نتائج (بسيط، مركب، المتمم).
- **الاحتمال**: عدد الحالات المواتية ÷ عدد الحالات الممكنة.
- قواعد: P(Ω)=1، P(∅)=0، P(Ā)=1−P(A)، وللحدثين المتنافيين P(A∪B)=P(A)+P(B).`,
    lessonFr: `## Probabilités
- **Expérience aléatoire** : résultats imprévisibles (un dé).
- **Événement** : partie de l'univers (élémentaire, composé, contraire).
- **Probabilité** : cas favorables / cas possibles.
- Règles : P(Ω)=1, P(∅)=0, P(Ā)=1−P(A), et si incompatibles P(A∪B)=P(A)+P(B).`,
    questions: [
      {
        ar: "رمي نرد سليم، احتمال الحصول على 4:",
        fr: "Un dé équilibré : P(obtenir 4) = :",
        expAr: "من 6 أوجه، وجه واحد فقط هو 4: الاحتمال 1/6.",
        expFr: "Sur 6 faces, une seule est 4 : P = 1/6.",
        opts: [
          { ar: "1/6", fr: "1/6", ok: true },
          { ar: "1/2", fr: "1/2" },
          { ar: "1/3", fr: "1/3" },
          { ar: "4/6", fr: "4/6" },
        ],
      },
      {
        ar: "P(Ā) يساوي:",
        fr: "P(Ā) est égal à :",
        expAr: "الاحتمال المتمم يساوي 1 ناقص الاحتمال الأصلي.",
        expFr: "Le contraire vaut 1 moins la probabilité de l'événement.",
        opts: [
          { ar: "1 − P(A)", fr: "1 − P(A)", ok: true },
          { ar: "P(A) + 1", fr: "P(A) + 1" },
          { ar: "P(A)", fr: "P(A)" },
          { ar: "0", fr: "0" },
        ],
      },
      {
        ar: "حدثان متنافيان A و B إذن:",
        fr: "A et B incompatibles, alors :",
        expAr: "للحادثين المتنافيين، احتمال الاتحاد هو مجموع الاحتمالين.",
        expFr: "Pour des événements incompatibles, P(A∪B)=P(A)+P(B).",
        opts: [
          { ar: "P(A∪B) = P(A) + P(B)", fr: "P(A∪B) = P(A) + P(B)", ok: true },
          { ar: "P(A∪B) = P(A) × P(B)", fr: "P(A∪B) = P(A) × P(B)" },
          { ar: "P(A∪B) = P(A) − P(B)", fr: "P(A∪B) = P(A) − P(B)" },
          { ar: "P(A∪B) = 1", fr: "P(A∪B) = 1" },
        ],
      },
      {
        ar: "كيس به 3 كرات حمراء و2 خضراء، احتمال سحب خضراء:",
        fr: "3 boules rouges, 2 vertes : P(verte) = :",
        expAr: "من 5 كرات، 2 خضراء: الاحتمال 2/5.",
        expFr: "Sur 5 boules, 2 vertes : P = 2/5.",
        opts: [
          { ar: "2/5", fr: "2/5", ok: true },
          { ar: "3/5", fr: "3/5" },
          { ar: "1/5", fr: "1/5" },
          { ar: "2/3", fr: "2/3" },
        ],
      },
    ],
  },
  {
    slug: "suites-eco",
    titleAr: "المتتاليات العددية",
    titleFr: "Suites numériques",
    lessonAr: `## المتتاليات العددية
- **تعريف**: متتالية عددية دالة معرفة على جزء من مجموعة الأعداد الطبيعية.
- **متتالية حسابية**: فرق ثابت r (uₙ₊₁ = uₙ + r).
- **متتالية هندسية**: نسبة ثابتة q (uₙ₊₁ = uₙ × q).
- **الحد العام**: حسابي: uₙ = u₀ + n·r؛ هندسي: uₙ = u₀ × qⁿ.
- **المجموع**: حسابي: S = n(u₁+uₙ)/2.`,
    lessonFr: `## Suites numériques
- **Définition** : suite définie sur une partie de ℕ.
- **Arithmétique** : différence constante r (uₙ₊₁ = uₙ + r).
- **Géométrique** : raison constante q (uₙ₊₁ = uₙ × q).
- **Terme général** : arith. uₙ = u₀ + n·r ; géom. uₙ = u₀ × qⁿ.
- **Somme** : arith. S = n(u₁+uₙ)/2.`,
    questions: [
      {
        ar: "متتالية حسابية u₀=3 و r=2، إذن u₂:",
        fr: "Suite arithmétique u₀=3, r=2 : u₂ = :",
        expAr: "u₂ = u₀ + 2×r = 3 + 4 = 7.",
        expFr: "u₂ = u₀ + 2r = 3 + 4 = 7.",
        opts: [
          { ar: "7", fr: "7", ok: true },
          { ar: "5", fr: "5" },
          { ar: "6", fr: "6" },
          { ar: "12", fr: "12" },
        ],
      },
      {
        ar: "متتالية هندسية q=2 و u₀=1، إذن u₃:",
        fr: "Suite géométrique q=2, u₀=1 : u₃ = :",
        expAr: "u₃ = u₀ × q³ = 1 × 8 = 8.",
        expFr: "u₃ = u₀ × q³ = 1 × 8 = 8.",
        opts: [
          { ar: "8", fr: "8", ok: true },
          { ar: "4", fr: "4" },
          { ar: "6", fr: "6" },
          { ar: "2", fr: "2" },
        ],
      },
      {
        ar: "مجموع حدود n الأولى لمتتالية حسابية:",
        fr: "La somme des n premiers termes d'une suite arithmétique :",
        expAr: "المجموع يساوي n(عدد الحدود)×(أول+آخر)/2.",
        expFr: "La somme est n(b) × (premier + dernier)/2.",
        opts: [
          { ar: "n(u₁+uₙ)/2", fr: "n(u₁+uₙ)/2", ok: true },
          { ar: "n × u₁", fr: "n × u₁" },
          { ar: "n²", fr: "n²" },
          { ar: "uₙ/u₁", fr: "uₙ/u₁" },
        ],
      },
    ],
  },
  {
    slug: "fonctions-eco",
    titleAr: "الدوال اللوغاريتمية",
    titleFr: "Fonctions logarithmiques",
    lessonAr: `## الدوال اللوغاريتمية
- **ln**: معرفة على ℝ⁺*، حيث ln(1)=0 و ln(e)=1.
- **خصائص**: ln(a×b)=ln(a)+ln(b)؛ ln(a/b)=ln(a)−ln(b)؛ ln(aⁿ)=n·ln(a).
- **الاشتقاق**: (ln u)′ = u′/u.
- **نهايات**: lim(x→0⁺) ln x = −∞؛ lim(x→+∞) ln x = +∞.`,
    lessonFr: `## Fonctions logarithmiques
- **ln** : définie sur ℝ⁺*, avec ln(1)=0 et ln(e)=1.
- **Propriétés** : ln(ab)=ln a+ln b ; ln(a/b)=ln a−ln b ; ln(aⁿ)=n ln a.
- **Dérivée** : (ln u)′ = u′/u.
- **Limites** : en 0⁺ → −∞ ; en +∞ → +∞.`,
    questions: [
      {
        ar: "قيمة ln(1):",
        fr: "ln(1) est égal à :",
        expAr: "ln(1) = 0 دائماً.",
        expFr: "ln(1) = 0.",
        opts: [
          { ar: "0", fr: "0", ok: true },
          { ar: "1", fr: "1" },
          { ar: "e", fr: "e" },
          { ar: "−1", fr: "−1" },
        ],
      },
      {
        ar: "قيمة ln(e):",
        fr: "ln(e) est égal à :",
        expAr: "ln(e) = 1.",
        expFr: "ln(e) = 1.",
        opts: [
          { ar: "1", fr: "1", ok: true },
          { ar: "0", fr: "0" },
          { ar: "e", fr: "e" },
          { ar: "2", fr: "2" },
        ],
      },
      {
        ar: "ln(a²) تساوي:",
        fr: "ln(a²) est égal à :",
        expAr: "ln(aⁿ) = n·ln(a) إذن ln(a²) = 2·ln(a).",
        expFr: "ln(aⁿ)=n ln a, donc ln(a²)=2 ln a.",
        opts: [
          { ar: "2 ln a", fr: "2 ln a", ok: true },
          { ar: "(ln a)²", fr: "(ln a)²" },
          { ar: "ln 2", fr: "ln 2" },
          { ar: "a ln 2", fr: "a ln 2" },
        ],
      },
      {
        ar: "مجال تعريف الدالة ln:",
        fr: "Le domaine de définition de ln :",
        expAr: "ln معرفة فقط على الأعداد الموجبة قطعاً ℝ⁺*.",
        expFr: "ln n'est définie que pour les réels strictement positifs.",
        opts: [
          { ar: "ℝ⁺*", fr: "ℝ⁺*", ok: true },
          { ar: "ℝ", fr: "ℝ" },
          { ar: "ℝ*", fr: "ℝ*" },
          { ar: "[0, 1]", fr: "[0, 1]" },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------- COMPTABILITE
const comptaChapters: ChapterDef[] = [
  {
    slug: "bilan",
    titleAr: "الميزانية المحاسبية",
    titleFr: "Le bilan comptable",
    lessonAr: `## الميزانية المحاسبية
- **الميزانية**: صورة للوضعية المالية للمقاولة في لحظة معينة.
- **الأصول**: ما تملكه المقاولة (التجهيزات، الموجودات…)؛ أصول ثابتة ومتداولة.
- **الخصوم**: مصادر التمويل (رأس المال، القروض، الدائنون).
- **قاعدة التوازن**: مجموع الأصول = مجموع الخصوم.`,
    lessonFr: `## Le bilan comptable
- **Le bilan** : photographie de la situation financière à un instant donné.
- **L'actif** : ce que possède l'entreprise (immobilisations, stocks…) ; actif immobilisé et circulant.
- **Le passif** : les ressources (capital, emprunts, fournisseurs).
- **Règle d'équilibre** : total actif = total passif.`,
    questions: [
      {
        ar: "الميزانية توضح:",
        fr: "Le bilan présente :",
        expAr: "الميزانية تصف الوضعية المالية في لحظة معينة.",
        expFr: "Le bilan est une photographie de la situation financière.",
        opts: [
          { ar: "الوضعية المالية", fr: "La situation financière", ok: true },
          { ar: "التنظيم الداخلي", fr: "L'organisation interne" },
          { ar: "المنافسة", fr: "La concurrence" },
          { ar: "الأسعار فقط", fr: "Les prix seulement" },
        ],
      },
      {
        ar: "التجهيزات تُصنف في:",
        fr: "Les immobilisations figurent à :",
        expAr: "التجهيزات عناصر من الأصول الثابتة.",
        expFr: "Les immobilisations sont des actifs immobilisés.",
        opts: [
          { ar: "الأصول الثابتة", fr: "L'actif immobilisé", ok: true },
          { ar: "الخصوم", fr: "Le passif" },
          { ar: "النتائج", fr: "Les résultats" },
          { ar: "الأمانات", fr: "Les dépôts" },
        ],
      },
      {
        ar: "رأس المال يظهر في:",
        fr: "Le capital social figure au :",
        expAr: "رأس المال مصدر تمويل ضمن الخصوم.",
        expFr: "Le capital social est une ressource au passif.",
        opts: [
          { ar: "الخصوم", fr: "Le passif", ok: true },
          { ar: "الأصول", fr: "L'actif" },
          { ar: "النتيجة", fr: "Le résultat" },
          { ar: "الحساب البنكي", fr: "Le compte bancaire" },
        ],
      },
      {
        ar: "قاعدة توازن الميزانية:",
        fr: "Règle d'équilibre du bilan :",
        expAr: "المجموع الأصلي يساوي دائماً المجموع الخصمي.",
        expFr: "Le total de l'actif est toujours égal au total du passif.",
        opts: [
          { ar: "الأصول = الخصوم", fr: "Actif = Passif", ok: true },
          { ar: "الأصول > الخصوم دائماً", fr: "Actif > Passif toujours" },
          { ar: "الأصول < الخصوم دائماً", fr: "Actif < Passif toujours" },
          { ar: "لا توجد قاعدة", fr: "Aucune règle" },
        ],
      },
    ],
  },
  {
    slug: "analytique",
    titleAr: "المحاسبة التحليلية",
    titleFr: "La comptabilité analytique",
    lessonAr: `## المحاسبة التحليلية
- **الهدف**: تحديد تكاليف المنتجات وتحليل النتائج الداخلية.
- **التكاليف المباشرة**: تعزى مباشرة إلى منتج محدد.
- **التكاليف غير المباشرة**: توزع وفق أسس تحميل.
- **التكلفة الشاملة**: شراء → إنتاج → بيع.
- **الهامش والنتيجة التحليلية**: الإيرادات − التكاليف.`,
    lessonFr: `## La comptabilité analytique
- **Objectif** : déterminer les coûts des produits et analyser les résultats.
- **Coûts directs** : imputés directement à un produit.
- **Coûts indirects** : répartis selon des clés de répartition.
- **Coût de revient** : achat → production → vente.
- **Marge et résultat analytique** : CA − coûts.`,
    questions: [
      {
        ar: "تهدف المحاسبة التحليلية إلى:",
        fr: "La comptabilité analytique vise à :",
        expAr: "المحاسبة التحليلية تحسب التكاليف وتفسر النتائج.",
        expFr: "La comptabilité analytique calcule les coûts et analyse les résultats.",
        opts: [
          { ar: "تحديد التكاليف", fr: "Déterminer les coûts", ok: true },
          { ar: "تسجيل الفواتير فقط", fr: "Enregistrer les factures seulement" },
          { ar: "حساب الأجور", fr: "Calculer les salaires" },
          { ar: "إمساك الجرد", fr: "Tenir l'inventaire" },
        ],
      },
      {
        ar: "تكلفة مباشرة تُعزى إلى:",
        fr: "Un coût direct est imputé :",
        expAr: "التكلفة المباشرة ترتبط مباشرة بالمنتج المعني.",
        expFr: "Le coût direct est lié directement au produit.",
        opts: [
          { ar: "المنتج المعني", fr: "Au produit concerné", ok: true },
          { ar: "جميع المنتجات", fr: "À tous les produits" },
          { ar: "الإدارة العامة فقط", fr: "À la direction générale" },
          { ar: "لا يمكن تعزيته", fr: "Non imputable" },
        ],
      },
      {
        ar: "الهامش يساوي:",
        fr: "La marge est égale à :",
        expAr: "الهامش هو الفرق بين الإيراد والتكلفة.",
        expFr: "La marge = CA − coût.",
        opts: [
          { ar: "الإيراد − التكلفة", fr: "CA − coût", ok: true },
          { ar: "الإيراد + التكلفة", fr: "CA + coût" },
          { ar: "التكلفة ÷ الإيراد", fr: "coût ÷ CA" },
          { ar: "الإيراد × التكلفة", fr: "CA × coût" },
        ],
      },
      {
        ar: "الفرق بين مردود المبيعات والتكلفة الشاملة للمبيعات:",
        fr: "La différence entre le CA et le coût de revient des ventes :",
        expAr: "هذا الفرق يسمى النتيجة التحليلية.",
        expFr: "Cette différence est le résultat analytique.",
        opts: [
          { ar: "النتيجة التحليلية", fr: "Le résultat analytique", ok: true },
          { ar: "النتيجة المالية", fr: "Le résultat financier" },
          { ar: "الرصيد البنكي", fr: "Le solde bancaire" },
          { ar: "الاحتياطي", fr: "La réserve" },
        ],
      },
    ],
  },
  {
    slug: "fiscalite",
    titleAr: "الضرائب",
    titleFr: "La fiscalité",
    lessonAr: `## الضرائب
- **TVA**: الضريبة على القيمة المضافة؛ TVA صافية = متحصل − مطالب.
- **IS**: الضريبة على الشركات؛ أساسها النتيجة المحاسبية معدلتها.
- **IR**: الضريبة على الدخل؛ تُقتطع من رواتب الأجراء.
- **الإعفاءات والتحفيزات**: وسائل لتشجيع الاستثمار.`,
    lessonFr: `## La fiscalité
- **TVA** : taxe sur la valeur ajoutée ; TVA nette = TVA collectée − TVA récupérable.
- **IS** : impôt sur les sociétés ; base = résultat comptable corrigé.
- **IR** : impôt sur le revenu ; prélevé sur les salaires.
- **Exonérations et incitations** : leviers pour encourager l'investissement.`,
    questions: [
      {
        ar: "TVA تعني:",
        fr: "TVA signifie :",
        expAr: "TVA هي الضريبة على القيمة المضافة.",
        expFr: "La TVA est la taxe sur la valeur ajoutée.",
        opts: [
          { ar: "الضريبة على القيمة المضافة", fr: "La taxe sur la valeur ajoutée", ok: true },
          { ar: "الضريبة على الأجور", fr: "L'impôt sur les salaires" },
          { ar: "الرسم العقاري", fr: "La taxe immobilière" },
          { ar: "الإعفاء الضريبي", fr: "L'exonération" },
        ],
      },
      {
        ar: "IS هي الضريبة على:",
        fr: "L'IS est l'impôt sur :",
        expAr: "IS تخص أرباح الشركات.",
        expFr: "L'IS frappe les bénéfices des sociétés.",
        opts: [
          { ar: "الشركات", fr: "Les sociétés", ok: true },
          { ar: "الدخل الفردي", fr: "Le revenu des personnes" },
          { ar: "المبيعات فقط", fr: "Les ventes seulement" },
          { ar: "العقارات", fr: "L'immobilier" },
        ],
      },
      {
        ar: "IR تخص:",
        fr: "L'IR concerne :",
        expAr: "IR هي الضريبة على الدخل والأجور.",
        expFr: "L'IR est l'impôt sur le revenu (salaires).",
        opts: [
          { ar: "الدخل والأجور", fr: "Le revenu et les salaires", ok: true },
          { ar: "أرباح الشركات فقط", fr: "Les bénéfices des sociétés" },
          { ar: "العقارات فقط", fr: "L'immobilier" },
          { ar: "الواردات فقط", fr: "Les importations" },
        ],
      },
      {
        ar: "وظيفة الضرائب تمويل:",
        fr: "L'impôt sert à financer :",
        expAr: "الضرائب تمول الميزانية العامة للدولة.",
        expFr: "L'impôt finance le budget de l'État.",
        opts: [
          { ar: "الميزانية العامة", fr: "Le budget de l'État", ok: true },
          { ar: "حسابات الشركات", fr: "Les comptes des sociétés" },
          { ar: "أرباح المقاولات", fr: "Les profits des entreprises" },
          { ar: "السوق فقط", fr: "Le marché seulement" },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------- HISTOIRE-GEO
const histoireChapters: ChapterDef[] = [
  {
    slug: "guerres-mondiales",
    titleAr: "الحربان العالميتان",
    titleFr: "Les deux guerres mondiales",
    lessonAr: `## الحربان العالميتان (1914-1918 / 1939-1945)
- **الأسباب**: تنافس امبريالي، تحالفات (الحلفاء/المركز)، أزمة 1929.
- **التطورات**: حرب الخنادق، التسلح الشامل، القصف، المحرقة النازية.
- **النتائج**: خسائر بشرية ضخمة، إعادة رسم الخريطة، تأسيس الأمم المتحدة (1945).
- الدرس: الحرب تُدَمِّر، والسلم قيمة أساسية.`,
    lessonFr: `## Les deux guerres mondiales (1914-1918 / 1939-1945)
- **Causes** : rivalités impérialistes, alliances (Entente / Empires centraux), crise de 1929.
- **Déroulement** : guerre de tranchées, armement de masse, bombardements, shoah.
- **Conséquences** : millions de victimes, redécoupage du monde, création de l'ONU (1945).
- Leçon : la guerre dévaste, la paix est une valeur fondamentale.`,
    questions: [
      {
        ar: "اندلعت الحرب العالمية الأولى سنة:",
        fr: "La Première Guerre mondiale commence en :",
        expAr: "بدأت الحرب العالمية الأولى سنة 1914 وانتهت 1918.",
        expFr: "La 1re Guerre mondiale a lieu de 1914 à 1918.",
        opts: [
          { ar: "1914", fr: "1914", ok: true },
          { ar: "1918", fr: "1918" },
          { ar: "1939", fr: "1939" },
          { ar: "1945", fr: "1945" },
        ],
      },
      {
        ar: "منظمة أنشئت بعد الحرب العالمية الثانية:",
        fr: "Organisation créée en 1945 :",
        expAr: "تأسست منظمة الأمم المتحدة سنة 1945.",
        expFr: "L'ONU est créée en 1945.",
        opts: [
          { ar: "الأمم المتحدة", fr: "L'ONU", ok: true },
          { ar: "الليغا العربية", fr: "La Ligue arabe" },
          { ar: "الجامعة الأورومتوسطية", fr: "L'Union pour la Méditerranée" },
          { ar: "الناتو فقط", fr: "L'OTAN seulement" },
        ],
      },
      {
        ar: "حرب 1914-1918 تسمى أحياناً حرب:",
        fr: "La guerre 1914-1918 est dite guerre de :",
        expAr: "عرفت بحرب الخنادق لطول المواجهات الثابتة.",
        expFr: "On parle de guerre de tranchées.",
        opts: [
          { ar: "الخنادق", fr: "Tranchées", ok: true },
          { ar: "الخطف", fr: "Rapt" },
          { ar: "المعلومات", fr: "L'information" },
          { ar: "النجوم", fr: "Les étoiles" },
        ],
      },
      {
        ar: "سبب من أسباب ح.ع.2:",
        fr: "Une des causes de la Seconde Guerre mondiale :",
        expAr: "من أسبابها توسع النازية وأزمة 1929 وصعود التطرف.",
        expFr: "L'expansion nazie et la crise de 1929 comptent parmi les causes.",
        opts: [
          { ar: "صعود التطرف عقب أزمة 1929", fr: "La montée du totalitarisme après 1929", ok: true },
          { ar: "نهاية الأمم المتحدة", fr: "La fin de l'ONU" },
          { ar: "إنشاء الاتحاد الأوروبي", fr: "La création de l'UE" },
          { ar: "الاستقلال الإفريقي", fr: "L'indépendance africaine" },
        ],
      },
    ],
  },
  {
    slug: "maroc-hist",
    titleAr: "تاريخ المغرب المعاصر",
    titleFr: "L'histoire du Maroc contemporain",
    lessonAr: `## تاريخ المغرب المعاصر
- **الحماية (1912-1956)**: عهد المقاومة الوطنية (الريف 1921-1926 مثلاً).
- **الاستقلال (1956)**: استرجاع السيادة وبناء الدولة الحديثة.
- **التحولات**: البناء الدستوري، التنمية الاقتصادية، استرجاع الأقاليم الجنوبية (المسيرة الخضراء 1975).
- الإصلاحات المعاصرة: المدونة، الجهوية المتقدمة، إلخ.`,
    lessonFr: `## L'histoire du Maroc contemporain
- **Protectorat (1912-1956)** : époque de la résistance nationale (guerre du Rif 1921-1926).
- **Indépendance (1956)** : retour de la souveraineté et État moderne.
- **Transformations** : constitution, développement, retour des provinces du Sud (Marche verte 1975).
- Réformes contemporaines : Code de la famille, régionalisation avancée…`,
    questions: [
      {
        ar: "وُقعت معاهدة الحماية سنة:",
        fr: "Le Traité de protectorat est signé en :",
        expAr: "فرضت الحماية الفرنسية على المغرب سنة 1912.",
        expFr: "Le protectorat français est imposé en 1912.",
        opts: [
          { ar: "1912", fr: "1912", ok: true },
          { ar: "1956", fr: "1956" },
          { ar: "1900", fr: "1900" },
          { ar: "1975", fr: "1975" },
        ],
      },
      {
        ar: "حصل المغرب على الاستقلال سنة:",
        fr: "Le Maroc obtient son indépendance en :",
        expAr: "استقل المغرب سنة 1956.",
        expFr: "L'indépendance est obtenue en 1956.",
        opts: [
          { ar: "1956", fr: "1956", ok: true },
          { ar: "1912", fr: "1912" },
          { ar: "1945", fr: "1945" },
          { ar: "1962", fr: "1962" },
        ],
      },
      {
        ar: "جرت المسيرة الخضراء سنة:",
        fr: "La Marche verte a eu lieu en :",
        expAr: "المسيرة الخضراء سنة 1975 أدت لاسترجاع الصحراء المغربية.",
        expFr: "La Marche verte (1975) a permis la récupération du Sahara marocain.",
        opts: [
          { ar: "1975", fr: "1975", ok: true },
          { ar: "1956", fr: "1956" },
          { ar: "1961", fr: "1961" },
          { ar: "1984", fr: "1984" },
        ],
      },
      {
        ar: "قاد مقاومة الريف:",
        fr: "La guerre du Rif était menée par :",
        expAr: "محمد بن عبد الكريم الخطابي قاد مقاومة الريف.",
        expFr: "Abdelkrim El Khattabi a mené la guerre du Rif.",
        opts: [
          { ar: "عبد الكريم الخطابي", fr: "Abdelkrim El Khattabi", ok: true },
          { ar: "الملك الحسن الأول", fr: "Le roi Hassan Ier" },
          { ar: "ابن خلدون", fr: "Ibn Khaldoun" },
          { ar: "العباس بن فرناس", fr: "Abbas Ibn Firnas" },
        ],
      },
    ],
  },
  {
    slug: "geo-mondiale",
    titleAr: "الجغرافيا الاقتصادية العالمية",
    titleFr: "La géographie économique mondiale",
    lessonAr: `## الجغرافيا الاقتصادية العالمية
- **العولمة**: تدفق السلع والخدمات ورؤوس الأموال والمعلومات.
- **التكتلات**: الاتحاد الأوروبي، التكتلات الإقليمية، البريكس…
- **القطب الاقتصادي**: قوى كبرى (الولايات المتحدة، الصين، الاتحاد الأوروبي).
- **الرهانات**: الطاقة، البيئة، وتفاوت التنمية بين الشمال والجنوب.`,
    lessonFr: `## La géographie économique mondiale
- **Mondialisation** : flux de biens, services, capitaux et informations.
- **Regroupements** : Union européenne, régionalisations, BRICS…
- **Pôles majeurs** : États-Unis, Chine, Union européenne.
- **Enjeux** : énergie, environnement, disparités Nord-Sud.`,
    questions: [
      {
        ar: "تقوم العولمة أساساً على:",
        fr: "La mondialisation repose sur :",
        expAr: "العولمة تدفق متزايد للسلع ورؤوس الأموال والمعلومات.",
        expFr: "La mondialisation repose sur la circulation des flux.",
        opts: [
          { ar: "تدفق السلع والرأسمال والمعلومات", fr: "Les flux de biens, capitaux et informations", ok: true },
          { ar: "العزلة الاقتصادية", fr: "L'isolement économique" },
          { ar: "الحمائية", fr: "Le protectionnisme" },
          { ar: "الاكتفاء الذاتي", fr: "L'autosuffisance" },
        ],
      },
      {
        ar: "من التكتلات الإقليمية الكبرى:",
        fr: "Parmi les grands groupements régionaux :",
        expAr: "الاتحاد الأوروبي نموذج للتكتل الإقليمي.",
        expFr: "L'Union européenne est un modèle d'intégration régionale.",
        opts: [
          { ar: "الاتحاد الأوروبي", fr: "L'Union européenne", ok: true },
          { ar: "الأمم المتحدة", fr: "L'ONU" },
          { ar: "اللجنة الأولمبية", fr: "Le CIO" },
          { ar: "الصندوق الوطني للضمان", fr: "La CNSS" },
        ],
      },
      {
        ar: "من القوى الاقتصادية الكبرى اليوم:",
        fr: "Parmi les grandes puissances économiques actuelles :",
        expAr: "الصين والولايات المتحدة ضمن أكبر القوى الاقتصادية.",
        expFr: "La Chine et les États-Unis comptent parmi les plus grandes puissances.",
        opts: [
          { ar: "الصين والولايات المتحدة", fr: "La Chine et les États-Unis", ok: true },
          { ar: "المغرب ومصر فقط", fr: "Le Maroc et l'Égypte seulement" },
          { ar: "أستراليا ونيوزيلندا فقط", fr: "Australie et Nouvelle-Zélande seulement" },
          { ar: "القطب الجنوبي", fr: "Le pôle Sud" },
        ],
      },
      {
        ar: "النفط يلعب دوراً محورياً أساساً في:",
        fr: "Le pétrole joue un rôle majeur surtout dans :",
        expAr: "النفط محوري في الطاقة والنقل والصناعة الكيماوية.",
        expFr: "Le pétrole est central pour l'énergie et les transports.",
        opts: [
          { ar: "الطاقة والنقل", fr: "L'énergie et les transports", ok: true },
          { ar: "الزراعة المطرية", fr: "L'agriculture pluviale" },
          { ar: "التعليم", fr: "L'éducation" },
          { ar: "الصحة العامة فقط", fr: "La santé publique" },
        ],
      },
    ],
  },
  {
    slug: "geo-afrique",
    titleAr: "القارة الإفريقية",
    titleFr: "L'Afrique",
    lessonAr: `## القارة الإفريقية
- **الموقع والموارد**: ثروات معبدة: معادن (الكوبالت، الذهب)، طاقة، وأراضٍ فلاحية.
- **التحديات**: النمو الديمغرافي، التصحر، النزاعات، التفاوت التنموي.
- **التعاون**: الاتحاد الإفريقي (مقره أديس أبابا) وأجندة 2063.
- **التحول**: من تصدير المواد الأولية إلى التصنيع والقيمة المضافة.`,
    lessonFr: `## L'Afrique
- **Atouts** : ressources énormes — minerais (cobalt, or), énergie, terres agricoles.
- **Défis** : croissance démographique, désertification, conflits, inégalités.
- **Coopération** : Union africaine (siège à Addis-Abeba), Agenda 2063.
- **Transformation** : de l'exportation de matières premières à l'industrialisation.`,
    questions: [
      {
        ar: "مقر الاتحاد الإفريقي:",
        fr: "Le siège de l'Union africaine se trouve à :",
        expAr: "مقر الاتحاد الإفريقي بأديس أبابا.",
        expFr: "L'UA siège à Addis-Abeba.",
        opts: [
          { ar: "أديس أبابا", fr: "Addis-Abeba", ok: true },
          { ar: "القاهرة", fr: "Le Caire" },
          { ar: "الرباط", fr: "Rabat" },
          { ar: "باريس", fr: "Paris" },
        ],
      },
      {
        ar: "من التحديات البيئية لإفريقيا:",
        fr: "Un défi environnemental majeur de l'Afrique :",
        expAr: "التصحر وزحف الرمال يهدد مناطق واسعة.",
        expFr: "La désertification menace de vastes régions.",
        opts: [
          { ar: "التصحر", fr: "La désertification", ok: true },
          { ar: "الجليد الدائم", fr: "Le glacier permanent" },
          { ar: "الفيضانات القطبية", fr: "Les inondations polaires" },
          { ar: "الرطوبة الاستوائية فقط", fr: "Seulement l'humidité tropicale" },
        ],
      },
      {
        ar: "من المعادن الاستراتيجية في إفريقيا:",
        fr: "Un minerai stratégique de l'Afrique :",
        expAr: "الكوبالت (جمهورية الكونغو الديمقراطية) معدن استراتيجي للبطاريات.",
        expFr: "Le cobalt (RDC) est stratégique pour les batteries.",
        opts: [
          { ar: "الكوبالت", fr: "Le cobalt", ok: true },
          { ar: "الملح", fr: "Le sel" },
          { ar: "الجبس", fr: "Le gypse" },
          { ar: "الرخام", fr: "Le marbre" },
        ],
      },
      {
        ar: "أجندة 2063 إطار إفريقي لـ:",
        fr: "L'Agenda 2063 est un cadre africain pour :",
        expAr: "أجندة 2063 خطة تنموية مستقبلية للقارة.",
        expFr: "L'Agenda 2063 est un plan de développement africain.",
        opts: [
          { ar: "التنمية والاندماج", fr: "Le développement et l'intégration", ok: true },
          { ar: "الاستعمار", fr: "La colonisation" },
          { ar: "الحروب", fr: "Les guerres" },
          { ar: "تصدير المواد فقط", fr: "L'exportation des matières seulement" },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------- ESPAGNOL
const espagnolChapters: ChapterDef[] = [
  {
    slug: "basico",
    titleAr: "أساسيات الإسبانية",
    titleFr: "Espagnol de base",
    lessonAr: `## أساسيات اللغة الإسبانية
- **التحية**: ¡Hola! ¡Buenos días! ¿Cómo estás?
- **التعريف**: Me llamo…, Soy de Marruecos, Hablo árabe y español.
- **أزمنة أساسية**: present (yo soy), pasado (yo fui), futuro (yo seré).
- **مفردات**: sí, no, por favor, gracias, adiós.`,
    lessonFr: `## L'espagnol de base
- **Salutations** : ¡Hola! ¡Buenos días! ¿Cómo estás?
- **Se présenter** : Me llamo…, Soy de Marruecos, Hablo árabe y español.
- **Temps de base** : présent (yo soy), passé (yo fui), futur (yo seré).
- **Vocabulaire** : sí, no, por favor, gracias, adiós.`,
    questions: [
      {
        ar: "« ¡Buenos días! » تعني:",
        fr: "« ¡Buenos días! » signifie :",
        expAr: "¡Buenos días! تحية صباحية.",
        expFr: "¡Buenos días! est une salutation du matin.",
        opts: [
          { ar: "صباح الخير", fr: "Bonjour (le matin)", ok: true },
          { ar: "مساء الخير", fr: "Bonsoir" },
          { ar: "ليلة سعيدة", fr: "Bonne nuit" },
          { ar: "مع السلامة", fr: "Au revoir" },
        ],
      },
      {
        ar: "« gracias » تعني:",
        fr: "« gracias » signifie :",
        expAr: "gracias تعني شكراً.",
        expFr: "gracias = merci.",
        opts: [
          { ar: "شكراً", fr: "Merci", ok: true },
          { ar: "عفواً", fr: "Pardon" },
          { ar: "نعم", fr: "Oui" },
          { ar: "من فضلك", fr: "S'il vous plaît" },
        ],
      },
      {
        ar: "« Me llamo… » تعني:",
        fr: "« Me llamo… » signifie :",
        expAr: "Me llamo تستعمل للتعريف عن الاسم.",
        expFr: "Me llamo sert à se présenter (je m'appelle).",
        opts: [
          { ar: "اسمي", fr: "Je m'appelle", ok: true },
          { ar: "عمري", fr: "J'ai… ans" },
          { ar: "عنواني", fr: "Mon adresse" },
          { ar: "جنسيتي", fr: "Ma nationalité" },
        ],
      },
      {
        ar: "« sí » تعني:",
        fr: "« sí » signifie :",
        expAr: "sí تعني نعم.",
        expFr: "sí = oui.",
        opts: [
          { ar: "نعم", fr: "Oui", ok: true },
          { ar: "لا", fr: "Non" },
          { ar: "ربما", fr: "Peut-être" },
          { ar: "أبداً", fr: "Jamais" },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------- ATTACHMENT
const SUBJECT_MAP: Record<string, ChapterDef[]> = {
  philosophie: philoChapters,
  francais: francaisChapters,
  anglais: anglaisChapters,
  arabe: arabeChapters,
  "tarbia-islamia": tarbiaChapters,
  svt: svtChapters,
  mathematiques: mathEcoChapters,
  comptabilite: comptaChapters,
  "histoire-geo": histoireChapters,
  espagnol: espagnolChapters,
};

const BRANCH_ATTACH: Record<string, Record<string, string[]>> = {
  sm: {
    svt: ["genetique-humaine", "immunologie", "ecologie"],
    philosophie: ["etre-et-verite", "connaissance", "liberte-droits"],
    francais: ["textes-argumentatifs", "discours-indirect", "production-ecrite"],
    anglais: ["tenses", "functions", "writings"],
    arabe: ["balagha", "riwaya", "nawari"],
    "tarbia-islamia": ["aqida", "ibadat", "akhlaq"],
  },
  svt: {
    philosophie: ["etre-et-verite", "connaissance", "liberte-droits"],
    francais: ["textes-argumentatifs", "discours-indirect", "production-ecrite"],
    anglais: ["tenses", "functions", "writings"],
    arabe: ["balagha", "riwaya", "nawari"],
    "tarbia-islamia": ["aqida", "ibadat", "akhlaq"],
  },
  sp: {
    philosophie: ["etre-et-verite", "connaissance", "liberte-droits"],
    francais: ["textes-argumentatifs", "discours-indirect", "production-ecrite"],
    anglais: ["tenses", "functions", "writings"],
    arabe: ["balagha", "riwaya", "nawari"],
    "tarbia-islamia": ["aqida", "ibadat", "akhlaq"],
  },
  eco: {
    mathematiques: ["probabilites-eco", "suites-eco", "fonctions-eco"],
    comptabilite: ["bilan", "analytique", "fiscalite"],
    francais: ["textes-argumentatifs", "discours-indirect", "production-ecrite"],
    anglais: ["tenses", "functions", "writings"],
    arabe: ["balagha", "riwaya", "nawari"],
    "tarbia-islamia": ["aqida", "ibadat", "akhlaq"],
  },
  lettres: {
    philosophie: ["etre-et-verite", "connaissance", "liberte-droits"],
    francais: ["textes-argumentatifs", "discours-indirect", "production-ecrite"],
    arabe: ["balagha", "riwaya", "nawari"],
    anglais: ["tenses", "functions", "writings"],
    espagnol: ["basico"],
    "histoire-geo": ["guerres-mondiales", "maroc-hist", "geo-mondiale", "geo-afrique"],
    "tarbia-islamia": ["aqida", "ibadat", "akhlaq"],
  },
  arts: {
    philosophie: ["etre-et-verite", "connaissance", "liberte-droits"],
    francais: ["textes-argumentatifs", "discours-indirect", "production-ecrite"],
    arabe: ["balagha", "riwaya", "nawari"],
    anglais: ["tenses", "functions", "writings"],
  },
};

async function main() {
  let chaptersCreated = 0;
  let lessonsCreated = 0;
  let questionsCreated = 0;

  for (const [branchSlug, subjects] of Object.entries(BRANCH_ATTACH)) {
    const branch = await prisma.branch.findUnique({ where: { slug: branchSlug } });
    if (!branch) { console.warn(`branch missing: ${branchSlug}`); continue; }

    for (const [subjectSlug, chapterSlugs] of Object.entries(subjects)) {
      const subject = await prisma.subject.findUnique({
        where: { branchId_slug: { branchId: branch.id, slug: subjectSlug } },
      });
      if (!subject) { console.warn(`subject missing: ${branchSlug}/${subjectSlug}`); continue; }

      const defs = SUBJECT_MAP[subjectSlug];
      if (!defs) { console.warn(`no defs for subject: ${subjectSlug}`); continue; }

      for (let i = 0; i < chapterSlugs.length; i++) {
        const slug = chapterSlugs[i];
        const def = defs.find((d) => d.slug === slug);
        if (!def) { console.warn(`no chapter def: ${subjectSlug}/${slug}`); continue; }

        const chapter = await prisma.chapter.upsert({
          where: { subjectId_slug: { subjectId: subject.id, slug } },
          update: { titleAr: def.titleAr, titleFr: def.titleFr, order: i },
          create: { slug, titleAr: def.titleAr, titleFr: def.titleFr, order: i, subjectId: subject.id },
        });
        chaptersCreated++;

        // lesson (idempotent)
        await prisma.chapter.update({
          where: { id: chapter.id },
          data: {
            lesson: {
              upsert: {
                create: { contentAr: def.lessonAr, contentFr: def.lessonFr },
                update: { contentAr: def.lessonAr, contentFr: def.lessonFr },
              },
            },
          },
        });
        lessonsCreated++;

        // questions (only if none yet)
        const existingQ = await prisma.question.count({ where: { chapterId: chapter.id } });
        if (existingQ > 0) continue;
        for (const q of def.questions) {
          await prisma.question.create({
            data: {
              promptAr: q.ar,
              promptFr: q.fr,
              explanationAr: q.expAr,
              explanationFr: q.expFr,
              chapterId: chapter.id,
              options: {
                create: q.opts.map((o, oi) => ({
                  textAr: o.ar,
                  textFr: o.fr,
                  order: oi,
                  isCorrect: o.ok === true,
                })),
              },
            },
          });
          questionsCreated++;
        }
      }
    }
  }

  const totals = await Promise.all([
    prisma.chapter.count(),
    prisma.lesson.count(),
    prisma.question.count(),
  ]);
  console.log("Done:", { chaptersCreated, lessonsCreated, questionsCreated });
  console.log("Totals now: chapters", totals[0], "| lessons", totals[1], "| questions", totals[2]);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());