import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

type QSeed = { ar: string; fr: string; expAr: string; expFr: string; opts: { ar: string; fr: string; ok?: boolean }[] };
type ChapterDef = { slug: string; titleAr: string; titleFr: string; lessonAr: string; lessonFr: string; questions: QSeed[] };

// ------------------------------------------------------------------ SM : MATHEMATIQUES
const mathChapters: ChapterDef[] = [
  {
    slug: "suites-numeriques",
    titleAr: "المتتاليات العددية",
    titleFr: "Suites numériques",
    lessonAr: `## المتتاليات العددية
المتتالية العددية هي تطبيق من الأعداد الطبيعية نحو الأعداد الحقيقية: (u_n).

- **الرتابة**: متتالية متزايدة إذا كان u_{n+1} ≥ u_n، ومتناقصة إذا كان u_{n+1} ≤ u_n.
- **النهاية**: المتتالية المتزايدة والمكبورة من الأعلى متقاربة (مبرهنة التقارب الأحادي).
- **متتالية هندسية**: u_{n+1} = q·u_n، إذا كان |q| < 1 فإنها تتقارب نحو 0.
- **متتاليتان متجاورتان**: الأولى متزايدة ومكبورة، والثانية متناقصة ومصغورة، والفرق بينهما يؤول إلى 0، فتتقاربان نحو نفس الحد.

### ماذا نستفيد؟
- معرفة حدود المتتاليات والاستدلال بالتراجع (الاستقراء).
- حل المعادلات بالمقلوب u_{n+1} = f(u_n) عبر المبرهنة الأساسية للمتتاليات.
- الثابتة: إذا كانت u_n تقبل نهاية ℓ فإن ℓ = f(ℓ) عندما f متصلة.`,
    lessonFr: `## Suites numériques
Une suite numérique est une application de ℕ vers ℝ : (u_n).

- **Monotonie** : une suite est croissante si u_{n+1} ≥ u_n, décroissante si u_{n+1} ≤ u_n.
- **Limite** : toute suite croissante et majorée converge (théorème de convergence monotone).
- **Suite géométrique** : u_{n+1} = q·u_n ; si |q| < 1 alors u_n → 0.
- **Suites adjacentes** : l'une croissante et majorée, l'autre décroissante et minorée, et leur différence tend vers 0 ; elles convergent vers la même limite.

### Ce qu'il faut retenir
- Calculer les limites de suites et raisonner par récurrence.
- Étudier les suites récurrentes u_{n+1} = f(u_n) par le théorème du point fixe.
- Si u_n converge vers ℓ et f est continue, alors ℓ = f(ℓ).`,
    questions: [
      {
        ar: "متتالية هندسية أساسها q بحيث |q| < 1:",
        fr: "Pour une suite géométrique de raison |q| < 1 :",
        expAr: "إذا كان |q| < 1 فإن المتتالية تتقارب نحو 0.",
        expFr: "Si |q| < 1 alors la suite converge vers 0.",
        opts: [
          { ar: "تتقارب نحو 0", fr: "Converge vers 0", ok: true },
          { ar: "تتقارب نحو 1", fr: "Converge vers 1" },
          { ar: "تتباعد", fr: "Diverge" },
          { ar: "تتأرجح", fr: "Oscille" },
        ],
      },
      {
        ar: "متتالية متزايدة ومكبورة من الأعلى:",
        fr: "Une suite croissante et majorée :",
        expAr: "حسب مبرهنة التقارب الأحادي، فهي متقاربة.",
        expFr: "D'après le théorème de convergence monotone, elle converge.",
        opts: [
          { ar: "متقاربة", fr: "Convergente", ok: true },
          { ar: "متباعدة نحو +∞", fr: "Diverge vers +∞" },
          { ar: "غير أساسية", fr: "Pas de limite" },
          { ar: "دورية", fr: "Périodique" },
        ],
      },
      {
        ar: "المتتاليان (u_n) و(v_n) متجاورتان يعني:",
        fr: "Deux suites (u_n) et (v_n) sont adjacentes si :",
        expAr: "واحدة متزايدة ومكبورة والأخرى متناقصة ومصغورة والفرق بينهما ينعدم عند +∞.",
        expFr: "L'une est croissante et majorée, l'autre décroissante et minorée, avec une différence qui tend vers 0.",
        opts: [
          { ar: "فرقهم يؤول إلى 0 والاتجاهين متعاكسان في الرتابة", fr: "Leur différence tend vers 0 et les monotonies sont opposées", ok: true },
          { ar: "لهما نفس القيمة من البداية", fr: "Elles ont la même première valeur" },
          { ar: "حدودهما كلها موجبة", fr: "Tous leurs termes sont positifs" },
          { ar: "متتالية هندسية واحدة", fr: "Une seule suite géométrique" },
        ],
      },
      {
        ar: "إذا كانت u_{n+1} = f(u_n) و(u_n) متقاربة نحو ℓ:f",
        fr: "Si u_{n+1} = f(u_n) et (u_n) converge vers ℓ, avec f continue :",
        expAr: "نستنتج أن ℓ نقطة ثابتة: ℓ = f(ℓ).",
        expFr: "Alors ℓ est un point fixe : ℓ = f(ℓ).",
        opts: [
          { ar: "ℓ = f(ℓ)", fr: "ℓ = f(ℓ)", ok: true },
          { ar: "ℓ = 0", fr: "ℓ = 0" },
          { ar: "ℓ = f'(ℓ)", fr: "ℓ = f'(ℓ)" },
          { ar: "ℓ = 1", fr: "ℓ = 1" },
        ],
      },
    ],
  },
  {
    slug: "etude-des-fonctions",
    titleAr: "دراسة الدوال",
    titleFr: "Étude de fonctions",
    lessonAr: `## دراسة الدوال
لدراسة دالة f على مجال I نتبع المنهجية التالية:

- **مجال التعريف** ثم الاشتقاق والحساب f'(x).
- **إشارة المشتقة** لتحديد اتجاه التغير (جدول التغيرات).
- **الفروع اللانهائية**: إذا كان lim f(x)/x = a لدى +∞ فإن f تقبل مقارباً مائلاً معامده a، وإذا كان a ∈ ℝ والنهاية f(x) − a·x منتهية فإن المعادلة y = ax + b مقارب مائل.
- **النقط الحرجة**: القيم القصوى والدنيا: إذا تغيرت إشارة المشتقة فإن الدالة تقبل نهاية قصوى أو دنيا محلية.

### ماذا نستفيد؟
- رسم المنحنى C_f بدقة (نقط التعيين والتقاطع والمماسات).
- دراسة تقاطع المنحنيات وحل المعادلات بيانياً.
- استخدام المبرهنة حول القيم الوسيطية (TVI) لحل f(x) = k.`,
    lessonFr: `## Étude de fonctions
Pour étudier une fonction f sur un intervalle I :

- **Domaine de définition**, puis dérivation et calcul de f'.
- **Signe de la dérivée** pour déduire le sens de variation (tableau de variation).
- **Branches infinies** : si f(x)/x tend vers a en +∞, f admet une direction asymptotique ; si de plus f(x) − ax tend vers b, la droite y = ax + b est asymptote oblique.
- **Extremums** : si f' change de signe en x₀, alors f admet un extremum local en x₀.

### Ce qu'il faut retenir
- Tracer précisément C_f (points remarquables, intersections, tangentes).
- Résoudre graphiquement équations et inéquations.
- Utiliser le théorème des valeurs intermédiaires (TVI) pour f(x) = k.`,
    questions: [
      {
        ar: "الدالة f تقبل قيماً قصوى محلية في x₀ إذا كانت:",
        fr: "Une fonction f admet un maximum local en x₀ si :",
        expAr: "المشتقة تغير إشارتها من الموجب إلى السالب حول x₀.",
        expFr: "La dérivée change de signe de positif à négatif autour de x₀.",
        opts: [
          { ar: "f' تغير إشارتها من + إلى - حول x₀", fr: "f' change de + à - autour de x₀", ok: true },
          { ar: "f' لا تتغير", fr: "f' est constante" },
          { ar: "f' موجبة دائماً", fr: "f' est toujours positive" },
          { ar: "f' منعدمة في x₀ فقط", fr: "f' s'annule seulement en x₀" },
        ],
      },
      {
        ar: "المقارب المائل لـ f عند +∞ له معادلة y = ax + b حيث:",
        fr: "L'asymptote oblique de f en +∞ est y = ax + b avec :",
        expAr: "a = lim f(x)/x و b = lim (f(x) − ax)",
        expFr: "a = lim f(x)/x et b = lim (f(x) − ax)",
        opts: [
          { ar: "a = lim f(x)/x و b = lim (f(x) − ax)", fr: "a = lim f(x)/x et b = lim (f(x) − ax)", ok: true },
          { ar: "a = lim f'(x)", fr: "a = lim f'(x)" },
          { ar: "a = 1 دائمًا", fr: "a = 1 toujours" },
          { ar: "b = f(0)", fr: "b = f(0)" },
        ],
      },
      {
        ar: "لإثبات أن المعادلة f(x) = k تقبل حالاً وحيداً في [a,b] نستعمل:",
        fr: "Pour montrer que f(x) = k a une unique solution sur [a,b] :",
        expAr: "نتحقق من استمرارية f ورتابتها ثم نستعمل TVI.",
        expFr: "On vérifie la continuité et la monotonie, puis on applique le TVI.",
        opts: [
          { ar: "TVI مع الرتابة", fr: "Le TVI avec la monotonie", ok: true },
          { ar: "قاعدة لوبيتال", fr: "La règle de L'Hôpital" },
          { ar: "المتتاليات المتجاورتان", fr: "Les suites adjacentes" },
          { ar: "مبرهنة فيثاغورس", fr: "Le théorème de Pythagore" },
        ],
      },
      {
        ar: "نقطة انعطاف مقترنة بالدالة f هي نقطة:",
        fr: "Un point d'inflexion de f est un point où :",
        expAr: "المنحنى يقطع مماسه وتنعدم فيه المشتقة الثانية مع تغير إشارتها.",
        expFr: "La courbe traverse sa tangente et f'' s'annule en changeant de signe.",
        opts: [
          { ar: "تتقاطع فيها مع مماسها وتنعدم f'' مع تغير الإشارة", fr: "Elle traverse sa tangente et f'' s'annule en changeant de signe", ok: true },
          { ar: "تنعدم فيها f", fr: "f s'annule" },
          { ar: "تعدوم فيها f' فقط", fr: "Seule f' s'annule" },
          { ar: "لا شيء مميز", fr: "Rien de particulier" },
        ],
      },
    ],
  },
  {
    slug: "exponentielles-logarithmes",
    titleAr: "الدوال الأسية واللوغاريتمية",
    titleFr: "Fonctions exponentielle et logarithme",
    lessonAr: `## الدوال الأسية واللوغاريتمية
- **الدالة الأسية**: exp(x) = eˣ، أساسية نفي القاعدة: e⁰ = 1، (eˣ)' = eˣ، eᵃ⁺ᵇ = eᵃ·eᵇ.
- **الدالة اللوغاريتمية**: ln هي الدالة العكسية لـ exp، معرّفة على ]0,+∞[، (ln x)' = 1/x، ln(a·b) = ln a + ln b، ln(aᵇ) = b·ln a.
- **الحدود المرجعية**: lim_{x→+∞} eˣ/x = +∞، lim_{x→+∞} ln(x)/x = 0، lim_{x→0} ln(1+x)/x = 1.
- **حل المعادلات والمتراجحات**: eᵘ = eᵛ ⟺ u = v؛ لn u = l n v ⟺ u = v (u,v>0).

### ماذا نستفيد؟
- دراسة الدوال المركبة (eᵘ) و(ln u): مشتقتهما u'·eᵘ أو u'/u.
- حساب النهايات التي تتضمن أشكالاً غير محددة.
- حل المعادلات الأسية واللوغاريتمية وتوظيفها في الوضعيات.`,
    lessonFr: `## Fonctions exponentielle et logarithme
- **Exponentielle** : exp(x) = eˣ. Propriétés : e⁰ = 1, (eˣ)' = eˣ, eᵃ⁺ᵇ = eᵃ·eᵇ.
- **Logarithme** : ln est la bijection réciproque de exp, définie sur ]0,+∞[ ; (ln x)' = 1/x, ln(a·b) = ln a + ln b, ln(aᵇ) = b·ln a.
- **Limites de référence** : lim eˣ/x = +∞, lim ln(x)/x = 0, lim ln(1+x)/x = 1.
- **Équations** : eᵘ = eᵛ ⟺ u = v ; ln u = ln v ⟺ u = v (u,v > 0).

### Ce qu'il faut retenir
- Dériver les fonctions composées (eᵘ)' = u'·eᵘ et (ln u)' = u'/u.
- Lever les formes indéterminées classiques.
- Résoudre équations et inéquations exponentielles / logarithmiques.`,
    questions: [
      {
        ar: "قيمة lim_{x→+∞} eˣ/x هي:",
        fr: "La valeur de lim_{x→+∞} eˣ/x est :",
        expAr: "النهاية المرجعية تعطي +∞ (الأسية تسود على القوى).",
        expFr: "Limite de référence : +∞ (l'exponentielle domine les puissances).",
        opts: [
          { ar: "+∞", fr: "+∞", ok: true },
          { ar: "0", fr: "0" },
          { ar: "1", fr: "1" },
          { ar: "e", fr: "e" },
        ],
      },
      {
        ar: "مشتقة الدالة f(x) = e^(2x) هي:",
        fr: "La dérivée de f(x) = e^(2x) est :",
        expAr: "باستعمال (eᵘ)' = u'·eᵘ نحصل على 2e^(2x).",
        expFr: "Avec (eᵘ)' = u'·eᵘ on obtient 2e^(2x).",
        opts: [
          { ar: "2e^(2x)", fr: "2e^(2x)", ok: true },
          { ar: "e^(2x)", fr: "e^(2x)" },
          { ar: "2e^x", fr: "2e^x" },
          { ar: "e^(x)", fr: "e^(x)" },
        ],
      },
      {
        ar: "حل المعادلة ln x = 3 هو:",
        fr: "La solution de ln x = 3 est :",
        expAr: "بجذر الأسية: x = e³.",
        expFr: "En prenant l'exponentielle : x = e³.",
        opts: [
          { ar: "x = e³", fr: "x = e³", ok: true },
          { ar: "x = 3", fr: "x = 3" },
          { ar: "x = 3e", fr: "x = 3e" },
          { ar: "x = ln 3", fr: "x = ln 3" },
        ],
      },
      {
        ar: "مجال تعريف الدالة f(x) = ln(x − 1) هو:",
        fr: "Le domaine de définition de f(x) = ln(x − 1) est :",
        expAr: "نشترط x − 1 > 0 أي x > 1.",
        expFr: "On impose x − 1 > 0, donc x > 1.",
        opts: [
          { ar: "x > 1", fr: "x > 1", ok: true },
          { ar: "x ≥ 1", fr: "x ≥ 1" },
          { ar: "x > 0", fr: "x > 0" },
          { ar: "كل الأعداد الحقيقية", fr: "Tout ℝ" },
        ],
      },
    ],
  },
  {
    slug: "primitives-integrales",
    titleAr: "الأصلاقات والتكامل",
    titleFr: "Primitives et intégrales",
    lessonAr: `## الأصلاقات والتكامل
- **أصلاقة**: F أصلاقة لـ f على I إذا كانت F قابلة للاشتقاق و F' = f. كل الدوال المتصلة على مجال تقبل أصلاقات.
- **أصلاقات مرجعية**: أصلاقة x^n هي x^(n+1)/(n+1)، أصلاقة e^x هي e^x، أصلاقة 1/x هي ln|x|، أصلاقة cos و sin هي sin و −cos.
- **التكامل**: ∫ₐᵇ f(x)dx = F(b) − F(a). الخصائص: الخطية، التجزئة، التغير المتفاضل ∫ₐᵇ u'·f(u)dx.
- **التكامل بالتجزئة**: ∫ u·v' = [u·v] − ∫ u'·v (لتكاملات تفوق التقنيات البسيطة).

### ماذا نستفيد؟
- حساب المساحات: المساحة بين المنحنى والمحور = |∫ₐᵇ f(x)dx|.
- دراسة متغيرات التكامل والدوال المعرفة بتكامل.
- التفاوتات المتكاملة والمبرهنة المتوسطة للقيم.`,
    lessonFr: `## Primitives et intégrales
- **Primitive** : F est une primitive de f sur I si F' = f. Toute fonction continue sur un intervalle admet des primitives.
- **Primitives usuelles** : x^(n+1)/(n+1), eˣ, ln|x|, sin, −cos, ...
- **Intégrale** : ∫ₐᵇ f = F(b) − F(a). Linéarité, relation de Chasles, changement de variable ∫ₐᵇ u'(x)·f(u(x))dx.
- **Intégration par parties** : ∫ u·v' = [u·v] − ∫ u'·v.

### Ce qu'il faut retenir
- Calculer l'aire entre une courbe et l'axe : A = |∫ₐᵇ f(x)dx|.
- Étudier les fonctions définies par une intégrale.
- Utiliser les inégalités intégrales et prendre la valeur moyenne.`,
    questions: [
      {
        ar: "قيمة التكامل ∫₀¹ eˣ dx هي:",
        fr: "La valeur de ∫₀¹ eˣ dx est :",
        expAr: "أصلاقة eˣ هي eˣ، إذن النتيجة e¹ − e⁰ = e − 1.",
        expFr: "Une primitive de eˣ est eˣ, donc e¹ − e⁰ = e − 1.",
        opts: [
          { ar: "e − 1", fr: "e − 1", ok: true },
          { ar: "e", fr: "e" },
          { ar: "1", fr: "1" },
          { ar: "e + 1", fr: "e + 1" },
        ],
      },
      {
        ar: "أصلاقة الدالة f(x) = 3x² هي:",
        fr: "Une primitive de f(x) = 3x² est :",
        expAr: "باستعمال قاعدة xⁿ نجد F(x) = x³.",
        expFr: "Avec la formule de xⁿ on obtient F(x) = x³.",
        opts: [
          { ar: "F(x) = x³", fr: "F(x) = x³", ok: true },
          { ar: "F(x) = 3x³", fr: "F(x) = 3x³" },
          { ar: "F(x) = 6x", fr: "F(x) = 6x" },
          { ar: "F(x) = x²", fr: "F(x) = x²" },
        ],
      },
      {
        ar: "المساحة بين C_f والمحور من a إلى b عندما تكون f سالبة هي:",
        fr: "L'aire entre C_f et l'axe de a à b quand f ≤ 0 vaut :",
        expAr: "المساحة هي −∫ₐᵇ f(x)dx لأن التكامل سالب.",
        expFr: "L'aire vaut −∫ₐᵇ f(x)dx car l'intégrale est négative.",
        opts: [
          { ar: "−∫ₐᵇ f(x)dx", fr: "−∫ₐᵇ f(x)dx", ok: true },
          { ar: "∫ₐᵇ f(x)dx", fr: "∫ₐᵇ f(x)dx" },
          { ar: "f(b) − f(a)", fr: "f(b) − f(a)" },
          { ar: "f'(b) − f'(a)", fr: "f'(b) − f'(a)" },
        ],
      },
      {
        ar: "التكامل بالتجزئة يعتمد على العلاقة:",
        fr: "L'intégration par parties repose sur :",
        expAr: "∫ u·v' = [u·v]ₐᵇ − ∫ u'·v.",
        expFr: "∫ u·v' = [u·v]ₐᵇ − ∫ u'·v.",
        opts: [
          { ar: "∫ u·v' = [u·v] − ∫ u'·v", fr: "∫ u·v' = [u·v] − ∫ u'·v", ok: true },
          { ar: "∫ u·v = ∫ u·∫ v", fr: "∫ u·v = ∫ u·∫ v" },
          { ar: "∫ u·v' = u·v", fr: "∫ u·v' = u·v" },
          { ar: "∫ u'·v' = u·v", fr: "∫ u'·v' = u·v" },
        ],
      },
    ],
  },
  {
    slug: "probabilites",
    titleAr: "الاحتمالات",
    titleFr: "Probabilités",
    lessonAr: `## الاحتمالات
- **احتمال شرطي**: احتمال وقوع B علماً أن A قد وقع: P(A∩B) = P(A)·P_A(B).
- **التحليل**: P(B) = P(A)·P_A(B) + P(A̅)·P_A̅(B) (مبرهنة الاحتمالات الكلية).
- **بايز**: P_A(B) = P(B)·P_B(A) / P(A).
- **متغير عشوائي**: تطبيق من Ω نحو ℝ، الأمل الرياضي E(X) = Σ xᵢ·P(X=xᵢ)، التباين Var(X) = E(X²) − (E(X))².
- **قانون ذي الحدين**: عدد الاختبارات المكررة المستقلة: P(X=k) = C(n,k) pᵏ(1−p)ⁿ⁻ᵏ، E(X) = np، V(X) = np(1−p).

### ماذا نستفيد؟
- حل مسائل الاحتمال الشرطي وتحليل مجموعة الأحداث.
- حساب الأمل والتباين لتفسير توزيع البيانات.
- تمييز المواقف التكرارية المرتبطة بقانون ذي الحدين.`,
    lessonFr: `## Probabilités
- **Probabilité conditionnelle** : P(A∩B) = P(A)·P_A(B).
- **Formule des probabilités totales** : P(B) = P(A)·P_A(B) + P(A̅)·P_A̅(B).
- **Formule de Bayes** : P_A(B) = P(B)·P_B(A) / P(A).
- **Variable aléatoire** : espérance E(X) = Σ xᵢ·P(X=xᵢ), variance Var(X) = E(X²) − E(X)².
- **Loi binomiale** : P(X=k) = C(n,k) pᵏ(1−p)ⁿ⁻ᵏ, avec E(X) = np et V(X) = np(1−p).

### Ce qu'il faut retenir
- Utiliser les probabilités conditionnelles et l'analyse des événements.
- Calculer espérance et variance.
- Reconnaître les schémas de Bernoulli répétés (loi binomiale).`,
    questions: [
      {
        ar: "إذا كان P(A) = 0.4 و P_A(B) = 0.25 فإن P(A∩B) يساوي:",
        fr: "Si P(A) = 0.4 et P_A(B) = 0.25 alors P(A∩B) vaut :",
        expAr: "P(A∩B) = P(A)·P_A(B) = 0.4 × 0.25 = 0.1.",
        expFr: "P(A∩B) = P(A)·P_A(B) = 0.4 × 0.25 = 0.1.",
        opts: [
          { ar: "0.1", fr: "0.1", ok: true },
          { ar: "0.65", fr: "0.65" },
          { ar: "0.25", fr: "0.25" },
          { ar: "0.4", fr: "0.4" },
        ],
      },
      {
        ar: "تمارين X منفصلة: الأمل الرياضي E(X) يحسب بـ:",
        fr: "Pour une variable aléatoire discrète, l'espérance E(X) vaut :",
        expAr: "E(X) = Σ xᵢ·pᵢ = مجموع قيم x مضروبة في احتمالاتها.",
        expFr: "E(X) = Σ xᵢ·pᵢ, somme des valeurs pondérées par leurs probabilités.",
        opts: [
          { ar: "Σ xᵢ·P(X=xᵢ)", fr: "Σ xᵢ·P(X=xᵢ)", ok: true },
          { ar: "Π xᵢ·P(X=xᵢ)", fr: "Π xᵢ·P(X=xᵢ)" },
          { ar: "max(xᵢ)", fr: "max(xᵢ)" },
          { ar: "x₁ + x₂", fr: "x₁ + x₂" },
        ],
      },
      {
        ar: "قانون ذي الحدين B(n,p) يعطي التوقع:",
        fr: "La loi binomiale B(n,p) a pour espérance :",
        expAr: "E(X) = np والتباين V(X) = np(1−p).",
        expFr: "E(X) = np et V(X) = np(1−p).",
        opts: [
          { ar: "E(X) = np", fr: "E(X) = np", ok: true },
          { ar: "E(X) = n+p", fr: "E(X) = n+p" },
          { ar: "E(X) = p(1−p)", fr: "E(X) = p(1−p)" },
          { ar: "E(X) = n", fr: "E(X) = n" },
        ],
      },
      {
        ar: "P(A∪B) للحدثين غير المتلائمين يساوي:",
        fr: "P(A∪B) pour deux événements incompatibles vaut :",
        expAr: "غیر متلائمين: A∩B = ∅ إذن P(A∪B) = P(A) + P(B).",
        expFr: "Incompatibles (A∩B = ∅) : P(A∪B) = P(A) + P(B).",
        opts: [
          { ar: "P(A) + P(B)", fr: "P(A) + P(B)", ok: true },
          { ar: "P(A)·P(B)", fr: "P(A)·P(B)" },
          { ar: "P(A) − P(B)", fr: "P(A) − P(B)" },
          { ar: "P(A) + P(B) − P(A∩B)", fr: "P(A) + P(B) − P(A∩B)" },
        ],
      },
    ],
  },
  {
    slug: "geometrie-espace",
    titleAr: "الهندسة الفضائية",
    titleFr: "Géométrie dans l'espace",
    lessonAr: `## الهندسة الفضائية
- **المنتج الاتجاهي**: u ∧ v متجه عمودي على u وv، معامده ||u||·||v||·sin θ، ويحقق علاقات الخطية والتبادلية: v ∧ u = −(u ∧ v).
- **الجداء السلمي**: u·v = ||u||·||v||·cos θ = x₁x₂ + y₁y₂ + z₁z₂ للمتعامدين.
- **معادلة مستوى مار من النقطة A وcعمودي على n⃗**: n⃗·(M − A) = 0 أي ax + by + cz + d = 0.
- **المسافة من نقطة إلى مستوى**: d = |ax₀+by₀+cz₀+d| / √(a²+b²+c²).
- **التمثيل الوسيطي للمستقيم**: M = A + t·u⃗، t ∈ ℝ.

### ماذا نستفيد؟
- إثبات التعامد والتوازي بين مستقيمات ومستويات.
- حساب المسافات والزوايا.
- تحديد تقاطعات المستويات والأسطح.`,
    lessonFr: `## Géométrie dans l'espace
- **Produit vectoriel** : u∧v est orthogonal à u et v, de norme ||u||·||v||·sin θ, avec v∧u = −(u∧v).
- **Produit scalaire** : u·v = ||u||·||v||·cos θ = x₁x₂ + y₁y₂ + z₁z₂ en base orthonormée.
- **Plan** : n⃗·(M − A) = 0, soit ax + by + cz + d = 0.
- **Distance d'un point à un plan** : d = |ax₀+by₀+cz₀+d| / √(a²+b²+c²).
- **Représentation paramétrique d'une droite** : M = A + t·u⃗, t ∈ ℝ.

### Ce qu'il faut retenir
- Prouver orthogonalités et parallélismes.
- Calculer distances et angles.
- Déterminer intersections de plans.`,
    questions: [
      {
        ar: "المنتج الاتجاهي للـداله u ∧ v يساوي:",
        fr: "Le produit vectoriel u ∧ v est :",
        expAr: "منتج اتجاهي من معامده ||u||·||v||·sin θ وعمودي على التواصل u وv.",
        expFr: "Un vecteur orthogonal à u et v, de norme ||u||·||v||·sin θ.",
        opts: [
          { ar: "متجه عمودي على u وv", fr: "Orthogonal à u et v", ok: true },
          { ar: "عدد حقيقي", fr: "Un nombre réel" },
          { ar: "موازي لـ u", fr: "Parallèle à u" },
          { ar: "صفر دائمًا", fr: "Toujours nul" },
        ],
      },
      {
        ar: "معادلة مستوى عمودي على n⃗(1,2,2) ومار من A(0,0,3):",
        fr: "Un plan orthogonal à n⃗(1,2,2) passant par A(0,0,3) :",
        expAr: "n⃗·(M−A)=(x−0)+2(y−0)+2(z−3)=0 → x + 2y + 2z − 6 = 0.",
        expFr: "n⃗·(M−A)=(x)+2y+2(z−3)=0 → x + 2y + 2z − 6 = 0.",
        opts: [
          { ar: "x + 2y + 2z − 6 = 0", fr: "x + 2y + 2z − 6 = 0", ok: true },
          { ar: "x + 2y + 2z = 0", fr: "x + 2y + 2z = 0" },
          { ar: "x + 2y = 3", fr: "x + 2y = 3" },
          { ar: "2x + 2z = 6", fr: "2x + 2z = 6" },
        ],
      },
      {
        ar: "المسافة من النقطة M₀(1,1,1) إلى المستوى x + y + z − 3√3 = 0:",
        fr: "La distance de M₀(1,1,1) au plan x + y + z − 3√3 = 0 :",
        expAr: "d = |3 − 3√3|/√3 = √3 − 1 (قيمة مطلقة ممررة).",
        expFr: "d = |3 − 3√3|/√3 = √3 − 1.",
        opts: [
          { ar: "|3 − 3√3|/√3", fr: "|3 − 3√3|/√3", ok: true },
          { ar: "1", fr: "1" },
          { ar: "3", fr: "3" },
          { ar: "√3", fr: "√3" },
        ],
      },
      {
        ar: "الجداء السلمي لمتعامدين u ⊥ v:",
        fr: "Pour deux vecteurs orthogonaux u ⊥ v :",
        expAr: "الجداء السلمي منعدم: u·v = 0.",
        expFr: "Le produit scalaire est nul : u·v = 0.",
        opts: [
          { ar: "u·v = 0", fr: "u·v = 0", ok: true },
          { ar: "u·v = 1", fr: "u·v = 1" },
          { ar: "u·v = ||u||·||v||", fr: "u·v = ||u||·||v||" },
          { ar: "u·v = −1", fr: "u·v = −1" },
        ],
      },
    ],
  },
];

