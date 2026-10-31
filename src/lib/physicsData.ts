/**
 * CBSE Class 10 Physics Domain Model & Misconception Library
 * Directly sourced from Research Paper: "Adaptive Exam-Prep Tutoring with a Transparent Learner Model"
 * Tables 1, 2 & 6.
 */

export interface Misconception {
  id: string; // M1 to M8
  title: string;
  description: string;
  linkedConcepts: string[]; // e.g. ['E1', 'E8']
  commonPhrasings: string[];
  counterExampleIdea: string;
  remediationHint: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  misconceptionId?: string; // Distractor mapping to misconception
  distractorExplanation?: string;
}

export interface PhysicsQuestion {
  id: string;
  conceptId: string;
  difficultyDelta: number; // Elo delta difficulty rating (-2.0 to +2.5)
  prompt: string;
  options: QuestionOption[];
  correctOptionId: string;
  scientificExplanation: string;
  hintLadder: [string, string, string]; // 3-step hint ladder (guarded, never gives away the answer)
  counterExamplePrompt?: string;
}

export const MISCONCEPTIONS: Record<string, Misconception> = {
  M1: {
    id: 'M1',
    title: 'Current Used Up by Load',
    description: 'Belief that electric current is consumed or used up by a bulb or resistor, so current is smaller after the bulb.',
    linkedConcepts: ['E1', 'E8'],
    commonPhrasings: [
      'The bulb uses up electricity so less current comes out of the other side',
      'Current is consumed as energy by the lamp',
      'The ammeter after the bulb will read lower because charge was burnt'
    ],
    counterExampleIdea: 'Place ammeters in series immediately before and immediately after a light bulb; observe identical readings.',
    remediationHint: 'Charge is conserved. Current is the rate of flow of charge (like water in a closed loop pipe), not the energy carried. Energy is transferred, but every coulomb entering leaves.'
  },
  M2: {
    id: 'M2',
    title: 'Battery Constant Current Fallacy',
    description: 'Belief that a battery supplies the same fixed current regardless of what circuit is connected to it.',
    linkedConcepts: ['E2', 'E4'],
    commonPhrasings: [
      'A 9V battery always outputs 2A of current',
      'Batteries push the same amount of current through any resistor',
      'The source fixes current, not potential difference'
    ],
    counterExampleIdea: 'Connect the same 6V cell to a 10 ohm resistor vs a 1000 ohm resistor; observe current drops by 100x.',
    remediationHint: 'A battery maintains a constant potential difference (voltage), not a constant current. Current is determined by the total circuit resistance via Ohm\'s Law I = V/R.'
  },
  M3: {
    id: 'M3',
    title: 'Resistance Dependent on Applied Voltage',
    description: 'Belief that the physical resistance of a conductor changes dynamically with the applied voltage or current.',
    linkedConcepts: ['E4', 'E5'],
    commonPhrasings: [
      'If I double voltage, resistance doubles because R = V/I',
      'Increasing current increases resistance in an ohmic conductor',
      'R is a function of V'
    ],
    counterExampleIdea: 'Plot V vs I for a nichrome wire at constant temperature; the slope remains constant despite changing V.',
    remediationHint: 'For an ohmic conductor at constant temperature, resistance R = rho * L / A is an intrinsic property dependent on material, length, and cross-section, not on applied voltage.'
  },
  M4: {
    id: 'M4',
    title: 'Parallel Resistance Increase Fallacy',
    description: 'Intuitive belief that adding more resistors in parallel must increase the total equivalent resistance.',
    linkedConcepts: ['E7'],
    commonPhrasings: [
      'More resistors always mean more total opposition to current',
      'Adding a second parallel pathway increases total resistance',
      '1/Rp = 1/R1 + 1/R2 makes Rp bigger'
    ],
    counterExampleIdea: 'Compare water flow with 1 open toll booth vs 3 parallel toll booths; more parallel paths decrease total resistance.',
    remediationHint: 'Adding parallel branches provides additional alternative pathways for charge flow, decreasing overall equivalent resistance: 1/Rp = 1/R1 + 1/R2 + ... so Rp is always smaller than the smallest branch.'
  },
  M5: {
    id: 'M5',
    title: 'Equal Voltage Drop in Series',
    description: 'Belief that every resistor in a series circuit splits the voltage equally regardless of their individual resistance values.',
    linkedConcepts: ['E6'],
    commonPhrasings: [
      'In series, voltage divides into equal halves',
      'A 10 ohm and 100 ohm resistor in series each get 6V from a 12V supply',
      'Voltage divides equally across all components'
    ],
    counterExampleIdea: 'Connect 10 ohm and 90 ohm in series to 10V; voltmeter reads 1V across 10 ohm and 9V across 90 ohm.',
    remediationHint: 'In a series circuit, current I is identical through all components. Voltage drops in direct proportion to resistance: V_i = I * R_i.'
  },
  M6: {
    id: 'M6',
    title: 'Half-Lens Image Truncation',
    description: 'Belief that covering the top or bottom half of a converging lens cuts off half of the resulting image on a screen.',
    linkedConcepts: ['L6'],
    commonPhrasings: [
      'If you cover the top half of the lens, the top half of the candle disappear',
      'Only light through the open half reaches the screen so half the picture is lost',
      'The image is sliced in half'
    ],
    counterExampleIdea: 'Place cardboard over half of a projector lens; the projected image stays complete and sharp, only dimming in brightness.',
    remediationHint: 'Every point on an object emits light rays in all directions. Rays from every part of the object pass through every part of the lens. Covering half only reduces the total light collected, making the complete image dimmer.'
  },
  M7: {
    id: 'M7',
    title: 'Refraction Always Toward Normal',
    description: 'Belief that whenever light enters any new medium, it bends towards the normal line.',
    linkedConcepts: ['L4', 'L5'],
    commonPhrasings: [
      'Refracted light always bends towards the normal',
      'Light bends to the normal whenever it crosses any boundary',
      'Moving from glass to air bends towards the normal'
    ],
    counterExampleIdea: 'Shine a laser from inside glass block out into air; beam bends away from normal, towards the glass surface.',
    remediationHint: 'Light bends TOWARDS the normal only when moving from rarer to denser medium (speed decreases). When travelling from optically denser to rarer medium (e.g. glass to air), it bends AWAY from the normal.'
  },
  M8: {
    id: 'M8',
    title: 'Mirror Sign Convention Confusion',
    description: 'Treating all distances on both sides of a mirror or lens as positive values in formulas.',
    linkedConcepts: ['L3', 'L7'],
    commonPhrasings: [
      'Distances are lengths so they cannot be negative',
      'Focal length of convex mirror is negative or object distance is positive',
      'Signs only matter in math, not physics formulas'
    ],
    counterExampleIdea: 'Calculate image position for convex mirror with u=+20 vs u=-20; the Cartesian convention sets light direction as positive x.',
    remediationHint: 'Under the New Cartesian Sign Convention, the pole is origin (0,0). Distances measured opposite to incident light (in front of mirror) are negative (-u). Virtual focal lengths behind convex mirrors are positive.'
  }
};

