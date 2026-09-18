// ../src/game/tuning.ts
var TUNING = {
  // ------------------------------------------------------------------ ocean
  /**
   * A FIXED map, not a pond that rescales around you. See ocean.ts for why.
   *
   * Sized so the world stays bigger than the view at every size a run reaches:
   * at the starting zoom you see roughly a sixth of the depth, and even a very
   * large fish sees about half of it. A map you can see all of is not a map.
   */
  ocean: {
    /**
     * ROUND 12: 30,000 x 15,000 -> 48,000 x 20,000. "The map still isn't wide
     * enough or deep enough especially if it's going to be multiplayer."
     *
     * Right. Forty players sharing a 30k-wide ocean is a crowd, not a world —
     * everybody would be on top of everybody within a minute of spawning, and
     * the whole point of the depth bands is that where you are is a CHOICE.
     * Density is measured per screen, so a bigger ocean costs nothing in
     * entities; it just means the edges are further away.
     */
    width: 64e3,
    /**
     * ROUND 12: 9000 -> 15000. "It's not deep enough."
     *
     * At 9000 the seabed was about sixteen screens below the surface at
     * starting zoom and only five or six once you were large — you could cross
     * the entire ocean vertically in under a minute, which made the abyss feel
     * like a basement rather than a place. The bands below are re-cut at the
     * same time so the dark gets most of the new room: the black is now the
     * bottom third of the world instead of a quarter of it.
     */
    /**
     * ROUND 14: 20,000 -> 32,000. "It could be a ton deeper and a bit wider."
     *
     * The seabed is now a genuine expedition when you are small and a short
     * trip when you are large, which is the right shape: screen-space speed is
     * held roughly constant as you grow, so a big fish covers about three times
     * the world units per second that a fry does. Top to bottom is ~135s at
     * starting size and ~40s once you are a gar.
     */
    depth: 32e3,
    /** Band edges as a fraction of depth. */
    bands: {
      surface: 0.06,
      shallows: 0.16,
      deep: 0.5
    },
    /**
     * Higher = light dies faster with depth. Raised with the new depth so the
     * descent goes properly black rather than merely dim — the falloff is over
     * a fraction of the total, so a deeper ocean with the old curve would have
     * been a LIGHTER one at every real distance from the surface.
     */
    lightFalloff: 2.1,
    /** You can never be blinded completely — the floor on how far you see. */
    minVisibility: 0.34,
    /** Score per bite at the seabed, relative to the surface. The pull down. */
    deepScoreBonus: 3.2,
    /**
     * Breaching. A fish that hits the surface with enough upward speed leaves
     * the water and comes back down on a real arc.
     *
     * This is player-initiated and it is physics, not the game steering for
     * you — you chose to swim up fast. Air time is deliberately short and you
     * keep some horizontal authority, so it never feels like the controls were
     * taken away, which is the line §7 draws.
     */
    breachMinUp: 0.35,
    gravity: 1500,
    airSteer: 320,
    maxAirSeconds: 1.8,
    /** Where a run begins: in the shallows, under the birds, above the dark. */
    startDepth: 0.022,
    /** Mass you must exceed for a bird to merely hurt you rather than kill you. */
    birdSurvivalMass: 60,
    /**
     * Breaching into a bird kills it. You have to be big enough that hitting
     * one is plausible, and the score is worth the risk of being out of the
     * water with no control over where you land.
     */
    /**
     * Bird patrol height above the waterline. Chosen so a fish of
     * `breachKillMass` swimming straight up at full boost can just reach one:
     * apex is v^2/2g, and at mass 45 that is a little under 400.
     */
    birdAirHeight: 330,
    breachKillMass: 45,
    breachKillScore: 9,
    /**
     * Fraction of your mass a bird takes when it does not kill you.
     *
     * Was 0.28. `npm run economy` put a number on what that meant: at mass
     * 2,500 birds were taking 2.6% of the body per second — nine times the
     * decay, twice the boost, and more than everything the fish could eat.
     * Birds were quietly the largest mass sink in the game, and the only
     * counterplay was to stay off the surface, which is where the food is.
     */
    birdBite: 0.1,
    /**
     * Past this multiple of a bird's mass, a diving bird is FOOD.
     *
     * Anthony: "you should be able to get points when you kill a bird." The
     * breach kill already paid, but it needs you airborne and it was the only
     * answer the game had — everywhere else a bird was a tax with no reply.
     * Now the food chain simply continues above them: small fish die to birds,
     * middling fish lose a mouthful, and a big enough fish eats the thing that
     * has been eating it. It has to commit to the dive to be catchable, so it
     * is a timing window rather than a gift.
     */
    birdEdibleRatio: 1.08,
    /** Score multiple for eating a diving bird. The breach kill pays more. */
    birdKillScore: 6
  },
  // ---------------------------------------------------------------- player
  player: {
    startMass: 10,
    /** r = radiusK * sqrt(M) */
    radiusK: 4.2,
    /**
     * speed = baseSpeed * (viewHeight / viewHeightAtStart)^speedViewComp / M^speedMassExp
     *
     * The spec's rule is `baseSpeed / M^0.15` — bigger is slower. That rule is
     * about FEEL, and feel is measured on screen, not in world units. Because
     * the camera also pulls back as you grow (see camera.viewMassExp), the raw
     * rule compounds into a tier-7 fish that crawls across the frame at
     * M^-0.5 of its tier-1 screen speed, which reads as "steers like a cow" —
     * the exact complaint §3 rule 4 exists to prevent.
     *
     * speedViewComp = 1 cancels the camera's contribution, so screen-space
     * speed falls as M^-speedMassExp exactly as the spec intends, and screen
     * turn radius widens as M^(turnMassExp - speedMassExp). Set it to 0 to get
     * the literal spec formula back and feel the difference on a phone.
     */
    baseSpeed: 235,
    /**
     * PLAYTEST, round 1: "as I got bigger I wasn't able to move well."
     *
     * At 0.15 a tier-7 fish crossed the screen at 46% of its tier-1 speed while
     * the camera showed seven times more water — slow AND empty. Screen speed is
     * now near-constant with size, and everything that makes growing feel heavy
     * lives in the turn radius instead (turnMassExp below). Big should mean
     * hard to turn, never hard to travel.
     */
    speedMassExp: 0.04,
    speedViewComp: 1,
    /**
     * TURN SHAPE. `baseTurn` alone gives a constant turn rate, which is why the
     * fish used to arrive at a heading by snapping onto it and then sitting
     * there — mechanically correct, and completely characterless.
     *
     * The rate is now a curve over how far off the heading is. A big swing gets
     * `turnSwing` (the fish COMMITS — this is what reads as decisiveness), and
     * the last few degrees get `turnSettle` (the fish SETTLES onto the line
     * instead of clicking onto it). They average to roughly 1, so the overall
     * agility is unchanged and only the character of the turn is different.
     *
     * §3 rule 1 is untouched: heading still starts changing on the frame the
     * touch lands. This shapes the RATE, never the RESPONSE.
     */
    turnSwing: 1.45,
    turnSettle: 0.58,
    /** Heading error, in radians, at which the turn is considered a full swing. */
    turnEaseAngle: 0.7,
    turnEaseExp: 0.8,
    /**
     * A hard turn costs speed. Small, but it is what makes the fish feel like it
     * has a body, and it says the same thing the predator rules do: commit to a
     * line and you are fast, thrash about and you are not. It cannot cost an
     * escape, because escaping IS committing to a line.
     */
    turnSpeedLoss: 0.12,
    /**
     * Speed is approached, not assigned. Without this the fish is at full speed
     * on frame one of a run and instantly at full speed out of every collision,
     * which is the single biggest reason it felt weightless.
     *
     * Rates are exponential-approach constants (per second): higher is snappier.
     * Speeding up is deliberately slower than slowing down, so a boost has a
     * shove to it and a stop has a stop to it.
     */
    accelRate: 3.4,
    brakeRate: 6,
    /** Boost engages faster than ordinary acceleration. That is the shove. */
    boostAccelRate: 9,
    /**
     * GROWTH YOU CAN SEE. The drawn radius springs toward the real one, so
     * every bite pushes the body outward instead of moving a square root by a
     * fraction of a pixel. Higher spring = snappier, higher damping = less
     * wobble. `biteShove` is how hard a bite kicks it.
     */
    radiusSpring: 90,
    radiusDamping: 13,
    biteShove: 0.9,
    /** Even a crumb registers; a quarter-sized meal fills the pulse. */
    bitePulseFloor: 0.28,
    bitePulseGain: 3.2,
    /** turnRate = baseTurn / M^turnMassExp, radians/sec. Phase-1 knob #1. */
    baseTurn: 9.2,
    /**
     * Screen turn radius scales as M^(turnMassExp - speedMassExp), so this is
     * the whole of the size-to-clumsiness curve now: about a 2x wider carve by
     * tier 7. That is the tension the spec wanted from growth, delivered
     * without taking the player's speed away.
     */
    turnMassExp: 0.17,
    /**
     * BOOST.
     *
     * §3 bans a boost outright, and it is worth being precise about what it was
     * actually banning: a SECOND INPUT. Its reasons were that two simultaneous
     * fingers is hard on touch (Apple's own guidance says design it out) and
     * that a phone in a TikTok in-app browser has nowhere safe to put an
     * on-screen button. Both objections are about the mechanism, not about the
     * idea of going faster.
     *
     * Double-tap-and-hold needs one finger, no button, and no second input
     * surface — and it cannot fire by accident, because holding on its own is
     * just steering. So the spec's reasoning is satisfied and slither's best
     * verb survives.
     *
     * It costs mass continuously, like slither's, so it is a real decision
     * rather than a permanent speed increase.
     */
    boostSpeedMul: 1.85,
    boostTurnMul: 0.72,
    /** Fraction of current mass burned per second while boosting, at start size. */
    boostMassPerSec: 0.085,
    /**
     * Same shape as `decay.massExp`, and for the same measured reason. At 1 —
     * what this was — boosting cost 8.5% of your body every second at every
     * size, which at mass 1,000 is more than twice everything you can eat in
     * that second. Boost was not expensive, it was unaffordable, and the only
     * winning move above mass 400 was never to press it.
     *
     * At 0.6 it still costs about two seconds of income per second of boost at
     * mass 1,000 — a real price, payable.
     */
    boostMassExp: 0.6,
    /** Below this you are too small to burn anything. */
    boostMinMass: 8,
    /** Milliseconds between the first tap and the hold that starts a boost. */
    /**
     * Relative stick, in CSS pixels. `stickRadius` is how far the thumb travels
     * for a full-authority turn before the origin starts sliding with it;
     * `stickDeadzone` is the slop below which a press is not a direction at
     * all. Both are pixel constants on purpose — they are about thumbs, not
     * about the size of the fish or the zoom of the camera.
     */
    stickRadius: 96,
    stickDeadzone: 14,
    /** Desktop only. Multiplies turnRate. Player-adjustable, persisted. */
    sensitivity: 1,
    sensitivityRange: [0.5, 2]
  },
  // ------------------------------------------------------------------ eating
  eat: {
    /** target.M <= M * edibleRatio  → food */
    edibleRatio: 0.92,
    /** other.M >= M * lethalRatio   → threat. Between the two: standoff. */
    lethalRatio: 1.08,
    /**
     * Detection is always biased toward the player. "It swam through a school
     * and ate nothing" destroys trust faster than any difficulty problem.
     */
    mouthRadiusScale: 1.12,
    /** Extra reach inside the forward cone, as a fraction of player radius. */
    coneBonus: 0.5,
    coneHalfAngle: 0.85,
    // radians, ~49deg either side of heading
    /** Predator hitboxes shrink. Their bite has to look like it landed. */
    predatorHitboxScale: 0.86,
    /** Magnet: edible bodies inside this multiple of mouth radius drift in. */
    magnetRange: 2.1,
    magnetPull: 90
    // px/sec at the edge of range, scales up as it closes
  },
  // ------------------------------------------------------------------ growth
  growth: {
    /** dM = target.M * bite * (1 - falloff * min(1, M / nextTierThreshold)) */
    /**
     * PLAYTEST, round 1: "I just kept eating fish." Growth was ~11 bites per
     * tier, so the whole table went past in under a minute and nothing ever
     * felt like a climb. Now ~21 bites per tier, with the falloff biting hard
     * as you approach the threshold so the last stretch of each tier has to be
     * earned rather than coasted.
     */
    /**
     * PLAYTEST: "it's a little too hard to grow now." Raised from 0.5, and the
     * falloff eased, which together take about six seconds off every tier. The
     * feel changes in round 11 cost a little speed and the depth change in
     * round 12 cost a little more; this hands both back.
     */
    bite: 0.62,
    falloff: 0.38,
    /**
     * Ceiling on a single bite, as a fraction of the player's own mass. A
     * player who finds one unusually large meal should not skip a chunk of the
     * tier table for it: a big bite is the best moment in the run, not the end
     * of the progression.
     */
    maxGainRatio: 0.35,
    /**
     * WHY THE CEILING ABOVE HAS TO FALL WITH SIZE.
     *
     * Hunger (see `decay.hungerPerSecond`) makes an enormous fish lose 2.9% of
     * itself a second at mass 60,000 — and an autopilot run still reached
     * 101,927, because growth is not a rate, it is a STEP. One 22,000 body at
     * mass 60,000 is a 35% jump in a single frame, and a continuous drain of a
     * few percent a second cannot out-run a step function. Twenty seconds of
     * starvation, undone in one bite.
     *
     * The gap is density, not ratio. At mass 150, something 92% of your size is
     * a rare event and the biggest moment of the run. In the black, where
     * bodies weigh 3,000 to 22,000, it is most of what swims past. So the cap
     * holds at 0.35 for the whole early and mid game and only starts falling
     * past `gainSoftCapMass` — nothing below 2,500 changes by a single point.
     *
     * At 60,000 the largest possible bite drops from 35% of the fish to 8%,
     * which hunger undoes in under three seconds. That is what makes the
     * plateau a plateau rather than a staircase.
     */
    gainSoftCapMass: 2500,
    gainRatioExp: 0.45,
    /** A meal is always worth something, however big you are. */
    minGainRatio: 0.02
  },
  decay: {
    /**
     * Percentage of CURRENT mass per second, constant forever. Never scaled by
     * score, time, or tier — players read score-gated difficulty as punishment
     * for doing well. A flat absolute cost would stop mattering at scale, which
     * is what happened to Slither.io's boost.
     *
     * Its only job is to make idling unprofitable. It must never be the thing
     * that kills you.
     */
    perSecond: 3e-3,
    /**
     * HOW THE COST GROWS WITH YOU. 1 = strictly proportional (what this was).
     *
     * Playtest: "you lose mass too quickly when you get bigger." Measured with
     * `npm run economy`, which weighs food against every cost at a series of
     * sizes: ABSOLUTE income is roughly flat at five or six mass a second from
     * mass 60 all the way to mass 1,000, because the food you can reach stops
     * getting bigger long before you do. A cost that is proportional to mass
     * therefore grows without limit against an income that does not, and
     * somewhere around mass 400 the ledger goes negative and a fish playing
     * normally starts to shrink.
     *
     * The old comment here argued against a FLAT absolute cost, and it was
     * right: a flat cost stops mattering at scale, which is what happened to
     * Slither.io's boost. The measurement says the opposite failure is the one
     * this game actually had. The answer is neither — cost grows as
     * `mass ^ massExp`, so it keeps rising forever and still falls behind
     * income. At 0.5 a fish of mass 1,000 pays 0.03% a second instead of 0.3%.
     */
    massExp: 0.5,
    /**
     * HUNGER: what it costs to be enormous.
     *
     * The round-19 curve above fixed a real complaint — "you lose mass too
     * quickly when you get bigger" — and in fixing it removed every brake from
     * the top of the game. Measured after a live run reached mass 255,547:
     * decay at that size was **0.00% of body mass per second** while food was
     * coming in at 1.11%, and bites per second were RISING, because everything
     * in the ocean was edible and the magnet hoovered it in. There was no size
     * at which the game pushed back.
     *
     * This is the second term, and it is the agar.io answer: the bigger you
     * are, the more you burn simply staying alive. It is shaped so it is
     * invisible where the round-19 complaint lived and decisive past it —
     * `hungerExp` above 1 means the cost as a FRACTION of body mass rises with
     * size, which is the only thing that can ever stop a runaway.
     *
     * Where it lands is the whole design: growth flattens just above 22,000,
     * which is what the largest body in the black weighs. So the economic
     * ceiling sits inside the last band that still has something in it bigger
     * than you — a giant is never both safe and fed.
     *
     * The old rule still holds: this must never be the thing that KILLS you.
     * It is a plateau, not a spiral. A fish at the ceiling that keeps eating
     * holds its size; one that stops, shrinks, and that is legible.
     */
    hungerPerSecond: 107e-6,
    hungerExp: 1.8
  },
  // ------------------------------------------------------------------- chain
  chain: {
    /**
     * NOTE, flagged for jayo/Anthony: the spec says "+0.15 per bite, cap 5.0x"
     * and also "above 10x chain → FRENZY". Those two can't both be multipliers,
     * since 10x is past the 5.0 cap. Resolved here as: LINKS are the bite count
     * inside the window, MULTIPLIER is 1 + gain*links capped at 5.0, and frenzy
     * fires at frenzyLinks. That keeps "rising pitch per link" literal.
     */
    windowMs: 1400,
    gain: 0.15,
    cap: 5,
    frenzyLinks: 10,
    /** Frenzy holds this long past the last link before it can drop. */
    frenzyGraceMs: 900
  },
  /**
   * NERVE WAS HERE, AND IS GONE.
   *
   * The meter that filled near a lethal fish and let you swallow one bigger
   * than yourself landed 3 times across 31 real player runs, after three
   * rounds of retuning, and was reported as broken or confusing four separate
   * times. Cut rather than tuned a fourth time. The whole block went with it
   * so nothing here reads as a number somebody could turn back on.
   */
  // ------------------------------------------------------------------- tiers
  /**
   * Thresholds are absolute; everything the director spawns is relative to the
   * player's mass, so past tier 7 the world simply rescales forever and a run
   * ends when the player dies, never because content ran out.
   */
  tiers: [
    { name: "fry", mass: 10, predators: false, schools: false, hunt: false, ambush: false },
    { name: "minnow", mass: 25, predators: true, schools: false, hunt: false, ambush: false },
    { name: "bluegill", mass: 60, predators: true, schools: true, hunt: false, ambush: false },
    { name: "bass", mass: 150, predators: true, schools: true, hunt: true, ambush: false },
    { name: "pike", mass: 400, predators: true, schools: true, hunt: true, ambush: false },
    { name: "gar", mass: 1e3, predators: true, schools: true, hunt: true, ambush: true },
    { name: "the pond opens", mass: 2500, predators: true, schools: true, hunt: true, ambush: true }
  ],
  // ------------------------------------------------------------------ camera
  camera: {
    /** Visible world height at start mass, in world units. */
    viewHeightAtStart: 620,
    /**
     * viewHeight = viewHeightAtStart * (M / startMass)^viewMassExp
     * Pulled back from 0.35: the deep end was showing so much water that it
     * read as empty even with the density budget met.
     */
    /**
     * ROUND 16, the art audit's top finding: YOU NEVER SEE YOURSELF GET BIG.
     *
     * Screen size grows as M^(0.5 - viewMassExp), because radius goes as sqrt(M)
     * and the camera pulls back as M^viewMassExp. At 0.3 that is M^0.2 — and
     * measured, 1,800x the mass bought **4.6x the screen size**. Across the part
     * of a run most people actually play, mass 10 to 400, the player goes from
     * 15px to 32px. They barely double.
     *
     * The game is called small fish big pond. Its entire promise is that you
     * grow, and the camera was cancelling the only feedback that promise has.
     *
     * At 0.22 screen size goes as M^0.28: the same mass range now buys 7.3x, and
     * the early game — where "I am getting bigger" matters most — roughly
     * doubles its rate of change. The cost is that a large fish sees less water,
     * which is why `untelegraphed deaths` in the sim is the gate on this number.
     */
    viewMassExp: 0.22,
    /**
     * THE CLAMP, and why the exponent above is not simply raised instead.
     *
     * A real run reached mass 255,547, where the curve above puts the fish at
     * **147% of a phone's screen width** — wider than the screen it is drawn
     * on. Measured across the whole range:
     *
     *   mass      8    25   150  1000  2500  6000  20000  60000  255547
     *   width    8%   11%   18%   31%   40%   51%    72%    98%    147%
     *
     * Agar.io and slither.io hold that number roughly constant: the camera
     * zooms with you, you stay the same size, and the WORLD is the thing that
     * changes. Raising `viewMassExp` to 0.5 would do that — and would undo
     * round 16's finding, which was that at a high exponent players never feel
     * themselves grow at all. The early game is where "I am getting bigger"
     * matters most and it is the part almost everybody plays.
     *
     * So: keep the curve, and put a ceiling on it. Below about mass 1,800
     * nothing changes by a single pixel; above it the fish holds at
     * `maxScreenShare` and the ocean opens up instead.
     */
    maxScreenShare: 0.35,
    /**
     * The clamp is measured against THIS aspect ratio, not the real one.
     *
     * View height must depend on mass and nothing else: the arena's director
     * reads it for every player in a shared room, and a replay has to
     * reproduce it exactly. Deriving it from the actual window would make the
     * simulation depend on the shape of the screen far more deeply than it
     * already does.
     *
     * A portrait phone is the device this matters on and the one most people
     * play on — width is the short side, and a fish is drawn along its length.
     * Clamping against a phone means a phone gets exactly `maxScreenShare` and
     * anything wider gets more water, which is the right way round.
     */
    referenceAspect: 0.5,
    /**
     * Camera lerp toward the player, per second. **Effectively a lock.**
     *
     * Setting `lead` to zero was only half of putting the fish in the middle.
     * The camera damps toward the player, so at any steady speed it sits a
     * constant distance behind — and that distance is speed divided by this
     * number. Measured while swimming, as a fraction of half the screen width:
     *
     *     follow      7.5    15    30    60    200
     *     off centre  14.7%  6.9%  3.0%  1.1%  0.1%
     *
     * The lag was pure damping: the worst sample equalled the mean at every
     * value, so there is no jitter being smoothed out here and nothing is lost
     * by removing it. 60 is about two pixels on a phone, and keeps just enough
     * give to absorb a discontinuity rather than cutting to it.
     */
    follow: 60,
    /**
     * Look-ahead along heading, as a fraction of view height. **Zero.**
     *
     * It was 0.11, which pushed the fish about a tenth of the screen off centre
     * in whatever direction it was pointing — the usual argument being that you
     * see more of where you are going. Anthony wants the fish in the middle and
     * he is right for this game: every other .io game centres you, the fish is
     * the thing your eye tracks, and a hero that slides around its own frame as
     * you turn is harder to follow than the extra sliver of water is worth.
     *
     * The camera is still clamped to the ocean, so a fish pressed against the
     * seabed or the wall is off centre — that is the world ending, not a lead.
     */
    lead: 0,
    /**
     * Player pinch/scroll zoom. Generous range, persisted. §6 rule 4.
     *
     * The default is deliberately zoomed OUT. Anthony's note: starting wide
     * "makes you feel small in the game", which is the entire premise of the
     * song the game is named after. It also means more water on screen, which
     * is why the render pass had to get cheaper first.
     */
    defaultZoom: 1.85,
    zoomRange: [0.55, 2.4],
    zoomStep: 0.12,
    /** Tier-up punch: view height briefly multiplied by this, then eases back. */
    tierPunch: 1.16,
    tierPunchMs: 900
  },
  // ---------------------------------------------------------------- director
  /**
   * Spawning is now ABSOLUTE and depth-driven, the way agar and slither are.
   * A fish's size comes from where in the ocean it lives, not from a fraction
   * of your mass — which is what makes depth soft-gate itself. Nothing tells a
   * small fish it may not go deep. What lives down there tells it.
   */
  director: {
    rebalanceMs: 500,
    /** Live bodies to keep inside the view, per band. The ocean is not uniform. */
    densityByBand: [22, 15, 13, 9],
    /**
     * Absolute mass range of what lives in each band: surface, shallows, deep,
     * black. Bream at the top are food for anyone; the black is full of things
     * that are food for nobody until very late.
     */
    /**
     * PLAYTEST: "it feels impossible to swim down as a small fish, the big fish
     * are huge." It was. The deep started at 25 mass and the black at 150,
     * against a player who starts at 10 — so the bands below the shallows held
     * literally nothing edible until very late, and a soft gate had become a
     * wall. The ranges overlap properly now: the deep is DANGEROUS because most
     * of what lives there is big, not because none of it is small.
     */
    massByBand: [
      /**
       * The surface is meant to be where you grow FAST — "a lot of bream to
       * grow quickly", which is the congestion point the whole map design is
       * built around. At [1.5, 5] it was crumbs, so the fastest-growing water
       * in the ocean was the slowest. The shoals up here are now worth eating.
       */
      [1.5, 16],
      [2, 40],
      [6, 420],
      [20, 1800]
    ],
    /**
     * APEX SPAWNS. In the deep and the black, some fraction of what spawns is
     * sized RELATIVE TO YOU rather than from the table above.
     *
     * PLAYTEST: "when I got pretty big the game got boring." Of course it did.
     * The largest body in the table is 1800, so from about mass 1960 every
     * single thing in the ocean was edible and the game had no opposition left
     * — at exactly the point where the player has invested the most.
     *
     * This is the "bigger pond" promise kept without rescaling the world: the
     * shallows you genuinely outgrow, and the deep always has something down
     * there that is bigger than you. Which is also the reason to go down.
     */
    apexChanceByBand: [0, 0, 0.22, 0.4],
    /**
     * What an apex body weighs, by band. Absolute, so the ocean is the same
     * ocean for everybody in a shared room — and tall enough at the bottom that
     * even a very large fish still has something below it.
     *
     * The progression this produces: the deep is lethal, then it becomes your
     * farm, and by then the black is lethal. That is the whole game in one
     * table.
     */
    /**
     * ROUND 26b: the pair is now the TOP and the BOTTOM of the band, and an
     * apex is sized by where in the band it spawns — not drawn at random from
     * the whole range.
     *
     * "if i am small and try to swim straight down i cant bc so many big fish
     * take up the screen." Measured, as the share of screen columns with
     * something lethal in them, and the widest gap left to steer through:
     *
     *     mass 10   shallows   16% blocked, 50% gap
     *     mass 10   the deep   81% blocked, 18% gap
     *     mass 10   the black 100% blocked,  0% gap
     *
     * Zero gap is not a gate, it is a wall — and the cause was geometry, not
     * difficulty: one body in the deep was 544 units across against a fry's
     * 574-unit screen, and one in the black was 1,246. You cannot route around
     * something you cannot see past.
     *
     * Shrinking them everywhere would have fixed the descent and destroyed the
     * top of the game: the same bodies are the only food big enough for a very
     * large fish AND the only things that can still eat one, so the round-26
     * ceiling is built on them. Scaling by depth serves both ends. The top of
     * the deep — the water a small fish actually reaches — holds bodies around
     * 350, which is a quarter of its screen and steerable. The seabed still
     * holds 22,000s, which is about 40% of the screen of a fish big enough to
     * be down there.
     */
    apexMassByBand: [
      [0, 0],
      [0, 0],
      [350, 4200],
      [4200, 22e3]
    ],
    /** How much an individual apex varies around the size its depth implies. */
    apexMassJitter: [0.72, 1.36],
    /** Higher = more small fish within a band. 3.5 puts the median near the floor. */
    massSkew: 3.5,
    /**
     * Even in the deep there are small things. Without this floor a small fish
     * that wanders down sees a full screen and starves, which reads as a bug
     * rather than as a warning. Kept low so it never softens the gate.
     */
    minEdibleOnScreen: 4,
    /** Density has a ceiling too, or the screen silts up as you outgrow things. */
    edibleOverflow: 1.8,
    /**
     * HOW MUCH OF THE SCREEN MAY BE THINGS THAT EAT YOU.
     *
     * "if i am small and try to swim straight down i cant bc so many big fish
     * take up the screen it's impossible to go down past shallows." Measured,
     * as a share of the screen's width covered by lethal bodies:
     *
     *     mass      surface  shallows  the deep  the black
     *       10          4%       10%       76%        90%
     *      400         40%        5%       71%        94%
     *
     * And a fish that swims down, dodging, died in 16 runs out of 16 at every
     * size from 10 to 400 — never reaching past 39% of the ocean's depth. The
     * black, where the 3.2x score multiplier lives and where the entire "dive
     * to cash in" design pays out, has never been reachable except by already
     * being enormous.
     *
     * The reason is geometry, not difficulty. A body in the deep is 544 units
     * across; a fry's screen is 574 wide. One in the black is 1,246 — more than
     * twice the width of the window the player sees the world through. **You
     * cannot route around something you cannot see past.** Round 13 fixed this
     * once by overlapping the band mass ranges; round 14 raised the apex sizes
     * and rebuilt the wall without noticing.
     *
     * So the deep stays terrifying and stops being sealed: threats may cover
     * this much of the screen and no more. Past it the director keeps stocking
     * the water, but only with things that are not lethal to whoever it is
     * filling for. There is always a gap; finding it is the game.
     *
     * This withholds SPAWNS only — it never removes a fish somebody is already
     * looking at, which in a shared room could be somebody else.
     */
    lethalScreenCap: 0.4,
    /** Exactly one "just above the band" tease: the fish you want and can't have. */
    teaseCount: 1,
    teaseBand: [1.1, 1.32],
    /** Birds live above the waterline only. Chance per rebalance. */
    birdChance: 0.42,
    /** How long the player must be shallow before a dive may start. */
    birdShallowDwell: 0.8,
    /**
     * A bird will not dive on anything smaller than this. Partly because a
     * seabird does not cross a bay for one bream, and partly because the
     * surface is meant to be the fast-growth zone — if birds killed starters
     * outright, the richest water in the ocean would be a place beginners must
     * avoid, which is the opposite of the point. You become worth diving on at
     * 25, and too big to be carried off at 60.
     */
    birdMinTarget: 25,
    /** How long a bird sits out after it catches something. */
    birdRestAfterCatch: 7,
    birdsMax: 4,
    birdMass: 900,
    /** Spawn ring, as a multiple of the view half-diagonal. Off-camera only. */
    spawnRing: [1.1, 1.5],
    cullRing: 2.8,
    /** No lethal spawn inside the player's forward cone for this long post-restart. */
    graceMs: 1200,
    graceCone: 1.1,
    maxEntities: 190,
    /**
     * A shared room's entity budget, per live player, and the ceiling for the
     * whole room. `maxEntities` above is the SINGLE-PLAYER number and stays
     * that; in a lobby the ocean has to be big enough for everyone's screen.
     *
     * 40 players x 110 is 4,400 bodies at 20Hz, which is comfortable for one
     * Durable Object and about a megabyte of state. Snapshots are already
     * range-filtered per player, so none of it reaches the wire.
     */
    arenaEntitiesPerPlayer: 110,
    /**
     * ROUND 26. 4,400 -> 2,400, because the server has to simulate all of them
     * twenty times a second and the tick is O(entities). Measured, in this
     * container:
     *
     *     entities   103    318    756   1194
     *     tick       0.75   2.40   5.94  10.43 ms   (budget 50ms)
     *
     * 4,400 would have been roughly 40ms of a 50ms tick with nothing left for
     * the snapshots, on a machine that is probably faster than a Worker. The
     * cap only binds past about twenty players, and a very full room getting
     * slightly thinner water is a far better failure than a room that cannot
     * hold its tick rate.
     */
    arenaMaxEntities: 2400,
    /** Rare visitors: something enormous crossing the deep, ignoring you. */
    visitorChance: 0.03,
    visitorBand: [4, 9]
  },
  // ---------------------------------------------------------------------- ai
  ai: {
    /**
     * NPC speed is a fraction of the PLAYER's current speed, not a function of
     * the NPC's own mass. Deriving it from mass makes crumbs faster than you
     * (speed falls with size), so food outruns the player and the screen looks
     * full while nothing is catchable — the worst version of "waiting around".
     * Food must always be catchable; threats must never simply run you down.
     */
    speedVsPlayer: {
      edible: [0.42, 0.72],
      standoff: [0.74, 0.9],
      /**
       * Strictly below 1, with headroom for the chase multiplier below
       * (0.86 * 1.08 = 0.93). A predator can close on a player who is turning,
       * hesitating or grazing, and never on one who has picked a direction and
       * committed. "Impossible to get rid of" was this band, unenforced.
       */
      lethal: [0.7, 0.86]
    },
    turnScale: [0.55, 0.85],
    /** NPC turn rate is capped relative to the player's, so nothing out-jukes you. */
    turnCapVsPlayer: 1.5,
    wanderTurnMs: [900, 2600],
    /** Hunting predators. Vary aggression; some just don't care. */
    disinterestChance: 0.2,
    /** A chase can simply end. Avoids the "relentless pursuit" tell. */
    loseInterestMs: [2200, 5200],
    /** Seconds before a fish that has given up may lock on to you again. */
    relockDelay: 6,
    /**
     * An ambusher's pursuit after its strike, and how long it then lies in wait
     * before it is willing to try again. Without the first number it chased
     * forever; that was the "no way to lose them" bug.
     */
    ambushChaseSec: [3.5, 7],
    ambushResetSec: [6, 13],
    /**
     * Hunt engagement range, as a fraction of the camera's half-diagonal.
     *
     * This was 320 WORLD UNITS. Past tier 7 the world rescales against mass
     * forever, so by the deep end the camera showed seven times more water and
     * a fixed 320 units was a distance predators effectively never closed —
     * they drifted past while the player grazed. Every range in a world that
     * rescales has to be relative to the view or to a radius. That single class
     * of bug is most of "it got weird as I got bigger".
     */
    huntRangeView: 0.5,
    /**
     * Telegraph: wind-up, visible lunge arc, cue 350ms before the strike. §6.
     */
    telegraphMs: 350,
    /**
     * A predator may not BEGIN a strike until it has been inside indicator
     * range — on screen, or carrying an edge marker — for this long.
     *
     * This makes "nobody dies to something they never saw" a property of the
     * code rather than something we hope falls out of the tuning. It was added
     * after birds killed four simulated runs having been visible for 60
     * milliseconds: they live above the waterline, outside the band the rest of
     * the ocean occupies, so the usual spawn-distance guarantees did not cover
     * them. Rather than special-case birds, every predator now has to earn its
     * strike by being seeable first.
     */
    minSeenBeforeStrike: 1.1,
    lungeMs: 480,
    lungeSpeedMul: 2.35,
    lungeCooldownMs: [1400, 2600],
    /** Schools. */
    schoolSize: [5, 11],
    schoolCohesion: 0.9,
    /**
     * Separation and neighbour search, in multiples of the fish's OWN radius.
     * These were fixed world units too, so at the deep end schools collapsed
     * into a single overlapping blob.
     */
    schoolSeparationRadii: 3.2,
    schoolNeighbourRadii: 14
  },
  // ------------------------------------------------------------------ visuals
  render: {
    /**
     * DEVICE PIXEL RATIO CAP. The single biggest performance lever in the game.
     *
     * An iPhone 13 reports dpr 3, so an uncapped canvas rasterises
     * 1170 x 2532 = 2.96 MILLION pixels every frame, and each full-screen light
     * pass blends all of them again. At dpr 2 it is 1.3M — the same picture,
     * 2.25x less work, on a screen where nobody can see a 3x canvas anyway.
     *
     * Measured on the profiling harness: the three full-screen water passes
     * were 20ms of a 26ms frame. This is half of the fix; merging those passes
     * into one is the other half.
     */
    dprCap: 2,
    /**
     * Water light is drawn at a FRACTION of canvas resolution and scaled up.
     * Shafts, caustics and fog are all soft, low-frequency light — there is no
     * detail in them to lose, and at 0.5 they cost a quarter of the pixels.
     */
    /**
     * Lowered again in round 14: the ocean got 60% deeper, so `lightAt` reads
     * much brighter at any given y and the shallows now draw the light pass at
     * close to full strength where they used to be halfway faded. Same soft
     * light, fewer pixels.
     */
    /**
     * ROUND 20: MEASURED, AND DELIBERATELY LEFT ALONE.
     *
     * The light surface is composed at this fraction of the CSS viewport and
     * then magnified onto a canvas `dpr` times larger, so at dpr 2 a 166x269
     * surface covers 780x1328 device pixels. That magnification was the single
     * most expensive thing in the game (see WaterLayers.drawLight) and turning
     * its filter off fixed it. The obvious follow-up was to raise this number
     * so nearest-neighbour had less to stretch — and the same blit, same
     * destination, from source surfaces of 104x168 up to 624x1008, measured:
     *
     *   bilinear  10.4  10.3  10.4  10.2  10.3  10.4 ms
     *   nearest    3.0   3.0   3.0   3.0   3.0   3.1 ms
     *
     * Flat. The blit is destination-bound — cost is per device pixel written,
     * not per source pixel read — so raising this buys no sharpness the filter
     * change needed, and it is NOT free: composing the scratch surface does
     * scale with its area. Whole frame, shoal at the surface, dpr 2:
     *
     *   0.3 -> 12.1ms   0.4 -> 12.3ms   0.5 -> 12.6ms
     *   0.6 -> 13.1ms   0.75 -> 13.8ms  1.0 -> 15.7ms
     *
     * And photographing all of them against the old bilinear look, the higher
     * scales are the BIGGER art change, not the smaller one: mean per-pixel
     * difference 0.08/255 at 0.4, against 1.43 at 0.5, 2.25 at 0.6 and 3.24 at
     * 0.75 — because the shafts and caustics are blurred at build time in
     * source space, so a larger surface quietly sharpens them.
     *
     * 0.4 is therefore both the fastest option and the one closest to the
     * round-18 water. It stays.
     */
    waterScale: 0.4,
    /** Threat rim / edible tint intensities. Never color alone — §13. */
    edibleTint: 0.34,
    lethalRim: 3,
    /**
     * Minimum on-screen size for any fish, in CSS pixels. Crumbs are a few
     * world units across; at tier 1 that is a 4px dot on a phone, which reads
     * as an empty screen even when the density budget is being met.
     */
    minEntityScreenPx: 8,
    /**
     * Whether the minimap marks large predators. Off by default: a map that
     * shows every threat undoes the offscreen-marker design, and in PvP it is
     * the most valuable thing a cheater could want. Anthony's call.
     */
    minimapShowsThreats: false,
    /** Offscreen threat markers. Load-bearing, not decorative. §6 rule 2. */
    indicatorMargin: 26,
    indicatorMinSize: 9,
    indicatorMaxSize: 22,
    indicatorRange: 1.9
    // multiples of view diagonal
  },
  /**
   * THE BREACH. Mechanically it does nothing — no score, no speed, no escape.
   * That was a deliberate design call: it is pure show-off. Which means its
   * entire value is in how it looks, and it is the one moment in the game that
   * is allowed to be extravagant.
   *
   * Numbers here are all about the exit and the re-entry, not the physics —
   * the arc itself lives under `ocean`.
   */
  breach: {
    /** How much wider the camera goes on exit, and for how long. */
    cameraWiden: 1.22,
    cameraWidenSec: 0.85,
    /** A held beat as the fish clears the water. Short: this is a lift, not a stop. */
    slowMoMs: 190,
    slowMoScale: 0.55,
    /** The sheet of water dragged up through the surface with the fish. */
    sheetParticles: 42,
    sheetSpeed: 430,
    /** Droplets trailing off the fish while it is in the air. */
    trailPerSec: 34,
    /** Re-entry. Everything here scales with how hard you come back down. */
    splashParticles: 44,
    splashSpeed: 260,
    /** Impact speed, in world units/sec, that counts as a full-strength splash. */
    splashFullSpeed: 900
  },
  juice: {
    /**
     * PLAYTEST: "when I eat fish the game lags still." It was not performance.
     * §8 asks for a 60ms hitstop on a bite, which is exactly right when bites
     * are occasional — but in a bream shoal you eat four or more a second, and
     * measured at 3.8 bites/sec the game was FROZEN 24% OF THE TIME. Juice that
     * fires constantly stops reading as impact and starts reading as lag.
     *
     * The punch now belongs to the first bite of a chain and decays fast, and
     * there is a hard ceiling on how much of any second can be spent frozen.
     */
    biteHitstopMs: 60,
    /**
     * Each further link in a chain cuts the hitstop by this factor.
     *
     * ROUND 24: 0.9 -> 1.8. The budget below was being honoured on paper and
     * broken in practice — see `hitstopMinMs`. With the faster decay the second
     * link of a chain already falls under the floor, so a chain is one punch
     * followed by clean, fast eating, which is what a frenzy is supposed to
     * feel like.
     */
    hitstopChainDecay: 1.8,
    /**
     * ROUND 24. A freeze always costs a WHOLE FRAME, so a grant shorter than
     * this is not felt as impact — it is felt as a dropped frame. Below the
     * floor the bite gets its shake and its particles and no freeze at all.
     *
     * Set at roughly a frame and a half at 60Hz.
     */
    hitstopMinMs: 24,
    /**
     * Never spend more than this many milliseconds of any second frozen.
     *
     * ROUND 24: 90 -> 60. Measured mid-frenzy the world was frozen 16% of the
     * time against a nominal 9% ceiling, because the budget was charged the
     * milliseconds of hitstop REMAINING while the player lost the whole frame.
     * The accounting is fixed in engine.ts; the ceiling comes down to match
     * what a player will actually accept.
     */
    hitstopBudgetMsPerSec: 60,
    /**
     * ROUND 24: 500ms at 0.35 -> 260ms at 0.5. "The game still lags a bit when
     * i upgrade fishes." Half a second at a third speed is not emphasis, it is
     * an interruption — you have time to notice the controls are not answering.
     * A quarter second at half speed reads as a beat and hands the fish back.
     */
    tierSlowMoMs: 260,
    tierSlowMoScale: 0.5,
    deathFreezeMs: 350,
    shakeBite: 2.2,
    /** The one big hit left: catching a bird out of the air. */
    shakeBirdKill: 7,
    shakeDeath: 9,
    maxParticles: 420
  },
  /**
   * ONLINE PLAY.
   *
   * The server is authoritative over everything that matters — position, mass,
   * who ate whom — and broadcasts at 20Hz. Two problems follow from that, and
   * these numbers are the answers.
   *
   * 1. Your own fish would move in 20Hz steps, which feels like ice. So it is
   *    PREDICTED locally at 60Hz from the same `Player.step` the server runs,
   *    and corrected toward the server's truth as snapshots arrive.
   * 2. Everything else would jump between snapshots. So it is INTERPOLATED, and
   *    drawn slightly in the past — far enough back that there is always a
   *    newer snapshot to interpolate toward.
   */
  net: {
    /**
     * How far behind the newest snapshot the remote ocean is drawn, in
     * milliseconds. Must exceed one server tick or interpolation runs out of
     * future and starts extrapolating, which reads as fish twitching. Two ticks
     * plus a little, so one dropped packet is invisible.
     */
    interpDelayMs: 120,
    /**
     * Beyond this, a snapshot is too old to interpolate from and the remote
     * ocean holds still rather than sliding fish across the screen.
     */
    maxExtrapolateMs: 250,
    /** Input messages per second. The server ticks at 20; more is waste. */
    inputHz: 20,
    /**
     * What the server's broadcast interval is, in milliseconds. Used to take
     * the server's own waiting time out of a round-trip measurement — without
     * it, every estimate is one tick too long and the correction aims at the
     * wrong instant.
     */
    serverTickMs: 50,
    /**
     * Correction. The server's position for your own fish arrives ~1 RTT late,
     * so it is always slightly behind where prediction has you. Small errors
     * are blended away over a few frames; a large one means prediction and
     * truth have genuinely parted (you were eaten, teleported, or the tab
     * slept) and is snapped, because sliding a fish a thousand units looks far
     * worse than a cut.
     */
    correctBlendPerSec: 9,
    snapDistanceRadii: 6,
    /** Reconnect backoff, milliseconds. Capped so a dead server is not hammered. */
    reconnectMs: [400, 900, 2e3, 4e3, 8e3],
    /** No traffic for this long and the socket is considered dead. */
    staleMs: 6e3,
    /**
     * ROUND 24. How long a player who WAS online waits for the arena to come
     * back before the game puts them in a pond of their own.
     *
     * Measured: killing the arena mid-run left the client "retrying" forever
     * with ninety-six fish standing perfectly still and a fish that could not
     * eat any of them. The give-up path only covered a connection that never
     * landed, so a connection that landed and then died had no way out — and a
     * frozen ocean is indistinguishable from a game that has stopped working,
     * which is very likely what "extremely laggy" meant.
     *
     * Long enough to ride out a tunnel or a handover; short enough that nobody
     * sits and stares at it.
     */
    giveUpAfterMs: 6e3
  },
  run: {
    /** Death card appears over the still-running pond. Restart must beat 1s. */
    deathCardDelayMs: 240,
    /**
     * SCORE = what you banked, plus chain credit — divided by ten.
     *
     * A live run came back at **4,247,973**. Seven digits is unreadable at a
     * glance, impossible to repeat out loud, and makes a leaderboard look like
     * a slot machine rather than a ranking. Two things bring it down: the mass
     * ceiling from this round means far less gets eaten in the first place, and
     * these weights take a factor of ten off what is left.
     *
     * Calibrated against the autopilot, which is a worse player than anybody
     * real: its median run now scores about 1,100 and its best about 2,700. A
     * human is roughly an order of magnitude better than it, which puts a good
     * run in the thousands and a great one in the tens of thousands. Nothing
     * about the RANKING changes — this is the same number, printed smaller.
     */
    scoreBankWeight: 0.1,
    scoreChainWeight: 4,
    /**
     * How many simulation steps of input a run records. 60Hz x 300s, so five
     * minutes at one byte a step — 18KB, and a run longer than this stops
     * recording and is marked unverifiable rather than silently truncated.
     */
    inputLogSteps: 18e3
  }
};
var LIVE = structuredClone(TUNING);

