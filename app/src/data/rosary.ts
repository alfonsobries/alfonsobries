// The Holy Rosary, guided step by step. Structure and mystery citations
// follow the Vatican's official outline (vatican.va/special/rosary); prayer
// texts are the standard Spanish (Mexico) versions. Gospel passages are full
// pericopes rendered faithfully to Scripture.

import { type PrayerBlock } from '@/data/auxilium';

export type MysterySetKey = 'gozosos' | 'luminosos' | 'dolorosos' | 'gloriosos';

export type Mystery = {
  key: string;
  /** "Primer misterio gozoso" */
  ordinal: string;
  title: string;
  /** Traditional fruit of the mystery. */
  fruit: string;
  citation: string;
  /** Full scripture passage, one paragraph per entry. */
  gospel: string[];
  /** "Saber más" — catechetical background, one paragraph per entry. */
  meditation: string[];
};

export type MysterySet = {
  key: MysterySetKey;
  name: string;
  daysLabel: string;
  mysteries: Mystery[];
};

export type RosaryBead = {
  /** 0 = the large Padre Nuestro bead, 1-10 = the small Ave María beads. */
  index: number;
  count: number;
};

export type RosaryStep = {
  key: string;
  sectionKey: string;
  title: string;
  subtitle?: string;
  blocks: PrayerBlock[];
  /** Present on the step that introduces a mystery. */
  mystery?: Mystery;
  /** Present on decade steps so the bead strip can render progress. */
  bead?: RosaryBead;
};

export type RosarySection = {
  key: string;
  /** Long title for the section header. */
  title: string;
  /** Short label for the overall progress strip. */
  short: string;
};

// ---------------------------------------------------------------------------
// Common prayers (standard Spanish, as prayed in Mexico)
// ---------------------------------------------------------------------------

export const PADRE_NUESTRO: string[] = [
  'Padre nuestro, que estás en el cielo, santificado sea tu Nombre; venga a nosotros tu Reino; hágase tu voluntad en la tierra como en el cielo.',
  'Danos hoy nuestro pan de cada día; perdona nuestras ofensas, como también nosotros perdonamos a los que nos ofenden; no nos dejes caer en la tentación, y líbranos del mal. Amén.',
];

export const AVE_MARIA: string[] = [
  'Dios te salve, María, llena eres de gracia; el Señor es contigo. Bendita tú eres entre todas las mujeres, y bendito es el fruto de tu vientre, Jesús.',
  'Santa María, Madre de Dios, ruega por nosotros, pecadores, ahora y en la hora de nuestra muerte. Amén.',
];

export const GLORIA =
  'Gloria al Padre, y al Hijo, y al Espíritu Santo. Como era en el principio, ahora y siempre, por los siglos de los siglos. Amén.';

export const JACULATORIA_MARIA =
  'María, Madre de gracia, Madre de misericordia, defiéndenos de nuestros enemigos y ampáranos ahora y en la hora de nuestra muerte. Amén.';

export const ORACION_FATIMA =
  'Oh Jesús mío, perdona nuestros pecados, líbranos del fuego del infierno, lleva al cielo a todas las almas, especialmente a las más necesitadas de tu misericordia. Amén.';

// ---------------------------------------------------------------------------
// Misterios gozosos (lunes y sábado)
// ---------------------------------------------------------------------------

