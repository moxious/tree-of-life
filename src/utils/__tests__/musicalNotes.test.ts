// Test file for musical note utilities
// Functional programming approach with pure function testing

import { 
  calculateFrequency, 
  generateOctaveFrequencies, 
  isValidNoteName, 
  normalizeNoteName 
} from '../musicalNotes';

// Test calculateFrequency function
const testCalculateFrequency = () => {
  console.log('Testing calculateFrequency...');
  
  // Test A4 (should be 440 Hz)
  const a4Freq = calculateFrequency('A', 4);
  console.log(`A4 frequency: ${a4Freq} Hz (expected: 440 Hz)`);
  
  // Test C4 (middle C)
  const c4Freq = calculateFrequency('C', 4);
  console.log(`C4 frequency: ${c4Freq} Hz (expected: ~261.63 Hz)`);
  
  // Test sharp notes
  const cSharp4Freq = calculateFrequency('C♯', 4);
  console.log(`C♯4 frequency: ${cSharp4Freq} Hz (expected: ~277.18 Hz)`);
  
  // Test different octaves
  const c3Freq = calculateFrequency('C', 3);
  const c5Freq = calculateFrequency('C', 5);
  console.log(`C3 frequency: ${c3Freq} Hz (expected: ~130.81 Hz)`);
  console.log(`C5 frequency: ${c5Freq} Hz (expected: ~523.25 Hz)`);
  
  // Verify octave relationship (C5 should be 2x C4)
  const octaveRatio = c5Freq / c4Freq;
  console.log(`C5/C4 ratio: ${octaveRatio} (expected: ~2.0)`);
};

// Test generateOctaveFrequencies function
const testGenerateOctaveFrequencies = () => {
  console.log('\nTesting generateOctaveFrequencies...');
  
  const octaves = [3, 4, 5];
  const frequencies = generateOctaveFrequencies('C', octaves);
  
  console.log(`C note across octaves 3,4,5:`, frequencies);
  
  // Verify frequencies increase with octave
  const isIncreasing = frequencies.every((freq, index) => 
    index === 0 || freq > frequencies[index - 1]
  );
  console.log(`Frequencies are increasing: ${isIncreasing}`);
};

// Test validation functions
const testValidationFunctions = () => {
  console.log('\nTesting validation functions...');
  
  // Test valid note names
  const validNotes = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  validNotes.forEach(note => {
    const isValid = isValidNoteName(note);
    console.log(`${note} is valid: ${isValid}`);
  });
  
  // Test invalid note names
  const invalidNotes = ['C#', 'Db', 'H', 'X'];
  invalidNotes.forEach(note => {
    const isValid = isValidNoteName(note);
    console.log(`${note} is valid: ${isValid} (expected: false)`);
  });
};

// Test normalizeNoteName function
const testNormalizeNoteName = () => {
  console.log('\nTesting normalizeNoteName...');
  
  const testCases = [
    { input: 'C', expected: 'C' },
    { input: ' C ', expected: 'C' },
    { input: 'C♯', expected: 'C♯' },
    { input: 'c', expected: 'C' } // Should handle case
  ];
  
  testCases.forEach(({ input, expected }) => {
    try {
      const result = normalizeNoteName(input);
      console.log(`"${input}" -> "${result}" (expected: "${expected}")`);
    } catch (error) {
      console.log(`"${input}" -> Error: ${error}`);
    }
  });
};

// Run all tests
const runTests = () => {
  console.log('=== Musical Notes Utility Tests ===\n');
  
  try {
    testCalculateFrequency();
    testGenerateOctaveFrequencies();
    testValidationFunctions();
    testNormalizeNoteName();
    
    console.log('\n=== All tests completed ===');
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Export for use in browser console or other test runners
export { runTests };

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - expose test function
  (window as any).testMusicalNotes = runTests;
}
