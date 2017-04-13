import FARule from './FARule';
import {NFA, NFARulebook, NFADesign} from './nfa';
import {log} from './utils';

function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      derivedCtor.prototype[name] = baseCtor.prototype[name];
    });
  });
}

class Pattern {
  precedence: number;
  toNFADesign: () => NFADesign;

  bracket(outerPrecedence) {
    if (this.precedence < outerPrecedence) {
      return `(${this.toString()})`;
    } else {
      return this.toString();
    }
  }

  matches(string: string) {
    return this.toNFADesign().accepts(string);
  }

  inspect() {
    return `/${this}/`;
  }
}

class Empty implements Pattern {
  precedence: number;
  bracket: () => string;
  matches: (string: string) => boolean;
  inspect: () => string;

  static new() {
    return new Empty();
  }

  constructor() {
    this.precedence = 3;
  }

  toNFADesign(): NFADesign {
    const startState = Object.create(null);
    const acceptStates = [startState];
    const rulebook = NFARulebook.new([]);

    return NFADesign.new(startState, acceptStates, rulebook);
  }

  toString() {
    return '';
  }
}

applyMixins(Empty, [Pattern]);

class Literal implements Pattern {
  precedence: number;
  bracket: () => string;
  matches: (string: string) => boolean;
  inspect: () => string;
  character: string;

  static new(character: string) {
    return new Literal(character);
  }

  constructor(character: string) {
    this.character = character;

    this.precedence = 3;
  }

  toNFADesign() {
    const startState = Object.create(null);
    const acceptState = Object.create(null); // startState != acceptState
    const rule = FARule.new(startState, this.character, acceptState);
    const rulebook = NFARulebook.new([rule]);

    return NFADesign.new(startState, [acceptState], rulebook);
  }

  toString() {
    return this.character;
  }
}

applyMixins(Literal, [Pattern]);

class Concatenate implements Pattern {
  precedence: number;
  bracket: () => string;
  matches: (string: string) => boolean;
  inspect: () => string;
  first: Pattern;
  second: Pattern;

  static new(first: Pattern, second: Pattern) {
    return new Concatenate(first, second);
  }

  constructor(first: Pattern, second: Pattern) {
    this.first = first;
    this.second = second;

    this.precedence = 1;
  }

  toNFADesign() {
    const firstNFADesign = this.first.toNFADesign();
    const secondNFADesign = this.second.toNFADesign();

    const startState = firstNFADesign.startState;
    const acceptStates = secondNFADesign.acceptStates;
    const rules = firstNFADesign.rulebook.rules.concat(secondNFADesign.rulebook.rules);
    const extraRules = firstNFADesign.acceptStates.map(state => {
      return FARule.new(state, null, secondNFADesign.startState);
    });
    const rulebook = NFARulebook.new(rules.concat(extraRules));
    return NFADesign.new(startState, acceptStates, rulebook);
  }

  toString() {
    return [this.first, this.second].map(pattern =>
      pattern.bracket(this.precedence)).join('');
  }
}

applyMixins(Concatenate, [Pattern]);

class Choose implements Pattern {
  precedence: number;
  bracket: () => string;
  matches: (string: string) => boolean;
  inspect: () => string;
  first: Pattern;
  second: Pattern;

  static new(first, second) {
    return new Choose(first, second);
  }

  constructor(first, second) {
    this.first = first;
    this.second = second;

    this.precedence = 0;
  }

  toString() {
    return [this.first, this.second].map(pattern =>
      pattern.bracket(this.precedence)).join('|');
  }

  toNFADesign() {
    return NFADesign.new(1, [1], NFARulebook.new([]));
  }
}

applyMixins(Choose, [Pattern]);

class Repeat implements Pattern {
  precedence: number;
  bracket: () => string;
  matches: (string: string) => boolean;
  inspect: () => string;
  pattern: Pattern;

  static new(pattern) {
    return new Repeat(pattern);
  }

  constructor(pattern) {
    this.pattern = pattern;
    this.precedence = 2;
  }

  toString() {
    return `${this.pattern.bracket(this.precedence)}*`;
  }

  toNFADesign() {
    return NFADesign.new(1, [1], NFARulebook.new([]));
  }
}

applyMixins(Repeat, [Pattern]);

function test() {
  let pattern: Pattern = Repeat.new(
    Choose.new(
      Concatenate.new(Literal.new('a'), Literal.new('b')),
      Literal.new('a')
    )
  );
  log(pattern); // /(ab|a)*/
  let nfaDesign = Empty.new().toNFADesign();
  log(nfaDesign.accepts('')); // ture
  log(nfaDesign.accepts('a')); // false
  nfaDesign = Literal.new('a').toNFADesign();
  log(nfaDesign.accepts('')); // false
  log(nfaDesign.accepts('a')); // true
  log(nfaDesign.accepts('b')); // false
  log(Empty.new().matches('a')); // false
  log(Literal.new('a').matches('a')); // true
  pattern = Concatenate.new(Literal.new('a'),
    Concatenate.new(Literal.new('b'), Literal.new('c')));
  log(pattern);
  log(pattern.matches('a')); // false
  log(pattern.matches('ab')); // false
  log(pattern.matches('abc')); // true
}

test();

export {
  Pattern,
  Empty,
  Literal,
  Concatenate,
  Choose,
  Repeat
};
