import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const promptFixes: Record<string, string> = {
  cmu44461q0005aw22rl3ma9hw: "أوجد: lim(x→1) (x²-1)⁄(x-1)",
  cmu4446690019aw22haare1pj: "أوجد الوسيط الرئيسي: Arg(z) إذا كان z = -1+i",
  cmu4446bf002iaw22ukool4wt:
    "في تجربة مندل، إذا تم تزاوج TT × tt، ما هي النسبة المتوقعة للأبناء في الجيل F2؟",
  cmu4446bx002naw22aaru125t:
    "ما هو النوع الوراثي للوالد إذا كان أحد الأبناء يحمل الأليل المتنحي a؟",
  cmu4446cz002xaw224bacd8om:
    "ما هي نسب الأبناء المتوقعة من تزاوج AaBb × AaBb (ذات الارتباط المستقل)؟",
  cmu4446e50037aw229jfguass:
    "في تجمع سكاني: تقاطع أليلين لموضع جيني A و a، إذا كان تكرار a = 0.3، ما هو تكرار A؟",
  cmu4446hg0041aw22a4ra0ens:
    "الخلية العصبية: مشبك مثبط GABA يسبب فرط الاستقطاب. ما هو التأثير على العصب بعد ذلك؟",
  cmu4446lh0050aw22umv6vr2c:
    "من أوراق اللعب: أوراق لعب عادية، ما هو احتمال سحب ورقة حمراء أو ورقة رقمها فردي؟",
  cmu4446pb005zaw2295pd8p4n:
    "موجتان يتداخلان تداخلاً بناءً. ما هي العلاقة بين الطورين؟",
  cmu4446qg0069aw2225uktiy2:
    "موجة صوتية بمستوى شدة 60dB وأخرى 90dB. ما هي النسبة بين السعتين؟",
  cmu4446r0006eaw22h6twtnqo:
    "موجة واقفة على وتر طوله 1m. ما هو أقصر طول موجة ممكن؟",
  cmu4446vp007iaw22uqfrsfy8:
    "ما هو الناتج الداخلي الخام (GDP): إذا كان الإنتاج الكلي للسلع والخدمات في بلد = 500 مليار درهم والاستهلاك الوسيط = 100 مليار، ما هو GDP؟",
  cmu4446ya0087aw22aq20y3k5:
    "ما هو الدخل القومي الصافي (NNI) إذا كان GDP = 500 مليار، ومدفوعات الفوائد على الدخل = 30 مليار، وصافي الدخل من الخارج = -10 مليار؟",
  cmu44470u008waw2287v5um88:
    "ما هو الفرق: المعرفة التحليلية والمعرفة المركّبة عند كانت؟",
  cmu44472f009baw22bbvazf7v: "ما هو الشك المنهجي عند ديكارت؟",
  cmu44474u009vaw22jpstc3p9: "ما هي المقولات في التفكير النقدي عند كانت؟",
  cmu44476300a5aw22sl2lscgk:
    "ما هي أدوات الربط المستخدمة في الخطاب غير المباشر؟",
  cmu44476u00aaaw22v3ri3wrj: "ما هو النوع النصي: رواية تحليلية نفسية؟",
  cmu44477c00afaw22bi85dsby:
    "ما هو النص الحجاجي: النص الذي يدافع عن رأي ويقنع؟",
  cmu44477v00akaw22zkql0f28: "ما هي مكونات النص الإقناعي؟",
  cmu4447bg00bjaw225bk91bic:
    "ما هو الفارق بين الرسم الانطباعي والرسم الواقعي؟",
  cmu444658000zaw22xenprra6: "أوجد: z·z̄ إذا كان z = 2-i",
  cmu4446dh0032aw22jh9lgxwi:
    "ما هو احتمال إنجاب طفل ذكر يحمل الصفتين إذا كان الأبوان (Aa × Aa)؟",
  cmu4446nq005kaw2220scu2ep:
    "في الترتيبات: 8 أشخاص يجلسون في صف، كم عدد طرق ترتيبهم؟",
  cmu4446s2006oaw22b0oxloh7:
    "ما هو مجال تعريف الدالة f(x) = 1⁄(x²-4)؟",
  cmu4446ud0078aw22a1lixa4x:
    "ما هو الأفق المقارب (asymptote horizontale) للدالة f(x) = (2x+1)⁄(x-1)؟",
  cmu4446v6007daw22pliez9rk:
    "أوجد القيم القصوى (extrema) للدالة f(x) = x³-3x+2",
  cmu44471d0091aw2261om8n34: "ما هي الغائية في فلسفة أرسطو؟",
  cmu444734009gaw229b3npi8m:
    "ما هي مقولة 'Cogito ergo sum' عند ديكارت؟",
  cmu44473n009law22vqgo11xw:
    "ما هي الغدة الصنوبرية (pinéale) عند ديكارت ولماذا اعتبرها مقر الروح؟",
  cmu444748009qaw22unnugw07: "ما هي المقولات الثلاث عند كانط؟",
  cmu44475h00a0aw222ryd89d1:
    "ما هو الفرق بين الخطاب المباشر وغير المباشر في النص؟",
  cmu44478c00apaw22zqjm62r5:
    "أي من النصوص التالية يُستخدم فيه التشبيه والاستعارة؟",
  cmu4447ay00beaw22iuq8hoym:
    "ما هي السريالية (Surrealism) وما أبرز ممثليها؟",
  cmu4446yu008caw22acfl5yhp:
    "ما هو تعريف الوعي (conscience) في الفلسفة؟",
};

