import { splitResponses, verifyInput } from './responses';

//Helper for wrapping a responses array in a survey object
//Skip irrelevant parts/fields (for now..)
const toSurvey = (responses) => {
  return {
    respHandle: {
      responses
    }
  };
}

describe("Validate correct input", () => {
  test("min values", () => {
      //At least one responder and there can never be less than 13 questions
      const inputResponses = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0]
      ];
      
      expect(() => verifyInput(inputResponses)).not.toThrowError();
  });

  test("max values", () => {
    //5 responders is NOT a "max"... there is no upper limit
    //Nor is 16 questions a max, just a realistic amount
    const inputResponses = [
      [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
      [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
      [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
      [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
      [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4]
    ];
    
    expect(() => verifyInput(inputResponses)).not.toThrowError();
  });
});

describe("Validate (generally) incorrect input", () => {
  test("different amount of answers", () => {
    //14 instead of 13
    const inputResponses = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0]
   ];
   
   expect(() => verifyInput(inputResponses)).toThrowError("Unexpected number of responses: 14");
  });

  test("invalid answer - out of range", () => {
    //5, not in range 0-4
    const inputResponses = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,5,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0]
   ];
   
   expect(() => verifyInput(inputResponses)).toThrowError("Unexpected answers: 5");
  });

  test("invalid answer - not a number", () => {
    //null, not in range 0-4
    const inputResponses = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,null,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0]
   ];
   
   expect(() => verifyInput(inputResponses)).toThrowError("Unexpected answers: ");
  });
});

describe("Split responses", () => {
  test("Only maturity (M13)", () => {
      const inputResponses = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,1,1,1,1,1,1,1,1,1,1,1,1],
        [2,2,2,2,2,2,2,2,2,2,2,2,2]
      ];
      const survey = toSurvey(inputResponses);
      const result = splitResponses(survey);
      //Nothing removed in maturity slicing and no efficiency included
      expect(result.maturity).toEqual(inputResponses);
      expect(result.efficiency).toEqual(null);
  });

  test("Only maturity (M13) but with additional questions", () => {
    const inputResponses = [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,4,4],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,3,3],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,4,4]
    ];
    const survey = toSurvey(inputResponses);
    const result = splitResponses(survey);
    //Additional questions removed in maturity slicing and no efficiency included
    const expMaturity = [
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,1,1,1,1,1,1],
      [2,2,2,2,2,2,2,2,2,2,2,2,2]
    ];
    expect(result.maturity).toEqual(expMaturity);
    expect(result.efficiency).toEqual(null);
  });

  test("Maturity and efficiency (M13_E3)", () => {
    const inputResponses = [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,3,3,3]
    ];
    const survey = toSurvey(inputResponses);
    const result = splitResponses(survey);
    //Maturity and efficiency sliced without any excess questions
    const expMaturity = [
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,1,1,1,1,1,1],
      [2,2,2,2,2,2,2,2,2,2,2,2,2]
    ];
    const expEfficiency = [
      [1,1,1],
      [2,2,2],
      [3,3,3]
    ];
    expect(result.maturity).toEqual(expMaturity);
    expect(result.efficiency).toEqual(expEfficiency);
  });

  test("Maturity and efficiency (M13_E3) with additional questions", () => {
    const inputResponses = [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,3],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,3,3,3,4,0]
    ];
    const survey = toSurvey(inputResponses);
    const result = splitResponses(survey);
    //Maturity and efficiency sliced with excess questions removed
    const expMaturity = [
      [0,0,0,0,0,0,0,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,1,1,1,1,1,1],
      [2,2,2,2,2,2,2,2,2,2,2,2,2]
    ];
    const expEfficiency = [
      [1,1,1],
      [2,2,2],
      [3,3,3]
    ];
    expect(result.maturity).toEqual(expMaturity);
    expect(result.efficiency).toEqual(expEfficiency);
  });
});