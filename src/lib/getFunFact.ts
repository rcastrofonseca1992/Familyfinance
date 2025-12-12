// src/lib/getFunFact.ts

export type Language = 'en' | 'pt';

export interface FunFactResult {
  fact: string;
  source: string;
  category: string;
  type: string;
}

const CACHE_KEY = 'funFacts_cache_v2';
const INDEX_KEY = 'funFacts_index_v2';

/* -------------------------------------------------------------------------- */
/*                                   PUBLIC                                    */
/* -------------------------------------------------------------------------- */

export async function getFunFact(language: Language = 'en'): Promise<FunFactResult> {
  let cache = loadCache(language);
  let index = loadIndex();

  // Cache empty or index out of bounds → regenerate
  if (!cache || cache.length === 0 || index >= cache.length) {
    cache = generateNewCache(language);
    index = 0;
    saveCache(cache, language);
    saveIndex(index);
  }

  const fact = cache[index];

  // Move forward for next request
  saveIndex(index + 1);

  return fact;
}

/* -------------------------------------------------------------------------- */
/*                                 CACHE LOGIC                                 */
/* -------------------------------------------------------------------------- */

function loadCache(language: Language): FunFactResult[] | null {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}_${language}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCache(cache: FunFactResult[], language: Language): void {
  localStorage.setItem(`${CACHE_KEY}_${language}`, JSON.stringify(cache));
}

function loadIndex(): number {
  const raw = localStorage.getItem(INDEX_KEY);
  return raw ? parseInt(raw) : 0;
}

function saveIndex(i: number): void {
  localStorage.setItem(INDEX_KEY, String(i));
}

/* -------------------------------------------------------------------------- */
/*                            CACHE GENERATION LOGIC                           */
/* -------------------------------------------------------------------------- */

function generateNewCache(language: Language): FunFactResult[] {
  const packs = FACT_PACKS[language];

  const combined: FunFactResult[] = [
    ...shuffleArray(packs.science),
    ...shuffleArray(packs.finance),
    ...shuffleArray(packs.history),
    ...shuffleArray(packs.psychology),
    ...shuffleArray(packs.random),
    ...generateSeasonal(language),
    ...maybeEasterEgg(language),
  ];

  // Cap for performance
  return shuffleArray(combined).slice(0, 40);
}

/* -------------------------------------------------------------------------- */
/*                           SEASONAL + EASTER EGGS                            */
/* -------------------------------------------------------------------------- */

function generateSeasonal(language: Language): FunFactResult[] {
  const month = new Date().getMonth() + 1;

  if (month === 12) {
    return [
      fact(
        language,
        language === 'pt'
          ? 'Sabias que dezembro tem o maior consumo energético doméstico da Europa?'
          : 'Did you know December has Europe’s highest household energy consumption?',
        'Eurostat',
        'seasonal',
        'energy'
      ),
    ];
  }

  if (month === 1) {
    return [
      fact(
        language,
        language === 'pt'
          ? 'Janeiro é o mês em que mais pessoas começam a organizar as finanças pessoais.'
          : 'January is the month when most people start organizing their personal finances.',
        'OECD',
        'seasonal',
        'finance'
      ),
    ];
  }

  return [];
}

function maybeEasterEgg(language: Language): FunFactResult[] {
  // ~15% chance of generating a rare easter-egg entry
  if (Math.random() < 0.15) {
    return [
      fact(
        language,
        language === 'pt'
          ? 'Easter-egg: o cérebro adora surpresas — aumentam a dopamina e melhoram o humor.'
          : 'Easter-egg: the human brain loves surprises — they boost dopamine and improve mood.',
        'Neuroscience Review',
        'easter-egg',
        'psychology'
      ),
    ];
  }
  return [];
}

/* -------------------------------------------------------------------------- */
/*                             FACT PACKS (EN + PT)                            */
/* -------------------------------------------------------------------------- */