// ------------------------------------------------------------------ SM : PHYSIQUE-CHIMIE
const pcChapters: ChapterDef[] = [
  {
    slug: "electricite",
    titleAr: "التيار الكهربائي",
    titleFr: "Courant électrique",
    lessonAr: `## التيار الكهربائي
- **ثنائي القطب RC**: عند شحن المكثفة عبر مقاومة: u_C(t) = E(1 − e^(−t/τ)) مع τ = RC ثابتة الزمن.
- **ثنائي القطب RL**: شدة التيار أثناء الاستجابة لرتبة متدرجة: i(t) = E/R (1 − e^(−t/τ))، مع τ = L/R.
- **الدائرة RLC**: تذبذبات حرة مخمدة، النبض الخاص ω₀ = 1/√(LC)، الطاقة تقل تدريجياً بالانتشار بالحرارة.
- **القدرة**: P = u·i، الطاقة المخزنة في المكثفة E = ½Cu² وفي الوشيعة E = ½Li².

### ماذا نستفيد؟
- تمييز الإجابات الزمنية (الشحن والتفريغ والاستجابة لرتبة).
- تحديد τ من بيان u_C أو i.
- دراسة التذبذبات الحرة الثنائية والتلف عليها بالطاقة.`,
    lessonFr: `## Courant électrique
- **Dipôle RC** : charge d'un condensateur à travers une résistance : u_C(t) = E(1 − e^(−t/τ)), avec τ = RC.
- **Dipôle RL** : réponse à un échelon : i(t) = E/R (1 − e^(−t/τ)), τ = L/R.
- **Circuit RLC** : oscillations libres amorties, pulsation propre ω₀ = 1/√(LC), énergie dissipée par effet Joule.
- **Puissance** : P = u·i ; énergie emmagasinée : E = ½Cu² et E = ½Li².

### Ce qu'il faut retenir
- Distinguer la charge, la décharge et la réponse à un échelon.
- Déterminer τ graphiquement (tangente à l'origine, 63%).
- Étudier les oscillations et la conversion d'énergie.`,
    questions: [
      {
        ar: "ثابتة الزمن لدائرة RC تعطى بـ:",
        fr: "La constante de temps d'un circuit RC vaut :",
        expAr: "τ = RC (بالثواني عندما يكون R بالأوم وC بالفاراد).",
        expFr: "τ = RC (en secondes avec R en ohms et C en farads).",
        opts: [
          { ar: "τ = RC", fr: "τ = RC", ok: true },
          { ar: "τ = R/C", fr: "τ = R/C" },
          { ar: "τ = 1/RC", fr: "τ = 1/RC" },
          { ar: "τ = LC", fr: "τ = LC" },
        ],
      },
      {
        ar: "عند شحن المكثفة عبر R من مولّد E:",
        fr: "Lors de la charge d'un condensateur à travers R :",
        expAr: "الطاقة u_C ترتفع من 0 نحو E وفق المنحنى u_C(t) = E(1 − e^(−t/τ)).",
        expFr: "u_C croît de 0 à E selon u_C(t) = E(1 − e^(−t/τ)).",
        opts: [
          { ar: "u_C = E(1 − e^(−t/τ))", fr: "u_C = E(1 − e^(−t/τ))", ok: true },
          { ar: "u_C = E·e^(−t/τ)", fr: "u_C = E·e^(−t/τ)" },
          { ar: "u_C = E/2 ثابتة", fr: "u_C = E/2 constante" },
          { ar: "u_C = E·t", fr: "u_C = E·t" },
        ],
      },
      {
        ar: "النبض الخاص لدائرة RLC:",
        fr: "La pulsation propre d'un circuit RLC :",
        expAr: "ω₀ = 1/√(LC).",
        expFr: "ω₀ = 1/√(LC).",
        opts: [
          { ar: "ω₀ = 1/√(LC)", fr: "ω₀ = 1/√(LC)", ok: true },
          { ar: "ω₀ = √(LC)", fr: "ω₀ = √(LC)" },
          { ar: "ω₀ = RC", fr: "ω₀ = RC" },
          { ar: "ω₀ = L/C", fr: "ω₀ = L/C" },
        ],
      },
      {
        ar: "الطاقة المخزنة في وشيعة بشدتها i:",
        fr: "L'énergie emmagasinée dans une bobine parcourue par i vaut :",
        expAr: "E = ½·L·i².",
        expFr: "E = ½·L·i².",
        opts: [
          { ar: "E = ½Li²", fr: "E = ½Li²", ok: true },
          { ar: "E = Li", fr: "E = Li" },
          { ar: "E = ½Cu²", fr: "E = ½Cu²" },
          { ar: "E = Li²", fr: "E = Li²" },
        ],
      },
    ],
  },
  {
    slug: "ondes",
    titleAr: "الظواهر الموجية",
    titleFr: "Phénomènes ondulatoires",
    lessonAr: `## الظواهر الموجية
- **موجة ميكانيكية**: انتشار اضطراب في وسط مادي دون نقل المادة: v = d/Δt.
- **الموجة المتوالية**: v = λ/T = λ·f.
- **تأخر أو تأکد**: موجتان متموجتان تداخل بنّاء إذا كان فرق المسير δ = kλ، وتداخل هدام إذا كان δ = (k + ½)λ.
- **الحيود**: زاوية الحيود θ ≈ λ/a حيث a عرض الشق؛ الحيود يظهر بوضوح عندما يكون λ قابلة للمقارنة مع a.

### ماذا نستفيد؟
- تقدير سرعة انتشار الموجة من قياسات.
- تحليل تجارب تداخل (الشقاقان الصغرى، حيود).
- تفسير ظاهرة الطاقة (موجة صوتية/ضوئية) وظواهر الانكسار والانعكاس.`,
    lessonFr: `## Phénomènes ondulatoires
- **Onde mécanique** : propagation d'une perturbation sans transport de matière : v = d/Δt.
- **Onde progressive périodique** : v = λ/T = λ·f.
- **Interférences** : constructives si δ = kλ, destructives si δ = (k+½)λ.
- **Diffraction** : θ ≈ λ/a ; le phénomène est net quand λ est comparable à a.

### Ce qu'il faut retenir
- Mesurer la célérité d'une onde.
- Interpréter les interférences à deux sources.
- Relier diffraction et longueur d'onde.`,
    questions: [
      {
        ar: "سرعة انتشار موجة ميكانيكية:",
        fr: "La célérité d'une onde mécanique :",
        expAr: "v = d/Δt، وهي تميز انشار الشعاع في الوسط.",
        expFr: "v = d/Δt, elle caractérise la propagation dans le milieu.",
        opts: [
          { ar: "v = d/Δt", fr: "v = d/Δt", ok: true },
          { ar: "v = Δt/d", fr: "v = Δt/d" },
          { ar: "v = d·Δt", fr: "v = d·Δt" },
          { ar: "v = λ/d", fr: "v = λ/d" },
        ],
      },
      {
        ar: "العلاقة بين λ وv وf لموجة متوالية جيبية:",
        fr: "La relation entre λ, v et f pour une onde progressive sinusoïdale :",
        expAr: "v = λ·f = λ/T.",
        expFr: "v = λ·f = λ/T.",
        opts: [
          { ar: "v = λ·f", fr: "v = λ·f", ok: true },
          { ar: "v = λ/f", fr: "v = λ/f" },
          { ar: "v = f/λ", fr: "v = f/λ" },
          { ar: "v = λ/T²", fr: "v = λ/T²" },
        ],
      },
      {
        ar: "تداخل هدام بين موجتين منسجمتين يتحقق عندما يكون فرق المسير:",
        fr: "Une interférence destructive se produit quand la différence de marche :",
        expAr: "δ = (k + ½)λ (فارق فردي من نصف طول الموجة).",
        expFr: "δ = (k + ½)λ (différence impaire de demi-longueur d'onde).",
        opts: [
          { ar: "δ = (k + ½)λ", fr: "δ = (k + ½)λ", ok: true },
          { ar: "δ = kλ", fr: "δ = kλ" },
          { ar: "δ = 0", fr: "δ = 0" },
          { ar: "δ = 2λ", fr: "δ = 2λ" },
        ],
      },
      {
        ar: "زاوية الحيود عند شق عرضه a:",
        fr: "L'angle de diffraction par une fente de largeur a :",
        expAr: "θ ≈ λ/a (بالمقارنة λ/a صغيرة).",
        expFr: "θ ≈ λ/a (approximation des petits angles).",
        opts: [
          { ar: "θ ≈ λ/a", fr: "θ ≈ λ/a", ok: true },
          { ar: "θ ≈ a/λ", fr: "θ ≈ a/λ" },
          { ar: "θ ≈ λ·a", fr: "θ ≈ λ·a" },
          { ar: "θ ≈ 2π·a", fr: "θ ≈ 2π·a" },
        ],
      },
    ],
  },
  {
    slug: "chimie-acide-base",
    titleAr: "تفاعلات الأحماض والقواعد",
    titleFr: "Réactions acide-base",
    lessonAr: `## تفاعلات الأحماض والقواعد
- **ثنائيات (acid/base)**: حمض AH وقاعدته A⁻: التفاعل يتحول بينها. تحقق قاعدة الزوجة.
- **pH**: pH = −log[H₃O⁺], والماء الذي فيه pH = 7 محايد عند 25°C.
- **تقدم التفاعل**: x، يتأثر من الجدول الوصفي (بيان التقدم النهائي والحد الأقصى).
- **التحليل (Ka)**: Ka = [H₃O⁺][A⁻]/[AH]، و pKa = −log Ka؛ في منتصف التعادل يكون pH = pKa.
- **المعايرة**: عند نقطة التكافؤ تكون كمية مادة الحمض المعايرة تساوي كمية مادة القاعدة المعايرة.

### ماذا نستفيد؟
- كتابة معادلات التفاعل بين الحمض والقاعدة (زوجات متلازمة).
- الجداول الوصفية وحساب التقدم.
- تحديد الطاقات والمراقبة (المعايرة البصرية أو pH-meter).`,
    lessonFr: `## Réactions acide-base
- **Couple AH/A⁻** : le transfert de protons se fait entre couples acide/base.
- **pH** : pH = −log[H₃O⁺] ; eau neutre à 25°C : pH = 7.
- **Avancement** : x, via le tableau d'avancement (x_max, x_f).
- **Constante d'acidité** : Ka = [H₃O⁺][A⁻]/[AH], pKa = −log Ka ; à la demi-équivalence pH = pKa.
- **Dosage** : à l'équivalence, n(H⁺) dosé = n(OH⁻) versée.

### Ce qu'il faut retenir
- Écrire les réactions acide-base et identifier les couples.
- Construire les tableaux d'avancement.
- Réaliser des dosages par pH-métrie ou indicateurs colorés.`,
    questions: [
      {
        ar: "عند منتصف التعادل أثناء معايرة حمض بقاعدة:",
        fr: "À la demi-équivalence d'un dosage acide-base :",
        expAr: "pH = pKa للزوجة المعنية.",
        expFr: "pH = pKa du couple concerné.",
        opts: [
          { ar: "pH = pKa", fr: "pH = pKa", ok: true },
          { ar: "pH = 7", fr: "pH = 7" },
          { ar: "pH = 14", fr: "pH = 14" },
          { ar: "pH = pKa + 1", fr: "pH = pKa + 1" },
        ],
      },
      {
        ar: "تعريف pH لمحلول:",
        fr: "La définition du pH d'une solution :",
        expAr: "pH = −log[H₃O⁺].",
        expFr: "pH = −log[H₃O⁺].",
        opts: [
          { ar: "pH = −log[H₃O⁺]", fr: "pH = −log[H₃O⁺]", ok: true },
          { ar: "pH = 14 − log[OH⁻]", fr: "pH = 14 − log[OH⁻]" },
          { ar: "pH = log[H₃O⁺]", fr: "pH = log[H₃O⁺]" },
          { ar: "pH = [H₃O⁺]", fr: "pH = [H₃O⁺]" },
        ],
      },
      {
        ar: "ثابتة الحموضة Ka تتعلق بـ:",
        fr: "La constante d'acidité Ka est définie par :",
        expAr: "Ka = [H₃O⁺][A⁻]/[AH].",
        expFr: "Ka = [H₃O⁺][A⁻]/[AH].",
        opts: [
          { ar: "Ka = [H₃O⁺][A⁻]/[AH]", fr: "Ka = [H₃O⁺][A⁻]/[AH]", ok: true },
          { ar: "Ka = [AH]/([H₃O⁺][A⁻])", fr: "Ka = [AH]/([H₃O⁺][A⁻])" },
          { ar: "Ka = [H₃O⁺] + [A⁻]", fr: "Ka = [H₃O⁺] + [A⁻]" },
          { ar: "Ka = pH", fr: "Ka = pH" },
        ],
      },
      {
        ar: "في معايرة حمض قوي بقاعدة قوية تكون نقطة التكافؤ عند:",
        fr: "Pour un dosage acide fort / base forte, l'équivalence a lieu à :",
        expAr: "pH = 7 تقريباً (محلول محايد).",
        expFr: "pH ≈ 7 (solution neutre).",
        opts: [
          { ar: "pH ≈ 7", fr: "pH ≈ 7", ok: true },
          { ar: "pH = pKa دائماً", fr: "pH = pKa toujours" },
          { ar: "pH ≈ 1", fr: "pH ≈ 1" },
          { ar: "pH ≈ 13", fr: "pH ≈ 13" },
        ],
      },
    ],
  },
  {
    slug: "radioactivite",
    titleAr: "النواة والتحولات النووية",
    titleFr: "Noyau et transformations nucléaires",
    lessonAr: `## النواة والتحولات النووية
- **النواة**: Z عدد الشحنات (بروتونات)، N = A − Z نيوترونات، A العدد الكتلي.
- **التناقص الإشعاعي**: قانون التناقص N(t) = N₀·e^(−λt)، نصف العمر t½ = ln2/λ.
- **النشاط الإشعاعي**: A(t) = λ·N(t) = A₀·e^(−λt)، وحدة البيكريل Bq.
- **طاقة الربط**: Δm = (Z·m_p + N·m_n) − m_noyau، الطاقة E = Δm·c² (أينشتاين) بالـ MeV.

### ماذا نستفيد؟
- الكتابة المتوازنة لتفاعلات التفكك (α, β⁻, β⁺, γ).
- حساب t½ وتحديد لحظات التحولات.
- تفسير المنحنى اللوجاريتمي من ln N(t) مقابل t (خط مستقيم ميله −λ).`,
    lessonFr: `## Noyau et transformations nucléaires
- **Noyau** : Z protons, N = A − Z neutrons, A nombre de masse.
- **Décroissance radioactive** : N(t) = N₀·e^(−λt), demi-vie t½ = ln2/λ.
- **Activité** : A(t) = λ·N(t) = A₀·e^(−λt), en becquerels (Bq).
- **Énergie de liaison** : Δm = (Z·m_p + N·m_n) − m_noyau, E = Δm·c² (Einstein).

### Ce qu'il faut retenir
- Équilibrer les désintégrations α, β⁻, β⁺, γ.
- Calculer t½ et interpréter les courbes de décroissance.
- Lire ln N en fonction de t : droite de pente −λ.`,
    questions: [
      {
        ar: "نصف العمر t½ مرتبط بثابتة التناقص λ بالعلاقة:",
        fr: "La demi-vie t½ est liée à λ par :",
        expAr: "t½ = ln2/λ.",
        expFr: "t½ = ln2/λ.",
        opts: [
          { ar: "t½ = ln2/λ", fr: "t½ = ln2/λ", ok: true },
          { ar: "t½ = λ/ln2", fr: "t½ = λ/ln2" },
          { ar: "t½ = λ", fr: "t½ = λ" },
          { ar: "t½ = 2λ", fr: "t½ = 2λ" },
        ],
      },
      {
        ar: "قانون التناقص الإشعاعي لعينة:",
        fr: "La loi de décroissance radioactive d'un échantillon :",
        expAr: "N(t) = N₀·e^(−λt).",
        expFr: "N(t) = N₀·e^(−λt).",
        opts: [
          { ar: "N(t) = N₀·e^(−λt)", fr: "N(t) = N₀·e^(−λt)", ok: true },
          { ar: "N(t) = N₀·λt", fr: "N(t) = N₀·λt" },
          { ar: "N(t) = N₀/λt", fr: "N(t) = N₀/λt" },
          { ar: "N(t) = N₀·t", fr: "N(t) = N₀·t" },
        ],
      },
      {
        ar: "وحدة النشاط الإشعاعي في النظام الدولي:",
        fr: "L'unité SI de l'activité radioactive est :",
        expAr: "البيكريل (Bq).",
        expFr: "Le becquerel (Bq).",
        opts: [
          { ar: "البيكريل (Bq)", fr: "Le becquerel (Bq)", ok: true },
          { ar: "الفولت (V)", fr: "Le volt (V)" },
          { ar: "الأمبير (A)", fr: "L'ampère (A)" },
          { ar: "الجول (J)", fr: "Le joule (J)" },
        ],
      },
      {
        ar: "خلال تفكك β⁻ تتحول نواة:",
        fr: "Lors d'une désintégration β⁻ :",
        expAr: "نوترون يتحول إلى بروتون وإلكترون ونيوترينو مضاد (Z يزداد بواحدة).",
        expFr: "Un neutron se transforme en proton, un électron et un antineutrino (Z augmente de 1).",
        opts: [
          { ar: "Z يزداد بواحدة وA ثابت", fr: "Z augmente de 1, A inchangé", ok: true },
          { ar: "Z ينقص بواحدة", fr: "Z diminue de 1" },
          { ar: "A ينقص بـ4", fr: "A diminue de 4" },
          { ar: "لا شيء يتغير", fr: "Rien ne change" },
        ],
      },
    ],
  },
  {
    slug: "evolution-temporelle",
    titleAr: "التطور الزمني للتحولات الكيميائية",
    titleFr: "Évolution temporelle des transformations chimiques",
    lessonAr: `## التطور الزمني للتحولات الكيميائية
- **سرعة التفاعل**: مقدمة التحول v = (1/V)·dx/dt، تُحدد بميل المنحنى x(t).
- **التتبع الطيفي (spectrophotométrie)**: قياس التركز من الامتصاص A = ε·l·C (قانون بير-لومبير).
- **العوامل المؤثرة**: درجة الحرارة، التركز الابتدائي، عامل الحفز، سطح التفاعل.
- **زمن نصف التفاعل t½**: اللحظة التي فيها x(t½) = ½·x_max.
- **الترتيب والنظام الزمني**: حساب التراكز المتبقية والزمنية من الجدول الوصفي.

### ماذا نستفيد؟
- تحديد سرعة التفاعل من المنحنيات.
- استنتاج أثر الحفز ودرجة الحرارة.
- اكتمال التفاعل (تحديد تقدم نهائي مناسب) وتوازن التوحيد.`,
    lessonFr: `## Évolution temporelle des transformations chimiques
- **Vitesse de réaction** : v = (1/V)·dx/dt, déterminée par la pente de la courbe x(t).
- **Suivi spectrophotométrique** : loi de Beer-Lambert A = ε·l·C.
- **Facteurs cinétiques** : température, concentrations initiales, catalyseur, surface de contact.
- **Temps de demi-réaction** t½ : instant où x(t½) = ½·x_max.

### Ce qu'il faut retenir
- Déterminer la vitesse à partir des courbes.
- Mettre en évidence l'effet du catalyseur et de la température.
- Conclure sur l'avancement final (réaction totale ou limitée).`,
    questions: [
      {
        ar: "سرعة التفاعل تتراجع مع الزمن عموماً لأن:",
        fr: "La vitesse d'une réaction diminue généralement car :",
        expAr: "التركيزات المتفاعلة تتناقص فيقل عدد التصادمات الفعالة.",
        expFr: "Les concentrations des réactifs diminuent, donc moins de chocs efficaces.",
        opts: [
          { ar: "التركيزات المتفاعلة تتناقص", fr: "Les concentrations des réactifs diminuent", ok: true },
          { ar: "درجة الحرارة تتغير تلقائياً", fr: "La température change spontanément" },
          { ar: "التفاعل يزداد سرعة", fr: "La réaction accélère toujours" },
          { ar: "لا توجد أسباب", fr: "Aucune raison" },
        ],
      },
      {
        ar: "قانون بير-لومبير يربط الامتصاص A بالتركيز C:",
        fr: "La loi de Beer-Lambert relie A à C par :",
        expAr: "A = ε·l·C (تناسب خطي بين A وC).",
        expFr: "A = ε·l·C (proportionnalité entre A et C).",
        opts: [
          { ar: "A = ε·l·C", fr: "A = ε·l·C", ok: true },
          { ar: "A = ε·C/l", fr: "A = ε·C/l" },
          { ar: "A = ε/l·C", fr: "A = ε/l·C" },
          { ar: "A = C/ε·l", fr: "A = C/ε·l" },
        ],
      },
      {
        ar: "زمن نصف التفاعل هو اللحظة:",
        fr: "Le temps de demi-réaction est l'instant où :",
        expAr: "x(t½) = ½·x_max.",
        expFr: "x(t½) = ½·x_max.",
        opts: [
          { ar: "x(t½) = ½·x_max", fr: "x(t½) = ½·x_max", ok: true },
          { ar: "x(t½) = x_max", fr: "x(t½) = x_max" },
          { ar: "x(t½) = 0", fr: "x(t½) = 0" },
          { ar: "x(t½) = 2·x_max", fr: "x(t½) = 2·x_max" },
        ],
      },
      {
        ar: "رفع درجة الحرارة في تفاعل كيميائي يؤدي إلى:",
        fr: "Augmenter la température d'une réaction :",
        expAr: "تتسارع التفاعلات لأن الطاقة الحركية والتصادمات الفعالة تزداد.",
        expFr: "Accélère la réaction (énergie cinétique et chocs efficaces accrus).",
        opts: [
          { ar: "تسريع التفاعل", fr: "Accélère la réaction", ok: true },
          { ar: "إبطاء التفاعل", fr: "Ralentit la réaction" },
          { ar: "لا تغيير", fr: "Aucun effet" },
          { ar: "توقيف التفاعل", fr: "Stoppe la réaction" },
        ],
      },
    ],
  },
];