// ../src/game/mathx.ts
var TAU = Math.PI * 2;
function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function damp(a, b, rate, dt) {
  return lerp(a, b, 1 - Math.exp(-rate * dt));
}
function angleDelta(from, to) {
  let d = (to - from) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d <= -Math.PI) d += TAU;
  return d;
}
function turnToward(current, target, maxStep) {
  const d = angleDelta(current, target);
  if (d > maxStep) return current + maxStep;
  if (d < -maxStep) return current - maxStep;
  return target;
}

// ../src/game/player.ts
function scaledRate(mass, rate, k) {
  const m0 = LIVE.player.startMass;
  return rate * Math.pow(m0, 1 - k) * Math.pow(Math.max(1, mass), k);
}
function decayRate(mass) {
  const d = LIVE.decay;
  return scaledRate(mass, d.perSecond, d.massExp) + scaledRate(mass, d.hungerPerSecond, d.hungerExp);
}
function burnRate(mass) {
  return scaledRate(mass, LIVE.player.boostMassPerSec, LIVE.player.boostMassExp);
}
function radiusFor(mass) {
  return LIVE.player.radiusK * Math.sqrt(mass);
}
function speedFor(mass, viewHeight) {
  const p = LIVE.player;
  const viewRatio = viewHeight / LIVE.camera.viewHeightAtStart;
  const comp = Math.pow(viewRatio, p.speedViewComp);
  return p.baseSpeed * comp / Math.pow(mass, p.speedMassExp);
}
function turnFor(mass, sensitivity = LIVE.player.sensitivity) {
  return LIVE.player.baseTurn * sensitivity / Math.pow(mass, LIVE.player.turnMassExp);
}
var Player = class {
  x = 0;
  y = 0;
  px = 0;
  py = 0;
  heading = 0;
  /** Heading the input is asking for. Latency from input to this is ZERO. */
  desiredHeading = 0;
  mass = LIVE.player.startMass;
  radius = radiusFor(LIVE.player.startMass);
  speed = 0;
  /** 0..1, how hard the fish is currently turning. Drives speed loss and the render lean. */
  turnLoad = 0;
  /** Set on the frame boost engages, consumed by the engine for the burst. */
  boostStarted = false;
  /**
   * The radius the fish is DRAWN at, which lags the real one on a spring.
   *
   * Growth used to be a square root applied instantly: mathematically you got
   * bigger with every bite, and visually nothing happened, because the fifth
   * bream at mass 400 moves your radius by a fraction of a pixel. The reference
   * Anthony keeps naming is slither.io, and what slither actually does is let
   * the body VISIBLY react to every single pellet.
   *
   * So the drawn size springs toward the true size with a little overshoot, and
   * a bite gives it a shove proportional to how much of you that fish was. A
   * meal you can feel is worth more than a number you can read.
   */
  drawnRadius = 0;
  radiusVel = 0;
  alive = true;
  atSurface = false;
  /** Out of the water, on a ballistic arc. */
  airborne = false;
  vx = 0;
  vy = 0;
  airTime = 0;
  /** Set from input each frame. */
  boosting = false;
  /** True only while boost is actually being spent, for the trail and the HUD. */
  boostActive = false;
  /**
   * Growth you can SEE. Slither's growth reads because the snake visibly gets
   * longer on every pellet; ours was a square root of mass, which moves so
   * little per small fish that eating felt like it did nothing. This pulses on
   * every bite and the renderer scales the fish by it.
   */
  growPulse = 0;
  /** Mass as the HUD shows it: eased, so the number ticks rather than jumps. */
  shownMass = LIVE.player.startMass;
  causeOfDeath = "";
  // chain
  chainLinks = 0;
  chainMultiplier = 1;
  chainTimer = 0;
  frenzy = false;
  frenzyGrace = 0;
  // run stats
  bites = 0;
  bestChain = 0;
  peakMass = LIVE.player.startMass;
  elapsed = 0;
  reset() {
    const t = LIVE.player;
    this.x = 0;
    this.y = LIVE.ocean.depth * LIVE.ocean.startDepth;
    this.px = this.x;
    this.py = this.y;
    this.heading = 0;
    this.desiredHeading = this.heading;
    this.mass = t.startMass;
    this.radius = radiusFor(t.startMass);
    this.speed = 0;
    this.turnLoad = 0;
    this.boostStarted = false;
    this.drawnRadius = radiusFor(t.startMass);
    this.radiusVel = 0;
    this.alive = true;
    this.atSurface = false;
    this.airborne = false;
    this.vx = 0;
    this.vy = 0;
    this.airTime = 0;
    this.boosting = false;
    this.boostActive = false;
    this.growPulse = 0;
    this.shownMass = t.startMass;
    this.causeOfDeath = "";
    this.chainLinks = 0;
    this.chainMultiplier = 1;
    this.chainTimer = 0;
    this.frenzy = false;
    this.frenzyGrace = 0;
    this.bites = 0;
    this.bestChain = 0;
    this.peakMass = t.startMass;
    this.elapsed = 0;
  }
  step(dt, viewHeight, sensitivity) {
    this.px = this.x;
    this.py = this.y;
    const p = LIVE.player;
    const wasBoosting = this.boostActive;
    this.boostActive = this.boosting && this.mass > p.boostMinMass;
    if (this.boostActive && !wasBoosting) this.boostStarted = true;
    const err = Math.abs(angleDelta(this.heading, this.desiredHeading));
    const swing = Math.pow(Math.min(1, err / p.turnEaseAngle), p.turnEaseExp);
    const shape = p.turnSettle + (p.turnSwing - p.turnSettle) * swing;
    const turnMul = this.boostActive ? p.boostTurnMul : 1;
    const maxStep = turnFor(this.mass, sensitivity) * turnMul * shape * dt;
    this.heading = turnToward(this.heading, this.desiredHeading, maxStep);
    this.turnLoad = damp(this.turnLoad, swing, 8, dt);
    const want = speedFor(this.mass, viewHeight) * (this.boostActive ? p.boostSpeedMul : 1) * (1 - p.turnSpeedLoss * this.turnLoad);
    const rate = this.boostActive && want > this.speed ? p.boostAccelRate : want > this.speed ? p.accelRate : p.brakeRate;
    this.speed = damp(this.speed, want, rate, dt);
    if (this.boostActive) {
      this.mass = Math.max(p.boostMinMass, this.mass - burnRate(this.mass) * dt);
    }
    this.x += Math.cos(this.heading) * this.speed * dt;
    this.y += Math.sin(this.heading) * this.speed * dt;
    this.mass = Math.max(1, this.mass - decayRate(this.mass) * dt);
    this.radius = radiusFor(this.mass);
    this.elapsed += dt;
    this.stepDrawnRadius(dt);
    this.growPulse = Math.max(0, this.growPulse - dt * 3.4);
    this.shownMass += (this.mass - this.shownMass) * Math.min(1, dt * 7);
    if (this.chainLinks > 0) {
      this.chainTimer -= dt;
      if (this.chainTimer <= 0) {
        this.chainLinks = 0;
        this.chainMultiplier = 1;
      }
    }
    if (this.frenzy) {
      this.frenzyGrace -= dt;
      if (this.chainLinks < LIVE.chain.frenzyLinks && this.frenzyGrace <= 0) {
        this.frenzy = false;
      }
    }
    if (this.mass > this.peakMass) this.peakMass = this.mass;
  }
  /**
   * Returns true if this bite started a frenzy.
   *
   * `gain` is the mass this bite added. The visual shove is proportional to
   * what fraction of you that was, with a floor so even a crumb registers —
   * eating something a quarter your size should look different from eating a
   * speck, and before this they looked identical.
   */
  registerBite(gain = 0) {
    const c = LIVE.chain;
    const share = this.mass > 0 ? gain / this.mass : 0;
    const p = LIVE.player;
    this.growPulse = Math.min(1, p.bitePulseFloor + share * p.bitePulseGain);
    this.radiusVel += this.radius * this.growPulse * p.biteShove;
    this.bites++;
    this.chainLinks++;
    this.chainTimer = c.windowMs / 1e3;
    this.chainMultiplier = Math.min(c.cap, 1 + c.gain * this.chainLinks);
    if (this.chainLinks > this.bestChain) this.bestChain = this.chainLinks;
    if (!this.frenzy && this.chainLinks >= c.frenzyLinks) {
      this.frenzy = true;
      this.frenzyGrace = c.frenzyGraceMs / 1e3;
      return true;
    }
    if (this.frenzy) this.frenzyGrace = c.frenzyGraceMs / 1e3;
    return false;
  }
  /**
   * Critically-ish damped spring with a deliberate softness, so the body
   * overshoots a little and settles rather than snapping. It is a RENDER value
   * only: nothing in the simulation reads it, so it can never make a hitbox
   * disagree with what the player sees.
   */
  stepDrawnRadius(dt) {
    const p = LIVE.player;
    const k = p.radiusSpring;
    const d = p.radiusDamping;
    this.radiusVel += (this.radius - this.drawnRadius) * k * dt;
    this.radiusVel -= this.radiusVel * Math.min(1, d * dt);
    this.drawnRadius += this.radiusVel * dt;
    const lo = this.radius * 0.82;
    const hi = this.radius * 1.3;
    if (this.drawnRadius < lo) {
      this.drawnRadius = lo;
      if (this.radiusVel < 0) this.radiusVel = 0;
    } else if (this.drawnRadius > hi) {
      this.drawnRadius = hi;
      if (this.radiusVel > 0) this.radiusVel = 0;
    }
  }
  /** Leave the water carrying the speed and direction you were swimming at. */
  beginBreach() {
    this.airborne = true;
    this.airTime = 0;
    this.vx = Math.cos(this.heading) * this.speed;
    this.vy = Math.sin(this.heading) * this.speed;
  }
  /**
   * Airborne. Gravity owns the vertical, you keep some horizontal say, and the
   * fish points where it is actually going — which is what makes a breach read
   * as a jump rather than as a glitch.
   */
  stepAir(dt) {
    const o = LIVE.ocean;
    this.px = this.x;
    this.py = this.y;
    this.airTime += dt;
    this.vy += o.gravity * dt;
    const want = Math.cos(this.desiredHeading);
    this.vx += want * o.airSteer * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.heading = Math.atan2(this.vy, this.vx);
    this.speed = Math.hypot(this.vx, this.vy);
    this.mass = Math.max(1, this.mass - decayRate(this.mass) * dt);
    this.radius = radiusFor(this.mass);
    this.elapsed += dt;
    this.stepDrawnRadius(dt);
    if (this.y >= 0 && this.vy > 0 || this.airTime > o.maxAirSeconds) {
      this.airborne = false;
      this.y = Math.max(this.y, 0);
      return true;
    }
    return false;
  }
  /**
   * Score is what you BANKED, not how big you got. Mass is how you survive;
   * points are what you went down there for. Keeping them separate is what
   * gives the map a strategy instead of a single number to maximise.
   */
  score(banked) {
    const r = LIVE.run;
    return Math.round(banked * r.scoreBankWeight + this.bestChain * r.scoreChainWeight);
  }
};

