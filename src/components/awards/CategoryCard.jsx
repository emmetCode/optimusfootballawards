import { useState } from 'react';

const EDITORIAL_COPY = {
  goalkeeper: {
    group: 'Goalkeeping',
    tagline: 'The last line of defence. The first line of greatness.',
    description:
      'An award for the keepers whose reflexes, command of the area, distribution and composure shaped a season—and whose decisive interventions stood up when the stakes were highest.',
  },
  'centre-back': {
    group: 'Defence',
    tagline: 'Read the danger. Own the moment.',
    description:
      'For the central defenders who made difficult work look simple: reading danger early, winning duels, commanding the air and starting attacks with calm, purposeful distribution.',
  },
  'full-back': {
    group: 'Defence',
    tagline: 'The touchline is a starting point.',
    description:
      'Recognising left-backs, right-backs and wide defenders who balanced responsibility with ambition—defending one-on-one, supporting the attack and delivering quality from wide areas.',
  },
  'defensive-midfielder': {
    group: 'Midfield',
    tagline: 'The balance behind every breakthrough.',
    description:
      'For the holding midfielders who gave their sides control: recovering possession, protecting the defence, reading transitions and keeping the game moving with intelligent decisions.',
  },
  'central-midfielder': {
    group: 'Midfield',
    tagline: 'The game moves through them.',
    description:
      'Celebrating the central and box-to-box midfielders who connected every phase—setting the tempo, progressing play, competing tirelessly and influencing matches from end to end.',
  },
  'attacking-midfielder': {
    group: 'Midfield',
    tagline: 'The space between the lines belongs to them.',
    description:
      'For the creators who found solutions where none seemed available, combining vision, close control and inventive link-up play to open defences and turn chances into goals.',
  },
  winger: {
    group: 'Attack',
    tagline: 'A spark on the touchline. A threat in the box.',
    description:
      'Recognising wide attackers whose dribbling changed the shape of a match, whose delivery created opportunities and whose goals and movement gave defences no quiet moments.',
  },
  striker: {
    group: 'Attack',
    tagline: 'Every movement carries the promise of a goal.',
    description:
      'For the centre-forwards whose finishing, movement and hold-up play led the attack—measured not only by goals, but by the consistent influence they brought to decisive moments.',
  },
  'breakthrough-team': {
    group: 'Team award',
    tagline: 'A season that changed the conversation.',
    description:
      'Honouring the team whose collective progress made the season memorable: a clear identity, performances beyond expectation and a campaign that captured the attention of the game.',
  },
  coach: {
    group: 'Coaching',
    tagline: 'A vision made visible on the pitch.',
    description:
      'Recognising the coach whose ideas, preparation and leadership shaped a defining campaign—building a team with purpose and adapting when the season demanded something more.',
  },
};

