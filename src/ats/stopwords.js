// ──────────────────────────────────────────────────────────────────────────
// ATS stopwords / filler per language. EXTEND ME freely for your market.
// Tokens are matched after normalization (lowercased, accents stripped), so
// list the accent-free form (e.g. "experiences" not "expériences").
// ──────────────────────────────────────────────────────────────────────────

export const STOPWORDS = {
  en: new Set([
    "the","a","an","and","or","but","if","then","than","that","this","these","those","it","its",
    "of","to","in","on","at","by","for","with","from","as","into","over","under","about","across",
    "after","before","during","through","between","within","without","per","via","up","out","off","down",
    "is","are","was","were","be","been","being","have","has","had","do","does","did","will","would",
    "can","could","should","shall","may","might","must","not","no","yes","so","such","own","same","other",
    "we","our","us","you","your","they","their","them","he","she","him","her","i","me","my","mine","ours",
    "any","all","more","most","some","each","every","both","few","many","much","very","too","just","also",
    "only","new","need","needs","work","works","working","experience","experiences","year","years","role","roles",
    "team","teams","company","companies","skill","skills","ability","abilities","strong","proven","excellent",
    "good","great","well","best","better","using","use","used","include","includes","including","ensure","ensures",
    "provide","provides","make","makes","making","take","takes","help","helps","like","way","ways","one","two",
    "three","front","back","day","days","time","times","high","low","able","key","core","etc","plus","across",
    "responsible","responsibilities","requirement","requirements","preferred","required","must","nice","looking",
  ]),
  fr: new Set([
    "le","la","les","un","une","des","de","du","et","ou","mais","si","que","qui","quoi","ce","cet","cette","ces",
    "dans","sur","sous","par","pour","avec","sans","entre","vers","chez","aux","au","en","a","du","des","ne","pas",
    "est","sont","etait","etaient","etre","ete","avoir","avons","avez","ont","fait","faire","fais","sera","seront",
    "nous","vous","ils","elles","je","tu","il","elle","leur","leurs","notre","nos","votre","vos","son","sa","ses",
    "plus","moins","tres","trop","aussi","meme","autre","autres","tout","tous","toute","toutes","chaque","quelques",
    "nouveau","nouvelle","besoin","travail","travailler","experience","experiences","annee","annees","an","ans",
    "role","equipe","equipes","entreprise","competence","competences","capacite","fort","forte","excellent","bon",
    "bonne","bien","meilleur","utiliser","utilise","inclure","assurer","fournir","faire","aider","comme","facon",
    "jour","jours","temps","haut","bas","cle","principal","etc","responsable","responsabilites","exigences","requis",
    "profil","poste","mission","missions","candidat","candidate","recherche","propos","offre","emploi","afin",
  ]),
  es: new Set([
    "el","la","los","las","un","una","unos","unas","de","del","y","o","pero","si","que","quien","este","esta","estos",
    "en","sobre","bajo","por","para","con","sin","entre","hacia","desde","al","a","no","ni","es","son","era","eran",
    "ser","sido","haber","han","hace","hacer","sera","seran","nosotros","ustedes","ellos","ellas","yo","tu","el","ella",
    "su","sus","nuestro","nuestra","mas","menos","muy","tambien","mismo","otro","otros","todo","todos","cada","algunos",
    "nuevo","nueva","necesita","trabajo","trabajar","experiencia","experiencias","ano","anos","rol","equipo","empresa",
    "habilidad","habilidades","capacidad","fuerte","excelente","bueno","bien","mejor","usar","incluir","asegurar",
    "proporcionar","hacer","ayudar","como","manera","dia","dias","tiempo","alto","bajo","clave","etc","responsable",
    "responsabilidades","requisitos","requerido","perfil","puesto","mision","candidato","busca","acerca","oferta","empleo",
  ]),
  de: new Set([
    "der","die","das","ein","eine","einen","und","oder","aber","wenn","dann","als","dass","dies","diese","es",
    "von","zu","in","auf","an","bei","fur","mit","aus","nach","uber","unter","zwischen","ohne","pro","im","am",
    "ist","sind","war","waren","sein","gewesen","haben","hat","hatte","tun","wird","werden","kann","konnte","soll",
    "wir","sie","ihr","ich","du","er","unser","euer","ihre","sein","mehr","weniger","sehr","auch","gleich","andere",
    "alle","jede","jeder","einige","neu","brauchen","arbeit","arbeiten","erfahrung","jahr","jahre","rolle","team",
    "unternehmen","fahigkeit","fahigkeiten","stark","ausgezeichnet","gut","besser","nutzen","einschliesslich",
    "sicherstellen","bereitstellen","machen","helfen","wie","weise","tag","tage","zeit","hoch","niedrig","etc",
    "verantwortlich","anforderungen","erforderlich","profil","stelle","mission","kandidat","sucht","uber","stellenangebot",
  ]),
  ar: new Set([
    "في","من","إلى","الى","على","عن","مع","هذا","هذه","التي","الذي","الذين","أن","ان","إن","كان","كانت","يكون",
    "هو","هي","نحن","انت","أنت","هم","لنا","لكم","لهم","قد","ما","لا","نعم","أو","او","و","ثم","عند","عندما",
    "كل","بعض","أكثر","اكثر","جدا","أيضا","ايضا","نفس","آخر","اخر","جميع","حاجة","عمل","خبرة","سنة","سنوات","دور",
    "فريق","شركة","مهارة","مهارات","قدرة","قوي","ممتاز","جيد","أفضل","افضل","استخدام","تضمين","ضمان","توفير","مساعدة",
    "مثل","يوم","أيام","وقت","عالي","منخفض","رئيسي","مسؤول","متطلبات","مطلوب","حول","عرض","وظيفة","المرشح",
  ]),
};

export const STOPWORD_LANGS = Object.keys(STOPWORDS);