// ../src/game/camera.ts
function viewHeightFor(mass, zoom = LIVE.camera.defaultZoom) {
  const c = LIVE.camera;
  const base = c.viewHeightAtStart * Math.pow(mass / LIVE.player.startMass, c.viewMassExp);
  const floor = radiusFor(mass) * 2 / (c.maxScreenShare * c.referenceAspect);
  return Math.max(base * zoom, floor);
}
var Camera = class {
  x = 0;
  y = 0;
  viewHeight = LIVE.camera.viewHeightAtStart;
  /** Player pinch/scroll zoom. >1 sees more. Persisted by the React shell. */
  userZoom = LIVE.camera.defaultZoom;
  shake = 0;
  punch = 0;
  punchTimer = 0;
  /**
   * How long THIS punch was asked for. The ease used to normalise against the
   * tier-punch duration whatever the caller passed, so the boost lens-in — a
   * 0.28s effect measured against 0.9s — started a third of the way through
   * itself and only ever applied 31% of its amount.
   */
  punchDuration = LIVE.camera.tierPunchMs / 1e3;
  viewport = { w: 1, h: 1, dpr: 1 };
  /**
   * WHERE THE CAMERA IS DRAWN, as opposed to where the simulation has put it.
   *
   * `step` runs at the fixed simulation rate; the renderer runs at the display
   * rate. Every entity in the game is drawn at `lerp(px, x, alpha)` for exactly
   * that reason — and the camera was not. It was read raw, so on any frame where
   * no simulation step happened the fish glided and the entire ocean behind it
   * stood still.
   *
   * ROUND 24. Measured while swimming, camera translation per frame in screen
   * pixels (`scripts/lag-motion.mjs`, and the camera dump behind it):
   *
   *   normal play        1.77 1.86 1.94 2.02 2.10 ...   0 still frames of 54
   *   during a tier-up   0.00 3.43 0.00 0.00 3.40 ...   20 still frames of 31
   *
   * The tier-up runs the world at 0.35x for half a second, so one fixed step
   * lands every third frame — and the background scrolled a FULL frame's worth
   * and then stopped for two. Same distance per jump as at full speed, a third
   * of the frames. That is not slow motion, it is judder, and it is a large part
   * of what "the game lags a bit when i upgrade fishes" was pointing at. It also
   * fires on any device whose refresh rate is not exactly 60Hz, where the step
   * count per frame alternates between one and two all the time.
   *
   * These are separate fields rather than the live ones on purpose: the
   * simulation reads `x`/`y`/`viewHeight` through `Engine.view()`, and a
   * simulation that depended on the render alpha would stop being replayable
   * from its input log.
   */
  drawX = 0;
  drawY = LIVE.ocean.depth * LIVE.ocean.startDepth;
  drawViewHeight = LIVE.camera.viewHeightAtStart;
  drawScale = 1;
  drawViewWidth = LIVE.camera.viewHeightAtStart;
  prevX = 0;
  prevY = LIVE.ocean.depth * LIVE.ocean.startDepth;
  prevViewHeight = LIVE.camera.viewHeightAtStart;
  /**
   * THE PUNCH IS CINEMA, NOT PHYSICS.
   *
   * A tier-up pulls the camera back and a breach widens it, and both used to
   * multiply `viewHeight` itself — the number the SIMULATION reads. View height
   * is how far the director spawns, how big the cull ring is, and how fast the
   * player moves in screen space, so for half a second after every tier-up the
   * ocean was being stocked at a different radius and the fish was swimming at
   * a different speed. Nobody would ever have noticed, and it made a run
   * impossible to replay: the replay has no events, and a player with reduced
   * motion never got the punch at all, so three people could play the same
   * inputs in the same ocean and get three different runs.
   *
   * Now the punch is applied when the frame is DRAWN and nowhere else.
   */
  punchFactor = 1;
  prevPunchFactor = 1;
  /**
   * Latch the drawn camera for this frame, from the engine's own interpolation
   * alpha — the same number the entities are lerped with, so the camera and the
   * things in front of it are finally on one clock.
   */
  sample(alpha) {
    const a = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;
    this.drawX = this.prevX + (this.x - this.prevX) * a;
    this.drawY = this.prevY + (this.y - this.prevY) * a;
    const vh = this.prevViewHeight + (this.viewHeight - this.prevViewHeight) * a;
    const punch = this.prevPunchFactor + (this.punchFactor - this.prevPunchFactor) * a;
    this.drawViewHeight = vh * punch;
    this.drawScale = this.viewport.h / this.drawViewHeight;
    this.drawViewWidth = this.drawViewHeight * (this.viewport.w / this.viewport.h);
  }
  reset(x, y, mass) {
    this.x = x;
    this.y = y;
    this.viewHeight = this.targetViewHeight(mass);
    this.shake = 0;
    this.punch = 0;
    this.punchTimer = 0;
    this.punchDuration = LIVE.camera.tierPunchMs / 1e3;
    this.prevX = this.x;
    this.prevY = this.y;
    this.prevViewHeight = this.viewHeight;
    this.punchFactor = 1;
    this.prevPunchFactor = 1;
    this.sample(1);
  }
  targetViewHeight(mass) {
    return viewHeightFor(mass, this.userZoom);
  }
  bump(amount) {
    this.shake = Math.max(this.shake, amount);
  }
  tierPunch() {
    this.punchTimer = LIVE.camera.tierPunchMs / 1e3;
    this.punchDuration = this.punchTimer;
    this.punch = LIVE.camera.tierPunch;
  }
  /**
   * Pull back for a moment. Used by the breach: leaving the water is the one
   * time the player wants to see MORE sky than fish, and a camera that stays
   * glued at the same distance makes the biggest move in the game look small.
   * Same machinery as the tier punch, different amount and duration.
   */
  widen(amount, seconds) {
    if (this.punchTimer > 0 && this.punch > amount) return;
    this.punchTimer = seconds;
    this.punchDuration = seconds;
    this.punch = amount;
  }
  step(dt, px, py, heading, mass) {
    this.prevX = this.x;
    this.prevY = this.y;
    this.prevViewHeight = this.viewHeight;
    this.prevPunchFactor = this.punchFactor;
    const c = LIVE.camera;
    const target = this.targetViewHeight(mass);
    if (this.punchTimer > 0) {
      this.punchTimer -= dt;
      const t = clamp(this.punchTimer / Math.max(1e-3, this.punchDuration), 0, 1);
      this.punchFactor = lerp(1, this.punch, t);
    } else {
      this.punchFactor = 1;
    }
    this.viewHeight = damp(this.viewHeight, target, 3.2, dt);
    const lead = this.viewHeight * c.lead;
    let tx = px + Math.cos(heading) * lead;
    let ty = py + Math.sin(heading) * lead;
    const o = LIVE.ocean;
    const halfW = this.viewWidth / 2;
    const halfH = this.viewHeight / 2;
    const marginTop = Math.min(halfH * 0.95, this.viewHeight * 0.45);
    const marginBottom = Math.min(halfH, this.viewHeight * 0.18);
    if (this.viewWidth >= o.width) tx = 0;
    else tx = clamp(tx, -o.width / 2 + halfW, o.width / 2 - halfW);
    const lo = -marginTop + halfH;
    const hi = o.depth + marginBottom - halfH;
    ty = hi > lo ? clamp(ty, lo, hi) : o.depth / 2;
    this.x = damp(this.x, tx, c.follow, dt);
    this.y = damp(this.y, ty, c.follow, dt);
    this.shake = damp(this.shake, 0, 9, dt);
  }
  /** World units per CSS pixel. */
  get scale() {
    return this.viewport.h / this.viewHeight;
  }
  get viewWidth() {
    return this.viewHeight * (this.viewport.w / this.viewport.h);
  }
  get halfDiagonal() {
    const w = this.viewWidth / 2;
    const h = this.viewHeight / 2;
    return Math.sqrt(w * w + h * h);
  }
  adjustZoom(delta) {
    const [lo, hi] = LIVE.camera.zoomRange;
    this.userZoom = clamp(this.userZoom * (1 + delta), lo, hi);
  }
  setZoom(z) {
    const [lo, hi] = LIVE.camera.zoomRange;
    this.userZoom = clamp(z, lo, hi);
  }
};

