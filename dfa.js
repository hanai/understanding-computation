function log(...args) {
  return console.log(...args);
}

class FARule {
  constructor(state, character, nextState) {
    this.state = state;
    this.character = character;
    this.nextState = nextState;
  }

  appliesTo(state, character) {
    return this.state === state && this.character === character;
  }

  follow() {
    return this.nextState;
  }

  inspect() {
    return `#<FARule ${this.state} --${this.character}--> ${this.nextState}`;
  }
}

class DFARulebook {
  constructor(rules) {
    this.rules = rules;
  }

  nextState(state, character) {
    return this.ruleFor(state, character).follow();
  }

  ruleFor(state, character) {
    const rule = this.rules.find(rule => {
      return rule.appliesTo(state, character);
    });

    return rule;
  }
}

class DFA {
  constructor(currentState, acceptStates, rulebook) {
    this.currentState = currentState;
    this.acceptStates = acceptStates;
    this.rulebook = rulebook;
  }

  accepting() {
    return this.acceptStates.includes(this.currentState);
  }

  readCharacter(character) {
    this.currentState = this.rulebook.nextState(this.currentState, character);
    return this;
  }

  readString(string) {
    string.split('').forEach(ch => {
      this.readCharacter(ch);
    });
    return this;
  }
}

class DFADesign {
  constructor(startState, acceptStates, rulebook) {
    this.startState = startState;
    this.acceptStates = acceptStates;
    this.rulebook = rulebook;
  }

  toDFA() {
    return DFA.new(this.startState, this.acceptStates, this.rulebook);
  }

  accepts(string) {
    return this.toDFA().readString(string).accepting();
  }
}

[FARule, DFARulebook, DFA, DFADesign].forEach(cls => {
  cls.new = function(...args) {
    return new cls(...args);
  };
});

function test() {
  const rulebook = DFARulebook.new([
    FARule.new(1, 'a', 2), FARule.new(1, 'b', 1),
    FARule.new(2, 'a', 2), FARule.new(2, 'b', 3),
    FARule.new(3, 'a', 3), FARule.new(3, 'b', 3)
  ]);

  log(rulebook.nextState(1, 'a')); // 2
  log(rulebook.nextState(1, 'b')); // 1
  log(rulebook.nextState(2, 'b')); // 3

  log(DFA.new(1, [1, 3], rulebook).accepting()); // true
  log(DFA.new(1, [3], rulebook).accepting()); // false

  let dfa = DFA.new(1, [3], rulebook);
  log(dfa.readCharacter('b').accepting()); // false
  for (let i = 0; i < 3; i++) {
    dfa.readCharacter('a');
  }
  log(dfa.accepting()); // false
  log(dfa.readCharacter('b').accepting()); // true

  dfa = DFA.new(1, [3], rulebook);
  log(dfa.readString('baaab').accepting()); // true

  let dfaDesign = DFADesign.new(1, [3], rulebook);
  log(dfaDesign.accepts('a')); // false
  log(dfaDesign.accepts('baa')); // false
  log(dfaDesign.accepts('baba')); // true
}

test();

module.exports = {
  FARule,
  DFARulebook,
  DFA
};
