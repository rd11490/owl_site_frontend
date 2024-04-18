export class Composition {
  label: string = '';
  cluster?: number;
}

export class Player {
  teamName: string = '';
  player: string = '';
}

export interface PlotData {
  data: DataPointForPlot[];
  xLabel: string;
  yLabel: string;
}

export interface DataPointForPlot {
  color: string;
  label: string;
  size: number;
  sizeLabel: string;
  x: number;
  xLabel: string;
  y: number;
  yLabel: string;
  labelAdditional?: string;
}

export interface SearchRequest {
  aggregation: 'PLAYER' | 'HERO' | 'TEAM';
  composition?: number;
  heroes?: string[];
  mapNames?: string[];
  mapTypes?: string[];
  opponentComposition?: number;
  opponentTeams?: string[];
  players?: string[];
  stages?: string[];
  teams?: string[];
}

export class SetupResponse {
  comps: Composition[] = [];
  heroes: string[] = [];
  mapNames: string[] = [];
  mapTypes: string[] = [];
  players: Player[] = [];
  stats: string[] = [];
  stages: string[] = [];
  teams: string[] = [];
}

export class QueryResponse {
  data: QueryResponseRow[] = [];
  stats: string[] = [];
}

export class QueryResponseRow {
  teamName?: string;
  hero?: string;
  player?: string;

