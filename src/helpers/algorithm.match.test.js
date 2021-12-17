import { matchedMaturityStages} from './algorithm';

describe("Classify maturity stage matching", () => {
  test("no matching", () => {
      const maturityResults = [74,0,20,50];
      const expResult = [];

      expect(matchedMaturityStages(maturityResults)).toEqual(expResult);
  });

  test("match stage 1", () => {
    const maturityResults = [75,74,0,50];
    const expResult = [1];

    expect(matchedMaturityStages(maturityResults)).toEqual(expResult);
  });

  test("match stage 2", () => {
    const maturityResults = [74,75,0,50];
    const expResult = [2];

    expect(matchedMaturityStages(maturityResults)).toEqual(expResult);
  });
  
  test("match stage 3", () => {
    const maturityResults = [74,0,75,50];
    const expResult = [3];

    expect(matchedMaturityStages(maturityResults)).toEqual(expResult);
  });

  test("match stage 4", () => {
    const maturityResults = [74,74,0,75];
    const expResult = [4];

    expect(matchedMaturityStages(maturityResults)).toEqual(expResult);
  });

  test("match all stages", () => {
    const maturityResults = [75,80,90,100];
    const expResult = [1,2,3,4];

    expect(matchedMaturityStages(maturityResults)).toEqual(expResult);
  });

  test("match 3,4 and interpret as 4", () => {
    const maturityResults = [0,0,100,90];
    const expResult = [4];

    expect(matchedMaturityStages(maturityResults)).toEqual(expResult);
  });
  
  test("corrupt matching", () => {
    const maturityResults = [100,0,20,50,20];
    const expResult = [];

    expect(matchedMaturityStages(maturityResults)).toEqual(expResult);
  });
});