// ../src/game/types.ts
var Kind = {
  Crumb: 0,
  Fish: 1
};
var Role = {
  /** Wanders, never threatens. Chain fodder. */
  Drifter: 0,
  /** Moves as part of a school. */
  Schooler: 1,
  /** Wanders, but is or may become lethal. */
  Prowler: 2,
  /** Actively hunts the player (tier 5+). */
  Hunter: 3,
  /** Starts still near the edge of view, strikes once. */
  Ambusher: 4,
  /** Lives above the waterline. Dives. Cannot be eaten at any size. */
  Bird: 5
};
var Threat = {
  Edible: 0,
  Standoff: 1,
  Lethal: 2
};

// ../src/game/species.ts
var LETHAL_SPECIES = [2, 3, 4];
var EDIBLE_SPECIES = [0, 1, 5];

// ../src/game/ocean.ts
var BAND_NAMES = ["the surface", "the shallows", "the deep", "the black"];
function depthFraction(y) {
  return clamp(y / LIVE.ocean.depth, 0, 1);
}
function bandAt(y) {
  const d = depthFraction(y);
  const b = LIVE.ocean.bands;
  if (d < b.surface) return 0 /* Surface */;
  if (d < b.shallows) return 1 /* Shallows */;
  if (d < b.deep) return 2 /* Deep */;
  return 3 /* Black */;
}
function bandLabel(band) {
  return BAND_NAMES[band] ?? BAND_NAMES[0];
}
function scoreMultiplierAt(y) {
  const o = LIVE.ocean;
  return 1 + (o.deepScoreBonus - 1) * depthFraction(y);
}
function clampToWorld(pos, radius) {
  const o = LIVE.ocean;
  const halfW = o.width / 2;
  let hitWall = false;
  if (pos.x < -halfW + radius) {
    pos.x = -halfW + radius;
    hitWall = true;
  } else if (pos.x > halfW - radius) {
    pos.x = halfW - radius;
    hitWall = true;
  }
  let hitSurface = false;
  let hitFloor = false;
  if (pos.y < radius * 0.35) {
    pos.y = radius * 0.35;
    hitSurface = true;
  } else if (pos.y > o.depth - radius) {
    pos.y = o.depth - radius;
    hitFloor = true;
  }
  return { hitSurface, hitFloor, hitWall };
}
function clampDepth(pos, radius) {
  const o = LIVE.ocean;
  if (pos.y < radius * 0.35) pos.y = radius * 0.35;
  else if (pos.y > o.depth - radius) pos.y = o.depth - radius;
}