const optionFixes: Record<string, string> = {
  cmu4446hh0043aw22ja2se7rs: "مانعة لاجتياز العتبة",
  cmu44470w008yaw22nflylkz5: "التحليلية توضح المفهوم، المركّبة تضيف معلومات جديدة",
  cmu44470w0090aw22cjjqtb68: "التحليلية تعتمد على التجربة، المركّبة لا تعتمد عليها",
  cmu44474w009yaw22xina1hg0: "إرجاع كل شيء إلى المقولات",
  cmu44475k00a1aw22dcms5g7b: "Direct: نقل بين علامتي اقتباس. Indirect: جملة مسندة",
  cmu44477w00anaw2220vmlhm4: "قصة وحكايات فقط",
  cmu44478z00avaw22akba5rim: "تركيز على المشاعر والطبيعة والعاطفة",
  cmu44479g00b0aw220fnviw8q: "Monet، Renoir، Pissarro - التركيز على الضوء والألوان",
  cmu44470w008xaw22tfj2njhz:
    "التحليلية تُضيف معلومات، المركّبة توضح المفهوم",
  cmu44478z00awaw22rj13y5ys: "التركيز على العقل والهندسة",
  cmu44478z00axaw223sqrru12: "التركيز على الحياة اليومية",
  cmu44478z00ayaw22c9banpl0: "التركيز على التجريد الكامل",
};

async function main() {
  let qDone = 0;
  let qMiss = 0;
  for (const [id, newText] of Object.entries(promptFixes)) {
    const q = await prisma.question.findUnique({ where: { id }, select: { promptAr: true } });
    if (!q) return console.log("MISSING question", id);
    if (q.promptAr === newText) continue;
    if (!/[\u3040-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF\u0900-\u097F]/.test(q.promptAr) && q.promptAr.includes(id)) continue;
    await prisma.question.update({ where: { id }, data: { promptAr: newText } });
    qDone++;
  }
  let oDone = 0;
  let oMiss = 0;
  for (const [id, newText] of Object.entries(optionFixes)) {
    const o = await prisma.option.findUnique({ where: { id }, select: { textAr: true } });
    if (!o) return console.log("MISSING option", id);
    if (o.textAr === newText) continue;
    await prisma.option.update({ where: { id }, data: { textAr: newText } });
    oDone++;
  }
  console.log(`questions fixed: ${qDone}, options fixed: ${oDone}`);
}

main().finally(() => prisma.$disconnect());