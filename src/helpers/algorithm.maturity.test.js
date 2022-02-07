import { analyzeMaturity} from './algorithm';

//Helper for translating to answer range 0-4 (as in db backend)
const dbFormat = (responses) => {
  const transformed = responses.map(response =>
    response.map(v => v - 1)
  );
  return transformed;
}

describe("Analyze maturity matching", () => {
  test("min values", () => {
      const inputResponses = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0]
      ];
      const expAnalysisResult = [0,0,0,0];

      expect(analyzeMaturity(inputResponses)).toEqual(expAnalysisResult);
  });

  test("max values", () => {
    const inputResponses = [
      [4,4,4,4,4,4,4,4,4,4,4,4,4],
      [4,4,4,4,4,4,4,4,4,4,4,4,4],
      [4,4,4,4,4,4,4,4,4,4,4,4,4]
    ];
    const expAnalysisResult = [100,100,100,100];

    expect(analyzeMaturity(inputResponses)).toEqual(expAnalysisResult);
  });

  test("Just above Mean: Dependency and Inclusion", () => {
    //questions 1,5,9 and 13
    //Mean corresponds to avg of 10.00 
    //-> 4x11 + 1x8 -> avg 10.40 -> { 5 = 25*0.4/2 } -> 55%
    const inputResponses = dbFormat([
    /* |       |       |       | */
      [1,1,1,1,5,1,1,1,2,1,1,1,3],
      [2,1,1,1,4,1,1,1,4,1,1,1,1],
      [3,1,1,1,3,1,1,1,3,1,1,1,2],
      [4,1,1,1,2,1,1,1,4,1,1,1,1],
      [5,1,1,1,1,1,1,1,1,1,1,1,1]
    ]);
    const expAnalysisResult = [55,0,0,0];
    const result = analyzeMaturity(inputResponses); 
    result.forEach((r,i) => {
      expect(r).toBeCloseTo(expAnalysisResult[i]);
    });
  });

  test("Just below 25%: Counter-Dependency and Fight", () => {
    //questions 2,6 and 10
    //25% corresponds to avg of 5.00
    //-> 3x5 + 1x4 + 1x3 -> avg 4.40 -> { 3.6 = 9*0.4/1 } -> 19.6% = 20% (rounded)
    const inputResponses = dbFormat([
    /*   |       |       |       */
      [1,1,1,1,1,2,1,1,1,2,1,1,1],
      [1,3,1,1,1,1,1,1,1,1,1,1,1],
      [1,2,1,1,1,1,1,1,1,2,1,1,1],
      [1,1,1,1,1,2,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]);
    const expAnalysisResult = [0,20,0,0];
    const result = analyzeMaturity(inputResponses); 
    result.forEach((r,i) => {
      expect(r).toBeCloseTo(expAnalysisResult[i]);
    });
  });

  test("A bit below 75%: Trust and Structure", () => {
    //questions 3,7 and 11
    //75% corresponds to avg of 14.00
    //-> 13 + 14 + 14 + 15 + 12-> avg 13.6 -> { 15 = 25*0.6/1} -> 65%
    const inputResponses = dbFormat([
    /*     |       |       |     */
      [1,1,5,1,1,1,5,1,1,1,3,1,1],
      [1,1,4,1,1,1,5,1,1,1,5,1,1],
      [1,1,5,1,1,1,4,1,1,1,5,1,1],
      [1,1,5,1,1,1,5,1,1,1,5,1,1],
      [1,1,4,1,1,1,5,1,1,1,3,1,1]
    ]);
    const expAnalysisResult = [0,0,65,0];
    const result = analyzeMaturity(inputResponses); 
    result.forEach((r,i) => {
      expect(r).toBeCloseTo(expAnalysisResult[i]);
    });
  });

  test("A bit above 84%: Work and Productivity", () => {
    //questions 4,8 and 12
    //84% corresponds to avg of 14.00
    //-> 15 + 14 + 15 + 13 + 15-> avg 14.4 -> { 6.4 = 16*0.4/1} -> 90.4% (90 rounded)
    const inputResponses = dbFormat([
    /*       |       |       |   */
      [1,1,1,5,1,1,1,5,1,1,1,5,1],
      [1,1,1,4,1,1,1,5,1,1,1,5,1],
      [1,1,1,5,1,1,1,5,1,1,1,5,1],
      [1,1,1,3,1,1,1,5,1,1,1,5,1],
      [1,1,1,5,1,1,1,5,1,1,1,5,1]
    ]);
    const expAnalysisResult = [0,0,0,90];
    const result = analyzeMaturity(inputResponses); 
    result.forEach((r,i) => {
      expect(r).toBeCloseTo(expAnalysisResult[i]);
    });
  });
  
  test("Just below 16% Work and Productivity", () => {
    //questions 4,8 and 12
    //16% corresponds to avg of 11.00
    //-> 4x11 + 1x9-> avg 10.6 -> { 15.2 = 16*7.6/8 } -> 15.2% (15 rounded) 
    const inputResponses = dbFormat([
    /*       |       |       |   */
      [1,1,1,4,1,1,1,4,1,1,1,3,1],
      [1,1,1,3,1,1,1,3,1,1,1,5,1],
      [1,1,1,2,1,1,1,5,1,1,1,4,1],
      [1,1,1,1,1,1,1,5,1,1,1,5,1],
      [1,1,1,3,1,1,1,3,1,1,1,3,1]
    ]);
    const expAnalysisResult = [0,0,0,15];
    const result = analyzeMaturity(inputResponses); 
    result.forEach((r,i) => {
      expect(r).toBeCloseTo(expAnalysisResult[i]);
    });
  });
});

describe("Failed maturity analysis due to invalid input", () => {
  test("too few answers for maturity calc", () => {
    //12 instead of 13
    const inputResponses = [
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0]
   ];
   
   expect(() => analyzeMaturity(inputResponses)).toThrowError("Unexpected number of responses for maturity matching: 12");
  });

  test("too many answers for maturity calc", () => {
    //14 instead of 13
    const inputResponses = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0]
   ];
   
   expect(() => analyzeMaturity(inputResponses)).toThrowError("Unexpected number of responses for maturity matching: 14");
  });

});