const GOZOSOS: Mystery[] = [
  {
    key: 'gozoso-1',
    ordinal: 'Primer misterio gozoso',
    title: 'La Encarnación del Hijo de Dios',
    fruit: 'La humildad',
    citation: 'Lucas 1, 26-38',
    gospel: [
      'Al sexto mes, el ángel Gabriel fue enviado por Dios a una ciudad de Galilea llamada Nazaret, a una virgen desposada con un hombre llamado José, de la casa de David; el nombre de la virgen era María. El ángel, entrando donde ella estaba, le dijo: "Alégrate, llena de gracia, el Señor está contigo". Ella se turbó al oír estas palabras y se preguntaba qué significaría aquel saludo.',
      'El ángel le dijo: "No temas, María, porque has hallado gracia delante de Dios. Concebirás en tu seno y darás a luz un hijo, a quien pondrás por nombre Jesús. Él será grande y será llamado Hijo del Altísimo; el Señor Dios le dará el trono de David, su padre; reinará sobre la casa de Jacob para siempre y su reino no tendrá fin".',
      'María dijo al ángel: "¿Cómo será esto, pues no conozco varón?". El ángel le respondió: "El Espíritu Santo vendrá sobre ti y el poder del Altísimo te cubrirá con su sombra; por eso, el que ha de nacer será santo y será llamado Hijo de Dios. Mira, también Isabel, tu parienta, ha concebido un hijo en su vejez, y este es ya el sexto mes de la que llamaban estéril, porque para Dios no hay nada imposible".',
      'Dijo María: "He aquí la esclava del Señor; hágase en mí según tu palabra". Y el ángel se retiró de su presencia.',
    ],
    meditation: [
      'En la Anunciación, el Verbo eterno de Dios se hace hombre en el seno de María. Es el momento en que "la Palabra se hizo carne y habitó entre nosotros" (Jn 1, 14): Dios entra en la historia humana como uno de nosotros.',
      'El "sí" de María — su fiat — es la respuesta más libre y más humilde que criatura alguna ha dado a Dios. San Juan Pablo II enseña que en este misterio contemplamos la humildad de Dios, que se abaja, y la humildad de María, que se entrega sin reservas.',
      'Fruto tradicional: la humildad. Pedimos aprender a decir "hágase en mí según tu palabra" ante lo que Dios pide cada día.',
    ],
  },
  {
    key: 'gozoso-2',
    ordinal: 'Segundo misterio gozoso',
    title: 'La Visitación de María a su prima Isabel',
    fruit: 'El amor al prójimo',
    citation: 'Lucas 1, 39-45',
    gospel: [
      'En aquellos días, María se puso en camino y fue aprisa a la región montañosa, a una ciudad de Judá. Entró en casa de Zacarías y saludó a Isabel. En cuanto Isabel oyó el saludo de María, saltó de gozo el niño en su seno, e Isabel quedó llena del Espíritu Santo.',
      'Exclamando con gran voz, dijo: "¡Bendita tú entre las mujeres y bendito el fruto de tu vientre! ¿De dónde a mí que la madre de mi Señor venga a visitarme? Porque apenas llegó a mis oídos la voz de tu saludo, saltó de gozo el niño en mi seno. ¡Dichosa la que ha creído que se cumplirían las cosas que le fueron dichas de parte del Señor!".',
    ],
    meditation: [
      'María, recién concebido el Hijo de Dios en su seno, no se queda en sí misma: sale aprisa a servir a su prima anciana. Llevar a Cristo dentro se traduce inmediatamente en caridad concreta.',
      'Isabel la llama "la madre de mi Señor" y la proclama dichosa por haber creído. La Iglesia ve aquí la primera procesión del Santísimo: María es el arca viva que lleva a Dios a una casa, y esa casa se llena de alegría y de Espíritu Santo.',
      'Fruto tradicional: el amor al prójimo. Pedimos la caridad que se pone en camino sin que se lo pidan.',
    ],
  },
  {
    key: 'gozoso-3',
    ordinal: 'Tercer misterio gozoso',
    title: 'El Nacimiento del Hijo de Dios en Belén',
    fruit: 'El espíritu de pobreza',
    citation: 'Lucas 2, 1-14',
    gospel: [
      'Sucedió que por aquellos días salió un edicto de César Augusto ordenando que se empadronase todo el mundo. Este primer empadronamiento tuvo lugar siendo Quirino gobernador de Siria. Todos iban a empadronarse, cada uno a su ciudad. José subió también desde Galilea, de la ciudad de Nazaret, a Judea, a la ciudad de David que se llama Belén, por ser él de la casa y familia de David, para empadronarse con María, su esposa, que estaba encinta.',
      'Estando allí, se le cumplieron los días del parto y dio a luz a su hijo primogénito; lo envolvió en pañales y lo acostó en un pesebre, porque no había sitio para ellos en la posada.',
      'Había en la misma comarca unos pastores que dormían al raso y vigilaban por turno su rebaño durante la noche. Un ángel del Señor se les presentó, y la gloria del Señor los envolvió con su luz, y se llenaron de temor. El ángel les dijo: "No teman, pues les anuncio una gran alegría, que lo será para todo el pueblo: les ha nacido hoy, en la ciudad de David, un Salvador, que es el Cristo, el Señor. Esto les servirá de señal: encontrarán a un niño envuelto en pañales y acostado en un pesebre".',
      'Y de pronto se juntó con el ángel una multitud del ejército celestial, que alababa a Dios diciendo: "Gloria a Dios en las alturas y en la tierra paz a los hombres en quienes él se complace".',
    ],
    meditation: [
      'El Rey del universo nace fuera de la posada, en la pobreza total del pesebre. Dios elige entrar al mundo sin poder, sin riqueza y sin ruido, y los primeros invitados son pastores, los últimos de la sociedad.',
      'El Catecismo enseña que "hacerse niño en relación a Dios es la condición para entrar en el Reino" (CIC 526). En Belén aprendemos que la grandeza de Dios se muestra en la pequeñez.',
      'Fruto tradicional: el espíritu de pobreza y el desprendimiento de los bienes. Pedimos amar más a las personas que a las cosas.',
    ],
  },
  {
    key: 'gozoso-4',
    ordinal: 'Cuarto misterio gozoso',
    title: 'La Presentación de Jesús en el Templo',
    fruit: 'La obediencia y la pureza',
    citation: 'Lucas 2, 22-35',
    gospel: [
      'Cuando se cumplieron los días de la purificación de ellos, según la Ley de Moisés, llevaron a Jesús a Jerusalén para presentarlo al Señor, como está escrito en la Ley del Señor: "Todo varón primogénito será consagrado al Señor", y para ofrecer en sacrificio un par de tórtolas o dos pichones, conforme a lo que se dice en la Ley del Señor.',
      'Había en Jerusalén un hombre llamado Simeón; era justo y piadoso, y esperaba la consolación de Israel; y el Espíritu Santo estaba en él. Le había sido revelado por el Espíritu Santo que no vería la muerte antes de haber visto al Cristo del Señor. Movido por el Espíritu, vino al Templo; y cuando los padres introdujeron al niño Jesús para cumplir lo que la Ley prescribía sobre él, lo tomó en brazos y bendijo a Dios diciendo:',
      '"Ahora, Señor, puedes dejar que tu siervo se vaya en paz, según tu palabra; porque han visto mis ojos tu salvación, la que has preparado a la vista de todos los pueblos: luz para iluminar a las naciones y gloria de tu pueblo Israel".',
      'Su padre y su madre estaban admirados de lo que se decía de él. Simeón los bendijo y dijo a María, su madre: "Este niño está puesto para caída y elevación de muchos en Israel, y para ser señal de contradicción — ¡y a ti misma una espada te atravesará el alma! — a fin de que queden al descubierto los pensamientos de muchos corazones".',
    ],
    meditation: [
      'María y José cumplen la Ley con sencillez: ofrecen al Señor lo que ya es suyo. La ofrenda de los pobres — dos pichones — revela otra vez la pobreza de la Sagrada Familia.',
      'Simeón reconoce en un bebé de cuarenta días la luz de las naciones, y anuncia a María la espada de dolor: desde el inicio, el gozo de este misterio lleva dentro la sombra de la Cruz.',
      'Fruto tradicional: la obediencia y la pureza de corazón. Pedimos ofrecer a Dios lo que más amamos, confiando en que en sus manos está seguro.',
    ],
  },
  {
    key: 'gozoso-5',
    ordinal: 'Quinto misterio gozoso',
    title: 'El Niño Jesús perdido y hallado en el Templo',
    fruit: 'Buscar a Dios en todas las cosas',
    citation: 'Lucas 2, 41-52',
    gospel: [
      'Sus padres iban todos los años a Jerusalén a la fiesta de la Pascua. Cuando el niño tuvo doce años, subieron a la fiesta según la costumbre. Al terminar los días de la fiesta, mientras ellos regresaban, el niño Jesús se quedó en Jerusalén, sin saberlo sus padres. Creyendo que iba en la caravana, hicieron un día de camino, y lo buscaban entre los parientes y conocidos; al no encontrarlo, se volvieron a Jerusalén en su busca.',
      'Al cabo de tres días lo encontraron en el Templo, sentado en medio de los maestros, escuchándolos y preguntándoles; todos los que lo oían estaban estupefactos por su inteligencia y sus respuestas. Cuando lo vieron, quedaron sorprendidos, y su madre le dijo: "Hijo, ¿por qué nos has hecho esto? Mira, tu padre y yo, angustiados, te andábamos buscando". Él les dijo: "¿Por qué me buscaban? ¿No sabían que yo debía estar en las cosas de mi Padre?". Pero ellos no comprendieron la respuesta que les dio.',
      'Bajó con ellos y vino a Nazaret, y vivía sujeto a ellos. Su madre conservaba cuidadosamente todas las cosas en su corazón. Jesús progresaba en sabiduría, en estatura y en gracia ante Dios y ante los hombres.',
    ],
    meditation: [
      'Tres días de angustia y de búsqueda — un anticipo de los tres días del sepulcro. María y José experimentan lo que todo creyente conoce: la aparente ausencia de Dios, y la alegría de reencontrarlo.',
      'Las primeras palabras de Jesús que registra el Evangelio hablan de su Padre: su vida entera apunta ya a la misión. Y sin embargo, vuelve a Nazaret y "vivía sujeto a ellos": treinta años de vida oculta y obediente.',
      'Fruto tradicional: buscar a Dios en todas las cosas. Pedimos no resignarnos nunca cuando lo hayamos perdido, y buscarlo donde siempre está: en su casa.',
    ],
  },
];

