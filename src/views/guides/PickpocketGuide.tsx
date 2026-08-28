import ExplvMap from '../../components/ExplvMap';
import { LinkPreview } from '../../components/LinkPreview';
import { colors } from '../../theme';
import { Faq } from './Faq';
import { GuideButtons } from './GuideButton';
import { guides } from './guidesCatalog';
import GuideShell from './GuideShell';
import { gs } from './guideTheme';
import { useGuideMeta } from './useGuideMeta';
import { Tooltip } from 'react-tooltip';


const faqs = [
  {
    q: 'Is pickpocketing Ardougne Knights a good way to train OSRS Thieving?',
    a: "Yes. Knights of Ardougne give solid Thieving XP per successful pickpocket for their level, and when one is being splashed it barely moves, so it's close to AFK-able. It is not the best XP rate in the game, but it is very close and as afk as you can get (with the proper setup).",
  },
  {
    q: "What's the difference between a normal knight and a sticky knight?",
    a: 'The normal knight is able to freely walk in and out of the bank, since it has pathing there. The Sticky knight, on the other hand, has to be pushed outside of its wander range to get inside the bank. This causes them to never path outside the bank, making it move a lot less and more AFK for the people pickpocketing.',
  },
  {
    q: "Why aren't Paladins splashed too?",
    a: "This is mostly because Paladins have a lower pickpocket success chance. So much so that it's always better to just keep pickpocketing Knights of Ardougne.",
  },
  {
    q: 'What level and gear do I need for ardy knight thieving?',
    a: 'A thieving level of 55 is needed to start pickpocketing a Knight of Ardougne, but it\'s recommended to do wealthy citizens to around level 70-75, as you get hit a lot at level 55. No special gear is required, though there are a few things you can do to improve your XP/GP per hour (See: recommended setup)',
  },
];

const mapPositions = [
  {x:2661, y: 3306},
  {x:2661, y: 3306},
  {x:2654, y: 3306},
  {x:2653, y: 3305},
  {x:2648, y: 3305},
  {x:2648, y: 3304},
  {x:2647, y: 3303},
  {x:2645, y: 3303},
  {x:2644, y: 3302},
  {x:2644, y: 3296},
  {x:2645, y: 3296},
  {x:2645, y: 3290},
  {x:2644, y: 3289},
  {x:2644, y: 3284},
  {x:2653, y: 3284}
];
const tooltip = {
  wiki: {
    plagueCity: (
      <LinkPreview href="https://oldschool.runescape.wiki/w/Plague_City" style={gs.a}>
        the quest
      </LinkPreview>
    ),
    shadowVeil: (
      <LinkPreview href="https://oldschool.runescape.wiki/w/Shadow_Veil" style={gs.a}>
        a spell
      </LinkPreview>
    ),
    ardyKnight: (
      <LinkPreview href="https://oldschool.runescape.wiki/w/Knight_of_Ardougne" style={gs.a}>
        Ardy Knights
      </LinkPreview>
    ),
    ardyDiary: (
      <LinkPreview href='https://oldschool.runescape.wiki/w/Ardougne_Diary#Medium' style={gs.a}>
        Achievement Diary
      </LinkPreview>
    ),
    friendsChat: (
      <LinkPreview href='https://oldschool.runescape.wiki/w/Chat-channel' style={gs.a}>
        friends chats
      </LinkPreview>
    ),
  },
  discord: {
    splashworlds: (
      <LinkPreview href="https://discord.gg/splashworlds" style={gs.a}>
        Splashworlds
      </LinkPreview>
    ),
    thievinghost: (
      <LinkPreview href="https://discord.gg/thievinghost" style={gs.a}>
        Thievinghost
      </LinkPreview>
    )
  },
  rockyDrop: (
    <>
      <Tooltip
        id='rocky-droprate'
        content="which has drop rate of 1/255,863 at 55 Thieving"
        border={`1px solid ${colors.accent}`}
        style={gs.tooltip}
        place={'bottom'}
        opacity={1}
        disableStyleInjection
        portalRoot={document.body}
      />
      <a data-tooltip-id='rocky-droprate'>Rocky</a>
    </>
  ),
  dodgeChance: (
    <>
      <Tooltip
        id='stacked-dodge-chance'
        content="resulting in a 36.25% chance to dodge a stun"
        border={`1px solid ${colors.accent}`}
        style={gs.tooltip}
        place={'bottom'}
        opacity={1}
        disableStyleInjection
        portalRoot={document.body}
      />
      <a data-tooltip-id='stacked-dodge-chance'>stacks</a>
    </>
  ),
  atkBonus: (
    <>
      <Tooltip
        id='atkBonus-tooltip'
        content='-64 Magic attack, or lower to be precise'
        border={`1px solid ${colors.accent}`}
        style={gs.tooltip}
        place={'top'}
        opacity={1}
        disableStyleInjection
        portalRoot={document.body}
      />
      <a data-tooltip-id='atkBonus-tooltip'>Magic Attack Bonus</a>
    </>
  ),
}

