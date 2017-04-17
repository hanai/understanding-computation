import * as _ from 'lodash';
import FARule from './FARule';
import SetExt from './SetExt';

class NFARulebook {
  rules: Array<FARule>;

  static new(rules: Array<FARule>) {
    return new NFARulebook(rules);
  }

  constructor(rules: Array<FARule>) {
    this.rules = rules;
  }

  nextStates(states: SetExt<number>, character) {
    return new SetExt(_.flatMap(Array.from(states), state => {
      return this.followRulesFor(state, character);
    }));
  }

  followRulesFor(state, character) {
    return this.rulesFor(state, character).map(rule => rule.follow());
  }

  followFreeMoves(states) {
    const moreStates = this.nextStates(states, null);

    if (moreStates.subset(states)) {
      return states;
    } else {
      return this.followFreeMoves(states.union(moreStates));
    }
  }

  rulesFor(state, character) {
    return this.rules.filter(rule => rule.appliesTo(state, character));
  }
}

class NFA {
  private _currentStates: SetExt<number>;
  acceptStates: Array<number>;
  rulebook: NFARulebook;

  static new(currentStates: SetExt<number>, acceptsStates: Array<number>, rulebook: NFARulebook) {
    return new NFA(currentStates, acceptsStates, rulebook);
  }

  constructor(currentStates: SetExt<number>, acceptsStates: Array<number>, rulebook: NFARulebook) {
    this._currentStates = currentStates;
    this.acceptStates = acceptsStates;
    this.rulebook = rulebook;
  }

  get currentStates() {
    return this.rulebook.followFreeMoves(this._currentStates);
  }

  set currentStates(states) {
    this._currentStates = states;
  }

  accepting() {
    return !_.isEmpty(_.intersection(Array.from(this.currentStates), this.acceptStates));
  }

  readCharacter(character) {
    this.currentStates = this.rulebook.nextStates(this.currentStates, character);
    return this;
  }

  readString(string) {
    string.split('').forEach(char => {
      this.readCharacter(char);
    });
    return this;
  }
}

class NFADesign {
  startState: number;
  acceptStates: Array<number>;
  rulebook: NFARulebook;

  static new(startState: number, acceptStates: Array<number>, rulebook: NFARulebook) {
    return new NFADesign(startState, acceptStates, rulebook);
  }

  constructor(startState: number, acceptStates: Array<number>, rulebook: NFARulebook) {
    this.startState = startState;
    this.acceptStates = acceptStates;
    this.rulebook = rulebook;
  }

  accepts(string) {
    const nfa = this.toNFA();
    return nfa.readString(string).accepting();
  }

  toNFA(currentStates = new SetExt([this.startState])) {
    return NFA.new(currentStates, this.acceptStates, this.rulebook);
  }
}

export {
  NFA,
  NFARulebook,
  NFADesign
};