function buildFactPacks() {
  return {
    en: {
      science: [
        // Existing
        fact('en', 'Honey never spoils — archaeologists found 3,000-year-old honey still edible.', 'Smithsonian', 'fun', 'science'),
        fact('en', 'Bananas are naturally radioactive due to their potassium content.', 'NIST', 'fun', 'science'),
        fact('en', 'Octopuses have three hearts and blue blood.', 'National Geographic', 'fun', 'science'),
        // New
        fact('en', 'Lightning can heat the air around it to five times the temperature of the sun’s surface.', 'Various physics sources', 'fun', 'science'),
        fact('en', 'About 60% of your body is made of water.', 'Human biology overview', 'definition', 'human-body'),
        fact('en', 'Your nose can distinguish at least one trillion different smells.', 'Neuroscience research', 'fun', 'human-body'),
        fact('en', 'There are more bacteria in your gut than stars in the Milky Way galaxy.', 'Microbiome research', 'fun', 'human-body'),
        fact('en', 'If the Earth were the size of a basketball, the atmosphere would be thinner than the skin of an apple.', 'Earth science explainer', 'fun', 'nature'),
        fact('en', 'Plants can “communicate” through chemical signals in the air and through fungal networks underground.', 'Plant biology review', 'fun', 'nature'),
        fact('en', 'A teaspoon of soil can contain more microorganisms than people on Earth.', 'Soil biology handbook', 'fun', 'nature'),
        fact('en', 'Your brain uses about 20% of your body’s energy, even when you are resting.', 'Neuroscience primer', 'definition', 'human-body'),
        fact('en', 'The human body replaces most of its skin cells roughly every month.', 'Dermatology overview', 'micro-stat', 'human-body'),
        fact('en', 'Sound travels about four times faster in water than in air.', 'Acoustics basics', 'definition', 'science'),
        fact('en', 'The Amazon rainforest produces about 20% of the world’s oxygen.', 'Environmental studies', 'micro-stat', 'nature'),
        fact('en', 'Giraffes have the same number of neck vertebrae as humans: seven.', 'Zoology handbook', 'fun', 'nature'),
        fact('en', 'DNA in your cells, if stretched out, would reach from the Earth to the Sun and back many times.', 'Genetics explainer', 'fun', 'science'),
        fact('en', 'Some metals, like gallium, can melt in your hand because their melting point is near room temperature.', 'Materials science note', 'fun', 'science'),
        fact('en', 'A day on Venus is longer than a year on Venus.', 'Astronomy basics', 'fun', 'space'),
        fact('en', 'The deepest part of the ocean is deeper than Mount Everest is tall.', 'Oceanography overview', 'fun', 'nature'),
        fact('en', 'Humans share about 60% of their genes with bananas.', 'Genetics comparison', 'fun', 'science'),
        fact('en', 'Sharks lived on Earth before trees existed.', 'Paleontology summary', 'fun', 'history-of-nature'),
      ],

      finance: [
        // Existing
        fact('en', 'Compounding makes even small, consistent investments grow dramatically over time.', 'Investing basics', 'micro-tip', 'finance'),
        fact('en', 'Families overspend 30–40% when shopping without a planned list.', 'Behavioral economics insights', 'micro-stat', 'behavioral-finance'),
        fact('en', 'Tracking expenses for 30 days improves savings success by 60%.', 'Personal finance surveys', 'micro-stat', 'finance'),
        // New
        fact('en', 'Paying yourself first — saving before spending — is one of the simplest ways to build wealth.', 'Personal finance principle', 'micro-tip', 'habit'),
        fact('en', 'Most people underestimate small recurring subscriptions, which can silently consume a big part of their budget.', 'Household finance analysis', 'micro-stat', 'behavioral-finance'),
        fact('en', 'A clear written goal (“save €200 per month”) is more effective than a vague one (“save more”).', 'Goal-setting research', 'definition', 'behavioral-finance'),
        fact('en', 'Emergency funds work best when kept in a separate, easily accessible account.', 'Financial planning practice', 'micro-tip', 'finance'),
        fact('en', 'Using cash or debit instead of credit can reduce impulse purchases.', 'Behavioral spending studies', 'micro-tip', 'behavioral-finance'),
        fact('en', 'Checking your net worth periodically can help you stay motivated and focused.', 'Personal finance coaching', 'micro-tip', 'finance'),
        fact('en', 'High-interest debt, like credit cards, grows very fast — paying it down early saves a lot in interest.', 'Debt management guide', 'definition', 'debt'),
        fact('en', 'Diversifying across different regions and sectors reduces the impact of any single crisis.', 'Portfolio theory basics', 'definition', 'investing'),
        fact('en', 'Timing the market is extremely hard; time in the market usually matters more than perfect timing.', 'Index investing philosophy', 'definition', 'investing'),
        fact('en', 'Automatic transfers to savings remove willpower from the equation — the habit runs by default.', 'Habit formation research', 'micro-tip', 'behavioral-finance'),
        fact('en', 'Lifestyle inflation — letting spending grow with every raise — is a major enemy of long-term wealth.', 'Financial independence community', 'definition', 'behavioral-finance'),
        fact('en', 'Having a simple “yes/no” rule for purchases (like a 24-hour wait) can cut emotional spending.', 'Behavioral tricks for money', 'micro-tip', 'behavioral-finance'),
        fact('en', 'A diversified global index fund can hold thousands of companies in a single investment.', 'Index fund documentation', 'definition', 'investing'),
        fact('en', 'Understanding your fixed costs is the first step to building a realistic budget.', 'Budgeting fundamentals', 'definition', 'finance'),
        fact('en', 'Insurance is not an investment — it is a tool to protect against large, unpredictable losses.', 'Risk management basics', 'definition', 'risk'),
        fact('en', 'Most long-term investors will face several market crashes in their lifetime — this is normal, not a bug.', 'Market history overview', 'definition', 'investing'),
        fact('en', 'Having a small “fun money” budget can actually make it easier to stick to your savings plan.', 'Behavioral budgeting tip', 'micro-tip', 'behavioral-finance'),
        fact('en', 'Your savings rate (percentage of income you keep) often matters more than your investment choices early on.', 'Financial independence math', 'definition', 'finance'),
        fact('en', 'Money is a tool, not a score — aligning spending with your values usually increases happiness.', 'Values-based planning', 'definition', 'behavioral-finance'),
      ],

      history: [
        // Existing
        fact('en', 'The shortest war in history lasted only 38 minutes: Britain vs Zanzibar (1896).', 'BBC History', 'fun', 'history'),
        fact('en', 'Vikings used onions to diagnose internal wounds — if it smelled, the wound was fatal.', 'History Journal', 'fun', 'history'),
        // New
        fact('en', 'The Great Wall of China is not a single wall, but a series of walls built over centuries.', 'World history overview', 'definition', 'history'),
        fact('en', 'Ancient Egyptians wrote on papyrus, an early form of paper made from a plant.', 'Ancient history notes', 'definition', 'history'),
        fact('en', 'The first known coins were used around 600 BCE in what is now Turkey.', 'History of money', 'definition', 'history-finance'),
        fact('en', 'Coffee is said to have been discovered by a goat herder who noticed his goats became energetic after eating certain berries.', 'Cultural history anecdote', 'fun', 'history'),
        fact('en', 'The city of Rome once had over a million inhabitants during the Roman Empire.', 'Roman history overview', 'micro-stat', 'history'),
        fact('en', 'Paper money was first widely used in China during the Song dynasty.', 'Economic history summary', 'definition', 'history-finance'),
        fact('en', 'In medieval Europe, spices were so valuable that they were sometimes used as currency.', 'Medieval trade history', 'fun', 'history'),
        fact('en', 'The first mechanical clocks appeared in Europe in the 13th century.', 'Technology history', 'definition', 'tech-history'),
        fact('en', 'In the 19th century, people feared that traveling by train at high speed could be harmful to health.', 'Early technology fears', 'fun', 'tech-history'),
        fact('en', 'The word “salary” comes from the Latin word for salt, which was once a valuable commodity.', 'Etymology of money', 'fun', 'history-finance'),
        fact('en', 'Some of the oldest known cave paintings are more than 30,000 years old.', 'Prehistory overview', 'micro-stat', 'history'),
        fact('en', 'The library of Alexandria was one of the most famous libraries of the ancient world.', 'Ancient culture notes', 'definition', 'history'),
        fact('en', 'Chess originated in northern India or Persia more than 1,300 years ago.', 'Game history', 'definition', 'history'),
        fact('en', 'The first known insurance contracts date back to ancient Babylon.', 'Economic history', 'definition', 'history-finance'),
        fact('en', 'Ancient Romans used concrete that in some cases has lasted longer than many modern structures.', 'Engineering history', 'fun', 'tech-history'),
        fact('en', 'The concept of zero as a number was developed independently in several cultures, including India and Mesoamerica.', 'Mathematics history', 'definition', 'history'),
        fact('en', 'The first programmable computers appeared in the mid-20th century, filling entire rooms.', 'Computer history', 'definition', 'tech-history'),
        fact('en', 'Many medieval maps placed Jerusalem at the center of the world.', 'Cartography history', 'fun', 'history'),
        fact('en', 'Written contracts and accounting records existed thousands of years before modern banks.', 'Economic records', 'definition', 'history-finance'),
      ],

      psychology: [
        // Existing
        fact('en', 'Surprising information is memorized up to 2x better than predictable content.', 'Cognitive science review', 'definition', 'psychology'),
        fact('en', 'Average attention span is now 8 seconds — shorter than a goldfish.', 'Attention studies summary', 'statistic', 'psychology'),
        // New
        fact('en', 'The brain tends to remember unfinished tasks better than completed ones — this is called the Zeigarnik effect.', 'Cognitive psychology', 'definition', 'psychology'),
        fact('en', 'Small wins and visible progress are powerful motivators for long-term goals.', 'Motivation research', 'micro-tip', 'behavior-change'),
        fact('en', 'People are loss-averse: losing €10 often feels worse than gaining €10 feels good.', 'Behavioral economics', 'definition', 'behavioral-finance'),
        fact('en', 'Habits are easier to form when attached to an existing routine, like “after coffee, I check my budget”.', 'Habit formation research', 'micro-tip', 'behavior-change'),
        fact('en', 'Mental fatigue can make decisions worse, which is why simple rules can help under stress.', 'Decision fatigue studies', 'definition', 'psychology'),
        fact('en', 'Visualizing the process (“I’ll save €50 each week”) helps more than only visualizing the outcome (“I’ll be rich”).', 'Goal-setting experiments', 'micro-tip', 'psychology'),
        fact('en', 'Gratitude practices can reduce stress and increase subjective well-being.', 'Positive psychology research', 'definition', 'psychology'),
        fact('en', 'People often anchor to the first number they see (like the original price), even if it is arbitrary.', 'Anchoring bias', 'definition', 'behavioral-finance'),
        fact('en', 'Breaking tasks into very small steps reduces procrastination.', 'Procrastination research', 'micro-tip', 'behavior-change'),
        fact('en', 'We overestimate what we can do in a day and underestimate what we can do in a year.', 'Planning fallacy', 'definition', 'psychology'),
        fact('en', 'Self-compassion (being kind to yourself after mistakes) often leads to better long-term change than harsh self-criticism.', 'Clinical psychology', 'definition', 'psychology'),
        fact('en', 'Creating “if-then” rules (If X happens, I will do Y) helps automate decisions.', 'Implementation intentions', 'micro-tip', 'behavior-change'),
        fact('en', 'Our mood can strongly influence our financial decisions — stressed people tend to take less calculated risks.', 'Affective economics', 'definition', 'behavioral-finance'),
        fact('en', 'Limiting choices can actually make decisions easier and more satisfying.', 'Choice overload research', 'definition', 'psychology'),
        fact('en', 'We tend to mirror the financial behavior of the people we spend the most time with.', 'Social influence studies', 'definition', 'behavioral-finance'),
        fact('en', 'Writing down goals by hand improves clarity and commitment.', 'Goal-setting literature', 'micro-tip', 'psychology'),
        fact('en', 'Sleep deprivation reduces willpower, making it harder to resist impulses — including financial ones.', 'Sleep research', 'definition', 'psychology'),
        fact('en', 'People are more likely to stick to habits they find easy and slightly enjoyable.', 'Behavior design', 'definition', 'behavior-change'),
        fact('en', 'Looking at progress visually (like a chart) can be more motivating than only reading numbers.', 'Motivation design', 'micro-tip', 'psychology'),
      ],

      random: [
        // Existing
        fact('en', 'A single cloud can weigh more than one million kilograms.', 'NOAA', 'fun', 'nature'),
        fact('en', 'Scotland has 421 different words for “snow”.', 'National Records of Scotland', 'fun', 'culture'),
        // New
        fact('en', 'Some cats are allergic to humans.', 'Veterinary curiosities', 'fun', 'animals'),
        fact('en', 'Sea otters hold hands when they sleep so they do not drift apart.', 'Animal behavior notes', 'fun', 'animals'),
        fact('en', 'There is a species of jellyfish that can “age backward”, potentially living indefinitely.', 'Marine biology facts', 'fun', 'nature'),
        fact('en', 'There are more stars in the universe than grains of sand on all Earth’s beaches.', 'Cosmology analogy', 'fun', 'space'),
        fact('en', 'Humans share about 98% of their DNA with chimpanzees.', 'Genetic comparison', 'fun', 'science'),
        fact('en', 'Your smartphone has more computing power than the computers that sent humans to the Moon.', 'Technology history', 'fun', 'tech'),
        fact('en', 'In Japan, there are vending machines that sell everything from umbrellas to hot meals.', 'Cultural trivia', 'fun', 'culture'),
        fact('en', 'Some frogs can freeze solid in winter and thaw in spring, returning to life.', 'Animal survival facts', 'fun', 'nature'),
        fact('en', 'The longest recorded echo in a man-made structure lasts 75 seconds.', 'Acoustic curiosities', 'fun', 'science'),
        fact('en', 'Avocados are berries, but strawberries are not.', 'Botanical classification', 'fun', 'science'),
        fact('en', 'There is a town in Norway where the sun does not rise for about two months in winter.', 'Geography trivia', 'fun', 'nature'),
        fact('en', 'Wombat poop is cube-shaped.', 'Zoology oddities', 'fun', 'animals'),
        fact('en', 'Octopuses can taste with their arms.', 'Cephalopod facts', 'fun', 'nature'),
        fact('en', 'On Saturn’s moon Titan, it rains liquid methane instead of water.', 'Planetary science', 'fun', 'space'),
        fact('en', 'Some people can hear the difference between hot and cold water being poured.', 'Psychoacoustics', 'fun', 'psychology'),
        fact('en', 'There is a species of ant that farms fungus for food.', 'Insect behavior', 'fun', 'nature'),
        fact('en', 'A group of flamingos is called a “flamboyance”.', 'Animal group names', 'fun', 'animals'),
        fact('en', 'Blue whales are the largest animals ever known to have lived on Earth.', 'Marine biology', 'fun', 'nature'),
        fact('en', 'NASA has recorded sounds from space by converting radio waves into audio.', 'Space exploration trivia', 'fun', 'space'),
      ],
    },

    pt: {
      science: [
        // Existing
        fact('pt', 'O mel nunca se estraga — já encontraram mel com 3.000 anos ainda comestível.', 'Smithsonian', 'curiosidade', 'science'),
        fact('pt', 'As bananas são ligeiramente radioativas devido ao potássio.', 'NIST', 'curiosidade', 'science'),
        fact('pt', 'Os polvos têm três corações e sangue azul.', 'National Geographic', 'curiosidade', 'science'),
        // New
        fact('pt', 'Um relâmpago pode aquecer o ar a temperaturas cinco vezes superiores às da superfície do sol.', 'Fontes de física geral', 'curiosidade', 'science'),
        fact('pt', 'Cerca de 60% do teu corpo é composto por água.', 'Introdução à biologia humana', 'definição', 'human-body'),
        fact('pt', 'O teu nariz consegue distinguir, pelo menos, um trilhão de cheiros diferentes.', 'Investigação em neurociência', 'curiosidade', 'human-body'),
        fact('pt', 'Há mais bactérias no teu intestino do que estrelas na Via Láctea.', 'Pesquisas sobre microbioma', 'curiosidade', 'human-body'),
        fact('pt', 'Se a Terra tivesse o tamanho de uma bola de basquete, a atmosfera seria mais fina do que a casca de uma maçã.', 'Ciências da Terra', 'curiosidade', 'nature'),
        fact('pt', 'As plantas podem “comunicar-se” através de sinais químicos no ar e por redes de fungos no solo.', 'Revisões de biologia vegetal', 'curiosidade', 'nature'),
        fact('pt', 'Uma colher de chá de solo pode conter mais microrganismos do que pessoas na Terra.', 'Biologia do solo', 'curiosidade', 'nature'),
        fact('pt', 'O cérebro utiliza cerca de 20% da energia do corpo, mesmo em repouso.', 'Introdução à neurociência', 'definição', 'human-body'),
        fact('pt', 'O corpo humano renova grande parte das células da pele aproximadamente todos os meses.', 'Resumo de dermatologia', 'estatística', 'human-body'),
        fact('pt', 'O som viaja cerca de quatro vezes mais rápido na água do que no ar.', 'Fundamentos de acústica', 'definição', 'science'),
        fact('pt', 'A floresta amazónica produz cerca de 20% do oxigénio do mundo.', 'Estudos ambientais', 'estatística', 'nature'),
        fact('pt', 'As girafas têm o mesmo número de vértebras no pescoço que os humanos: sete.', 'Manual de zoologia', 'curiosidade', 'nature'),
        fact('pt', 'Se estendesses o ADN de todas as tuas células, ele iria da Terra ao Sol e voltaria várias vezes.', 'Divulgação em genética', 'curiosidade', 'science'),
        fact('pt', 'Alguns metais, como o gálio, podem derreter na tua mão porque o ponto de fusão é próximo da temperatura ambiente.', 'Notas de ciência dos materiais', 'curiosidade', 'science'),
        fact('pt', 'Um dia em Vénus é mais longo do que um ano em Vénus.', 'Noções básicas de astronomia', 'curiosidade', 'space'),
        fact('pt', 'A parte mais profunda do oceano é mais funda do que a altura do Monte Evereste.', 'Oceanografia introdutória', 'curiosidade', 'nature'),
        fact('pt', 'Os humanos partilham cerca de 60% dos genes com as bananas.', 'Comparações genéticas', 'curiosidade', 'science'),
        fact('pt', 'Os tubarões existiam na Terra antes de surgirem as árvores.', 'Resumo de paleontologia', 'curiosidade', 'history-of-nature'),
      ],

      finance: [
        // Existing
        fact('pt', 'Os juros compostos fazem pequenas poupanças crescerem muito ao longo do tempo.', 'Princípios de investimento', 'dica', 'finance'),
        fact('pt', 'Famílias gastam 30–40% mais quando fazem compras sem uma lista.', 'Estudos em economia comportamental', 'estatística', 'behavioral-finance'),
        fact('pt', 'Controlar despesas durante 30 dias aumenta a taxa de poupança em 60%.', 'Inquéritos de finanças pessoais', 'estatística', 'finance'),
        // New
        fact('pt', 'Pagar-te a ti primeiro — poupar antes de gastar — é uma das formas mais simples de construir património.', 'Princípios de finanças pessoais', 'dica', 'habit'),
        fact('pt', 'Pequenas subscrições mensais podem consumir silenciosamente uma grande parte do orçamento.', 'Análises de finanças domésticas', 'estatística', 'behavioral-finance'),
        fact('pt', 'Um objetivo escrito e específico (“poupar 200€ por mês”) é mais eficaz do que um vago (“poupar mais”).', 'Investigação sobre definição de objetivos', 'definição', 'behavioral-finance'),
        fact('pt', 'O fundo de emergência funciona melhor numa conta separada e de acesso fácil.', 'Boas práticas de planeamento financeiro', 'dica', 'finance'),
        fact('pt', 'Pagar com dinheiro ou débito, em vez de crédito, tende a reduzir compras por impulso.', 'Estudos sobre comportamento de consumo', 'dica', 'behavioral-finance'),
        fact('pt', 'Acompanhar periodicamente o teu património líquido ajuda a manter foco e motivação.', 'Coaching financeiro', 'dica', 'finance'),
        fact('pt', 'Dívidas com juros elevados, como cartões de crédito, crescem muito rápido — pagar cedo poupa imenso em juros.', 'Guias de gestão de dívida', 'definição', 'debt'),
        fact('pt', 'Diversificar por regiões e setores reduz o impacto de uma crise específica.', 'Fundamentos da teoria de portefólio', 'definição', 'investing'),
        fact('pt', 'Tentar acertar o “timing” do mercado é muito difícil; o tempo investido no mercado costuma ser mais importante.', 'Filosofia de investimento em índices', 'definição', 'investing'),
        fact('pt', 'Transferências automáticas para a poupança tiram a força de vontade da equação — o hábito corre sozinho.', 'Investigação sobre hábitos', 'dica', 'behavioral-finance'),
        fact('pt', 'A inflação do estilo de vida — deixar que as despesas cresçam com cada aumento de salário — é inimiga do património.', 'Comunidade de independência financeira', 'definição', 'behavioral-finance'),
        fact('pt', 'Ter uma regra simples, como esperar 24 horas antes de compras grandes, pode reduzir gastos emocionais.', 'Truques comportamentais', 'dica', 'behavioral-finance'),
        fact('pt', 'Um único fundo de índice global pode conter milhares de empresas numa só posição.', 'Documentação de fundos de índice', 'definição', 'investing'),
        fact('pt', 'Conhecer bem os custos fixos é o primeiro passo para um orçamento realista.', 'Fundamentos de orçamentação', 'definição', 'finance'),
        fact('pt', 'O seguro não é um investimento — é uma ferramenta para proteger contra perdas grandes e imprevisíveis.', 'Noções de gestão de risco', 'definição', 'risk'),
        fact('pt', 'Investidores de longo prazo passarão, provavelmente, por várias quedas de mercado ao longo da vida — isto é normal.', 'Histórico do mercado', 'definição', 'investing'),
        fact('pt', 'Ter um pequeno orçamento de “dinheiro para diversão” pode facilitar a disciplina na poupança.', 'Dicas de orçamento comportamental', 'dica', 'behavioral-finance'),
        fact('pt', 'A tua taxa de poupança (percentagem do rendimento que guardas) muitas vezes importa mais do que o produto de investimento escolhido, sobretudo no início.', 'Matemática da independência financeira', 'definição', 'finance'),
        fact('pt', 'O dinheiro é uma ferramenta, não um placar — alinhar gastos com os teus valores tende a aumentar a satisfação.', 'Planeamento baseado em valores', 'definição', 'behavioral-finance'),
      ],

      history: [
        // Existing
        fact('pt', 'A guerra mais curta da história durou apenas 38 minutos: Reino Unido vs Zanzibar (1896).', 'BBC History', 'curiosidade', 'history'),
        fact('pt', 'Os vikings usavam cebolas para diagnosticar feridas internas — se cheirasse, era fatal.', 'History Journal', 'curiosidade', 'history'),
        // New
        fact('pt', 'A Grande Muralha da China é, na verdade, um conjunto de muralhas construídas ao longo de séculos.', 'História mundial', 'definição', 'history'),
        fact('pt', 'Os antigos egípcios escreviam em papiro, um antecessor do papel feito a partir de uma planta.', 'Notas de história antiga', 'definição', 'history'),
        fact('pt', 'As primeiras moedas conhecidas surgiram por volta de 600 a.C., na região onde hoje é a Turquia.', 'História do dinheiro', 'definição', 'history-finance'),
        fact('pt', 'Diz-se que o café foi descoberto por um pastor que notou as cabras mais energéticas depois de comerem certos frutos.', 'Anedota de história cultural', 'curiosidade', 'history'),
        fact('pt', 'A cidade de Roma chegou a ter mais de um milhão de habitantes durante o Império Romano.', 'História de Roma', 'estatística', 'history'),
        fact('pt', 'O uso generalizado de papel-moeda começou na China, durante a dinastia Song.', 'História económica', 'definição', 'history-finance'),
        fact('pt', 'Na Europa medieval, especiarias eram tão valiosas que, às vezes, funcionavam como moeda.', 'História do comércio medieval', 'curiosidade', 'history'),
        fact('pt', 'Os primeiros relógios mecânicos surgiram na Europa no século XIII.', 'História da tecnologia', 'definição', 'tech-history'),
        fact('pt', 'No século XIX, havia quem temesse que viajar de comboio a alta velocidade fosse prejudicial à saúde.', 'Medos tecnológicos antigos', 'curiosidade', 'tech-history'),
        fact('pt', 'A palavra “salário” vem do latim “sal”, porque o sal já foi um bem muito valioso.', 'Etimologia do dinheiro', 'curiosidade', 'history-finance'),
        fact('pt', 'Algumas das pinturas rupestres mais antigas têm mais de 30.000 anos.', 'Pré-história', 'estatística', 'history'),
        fact('pt', 'A biblioteca de Alexandria foi uma das mais famosas do mundo antigo.', 'História da cultura', 'definição', 'history'),
        fact('pt', 'O xadrez terá surgido no norte da Índia ou na Pérsia há mais de 1.300 anos.', 'História dos jogos', 'definição', 'history'),
        fact('pt', 'Alguns dos primeiros contratos de seguro remontam à antiga Babilónia.', 'História económica', 'definição', 'history-finance'),
        fact('pt', 'Os romanos usavam um tipo de betão que, em alguns casos, resistiu mais tempo do que muitas estruturas modernas.', 'História da engenharia', 'curiosidade', 'tech-history'),
        fact('pt', 'O conceito de zero como número foi desenvolvido de forma independente em várias culturas, incluindo a Índia e Mesoamérica.', 'História da matemática', 'definição', 'history'),
        fact('pt', 'Os primeiros computadores programáveis surgiram em meados do século XX e ocupavam salas inteiras.', 'História da computação', 'definição', 'tech-history'),
        fact('pt', 'Muitos mapas medievais colocavam Jerusalém no centro do mundo.', 'História da cartografia', 'curiosidade', 'history'),
        fact('pt', 'Contratos escritos e registos contabilísticos existiam milhares de anos antes dos bancos modernos.', 'Registos económicos antigos', 'definição', 'history-finance'),
      ],

      psychology: [
        // Existing
        fact('pt', 'O cérebro memoriza melhor informação surpreendente ou contraintuitiva.', 'Revisão em ciência cognitiva', 'definição', 'psychology'),
        fact('pt', 'A capacidade média de atenção humana é agora de 8 segundos — menor que a de um peixe-dourado.', 'Estudos sobre atenção', 'estatística', 'psychology'),
        // New
        fact('pt', 'Tendemos a lembrar melhor tarefas inacabadas do que concluídas — isto chama-se efeito Zeigarnik.', 'Psicologia cognitiva', 'definição', 'psychology'),
        fact('pt', 'Pequenas vitórias e progresso visível são grandes motivadores para objetivos de longo prazo.', 'Investigação sobre motivação', 'dica', 'behavior-change'),
        fact('pt', 'As pessoas são avessas à perda: perder 10€ dói mais do que ganhar 10€ sabe bem.', 'Economia comportamental', 'definição', 'behavioral-finance'),
        fact('pt', 'Hábitos formam-se mais facilmente quando ligados a rotinas existentes, como “depois do café, vejo o orçamento”.', 'Estudos sobre hábitos', 'dica', 'behavior-change'),
        fact('pt', 'O cansaço mental pode piorar as decisões, por isso regras simples ajudam em momentos de stress.', 'Estudos sobre fadiga de decisão', 'definição', 'psychology'),
        fact('pt', 'Visualizar o processo (“vou poupar 50€ por semana”) ajuda mais do que visualizar apenas o resultado final.', 'Experiências de definição de metas', 'dica', 'psychology'),
        fact('pt', 'Práticas de gratidão podem reduzir o stress e aumentar o bem-estar subjetivo.', 'Psicologia positiva', 'definição', 'psychology'),
        fact('pt', 'Tendemos a ancorar-nos no primeiro número que vemos (como o preço original), mesmo que seja arbitrário.', 'Vieses cognitivos', 'definição', 'behavioral-finance'),
        fact('pt', 'Dividir tarefas em passos pequenos reduz a procrastinação.', 'Investigação sobre procrastinação', 'dica', 'behavior-change'),
        fact('pt', 'Sobrestimamos o que conseguimos fazer num dia e subestimamos o que conseguimos fazer num ano.', 'Falácia do planeamento', 'definição', 'psychology'),
        fact('pt', 'Ser compassivo contigo próprio depois de erros tende a ajudar mais a mudança do que a autocrítica dura.', 'Psicologia clínica', 'definição', 'psychology'),
        fact('pt', 'Criar regras “se-então” (Se X acontecer, faço Y) ajuda a automatizar decisões.', 'Intenções de implementação', 'dica', 'behavior-change'),
        fact('pt', 'O nosso estado emocional influencia muito as decisões financeiras — pessoas stressadas arriscam de forma menos calculada.', 'Economia afetiva', 'definição', 'behavioral-finance'),
        fact('pt', 'Reduzir o número de opções pode tornar decisões mais fáceis e satisfatórias.', 'Investigação sobre excesso de escolha', 'definição', 'psychology'),
        fact('pt', 'Tendemos a imitar o comportamento financeiro das pessoas com quem passamos mais tempo.', 'Estudos de influência social', 'definição', 'behavioral-finance'),
        fact('pt', 'Escrever objetivos à mão melhora a clareza e o compromisso.', 'Literatura sobre definição de objetivos', 'dica', 'psychology'),
        fact('pt', 'A falta de sono reduz a força de vontade, tornando mais difícil resistir a impulsos (incluindo financeiros).', 'Investigação sobre sono', 'definição', 'psychology'),
        fact('pt', 'As pessoas mantêm melhor hábitos que consideram fáceis e ligeiramente agradáveis.', 'Desenho de comportamento', 'definição', 'behavior-change'),
        fact('pt', 'Ver o progresso de forma visual (como um gráfico) pode ser mais motivador do que apenas ler números.', 'Design motivacional', 'dica', 'psychology'),
      ],

      random: [
        // Existing
        fact('pt', 'Uma única nuvem pode pesar mais de um milhão de quilos.', 'NOAA', 'curiosidade', 'nature'),
        fact('pt', 'A Escócia tem 421 palavras diferentes para “neve”.', 'National Records of Scotland', 'curiosidade', 'culture'),
        // New
        fact('pt', 'Alguns gatos são alérgicos a humanos.', 'Curiosidades veterinárias', 'curiosidade', 'animals'),
        fact('pt', 'Lontras-marinhas dão as mãos enquanto dormem para não se separarem com a corrente.', 'Comportamento animal', 'curiosidade', 'animals'),
        fact('pt', 'Existe uma espécie de medusa que pode “rejuvenescer” e voltar a um estado jovem.', 'Fatos de biologia marinha', 'curiosidade', 'nature'),
        fact('pt', 'Há mais estrelas no universo do que grãos de areia em todas as praias da Terra.', 'Analogia da cosmologia', 'curiosidade', 'space'),
        fact('pt', 'Partilhamos cerca de 98% do ADN com os chimpanzés.', 'Comparações genéticas', 'curiosidade', 'science'),
        fact('pt', 'O teu smartphone tem mais poder de computação do que os computadores que levaram o homem à Lua.', 'História da tecnologia', 'curiosidade', 'tech'),
        fact('pt', 'No Japão, existem máquinas de venda automática que vendem desde guarda-chuvas até refeições quentes.', 'Trívia cultural', 'curiosidade', 'culture'),
        fact('pt', 'Alguns sapos podem congelar completamente no inverno e descongelar na primavera, voltando à vida.', 'Estratégias de sobrevivência animal', 'curiosidade', 'nature'),
        fact('pt', 'O eco mais longo registado numa estrutura construída pelo homem dura 75 segundos.', 'Curiosidades acústicas', 'curiosidade', 'science'),
        fact('pt', 'Do ponto de vista botânico, o abacate é uma baga, mas o morango não.', 'Classificação botânica', 'curiosidade', 'science'),
        fact('pt', 'Há uma cidade na Noruega onde o sol não nasce durante cerca de dois meses no inverno.', 'Trívia geográfica', 'curiosidade', 'nature'),
        fact('pt', 'O cocó do wombat tem forma de cubo.', 'Curiosidades de zoologia', 'curiosidade', 'animals'),
        fact('pt', 'Os polvos conseguem “saborear” com os braços.', 'Fatos sobre cefalópodes', 'curiosidade', 'nature'),
        fact('pt', 'Na lua Titã, de Saturno, chove metano líquido em vez de água.', 'Ciência planetária', 'curiosidade', 'space'),
        fact('pt', 'Algumas pessoas conseguem ouvir a diferença entre água quente e fria a ser vertida.', 'Psicoacústica', 'curiosidade', 'psychology'),
        fact('pt', 'Existe uma espécie de formiga que cultiva fungos para se alimentar.', 'Comportamento de insetos', 'curiosidade', 'nature'),
        fact('pt', 'Um grupo de flamingos chama-se “flamboyance”, em inglês.', 'Nomes coletivos de animais', 'curiosidade', 'animals'),
        fact('pt', 'As baleias-azuis são os maiores animais que alguma vez existiram no planeta.', 'Biologia marinha', 'curiosidade', 'nature'),
        fact('pt', 'A NASA já registou “sons” do espaço convertendo ondas de rádio em áudio.', 'Trívia de exploração espacial', 'curiosidade', 'space'),
      ],
    },
  };
}


const FACT_PACKS = buildFactPacks();

/* -------------------------------------------------------------------------- */
/*                                FACT BUILDER                                 */
/* -------------------------------------------------------------------------- */

function fact(
  language: Language,
  text: string,
  source: string,
  type: string,
  category: string
): FunFactResult {
  return { fact: text, source, type, category };
}

/* -------------------------------------------------------------------------- */
/*                                SHUFFLE UTILITY                              */
/* -------------------------------------------------------------------------- */

function shuffleArray<T>(array: T[]): T[] {
  return array
    .map((x) => ({ x, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map((a) => a.x);
}
