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

export {
  FARule,
  DFARulebook,
  DFA,
  DFADesign
};
