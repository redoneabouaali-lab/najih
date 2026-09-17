import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

type QuestionSeed = {
  promptAr: string;
  promptFr: string;
  year?: number;
  session?: string;
  source?: string;
  explanationAr: string;
  explanationFr: string;
  options: { textAr: string; textFr: string; isCorrect: boolean }[];
};

type ChapterSeed = { slug: string; titleAr: string; titleFr: string; questions: QuestionSeed[] };

type SubjectSeed = {
  slug: string;
  nameAr: string;
  nameFr: string;
  icon: string;
  chapters: ChapterSeed[];
};

type BranchSeed = { slug: string; nameAr: string; nameFr: string; subjects: SubjectSeed[] };

const DATA: BranchSeed[] = [
  {
    slug: "sm",
    nameAr: "شعبة العلوم الرياضية",
    nameFr: "Sciences Mathématiques A/B",
    subjects: [
      {
        slug: "mathematiques",
        nameAr: "الرياضيات",
        nameFr: "Mathématiques",
        icon: "📐",
        chapters: [
          {
            slug: "limites",
            titleAr: "النهايات والاشتقاق",
            titleFr: "Limites & Dérivation",
            questions: [
              {
                promptAr: "احسب النهاية التالية: lim(x→+∞) (x² − 3x + 2) / (2x² + 1)",
                promptFr: "Calculez la limite : lim(x→+∞) (x² − 3x + 2) / (2x² + 1)",
                year: 2022,
                session: "normal",
                source: "Examen National 2022 – Maths SM",
                explanationAr: "نقسم البسط والمقام على x² ونستنتج أن النهاية تساوي 1/2.",
                explanationFr: "On divise numérateur et dénominateur par x² : la limite vaut 1/2.",
                options: [
                  { textAr: "1/2", textFr: "1/2", isCorrect: true },
                  { textAr: "+∞", textFr: "+∞", isCorrect: false },
                  { textAr: "0", textFr: "0", isCorrect: false },
                  { textAr: "1", textFr: "1", isCorrect: false },
                ],
              },
              {
                promptAr: "لتكن f دالة قابلة للاشتقاق عند 1 بحيث f(1)=2 و f'(1)=3. حساب تقريبي للدالة f عند 1.01 هو:",
                promptFr: "Soit f dérivable en 1 avec f(1)=2 et f'(1)=3. Approximation de f(1,01) :",
                year: 2022,
                session: "rattrapage",
                source: "Examen National 2022 – Maths SM",
                explanationAr: "التقريب: f(1+h)≈f(1)+h·f'(1)=2+0.01×3=2.03.",
                explanationFr: "Approximation affine : f(1+h)≈f(1)+h·f'(1)=2+0,01×3=2,03.",
                options: [
                  { textAr: "2.03", textFr: "2,03", isCorrect: true },
                  { textAr: "2.3", textFr: "2,3", isCorrect: false },
                  { textAr: "2.1", textFr: "2,1", isCorrect: false },
                  { textAr: "5", textFr: "5", isCorrect: false },
                ],
              },
              {
                promptAr: "المنحنى (C) هو منحنى دالة f القابلة للاشتقاق على ℝ، ويقبل مستقيم مقارب مائل (Δ): y=x+2 عند +∞. إذن:",
                promptFr: "La courbe (C) de f (dérivable sur ℝ) admet en +∞ une asymptote oblique (Δ): y=x+2. Alors :",
                explanationAr: "وجود مستقيم مقارب مائل y=x+2 يعني أن lim(f(x)−(x+2))=0 أي lim(f(x)/x)=1.",
                explanationFr: "L'asymptote oblique y=x+2 donne lim(f(x)−(x+2))=0, donc lim(f(x)/x)=1.",
                options: [
                  { textAr: "lim f(x)/x = 1 عند +∞", textFr: "lim f(x)/x = 1 en +∞", isCorrect: true },
                  { textAr: "lim f(x)/x = 2 عند +∞", textFr: "lim f(x)/x = 2 en +∞", isCorrect: false },
                  { textAr: "lim f(x) = +∞ عند +∞", textFr: "lim f(x) = +∞ en +∞", isCorrect: false },
                  { textAr: "f غير محدودة عند +∞", textFr: "f non bornée en +∞", isCorrect: false },
                ],
              },
            ],
          },
          {
            slug: "complexes",
            titleAr: "الأعداد العقدية",
            titleFr: "Nombres complexes",
            questions: [
              {
                promptAr: "وحدة العدد العقدي z = 1 + i√3 تساوي:",
                promptFr: "Le module de z = 1 + i√3 est :",
                year: 2021,
                session: "normal",
                source: "Examen National 2021 – Maths SM",
                explanationAr: "|z|² = 1²+(√3)² = 4 إذن |z| = 2.",
                explanationFr: "|z|² = 1²+(√3)² = 4 donc |z| = 2.",
                options: [
                  { textAr: "2", textFr: "2", isCorrect: true },
                  { textAr: "1", textFr: "1", isCorrect: false },
                  { textAr: "√3", textFr: "√3", isCorrect: false },
                  { textAr: "4", textFr: "4", isCorrect: false },
                ],
              },
              {
                promptAr: "العمدة الرئيسية للعدد العقدي z = 1 + i√3 هي:",
                promptFr: "L'argument principal de z = 1 + i√3 est :",
                explanationAr: "cos θ=1/2 و sin θ=√3/2 إذن θ=π/3.",
                explanationFr: "cos θ=1/2 et sin θ=√3/2 donc θ=π/3.",
                options: [
                  { textAr: "π/3", textFr: "π/3", isCorrect: true },
                  { textAr: "π/6", textFr: "π/6", isCorrect: false },
                  { textAr: "π", textFr: "π", isCorrect: false },
                  { textAr: "2π/3", textFr: "2π/3", isCorrect: false },
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "physique-chimie",
        nameAr: "الفيزياء والكيمياء",
        nameFr: "Physique-Chimie",
        icon: "⚗️",
        chapters: [
          {
            slug: "mecanique",
            titleAr: "الميكانيك",
            titleFr: "Mécanique",
            questions: [
              {
                promptAr: "جسم كتلته m=2kg يتحرك بسرعة v=3m/s خاضع لقوة ثابتة F=4N في اتجاه الحركة. العجلة a تساوي:",
                promptFr: "Un solide de masse m=2kg et vitesse v=3m/s soumis à F=4N (même sens) : l'accélération a vaut :",
                year: 2024,
                session: "normal",
                source: "Examen National 2024 – PC SM",
                explanationAr: "حسب القانون الثاني لنيوتن: a = F/m = 4/2 = 2 m/s².",
                explanationFr: "Deuxième loi de Newton : a = F/m = 4/2 = 2 m/s².",
                options: [
                  { textAr: "2 m/s²", textFr: "2 m/s²", isCorrect: true },
                  { textAr: "4 m/s²", textFr: "4 m/s²", isCorrect: false },
                  { textAr: "0.5 m/s²", textFr: "0,5 m/s²", isCorrect: false },
                  { textAr: "6 m/s²", textFr: "6 m/s²", isCorrect: false },
                ],
              },
              {
                promptAr: "قذيفة قُذفت عموديا نحو الأعلى بسرعة ابتدائية v₀=20m/s (g=10m/s²). الزمن اللازم للوصول لأقصى ارتفاع:",
                promptFr: "Projectile lancé verticalement à v₀=20m/s (g=10m/s²). Temps pour atteindre le sommet :",
                explanationAr: "عند القمة v=0 : t = v₀/g = 20/10 = 2s.",
                explanationFr: "Au sommet v=0 : t = v₀/g = 20/10 = 2s.",
                options: [
                  { textAr: "2 s", textFr: "2 s", isCorrect: true },
                  { textAr: "0.5 s", textFr: "0,5 s", isCorrect: false },
                  { textAr: "20 s", textFr: "20 s", isCorrect: false },
                  { textAr: "4 s", textFr: "4 s", isCorrect: false },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "svt",
    nameAr: "شعبة العلوم التجريبية",
    nameFr: "Sciences Expérimentales",
    subjects: [
      {
        slug: "svt",
        nameAr: "علوم الحياة والأرض",
        nameFr: "SVT",
        icon: "🧬",
        chapters: [
          {
            slug: "genetique",
            titleAr: "الوراثة والانتقال الجيني",
            titleFr: "Génétique & transmission",
            questions: [
              {
                promptAr: "أثناء عبور بين فردين [AB] مشروعين Aabb × aaBb، تنتج اللقاحات... المورثتان مرتبطتان. النسبة الفردية للمنقولات الصبغية المتبادلة يرمز لها بـ:",
                promptFr: "Un croisement entre deux individus ne montre... Pour mesurer le taux de recombinaison entre deux gènes liés on utilise :",
                year: 2022,
                session: "normal",
                source: "Examen National 2022 – SVT",
                explanationAr: "معدل التبوين (taux de crossing-over) يقدَّر بنسبة الأنماط المعاد تركيبها على المجموع الكلي.",
                explanationFr: "Le taux de recombinaison est estimé par la proportion de phénotypes recombinés sur l'effectif total.",
                options: [
                  { textAr: "نسبة الأفراد المعاد تركيبها", textFr: "La proportion de phénotypes recombinés", isCorrect: true },
                  { textAr: "نسبة الأفراد المسيطرة", textFr: "La proportion de phénotypes dominants", isCorrect: false },
                  { textAr: "عدد الأنماط الظاهرية", textFr: "Le nombre de phénotypes", isCorrect: false },
                  { textAr: "المسافة بين الجينين بالملغارمة", textFr: "La distance en centimorgan", isCorrect: false },
                ],
              },
              {
                promptAr: "مقاومة البكتيريا للمضادات الحيوية راجع أساسا إلى:",
                promptFr: "La résistance des bactéries aux antibiotiques est surtout due à :",
                year: 2020,
                session: "rattrapage",
                source: "Examen National 2020 – SVT",
                explanationAr: "الطفرات العفوية التي تنتج سلالات مقاومة، ثم اختيار طبيعي للمضاد الحيوي.",
                explanationFr: "Des mutations spontanées produisent des souches résistantes, sélectionnées par l'antibiotique.",
                options: [
                  { textAr: "طفرات عفوية + انتقاء بالمضادات", textFr: "Mutations spontanées + sélection par antibiotiques", isCorrect: true },
                  { textAr: "تحول الفرد مباشرة", textFr: "Transformation directe des individus", isCorrect: false },
                  { textAr: "التكاثر الجنسي للبكتيريا", textFr: "Reproduction sexuée des bactéries", isCorrect: false },
                  { textAr: "غياب جينية المقاومة", textFr: "Absence de gènes de résistance", isCorrect: false },
                ],
              },
              {
                promptAr: "في الخلية، المورثة الموجودة على صبغي autosome تتواجد في حالة معينة بـ:",
                promptFr: "Dans une cellule, un gène autosomique existe en :",
                explanationAr: "بالنسبة للصبغيات المتماثلة (N pairs) فإن المورثة موجودة في نسختين، لذلك توجد في حالتين أليليتين.",
                explanationFr: "Sur une paire de chromosomes homologues, le gène existe en deux exemplaires (deux allèles).",
                options: [
                  { textAr: "نسختين متقابلتين (أليلان)", textFr: "Deux exemplaires (deux allèles)", isCorrect: true },
                  { textAr: "نسخة واحدة", textFr: "Un seul exemplaire", isCorrect: false },
                  { textAr: "أربع نسخ", textFr: "Quatre exemplaires", isCorrect: false },
                  { textAr: "ثلاث نسخ", textFr: "Trois exemplaires", isCorrect: false },
                ],
              },
            ],
          },
          {
            slug: "systeme-nerveux",
            titleAr: "الجهاز العصبي",
            titleFr: "Système nerveux",
            questions: [
              {
                promptAr: "القفزة الجهدية (impulsion nerveuse) تنتقل في النسيج العضلي بواسطة:",
                promptFr: "La transmission de l'influx nerveux au niveau de la fente synaptique se fait par :",
                year: 2021,
                session: "normal",
                source: "Examen National 2021 – SVT",
                explanationAr: "عند المشبك العصبي (fente synaptique) ينتقل النبأ بواسطة نواقل كيميائية (neurotransmetteurs).",
                explanationFr: "Au niveau de la fente synaptique, l'influx est transmis par des neurotransmetteurs (chimique).",
                options: [
                  { textAr: "نواقل عصبية كيميائية", textFr: "Des neurotransmetteurs chimiques", isCorrect: true },
                  { textAr: "توصيل كهربائي مباشر", textFr: "Un passage électrique direct", isCorrect: false },
                  { textAr: "انتشار سلبي بدون وسطاء", textFr: "Diffusion passive sans médiateur", isCorrect: false },
                  { textAr: "لا يمكن أن ينتقل", textFr: "Il ne peut pas passer", isCorrect: false },
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "physique-chimie",
        nameAr: "الفيزياء والكيمياء",
        nameFr: "Physique-Chimie",
        icon: "⚗️",
        chapters: [
          {
            slug: "electricite",
            titleAr: "التيار الكهربائي",
            titleFr: "Électricité",
            questions: [
              {
                promptAr: "توتر قيمته القصوى U_max=311V. القيمة الفعالة U للتوتر تساوي:",
                promptFr: "U_max=311V. La valeur efficace U vaut :",
                year: 2023,
                session: "normal",
                source: "Examen National 2023 – PC SVT",
                explanationAr: "U = U_max/√2 = 311/√2 ≈ 220V.",
                explanationFr: "U = U_max/√2 = 311/√2 ≈ 220 V.",
                options: [
                  { textAr: "220 V", textFr: "220 V", isCorrect: true },
                  { textAr: "311 V", textFr: "311 V", isCorrect: false },
                  { textAr: "440 V", textFr: "440 V", isCorrect: false },
                  { textAr: "155 V", textFr: "155 V", isCorrect: false },
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "mathematiques",
        nameAr: "الرياضيات",
        nameFr: "Mathématiques",
        icon: "📐",
        chapters: [
          {
            slug: "probabilites",
            titleAr: "الاحتمالات",
            titleFr: "Probabilités",
            questions: [
              {
                promptAr: "نسحب عشوائيا بطاقة من صندوق يحوي 3 كرات حمراء و 4 خضراء (بدون إرجاع). احتمال سحب كرة حمراء في السحب الأول:",
                promptFr: "Urne : 3 boules rouges, 4 vertes. Tirage sans remise. P(rouge au 1er tirage) =",
                explanationAr: "احتمال اللون الأحمر = 3/7.",
                explanationFr: "P(rouge) = 3/7.",
                options: [
                  { textAr: "3/7", textFr: "3/7", isCorrect: true },
                  { textAr: "4/7", textFr: "4/7", isCorrect: false },
                  { textAr: "1/3", textFr: "1/3", isCorrect: false },
                  { textAr: "3/4", textFr: "3/4", isCorrect: false },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "sp",
    nameAr: "شعبة العلوم الفيزيائية",
    nameFr: "Sciences Physiques",
    subjects: [
      {
        slug: "physique-chimie",
        nameAr: "الفيزياء والكيمياء",
        nameFr: "Physique-Chimie",
        icon: "⚗️",
        chapters: [
          {
            slug: "ondes",
            titleAr: "الظواهر الموجية",
            titleFr: "Ondes",
            questions: [
              {
                promptAr: "موجة صوتية ترددها f=500Hz وسرعتها v=340m/s. الطول الموجي λ يساوي:",
                promptFr: "Onde sonore f=500 Hz, v=340 m/s. λ = ?",
                year: 2024,
                session: "rattrapage",
                source: "Examen National 2024 – PC SP",
                explanationAr: "λ = v/f = 340/500 = 0.68 m.",
                explanationFr: "λ = v/f = 340/500 = 0,68 m.",
                options: [
                  { textAr: "0.68 m", textFr: "0,68 m", isCorrect: true },
                  { textAr: "170 m", textFr: "170 m", isCorrect: false },
                  { textAr: "6.8 m", textFr: "6,8 m", isCorrect: false },
                  { textAr: "680 m", textFr: "680 m", isCorrect: false },
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "mathematiques",
        nameAr: "الرياضيات",
        nameFr: "Mathématiques",
        icon: "📐",
        chapters: [
          {
            slug: "fonctions",
            titleAr: "الدراسة البيانية للدوال",
            titleFr: "Étude de fonctions",
            questions: [
              {
                promptAr: "الدالة f(x) = ln(x) معرفة على المجال:",
                promptFr: "La fonction f(x)=ln(x) est définie sur :",
                explanationAr: "ln(x) معرفة للقيم الموجبة فقط: ℝ⁺*.",
                explanationFr: "ln(x) est définie pour x>0 : ℝ⁺*.",
                options: [
                  { textAr: "ℝ⁺*", textFr: "ℝ⁺*", isCorrect: true },
                  { textAr: "ℝ", textFr: "ℝ", isCorrect: false },
                  { textAr: "ℝ*", textFr: "ℝ*", isCorrect: false },
                  { textAr: "[0,+∞[", textFr: "[0,+∞[", isCorrect: false },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "eco",
    nameAr: "شعبة العلوم الاقتصادية والتدبير",
    nameFr: "Sciences Économiques et Gestion",
    subjects: [
      {
        slug: "economie",
        nameAr: "الاقتصاد والتدبير",
        nameFr: "Économie & Gestion",
        icon: "💼",
        chapters: [
          {
            slug: "indicateurs",
            titleAr: "المؤشرات الاقتصادية",
            titleFr: "Indicateurs économiques",
            questions: [
              {
                promptAr: "الناتج الداخلي الخام (GDP) يقيس:",
                promptFr: "Le PIB mesure :",
                year: 2023,
                session: "normal",
                source: "Examen National 2023 – Économie",
                explanationAr: "الناتج الداخلي الخام هو مجموع القيم المضافة للاقتصاد في سنة معينة.",
                explanationFr: "Le PIB est la somme des valeurs ajoutées d'une économie sur une période donnée.",
                options: [
                  { textAr: "مجموع القيمة المضافة", textFr: "La somme des valeurs ajoutées", isCorrect: true },
                  { textAr: "مجموع الصادرات", textFr: "La somme des exportations", isCorrect: false },
                  { textAr: "مجموع الأجور", textFr: "La somme des salaires", isCorrect: false },
                  { textAr: "الادخار الوطني", textFr: "L'épargne nationale", isCorrect: false },
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "philosophie",
        nameAr: "الفلسفة",
        nameFr: "Philosophie",
        icon: "🤔",
        chapters: [
          {
            slug: "concepts",
            titleAr: "المفاهيم والتصورات",
            titleFr: "Notions & concepts",
            questions: [
              {
                promptAr: "مفهوم «الوعي» في الفلسفة يُعرف بكونه:",
                promptFr: "En philosophie, la « conscience » est :",
                explanationAr: "الوعي هو إدراك الذات للعالم ولنفسها، معرفة فورية لمضامين الشعور.",
                explanationFr: "La conscience est l'intuition qu'a le sujet de ses états et actes (connaissance immédiate).",
                options: [
                  { textAr: "إدراك الذات للعالم ولنفسها", textFr: "La connaissance immédiate du sujet sur lui-même", isCorrect: true },
                  { textAr: "مجرد سلوك اجتماعي", textFr: "Un simple comportement social", isCorrect: false },
                  { textAr: "نتاج المادة البحتة", textFr: "Le pur produit de la matière", isCorrect: false },
                  { textAr: "غياب التفكير", textFr: "L'absence de pensée", isCorrect: false },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "lettres",
    nameAr: "شعبة الآداب والعلوم الإنسانية",
    nameFr: "Lettres et Sciences Humaines",
    subjects: [
      {
        slug: "philosophie",
        nameAr: "الفلسفة",
        nameFr: "Philosophie",
        icon: "🤔",
        chapters: [
          {
            slug: "pensee",
            titleAr: "مباحث الفكر الفلسفي",
            titleFr: "Axes de la pensée",
            questions: [
              {
                promptAr: "لماذا يطرح الفيلسوف الأسئلة؟ الجواب الأمثل:",
                promptFr: "Pourquoi le philosophe pose-t-il des questions ?",
                year: 2022,
                session: "normal",
                source: "Examen National 2022 – Philosophie",
                explanationAr: "الفلسفة هي موقف نقدي قائم على السؤال والتساؤل حول الموجود والقيم.",
                explanationFr: "La philosophie est une attitude critique fondée sur le questionnement de l'existence et des valeurs.",
                options: [
                  { textAr: "للشك في البديهيات وبناء المعرفة", textFr: "Pour douter des évidences et construire le savoir", isCorrect: true },
                  { textAr: "لترديد آراء الآخرين", textFr: "Pour répéter les avis des autres", isCorrect: false },
                  { textAr: "كعرض للذكاء فقط", textFr: "Par simple étalage d'intelligence", isCorrect: false },
                  { textAr: "لتجنب الإجابة", textFr: "Pour éviter de répondre", isCorrect: false },
                ],
              },
            ],
          },
        ],
      },
      {
        slug: "francais",
        nameAr: "الفرنسية",
        nameFr: "Français",
        icon: "📖",
        chapters: [
          {
            slug: "lecture",
            titleAr: "قراءة النصوص",
            titleFr: "Lecture de textes",
            questions: [
              {
                promptAr: "نص سردي... أي جملة تعتبر قولًا غير مباشر (discours indirect)؟",
                promptFr: "Quelle phrase est au discours indirect ?",
                year: 2023,
                session: "normal",
                source: "Examen National 2023 – Français",
                explanationAr: "كلام غير مباشر: «Il a dit qu'il viendrait demain».",
                explanationFr: "Le discours indirect rapporte les paroles avec un verbe introducteur + subordonnée.",
                options: [
                  { textAr: "Il a dit qu'il viendrait demain.", textFr: "Il a dit qu'il viendrait demain.", isCorrect: true },
                  { textAr: "«Je viendrai demain»", textFr: "« Je viendrai demain »", isCorrect: false },
                  { textAr: "Il vient demain.", textFr: "Il vient demain.", isCorrect: false },
                  { textAr: "Viens demain !", textFr: "Viens demain !", isCorrect: false },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "arts",
    nameAr: "شعبة الفنون",
    nameFr: "Arts appliqués",
    subjects: [
      {
        slug: "histoire-arts",
        nameAr: "تاريخ الفنون",
        nameFr: "Histoire des arts",
        icon: "🎨",
        chapters: [
          {
            slug: "courants",
            titleAr: "التيارات الفنية",
            titleFr: "Courants artistiques",
            questions: [
              {
                promptAr: "الانطباعية (Impressionnisme) هو تيار فني:",
                promptFr: "L'impressionnisme est un mouvement artistique :",
                explanationAr: "الانطباعية تيار فني ظهر في فرنسا في نهاية القرن 19 ويتميز بالاهتمام بالضوء والانطباع اللحظي.",
                explanationFr: "Mouvement né en France à la fin du XIXe siècle, centré sur la lumière et l'impression immédiate.",
                options: [
                  { textAr: "تأسس على الضوء والانطباع اللحظي", textFr: "Fondé sur la lumière et l'impression immédiate", isCorrect: true },
                  { textAr: "يرفض كل أشكال الرسم", textFr: "Refuse toute forme de peinture", isCorrect: false },
                  { textAr: "ظهر في مصر القديمة", textFr: "Né dans l'Égypte antique", isCorrect: false },
                  { textAr: "يعتمد على الهندسة الصرفة", textFr: "Basé sur la géométrie pure", isCorrect: false },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

async function main() {
  await prisma.quizAnswer.deleteMany();
  await prisma.quizResult.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.branch.deleteMany();

  for (const branch of DATA) {
    await prisma.branch.create({
      data: {
        slug: branch.slug,
        nameAr: branch.nameAr,
        nameFr: branch.nameFr,
        subjects: {
          create: branch.subjects.map((subject, si) => ({
            slug: subject.slug,
            nameAr: subject.nameAr,
            nameFr: subject.nameFr,
            icon: subject.icon,
            order: si,
            chapters: {
              create: subject.chapters.map((chapter, ci) => ({
                slug: chapter.slug,
                titleAr: chapter.titleAr,
                titleFr: chapter.titleFr,
                order: ci,
                questions: {
                  create: chapter.questions.map((q) => ({
                    promptAr: q.promptAr,
                    promptFr: q.promptFr,
                    year: q.year,
                    session: q.session,
                    source: q.source,
                    explanationAr: q.explanationAr,
                    explanationFr: q.explanationFr,
                    options: {
                      create: q.options.map((o, oi) => ({
                        textAr: o.textAr,
                        textFr: o.textFr,
                        order: oi,
                        isCorrect: o.isCorrect,
                      })),
                    },
                  })),
                },
              })),
            },
          })),
        },
      },
    });
  }

  const counts = await Promise.all([
    prisma.branch.count(),
    prisma.subject.count(),
    prisma.chapter.count(),
    prisma.question.count(),
    prisma.option.count(),
  ]);

  console.log("Seed done:", {
    branches: counts[0],
    subjects: counts[1],
    chapters: counts[2],
    questions: counts[3],
    options: counts[4],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());