// ------------------------------------------------------------------ runner
async function upsertChapters(branchSlug: string, subjectSlug: string, defs: ChapterDef[], orderOffset = 0) {
  const subject = await prisma.subject.findFirst({
    where: { slug: subjectSlug, branch: { slug: branchSlug } },
  });
  if (!subject) { console.warn(`subject missing ${branchSlug}/${subjectSlug}`); return 0; }
  let created = 0;
  for (let i = 0; i < defs.length; i++) {
    const def = defs[i];
    const order = orderOffset + i;
    const chapter = await prisma.chapter.upsert({
      where: { subjectId_slug: { subjectId: subject.id, slug: def.slug } },
      update: { titleAr: def.titleAr, titleFr: def.titleFr, order },
      create: { slug: def.slug, titleAr: def.titleAr, titleFr: def.titleFr, order, subjectId: subject.id },
    });
    await prisma.chapter.update({
      where: { id: chapter.id },
      data: { lesson: { upsert: { create: { contentAr: def.lessonAr, contentFr: def.lessonFr }, update: { contentAr: def.lessonAr, contentFr: def.lessonFr } } } },
    });
    console.log(`  ${subjectSlug}/${def.slug}: lesson ok`);
    const existingQ = await prisma.question.count({ where: { chapterId: chapter.id } });
    if (existingQ > 0) { console.log(`    (${existingQ} questions already present)`); continue; }
    for (const q of def.questions) {
      await prisma.question.create({
        data: {
          promptAr: q.ar,
          promptFr: q.fr,
          explanationAr: q.expAr,
          explanationFr: q.expFr,
          chapterId: chapter.id,
          options: { create: q.opts.map((o, oi) => ({ textAr: o.ar, textFr: o.fr, order: oi, isCorrect: o.ok === true })) },
        },
      });
      created++;
    }
  }
  return created;
}