  allDamageDone?: number;
  criticalHits?: number;
  damageStickyBombs?: number;
  damageWeapon?: number;
  damageTaken?: number;
  deaths?: number;
  healingReceived?: number;
  heroDamageDone?: number;
  quickMeleeTicks?: number;
  shotsFired?: number;
  shotsHit?: number;
  shotsMissed?: number;
  stickyBombsDirectHits?: number;
  stickyBombsUseds?: number;
  timeAlive?: number;
  timeBuildingUltimate?: number;
  timePlayed?: number;
  ultimatesEarnedFractional?: number;
  assists?: number;
  barrierDamageDone?: number;
  blizzardKills?: number;
  damageBlizzard?: number;
  damageWeaponPrimary?: number;
  damageWeaponSecondary?: number;
  damageBlocked?: number;
  eliminations?: number;
  enemiesFrozen?: number;
  freezeSprayDamage?: number;
  icicleDamage?: number;
  objectiveTime?: number;
  offensiveAssists?: number;
  selfHealing?: number;
  successfulFreezes?: number;
  timeHacked?: number;
  timeHoldingUltimate?: number;
  totalTimeFrozen?: number;
  ultimatesUsed?: number;
  damageEmp?: number;
  damageQuickMelee?: number;
  enemiesEmpD?: number;
  enemiesHacked?: number;
  finalBlows?: number;
  objectiveKills?: number;
  quickMeleeHits?: number;
  timeDiscorded?: number;
  playersTeleported?: number;
  teleporterUptime?: number;
  teleportersPlaced?: number;
  damageCharge?: number;
  damageEarthshatter?: number;
  damageFireStrike?: number;
  earthshatterStuns?: number;
  rocketHammerMeleeHits?: number;
  rocketHammerMeleeHitsMultiple?: number;
  rocketHammerMeleeTicks?: number;
  damageJumpPack?: number;
  damagePrimalRageLeap?: number;
  damagePrimalRageMelee?: number;
  damagePrimalRageTotal?: number;
  environmentalKills?: number;
  jumpPackKills?: number;
  knockbackKills?: number;
  meleeFinalBlows?: number;
  meleeKills?: number;
  playersKnockedBack?: number;
  primalRageKills?: number;
  primalRageMeleeHits?: number;
  primalRageMeleeHitsMultiple?: number;
  primalRageMeleeTicks?: number;
  teslaCannonHits?: number;
  teslaCannonHitsMultiple?: number;
  teslaCannonTicks?: number;
  weaponKills?: number;
  grapplingClawUses?: number;
  rollUptime?: number;
  rollUses?: number;
  bioticGrenadeKills?: number;
  damageBioticGrenade?: number;
  damageWeaponScoped?: number;
  defensiveAssists?: number;
  healingBioticGrenade?: number;
  healingWeapon?: number;
  healingWeaponScoped?: number;
  healingAmplified?: number;
  healingDone?: number;
  nanoBoostAssists?: number;
  nanoBoostsApplied?: number;
  scopedHits?: number;
  scopedShots?: number;
  sleepDartShots?: number;
  unscopedHits?: number;
  unscopedShots?: number;
  amplificationMatrixCasts?: number;
  bioticLauncherHealingExplosions?: number;
  bioticLauncherHealingShots?: number;
  damagePrevented?: number;
  healingBioticLauncher?: number;
  healingRegenerativeBurst?: number;
  bioticOrbMaximumDamage?: number;
  bioticOrbMaximumHealing?: number;
  coalescenceHealing?: number;
  coalescenceKills?: number;
  damageBioticOrb?: number;
  damageCoalescence?: number;
  healingBioticOrb?: number;
  healingCoalescence?: number;
  healingSecondaryFire?: number;
  secondaryFireHits?: number;
  secondaryFireTicks?: number;
  damageBoosters?: number;
  damageMicroMissiles?: number;
  damagePistol?: number;
  environmentalDeaths?: number;
  mechDeaths?: number;
  mechsCalled?: number;
  selfDestructs?: number;
  ultimatesNegated?: number;
  armorRally?: number;
  armorProvided?: number;
  damageShieldBash?: number;
  healingInspire?: number;
  healingRepairPack?: number;
  inspireUptime?: number;
  ampedHealActivations?: number;
  ampedSpeedActivations?: number;
  healSongTimeElapsed?: number;
  healingHealingBoost?: number;
  healingHealingBoostAmped?: number;
  soundBarrierCasts?: number;
  soundBarriersProvided?: number;
  soundwaveKills?: number;
  speedSongTimeElapsed?: number;
  abilityDamageDone?: number;
  damageMeteorStrike?: number;
  damageRisingUppercut?: number;
  damageRocketPunch?: number;
  damageSeismicSlam?: number;
  shieldsCreated?: number;
  damagePulseBomb?: number;
  healthRecovered?: number;
  matchBlinksUsed?: number;
  pulseBombAttachRate?: number;
  pulseBombKills?: number;
  pulseBombsAttached?: number;
  recallsUsed?: number;
  criticalHitKills?: number;
  damageDragonstrike?: number;
  damageSonic?: number;
  damageStormArrows?: number;
  dragonstrikeKills?: number;
  reconAssists?: number;
  soloKills?: number;
  stormArrowKills?: number;
  chargeKills?: number;
  earthshatterKills?: number;
  fireStrikeKills?: number;
  multikills?: number;
  damageSelfDestruct?: number;
  damageGravitonSurge?: number;
  energyMaximum?: number;
  gravitonSurgeKills?: number;
  highEnergyKills?: number;
  lifetimeEnergyAccumulation?: number;
  primaryFireHits?: number;
  primaryFireTicks?: number;
  projectedBarrierDamageBlocked?: number;
  projectedBarriersApplied?: number;
  enemiesSlept?: number;
  sleepDartHits?: number;
  sleepDartSuccessRate?: number;
  damageAmplified?: number;
  meteorStrikeKills?: number;
  playersHalted?: number;
  superchargerAssists?: number;
  adaptiveShieldUses?: number;
  airUptime?: number;
  damageGrapplingClaw?: number;
  damagePiledriver?: number;
  damageTakenAdaptiveShield?: number;
  damageTakenBall?: number;
  damageTakenTank?: number;
  grapplingClawImpacts?: number;
  piledriverUses?: number;
  shieldingAdaptiveShield?: number;
  selfDestructKills?: number;
  accretionKills?: number;
  accretionStuns?: number;
  damageAccretion?: number;
  damageHyperspheres?: number;
  damageAbsorbed?: number;
  graviticFluxDamageDone?: number;
  graviticFluxKills?: number;
  hyperspheresDirectHits?: number;
  amplificationMatrixAssists?: number;
  healingImmortalityField?: number;
  immortalityFieldDeathsPrevented?: number;
  damageDeflect?: number;
  damageDragonblade?: number;
  damageDragonbladeTotal?: number;
  damageSwiftStrike?: number;
  damageSwiftStrikeDragonblade?: number;
  damageReflected?: number;
  deflectionKills?: number;
  dragonbladeKills?: number;
  dragonblades?: number;
  damageDuplicate?: number;
  damageFocusingBeam?: number;
  damageFocusingBeamBonusDamageOnly?: number;
  duplicateKills?: number;
  focusingBeamDealingDamageSeconds?: number;
  focusingBeamKills?: number;
  focusingBeamSeconds?: number;
  stickyBombsKills?: number;
  damageDiscordOrb?: number;
  damageWeaponCharged?: number;
  discordOrbTime?: number;
  harmonyOrbTime?: number;
  healingHarmonyOrb?: number;
  healingTranscendence?: number;
  transcendenceHealing?: number;
  bobGunDamage?: number;
  bobKills?: number;
  damageBob?: number;
  damageBobCharge?: number;
  damageCoachGun?: number;
  damageDynamite?: number;
  dynamiteKills?: number;
  scopedCriticalHits?: number;
  damageDeadeye?: number;
  damageFlashbang?: number;
  deadeyeKills?: number;
  fanTheHammerKills?: number;
  damageMinefield?: number;
  grapplingClawKills?: number;
  minefieldKills?: number;
  piledriverKills?: number;
  infraSightUptime?: number;
  damageCallMech?: number;
  scopedCriticalHitKills?: number;
  damageWeaponRecon?: number;
  damageWeaponSentry?: number;
  damageWeaponTank?: number;
  reconKills?: number;
  sentryKills?: number;
  barrageKills?: number;
  damageBarrage?: number;
  rocketBarrages?: number;
  rocketDirectHits?: number;
  ofRocketsFired?: number;
  damageSentryTurret?: number;
  photonProjectorKills?: number;
  primaryFireHitsHitsLevel?: number;
  secondaryDirectHits?: number;
  sentryTurretKills?: number;
  healingWeaponValkyrie?: number;
  playersResurrected?: number;
  playersSaved?: number;
  bioticFieldHealingDone?: number;
  bioticFieldsDeployed?: number;
  damageHelixRockets?: number;
  damageTacticalVisor?: number;
  helixRocketKills?: number;
  tacticalVisorKills?: number;
  tacticalVisors?: number;
  hooksAttempted?: number;
  turretsDestroyed?: number;
  blasterKills?: number;
  damageWeaponPistol?: number;
  damageMoltenCore?: number;
  moltenCoreKills?: number;
  turretDamage?: number;
  turretKills?: number;
  coachGunKills?: number;
  damageVenomMine?: number;
  concussionMineKills?: number;
  damageConcussionMine?: number;
  fragLauncherDirectHits?: number;
  damageSteelTrap?: number;
  enemiesTrapped?: number;
  overloadKills?: number;
  damageDeathBlossom?: number;
  deathBlossomKills?: number;
  deathBlossoms?: number;
  venomMineKills?: number;
  damageRipTire?: number;
  damageTotalMayhem?: number;
  ripTireKills?: number;
  damageWeaponHammer?: number;
  hammerKills?: number;
  damageChainHook?: number;
  damageWholeHog?: number;
  enemiesHooked?: number;
  wholeHogKills?: number;
  tankKills?: number;
  totalMayhemKills?: number;

  per10(): number {
    if (!this.timePlayed) {
      return 0;
    }
    return this.timePlayed / 600.0;
  }
}

export const intialSetup = new SetupResponse();

export interface PlayerCircuitPoints {
  teamId: string;
  teamName: string;
  playerId: string;
  ign: string;
  points: number;
  role: string[];
}

export class CircuitPointResponse {
  emeaPoints: PlayerCircuitPoints[] = [];
  naPoints: PlayerCircuitPoints[] = [];
}

export const initialCircuitPoints = new CircuitPointResponse();

export interface FaceitRoster {
  teamName: string;
  teamSize: number;
  playerIgn0: string;
  playerIgn1: string;
  playerIgn2: string;
  playerIgn3: string;
  playerIgn4: string;
  playerIgn5: string;
  playerIgn6: string;
  playerIgn7: string;
  coachIgn0: string;
}

export interface FaceitRosterResponse {
  [key: string]: FaceitRoster[];
}

export const initialFaceitRosterResponse = {};