// ../src/game/director.ts
var VISITORS = ["a sturgeon", "something old", "a shadow", "the long one", "a wanderer"];
function bandRange(band) {
  const b = LIVE.ocean.bands;
  if (band === 0 /* Surface */) return [0, b.surface];
  if (band === 1 /* Shallows */) return [b.surface, b.shallows];
  if (band === 2 /* Deep */) return [b.shallows, b.deep];
  return [b.deep, 1];
}
function unionWidth(spans) {
  const n = spans.length / 2;
  if (n === 0) return 0;
  for (let i = 2; i < spans.length; i += 2) {
    const lo = spans[i];
    const hi = spans[i + 1];
    let j = i - 2;
    while (j >= 0 && spans[j] > lo) {
      spans[j + 2] = spans[j];
      spans[j + 3] = spans[j + 1];
      j -= 2;
    }
    spans[j + 2] = lo;
    spans[j + 3] = hi;
  }
  let total = 0;
  let end = -Infinity;
  for (let i = 0; i < spans.length; i += 2) {
    const lo = spans[i] > end ? spans[i] : end;
    if (spans[i + 1] > lo) {
      total += spans[i + 1] - lo;
      end = spans[i + 1];
    }
  }
  return total;
}
var Director = class _Director {
  timer = 0;
  schoolSeq = 1;
  /**
   * Scratch for the lethal-coverage union, as flat [lo, hi] pairs. Reused, so
   * the twice-a-second restock allocates nothing.
   */
  lethalSpans = [];
  /** Set when a visitor arrived on this rebalance. The world drains it. */
  visitorArrived = null;
  reset() {
    this.timer = 0;
    this.schoolSeq = 1;
    this.visitorArrived = null;
  }
  step(dt, ctx) {
    this.cull(ctx);
    this.timer -= dt;
    if (this.timer > 0) return;
    this.timer = LIVE.director.rebalanceMs / 1e3;
    this.rebalance(ctx);
  }
  /**
   * Is a restock due? The arena asks, because in a shared room the answer has
   * to be acted on for EVERY player rather than for whoever the round robin
   * happened to land on. See `restock`.
   */
  due(dt, ctx) {
    this.cull(ctx);
    this.timer -= dt;
    if (this.timer > 0) return false;
    this.timer = LIVE.director.rebalanceMs / 1e3;
    return true;
  }
  /**
   * Restock around one player, without touching the timer.
   *
   * MEASURED, round 26 — fish on each player's own screen, everyone the same
   * size, spread across the ocean:
   *
   *     players    1     2      4          8              16
   *     on screen  18    6 11   3 3 5 8    0 2 3 4 4 5 5 6    4..14
   *
   * A player alone saw eighteen. In a room of eight, the median was four and
   * one player had NOTHING on screen. The room's ocean was emptying as people
   * joined, which is a strange enough thing to happen that nobody looked for
   * it: every multiplayer test ever run on this had a single player in it.
   *
   * The cause was the round robin. Culling ran every tick for everyone, but the
   * restock ran on a 500ms timer for whichever ONE player the cursor was
   * pointing at — so in a room of eight each player's water was topped up about
   * once every four seconds while being culled twenty times a second.
   *
   * Restocking is O(entities) and fires twice a second, so doing it for every
   * player costs a few thousand comparisons a second in a room of eight. That
   * is nothing, and it was never the expensive part; the cull was.
   */
  restock(ctx) {
    this.rebalance(ctx);
  }
  static classify(mass, pmass) {
    if (mass <= pmass * LIVE.eat.edibleRatio) return Threat.Edible;
    if (mass >= pmass * LIVE.eat.lethalRatio) return Threat.Lethal;
    return Threat.Standoff;
  }
  cull(ctx) {
    const items = ctx.pool.items;
    const keep = ctx.keepAlive;
    for (let i = 0; i < items.length; i++) {
      const e = items[i];
      if (!e.active || e.dying > 0) continue;
      let nearSomebody = false;
      for (let k = 0; k < keep.length; k++) {
        const dx = e.x - keep[k].x;
        const dy = e.y - keep[k].y;
        const r = keep[k].keepRadius;
        if (dx * dx + dy * dy <= r * r) {
          nearSomebody = true;
          break;
        }
      }
      if (!nearSomebody) {
        ctx.pool.release(e);
        continue;
      }
      if (e.role === Role.Bird && !ctx.surfaceOccupied) ctx.pool.release(e);
    }
  }
  rebalance(ctx) {
    const d = LIVE.director;
    const halfW = ctx.viewHalfW;
    const halfH = ctx.viewHalfH;
    let onScreen = 0;
    let edible = 0;
    let birds = 0;
    let total = 0;
    const lethal = this.lethalSpans;
    lethal.length = 0;
    const items = ctx.pool.items;
    for (let i = 0; i < items.length; i++) {
      const e = items[i];
      if (!e.active) continue;
      total++;
      e.threat = _Director.classify(e.mass, ctx.pmass);
      if (e.role === Role.Bird) birds++;
      const dx = e.x - ctx.camX;
      const dy = e.y - ctx.camY;
      if (Math.abs(dx) > halfW || Math.abs(dy) > halfH) continue;
      onScreen++;
      if (e.threat === Threat.Edible) edible++;
      else if (e.threat === Threat.Lethal) {
        const pad = e.radius + ctx.pradius;
        lethal.push(Math.max(-halfW, dx - pad), Math.min(halfW, dx + pad));
      }
    }
    const walledIn = unionWidth(lethal) > halfW * 2 * LIVE.director.lethalScreenCap;
    if (walledIn) this.thinLethal(ctx);
    const band = bandAt(ctx.camY);
    const want = d.densityByBand[band];
    if (onScreen > want * d.edibleOverflow) {
      this.thin(ctx, onScreen - want);
    }
    let live = onScreen;
    let misses = 0;
    while (live < want && total < ctx.maxEntities - 12 && misses < 4) {
      const added = this.spawnResident(ctx, walledIn);
      if (added <= 0) {
        misses++;
        continue;
      }
      live += added;
      total += added;
    }
    let floorMisses = 0;
    for (let i = edible; i < d.minEdibleOnScreen && total < ctx.maxEntities && floorMisses < 4; i++) {
      if (this.spawnResident(ctx, true) <= 0) {
        floorMisses++;
        i--;
        continue;
      }
      total++;
    }
    if (band === 0 /* Surface */ && birds < d.birdsMax && ctx.rng.chance(d.birdChance)) {
      if (this.spawnBird(ctx)) total++;
    }
    const deepEnough = bandAt(ctx.camY) >= 2 /* Deep */;
    if (deepEnough && ctx.rng.chance(d.visitorChance) && total < ctx.maxEntities) {
      this.visitorArrived = this.spawnVisitor(ctx);
    }
  }
  /**
   * Release off-screen bodies that are lethal to this player, until the width
   * still queued up is back under the cap. On-camera bodies are never touched.
   */
  thinLethal(ctx) {
    const items = ctx.pool.items;
    const halfW = ctx.viewHalfW;
    const halfH = ctx.viewHalfH;
    for (let i = 0; i < items.length; i++) {
      const e = items[i];
      if (!e.active || e.dying > 0 || e.role === Role.Bird) continue;
      if (e.threat !== Threat.Lethal) continue;
      const dx = e.x - ctx.camX;
      const dy = e.y - ctx.camY;
      if (Math.abs(dx) < halfW * 1.15 && Math.abs(dy) < halfH * 1.15) continue;
      ctx.pool.release(e);
    }
  }
  /** Retire surplus bodies, furthest offscreen first. */
  thin(ctx, surplus) {
    const items = ctx.pool.items;
    const halfW = ctx.viewHalfW;
    const halfH = ctx.viewHalfH;
    let removed = 0;
    for (let i = 0; i < items.length && removed < surplus; i++) {
      const e = items[i];
      if (!e.active || e.dying > 0 || e.role === Role.Bird) continue;
      const dx = e.x - ctx.camX;
      const dy = e.y - ctx.camY;
      if (Math.abs(dx) < halfW && Math.abs(dy) < halfH) continue;
      ctx.pool.release(e);
      removed++;
    }
    return removed;
  }
  spawnPoint(ctx, avoidForwardCone) {
    const d = LIVE.director;
    const o = LIVE.ocean;
    for (let attempt = 0; attempt < 14; attempt++) {
      const angle = ctx.rng.range(0, TAU);
      if (avoidForwardCone && ctx.runTime < d.graceMs / 1e3) {
        const delta = Math.abs(
          Math.atan2(Math.sin(angle - ctx.pheading), Math.cos(angle - ctx.pheading))
        );
        if (delta < d.graceCone) continue;
      }
      const r = ctx.viewHalfDiag * ctx.rng.range(d.spawnRing[0], d.spawnRing[1]);
      const x = ctx.camX + Math.cos(angle) * r;
      let y = ctx.camY + Math.sin(angle) * r;
      if (y < 0) y = -y;
      if (y > o.depth) y = o.depth - (y - o.depth);
      if (y < 0 || y > o.depth) continue;
      if (Math.abs(x - ctx.camX) < ctx.viewHalfW && Math.abs(y - ctx.camY) < ctx.viewHalfH) {
        continue;
      }
      return { x, y };
    }
    return null;
  }
  /** Mass for a body at this depth, skewed small so big ones are an event. */
  massAt(ctx, y, forceSmall) {
    const d = LIVE.director;
    const band = bandAt(y);
    const [lo, hi] = d.massByBand[band];
    if (forceSmall) return lo * ctx.rng.range(1, 1.6);
    if (ctx.rng.chance(d.apexChanceByBand[band])) {
      const [alo, ahi] = d.apexMassByBand[band];
      const [blo, bhi] = bandRange(band);
      const u2 = clamp((depthFraction(y) - blo) / Math.max(1e-6, bhi - blo), 0, 1);
      const centre = alo * Math.pow(ahi / alo, u2);
      const [jlo, jhi] = d.apexMassJitter;
      return centre * ctx.rng.range(jlo, jhi);
    }
    const u = Math.pow(ctx.rng.next(), d.massSkew);
    return lo + (hi - lo) * u;
  }
  init(e, ctx, x, y, mass, role) {
    const a = LIVE.ai;
    e.kind = mass < 6 ? Kind.Crumb : Kind.Fish;
    e.role = role;
    e.bornTier = 0;
    e.x = x;
    e.y = y;
    e.px = x;
    e.py = y;
    e.homeY = y;
    e.mass = mass;
    e.radius = radiusFor(mass);
    e.heading = ctx.rng.range(0, TAU);
    e.wanderTarget = e.heading;
    e.wanderTimer = ctx.rng.range(a.wanderTurnMs[0], a.wanderTurnMs[1]) / 1e3;
    e.threat = _Director.classify(mass, ctx.pmass);
    const speedBand = e.threat === Threat.Edible ? a.speedVsPlayer.edible : e.threat === Threat.Lethal ? a.speedVsPlayer.lethal : a.speedVsPlayer.standoff;
    e.speedRatio = ctx.rng.range(speedBand[0], speedBand[1]);
    e.speed = speedFor(ctx.pmass, ctx.viewHeight) * e.speedRatio;
    e.turnRate = Math.min(turnFor(mass, 1), turnFor(ctx.pmass, 1) * a.turnCapVsPlayer) * ctx.rng.range(a.turnScale[0], a.turnScale[1]);
    const pool = role === Role.Drifter || role === Role.Schooler ? EDIBLE_SPECIES : LETHAL_SPECIES;
    e.shape = pool[ctx.rng.int(0, pool.length - 1)];
    e.hue = ctx.rng.range(0, 360);
    e.phase = ctx.rng.range(0, TAU);
    e.wobble = ctx.rng.range(0.7, 1.4);
    e.stateTimer = 0;
    e.interest = 0;
  }
  /** Whatever lives at the depth this lands at. */
  spawnResident(ctx, forceSmall) {
    const p = this.spawnPoint(ctx, true);
    if (!p) return 0;
    const mass = this.massAt(ctx, p.y, forceSmall);
    const band = bandAt(p.y);
    if (!forceSmall && band <= 1 /* Shallows */ && mass < 12 && ctx.rng.chance(0.45)) {
      return this.spawnSchool(ctx, p.x, p.y, mass);
    }
    const e = ctx.pool.spawn();
    if (!e) return 0;
    let role;
    if (mass < ctx.pmass * 0.9) role = ctx.rng.chance(0.3) ? Role.Schooler : Role.Drifter;
    else if (band >= 2 /* Deep */ && ctx.rng.chance(0.18)) role = Role.Ambusher;
    else if (ctx.rng.chance(0.55)) role = Role.Hunter;
    else role = Role.Prowler;
    this.init(e, ctx, p.x, p.y, mass, role);
    if (role === Role.Ambusher) e.stateTimer = ctx.rng.range(3, 9);
    if (role === Role.Hunter && ctx.rng.chance(LIVE.ai.disinterestChance)) {
      e.lungeCooldown = LIVE.ai.relockDelay * ctx.rng.range(1, 2.5);
    }
    return 1;
  }
  spawnSchool(ctx, x, y, mass) {
    const n = ctx.rng.int(LIVE.ai.schoolSize[0], LIVE.ai.schoolSize[1]);
    const id = this.schoolSeq++;
    const spread = ctx.viewHalfDiag * 0.1;
    let made = 0;
    for (let i = 0; i < n; i++) {
      const e = ctx.pool.spawn();
      if (!e) return made;
      this.init(
        e,
        ctx,
        x + ctx.rng.range(-spread, spread),
        y + ctx.rng.range(-spread, spread),
        mass * ctx.rng.range(0.85, 1.15),
        Role.Schooler
      );
      e.schoolId = id;
      made++;
    }
    return made;
  }
  /**
   * Birds. They exist only above the waterline, they are lethal on contact and
   * they cannot be eaten at any size — but they are dodged by steering like
   * everything else, and they never take the controls away. That last part is
   * the rule the build prompt is firmest about.
   */
  spawnBird(ctx) {
    const e = ctx.pool.spawn();
    if (!e) return false;
    const o = LIVE.ocean;
    const halfW = o.width / 2;
    const side = ctx.rng.chance(0.5) ? -1 : 1;
    const off = ctx.viewHalfW * ctx.rng.range(1.15, 1.6);
    let x = ctx.camX + side * off;
    if (x < -halfW || x > halfW) x = ctx.camX - side * off;
    if (x < -halfW || x > halfW) return false;
    const airY = -LIVE.ocean.birdAirHeight;
    this.init(e, ctx, x, airY, LIVE.director.birdMass, Role.Bird);
    e.heading = x < ctx.camX ? 0 : Math.PI;
    e.homeY = airY;
    e.speedRatio = 1.15;
    e.speed = speedFor(ctx.pmass, ctx.viewHeight) * e.speedRatio;
    e.stateTimer = ctx.rng.range(1.6, 4);
    e.shape = 3;
    return true;
  }
  spawnVisitor(ctx) {
    const d = LIVE.director;
    const e = ctx.pool.spawn();
    if (!e) return null;
    const p = this.spawnPoint(ctx, true);
    if (!p) {
      ctx.pool.release(e);
      return null;
    }
    const mass = Math.max(400, ctx.pmass * ctx.rng.range(d.visitorBand[0], d.visitorBand[1]));
    this.init(e, ctx, p.x, p.y, mass, Role.Prowler);
    e.interest = 0;
    e.wanderTimer = 999;
    e.wanderTarget = ctx.rng.chance(0.5) ? 0 : Math.PI;
    e.heading = e.wanderTarget;
    e.speedRatio *= 0.75;
    e.shape = 4;
    return VISITORS[ctx.rng.int(0, VISITORS.length - 1)];
  }
  /** Opening water: a few bodies already in frame so play starts instantly. */
  seed(ctx) {
    const n = LIVE.director.densityByBand[bandAt(ctx.camY)];
    for (let i = 0; i < n; i++) {
      const e = ctx.pool.spawn();
      if (!e) break;
      const angle = ctx.rng.range(0, TAU);
      const r = ctx.viewHalfDiag * ctx.rng.range(0.25, 0.95);
      const x = ctx.camX + Math.cos(angle) * r;
      const y = Math.max(20, ctx.camY + Math.sin(angle) * r);
      this.init(e, ctx, x, y, this.massAt(ctx, y, i < 6), Role.Drifter);
      e.fade = 1;
    }
  }
};

// ../src/game/pool.ts
function blank(id) {
  return {
    active: false,
    slot: id,
    id,
    kind: Kind.Fish,
    role: Role.Drifter,
    bornTier: 0,
    x: 0,
    y: 0,
    px: 0,
    py: 0,
    heading: 0,
    speed: 0,
    speedRatio: 1,
    turnRate: 0,
    mass: 1,
    radius: 1,
    threat: Threat.Edible,
    stateTimer: 0,
    wanderTimer: 0,
    wanderTarget: 0,
    interest: 0,
    telegraph: 0,
    lunge: 0,
    lungeCooldown: 0,
    schoolId: -1,
    homeY: 0,
    diveX: 0,
    diveY: 0,
    hunting: 0,
    shape: 0,
    hue: 0,
    phase: 0,
    wobble: 0,
    fade: 0,
    dying: 0,
    eatenByX: 0,
    eatenByY: 0,
    seen: -1,
    seenSince: -1
  };
}
var EntityPool = class {
  items;
  freeList;
  nextId = 1;
  constructor(capacity) {
    this.items = new Array(capacity);
    this.freeList = new Array(capacity);
    for (let i = 0; i < capacity; i++) {
      this.items[i] = blank(i);
      this.freeList[i] = capacity - 1 - i;
    }
  }
  get capacity() {
    return this.items.length;
  }
  spawn() {
    const idx = this.freeList.pop();
    if (idx === void 0) return null;
    const e = this.items[idx];
    e.active = true;
    e.id = this.nextId++;
    e.fade = 0;
    e.dying = 0;
    e.eatenByX = 0;
    e.eatenByY = 0;
    e.seen = -1;
    e.seenSince = -1;
    e.schoolId = -1;
    e.telegraph = 0;
    e.lunge = 0;
    e.lungeCooldown = 0;
    e.interest = 0;
    e.hunting = 0;
    return e;
  }
  release(e) {
    if (!e.active) return;
    e.active = false;
    this.freeList.push(e.slot);
  }
  releaseAll() {
    this.freeList.length = 0;
    for (let i = this.items.length - 1; i >= 0; i--) {
      this.items[i].active = false;
      this.freeList.push(i);
    }
  }
};

// ../src/game/rng.ts
var Rng = class {
  s;
  constructor(seed = Date.now() >>> 0) {
    this.s = seed >>> 0;
  }
  next() {
    this.s = this.s + 1831565813 >>> 0;
    let t = this.s;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  range(lo, hi) {
    return lo + (hi - lo) * this.next();
  }
  int(lo, hi) {
    return Math.floor(this.range(lo, hi + 1));
  }
  chance(p) {
    return this.next() < p;
  }
  pick(arr) {
    return arr[Math.floor(this.next() * arr.length)];
  }
};

// ../src/game/spatialhash.ts
var SpatialHash = class {
  cell;
  cols;
  rows;
  buckets;
  counts;
  /** Scratch result array, reused. Callers must not retain it. */
  result = [];
  resultCount = 0;
  constructor(cell = 160, cols = 96, rows = 96) {
    this.cell = cell;
    this.cols = cols;
    this.rows = rows;
    const n = cols * rows;
    this.buckets = new Array(n);
    for (let i = 0; i < n; i++) this.buckets[i] = [];
    this.counts = new Int32Array(n);
  }
  setCellSize(size) {
    if (Math.abs(size - this.cell) < 1) return;
    this.cell = size;
  }
  index(x, y) {
    let cx = Math.floor(x / this.cell) % this.cols;
    let cy = Math.floor(y / this.cell) % this.rows;
    if (cx < 0) cx += this.cols;
    if (cy < 0) cy += this.rows;
    return cy * this.cols + cx;
  }
  clear() {
    this.counts.fill(0);
  }
  insert(e) {
    const i = this.index(e.x, e.y);
    const b = this.buckets[i];
    const c = this.counts[i];
    b[c] = e;
    this.counts[i] = c + 1;
  }
  /** Fills `result` with entities in cells overlapping the query circle. */
  query(x, y, radius) {
    this.resultCount = 0;
    const r = Math.max(radius, 1);
    const minX = Math.floor((x - r) / this.cell);
    const maxX = Math.floor((x + r) / this.cell);
    const minY = Math.floor((y - r) / this.cell);
    const maxY = Math.floor((y + r) / this.cell);
    for (let cy = minY; cy <= maxY; cy++) {
      for (let cx = minX; cx <= maxX; cx++) {
        let ix = cx % this.cols;
        let iy = cy % this.rows;
        if (ix < 0) ix += this.cols;
        if (iy < 0) iy += this.rows;
        const i = iy * this.cols + ix;
        const b = this.buckets[i];
        const c = this.counts[i];
        for (let k = 0; k < c; k++) {
          this.result[this.resultCount++] = b[k];
        }
      }
    }
    return this.resultCount;
  }
};

// ../src/game/ai.ts
function retarget(e, rng) {
  const a = LIVE.ai;
  e.wanderTimer = rng.range(a.wanderTurnMs[0], a.wanderTurnMs[1]) / 1e3;
  e.wanderTarget = e.heading + rng.range(-1.5, 1.5);
}
function schoolSteer(e, hash) {
  const a = LIVE.ai;
  const separation = e.radius * a.schoolSeparationRadii;
  const n = hash.query(e.x, e.y, e.radius * a.schoolNeighbourRadii);
  let cx = 0;
  let cy = 0;
  let count = 0;
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < n; i++) {
    const o = hash.result[i];
    if (o === e || !o.active || o.schoolId !== e.schoolId) continue;
    cx += o.x;
    cy += o.y;
    count++;
    const dx = e.x - o.x;
    const dy = e.y - o.y;
    const d = Math.hypot(dx, dy);
    if (d > 1e-3 && d < separation) {
      sx += dx / d * (separation - d);
      sy += dy / d * (separation - d);
    }
  }
  if (count === 0) return e.wanderTarget;
  cx = cx / count - e.x;
  cy = cy / count - e.y;
  const tx = cx * a.schoolCohesion + sx;
  const ty = cy * a.schoolCohesion + sy;
  if (Math.abs(tx) + Math.abs(ty) < 0.01) return e.wanderTarget;
  return Math.atan2(ty, tx);
}
function stepEntity(e, ctx) {
  const dt = ctx.dt;
  const a = LIVE.ai;
  const seenLongEnough = e.seenSince >= 0 && ctx.runTime - e.seenSince >= a.minSeenBeforeStrike;
  e.px = e.x;
  e.py = e.y;
  e.speed = ctx.pspeed * e.speedRatio;
  e.phase += dt * (2.2 + e.speed * 4e-3);
  if (e.fade < 1) e.fade = Math.min(1, e.fade + dt * 1.8);
  let target = e.wanderTarget;
  let speedMul = 1;
  e.wanderTimer -= dt;
  if (e.wanderTimer <= 0) retarget(e, ctx.rng);
  const dx = ctx.px - e.x;
  const dy = ctx.py - e.y;
  const distToPlayer = Math.hypot(dx, dy);
  const toPlayer = Math.atan2(dy, dx);
  const huntRange = ctx.viewHalfDiag * a.huntRangeView;
  if (e.role !== Role.Bird && (e.interest <= 0 || e.threat !== Threat.Lethal)) {
    const drift = e.homeY - e.y;
    if (Math.abs(drift) > e.radius * 6) {
      const home = Math.atan2(drift, Math.cos(e.heading) * e.radius * 8);
      target = home;
    }
  }
  switch (e.role) {
    case Role.Bird: {
      const overhead = Math.abs(dx) < ctx.viewHalfDiag * 0.28;
      const playerShallow = ctx.py < LIVE.ocean.depth * LIVE.ocean.bands.surface * 1.6 && ctx.pmass >= LIVE.director.birdMinTarget;
      e.interest = playerShallow ? e.interest + dt : 0;
      let preyMass = 0;
      let preyX = 0;
      let preyY = 0;
      if (e.lunge <= 0 && e.telegraph <= 0) {
        const surfaceLine = LIVE.ocean.depth * LIVE.ocean.bands.surface * 1.6;
        const n = ctx.hash.query(e.x, surfaceLine * 0.5, surfaceLine * 0.5 + e.radius);
        for (let i = 0; i < n; i++) {
          const o = ctx.hash.result[i];
          if (!o.active || o.role === Role.Bird || o.dying > 0) continue;
          if (o.mass < LIVE.director.birdMinTarget || o.mass <= preyMass) continue;
          if (o.y > surfaceLine || o.y < 0) continue;
          if (Math.abs(o.x - e.x) > ctx.viewHalfDiag * 0.28) continue;
          preyMass = o.mass;
          preyX = o.x;
          preyY = o.y;
        }
      }
      if (e.lunge <= 0 && e.telegraph <= 0) {
        target = Math.cos(e.heading) >= 0 ? 0 : Math.PI;
        e.y += (e.homeY - e.y) * Math.min(1, dt * 2.2);
        e.stateTimer -= dt;
        const takingFish = preyMass > 0 && seenLongEnough;
        if (e.stateTimer <= 0 && (takingFish || seenLongEnough && overhead && playerShallow && e.interest > LIVE.director.birdShallowDwell)) {
          e.diveX = takingFish ? preyX : ctx.px;
          e.diveY = takingFish ? preyY : ctx.py;
          e.hunting = takingFish ? 1 : 0;
          e.telegraph = a.telegraphMs * 2.2 / 1e3;
          ctx.telegraphed = true;
          ctx.telegraphX = e.x;
          ctx.telegraphY = e.y;
        }
      } else if (e.lunge > 0) {
        target = e.heading;
      }
      break;
    }
    case Role.Schooler:
      target = schoolSteer(e, ctx.hash);
      if (distToPlayer < ctx.pradius * 3 && e.threat === Threat.Edible) {
        target = toPlayer + Math.PI;
        speedMul = 1.25;
      }
      break;
    case Role.Drifter:
      if (e.threat === Threat.Edible && distToPlayer < ctx.pradius * 2.4) {
        target = toPlayer + Math.PI;
        speedMul = 1.18;
      }
      break;
    case Role.Prowler:
      if (e.threat === Threat.Lethal && distToPlayer < huntRange * 0.55) {
        target = toPlayer;
        speedMul = 1.02;
      }
      break;
    case Role.Hunter: {
      if (e.interest > 0) {
        e.interest -= dt;
        if (distToPlayer < huntRange && e.threat === Threat.Lethal) {
          target = toPlayer;
          speedMul = 1.08;
          const strikeRange = (e.radius + ctx.pradius) * 3.4;
          if (seenLongEnough && e.lungeCooldown <= 0 && e.telegraph <= 0 && e.lunge <= 0 && distToPlayer < strikeRange) {
            e.telegraph = a.telegraphMs / 1e3;
            ctx.telegraphed = true;
            ctx.telegraphX = e.x;
            ctx.telegraphY = e.y;
          }
        } else if (distToPlayer > huntRange * 1.6) {
          if (ctx.rng.chance(0.35 * dt)) e.interest = 0;
        }
        if (e.interest <= 0) e.lungeCooldown = Math.max(e.lungeCooldown, a.relockDelay);
      } else if (distToPlayer < huntRange * 0.7 && e.threat === Threat.Lethal && e.lungeCooldown <= 0 && ctx.rng.chance(0.5 * dt)) {
        e.interest = ctx.rng.range(a.loseInterestMs[0], a.loseInterestMs[1]) / 1e3;
      }
      break;
    }
    case Role.Ambusher: {
      if (e.stateTimer > 0) {
        e.stateTimer -= dt;
        speedMul = 0.04;
        if (seenLongEnough && distToPlayer < (e.radius + ctx.pradius) * 4.5 && e.telegraph <= 0 && e.lunge <= 0) {
          e.stateTimer = 0;
          e.interest = ctx.rng.range(a.ambushChaseSec[0], a.ambushChaseSec[1]);
          e.telegraph = a.telegraphMs / 1e3;
          e.heading = toPlayer;
          ctx.telegraphed = true;
          ctx.telegraphX = e.x;
          ctx.telegraphY = e.y;
        }
      } else {
        e.interest -= dt;
        if (e.interest > 0) {
          target = toPlayer;
          speedMul = 1.1;
        } else {
          e.stateTimer = ctx.rng.range(a.ambushResetSec[0], a.ambushResetSec[1]);
          e.homeY = e.y;
        }
      }
      break;
    }
  }
  {
    const o = LIVE.ocean;
    const margin = Math.max(e.radius * 8, ctx.viewHalfDiag * 0.35);
    const awayX = 0;
    let awayY = 0;
    if (e.role !== Role.Bird) {
      if (e.y < margin) awayY = 1 - e.y / margin;
      else if (e.y > o.depth - margin) awayY = -(1 - (o.depth - e.y) / margin);
    }
    if (awayX !== 0 || awayY !== 0) {
      const wallTarget = Math.atan2(awayY, awayX === 0 ? Math.cos(target) : awayX);
      const urgency = Math.min(1, Math.hypot(awayX, awayY));
      const d2 = angleDelta(target, wallTarget);
      target = target + d2 * urgency;
    }
  }
  if (e.telegraph > 0) {
    e.telegraph -= dt;
    speedMul = e.role === Role.Bird ? 0.15 : 0.35;
    const aim = e.role === Role.Bird && e.hunting > 0 ? Math.atan2(e.diveY - e.y, e.diveX - e.x) : toPlayer;
    target = aim;
    if (e.telegraph <= 0) {
      e.lunge = (e.role === Role.Bird ? a.lungeMs * 1.6 : a.lungeMs) / 1e3;
      e.heading = aim;
      e.lungeCooldown = ctx.rng.range(a.lungeCooldownMs[0], a.lungeCooldownMs[1]) / 1e3;
      if (e.role === Role.Bird) e.stateTimer = ctx.rng.range(4, 9);
    }
  } else if (e.lunge > 0) {
    e.lunge -= dt;
    speedMul = (e.role === Role.Bird ? a.lungeSpeedMul * 1.5 : a.lungeSpeedMul) * clamp(e.lunge / (a.lungeMs / 1e3) + 0.35, 0.35, 1);
    target = e.heading;
  } else if (e.lungeCooldown > 0) {
    e.lungeCooldown -= dt;
  }
  const step = e.turnRate * dt;
  const delta = angleDelta(e.heading, target);
  e.heading = turnToward(e.heading, e.heading + delta, step);
  const v = e.speed * speedMul;
  e.x += Math.cos(e.heading) * v * dt;
  e.y += Math.sin(e.heading) * v * dt;
}

