function log(...args) {
  return console.log(...args);
}

class Pattern {
  bracket(outerPrecedence) {
    if (this.precedence < outerPrecedence) {
      return `(${this.toString()})`;
    } else {
      return this.toString();
    }
  }

  inspect() {
    return `/${this}/`;
  }
}

class Empty extends Pattern {
  constructor() {
    super();

    this.precedence = 3;
  }

  toString() {
    return '';
  }
}

class Literal extends Pattern {
  constructor(character) {
    super();

    this.character = character;

    this.precedence = 3;
  }

  toString() {
    return this.character;
  }
}

class Concatenate extends Pattern {
  constructor(first, second) {
    super();

    this.first = first;
    this.second = second;

    this.precedence = 1;
  }

  toString() {
    return [this.first, this.second].map(pattern =>
      pattern.bracket(this.precedence)).join('');
  }
}

class Choose extends Pattern {
  constructor(first, second) {
    super();

    this.first = first;
    this.second = second;

    this.precedence = 0;
  }

  toString() {
    return [this.first, this.second].map(pattern =>
      pattern.bracket(this.precedence)).join('|');
  }
}

class Repeat extends Pattern {
  constructor(pattern) {
    super();

    this.pattern = pattern;
    this.precedence = 2;
  }

  toString() {
    return `${this.pattern.bracket(this.precedence)}*`;
  }
}

[Pattern, Empty, Literal, Concatenate, Choose, Repeat].forEach(cls => {
  cls.new = (...args) => { return new cls(...args); };
});

function test() {
  let pattern = Repeat.new(
    Choose.new(
      Concatenate.new(Literal.new('a'), Literal.new('b')),
      Literal.new('a')
    )
  );
  log(pattern); // /(ab|a)*/
}

test();

module.exports = {
  Pattern,
  Empty,
  Literal,
  Concatenate,
  Choose,
  Repeat
};
