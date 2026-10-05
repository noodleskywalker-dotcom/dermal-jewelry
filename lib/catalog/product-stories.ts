/** Editorial design intent, not a claim about manufacture, history or the wearer. */
export type ProductStory = {
  word: string;
  atmosphere: { title: string; copy: string };
  signature: { title: string; copy: string; detail: string };
  expression: { title: string; copy: string };
};

export const productStories: Record<string, ProductStory> = {
  "desert-eye-love": {
    word: "Love",
    atmosphere: {
      title: "Love, held against the desert.",
      copy: "A quiet landscape. A deliberate mark. One point of deep red. DESERT EYE begins with the tension between an expression held inward and a sign worn where it can be seen.",
    },
    signature: {
      title: "A mark. A pulse.",
      copy: "The openwork symbol lets the space around it become part of the design. In the anti-eyebrow pair, the red accent answers it from below: two distinct pieces, one measured diagonal.",
      detail: "Openwork and deep red / The anti-eyebrow design language",
    },
    expression: {
      title: "The story becomes personal.",
      copy: "Choose the form that feels like your own punctuation. The symbol remains the starting point; the way you wear it gives it a different presence.",
    },
  },
  "horus-trace": {
    word: "Regard",
    atmosphere: {
      title: "A gaze, held in a line.",
      copy: "The design begins with the eye: a shape that seems to look back. HORUS TRACE brings its sweep, spiral and downward point into a small, watchful silhouette.",
    },
    signature: {
      title: "Follow the eye.",
      copy: "The upper curve draws the gaze across the form. A spiral curls inward; a pointed drop pulls it down. Each change of direction gives the still object its rhythm.",
      detail: "Curve, spiral, drop / A study in direction",
    },
    expression: {
      title: "Presence, without a word.",
      copy: "Held close to the face, the eye becomes a second point of attention. An expressive outline for someone drawn to symbols that leave room for their own meaning.",
    },
  },
  "blade-trace": {
    word: "Direction",
    atmosphere: {
      title: "Everything points forward.",
      copy: "A single diagonal can change the feeling of a face. BLADE TRACE takes the tension of a taper and turns it into an accent: poised, precise and full of direction.",
    },
    signature: {
      title: "From a circle to a point.",
      copy: "The open ring holds a moment of stillness. The short, ridged grip breaks the line before the long taper carries it onward. Contrast gives this small silhouette its character.",
      detail: "Ring, grip, taper / The silhouette in three gestures",
    },
    expression: {
      title: "Set your own direction.",
      copy: "Its energy comes from the line it draws beside the eye. An angular detail that makes a considered gesture feel decisive.",
    },
  },
  crossline: {
    word: "Pause",
    atmosphere: {
      title: "A line. Then, an interruption.",
      copy: "CROSSLINE begins with almost nothing: a long, calm stroke and a small crossing mark. That interruption is the entire idea—a quiet surface, changed by one deliberate decision.",
    },
    signature: {
      title: "The smallest shift matters.",
      copy: "Length sets the rhythm. The crossing mark stops it for a beat. Seen together, the two elements give simple geometry an unexpected emphasis.",
      detail: "Line and crossing mark / A study in proportion",
    },
    expression: {
      title: "Let restraint speak.",
      copy: "The form leaves space for the person wearing it. A small architectural accent, chosen for what it adds and for the quiet it keeps around it.",
    },
  },
  "ankh-trace": {
    word: "Continuity",
    atmosphere: {
      title: "A line that keeps returning.",
      copy: "The loop draws the eye around and back again. ANKH TRACE explores that sense of continuity through a familiar silhouette, reduced to an intimate scale.",
    },
    signature: {
      title: "Softness meets a straight line.",
      copy: "A rounded opening gives way to the crossbar and long stem. The contrast between the returning curve and the downward line is the centre of the design.",
      detail: "Loop, crossbar, stem / One continuous silhouette",
    },
    expression: {
      title: "Keep a meaning close.",
      copy: "Some shapes invite a personal reading. This one keeps its outline clear and its presence quiet, leaving the story you attach to it entirely yours.",
    },
  },
  "japanese-angel": {
    word: "Gesture",
    atmosphere: {
      title: "A gesture, caught mid-stroke.",
      copy: "JAPANESE ANGEL studies the movement inside a written form. Two characters become an open silhouette: pointed strokes, changing weight, a sense of the hand that might have drawn them.",
    },
    signature: {
      title: "The space is part of the word.",
      copy: "Each stroke has a direction; each opening gives it room. The design render explores how calligraphic contrast might become a small sculptural object.",
      detail: "Pointed strokes and open space / Concept render",
    },
    expression: {
      title: "A thought, still taking shape.",
      copy: "This is a concept study. Its piercing forms and production details are still to be resolved; for now, the invitation is to look closely at the character of the line.",
    },
  },
  "ankh-eye": {
    word: "Convergence",
    atmosphere: {
      title: "Two symbols find a centre.",
      copy: "An upright ankh sets the axis. Eyes extend to either side. ANKH + EYE imagines the moment two visual languages meet and become one balanced silhouette.",
    },
    signature: {
      title: "A centre. An outward gaze.",
      copy: "The loop rises above the horizontal sweep. Spirals and pointed drops add movement at the edges, drawing the eye away from the centre and back again.",
      detail: "Vertical axis and outward sweep / Concept render",
    },
    expression: {
      title: "A dialogue, still unfolding.",
      copy: "Known so far through a design render, this concept explores the balance between symbols. Piercing forms and production details remain in development.",
    },
  },
  "crimson-orbit": {
    word: "Gravity",
    atmosphere: {
      title: "A small centre of gravity.",
      copy: "A deep-red centre holds the eye while an open circle gives it room. CRIMSON ORBIT begins with that quiet pull: colour contained, light moving around it.",
    },
    signature: {
      title: "A circle, left open.",
      copy: "The polished outline almost closes around the faceted centre. That small opening lets the form breathe, balancing the depth of the red with a clear rim of light.",
      detail: "Open circle and faceted red / A study in balance",
    },
    expression: {
      title: "Keep your own centre.",
      copy: "An earlier study in concentration and restraint. Its rounded shape gives the face a single point of colour, leaving the surrounding space quiet.",
    },
  },
  "sand-vortex": {
    word: "Movement",
    atmosphere: {
      title: "The trace of something moving.",
      copy: "A spiral suggests a turn that has just come to rest. SAND VORTEX follows that motion inward, then lets a separate point settle beside it.",
    },
    signature: {
      title: "A turn. A point of stillness.",
      copy: "The open spiral gathers the line toward its centre. The smaller round point answers it across a little space, giving the pair a measured diagonal.",
      detail: "Open spiral and separate point / Two distinct tops",
    },
    expression: {
      title: "Carry a little movement.",
      copy: "This earlier study brings a fluid gesture close to the eye. The two elements work together while keeping their own shape and their own space.",
    },
  },
  "void-stud": {
    word: "Stillness",
    atmosphere: {
      title: "A pause in the light.",
      copy: "VOID STUD begins with a dark circle. Its quiet centre absorbs attention differently from a bright stone: a small pause, edged with light.",
    },
    signature: {
      title: "Darkness, given an edge.",
      copy: "The matte centre meets a polished outer rim. That contrast gives a simple disc its depth, with just enough reflection to make the outline clear.",
      detail: "Matte centre and polished rim / A study in contrast",
    },
    expression: {
      title: "Let a small detail hold its ground.",
      copy: "An earlier study in reduction. Its circular form keeps the gesture direct, for an expression built from very few elements.",
    },
  },
};