// ---------------------------------------------------------------------------
// Misterios luminosos (jueves)
// ---------------------------------------------------------------------------

const LUMINOSOS: Mystery[] = [
  {
    key: 'luminoso-1',
    ordinal: 'Primer misterio luminoso',
    title: 'El Bautismo de Jesús en el Jordán',
    fruit: 'La fidelidad a las promesas del Bautismo',
    citation: 'Mateo 3, 13-17',
    gospel: [
      'Entonces Jesús vino de Galilea al Jordán, donde estaba Juan, para ser bautizado por él. Pero Juan trataba de impedírselo diciendo: "Soy yo el que necesita ser bautizado por ti, ¿y tú vienes a mí?". Jesús le respondió: "Deja ahora, pues conviene que así cumplamos toda justicia". Entonces Juan se lo permitió.',
      'Bautizado Jesús, salió luego del agua; y en esto se abrieron los cielos y vio al Espíritu de Dios que bajaba en forma de paloma y venía sobre él. Y una voz que salía de los cielos decía: "Este es mi Hijo amado, en quien me complazco".',
    ],
    meditation: [
      'El Inocente se pone en la fila de los pecadores. Jesús no necesita conversión, pero baja al agua para cargar desde el inicio con lo nuestro; y el cielo responde: se abre, desciende el Espíritu, y el Padre lo proclama Hijo amado.',
      'San Juan Pablo II, al proponer estos misterios de luz (Rosarium Virginis Mariae, 2002), señala el Bautismo como el primero: aquí se revela la Trinidad entera y comienza la vida pública del Señor.',
      'Fruto: renovar las promesas de nuestro propio Bautismo. Pedimos vivir como lo que somos: hijos amados del Padre.',
    ],
  },
  {
    key: 'luminoso-2',
    ordinal: 'Segundo misterio luminoso',
    title: 'Las bodas de Caná',
    fruit: 'La confianza en la intercesión de María',
    citation: 'Juan 2, 1-11',
    gospel: [
      'Tres días después se celebraba una boda en Caná de Galilea, y estaba allí la madre de Jesús. Fue invitado también a la boda Jesús con sus discípulos. Y como faltó el vino, la madre de Jesús le dijo: "No tienen vino". Jesús le respondió: "Mujer, ¿qué tenemos que ver tú y yo? Todavía no ha llegado mi hora". Su madre dijo a los sirvientes: "Hagan lo que él les diga".',
      'Había allí seis tinajas de piedra, destinadas a las purificaciones de los judíos, de unos cien litros cada una. Jesús les dijo: "Llenen las tinajas de agua". Y las llenaron hasta arriba. "Saquen ahora — les dijo — y llévenlo al mayordomo". Ellos lo llevaron. Cuando el mayordomo probó el agua convertida en vino, sin saber de dónde venía — aunque los sirvientes que habían sacado el agua sí lo sabían —, llamó al novio y le dijo: "Todos sirven primero el vino bueno, y cuando ya han bebido bien, el inferior. Tú has guardado el vino bueno hasta ahora".',
      'Así, en Caná de Galilea, dio Jesús comienzo a sus señales, y manifestó su gloria, y creyeron en él sus discípulos.',
    ],
    meditation: [
      'El primer milagro de Jesús nace de la mirada atenta de María: nadie le pidió nada; ella vio la necesidad antes que los demás y la llevó a su Hijo con cinco palabras.',
      '"Hagan lo que él les diga" son las últimas palabras de María en el Evangelio, y resumen toda su misión: llevarnos a Cristo. Su intercesión adelanta "la hora" del Señor.',
      'Fruto: confiar nuestras necesidades a María. Pedimos obedecer con prontitud lo que Cristo nos diga, aunque parezca tan ordinario como llenar tinajas de agua.',
    ],
  },
  {
    key: 'luminoso-3',
    ordinal: 'Tercer misterio luminoso',
    title: 'El anuncio del Reino de Dios',
    fruit: 'La conversión y la confianza en la misericordia',
    citation: 'Marcos 1, 14-20',
    gospel: [
      'Después de que Juan fue entregado, marchó Jesús a Galilea proclamando la Buena Nueva de Dios y diciendo: "El tiempo se ha cumplido y el Reino de Dios está cerca; conviértanse y crean en la Buena Nueva".',
      'Caminando por la orilla del mar de Galilea, vio a Simón y a Andrés, el hermano de Simón, echando las redes en el mar, pues eran pescadores. Jesús les dijo: "Vengan conmigo, y los haré pescadores de hombres". Al instante, dejando las redes, lo siguieron.',
      'Un poco más adelante vio a Santiago, el hijo de Zebedeo, y a su hermano Juan; estaban también en la barca arreglando las redes. Al instante los llamó; y ellos, dejando a su padre Zebedeo en la barca con los jornaleros, se fueron tras él.',
    ],
    meditation: [
      'El corazón de la predicación de Jesús cabe en una frase: el Reino está cerca, conviértete, cree. No es primero una exigencia sino una noticia buena: Dios reina, y su reinado es misericordia.',
      'La llamada de los primeros discípulos muestra cómo responde quien de verdad escucha: "al instante, dejando las redes". Jesús sigue llamando en medio del trabajo ordinario.',
      'Fruto: la conversión continua y la confianza en el perdón. Pedimos no aplazar la respuesta.',
    ],
  },
  {
    key: 'luminoso-4',
    ordinal: 'Cuarto misterio luminoso',
    title: 'La Transfiguración del Señor',
    fruit: 'El deseo de santidad — escuchar a Jesús',
    citation: 'Mateo 17, 1-8',
    gospel: [
      'Seis días después, tomó Jesús consigo a Pedro, a Santiago y a su hermano Juan, y los llevó aparte, a un monte alto. Y se transfiguró delante de ellos: su rostro se puso brillante como el sol y sus vestidos se volvieron blancos como la luz. En esto, se les aparecieron Moisés y Elías que conversaban con él.',
      'Tomando Pedro la palabra, dijo a Jesús: "Señor, ¡qué bien estamos aquí! Si quieres, haré aquí tres tiendas: una para ti, otra para Moisés y otra para Elías". Todavía estaba hablando, cuando una nube luminosa los cubrió con su sombra, y de la nube salía una voz que decía: "Este es mi Hijo amado, en quien me complazco; escúchenlo".',
      'Al oír esto, los discípulos cayeron rostro en tierra, llenos de temor. Jesús se acercó, los tocó y dijo: "Levántense, no teman". Ellos alzaron los ojos y no vieron a nadie más que a Jesús solo.',
    ],
    meditation: [
      'En el Tabor, por un momento, la gloria que Jesús siempre llevó dentro se deja ver. Es un regalo para fortalecer a los tres que pronto lo verán agonizar en Getsemaní.',
      'El mandato del Padre es uno solo: "escúchenlo". Toda la vida espiritual cabe ahí. Y al final quedan con "Jesús solo": cuando pasa el consuelo sensible, basta él.',
      'Fruto: el deseo de santidad. Pedimos gustar de la oración y no bajarnos del monte antes de haber escuchado.',
    ],
  },
  {
    key: 'luminoso-5',
    ordinal: 'Quinto misterio luminoso',
    title: 'La institución de la Eucaristía',
    fruit: 'El amor a la Eucaristía',
    citation: 'Mateo 26, 26-29',
    gospel: [
      'Mientras estaban comiendo, tomó Jesús pan, lo bendijo, lo partió y, dándoselo a sus discípulos, dijo: "Tomen, coman: esto es mi cuerpo". Tomó luego una copa y, dadas las gracias, se la dio diciendo: "Beban de ella todos, porque esta es mi sangre de la Alianza, que es derramada por muchos para el perdón de los pecados".',
      '"Y les digo que desde ahora no beberé de este fruto de la vid hasta el día aquel en que lo beba con ustedes, nuevo, en el Reino de mi Padre".',
    ],
    meditation: [
      'La víspera de su Pasión, Jesús se adelanta a la Cruz y se entrega él mismo en el pan y el vino. No deja un recuerdo: se deja a sí mismo, verdadera presencia, alimento y sacrificio.',
      'El Catecismo llama a la Eucaristía "fuente y culmen de toda la vida cristiana" (CIC 1324). Cada Misa nos sienta en aquella mesa.',
      'Fruto: la adoración y el amor a la Eucaristía. Pedimos hambre de comulgar y reverencia ante su presencia.',
    ],
  },
];