// ../src/game/arena.ts
function stepArenaPlayer(p, dt) {
  if (p.airborne) {
    p.stepAir(dt);
    const halfW = LIVE.ocean.width / 2;
    p.x = Math.max(-halfW + p.radius, Math.min(halfW - p.radius, p.x));
    return;
  }
  p.step(dt, LIVE.camera.viewHeightAtStart, 1);
  if (p.y < p.radius * 0.35 && Math.sin(p.heading) < -LIVE.ocean.breachMinUp) {
    p.beginBreach();
  } else {
    clampToWorld(p, p.radius);
  }
}
var STEP = 1 / 60;
var Arena = class {
  pool = new EntityPool(LIVE.director.arenaMaxEntities + 40);
  hash = new SpatialHash(180);
  director = new Director();
  players = /* @__PURE__ */ new Map();
  rng;
  time = 0;
  cursor = 0;
  /** Reused point objects for DirectorContext.keepAlive. Never reallocated. */
  keepPool = [];
  ai = {
    px: 0,
    py: 0,
    pmass: 10,
    pradius: 10,
    pspeed: 0,
    viewHalfDiag: 900,
    hash: this.hash,
    rng: new Rng(1),
    dt: 0,
    runTime: 0,
    telegraphed: false,
    telegraphX: 0,
    telegraphY: 0
  };
  dir;
  constructor(seed = 1) {
    this.rng = new Rng(seed);
    this.ai.rng = this.rng;
    this.dir = {
      pool: this.pool,
      rng: this.rng,
      px: 0,
      py: 0,
      pmass: 10,
      pradius: 10,
      pheading: 0,
      camX: 0,
      camY: LIVE.ocean.depth * LIVE.ocean.startDepth,
      viewHalfDiag: 900,
      viewHalfW: 600,
      viewHalfH: 700,
      viewHeight: LIVE.camera.viewHeightAtStart,
      runTime: 0,
      keepAlive: [],
      surfaceOccupied: false,
      maxEntities: LIVE.director.arenaEntitiesPerPlayer
    };
    this.director.reset();
    this.director.seed(this.dir);
  }
  join(id, name) {
    const player = new Player();
    player.reset();
    player.x = this.rng.range(-LIVE.ocean.width * 0.35, LIVE.ocean.width * 0.35);
    player.y = LIVE.ocean.depth * LIVE.ocean.startDepth;
    const entry = {
      id,
      name: name.slice(0, 16),
      player,
      input: { heading: 0, boost: false, seq: 0 },
      banked: 0,
      alive: true,
      causeOfDeath: "",
      justDied: false,
      joinedAt: this.time
    };
    this.players.set(id, entry);
    return entry;
  }
  leave(id) {
    this.players.delete(id);
  }
  /**
   * The only thing a client is allowed to say. Heading is clamped to a real
   * angle and boost is a boolean — there is no position, no mass and no "I ate
   * that" in the protocol, so there is nothing to forge.
   */
  setInput(id, heading, boost, seq) {
    const e = this.players.get(id);
    if (!e || !Number.isFinite(heading)) return;
    e.input.heading = heading;
    e.input.boost = Boolean(boost);
    e.input.seq = Math.max(e.input.seq, seq | 0);
  }
  respawn(id) {
    const e = this.players.get(id);
    if (!e) return;
    e.player.reset();
    e.player.x = this.rng.range(-LIVE.ocean.width * 0.35, LIVE.ocean.width * 0.35);
    e.player.y = LIVE.ocean.depth * LIVE.ocean.startDepth;
    e.banked = 0;
    e.alive = true;
    e.causeOfDeath = "";
    e.justDied = false;
  }
  step(dt) {
    let remaining = Math.min(dt, 0.25);
    while (remaining > 0) {
      const h = Math.min(STEP, remaining);
      this.tick(h);
      remaining -= h;
    }
  }
  tick(dt) {
    this.time += dt;
    const alive = [...this.players.values()].filter((p) => p.alive);
    const biggest = alive.reduce((m, p) => Math.max(m, p.player.radius), 12);
    this.hash.setCellSize(Math.max(140, biggest * 2.4));
    this.hash.clear();
    const items = this.pool.items;
    for (let i = 0; i < items.length; i++) if (items[i].active) this.hash.insert(items[i]);
    for (let i = 0; i < items.length; i++) {
      const e = items[i];
      if (!e.active) continue;
      if (e.dying > 0) {
        e.dying -= dt * 6;
        if (e.dying <= 0) this.pool.release(e);
        continue;
      }
      const near = this.nearestPlayer(e.x, e.y, alive);
      const ref = near?.player;
      this.ai.px = ref ? ref.x : e.x;
      this.ai.py = ref ? ref.y : e.y;
      this.ai.pmass = ref ? ref.mass : 10;
      this.ai.pradius = ref ? ref.radius : 10;
      this.ai.pspeed = speedFor(this.ai.pmass, this.dir.viewHeight);
      this.ai.dt = dt;
      this.ai.runTime = this.time;
      e.threat = ref ? Director.classify(e.mass, ref.mass) : Threat.Standoff;
      if (e.role === Role.Bird) e.threat = Threat.Lethal;
      const dx = e.x - this.dir.camX;
      const dy = e.y - this.dir.camY;
      const range = this.dir.viewHalfDiag * LIVE.render.indicatorRange;
      if (dx * dx + dy * dy < range * range) {
        if (this.time - e.seen > 0.15) e.seenSince = this.time;
        e.seen = this.time;
      }
      stepEntity(e, this.ai);
      if (e.role !== Role.Bird) clampDepth(e, e.radius * 0.5);
    }
    for (const entry of alive) {
      entry.player.desiredHeading = entry.input.heading;
      entry.player.boosting = entry.input.boost;
      stepArenaPlayer(entry.player, dt);
    }
    this.collide(alive);
    this.runDirector(dt, alive);
  }
  nearestPlayer(x, y, alive) {
    let best = null;
    let bestD = Infinity;
    for (const a of alive) {
      const d = (a.player.x - x) ** 2 + (a.player.y - y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = a;
      }
    }
    return best;
  }
  /**
   * Every collision is decided here, on the server. A client can say where it
   * wants to swim; it cannot say what it ate or that it survived.
   */
  collide(alive) {
    const eat = LIVE.eat;
    for (const entry of alive) {
      const p = entry.player;
      const mouth = p.radius * eat.mouthRadiusScale;
      const reach = mouth + p.radius * eat.coneBonus;
      const scan = Math.max(reach, p.radius * eat.magnetRange) * 1.35 + p.radius * 2;
      const n = this.hash.query(p.x, p.y, scan);
      for (let i = 0; i < n; i++) {
        const e = this.hash.result[i];
        if (!e.active || e.dying > 0) continue;
        const dx = e.x - p.x;
        const dy = e.y - p.y;
        const d = Math.hypot(dx, dy);
        const threat = Director.classify(e.mass, p.mass);
        const lethal = e.role === Role.Bird ? true : threat === Threat.Lethal;
        if (p.airborne && e.role !== Role.Bird) continue;
        const edible = threat === Threat.Edible && e.role !== Role.Bird;
        if (edible) {
          const angle = Math.abs(
            Math.atan2(
              Math.sin(Math.atan2(dy, dx) - p.heading),
              Math.cos(Math.atan2(dy, dx) - p.heading)
            )
          );
          const hitR = (angle < eat.coneHalfAngle ? reach : mouth) + e.radius;
          if (d < hitR) {
            this.consume(entry, e.mass);
            e.dying = 1;
          }
          continue;
        }
        if (lethal) {
          const hitR = p.radius * 0.84 + e.radius * eat.predatorHitboxScale;
          if (e.role === Role.Bird && e.lunge <= 0) continue;
          if (d < hitR) {
            if (e.role === Role.Bird && p.mass >= LIVE.ocean.birdSurvivalMass) {
              if (p.mass >= e.mass * LIVE.ocean.birdEdibleRatio) {
                this.consume(entry, e.mass);
                entry.banked += e.mass * (LIVE.ocean.birdKillScore - 1) * scoreMultiplierAt(p.y);
                e.dying = 1;
                continue;
              }
              p.mass = Math.max(1, p.mass * (1 - LIVE.ocean.birdBite));
              p.radius = radiusFor(p.mass);
              e.lunge = 0;
              e.stateTimer = 6;
              continue;
            }
            this.killPlayer(entry, e.role === Role.Bird ? "a bird" : "something bigger");
            break;
          }
        }
      }
    }
    for (let i = 0; i < alive.length; i++) {
      for (let j = i + 1; j < alive.length; j++) {
        const a = alive[i];
        const b = alive[j];
        if (!a.alive || !b.alive) continue;
        if (a.player.airborne || b.player.airborne) continue;
        const d = Math.hypot(a.player.x - b.player.x, a.player.y - b.player.y);
        if (d > a.player.radius + b.player.radius) continue;
        const ratio = a.player.mass / b.player.mass;
        if (ratio >= LIVE.eat.lethalRatio) {
          this.consume(a, b.player.mass);
          this.killPlayer(b, `${a.name || "someone"}`);
        } else if (ratio <= LIVE.eat.edibleRatio) {
          this.consume(b, a.player.mass);
          this.killPlayer(a, `${b.name || "someone"}`);
        }
      }
    }
  }
  consume(entry, mass) {
    const p = entry.player;
    const g = LIVE.growth;
    let gain = mass * g.bite * 0.75;
    gain = Math.min(gain, p.mass * g.maxGainRatio);
    p.mass += gain;
    p.radius = radiusFor(p.mass);
    if (p.mass > p.peakMass) p.peakMass = p.mass;
    entry.banked += mass * scoreMultiplierAt(p.y) * p.chainMultiplier;
    p.registerBite();
  }
  killPlayer(entry, cause) {
    if (!entry.alive) return;
    entry.alive = false;
    entry.justDied = true;
    entry.causeOfDeath = cause;
    entry.player.alive = false;
  }
  /**
   * The director fills the water around ONE player per tick, round robin, so
   * every region of a busy room stays stocked without doing the work N times.
   */
  /** Aim the director's context at one player, without restocking yet. */
  aimAt(focus) {
    const p = focus.player;
    this.dir.px = p.x;
    this.dir.py = p.y;
    this.dir.pmass = p.mass;
    this.dir.pradius = p.radius;
    this.dir.pheading = p.heading;
    this.dir.camX = p.x;
    this.dir.camY = p.y;
    const viewH = viewHeightFor(p.mass);
    const viewW = viewH * 0.5;
    this.dir.viewHeight = viewH;
    this.dir.viewHalfH = viewH / 2;
    this.dir.viewHalfW = viewW / 2;
    this.dir.viewHalfDiag = Math.hypot(viewW, viewH) / 2;
    this.dir.runTime = this.time - focus.joinedAt;
  }
  runDirector(dt, alive) {
    if (alive.length === 0) return;
    this.cursor = (this.cursor + 1) % alive.length;
    this.aimAt(alive[this.cursor]);
    const keep = this.dir.keepAlive;
    keep.length = 0;
    let surface = false;
    for (let i = 0; i < alive.length; i++) {
      const q = alive[i].player;
      const vh = viewHeightFor(q.mass);
      const keepRadius = Math.hypot(vh * 0.5, vh) / 2 * LIVE.director.cullRing;
      if (i < this.keepPool.length) {
        this.keepPool[i].x = q.x;
        this.keepPool[i].y = q.y;
        this.keepPool[i].keepRadius = keepRadius;
      } else {
        this.keepPool.push({ x: q.x, y: q.y, keepRadius });
      }
      keep.push(this.keepPool[i]);
      if (bandAt(q.y) <= 1 /* Shallows */) surface = true;
    }
    this.dir.surfaceOccupied = surface;
    this.dir.maxEntities = Math.min(
      LIVE.director.arenaMaxEntities,
      LIVE.director.arenaEntitiesPerPlayer * alive.length
    );
    if (this.director.due(dt, this.dir)) {
      for (const entry of alive) {
        this.aimAt(entry);
        this.director.restock(this.dir);
      }
      this.aimAt(alive[this.cursor]);
    }
    this.director.visitorArrived = null;
  }
  /** What one player is allowed to know: what is near them, and nothing else. */
  snapshot(id) {
    const entry = this.players.get(id);
    if (!entry) return null;
    const p = entry.player;
    const range = Math.max(1400, p.radius * 60);
    const r2 = range * range;
    const fish = [];
    const items = this.pool.items;
    for (let i = 0; i < items.length; i++) {
      const e = items[i];
      if (!e.active || e.dying > 0) continue;
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      if (dx * dx + dy * dy > r2) continue;
      fish.push([
        e.id,
        Math.round(e.x),
        Math.round(e.y),
        Math.round(e.heading * 100) / 100,
        Math.round(e.mass * 10) / 10,
        e.shape,
        e.role,
        e.lunge > 0 ? 1 : 0,
        Math.round(e.telegraph * 100) / 100
      ]);
    }
    const others = [];
    for (const o of this.players.values()) {
      if (o.id === id || !o.alive) continue;
      const dx = o.player.x - p.x;
      const dy = o.player.y - p.y;
      if (dx * dx + dy * dy > r2) continue;
      others.push({
        id: o.id,
        name: o.name,
        x: Math.round(o.player.x),
        y: Math.round(o.player.y),
        h: Math.round(o.player.heading * 100) / 100,
        m: Math.round(o.player.mass * 10) / 10,
        b: o.player.boostActive
      });
    }
    return {
      t: Math.round(this.time * 1e3),
      seq: entry.input.seq,
      you: {
        x: Math.round(p.x * 10) / 10,
        y: Math.round(p.y * 10) / 10,
        heading: Math.round(p.heading * 1e3) / 1e3,
        mass: Math.round(p.mass * 10) / 10,
        alive: entry.alive,
        banked: Math.round(entry.banked),
        score: p.score(entry.banked),
        boosting: p.boostActive
      },
      fish,
      players: others
    };
  }
};

