const _ = require('./lodash');
const FARule = require('./FARule');
const { log } = require('./utils');

class NFARulebook {
  constructor(rules) {
    this.rules = rules;
  }

  nextStates(states, character) {
    return new Set(_.flatMap(Array.from(states), state => {
      return this.followRulesFor(state, character);
    }));
  }

  followRulesFor(state, character) {
    return this.rulesFor(state, character).map(rule => rule.follow());
  }

  rulesFor(state, character) {
    return this.rules.filter(rule => rule.appliesTo(state, character));
  }
}

class NFA {
  constructor(currentStates, acceptsStates, rulebook) {
    this.currentStates = currentStates;
    this.acceptStates = acceptsStates;
    this.rulebook = rulebook;
  }

  accepting() {
    return !_.isEmpty(_.intersection(Array.from(this.currentStates), this.acceptStates));
  }

  readCharacter(character) {
    this.currentStates = this.rulebook.nextStates(this.currentStates, character);
  }

  readString(string) {
    string.split('').forEach(char => {
      this.readCharacter(char);
    });
    return this;
  }
}

class NFADesign {
  constructor(startState, acceptStates, rulebook) {
    this.startState = startState;
    this.acceptStates = acceptStates;
    this.rulebook = rulebook;
  }

  accepts(string) {
    return this.toNFA().readString(string).accepting();
  }

  toNFA() {
    return NFA.new(new Set([this.startState]), this.acceptStates, this.rulebook);
  }
}

[NFARulebook, NFA, NFADesign].forEach(cls => {
  cls.new = (...args) => {
    return new cls(...args);
  };
});

function test() {
  let rulebook = NFARulebook.new([
          FARule.new(1, 'a', 1), FARule.new(1, 'b', 1), FARule.new(1, 'b', 2),
          FARule.new(2, 'a', 3), FARule.new(2, 'b', 3),
          FARule.new(3, 'a', 4), FARule.new(3, 'b', 4)
        ]);

  log(rulebook.nextStates(new Set([1]), 'b')); // Set { [ 1, 2 ] }
  log(rulebook.nextStates(new Set([1, 2]), 'a')); // Set { [ 1, 3 ] }
  log(rulebook.nextStates(new Set([1, 3]), 'b')); // Set { [ 1, 2, 4 ] }

  log(NFA.new(new Set([1]), [4], rulebook).accepting()); // false
  log(NFA.new(new Set([1, 2, 4]), [4], rulebook).accepting()); // true

  let nfa = NFA.new(new Set([1]), [4], rulebook);
  nfa.readCharacter('b');
  log(nfa.accepting()); // false
  nfa.readCharacter('a');
  log(nfa.accepting()); // false
  nfa.readCharacter('b');
  log(nfa.accepting()); // true
  nfa = NFA.new(new Set([1]), [4], rulebook);
  nfa.readString('bbbbb');
  log(nfa.accepting()); // true

  let nfaDesign = NFADesign.new(1, [4], rulebook);
  log(nfaDesign.accepts('bab'));
  log(nfaDesign.accepts('bbbbb'));
  log(nfaDesign.accepts('bbabb'));
}

test();

module.exports = {
  NFA,
  NFARulebook,
  NFADesign
};
