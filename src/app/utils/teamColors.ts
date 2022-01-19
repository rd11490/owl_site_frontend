import { Player } from '../models';

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