const CATEGORY_IMAGES = {
  goalkeeper: {
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bc/2006_FIFA_World_Cup_-_Italy_-_Buffon%2C_Materazzi_and_Perrotta.jpg/960px-2006_FIFA_World_Cup_-_Italy_-_Buffon%2C_Materazzi_and_Perrotta.jpg',
    srcSet:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bc/2006_FIFA_World_Cup_-_Italy_-_Buffon%2C_Materazzi_and_Perrotta.jpg/500px-2006_FIFA_World_Cup_-_Italy_-_Buffon%2C_Materazzi_and_Perrotta.jpg 500w, https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bc/2006_FIFA_World_Cup_-_Italy_-_Buffon%2C_Materazzi_and_Perrotta.jpg/960px-2006_FIFA_World_Cup_-_Italy_-_Buffon%2C_Materazzi_and_Perrotta.jpg 960w',
    alt: 'Gianluigi Buffon with Italy at the 2006 FIFA World Cup',
    credit: 'Olaf Nordwich',
    license: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:2006_FIFA_World_Cup_-_Italy_-_Buffon,_Materazzi_and_Perrotta.jpg',
  },
  'centre-back': {
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/50/Fabio_Cannavaro_in_world_cup_2006.jpg/500px-Fabio_Cannavaro_in_world_cup_2006.jpg',
    srcSet:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/50/Fabio_Cannavaro_in_world_cup_2006.jpg/250px-Fabio_Cannavaro_in_world_cup_2006.jpg 250w, https://thumb.wikimedia.org/wikipedia/commons/thumb/5/50/Fabio_Cannavaro_in_world_cup_2006.jpg/500px-Fabio_Cannavaro_in_world_cup_2006.jpg 500w',
    alt: 'Fabio Cannavaro in Italy’s blue kit at the 2006 World Cup',
    position: 'center 2%',
    credit: 'David Ruddell',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Fabio_Cannavaro_in_world_cup_2006.jpg',
  },
  'full-back': {
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fe/Football_against_poverty_2014_-_Paolo_Maldini.jpg/500px-Football_against_poverty_2014_-_Paolo_Maldini.jpg',
    srcSet:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fe/Football_against_poverty_2014_-_Paolo_Maldini.jpg/250px-Football_against_poverty_2014_-_Paolo_Maldini.jpg 250w, https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fe/Football_against_poverty_2014_-_Paolo_Maldini.jpg/500px-Football_against_poverty_2014_-_Paolo_Maldini.jpg 500w',
    alt: 'Paolo Maldini playing in the Football Against Poverty match',
    position: 'center 5%',
    credit: 'Ludovic Péron',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Football_against_poverty_2014_-_Paolo_Maldini.jpg',
  },
  'defensive-midfielder': {
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cb/S._Busquets_%282009-05%29.jpg/500px-S._Busquets_%282009-05%29.jpg',
    srcSet:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cb/S._Busquets_%282009-05%29.jpg/500px-S._Busquets_%282009-05%29.jpg 500w, https://upload.wikimedia.org/wikipedia/commons/c/cb/S._Busquets_%282009-05%29.jpg 800w',
    alt: 'Sergio Busquets playing for FC Barcelona',
    credit: 'alextremps',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:S._Busquets_(2009-05).jpg',
  },
  'attacking-midfielder': {
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bb/Mesut_%C3%96zil%2C_Germany_national_football_team_%2802%29.jpg/960px-Mesut_%C3%96zil%2C_Germany_national_football_team_%2802%29.jpg',
    srcSet:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bb/Mesut_%C3%96zil%2C_Germany_national_football_team_%2802%29.jpg/500px-Mesut_%C3%96zil%2C_Germany_national_football_team_%2802%29.jpg 500w, https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bb/Mesut_%C3%96zil%2C_Germany_national_football_team_%2802%29.jpg/960px-Mesut_%C3%96zil%2C_Germany_national_football_team_%2802%29.jpg 960w',
    alt: 'Mesut Özil representing Germany',
    credit: 'Steindy',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Mesut_%C3%96zil,_Germany_national_football_team_(02).jpg',
  },
  'central-midfielder': {
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c1/Toni_Kroos%2C_Germany_national_football_team_%2801%29.jpg/960px-Toni_Kroos%2C_Germany_national_football_team_%2801%29.jpg',
    srcSet:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c1/Toni_Kroos%2C_Germany_national_football_team_%2801%29.jpg/500px-Toni_Kroos%2C_Germany_national_football_team_%2801%29.jpg 500w, https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c1/Toni_Kroos%2C_Germany_national_football_team_%2801%29.jpg/960px-Toni_Kroos%2C_Germany_national_football_team_%2801%29.jpg 960w',
    alt: 'Toni Kroos in the Germany national football team',
    credit: 'Steindy',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Toni_Kroos,_Germany_national_football_team_(01).jpg',
  },
  winger: {
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/44/Henry_in_world_cup_final_2006.jpg/960px-Henry_in_world_cup_final_2006.jpg',
    srcSet:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/44/Henry_in_world_cup_final_2006.jpg/500px-Henry_in_world_cup_final_2006.jpg 500w, https://thumb.wikimedia.org/wikipedia/commons/thumb/4/44/Henry_in_world_cup_final_2006.jpg/960px-Henry_in_world_cup_final_2006.jpg 960w',
    alt: 'Thierry Henry in France’s white kit during the 2006 World Cup final',
    position: 'center 55%',
    credit: 'David Ruddell',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Henry_in_world_cup_final_2006.jpg',
  },
  'breakthrough-team': {
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/LCFC_lift_the_Premier_League_Trophy_%2826943755296%29_%28cropped%29.jpg/960px-LCFC_lift_the_Premier_League_Trophy_%2826943755296%29_%28cropped%29.jpg',
    srcSet:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/LCFC_lift_the_Premier_League_Trophy_%2826943755296%29_%28cropped%29.jpg/500px-LCFC_lift_the_Premier_League_Trophy_%2826943755296%29_%28cropped%29.jpg 500w, https://thumb.wikimedia.org/wikipedia/commons/thumb/1/13/LCFC_lift_the_Premier_League_Trophy_%2826943755296%29_%28cropped%29.jpg/960px-LCFC_lift_the_Premier_League_Trophy_%2826943755296%29_%28cropped%29.jpg 960w',
    alt: 'Leicester City celebrate winning the Premier League title in 2016',
    position: 'center 45%',
    credit: 'Dudek1337',
    license: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:LCFC_lift_the_Premier_League_Trophy_(26943755296)_(cropped).jpg',
  },
  striker: {
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/11/Ronaldo_2002_cropped2.jpg/500px-Ronaldo_2002_cropped2.jpg',
    srcSet:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/11/Ronaldo_2002_cropped2.jpg/500px-Ronaldo_2002_cropped2.jpg 500w',
    alt: 'Ronaldo Nazário wearing a Brazil shirt before the 2002 World Cup final',
    position: 'center 28%',
    credit: 'User:blackcat; crop uploaded by Im Fokus',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ronaldo_2002_cropped2.jpg',
  },
  coach: {
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f2/Alex_Ferguson_02.jpg/500px-Alex_Ferguson_02.jpg',
    srcSet:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f2/Alex_Ferguson_02.jpg/500px-Alex_Ferguson_02.jpg 500w',
    alt: 'Sir Alex Ferguson, Manchester United manager',
    credit: 'Mattbr; crop by David Levy',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Alex_Ferguson_02.jpg',
  },
};

