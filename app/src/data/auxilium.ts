// The daily prayers of the Auxilium Christianorum association, transcribed
// from the official Spanish booklet (auxiliumchristianorum.org). The text is
// kept literal; only obvious typesetting glitches were smoothed out.

export type PrayerBlock =
  | { kind: 'versicle'; call: string; response: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'lines'; lines: string[] }
  | { kind: 'litany'; items: { call: string; response: string }[] }
  | { kind: 'note'; text: string };

export type PrayerStep = {
  key: string;
  title: string;
  subtitle?: string;
  blocks: PrayerBlock[];
};

const WEEKDAY_TITLES = [
  'Oración del domingo',
  'Oración del lunes',
  'Oración del martes',
  'Oración del miércoles',
  'Oración del jueves',
  'Oración del viernes',
  'Oración del sábado',
] as const;

const INVOCATION: PrayerStep = {
  key: 'invocation',
  title: 'Invocación',
  blocks: [
    {
      kind: 'versicle',
      call: 'Nuestro auxilio es en el nombre del Señor.',
      response: 'Que hizo el cielo y la tierra.',
    },
    {
      kind: 'paragraph',
      text: 'Amabilísima Virgen María, tú que aplastas la cabeza de la serpiente, protégenos de la venganza del maligno. Te ofrecemos nuestras oraciones, sufrimientos y buenas obras, para que tú las purifiques, las santifiques y las presentes a tu Hijo como una ofrenda perfecta. Que esta ofrenda sea dada para que los demonios que influencian o que buscan influir a los miembros del Auxilium Christianorum no reconozcan el origen de su expulsión y de su ceguera. Enceguécelos para que no reconozcan nuestras buenas obras. Enceguécelos para que no sepan contra quién vengarse. Enceguécelos para que reciban la sentencia justa de sus obras. Cúbrenos con la Sangre Preciosa de tu Hijo para que podamos gozar de la protección que brota de su Pasión y Muerte. Amén.',
    },
  ],
};

const SAINT_MICHAEL: PrayerStep = {
  key: 'saint-michael',
  title: 'Oración a San Miguel Arcángel',
  blocks: [
    {
      kind: 'lines',
      lines: [
        'San Miguel Arcángel,',
        'defiéndenos en la batalla.',
        'Sé nuestro amparo contra la maldad y las acechanzas del demonio.',
        'Que Dios lo reprima, es nuestra humilde súplica.',
        'Y tú, Príncipe de la Milicia Celestial,',
        'con el poder que Dios te ha conferido,',
        'arroja al infierno a Satanás',
        'y a los demás espíritus malignos',
        'que vagan por el mundo',
        'para perdición de las almas.',
        'Amén.',
      ],
    },
  ],
};

const GUARDIAN_ANGEL: PrayerStep = {
  key: 'guardian-angel',
  title: 'Oración al Ángel de la Guarda',
  blocks: [
    {
      kind: 'lines',
      lines: [
        'Ángel de Dios,',
        'que eres mi custodio,',
        'pues la bondad divina me ha encomendado a ti,',
        'ilúminame,',
        'guárdame, rígeme y gobiérname.',
        'Amén.',
      ],
    },
  ],
};

const OUR_FATHER: PrayerStep = {
  key: 'our-father',
  title: 'Padre Nuestro, Ave María y Gloria',
  blocks: [
    {
      kind: 'note',
      text: 'Reza ahora un Padre Nuestro, un Ave María y un Gloria.',
    },
  ],
};