// ../src/lib/names.ts
function normalizeForFilter(raw) {
  return raw.toLowerCase().replace(/[0@]/g, "o").replace(/[1!|]/g, "i").replace(/3/g, "e").replace(/4/g, "a").replace(/[5$]/g, "s").replace(/7/g, "t").replace(/[^a-z]/g, "");
}
var BLOCKED = [
  "nigger",
  "nigga",
  "faggot",
  "kike",
  "spic",
  "chink",
  "tranny",
  "retard",
  "rape",
  "nazi",
  "hitler",
  "cunt",
  "whore",
  "slut",
  "pedo",
  "kys",
  /**
   * ROUND 25: the all-time board changed what a name costs.
   *
   * A name in a lobby is gone when the room empties. A name on the all-time
   * board sits on jayo's page, at the top, under his song, for as long as
   * nobody beats it — so the list widens from slurs to the words that would be
   * embarrassing there.
   *
   * Still short, and still chosen to avoid eating real names: no `cock`
   * (Cockburn, peacock), no `dick` (a name), no `cum` (Cumberland), no `sex`
   * (Sexton). The pattern lets letters repeat, so each of these also catches
   * its padded forms.
   */
  "fuck",
  "shit",
  "bitch",
  "wanker",
  "asshole",
  "porn"
];
var PATTERNS = BLOCKED.map((word) => new RegExp([...word].map((c) => `${c}+`).join("")));
function isBlockedName(raw) {
  const n = normalizeForFilter(raw);
  if (n.length === 0) return false;
  return PATTERNS.some((re) => re.test(n));
}
function cleanDisplayName(raw) {
  const trimmed = (raw ?? "").trim().replace(/\s+/g, " ");
  if (trimmed.length === 0) return null;
  const stripped = trimmed.replace(/[^\w .-]/g, "").slice(0, 12);
  if (stripped.trim().length < 2) return null;
  if (isBlockedName(stripped)) return null;
  return stripped;
}
function anonymousName() {
  return `fish${Math.floor(Math.random() * 900 + 100)}`;
}

// ../src/game/tiers.ts
var info = {
  index: 0,
  name: "fry",
  predators: false,
  schools: false,
  hunt: false,
  ambush: false,
  nextThreshold: 25,
  overflow: 0
};
function tierFor(mass) {
  const t = LIVE.tiers;
  const last = t.length - 1;
  let i = 0;
  for (let k = t.length - 1; k >= 0; k--) {
    if (mass >= t[k].mass) {
      i = k;
      break;
    }
  }
  info.index = i;
  info.overflow = 0;
  info.nextThreshold = i < last ? t[i + 1].mass : t[last].mass * 2.5;
  const row = t[info.index];
  info.name = row.name;
  info.predators = row.predators;
  info.schools = row.schools;
  info.hunt = row.hunt;
  info.ambush = row.ambush;
  return info;
}
function tierId(mass) {
  const t = tierFor(mass);
  return t.index + t.overflow;
}

// ../src/game/objectives.ts
var POOL = [
  (rng) => {
    const n = rng.int(18, 34);
    return { id: "eat", text: `eat ${n} fish`, target: n, read: (p) => p.bites };
  },
  (rng) => {
    const n = rng.int(6, 12);
    return { id: "chain", text: `chain ${n} in a row`, target: n, read: (p) => p.bestChain };
  },
  (rng) => {
    const n = rng.int(2, 4);
    return { id: "tier", text: `reach tier ${n + 1}`, target: n, read: (_p, tier) => tier };
  },
  (rng) => {
    const n = rng.int(45, 80);
    return { id: "survive", text: `survive ${n} seconds`, target: n, read: (p) => Math.floor(p.elapsed) };
  },
  (rng) => {
    const n = rng.int(120, 320);
    return { id: "size", text: `get to size ${n}`, target: n, read: (p) => Math.floor(p.peakMass) };
  },
  () => ({ id: "frenzy", text: "trigger a frenzy", target: 1, read: (p) => p.frenzy ? 1 : p.bestChain >= 10 ? 1 : 0 })
];
function rollObjectives(rng, count = 3) {
  const picks = [];
  const used = /* @__PURE__ */ new Set();
  let guard = 0;
  while (picks.length < count && guard++ < 50) {
    const t = POOL[rng.int(0, POOL.length - 1)](rng);
    if (used.has(t.id)) continue;
    used.add(t.id);
    picks.push({ ...t, progress: 0, done: false });
  }
  return picks;
}
function updateObjectives(list, p, tier) {
  let completed = null;
  for (const o of list) {
    if (o.done) continue;
    o.progress = Math.min(o.target, o.read(p, tier));
    if (o.progress >= o.target) {
      o.done = true;
      (completed ??= []).push(o);
    }
  }
  return completed ?? EMPTY;
}
var EMPTY = [];

// ../src/game/world.ts
var DEATH_CAUSES = {
  0: "a drifter",
  1: "a school",
  2: "a prowler",
  3: "a hunter",
  4: "an ambush"
};
var World = class {
  pool = new EntityPool(LIVE.director.maxEntities + 24);
  hash = new SpatialHash(180);
  director = new Director();
  player = new Player();
  rng = new Rng();
  events = [];
  /** Three per run. Something to aim at besides the score. */
  objectives = [];
  tier = 0;
  runTime = 0;
  /** Nearest lethal entity this step, for the HUD's threat readout. */
  nearestThreatDist = Infinity;
  /**
   * Where the thing that killed you was, at the moment it killed you. Used by
   * the fairness audit ("nobody dies to a predator that was never visible")
   * and, in phase 5, by the share card's cause-of-death line.
   */
  lastKiller = { x: 0, y: 0, role: 0, mass: 0, distance: 0, trackedFor: 0 };
  /** Deepest band the player reached this run, for the death card. */
  deepestBand = 0;
  /** The ocean's depth, exposed so tooling does not have to hardcode it. */
  oceanDepth = LIVE.ocean.depth;
  /** The seed this run was built from. Recorded, shared and replayed. */
  seed = 0;
  /**
   * The input log: the player's requested heading, quantised to a byte, once per
   * simulation step. At 60Hz a three-minute run is about 11KB before
   * compression, and it only ever leaves the device attached to a submitted
   * score.
   *
   * A fixed-size buffer, because nothing in a run may allocate. A run longer
   * than the buffer simply stops recording — the score is then unverifiable and
   * the server can reject it, which is the correct failure.
   */
  inputLog = new Uint8Array(LIVE.run.inputLogSteps);
  /**
   * Boost, one BIT per step, packed eight to a byte. It is half the input —
   * boost changes speed and burns mass — and a log without it replays a
   * different run from the one that was played.
   */
  boostLog = new Uint8Array(Math.ceil(LIVE.run.inputLogSteps / 8));
  inputCount = 0;
  /**
   * The screen's aspect ratio, which the DIRECTOR reads: view height is derived
   * from mass alone, but the spawn ring and the cull radius are measured
   * against the view's half-diagonal, and that depends on how wide the screen
   * is. A replay has to be given the same shape of window or it fills a
   * different ocean.
   *
   * Set from `viewport.w / viewport.h` DIRECTLY by the engine, never
   * re-derived from a ViewInfo: `(viewHeight * (w/h)) / viewHeight` is not
   * exactly `w/h` in floating point, and an ULP of difference on step one is a
   * different run by step nine thousand. The replay sets w = aspect and h = 1
   * so the division hands back the identical double.
   */
  aspect = 0.5;
  /**
   * False once anything has happened that the log cannot describe — the window
   * changed shape mid-run, or the run outlasted the buffer. An unverifiable run
   * is still a run; it just cannot go on a leaderboard, and saying so is better
   * than posting a number nobody can check.
   */
  verifiable = true;
  /** Points banked. Depth multiplies what a bite is worth, so it is tracked live. */
  banked = 0;
  ai = {
    px: 0,
    py: 0,
    pmass: 0,
    pradius: 0,
    pspeed: 0,
    viewHalfDiag: 600,
    hash: this.hash,
    rng: this.rng,
    dt: 0,
    runTime: 0,
    telegraphed: false,
    telegraphX: 0,
    telegraphY: 0
  };
  dir = {
    pool: this.pool,
    rng: this.rng,
    px: 0,
    py: 0,
    pmass: 0,
    pradius: 0,
    pheading: 0,
    camX: 0,
    camY: 0,
    viewHalfDiag: 600,
    viewHalfW: 300,
    viewHalfH: 400,
    viewHeight: LIVE.camera.viewHeightAtStart,
    runTime: 0,
    // One fish, so one point of interest. Reused, never reallocated per frame.
    keepAlive: [{ x: 0, y: 0, keepRadius: 900 }],
    surfaceOccupied: false,
    maxEntities: LIVE.director.maxEntities
  };
  reset(seed, view) {
    this.seed = seed ?? Date.now() >>> 0;
    this.rng = new Rng(this.seed);
    this.inputCount = 0;
    this.boostLog.fill(0);
    this.verifiable = true;
    this.ai.rng = this.rng;
    this.dir.rng = this.rng;
    this.pool.releaseAll();
    this.player.reset();
    this.director.reset();
    this.events.length = 0;
    this.objectives = rollObjectives(this.rng);
    this.tier = 0;
    this.deepestBand = 0;
    this.banked = 0;
    this.runTime = 0;
    this.nearestThreatDist = Infinity;
    this.syncDirector(view);
    this.director.seed(this.dir);
  }
  syncDirector(view) {
    const p = this.player;
    this.dir.px = p.x;
    this.dir.py = p.y;
    this.dir.pmass = p.mass;
    this.dir.pradius = p.radius;
    this.dir.pheading = p.heading;
    this.dir.runTime = this.runTime;
    this.dir.surfaceOccupied = bandAt(p.y) <= 1 /* Shallows */;
    if (view) {
      this.dir.camX = view.camX;
      this.dir.camY = view.camY;
      this.dir.viewHalfDiag = view.halfDiag;
      this.dir.viewHalfW = view.halfW;
      this.dir.viewHalfH = view.halfH;
      this.dir.viewHeight = view.viewHeight;
    }
    this.dir.keepAlive[0].x = p.x;
    this.dir.keepAlive[0].y = p.y;
    this.dir.keepAlive[0].keepRadius = this.dir.viewHalfDiag * LIVE.director.cullRing;
  }
  step(dt, view, sensitivity) {
    const p = this.player;
    if (!p.alive) return;
    this.runTime += dt;
    if (this.inputCount < this.inputLog.length) {
      const h = (p.desiredHeading % TAU + TAU) % TAU;
      const byte = Math.min(255, Math.round(h / TAU * 256)) & 255;
      const i = this.inputCount++;
      this.inputLog[i] = byte;
      if (p.boosting) this.boostLog[i >> 3] |= 1 << (i & 7);
      p.desiredHeading = byte / 256 * TAU;
    } else {
      this.verifiable = false;
    }
    if (p.airborne) {
      const impact = p.speed;
      if (p.stepAir(dt)) this.events.push({ type: "splash", x: p.x, y: 0, speed: impact });
      const halfW = LIVE.ocean.width / 2;
      p.x = Math.max(-halfW + p.radius, Math.min(halfW - p.radius, p.x));
    } else {
      p.step(dt, view.viewHeight, sensitivity);
      if (p.y < p.radius * 0.35 && Math.sin(p.heading) < -LIVE.ocean.breachMinUp) {
        p.beginBreach();
        this.events.push({ type: "breach", x: p.x, y: 0, heading: p.heading, speed: p.speed });
      } else {
        const hit = clampToWorld(p, p.radius);
        p.atSurface = hit.hitSurface;
      }
    }
    const band = bandAt(p.y);
    if (band > this.deepestBand) this.deepestBand = band;
    this.hash.setCellSize(Math.max(140, p.radius * 2.4));
    this.hash.clear();
    const items = this.pool.items;
    for (let i = 0; i < items.length; i++) {
      const e = items[i];
      if (e.active) this.hash.insert(e);
    }
    this.ai.px = p.x;
    this.ai.py = p.y;
    this.ai.pmass = p.mass;
    this.ai.pradius = p.radius;
    this.ai.pspeed = speedFor(p.mass, view.viewHeight);
    this.ai.viewHalfDiag = view.halfDiag;
    this.ai.dt = dt;
    this.ai.runTime = this.runTime;
    this.ai.telegraphed = false;
    const indicatorRange = view.halfDiag * LIVE.render.indicatorRange;
    const indicatorRange2 = indicatorRange * indicatorRange;
    for (let i = 0; i < items.length; i++) {
      const e = items[i];
      if (!e.active) continue;
      if (e.dying > 0) {
        e.dying -= dt * 6;
        if (e.dying <= 0) this.pool.release(e);
        continue;
      }
      e.threat = Director.classify(e.mass, p.mass);
      if (e.role === Role.Bird) e.threat = Threat.Lethal;
      {
        const dx = e.x - view.camX;
        const dy = e.y - view.camY;
        if (dx * dx + dy * dy < indicatorRange2) {
          if (this.runTime - e.seen > 0.15) e.seenSince = this.runTime;
          e.seen = this.runTime;
        }
      }
      stepEntity(e, this.ai);
      if (e.role !== Role.Bird) clampDepth(e, e.radius * 0.5);
    }
    if (this.ai.telegraphed) {
      this.events.push({ type: "threat-near", x: this.ai.telegraphX, y: this.ai.telegraphY });
    }
    this.collide(dt);
    this.syncDirector(view);
    this.director.step(dt, this.dir);
    if (this.director.visitorArrived) {
      this.events.push({ type: "visitor", name: this.director.visitorArrived });
      this.director.visitorArrived = null;
    }
    for (const done of updateObjectives(this.objectives, p, this.tier)) {
      this.events.push({ type: "objective", text: done.text });
    }
    const t = tierId(p.mass);
    if (t > this.tier) {
      this.tier = t;
      const info2 = tierFor(p.mass);
      this.events.push({
        type: "tier-up",
        tier: t,
        name: info2.overflow > 0 ? "the pond opens" : info2.name
      });
    } else if (t < this.tier) {
      this.tier = t;
    }
  }
  collide(dt) {
    const p = this.player;
    const eat = LIVE.eat;
    const mouth = p.radius * eat.mouthRadiusScale;
    const reach = mouth + p.radius * eat.coneBonus;
    const scanR = Math.max(reach, p.radius * eat.magnetRange) * 1.35 + p.radius * 2;
    const n = this.hash.query(p.x, p.y, scanR);
    let nearestLethal = Infinity;
    for (let i = 0; i < n; i++) {
      const e = this.hash.result[i];
      if (!e.active || e.dying > 0) continue;
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      const d = Math.hypot(dx, dy);
      if (p.airborne && e.role === Role.Bird && e.dying <= 0) {
        if (d < p.radius + e.radius * 0.5 * 1.25 && p.mass >= LIVE.ocean.breachKillMass) {
          this.banked += e.mass * LIVE.ocean.breachKillScore;
          this.events.push({ type: "bird-kill", x: e.x, y: e.y, mass: e.mass });
          e.dying = 1;
          e.eatenByX = e.x;
          e.eatenByY = e.y;
          continue;
        }
      }
      if (p.airborne && e.role !== Role.Bird) continue;
      if (e.threat === Threat.Lethal) {
        const gap = d - (p.radius + e.radius);
        if (gap < nearestLethal) nearestLethal = gap;
      }
      const edible = e.threat === Threat.Edible;
      if (edible) {
        const angle = Math.abs(
          Math.atan2(Math.sin(Math.atan2(dy, dx) - p.heading), Math.cos(Math.atan2(dy, dx) - p.heading))
        );
        const inCone = angle < eat.coneHalfAngle;
        const hitR = (inCone ? reach : mouth) + e.radius;
        if (d < hitR) {
          this.consume(e);
          continue;
        }
        if (d < mouth * eat.magnetRange) {
          const pull = eat.magnetPull * (1 - d / (mouth * eat.magnetRange)) * dt;
          e.x -= dx / (d || 1) * pull;
          e.y -= dy / (d || 1) * pull;
        }
        continue;
      }
      if (e.threat === Threat.Lethal) {
        const eRadius = e.role === Role.Bird ? e.radius * 0.5 : e.radius;
        const hitR = p.radius * 0.84 + eRadius * eat.predatorHitboxScale;
        if (e.role === Role.Bird && e.lunge <= 0) continue;
        if (d < hitR && e.role === Role.Bird) {
          if (p.mass < LIVE.ocean.birdSurvivalMass) {
            this.lastKiller.x = e.x;
            this.lastKiller.y = e.y;
            this.lastKiller.role = e.role;
            this.lastKiller.mass = e.mass;
            this.lastKiller.trackedFor = e.seenSince >= 0 ? this.runTime - e.seenSince : 0;
            this.kill("a bird");
            return;
          }
          if (p.mass >= e.mass * LIVE.ocean.birdEdibleRatio) {
            this.consume(e);
            this.banked += e.mass * (LIVE.ocean.birdKillScore - 1) * scoreMultiplierAt(p.y);
            this.events.push({ type: "bird-kill", x: e.x, y: e.y, mass: e.mass });
            continue;
          }
          p.mass = Math.max(1, p.mass * (1 - LIVE.ocean.birdBite));
          p.radius = radiusFor(p.mass);
          e.lunge = 0;
          e.telegraph = 0;
          e.stateTimer = 6;
          this.events.push({ type: "bird-hit", x: e.x, y: e.y });
          continue;
        }
        if (d < hitR) {
          this.lastKiller.x = e.x;
          this.lastKiller.y = e.y;
          this.lastKiller.role = e.role;
          this.lastKiller.mass = e.mass;
          this.lastKiller.distance = d;
          this.lastKiller.trackedFor = e.seenSince >= 0 ? this.runTime - e.seenSince : 0;
          this.kill(DEATH_CAUSES[e.role] ?? "something bigger");
          return;
        }
      }
    }
    const all = this.pool.items;
    for (let i = 0; i < all.length; i++) {
      const b = all[i];
      if (!b.active || b.role !== Role.Bird || b.lunge <= 0 || b.hunting <= 0) continue;
      const hits = this.hash.query(b.x, b.y, b.radius * 0.5 + 240);
      for (let j = 0; j < hits; j++) {
        const o = this.hash.result[j];
        if (!o.active || o.role === Role.Bird || o.dying > 0) continue;
        if (o.mass < LIVE.director.birdMinTarget) continue;
        const bd = Math.hypot(o.x - b.x, o.y - b.y);
        if (bd > b.radius * 0.5 + o.radius) continue;
        o.dying = 1;
        o.eatenByX = b.x;
        o.eatenByY = b.y;
        b.hunting = 0;
        b.lunge = 0;
        b.stateTimer = LIVE.director.birdRestAfterCatch;
        this.events.push({ type: "bird-catch", x: o.x, y: o.y, mass: o.mass });
        break;
      }
    }
    this.nearestThreatDist = nearestLethal;
  }
  consume(e) {
    const p = this.player;
    const g = LIVE.growth;
    const nextThreshold = tierFor(p.mass).nextThreshold;
    const falloff = 1 - g.falloff * Math.min(1, p.mass / nextThreshold);
    let gain = e.mass * g.bite * falloff;
    const ratio = Math.max(
      g.minGainRatio,
      g.maxGainRatio * Math.min(1, Math.pow(g.gainSoftCapMass / Math.max(1, p.mass), g.gainRatioExp))
    );
    gain = Math.min(gain, p.mass * ratio);
    p.mass += gain;
    p.radius = radiusFor(p.mass);
    if (p.mass > p.peakMass) p.peakMass = p.mass;
    this.banked += e.mass * scoreMultiplierAt(p.y) * p.chainMultiplier;
    const startedFrenzy = p.registerBite(gain);
    this.events.push({
      type: "bite",
      mass: e.mass,
      links: p.chainLinks,
      multiplier: p.chainMultiplier,
      x: e.x,
      y: e.y
    });
    if (startedFrenzy) this.events.push({ type: "frenzy-start", links: p.chainLinks });
    e.dying = 1;
    e.eatenByX = p.x;
    e.eatenByY = p.y;
  }
  kill(cause) {
    const p = this.player;
    if (!p.alive) return;
    p.alive = false;
    p.causeOfDeath = cause;
    this.events.push({ type: "death", stats: this.stats() });
  }
  stats() {
    const p = this.player;
    return {
      seed: this.seed,
      // Array.from: RunStats is serialised to JSON, and a typed array is not.
      inputLog: Array.from(this.inputLog.subarray(0, this.inputCount)),
      boostLog: Array.from(this.boostLog.subarray(0, this.inputCount + 7 >> 3)),
      aspect: this.aspect,
      verifiable: this.verifiable,
      startedAt: 0,
      durationMs: Math.round(p.elapsed * 1e3),
      peakMass: Math.round(p.peakMass * 10) / 10,
      tier: this.tier,
      bites: p.bites,
      bestChain: p.bestChain,
      // Nerve/gulp was cut, but the Supabase `runs` table still has a `gulps`
      // column and the insert names it. Always 0 rather than absent.
      gulps: 0,
      objectivesDone: this.objectives.filter((o) => o.done).length,
      objectives: this.objectives.map((o) => ({ text: o.text, done: o.done })),
      score: p.score(this.banked),
      causeOfDeath: p.causeOfDeath,
      // `deepestBand` is a band INDEX; bandName takes a y coordinate. Passing
      // the index scaled by 1e9 clamped every run to "the black", so the death
      // card told everybody they had been to the bottom of the ocean.
      deepest: bandLabel(this.deepestBand)
    };
  }
};