// ---------------------------------------------------------------------------
// Misterios dolorosos (martes y viernes)
// ---------------------------------------------------------------------------

const DOLOROSOS: Mystery[] = [
  {
    key: 'doloroso-1',
    ordinal: 'Primer misterio doloroso',
    title: 'La oración de Jesús en el Huerto',
    fruit: 'El dolor de los pecados',
    citation: 'Mateo 26, 36-46',
    gospel: [
      'Entonces fue Jesús con ellos a una propiedad llamada Getsemaní, y dijo a los discípulos: "Siéntense aquí, mientras voy allá a orar". Y tomando consigo a Pedro y a los dos hijos de Zebedeo, comenzó a sentir tristeza y angustia. Entonces les dijo: "Mi alma está triste hasta el punto de morir; quédense aquí y velen conmigo".',
      'Adelantándose un poco, cayó rostro en tierra, y suplicaba así: "Padre mío, si es posible, que pase de mí esta copa; pero no sea como yo quiero, sino como quieres tú". Vino entonces adonde estaban los discípulos y los encontró dormidos; y dijo a Pedro: "¿De modo que no han podido velar una hora conmigo? Velen y oren para que no caigan en tentación; que el espíritu está pronto, pero la carne es débil".',
      'Se fue por segunda vez y oró así: "Padre mío, si esta copa no puede pasar sin que yo la beba, hágase tu voluntad". Volvió otra vez y los encontró dormidos, pues sus ojos estaban cargados. Los dejó y se fue a orar por tercera vez, repitiendo las mismas palabras. Luego vino adonde estaban los discípulos y les dijo: "Duerman ya y descansen. Miren, ha llegado la hora en que el Hijo del hombre va a ser entregado en manos de pecadores. ¡Levántense! ¡Vamos! Miren que el que me va a entregar está cerca".',
    ],
    meditation: [
      'En Getsemaní Jesús carga por anticipado todo el peso del pecado del mundo, y su humanidad tiembla. Su agonía es real: tristeza mortal, sudor como de sangre (Lc 22, 44), y amigos que duermen.',
      'Y sin embargo, tres veces la misma entrega: "no como yo quiero, sino como quieres tú". Toda oración cristiana aprende aquí su forma definitiva.',
      'Fruto tradicional: el dolor de los pecados y la conformidad con la voluntad de Dios. Pedimos velar una hora con él.',
    ],
  },
  {
    key: 'doloroso-2',
    ordinal: 'Segundo misterio doloroso',
    title: 'La flagelación de Jesús atado a la columna',
    fruit: 'La mortificación de los sentidos',
    citation: 'Mateo 27, 24-26',
    gospel: [
      'Viendo Pilato que nada conseguía, sino que más bien crecía el tumulto, tomó agua y se lavó las manos delante de la gente diciendo: "Inocente soy de la sangre de este justo. Ustedes verán". Y todo el pueblo respondió: "¡Su sangre caiga sobre nosotros y sobre nuestros hijos!".',
      'Entonces les soltó a Barrabás; y a Jesús, después de mandarlo azotar, se lo entregó para que fuera crucificado.',
    ],
    meditation: [
      'El Evangelio despacha el tormento en tres palabras — "después de mandarlo azotar" — pero la flagelación romana era una carnicería que dejaba al reo al borde de la muerte. Isaías lo había visto: "con sus llagas hemos sido curados" (Is 53, 5).',
      'Pilato se lava las manos; la multitud elige a Barrabás. El Inocente calla y paga por los culpables — por cada uno de nosotros.',
      'Fruto tradicional: la mortificación de los sentidos y la pureza. Pedimos fuerza para dominar el cuerpo en lo pequeño, por amor.',
    ],
  },
  {
    key: 'doloroso-3',
    ordinal: 'Tercer misterio doloroso',
    title: 'La coronación de espinas',
    fruit: 'La fortaleza ante la humillación',
    citation: 'Mateo 27, 27-31',
    gospel: [
      'Entonces los soldados del gobernador llevaron consigo a Jesús al pretorio y reunieron alrededor de él a toda la cohorte. Lo desnudaron y le echaron encima un manto de púrpura; y trenzando una corona de espinas, se la pusieron sobre la cabeza, y en su mano derecha una caña. Doblando la rodilla delante de él, se burlaban diciendo: "¡Salve, Rey de los judíos!".',
      'Y escupiéndolo, tomaban la caña y lo golpeaban en la cabeza. Cuando se hubieron burlado de él, le quitaron el manto, le pusieron sus ropas y lo llevaron a crucificarlo.',
    ],
    meditation: [
      'Los soldados montan una parodia de coronación: púrpura de burla, cetro de caña, corona de espinas. Sin saberlo, proclaman la verdad — sí es Rey, y reina precisamente así: humillado y manso.',
      'Jesús sufre aquí el tormento más humano de todos: la burla, el desprecio, el honor pisoteado. Ningún dolor nuestro de ese tipo le es ajeno.',
      'Fruto tradicional: la fortaleza ante la humillación y la muerte del orgullo. Pedimos soportar la burla sin devolverla.',
    ],
  },
  {
    key: 'doloroso-4',
    ordinal: 'Cuarto misterio doloroso',
    title: 'Jesús con la Cruz a cuestas camino del Calvario',
    fruit: 'La paciencia en las cruces de cada día',
    citation: 'Lucas 23, 26-32',
    gospel: [
      'Cuando lo llevaban, echaron mano de un tal Simón de Cirene, que venía del campo, y le cargaron la cruz para que la llevara detrás de Jesús. Lo seguía una gran multitud del pueblo y de mujeres que se dolían y se lamentaban por él.',
      'Jesús, volviéndose a ellas, dijo: "Hijas de Jerusalén, no lloren por mí; lloren más bien por ustedes y por sus hijos. Porque llegarán días en que se dirá: dichosas las estériles, las entrañas que no engendraron y los pechos que no criaron. Entonces se pondrán a decir a los montes: caigan sobre nosotros; y a las colinas: cúbrannos. Porque si en el leño verde hacen esto, en el seco, ¿qué se hará?".',
      'Llevaban además a otros dos malhechores para ejecutarlos con él.',
    ],
    meditation: [
      'Agotado por la noche de tormentos, Jesús carga el madero por las calles de Jerusalén. Simón de Cirene, obligado primero, se convierte en figura de todo discípulo: llevar la cruz detrás de Jesús.',
      'Aun deshecho, Jesús se vuelve a consolar a las mujeres que lloran. En su Vía Crucis no deja de pensar en los demás.',
      'Fruto tradicional: la paciencia en las cruces de cada día. Pedimos cargar lo nuestro sin quejarnos, y ayudar a cargar lo del otro.',
    ],
  },
  {
    key: 'doloroso-5',
    ordinal: 'Quinto misterio doloroso',
    title: 'La crucifixión y muerte de Jesús',
    fruit: 'El perdón y la entrega total',
    citation: 'Lucas 23, 33-46',
    gospel: [
      'Cuando llegaron al lugar llamado Calvario, lo crucificaron allí a él y a los malhechores, uno a la derecha y otro a la izquierda. Jesús decía: "Padre, perdónalos, porque no saben lo que hacen". Se repartieron sus vestidos, echándolos a suertes.',
      'El pueblo estaba mirando; los magistrados hacían muecas diciendo: "A otros salvó; que se salve a sí mismo si él es el Cristo de Dios, el Elegido". También los soldados se burlaban de él y, acercándose, le ofrecían vinagre y le decían: "Si tú eres el Rey de los judíos, ¡sálvate!". Había encima de él un letrero: "Este es el Rey de los judíos".',
      'Uno de los malhechores colgados lo insultaba: "¿No eres tú el Cristo? Pues ¡sálvate a ti y a nosotros!". Pero el otro le respondió diciendo: "¿Ni siquiera temes tú a Dios, estando en la misma condena? Y nosotros con razón, porque recibimos el pago de lo que hicimos; en cambio, este nada malo ha hecho". Y decía: "Jesús, acuérdate de mí cuando llegues a tu Reino". Jesús le dijo: "Yo te aseguro: hoy estarás conmigo en el Paraíso".',
      'Era ya cerca de la hora sexta cuando, al eclipsarse el sol, hubo oscuridad sobre toda la tierra hasta la hora nona. El velo del Santuario se rasgó por medio, y Jesús, dando un fuerte grito, dijo: "Padre, en tus manos encomiendo mi espíritu". Y dicho esto, expiró.',
    ],
    meditation: [
      'Clavado en la Cruz, Jesús perdona a sus verdugos, abre el Paraíso a un ladrón y entrega a su Madre por madre nuestra (Jn 19, 26-27). Hasta el último aliento, su Pasión es puro dar.',
      '"Nadie tiene mayor amor que el que da su vida por sus amigos" (Jn 15, 13). Aquí el Rosario nos planta al pie de la Cruz, junto a María, en la hora central de la historia.',
      'Fruto tradicional: el perdón de las ofensas y la entrega total a Dios. Pedimos morir a lo que nos separa de él.',
    ],
  },
];