const LITANY: PrayerStep = {
  key: 'litany',
  title: 'Letanía a la Preciosísima Sangre',
  subtitle: 'de Nuestro Señor Jesucristo',
  blocks: [
    {
      kind: 'lines',
      lines: [
        'Señor, ten piedad de nosotros.',
        'Cristo, ten piedad de nosotros.',
        'Señor, ten piedad de nosotros.',
        'Cristo, óyenos.',
        'Cristo, escúchanos.',
      ],
    },
    {
      kind: 'litany',
      items: [
        { call: 'Dios Padre celestial', response: 'ten piedad de nosotros.' },
        { call: 'Dios Hijo, Redentor del mundo', response: 'ten piedad de nosotros.' },
        { call: 'Dios Espíritu Santo', response: 'ten piedad de nosotros.' },
        { call: 'Santísima Trinidad, que sois un solo Dios', response: 'ten piedad de nosotros.' },
      ],
    },
    {
      kind: 'litany',
      items: [
        { call: 'Sangre de Cristo, del Unigénito del Padre', response: 'Sálvanos.' },
        { call: 'Sangre de Cristo, del Verbo de Dios encarnado', response: 'Sálvanos.' },
        { call: 'Sangre de Cristo, del Testamento Nuevo y Eterno', response: 'Sálvanos.' },
        {
          call: 'Sangre de Cristo, derramada sobre la tierra en la agonía',
          response: 'Sálvanos.',
        },
        {
          call: 'Sangre de Cristo, vertida copiosamente en la flagelación',
          response: 'Sálvanos.',
        },
        { call: 'Sangre de Cristo, brotada en la coronación de espinas', response: 'Sálvanos.' },
        { call: 'Sangre de Cristo, derramada en la cruz', response: 'Sálvanos.' },
        { call: 'Sangre de Cristo, prenda de nuestra salvación', response: 'Sálvanos.' },
        { call: 'Sangre de Cristo, sin la cual no hay perdón', response: 'Sálvanos.' },
        {
          call: 'Sangre de Cristo, bebida eucarística y refrigerio de las almas',
          response: 'Sálvanos.',
        },
        { call: 'Sangre de Cristo, manantial de misericordia', response: 'Sálvanos.' },
        { call: 'Sangre de Cristo, vencedora de los demonios', response: 'Sálvanos.' },
        { call: 'Sangre de Cristo, fortaleza de los mártires', response: 'Sálvanos.' },
        { call: 'Sangre de Cristo, fuerza de los confesores', response: 'Sálvanos.' },
        { call: 'Sangre de Cristo, que engendra vírgenes', response: 'Sálvanos.' },
        { call: 'Sangre de Cristo, socorro en el peligro', response: 'Sálvanos.' },
        { call: 'Sangre de Cristo, alivio de los afligidos', response: 'Sálvanos.' },
        { call: 'Sangre de Cristo, solaz en las penas', response: 'Sálvanos.' },
        { call: 'Sangre de Cristo, esperanza del penitente', response: 'Sálvanos.' },
        { call: 'Sangre de Cristo, consuelo del moribundo', response: 'Sálvanos.' },
        { call: 'Sangre de Cristo, paz y ternura para los corazones', response: 'Sálvanos.' },
        { call: 'Sangre de Cristo, promesa de vida eterna', response: 'Sálvanos.' },
        {
          call: 'Sangre de Cristo, que libras a las almas del purgatorio',
          response: 'Sálvanos.',
        },
        { call: 'Sangre de Cristo, dignísima de toda gloria y honor', response: 'Sálvanos.' },
      ],
    },
    {
      kind: 'litany',
      items: [
        { call: 'Cordero de Dios, que quitas el pecado del mundo', response: 'Perdónanos, Señor.' },
        { call: 'Cordero de Dios, que quitas el pecado del mundo', response: 'Escúchanos, Señor.' },
        {
          call: 'Cordero de Dios, que quitas el pecado del mundo',
          response: 'Ten piedad de nosotros.',
        },
      ],
    },
    {
      kind: 'versicle',
      call: '¡Oh Señor, nos has redimido en tu sangre!',
      response: 'Y nos hiciste reino de nuestro Dios.',
    },
    {
      kind: 'paragraph',
      text: 'Oremos. Omnipotente y Sempiterno Dios, que constituiste a tu Hijo Unigénito Redentor del mundo, y que te es grato reconciliarte con nosotros a través de Su Sangre: te suplicamos nos concedas que veneremos con solemne adoración el precio de nuestra Redención, que por su virtud seamos preservados en la tierra de los males de la vida presente, para que gocemos en el Cielo de su fruto eterno. Por el mismo Cristo Nuestro Señor. Amén.',
    },
  ],
};