export const INITIAL_CONCEPTS: Record<string, {
  name: string;
  unit: 'Electricity' | 'Light';
  prerequisites: string[];
  description: string;
  learningObjective: string;
  misconceptionIds: string[];
  initialMastery: number;
}> = {
  E1: {
    name: 'Electric charge & current',
    unit: 'Electricity',
    prerequisites: [],
    description: 'Quantization of charge, definition of current I = Q/t, SI unit Ampere, conventional current vs electron drift.',
    learningObjective: 'Calculate current and charge using I = Q/t; identify that charge is conserved.',
    misconceptionIds: ['M1'],
    initialMastery: 0.20
  },
  E2: {
    name: 'Potential difference',
    unit: 'Electricity',
    prerequisites: ['E1'],
    description: 'Work done per unit charge V = W/Q, 1 Volt definition, voltmeter connection in parallel.',
    learningObjective: 'State potential difference definition and connect voltmeter correctly.',
    misconceptionIds: ['M2'],
    initialMastery: 0.15
  },
  E3: {
    name: 'Circuit symbols & diagrams',
    unit: 'Electricity',
    prerequisites: ['E1'],
    description: 'Standard symbols for cells, switches, rheostats, ammeters, voltmeters, and complete closed loops.',
    learningObjective: 'Draw and interpret standard schematic electrical circuit diagrams.',
    misconceptionIds: [],
    initialMastery: 0.35
  },
  E4: {
    name: "Ohm's law & V-I graph",
    unit: 'Electricity',
    prerequisites: ['E1', 'E2'],
    description: 'V proportional to I at constant temperature; slope of V-I graph gives resistance R.',
    learningObjective: 'Solve V = IR numericals and interpret linear ohmic V-I characteristics.',
    misconceptionIds: ['M2', 'M3'],
    initialMastery: 0.25
  },
  E5: {
    name: 'Resistance & resistivity factors',
    unit: 'Electricity',
    prerequisites: ['E4'],
    description: 'Dependence on length (L), cross-sectional area (A), nature of material (rho), and temperature: R = rho * L / A.',
    learningObjective: 'Calculate resistance changes when wire is stretched, doubled, or material changed.',
    misconceptionIds: ['M3'],
    initialMastery: 0.18
  },
  E6: {
    name: 'Resistors in series',
    unit: 'Electricity',
    prerequisites: ['E4', 'E5'],
    description: 'Identical current through all components; voltage divides V = V1 + V2; equivalent resistance Rs = R1 + R2.',
    learningObjective: 'Calculate equivalent series resistance and potential drop across individual resistors.',
    misconceptionIds: ['M5'],
    initialMastery: 0.15
  },
  E7: {
    name: 'Resistors in parallel',
    unit: 'Electricity',
    prerequisites: ['E4', 'E5'],
    description: 'Identical potential difference across branches; current divides I = I1 + I2; 1/Rp = 1/R1 + 1/R2.',
    learningObjective: 'Calculate equivalent parallel resistance and branch currents in household parallel circuits.',
    misconceptionIds: ['M4'],
    initialMastery: 0.10
  },
  E8: {
    name: 'Joule heating effect',
    unit: 'Electricity',
    prerequisites: ['E4'],
    description: 'Heat generated H = I^2 R t = V I t; electric fuse, filament lamps, heating appliances.',
    learningObjective: 'Apply Joule heating formula and explain safety mechanism of electrical fuse wires.',
    misconceptionIds: ['M1'],
    initialMastery: 0.20
  },
  E9: {
    name: 'Electric power & commercial energy',
    unit: 'Electricity',
    prerequisites: ['E4', 'E8'],
    description: 'Electric power P = VI = I^2 R = V^2 / R; kilowatt-hour (kWh) commercial billing unit (1 kWh = 3.6 x 10^6 J).',
    learningObjective: 'Compute household electricity consumption in units (kWh) and appliance power ratings.',
    misconceptionIds: [],
    initialMastery: 0.12
  },
  L1: {
    name: 'Laws of reflection',
    unit: 'Light',
    prerequisites: [],
    description: 'Angle of incidence equals angle of reflection; incident ray, reflected ray, and normal lie in same plane.',
    learningObjective: 'Trace regular and diffused reflections on plane surfaces with angle calculations.',
    misconceptionIds: [],
    initialMastery: 0.40
  },
  L2: {
    name: 'Spherical mirrors ray diagrams',
    unit: 'Light',
    prerequisites: ['L1'],
    description: 'Concave and convex mirrors; focus, pole, centre of curvature, principal axis, 6 concave ray cases.',
    learningObjective: 'Construct accurate ray diagrams for concave and convex mirrors across object positions.',
    misconceptionIds: [],
    initialMastery: 0.28
  },
  L3: {
    name: 'Mirror formula & magnification',
    unit: 'Light',
    prerequisites: ['L2'],
    description: '1/v + 1/u = 1/f; magnification m = -v/u = h\'/h; Cartesian sign convention rules.',
    learningObjective: 'Solve mirror numericals with correct positive/negative sign assignment and nature determination.',
    misconceptionIds: ['M8'],
    initialMastery: 0.18
  },
  L4: {
    name: 'Laws of refraction & Snell\'s law',
    unit: 'Light',
    prerequisites: ['L1'],
    description: 'Snell\'s law sin(i) / sin(r) = constant; refraction at air-glass interface; bending toward/away from normal.',
    learningObjective: 'Predict ray direction when crossing optical boundaries of varying optical densities.',
    misconceptionIds: ['M7'],
    initialMastery: 0.22
  },
  L5: {
    name: 'Refractive index & speed of light',
    unit: 'Light',
    prerequisites: ['L4'],
    description: 'Absolute index n = c/v; relative refractive index n_21 = v1 / v2 = n2 / n1; optical density vs mass density.',
    learningObjective: 'Compute speed of light in optical mediums and relative indices.',
    misconceptionIds: ['M7'],
    initialMastery: 0.16
  },
  L6: {
    name: 'Image formation by spherical lenses',
    unit: 'Light',
    prerequisites: ['L4'],
    description: 'Convex (converging) and concave (diverging) lenses; optical centre, principal foci F1, F2.',
    learningObjective: 'Draw ray diagrams for real and virtual images produced by convex and concave lenses.',
    misconceptionIds: ['M6'],
    initialMastery: 0.20
  },
  L7: {
    name: 'Lens formula, magnification & power',
    unit: 'Light',
    prerequisites: ['L5', 'L6'],
    description: '1/v - 1/u = 1/f; m = v/u; Power of lens P = 1/f (in metres), SI unit dioptre (D).',
    learningObjective: 'Calculate power of corrective lenses in dioptres and solve lens formula numericals.',
    misconceptionIds: ['M8'],
    initialMastery: 0.14
  }
};