// ---------------------------------------------------------------------------
// Misterios gloriosos (miércoles y domingo)
// ---------------------------------------------------------------------------

const GLORIOSOS: Mystery[] = [
  {
    key: 'glorioso-1',
    ordinal: 'Primer misterio glorioso',
    title: 'La Resurrección del Señor',
    fruit: 'La fe',
    citation: 'Lucas 24, 1-8',
    gospel: [
      'El primer día de la semana, muy de mañana, fueron al sepulcro llevando los aromas que habían preparado. Encontraron que la piedra había sido retirada del sepulcro, y entraron, pero no hallaron el cuerpo del Señor Jesús.',
      'No sabían qué pensar de esto, cuando se presentaron ante ellas dos hombres con vestidos resplandecientes. Como ellas temiesen e inclinasen el rostro a tierra, les dijeron: "¿Por qué buscan entre los muertos al que vive? No está aquí, ha resucitado. Recuerden cómo les habló cuando estaba todavía en Galilea, diciendo: es necesario que el Hijo del hombre sea entregado en manos de pecadores, sea crucificado y al tercer día resucite".',
      'Y ellas recordaron sus palabras.',
    ],
    meditation: [
      'La Resurrección es el centro de la fe cristiana: "si Cristo no resucitó, vana es nuestra fe" (1 Cor 15, 14). No es una idea ni un símbolo: el sepulcro quedó vacío y el Viviente se dejó ver, tocar y comer con los suyos.',
      'Las primeras testigos son mujeres que fueron a ungir un cadáver y volvieron corriendo a anunciar al Resucitado. La pregunta del ángel sigue viva: ¿por qué buscar entre los muertos al que vive?',
      'Fruto tradicional: la fe. Pedimos una fe pascual, que no se quede mirando el sepulcro.',
    ],
  },
  {
    key: 'glorioso-2',
    ordinal: 'Segundo misterio glorioso',
    title: 'La Ascensión del Señor al cielo',
    fruit: 'La esperanza del cielo',
    citation: 'Marcos 16, 15-20',
    gospel: [
      'Jesús les dijo: "Vayan por todo el mundo y proclamen la Buena Nueva a toda la creación. El que crea y sea bautizado, se salvará; el que no crea, se condenará. Estas son las señales que acompañarán a los que crean: en mi nombre expulsarán demonios, hablarán en lenguas nuevas, tomarán serpientes en sus manos y, aunque beban veneno, no les hará daño; impondrán las manos sobre los enfermos y se pondrán bien".',
      'Con esto, el Señor Jesús, después de hablarles, fue elevado al cielo y se sentó a la diestra de Dios. Ellos salieron a predicar por todas partes, colaborando el Señor con ellos y confirmando la Palabra con las señales que la acompañaban.',
    ],
    meditation: [
      'La Ascensión no es una despedida sino un cambio de presencia: Cristo sube con nuestra humanidad y la sienta a la derecha del Padre. Donde él está, estamos llamados a estar; "voy a prepararles un lugar" (Jn 14, 2).',
      'Y a los suyos no los deja mirando al cielo: los envía. La esperanza cristiana no paraliza; pone en misión.',
      'Fruto tradicional: la esperanza y el deseo del cielo. Pedimos vivir con la mirada puesta donde está nuestro tesoro.',
    ],
  },
  {
    key: 'glorioso-3',
    ordinal: 'Tercer misterio glorioso',
    title: 'La venida del Espíritu Santo',
    fruit: 'El amor de Dios en nosotros',
    citation: 'Hechos 2, 1-4',
    gospel: [
      'Al llegar el día de Pentecostés, estaban todos reunidos en un mismo lugar. De repente vino del cielo un ruido como el de una ráfaga de viento impetuoso, que llenó toda la casa en la que se encontraban. Se les aparecieron unas lenguas como de fuego que se repartieron y se posaron sobre cada uno de ellos.',
      'Quedaron todos llenos del Espíritu Santo y se pusieron a hablar en otras lenguas, según el Espíritu les concedía expresarse.',
    ],
    meditation: [
      'Cincuenta días después de Pascua, el Espíritu prometido irrumpe con viento y fuego, y de un puñado de hombres encerrados por miedo nace la Iglesia misionera. Pedro, que negó tres veces, predica y tres mil se bautizan.',
      'María estaba allí, en medio de ellos, perseverando en la oración (Hch 1, 14). Como en la Anunciación, donde está María y desciende el Espíritu, Cristo toma cuerpo — ahora en la Iglesia.',
      'Fruto tradicional: el amor de Dios derramado en nosotros y los dones del Espíritu. Pedimos docilidad al fuego.',
    ],
  },
  {
    key: 'glorioso-4',
    ordinal: 'Cuarto misterio glorioso',
    title: 'La Asunción de María al cielo',
    fruit: 'La gracia de una buena muerte',
    citation: 'Lucas 1, 46-55',
    gospel: [
      'Y dijo María: "Engrandece mi alma al Señor y mi espíritu se alegra en Dios, mi Salvador, porque ha puesto los ojos en la humildad de su esclava; por eso, desde ahora todas las generaciones me llamarán bienaventurada, porque ha hecho en mi favor maravillas el Poderoso; santo es su nombre, y su misericordia alcanza de generación en generación a los que lo temen".',
      '"Desplegó la fuerza de su brazo, dispersó a los que son soberbios en su propio corazón. Derribó a los potentados de sus tronos y exaltó a los humildes. A los hambrientos colmó de bienes y despidió a los ricos sin nada. Acogió a Israel, su siervo, acordándose de su misericordia — como había anunciado a nuestros padres — en favor de Abraham y de su descendencia por siempre".',
    ],
    meditation: [
      'La Iglesia cree que "la Inmaculada Madre de Dios, siempre Virgen María, terminado el curso de su vida terrena, fue asunta en cuerpo y alma a la gloria celestial" (Pío XII, Munificentissimus Deus, 1950). En ella se cumple del todo lo que cantó en el Magníficat: Dios exalta a los humildes.',
      'María asunta es la primicia de nuestro destino: lo que Dios hizo en ella, quiere hacerlo en todo su Cuerpo. Por eso este misterio consuela ante la muerte.',
      'Fruto tradicional: la gracia de una buena muerte y la verdadera devoción a María. Pedimos morir en amistad con Dios, de la mano de nuestra Madre.',
    ],
  },
  {
    key: 'glorioso-5',
    ordinal: 'Quinto misterio glorioso',
    title: 'La coronación de María como Reina de todo lo creado',
    fruit: 'La perseverancia final',
    citation: 'Apocalipsis 12, 1',
    gospel: [
      'Una gran señal apareció en el cielo: una Mujer vestida del sol, con la luna bajo sus pies, y una corona de doce estrellas sobre su cabeza.',
    ],
    meditation: [
      'Asunta al cielo, María es coronada por la Trinidad como Reina y Señora de todo lo creado. Su realeza no es de poder sino de gracia: reina como Madre, sirviendo e intercediendo (Lumen Gentium, 59).',
      'La Mujer del Apocalipsis, vestida de sol, es figura de María y de la Iglesia: en medio del combate contra el dragón, la victoria ya está dada.',
      'Fruto tradicional: la perseverancia final y la confianza en María Reina. Pedimos serle fieles hasta el último Ave María de la vida.',
    ],
  },
];