const DAY_BLOCKS: Record<number, PrayerBlock[]> = {
  // Sunday
  0: [
    {
      kind: 'paragraph',
      text: 'Oh Gloriosa Reina del Cielo y de la Tierra, Virgen, Virgen Poderosísima, tú que tienes el poder de aplastar la cabeza de la serpiente antigua con tu talón, ven y ejerce este poder que fluye de la gracia de tu Inmaculada Concepción. Protégenos bajo tu manto de pureza y de amor, atráenos hacia la dulce morada de tu corazón, aniquila y rinde impotente esas fuerzas que se inclinan a destruirnos.',
    },
    {
      kind: 'paragraph',
      text: 'Ven, Ama Soberana de los Santos Ángeles y Ama del Santo Rosario, tú que desde el principio has recibido de Dios el poder y la misión de aplastar la cabeza de Satanás. Envíanos tus Santas Legiones, humildemente te suplicamos, para que, bajo tu mando y tu poder, puedan perseguir a los espíritus malignos, rodearlos por todos lados, resistir sus ataques atrevidos y arrojarlos lejos de nosotros sin dañar a ninguno a su paso, atándolos al pie de la Cruz para ser juzgados y sentenciados por Jesucristo tu Hijo y ser dispuestos por Él según su Voluntad.',
    },
    {
      kind: 'paragraph',
      text: 'San José, Patrón de la Iglesia Universal, ven en nuestro auxilio en esta grave batalla contra las fuerzas de la oscuridad, rechaza los ataques del demonio y libra a los miembros del Auxilium Christianorum y a todos aquellos por quienes rezan los sacerdotes del Auxilium Christianorum de las fortalezas del enemigo.',
    },
    {
      kind: 'paragraph',
      text: 'San Miguel, llama a la corte celestial entera a unir sus fuerzas en esta batalla feroz contra los poderes del infierno. ¡Ven, Oh Príncipe del Cielo! con tu gran espada y arroja al infierno a Satanás y a todos los demás espíritus malignos. Oh Ángeles de la Guarda, guíennos y protéjannos. Amén.',
    },
  ],
  // Monday
  1: [
    {
      kind: 'paragraph',
      text: 'Señor Jesucristo, te suplicamos que cubras nuestras familias, y todas nuestras posesiones con tu amor y con tu Preciosísima Sangre y rodéanos con tus Ángeles Celestiales, Santos y el manto de Nuestra Santa Madre. Amén.',
    },
  ],
  // Tuesday
  2: [
    {
      kind: 'paragraph',
      text: 'Señor Jesucristo, te imploramos la gracia de permanecer protegidos bajo el manto protector de María, rodeados por la Santa Zarza de la cual fue tomada la Santa Corona de Espinas, y cual fue saturada con tu Preciosísima Sangre en el poder del Espíritu Santo, con nuestros Ángeles de la Guarda, para la mayor gloria del Padre. Amén.',
    },
  ],
  // Wednesday
  3: [
    {
      kind: 'paragraph',
      text: 'En el Nombre de Jesucristo, Nuestro Señor y Dios, te pedimos que rindas impotentes, paralizados e inefectivos a todos los espíritus que intenten tomar venganza contra cualquier miembro del Auxilium Christianorum, nuestras familias, amistades, comunidades, aquellos que ruegan por nosotros y a los miembros de sus familias o cualquier persona asociada con nosotros y por quienes rezan los sacerdotes del Auxilium Christianorum.',
    },
    {
      kind: 'paragraph',
      text: 'Te pedimos que ates a todos los espíritus malignos, a todas las potestades en el aire, en el agua, en la tierra, en el fuego, bajo la tierra o dondequiera que ejerzan sus poderes, cualquier fuerza satánica en la naturaleza y todos los emisarios de la sede satánica. Te pedimos que ates en tu Preciosísima Sangre todos los atributos, aspectos y características, interacciones, comunicaciones y juegos engañosos de los espíritus malignos. Te pedimos que rompas cualquier y todas las cadenas, lazos y enlaces en el Nombre del Padre, y del Hijo y del Espíritu Santo. Amén.',
    },
  ],
  // Thursday
  4: [
    {
      kind: 'paragraph',
      text: 'Mi Señor, tú eres Todopoderoso, tú eres Dios, tú eres mi Padre. Te rogamos por la intercesión y ayuda de los Santos Arcángeles Miguel, Rafael y Gabriel por la liberación de nuestros hermanos y hermanas que están esclavizados por el maligno. Que todos los Santos y Santas del Cielo, vengan en nuestra ayuda.',
    },
    {
      kind: 'litany',
      items: [
        {
          call: 'De toda ansiedad, tristeza y obsesiones',
          response: 'Te suplicamos, líbranos Señor.',
        },
        { call: 'De odios, fornicación y envidia', response: 'Te suplicamos, líbranos Señor.' },
        {
          call: 'De pensamientos de celos, rabia y muerte',
          response: 'Te suplicamos, líbranos Señor.',
        },
        {
          call: 'De todo pensamiento de suicidio y aborto',
          response: 'Te suplicamos, líbranos Señor.',
        },
        {
          call: 'De toda forma de sexualidad pecaminosa',
          response: 'Te suplicamos, líbranos Señor.',
        },
        {
          call: 'De toda división dentro de nuestra familia, y amistades dañinas',
          response: 'Te suplicamos, líbranos Señor.',
        },
        {
          call: 'De toda clase de hechizos, maldición, brujería y toda forma de lo oculto',
          response: 'Te suplicamos, líbranos Señor.',
        },
      ],
    },
    {
      kind: 'paragraph',
      text: 'Tú que dijiste, «Mi paz les dejo, Mi paz les doy», concédenos que, por la intercesión de la Virgen María, seamos liberados de toda influencia demoniaca y disfrutar siempre de tu paz. En el Nombre de Cristo, Nuestro Señor. Amén.',
    },
  ],
  // Friday
  5: [
    { kind: 'note', text: 'Letanías de la Humildad' },
    {
      kind: 'litany',
      items: [
        { call: 'Jesús, manso y humilde de Corazón', response: 'Escúchame.' },
        { call: 'Del deseo de ser lisonjeado', response: 'Líbrame, Jesús.' },
        { call: 'Del deseo de ser amado', response: 'Líbrame, Jesús.' },
        { call: 'Del deseo de ser alabado', response: 'Líbrame, Jesús.' },
        { call: 'Del deseo de ser honrado', response: 'Líbrame, Jesús.' },
        { call: 'Del deseo de ser adulado', response: 'Líbrame, Jesús.' },
        { call: 'Del deseo de ser preferido a otros', response: 'Líbrame, Jesús.' },
        { call: 'Del deseo de ser consultado', response: 'Líbrame, Jesús.' },
        { call: 'Del deseo de ser aprobado', response: 'Líbrame, Jesús.' },
        { call: 'Del temor de ser humillado', response: 'Líbrame, Jesús.' },
        { call: 'Del temor de ser despreciado', response: 'Líbrame, Jesús.' },
        { call: 'Del temor de ser reprendido', response: 'Líbrame, Jesús.' },
        { call: 'Del temor de ser calumniado', response: 'Líbrame, Jesús.' },
        { call: 'Del temor de ser olvidado', response: 'Líbrame, Jesús.' },
        { call: 'Del temor de ser puesto en ridículo', response: 'Líbrame, Jesús.' },
        { call: 'Del temor de ser injuriado', response: 'Líbrame, Jesús.' },
        { call: 'Del temor de ser juzgado con malicia', response: 'Líbrame, Jesús.' },
      ],
    },
    {
      kind: 'litany',
      items: [
        {
          call: 'Que otros sean más amados que yo, Jesús',
          response: 'dame la gracia de desearlo.',
        },
        {
          call: 'Que otros sean más estimados que yo, Jesús',
          response: 'dame la gracia de desearlo.',
        },
        {
          call: 'Que otros crezcan en la opinión del mundo y yo me eclipse, Jesús',
          response: 'dame la gracia de desearlo.',
        },
        {
          call: 'Que otros sean elegidos y de mí no se haga caso, Jesús',
          response: 'dame la gracia de desearlo.',
        },
        {
          call: 'Que otros sean elogiados, y yo pase desapercibido, Jesús',
          response: 'dame la gracia de desearlo.',
        },
        {
          call: 'Que otros sean preferidos a mí en todo, Jesús',
          response: 'dame la gracia de desearlo.',
        },
        {
          call: 'Que los demás sean más santos que yo con tal de que yo sea todo lo santo que pueda, Jesús',
          response: 'dame la gracia de desearlo.',
        },
      ],
    },
  ],
  // Saturday
  6: [
    {
      kind: 'paragraph',
      text: 'Oh Dios y Padre de Nuestro Señor Jesucristo, clamamos a tu Nombre Santo y humildemente suplicamos tu clemencia, que por la intercesión de la Inmaculada Siempre Virgen, Nuestra Madre María, y del glorioso Arcángel San Miguel nos concedas socorrernos contra Satanás y todos los demás espíritus impuros que vagan por el mundo como peligro inminente para el ser humano y para perdición de las almas. Amén.',
    },
  ],
};

