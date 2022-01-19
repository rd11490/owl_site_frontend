import { camelize } from './camelize';

describe('camelize', () => {
  it("properly camelizes Enemies EMP'D", () => {
    expect(camelize("Enemies EMP'D")).toEqual('enemiesEmpD');
  });
  it('properly camelizes Damage - Pulse Bomb', () => {
    expect(camelize('Damage - Pulse Bomb')).toEqual('damagePulseBomb');
  });
});