export const QUESTION_BANK: PhysicsQuestion[] = [
  {
    id: 'q_e1_01',
    conceptId: 'E1',
    difficultyDelta: -0.8,
    prompt: 'A current of 0.5 A is drawn by a filament of an electric bulb for 10 minutes. What is the amount of electric charge that flows through the circuit?',
    options: [
      { id: 'a', text: '5 C', isCorrect: false, distractorExplanation: 'Forgot to convert 10 minutes into seconds (used 0.5 * 10)' },
      { id: 'b', text: '300 C', isCorrect: true },
      { id: 'c', text: '120 C', isCorrect: false, distractorExplanation: 'Divided 60 by 0.5 incorrectly' },
      { id: 'd', text: '0.05 C', isCorrect: false, distractorExplanation: 'Calculation scale error' }
    ],
    correctOptionId: 'b',
    scientificExplanation: 'Charge Q = I * t. Time t = 10 min = 600 s. Q = 0.5 A * 600 s = 300 Coulombs.',
    hintLadder: [
      'Recall the relationship connecting current, electric charge, and time: I = Q / t.',
      'Check the SI unit of time: minutes must be converted to seconds (1 min = 60 s).',
      'Rearrange for charge: Q = I * t. Multiply 0.5 A by 600 s.'
    ]
  },
  {
    id: 'q_e1_02',
    conceptId: 'E1',
    difficultyDelta: 0.1,
    prompt: 'Two identical ammeters A1 and A2 are placed in a simple circuit: A1 is placed just before a glowing incandescent bulb, and A2 is placed just after the bulb. What will their readings show?',
    options: [
      { id: 'a', text: 'A1 reads greater than A2, because the bulb consumes current to produce light', isCorrect: false, misconceptionId: 'M1', distractorExplanation: 'Misconception M1: student thinks electric current is used up' },
      { id: 'b', text: 'A1 and A2 show identical readings', isCorrect: true },
      { id: 'c', text: 'A2 reads greater than A1 because charges speed up as they leave resistance', isCorrect: false, distractorExplanation: 'Charges do not speed up in steady state' },
      { id: 'd', text: 'A2 reads zero because current drops to zero after passing a load', isCorrect: false, misconceptionId: 'M1', distractorExplanation: 'Severe form of Misconception M1' }
    ],
    correctOptionId: 'b',
    scientificExplanation: 'Current is conserved in a closed series loop. Charge cannot accumulate or be destroyed in the bulb; the rate of charge entering the bulb equals the rate leaving.',
    hintLadder: [
      'Think about the Law of Conservation of Charge: can electrons be destroyed as they flow through a wire?',
      'Consider water flowing through an enclosed paddle wheel in a sealed pipe loop. Does less water exit than enters?',
      'Current is the rate of flow of charge, not energy. Energy is converted into light/heat, but charge flow rate remains identical.'
    ]
  },
  {
    id: 'q_e4_01',
    conceptId: 'E4',
    difficultyDelta: -0.2,
    prompt: 'The potential difference across the ends of an electric heater is 60 V when it draws a current of 4 A from the source. What current will the heater draw if the potential difference is increased to 120 V?',
    options: [
      { id: 'a', text: '4 A (the heater always draws its rated current)', isCorrect: false, misconceptionId: 'M2', distractorExplanation: 'Misconception M2: thinking current is constant regardless of V' },
      { id: 'b', text: '8 A', isCorrect: true },
      { id: 'c', text: '2 A', isCorrect: false, distractorExplanation: 'Inverted ratio' },
      { id: 'd', text: '16 A', isCorrect: false, distractorExplanation: 'Squared voltage mistakenly' }
    ],
    correctOptionId: 'b',
    scientificExplanation: "Resistance R = V1 / I1 = 60 V / 4 A = 15 ohms. When V2 = 120 V, current I2 = V2 / R = 120 / 15 = 8 A.",
    hintLadder: [
      "Use Ohm's Law (V = IR) to first calculate the resistance of the heater element.",
      "The resistance R = 60 / 4 = 15 ohms remains constant for the same heater.",
      "Now apply Ohm's Law again at the new voltage: I = 120 V / 15 ohms."
    ]
  },
  {
    id: 'q_e5_01',
    conceptId: 'E5',
    difficultyDelta: 0.5,
    prompt: 'A cylindrical wire of radius r and length L has resistance R. If the applied voltage across it is doubled from 10 V to 20 V, what happens to its physical resistance R?',
    options: [
      { id: 'a', text: 'Resistance doubles to 2R because R = V/I and V doubled', isCorrect: false, misconceptionId: 'M3', distractorExplanation: 'Misconception M3: treating resistance as a variable dependent on V' },
      { id: 'b', text: 'Resistance remains R, while current doubles to 2I', isCorrect: true },
      { id: 'c', text: 'Resistance is halved to R/2', isCorrect: false, distractorExplanation: 'Confused with reciprocal proportionality' },
      { id: 'd', text: 'Resistance drops to zero', isCorrect: false, distractorExplanation: 'Nonsensical distractor' }
    ],
    correctOptionId: 'b',
    scientificExplanation: "Resistance depends only on material resistivity, length, and cross-sectional area (R = rho * L / A). Increasing voltage doubles the current flow, leaving R unchanged.",
    hintLadder: [
      "Distinguish between what defines resistance physically vs what Ohm's law measures.",
      "What are the physical factors that decide the resistance of a cylindrical conductor?",
      "R = rho * L / A. Did the length, radius, or metal change when voltage was adjusted? No!"
    ]
  },
  {
    id: 'q_e7_01',
    conceptId: 'E7',
    difficultyDelta: 0.3,
    prompt: 'You have a circuit with a single 10 ohm resistor connected to a 12 V battery. You now add a second 10 ohm resistor in parallel with the first. What is the equivalent resistance of the circuit?',
    options: [
      { id: 'a', text: '20 ohms (adding resistors increases opposition)', isCorrect: false, misconceptionId: 'M4', distractorExplanation: 'Misconception M4: parallel addition treated like series addition' },
      { id: 'b', text: '5 ohms', isCorrect: true },
      { id: 'c', text: '10 ohms', isCorrect: false, distractorExplanation: 'Ignoring second branch' },
      { id: 'd', text: '100 ohms', isCorrect: false, distractorExplanation: 'Multiplying resistances' }
    ],
    correctOptionId: 'b',
    scientificExplanation: "For parallel resistors, 1/Rp = 1/R1 + 1/R2 = 1/10 + 1/10 = 2/10 = 1/5. Therefore Rp = 5 ohms. Adding parallel branches lowers the overall equivalent resistance.",
    hintLadder: [
      "Review the formula for equivalent resistance in parallel: 1/Rp = 1/R1 + 1/R2.",
      "Think about adding an extra checkout lane at a supermarket: does queue resistance increase or decrease?",
      "Substitute: 1/Rp = 1/10 + 1/10 = 2/10. Invert both sides to find Rp."
    ]
  },
  {
    id: 'q_e6_01',
    conceptId: 'E6',
    difficultyDelta: 0.2,
    prompt: 'A 2 ohm resistor and a 4 ohm resistor are connected in series across a 6 V battery. What is the voltage across the 4 ohm resistor?',
    options: [
      { id: 'a', text: '3 V across each resistor because voltage divides equally in series', isCorrect: false, misconceptionId: 'M5', distractorExplanation: 'Misconception M5: equal voltage drop fallacy' },
      { id: 'b', text: '4 V', isCorrect: true },
      { id: 'c', text: '6 V across both', isCorrect: false, distractorExplanation: 'Parallel rule confused with series' },
      { id: 'd', text: '2 V', isCorrect: false, distractorExplanation: 'Calculated voltage of the other resistor' }
    ],
    correctOptionId: 'b',
    scientificExplanation: "Total series resistance R_total = 2 + 4 = 6 ohms. Circuit current I = 6V / 6 ohms = 1 A. Voltage across 4 ohm resistor V_4 = I * R = 1 A * 4 ohms = 4 V.",
    hintLadder: [
      "In series, is current the same or is voltage the same across each component?",
      "Find total resistance first: R_s = R1 + R2.",
      "Calculate common current I = V / R_total, then find V2 = I * R2."
    ]
  },
  {
    id: 'q_l6_01',
    conceptId: 'L6',
    difficultyDelta: 0.2,
    prompt: 'A convex lens forms a sharp, real inverted image of a brightly lit candle on a screen. If an opaque black card is placed over the upper half of the lens, what will happen to the image on the screen?',
    options: [
      { id: 'a', text: 'The top half of the candle image will vanish', isCorrect: false, misconceptionId: 'M6', distractorExplanation: 'Misconception M6: half-lens cuts half image' },
      { id: 'b', text: 'The complete image of the candle remains, but its brightness is reduced', isCorrect: true },
      { id: 'c', text: 'The image inverts again and turns upright', isCorrect: false, distractorExplanation: 'Imagined optical inversion' },
      { id: 'd', text: 'The bottom half of the candle image vanishes', isCorrect: false, misconceptionId: 'M6', distractorExplanation: 'Misconception M6 variant' }
    ],
    correctOptionId: 'b',
    scientificExplanation: "Light rays from every point of the candle pass through all parts of the lens. The unblocked lower half still refracts rays from every point to form a complete image, but with half as much light collected, the image is dimmer.",
    hintLadder: [
      "Does light from the tip of the flame travel only through the top edge of the lens, or through every portion?",
      "Recall ray tracing: countless light rays emerge from each object point in a cone towards the entire aperture.",
      "The lower half still receives rays from top, middle, and bottom of the flame, forming the full image with lower intensity."
    ]
  },
  {
    id: 'q_l4_01',
    conceptId: 'L4',
    difficultyDelta: 0.1,
    prompt: 'A ray of light traveling inside a glass block (refractive index 1.5) emerges into air (refractive index 1.0) at an angle of incidence of 30 degrees. In which direction does the refracted ray bend relative to the normal?',
    options: [
      { id: 'a', text: 'It bends towards the normal because refracted light always bends towards the normal', isCorrect: false, misconceptionId: 'M7', distractorExplanation: 'Misconception M7: refraction always towards normal' },
      { id: 'b', text: 'It bends away from the normal', isCorrect: true },
      { id: 'c', text: 'It passes straight through without deviation', isCorrect: false, distractorExplanation: 'Only true at normal incidence' },
      { id: 'd', text: 'It reflects back at 90 degrees', isCorrect: false, distractorExplanation: 'Confused with critical angle' }
    ],
    correctOptionId: 'b',
    scientificExplanation: "When light travels from an optically denser medium (glass, n=1.5) to an optically rarer medium (air, n=1.0), its speed increases, causing the ray to bend AWAY from the normal.",
    hintLadder: [
      "Compare optical densities: is glass denser or rarer than air?",
      "What happens to the speed of light when it exits glass into air?",
      "When light speeds up upon entering a rarer medium, it bends away from the normal."
    ]
  },
  {
    id: 'q_l3_01',
    conceptId: 'L3',
    difficultyDelta: 0.4,
    prompt: 'An object is placed 15 cm in front of a concave mirror of focal length 10 cm. Using the New Cartesian Sign Convention, what are the assigned signs for object distance u and focal length f?',
    options: [
      { id: 'a', text: 'u = +15 cm, f = +10 cm (physical lengths are always positive)', isCorrect: false, misconceptionId: 'M8', distractorExplanation: 'Misconception M8: rejecting negative signs in optical coordinates' },
      { id: 'b', text: 'u = -15 cm, f = -10 cm', isCorrect: true },
      { id: 'c', text: 'u = -15 cm, f = +10 cm', isCorrect: false, distractorExplanation: 'Confusing concave mirror focal sign with convex' },
      { id: 'd', text: 'u = +15 cm, f = -10 cm', isCorrect: false, distractorExplanation: 'Object placed against light convention' }
    ],
    correctOptionId: 'b',
    scientificExplanation: "In the New Cartesian Sign Convention, the pole is the origin. The object is in front of the reflecting surface (measured opposite to incoming light), so u = -15 cm. A concave mirror's focus lies in front of the mirror, so f = -10 cm.",
    hintLadder: [
      "Where is the origin located according to the New Cartesian Sign Convention?",
      "Light travels from object towards the mirror (left to right). Distances measured opposite to this direction are negative.",
      "Both the object and the principal focus of a concave mirror lie in front of the mirror (left of pole), so both are negative."
    ]
  }
];
