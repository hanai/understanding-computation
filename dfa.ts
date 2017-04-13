/*
 * 确定性有限自动机（Deterministic Finite Automaton，DFA）
 * 确定性：不管它当前处于什么状态，并且不管读入什么字符，最终所处的状态总是完全确定的。
 */

import FARule from './FARule';
import {log} from './utils';

// 规则手册
class DFARulebook {
  rules: Array<FARule>;

  static new(rules) {
    return new DFARulebook(rules);
  }

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
  currentState: number;
  acceptStates: Array<number>;
  rulebook: DFARulebook;

  static new(currentState: number, acceptStates: Array<number>, rulebook: DFARulebook) {
    return new DFA(currentState, acceptStates, rulebook);
  }

  constructor(currentState: number, acceptStates: Array<number>, rulebook: DFARulebook) {
    this.currentState = currentState;
    this.acceptStates = acceptStates;
    this.rulebook = rulebook;
  }

  // 是否处于接受状态
  accepting(): boolean {
    return this.acceptStates.includes(this.currentState);
  }

  readCharacter(character: string) {
    this.currentState = this.rulebook.nextState(this.currentState, character);
    return this;
  }

  readString(string: string) {
    string.split('').forEach(ch => {
      this.readCharacter(ch);
    });
    return this;
  }
}

class DFADesign {
  startState: number;
  acceptStates: Array<number>;
  rulebook: DFARulebook;

  static new(startState: number, acceptStates: Array<number>, rulebook: DFARulebook) {
    return new DFADesign(startState, acceptStates, rulebook);
  }

  constructor(startState: number, acceptStates: Array<number>, rulebook: DFARulebook) {
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

export {
  FARule,
  DFARulebook,
  DFA
};