const CONCLUSION: PrayerStep = {
  key: 'conclusion',
  title: 'Conclusión para cada día',
  blocks: [
    {
      kind: 'paragraph',
      text: 'Augusta Reina de los Cielos, Celestial Soberana de los Ángeles, tú que desde el principio has recibido de Dios el poder y la misión de aplastar la cabeza de Satanás, humildemente te suplicamos que envíes tus legiones, para que bajo tu mando y por tu poder, persigan a los demonios y los combatan donde quiera que se encuentren, suprimiendo sus audacias, y los arrojen al abismo. ¡Oh buena y tierna Madre, siempre serás nuestro amor y esperanza! ¡Oh Divina Madre! envía tus Santos Ángeles a defendernos y a expulsar lejos de nosotros al enemigo cruel. Santos Ángeles y Arcángeles, defiéndanos y guárdenos. Amén.',
    },
    {
      kind: 'litany',
      items: [
        { call: 'Sacratísimo Corazón de Jesús', response: 'ten piedad de nosotros.' },
        { call: 'María, Auxilio de Cristianos', response: 'Ruega por nosotros.' },
        { call: 'Virgen La Más Poderosa', response: 'Ruega por nosotros.' },
        { call: 'San José', response: 'Ruega por nosotros.' },
        { call: 'San Miguel Arcángel', response: 'Ruega por nosotros.' },
        { call: 'Todos los Santos Ángeles', response: 'Rueguen por nosotros.' },
      ],
    },
    {
      kind: 'paragraph',
      text: 'En el Nombre del Padre, del Hijo y del Espíritu Santo. Amén.',
    },
  ],
};