export const MYSTERY_SETS: Record<MysterySetKey, MysterySet> = {
  gozosos: {
    key: 'gozosos',
    name: 'Misterios gozosos',
    daysLabel: 'Lunes y sábado',
    mysteries: GOZOSOS,
  },
  luminosos: {
    key: 'luminosos',
    name: 'Misterios luminosos',
    daysLabel: 'Jueves',
    mysteries: LUMINOSOS,
  },
  dolorosos: {
    key: 'dolorosos',
    name: 'Misterios dolorosos',
    daysLabel: 'Martes y viernes',
    mysteries: DOLOROSOS,
  },
  gloriosos: {
    key: 'gloriosos',
    name: 'Misterios gloriosos',
    daysLabel: 'Miércoles y domingo',
    mysteries: GLORIOSOS,
  },
};

/** Traditional weekday assignment (0 = Sunday, as Date#getDay). */
export function mysterySetForWeekday(weekday: number): MysterySetKey {
  switch (weekday) {
    case 1:
    case 6: {
      return 'gozosos';
    }
    case 2:
    case 5: {
      return 'dolorosos';
    }
    case 4: {
      return 'luminosos';
    }
    default: {
      return 'gloriosos';
    }
  }
}

// ---------------------------------------------------------------------------
// Letanías lauretanas (con las invocaciones añadidas por Francisco en 2020)
// ---------------------------------------------------------------------------