// ../src/game/replay.ts
var STEP2 = 1 / 60;
var TAU2 = Math.PI * 2;
var Replayer = class {
  world = new World();
  cam = new Camera();
  log;
  boost;
  i = 0;
  /** True once the log is exhausted or the fish is dead. */
  done = false;
  constructor(run) {
    this.cam.viewport.w = run.aspect;
    this.cam.viewport.h = 1;
    this.cam.viewport.dpr = 1;
    const startY = LIVE.ocean.depth * LIVE.ocean.startDepth;
    this.cam.reset(0, startY, LIVE.player.startMass);
    this.world.aspect = run.aspect;
    this.world.reset(run.seed, this.view());
    this.log = run.inputLog;
    this.boost = run.boostLog;
    if (this.log.length === 0) this.done = true;
  }
  // The engine's own order: the world is stepped with the camera as it was at
  // the START of the step, then the camera catches up. Anything else runs the
  // director one step out of phase with the game that was played.
  view() {
    const cam = this.cam;
    return {
      camX: cam.x,
      camY: cam.y,
      halfDiag: cam.halfDiagonal,
      halfW: cam.viewWidth / 2,
      halfH: cam.viewHeight / 2,
      viewHeight: cam.viewHeight
    };
  }
  /** Run up to `budget` more steps. Returns true when there is nothing left. */
  advance(budget) {
    const p = this.world.player;
    const end = Math.min(this.log.length, this.i + budget);
    for (; this.i < end; this.i++) {
      if (!p.alive) break;
      const i = this.i;
      p.desiredHeading = (this.log[i] ?? 0) / 256 * TAU2;
      p.boosting = ((this.boost[i >> 3] ?? 0) >> (i & 7) & 1) === 1;
      this.world.step(STEP2, this.view(), LIVE.player.sensitivity);
      this.cam.step(STEP2, p.x, p.y, p.heading, p.mass);
      this.world.events.length = 0;
    }
    if (this.i >= this.log.length || !p.alive) this.done = true;
    return this.done;
  }
  /** Steps run so far. Useful for reporting progress on a long verification. */
  get progress() {
    return this.i;
  }
  result() {
    const stats = this.world.stats();
    return {
      score: stats.score,
      peakMass: stats.peakMass,
      tier: stats.tier,
      bites: stats.bites,
      durationMs: stats.durationMs,
      steps: this.i,
      causeOfDeath: stats.causeOfDeath
    };
  }
};

// src/board.ts
var SIZE = 20;
var MAX_STEPS = LIVE.run.inputLogSteps;
var TOLERANCE = 0.02;
var RATE_PER_MIN = 6;
var Board = class {
  constructor(storage) {
    this.storage = storage;
  }
  storage;
  rows = [];
  loaded = false;
  /** address -> timestamps of recent submissions. Memory only; a restart forgives. */
  recent = /* @__PURE__ */ new Map();
  /** Diagnostics: how the submissions that arrived were resolved. */
  counts = { verified: 0, mismatch: 0, refused: 0, tooLow: 0 };
  async load() {
    if (this.loaded) return;
    const saved = await this.storage.get("rows");
    if (Array.isArray(saved)) this.rows = saved;
    this.loaded = true;
  }
  async list() {
    await this.load();
    return { board: this.rows, counts: this.counts };
  }
  /** The score a submission has to beat to be worth checking. */
  cutoff() {
    return this.rows.length < SIZE ? 0 : this.rows[this.rows.length - 1]?.score ?? 0;
  }
  limited(address, now) {
    const seen = (this.recent.get(address) ?? []).filter((t) => now - t < 6e4);
    seen.push(now);
    this.recent.set(address, seen);
    if (this.recent.size > 500) {
      for (const [k, v] of this.recent) {
        if (v.every((t) => now - t > 6e4)) this.recent.delete(k);
        if (this.recent.size <= 400) break;
      }
    }
    return seen.length > RATE_PER_MIN;
  }
  async submit(body, address, now) {
    await this.load();
    const s = body;
    if (!s || typeof s !== "object") return this.refuse("not a submission");
    const seed = Number(s.seed);
    const aspect = Number(s.aspect);
    const claimed = Number(s.claimed);
    const inputLog = s.inputLog;
    const boostLog = s.boostLog;
    if (!Number.isFinite(seed) || !Number.isFinite(claimed) || claimed <= 0) {
      return this.refuse("a run needs an ocean and a score");
    }
    if (!Number.isFinite(aspect) || aspect < 0.2 || aspect > 5) return this.refuse("impossible window");
    if (!Array.isArray(inputLog) || !Array.isArray(boostLog)) return this.refuse("no input log");
    if (inputLog.length === 0) return this.refuse("empty run");
    if (inputLog.length > MAX_STEPS) return this.refuse("run too long to check");
    if (boostLog.length < inputLog.length + 7 >> 3) return this.refuse("input log is incomplete");
    if (this.limited(address, now)) return this.refuse("too many runs too quickly");
    const cut = this.cutoff();
    if (claimed <= cut) {
      this.counts.tooLow++;
      return { ok: false, reason: "not a top score", cutoff: cut, board: this.rows };
    }
    let result;
    try {
      const run = { seed, aspect, inputLog, boostLog };
      const r = new Replayer(run);
      const slices = Math.ceil(inputLog.length / 1024) + 2;
      for (let n = 0; n < slices && !r.advance(1024); n++) ;
      result = r.result();
    } catch {
      return this.refuse("that run could not be replayed");
    }
    const off = Math.abs(result.score - claimed) / Math.max(1, claimed);
    if (off > TOLERANCE) {
      this.counts.mismatch++;
      return {
        ok: false,
        reason: "that run did not check out",
        cutoff: cut,
        board: this.rows
      };
    }
    const name = cleanDisplayName(typeof s.name === "string" ? s.name : "") ?? anonymousName();
    const row = {
      name,
      score: result.score,
      mass: result.peakMass,
      tier: result.tier,
      at: now
    };
    this.rows.push(row);
    this.rows.sort((a, b) => b.score - a.score);
    this.rows = this.rows.slice(0, SIZE);
    this.counts.verified++;
    await this.storage.put("rows", this.rows);
    const rank = this.rows.indexOf(row) + 1;
    return { ok: rank > 0, rank, score: result.score, board: this.rows };
  }
  refuse(reason) {
    this.counts.refused++;
    return { ok: false, reason, board: this.rows };
  }
};

// ../src/lib/build.ts
var BUILD_ID = "r28-stale-rooms";

// src/room.ts
var TICK_MS = 50;
var PROTOCOL = 3;
var IDLE_SHUTDOWN_MS = 6e4;
var MAX_PLAYERS = 40;
var ArenaRoom = class {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    void this.state;
    void this.env;
  }
  state;
  env;
  arena = new Arena(Date.now() >>> 0);
  clients = /* @__PURE__ */ new Map();
  timer = null;
  lastTick = Date.now();
  emptySince = Date.now();
  /** Diagnostics. Cheap, and the difference between a theory and an answer. */
  ticks = 0;
  /**
   * THE ALL-TIME BOARD, in the same class as a room because a Durable Object
   * namespace can only be created by a migration and the dashboard has no way
   * to write one. One instance of this class is addressed as 'leaderboard' and
   * never has a player in it; every other instance is an ocean and never
   * touches this. Built on first use, so a room pays nothing for it.
   */
  allTime = null;
  theBoard() {
    if (!this.allTime) this.allTime = new Board(this.state.storage);
    return this.allTime;
  }
  async fetch(request) {
    const path = new URL(request.url).pathname;
    if (path.endsWith("/board")) {
      return json(await this.theBoard().list());
    }
    if (path.endsWith("/board/score")) {
      if (request.method !== "POST") return json({ ok: false, reason: "post a run" }, 405);
      let body = null;
      try {
        body = await request.json();
      } catch {
        return json({ ok: false, reason: "not a submission" }, 400);
      }
      const address = request.headers.get("cf-connecting-ip") ?? "unknown";
      const verdict = await this.theBoard().submit(body, address, Date.now());
      return json(verdict);
    }
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response(
        JSON.stringify({
          ok: true,
          /**
           * WHICH CODE THIS ROOM IS ACTUALLY RUNNING.
           *
           * A Durable Object keeps the script version it was created with until
           * it is evicted from memory. `atlantic` is the room matchmaking sends
           * everybody to, so it was never idle long enough to die — and it sat
           * there for six rounds running the version from BEFORE the round-21
           * fixed-timestep fix, where `dt` is always zero and no fish ever
           * spawn. Every player landed in it. Every local measurement ran
           * against fresh code and looked perfect.
           *
           * It was only found because that old version's status response was
           * missing two fields. That was luck. This is the field that makes it
           * visible, and `pickRoom` in index.ts is what acts on it.
           */
          build: BUILD_ID,
          players: this.clients.size,
          uptimeSeconds: Math.round(this.arena.time),
          ticks: this.ticks,
          entities: this.arena.pool.items.filter((e) => e.active).length
        }),
        { headers: { "content-type": "application/json", "access-control-allow-origin": "*" } }
      );
    }
    if (this.clients.size >= MAX_PLAYERS) {
      return new Response("room full", { status: 503 });
    }
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    server.accept();
    const url = new URL(request.url);
    const name = cleanDisplayName(url.searchParams.get("name")) ?? anonymousName();
    const id = crypto.randomUUID().slice(0, 8);
    this.clients.set(id, { id, ws: server, lastSeen: Date.now() });
    this.arena.join(id, name);
    this.start();
    server.send(JSON.stringify({ type: "welcome", id, tickMs: TICK_MS, protocol: PROTOCOL, name }));
    server.addEventListener("message", (event) => {
      const entry = this.clients.get(id);
      if (entry) entry.lastSeen = Date.now();
      try {
        const msg = JSON.parse(String(event.data));
        if (msg.type === "input") {
          this.arena.setInput(id, Number(msg.h), Boolean(msg.b), Number(msg.seq) || 0);
        } else if (msg.type === "respawn") {
          this.arena.respawn(id);
        }
      } catch {
      }
    });
    const close = () => {
      this.clients.delete(id);
      this.arena.leave(id);
      if (this.clients.size === 0) this.emptySince = Date.now();
    };
    server.addEventListener("close", close);
    server.addEventListener("error", close);
    return new Response(null, { status: 101, webSocket: client });
  }
  /**
   * The live board, biggest first. Computed once per tick and shared by every
   * client in the room rather than per-snapshot, because it is the same list
   * for all of them and a room of forty would otherwise sort forty times.
   *
   * Mass rather than score, deliberately: in a shared ocean the thing you want
   * to know about the name above you is whether it can eat you.
   */
  cachedBoard = [];
  board() {
    return this.cachedBoard;
  }
  rebuildBoard() {
    const rows = [];
    for (const entry of this.arena.players.values()) {
      if (!entry.alive) continue;
      rows.push({ name: entry.name, mass: Math.round(entry.player.mass) });
    }
    rows.sort((a, b) => b.mass - a.mass);
    this.cachedBoard = rows.slice(0, 8);
  }
  start() {
    if (this.timer) return;
    this.lastTick = Date.now();
    this.timer = setInterval(() => this.tick(), TICK_MS);
  }
  tick() {
    const now = Date.now();
    const dt = TICK_MS / 1e3;
    this.ticks++;
    this.lastTick = now;
    if (this.clients.size === 0) {
      if (now - this.emptySince > IDLE_SHUTDOWN_MS && this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      return;
    }
    this.emptySince = now;
    this.arena.step(dt);
    this.rebuildBoard();
    for (const client of this.clients.values()) {
      if (client.ws.readyState !== 1) continue;
      const snap = this.arena.snapshot(client.id);
      if (!snap) continue;
      const entry = this.arena.players.get(client.id);
      try {
        if (entry?.justDied) {
          entry.justDied = false;
          client.ws.send(
            JSON.stringify({ type: "died", cause: entry.causeOfDeath, score: snap.you.score })
          );
        }
        client.ws.send(
          JSON.stringify({ type: "s", n: this.clients.size, board: this.board(), ...snap })
        );
      } catch {
      }
    }
    for (const client of [...this.clients.values()]) {
      if (now - client.lastSeen > 3e4) {
        try {
          client.ws.close(1001, "idle");
        } catch {
        }
        this.clients.delete(client.id);
        this.arena.leave(client.id);
      }
    }
  }
};
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "content-type",
      "access-control-allow-methods": "GET,POST,OPTIONS"
    }
  });
}

// src/index.ts
function arenaNamespace(env) {
  const preferred = env["ARENA"];
  if (isNamespace(preferred)) return preferred;
  for (const key of Object.keys(env)) {
    const value = env[key];
    if (isNamespace(value)) return value;
  }
  return null;
}
function isNamespace(v) {
  return typeof v === "object" && v !== null && typeof v.idFromName === "function";
}
var ROOMS = ["atlantic", "pacific", "coral", "kelp", "trench", "lagoon", "reef", "current"];
var SOFT_CAP = 24;
var HARD_CAP = 40;
async function pickRoom(arena) {
  const counts = await Promise.all(
    ROOMS.map(async (room) => {
      try {
        const res = await arena.get(arena.idFromName(room)).fetch("https://arena/status");
        const body = await res.json();
        return { room, players: Number(body.players) || 0, build: String(body.build ?? "") };
      } catch {
        return { room, players: HARD_CAP, build: "" };
      }
    })
  );
  let open = counts.filter((c) => c.players < HARD_CAP);
  if (open.length === 0) return null;
  const fresh = open.filter((c) => c.build === BUILD_ID);
  if (fresh.length > 0) open = fresh;
  const busy = open.filter((c) => c.players > 0 && c.players < SOFT_CAP);
  if (busy.length > 0) {
    return busy.reduce((best, c) => c.players > best.players ? c : best);
  }
  const empty = open.find((c) => c.players === 0);
  if (empty) return empty;
  return open.reduce((best, c) => c.players < best.players ? c : best);
}
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const arena = arenaNamespace(env);
    if (url.pathname === "/health") {
      return json2({
        ok: arena !== null,
        service: "sfbp-arena",
        build: BUILD_ID,
        durableObject: arena ? "bound" : "MISSING \u2014 add a Durable Object binding to this Worker",
        bindings: Object.keys(env)
      });
    }
    if (url.pathname === "/join") {
      if (!arena) return json2({ error: "no durable object binding on this Worker" }, 503);
      const pick = await pickRoom(arena);
      if (!pick) return json2({ full: true, rooms: ROOMS.length }, 503);
      return json2({ room: pick.room, players: pick.players });
    }
    if (url.pathname === "/board" || url.pathname === "/board/score") {
      if (!arena) return json2({ error: "no durable object binding on this Worker" }, 503);
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-headers": "content-type",
            "access-control-allow-methods": "GET,POST,OPTIONS",
            "access-control-max-age": "86400"
          }
        });
      }
      return arena.get(arena.idFromName("leaderboard")).fetch(request);
    }
    const match = url.pathname.match(/^\/room\/([a-z0-9-]{1,32})$/i);
    if (match) {
      if (!arena) {
        return json2({ error: "no durable object binding on this Worker" }, 503);
      }
      const id = arena.idFromName(match[1].toLowerCase());
      return arena.get(id).fetch(request);
    }
    return json2({ error: "not found", try: ["/health", "/join", "/board", "/room/atlantic"] }, 404);
  }
};
function json2(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
  });
}
export {
  ArenaRoom as Arena,
  ArenaRoom,
  ArenaRoom as Chat,
  ArenaRoom as ChatRoom,
  ArenaRoom as Container,
  ArenaRoom as Counter,
  ArenaRoom as DurableObjectExample,
  ArenaRoom as Globe,
  ArenaRoom as MyDurableObject,
  ArenaRoom as WebSocketHibernationServer,
  ArenaRoom as WebSocketServer,
  index_default as default
};