export default function PickpocketGuide() {
  useGuideMeta({
    title: 'How to Pickpocket Ardougne Knights for Thieving Training | Ardy Host',
    description: 'A guide to OSRS splash worlds, Knight of Ardougne pickpocketing, and how the two fit together — what you need, why to do it, and how to find a live splash world right now.',
    path: '/guides/pickpocketing',
  });

  return (
    <GuideShell>
      <div style={{ ...gs.container, padding: '2.5rem 0 4rem' }}>
        <a href="/guides" style={gs.back}>&larr; Guides</a>
        <h1 style={gs.heading}>How to Train Thieving, by Pickpocketing Knights of Ardougne</h1>
        <p style={gs.updated}>A guide to OSRS splash worlds, Knight of Ardougne pickpocketing, and how the two fit together.</p>

        <p style={gs.intro}>
          If you've seen people talk about "{tooltip.wiki.ardyKnight}" or have come across a 
          reddit post asking; "What is the current splash world?" and weren't sure what it meant,
          this covers most of it: what splashing is, what makes pickpocketing Ardy knights a great method for
          getting thieving XP, how to find a world and last but not least, how to get the best XP rates. 
        </p>

        <h2 style={gs.h2}>Getting started with pickpocketing Ardy knights</h2>
        <hr style={gs.hr}/>

        <p style={gs.p}>
          So you're looking to get that level you need? Are you an iron looking to get that cash stack going? Or maybe even looking to get {tooltip.rockyDrop}?
          You could just go with the bare minimum and get started right now, maybe check out the recommended equipment, or you can follow the guide on the optimal setup.
        </p>

        <h3 style={gs.h3}>The bare minimum</h3>
        <p style={gs.subtext}>Can't start without these.</p>
        <ul style={gs.ul}>
          <li style={gs.li}><strong>55 Thieving</strong> — the level required to pickpocket a Knight of Ardougne.</li>
          <li style={gs.li}><strong>A splashed knight</strong> — this is the part Ardy Host solves; see below.</li>
          <li style={gs.li}><strong>Finished Plague City</strong> — {tooltip.wiki.plagueCity} reward 'Ardougne Scroll' unlocks the Ardougne Teleport spell.</li>
        </ul>

        <h3 style={gs.h3}>Recommended setup</h3>
        <p style={gs.subtext}>These are optional, so pick the ones that seem useful to you. <br />The first 3 are strongly recommended though.</p>
        <ul style={gs.ul}>
          <li style={gs.li}><strong>Rogues equipment</strong> — the full sets gives a 100% chance to double GP/loot when thieving.</li>
          <li style={gs.li}><strong>Ardougne diary 2</strong> — the {tooltip.wiki.ardyDiary} increases pickpocket succes chance by 10%, and pouch size to 56.</li>
          <li style={gs.li}><strong>Dodgy necklace</strong> — these have a 20% chance to make a stun not block actions, each necklace has 10 uses.</li>
          <li style={gs.li}><strong>Hitpoints Cape</strong> — this makes you regenerate HP faster and makes you use less food.</li>
          <li style={gs.li}><strong>Shadow Veil</strong> — {tooltip.wiki.shadowVeil} that gives 15% chance to dodge stun, which {tooltip.dodgeChance} with dodgy necklaces.</li>
          <li style={gs.li}><strong>Lava battlestaff</strong> — only useful when casting Shadow Veil, allowing you to only use one cosmic rune per cast.</li>
          <li style={gs.li}><strong>Regen bracelet</strong> — regens HP faster, use this bracelet when you prioritize AFK over GP (about 10% less GP).</li>
          {/* <li style={gs.li}><strong></strong> — </li> */}
        </ul>

        <h3 style={gs.h3}>The optimal setup</h3>
        <p style={gs.p}>
          Are you in it for the long haul? Rocky hasn't given you that funny feeling yet? Or maybe you are looking to
          secure a leaderboard spot with the fabled 200m XP? Then head on over to our optimal setup guide.
          Or are you on mobile, just chilling and watching some TV? In that case follow our step-by-step mobile guide.
        </p>

        <GuideButtons guides={[guides.pickpocketSetup[0], guides.pickpocketSetup[1]]} />

        <h3 style={gs.h3}>Getting there</h3>
        <p style={gs.subtext}>Once teleported to Ardougne, follow the map below</p>

        <br />
        
        <ExplvMap
          centre={{ x: 2655, y: 3297, plane: 0 }}  // or regionId={...}
          zoom={8}
          showControls={false}
          showLabels={false}
          height={200}
          width={400}
          rectangles={[{ start: {x:2649, y:3287}, end: {x:2658, y:3280}, fillOpacity: 0.7}]}
          paths={[{ positions: mapPositions, color: '#8b1019', opacity: 1, weight: 5}]}
          description='Where to go from Ardougne Teleport'
        />

        <h2 style={gs.h2}>What "Ardougne Knight splashing" is, and why</h2>
        <hr style={gs.hr}/>
        <p style={gs.p}>
          Having the knights walk about, makes pickpocketing them a more tedious training method than it's worth.
          <br />
          That's where a splasher comes in, they keep the knight aggroed on them by
          having a low enough {tooltip.atkBonus} that they never hit the knight. 
          This method is used to trap the knight in the corner of the south-east Ardougne bank.
          Once a knight is splashed, it won't despawn. Normally, when an NPC has been stuck on the same tile for more
          than 15 minutes, it despawns, but since the splasher keeps it in combat, it doesn't. Aside from this, it also makes the knight move much, much less, 
          allowing you to pickpocket the knight to your hearts content.
        </p>

        <h3 style={gs.h3}>How to find a world</h3>
        
        <p style={gs.p}>
          Splash worlds change regularly — a splasher logs off, maybe they disconnect, or move worlds.
          <br />
          This makes having to find new worlds a somewhat regular occurence. Ardy Host's home page lists who's currently splashing, 
          on which world, refreshed live, so you're not world-hopping blind looking for one.
        </p>
        
        <a href="/" className="guide-cta" style={gs.cta}>See live splash worlds</a>

        <p style={gs.p}>
          There also are {tooltip.wiki.friendsChat}, which have many users in them. There's two ways of finding worlds
          in these. You can either sort the chat by world by clicking the 2nd to last little caret at the top of the chat interface (see the highlighted "friends chat").
          or you can just send a message asking what the world is. You can send messages by starting it with "/".
        </p>

        <p style={gs.p}>
          To join a friends chat click the join button and enter one of the two following highlighted names. These are the two biggest splashing friends chats: {tooltip.discord.splashworlds} and {tooltip.discord.thievinghost}
        </p>

        <h3 style={gs.h3}>Start splashing for others</h3>
        <p style={gs.p}>
          Check out one of our guides on how to start splashing, or set up a solo world.
        </p>

        <GuideButtons guides={[guides.knightSetup[0], guides.knightSetup[1] ]} />

        <h2 style={gs.h2}>Tips & Tricks</h2>
        <hr style={gs.hr}/>

        <p style={gs.p}>Here are some thing that are good to know, but didn't fit in the guide's structure</p>
        <div>
          <p style={gs.faqQ}>The splasher is still setting up</p>
          <p style={gs.p}>
            When a splasher is setting up a world, please stay inside of the bank and tell others to do so too.
            Only start pickpocketing when the knight is in its corner.
          </p>
        </div>

        <div>
          <p style={gs.faqQ}>Mouse Keys</p>
          <p style={gs.p}>
            This is a built-in feature in most operating systems. It lets you control the mouse pointer using the numpad on your keyboard.
            You can use <span style={gs.code}>8/2/6/4</span> to move the mouse <span style={gs.code}>up/down/left/right</span>. The feature
            that is most useful for pickpocketing however, is that you can left click using <span style={gs.code}>5</span> on your numpad.
          </p>
            <ul style={gs.ul}>
              <li style={gs.li}><strong>Windows</strong>: <span style={gs.code}>Left Alt + Left Shift + Num Lock</span></li>
              <li style={gs.li}><strong>MacOS</strong>: <span style={gs.code}>Option + Command + F5</span></li>
              <li style={gs.li}><strong>Linux (gnome)</strong>: No shortcut, enable it with <span style={gs.code}>Settings {">"} Accessibility {">"} Pointing and Clicking {">"} Mouse Keys</span></li>
            </ul>
        </div>

        <div>
          <p style={gs.faqQ}>Pickpocket Helper plugin</p>
          <p style={gs.p}>
            If you're on runelite, there is a plugin called "Pickpocket Helper" on the plugin hub. It helps with keeping
            track of lots of things and sends notification when an action is needed (for example; when to empty coin pouches).
            <br />
            Check it out over at: <a style={gs.a} href="https://runelite.net/plugin-hub/show/pickpocket-helper" target="_blank" rel="noopener noreferrer">Runelite plugin hub</a>
          </p>
        </div>


        <h2 style={gs.h2}>Frequently Asked Questions</h2>
        <hr style={gs.hr}/>

        <Faq faqs={faqs} />
      </div>
    </GuideShell>
  );
}