async function attachResources(sourceBranch: string, sourceKeys: string[], destBranch: string, destSubjectKey: string, titleMap?: { fr: { re: RegExp; to: string }; ar: { re: RegExp; to: string } }) {
  const sp = await prisma.branch.findUnique({ where: { slug: sourceBranch } });
  const dp = await prisma.branch.findUnique({ where: { slug: destBranch } });
  if (!sp || !dp) { console.warn(`branch missing for attach ${sourceBranch}->${destBranch}`); return 0; }
  const sources = await prisma.resource.findMany({
    where: { branchId: sp.id, subjectKey: { in: sourceKeys } },
  });
  let added = 0;
  for (const r of sources) {
    const dup = await prisma.resource.findFirst({ where: { url: r.url, branchId: dp.id, subjectKey: destSubjectKey } });
    if (dup) continue;
    let titleAr = r.titleAr;
    let titleFr = r.titleFr;
    if (titleMap) {
      titleFr = titleFr.replace(titleMap.fr.re, titleMap.fr.to);
      titleAr = titleAr.replace(titleMap.ar.re, titleMap.ar.to);
    }
    await prisma.resource.create({
      data: { titleAr, titleFr, kind: r.kind, url: r.url, year: r.year, session: r.session, subjectKey: destSubjectKey, branchId: dp.id },
    });
    added++;
  }
  console.log(`  attached ${added} ${destSubjectKey} resources <- ${sourceBranch}/${sourceKeys.join(",")} (${sources.length} source rows)`);
  return added;
}

async function main() {
  console.log("SM mathematiques chapters...");
  const q1 = await upsertChapters("sm", "mathematiques", mathChapters);
  console.log("SM physique-chimie chapters...");
  await prisma.chapter.updateMany({
    where: { subject: { slug: "physique-chimie", branch: { slug: "sm" } }, slug: { notIn: pcChapters.map((c) => c.slug) } },
    data: { order: 0 },
  });
  const q2 = await upsertChapters("sm", "physique-chimie", pcChapters, 1);

  console.log("Attaching shared national exams to SM...");
  await attachResources("sp", ["sp"], "sm", "pc", {
    fr: { re: /Sciences Physiques/g, to: "Physique-Chimie" },
    ar: { re: /علوم فيزيائية/g, to: "الفيزياء والكيمياء" },
  });
  await attachResources("svt", ["svt"], "sm", "svt");
  await attachResources("lettres", ["anglais"], "sm", "anglais");

  const totals = await Promise.all([prisma.chapter.count(), prisma.lesson.count(), prisma.question.count()]);
  console.log("Done:", { newQuestions: q1 + q2, chapters: totals[0], lessons: totals[1], questions: totals[2] });
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());