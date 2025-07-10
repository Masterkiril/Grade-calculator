const gradeToValue = {
  'E1': 1, 'E2': 2, 'E3': 3, 'E4': 4,
  'G2': 5, 'G3': 6, 'G4': 7, 'G5': 8, 'G6': 9
};

const valueToGrade = {
  1: 'E1', 2: 'E2', 3: 'E3', 4: 'E4',
  5: 'G2', 6: 'G3', 7: 'G4', 8: 'G5', 9: 'G6'
};

function calculateFinalGrade(grades) {
  // Проверка заполненности всех полей
  const requiredFields = ['e1', 'e2', 'e3', 'g2', 'g3', 'g4', 'g5', 'g6'];
  for (const field of requiredFields) {
    if (!grades[field]) {
      throw new Error(`Bitte wählen Sie eine Note für ${field}`);
    }
  }

  // Расчет средних значений за полугодия
  const semester1 = (gradeToValue[grades.e1] + gradeToValue[grades.e2] + gradeToValue[grades.e3]) / 3;
  const semester2 = (gradeToValue[grades.g2] + gradeToValue[grades.g3] + gradeToValue[grades.g4]) / 3;
  
  // Весовые коэффициенты
  const semester1Weighted = semester1 * 0.3;
  const semester2Weighted = semester2 * 0.3;
  const writtenExamWeighted = gradeToValue[grades.g5] * 0.2;
  const oralExamWeighted = gradeToValue[grades.g6] * 0.2;
  
  // Итоговый расчет
  const finalValue = semester1Weighted + semester2Weighted + writtenExamWeighted + oralExamWeighted;
  const roundedValue = Math.round(finalValue);
  
  return {
    grade: valueToGrade[roundedValue] || 'G6',
    details: {
      semester1: valueToGrade[Math.round(semester1)],
      semester2: valueToGrade[Math.round(semester2)],
      writtenExam: grades.g5,
      oralExam: grades.g6,
      calculation: `(${semester1.toFixed(2)}×0.3) + (${semester2.toFixed(2)}×0.3) + (${gradeToValue[grades.g5]}×0.2) + (${gradeToValue[grades.g6]}×0.2) = ${finalValue.toFixed(2)} ≈ ${roundedValue}`
    }
  };
}

function getPrognosis(finalGrade) {
  const value = gradeToValue[finalGrade];
  if (value <= 4) return 'Oberstufe Prognose';
  if (value === 5) return 'MSA Prognose';
  return 'ESA Prognose';
}

module.exports = { calculateFinalGrade, getPrognosis };