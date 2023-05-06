import { Player } from '../models';

export const westTeams: string[] = [
  'Atlanta Reign',
  'Boston Uprising',
  'Dallas Fuel',
  'Florida Mayhem',
  'Los Angeles Gladiators',
  'Houston Outlaws',
  'London Spitfire',
  'New York Excelsior',
  'Paris Eternal',
  'San Francisco Shock',
  'Toronto Defiant',
  'Vancouver Titans',
  'Washington Justice',
];

const teamColors: { [key: string]: string } = {
  'Atlanta Reign': '#910F1B',
  'Boston Uprising': '#174B97',
  'Chengdu Hunters': '#FFA000',
  'Dallas Fuel': '#0072CE',
  'Florida Mayhem': '#CF4691',
  'Los Angeles Gladiators': '#3C1053',
  'Guangzhou Charge': '#122C42',
  'Houston Outlaws': '#97D700',
  'Hangzhou Spark': '#FB7299',
  'London Spitfire': '#59CBE8',
  'New York Excelsior': '#171C38',
  'Paris Eternal': '#8D042D',
  'Philadelphia Fusion': '#000000',
  'Seoul Dynasty': '#AA8A00',
  'San Francisco Shock': '#A5ACAF',
  'Shanghai Dragons': '#D22630',
  'Toronto Defiant': '#C10021',
  'Los Angeles Valiant': '#FFD100',
  'Vancouver Titans': '#2FB228',
  'Washington Justice': '#990034',
};

const heroColors: { [key: string]: string } = {
  Ana: '#718AB3',
  Ashe: '#67121D',
  Baptiste: '#3EA2CB',
  Bastion: '#7C8F7B',
  Brigitte: '#BE736E',
  Cassidy: '#AE595C',
  'D.Va': '#ED93C7',
  Doomfist: '#815049',
  Echo: '#04ADEF',
  Genji: '#97EF43',
  Hanzo: '#B9B48A',
  Junkrat: '#ECBD53',
  Lúcio: '#85C952',
  Mei: '#6FACED',
  Mercy: '#EBE8BB',
  Moira: '#803C51',
  Orisa: '#468C43',
  Pharah: '#3E7DCA',
  Reaper: '#7D3E51',
  Reinhardt: '#929DA3',
  Roadhog: '#B68C52',
  Sigma: '#5D81EB',
  'Soldier: 76': '#697794',
  Sombra: '#7359BA',
  Symmetra: '#8EBCCC',
  Torbjörn: '#C0726E',
  Tracer: '#D79342',
  Widowmaker: '#9E6AA8',
  Winston: '#A2A6BF',
  'Wrecking Ball': '#4D7883',
  Zarya: '#E77EB6',
  Zenyatta: '#EDE582',
};

//"#2178E9", "#67121D", "#3EA2CB", "#6E994D", "#F3B23A", "#FF7FD1", "#DDCCAC", "#04ADEF", "#84FE01", "#938848", "#D39308", "#8BEC22", "#C83C3C", "#9ADBF4", "#FFE16C", "#B3365D", "#BCC84A", "#2178E9", "#A49D86", "#AA958E", "#C19477", "#5DAB81", "#5D81EB", "#A07DC8", "#5CECFF", "#FF6200", "#F8911B", "#7878D4", "#8991A6", "#4D7883", "#F571A8", "#C79C00"

export const getTeamColor = (team: string): string => {
  return teamColors[team];
};

export const getPlayerColor = (player: string, teamsAndPlayers: Player[]): string => {
  const key = teamsAndPlayers.find((obj) => obj.player == player);
  if (key) {
    return teamColors[key.teamName];
  }
  return '#000000';
};

export const getHeroColor = (hero: string): string => {
  return heroColors[hero];
};