const LITANY_INTRO: PrayerBlock[] = [
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
      { call: 'Dios, Padre celestial', response: 'ten piedad de nosotros.' },
      { call: 'Dios Hijo, Redentor del mundo', response: 'ten piedad de nosotros.' },
      { call: 'Dios Espíritu Santo', response: 'ten piedad de nosotros.' },
      { call: 'Santísima Trinidad, un solo Dios', response: 'ten piedad de nosotros.' },
    ],
  },
];

const LITANY_MARIAN_CALLS: string[] = [
  'Santa María',
  'Santa Madre de Dios',
  'Santa Virgen de las vírgenes',
  'Madre de Cristo',
  'Madre de la Iglesia',
  'Madre de la misericordia',
  'Madre de la divina gracia',
  'Madre de la esperanza',
  'Madre purísima',
  'Madre castísima',
  'Madre siempre virgen',
  'Madre inmaculada',
  'Madre amable',
  'Madre admirable',
  'Madre del buen consejo',
  'Madre del Creador',
  'Madre del Salvador',
  'Virgen prudentísima',
  'Virgen digna de veneración',
  'Virgen digna de alabanza',
  'Virgen poderosa',
  'Virgen clemente',
  'Virgen fiel',
  'Espejo de justicia',
  'Trono de la sabiduría',
  'Causa de nuestra alegría',
  'Vaso espiritual',
  'Vaso digno de honor',
  'Vaso insigne de devoción',
  'Rosa mística',
  'Torre de David',
  'Torre de marfil',
  'Casa de oro',
  'Arca de la Alianza',
  'Puerta del cielo',
  'Estrella de la mañana',
  'Salud de los enfermos',
  'Refugio de los pecadores',
  'Consuelo de los migrantes',
  'Consoladora de los afligidos',
  'Auxilio de los cristianos',
  'Reina de los ángeles',
  'Reina de los patriarcas',
  'Reina de los profetas',
  'Reina de los apóstoles',
  'Reina de los mártires',
  'Reina de los confesores',
  'Reina de las vírgenes',
  'Reina de todos los santos',
  'Reina concebida sin pecado original',
  'Reina asunta a los cielos',
  'Reina del Santísimo Rosario',
  'Reina de la familia',
  'Reina de la paz',
];

const LITANY_CLOSE: PrayerBlock[] = [
  {
    kind: 'litany',
    items: [
      {
        call: 'Cordero de Dios, que quitas el pecado del mundo',
        response: 'perdónanos, Señor.',
      },
      {
        call: 'Cordero de Dios, que quitas el pecado del mundo',
        response: 'escúchanos, Señor.',
      },
      {
        call: 'Cordero de Dios, que quitas el pecado del mundo',
        response: 'ten piedad de nosotros.',
      },
    ],
  },
  {
    kind: 'versicle',
    call: 'Ruega por nosotros, Santa Madre de Dios.',
    response: 'Para que seamos dignos de alcanzar las promesas de Nuestro Señor Jesucristo.',
  },
];

// ---------------------------------------------------------------------------
// Fixed prayers
// ---------------------------------------------------------------------------

const CREDO: string[] = [
  'Creo en Dios, Padre todopoderoso, Creador del cielo y de la tierra.',
  'Creo en Jesucristo, su único Hijo, nuestro Señor, que fue concebido por obra y gracia del Espíritu Santo, nació de Santa María Virgen, padeció bajo el poder de Poncio Pilato, fue crucificado, muerto y sepultado, descendió a los infiernos, al tercer día resucitó de entre los muertos, subió a los cielos y está sentado a la derecha de Dios, Padre todopoderoso. Desde allí ha de venir a juzgar a vivos y muertos.',
  'Creo en el Espíritu Santo, la santa Iglesia católica, la comunión de los santos, el perdón de los pecados, la resurrección de la carne y la vida eterna. Amén.',
];

const SALVE: string[] = [
  'Dios te salve, Reina y Madre de misericordia, vida, dulzura y esperanza nuestra; Dios te salve. A ti clamamos los desterrados hijos de Eva; a ti suspiramos, gimiendo y llorando, en este valle de lágrimas.',
  'Ea, pues, Señora, abogada nuestra: vuelve a nosotros esos tus ojos misericordiosos; y después de este destierro, muéstranos a Jesús, fruto bendito de tu vientre. ¡Oh clementísima, oh piadosa, oh dulce Virgen María!',
];

const BAJO_TU_AMPARO: string[] = [
  'Bajo tu amparo nos acogemos, Santa Madre de Dios; no desprecies las súplicas que te dirigimos en nuestras necesidades; antes bien, líbranos de todo peligro, oh Virgen gloriosa y bendita.',
];

const ORACION_FINAL: string[] = [
  'Oh Dios, cuyo Hijo unigénito nos alcanzó con su vida, muerte y resurrección el premio de la salvación eterna: concédenos, te rogamos, que meditando estos misterios del Santísimo Rosario de la Bienaventurada Virgen María, imitemos lo que contienen y consigamos lo que prometen. Por el mismo Jesucristo, nuestro Señor. Amén.',
];