/**
 * The full ordered sequence for one day. `weekday` follows Date#getDay
 * (0 = Sunday).
 */
export function getPrayerSteps(weekday: number): PrayerStep[] {
  const dayBlocks = DAY_BLOCKS[weekday] ?? DAY_BLOCKS[0];

  return [
    INVOCATION,
    SAINT_MICHAEL,
    GUARDIAN_ANGEL,
    OUR_FATHER,
    LITANY,
    { key: 'day-prayer', title: WEEKDAY_TITLES[weekday] ?? WEEKDAY_TITLES[0], blocks: dayBlocks },
    CONCLUSION,
  ];
}

export type GuideSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

// The introduction and member requirements from the association's manual.
export const GUIDE_SECTIONS: GuideSection[] = [
  {
    title: 'Sobre la asociación',
    paragraphs: [
      'La Iglesia nos enseña que está dividida en La Iglesia Triunfante (los miembros de la Iglesia en el Cielo), La Iglesia Purgante (los miembros que se encuentran en el purgatorio) y La Iglesia Militante (los miembros aún vivos en este mundo). Porque somos parte de La Iglesia Militante, estamos en una guerra espiritual, y esta guerra requiere que reconozcamos, como San Pablo nos enseña, que «nuestra lucha no es contra sangre y carne sino contra los principados, contra las potestades, contra los poderes mundanos de estas tinieblas, contra los espíritus de la maldad en lo celestial» (Efesios 6:12).',
      'Los miembros del Auxilium Christianorum deben siempre tener en cuenta la realidad de su estado como miembros de la Iglesia viviendo en este mundo. A pesar de las enseñanzas de San Pablo, muchos católicos no toman en serio su obligación de guerrear contra las fuerzas demoníacas. Por esta razón se fundó el Auxilium Christianorum.',
    ],
  },
  {
    title: 'Propósitos principales',
    items: [
      'Proveer oraciones por aquellos sacerdotes asociados a Auxilium Christianorum, con el fin de que su apostolado de arrojar a los demonios sea eficaz.',
      'Proveer oraciones para la protección de los sacerdotes, miembros de la asociación, sus familias y amistades, para que no sean afectados adversamente por lo demoníaco.',
    ],
  },
  {
    title: 'Requisitos de sus miembros',
    items: [
      'Antes de llegar a ser miembro, se exhorta fuertemente al laico que consulte a su director espiritual o a su confesor.',
      'Procurar llevar una vida habitual de gracia santificante, siempre deseando nunca caer en estado de pecado mortal y evitar todo pecado venial intencional.',
      'Procurar continuamente aumentar y perfeccionar la vida de oración: no solamente las oraciones verbales requeridas, sino también una vida constante de meditación, muy eficaz para expulsar lo diabólico y evitar la opresión demoniaca.',
      'Rezar el rosario diariamente. La intención del Rosario puede ser por cualquier intención.',
      'Cumplir los requisitos diarios de las oraciones verbales contenidas aquí, teniendo como intención los propósitos principales de la asociación, y hacer uso frecuente de los sacramentales.',
      'Mantener las palabras de San Pablo en el corazón: procurar la mansedumbre y la humildad con el prójimo, no atacando en cólera o en vindicación, sino procurando desarraigar cualquier influencia demoníaca según su estado de vida, evitando cualquier forma de superstición y subordinando siempre estas oraciones a los principios auténticos del catolicismo, con devoción y fe.',
      'Esforzarse en aumentar la devoción a Nuestra Señora bajo la advocación de Virgo Potens (Virgen, La Más Poderosa).',
      'Aumentar la devoción al Ángel de la Guarda.',
      'Cuando sea económicamente posible, mantener estatuas de Nuestra Señora y de San Miguel en el hogar, ante las cuales debe ser encendida una veladora.',
      'Ninguno de estos requisitos obliga bajo pena de pecado.',
    ],
  },
  {
    title: 'Fuente',
    paragraphs: [
      'Texto de la Asociación Auxilium Christianorum — auxiliumchristianorum.org. Con aprobación eclesiástica.',
    ],
  },
];