export default function CategoryCard({ category }) {
  const [imageFailed, setImageFailed] = useState(false);
  const editorial = EDITORIAL_COPY[category.slug];
  const image = CATEGORY_IMAGES[category.slug];
  const group = editorial?.group ?? 'Season award';
  const tagline = editorial?.tagline ?? 'Excellence, recognised.';
  const description =
    editorial?.description ??
    `Recognising an outstanding ${category.winnerType} season in ${category.shortName}, and the performances, judgement and influence that made it exceptional.`;

  return (
    <article className="award-editorial-row">
      <div className="award-editorial-row__copy">
        <p className="award-editorial-row__eyebrow">The Optimus Awards <span>/</span> {group}</p>
        <h2 className="award-editorial-row__title">{category.name}</h2>
        <p className="award-editorial-row__tagline">{tagline}</p>
        <p className="award-editorial-row__description">{description}</p>
      </div>
      <figure className="award-editorial-row__figure">
        <div className="award-editorial-row__image">
          {image && !imageFailed ? (
            <img
              src={image.src}
              srcSet={image.srcSet}
              sizes="(max-width: 620px) calc(100vw - 2rem), (max-width: 820px) 42vw, 36rem"
              alt={image.alt}
              style={{ objectPosition: image.position ?? 'center' }}
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div
              className="award-editorial-row__placeholder"
              role="img"
              aria-label={`Historical football photograph for ${category.shortName}; image not yet supplied`}
            >
              <span>Photograph to be supplied</span>
            </div>
          )}
        </div>
        {image && !imageFailed && (
          <figcaption>
            {image.credit} ·{' '}
            <a href={image.licenseUrl} target="_blank" rel="noreferrer">
              {image.license}
            </a>{' '}
            <a href={image.sourceUrl} target="_blank" rel="noreferrer">
              Source
            </a>
          </figcaption>
        )}
      </figure>
    </article>
  );
}