const ACTO_CONTRICION: string[] = [
  'Señor mío Jesucristo, Dios y hombre verdadero, Creador, Padre y Redentor mío. Por ser tú quien eres, bondad infinita, y porque te amo sobre todas las cosas, me pesa de todo corazón haberte ofendido.',
  'También me pesa porque puedes castigarme con las penas del infierno. Ayudado de tu divina gracia, propongo firmemente nunca más pecar, confesarme y cumplir la penitencia que me fuera impuesta. Amén.',
];

function paragraphs(texts: string[]): PrayerBlock[] {
  return texts.map((text) => ({ kind: 'paragraph', text }));
}

// ---------------------------------------------------------------------------
// The guided sequence
// ---------------------------------------------------------------------------

export const ROSARY_SECTIONS: RosarySection[] = [
  { key: 'inicio', title: 'Oraciones iniciales', short: 'Inicio' },
  { key: 'misterio-1', title: 'Primer misterio', short: '1' },
  { key: 'misterio-2', title: 'Segundo misterio', short: '2' },
  { key: 'misterio-3', title: 'Tercer misterio', short: '3' },
  { key: 'misterio-4', title: 'Cuarto misterio', short: '4' },
  { key: 'misterio-5', title: 'Quinto misterio', short: '5' },
  { key: 'letanias', title: 'Letanías', short: 'Letanías' },
  { key: 'final', title: 'Oraciones finales', short: 'Final' },
];

const AVE_ORDINALS = [
  'Primera',
  'Segunda',
  'Tercera',
  'Cuarta',
  'Quinta',
  'Sexta',
  'Séptima',
  'Octava',
  'Novena',
  'Décima',
] as const;

function decadeSteps(mystery: Mystery, position: number): RosaryStep[] {
  const sectionKey = `misterio-${position}`;

  const steps: RosaryStep[] = [
    {
      key: `${mystery.key}-intro`,
      sectionKey,
      title: mystery.title,
      subtitle: mystery.ordinal,
      mystery,
      blocks: [],
    },
    {
      key: `${mystery.key}-padre-nuestro`,
      sectionKey,
      title: 'Padre Nuestro',
      subtitle: mystery.ordinal,
      bead: { index: 0, count: 10 },
      blocks: paragraphs(PADRE_NUESTRO),
    },
  ];

  for (let ave = 1; ave <= 10; ave += 1) {
    steps.push({
      key: `${mystery.key}-ave-${ave}`,
      sectionKey,
      title: 'Ave María',
      subtitle: `${AVE_ORDINALS[ave - 1]} de diez`,
      bead: { index: ave, count: 10 },
      blocks: paragraphs(AVE_MARIA),
    });
  }

  steps.push({
    key: `${mystery.key}-gloria`,
    sectionKey,
    title: 'Gloria y jaculatorias',
    subtitle: mystery.ordinal,
    blocks: [
      { kind: 'paragraph', text: GLORIA },
      { kind: 'paragraph', text: JACULATORIA_MARIA },
      { kind: 'note', text: 'Oración de Fátima' },
      { kind: 'paragraph', text: ORACION_FATIMA },
    ],
  });

  return steps;
}

export function getRosarySteps(weekday: number): {
  set: MysterySet;
  steps: RosaryStep[];
} {
  const set = MYSTERY_SETS[mysterySetForWeekday(weekday)];

  const steps: RosaryStep[] = [
    {
      key: 'senal-de-la-cruz',
      sectionKey: 'inicio',
      title: 'Por la señal de la Santa Cruz',
      blocks: [
        {
          kind: 'paragraph',
          text: 'Por la señal de la Santa Cruz, de nuestros enemigos líbranos, Señor, Dios nuestro. En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén.',
        },
      ],
    },
    {
      key: 'acto-de-contricion',
      sectionKey: 'inicio',
      title: 'Acto de contrición',
      blocks: paragraphs(ACTO_CONTRICION),
    },
    {
      key: 'invocacion',
      sectionKey: 'inicio',
      title: 'Invocación inicial',
      blocks: [
        {
          kind: 'versicle',
          call: 'Señor, ábreme los labios.',
          response: 'Y mi boca proclamará tu alabanza.',
        },
        {
          kind: 'versicle',
          call: 'Dios mío, ven en mi auxilio.',
          response: 'Señor, date prisa en socorrerme.',
        },
        { kind: 'paragraph', text: GLORIA },
      ],
    },
    {
      key: 'credo',
      sectionKey: 'inicio',
      title: 'Credo',
      subtitle: 'Símbolo de los Apóstoles',
      blocks: paragraphs(CREDO),
    },
    {
      key: 'padre-nuestro-inicial',
      sectionKey: 'inicio',
      title: 'Padre Nuestro',
      blocks: paragraphs(PADRE_NUESTRO),
    },
    {
      key: 'tres-ave-marias',
      sectionKey: 'inicio',
      title: 'Tres Ave Marías',
      subtitle: 'Por la fe, la esperanza y la caridad',
      blocks: [
        {
          kind: 'note',
          text: 'Reza tres Ave Marías, pidiendo el aumento de la fe, la esperanza y la caridad.',
        },
        ...paragraphs(AVE_MARIA),
        { kind: 'paragraph', text: GLORIA },
      ],
    },
    ...set.mysteries.flatMap((mystery, index) => decadeSteps(mystery, index + 1)),
    {
      key: 'letanias',
      sectionKey: 'letanias',
      title: 'Letanías lauretanas',
      subtitle: 'A la Santísima Virgen María',
      blocks: [
        ...LITANY_INTRO,
        {
          kind: 'litany',
          items: LITANY_MARIAN_CALLS.map((call) => ({ call, response: 'ruega por nosotros.' })),
        },
        ...LITANY_CLOSE,
      ],
    },
    {
      key: 'bajo-tu-amparo',
      sectionKey: 'final',
      title: 'Bajo tu amparo',
      blocks: paragraphs(BAJO_TU_AMPARO),
    },
    {
      key: 'salve',
      sectionKey: 'final',
      title: 'La Salve',
      blocks: paragraphs(SALVE),
    },
    {
      key: 'oracion-final',
      sectionKey: 'final',
      title: 'Oración final',
      blocks: [
        ...paragraphs(ORACION_FINAL),
        {
          kind: 'versicle',
          call: 'Ave María Purísima.',
          response: 'Sin pecado concebida.',
        },
        {
          kind: 'paragraph',
          text: 'En el nombre del Padre, y del Hijo, y del Espíritu Santo. Amén.',
        },
      ],
    },
  ];

  return { set, steps };
}
