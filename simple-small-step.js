class Number {
  constructor(value) {
    this.reducible = false;

    this.value = value;
  }

  toString() {
    return this.value.toString();
  }

  inspect() {
    return `«${this}»`;
  }
}

class Add {
  constructor(left, right) {
    this.reducible = true;

    this.left = left;
    this.right = right;
  }

  toString() {
    const {left, right} = this;
    return `${left} + ${right}`;
  }

  inspect() {
    return `«${this}»`;
  }

  reduce(env) {
    const {left, right} = this;
    if (left.reducible) {
      return Add.new(left.reduce(env), right);
    } else if (right.reducible) {
      return Add.new(left, right.reduce(env));
    } else {
      return Number.new(left.value + right.value);
    }
  }
}

class Multiply {
  constructor(left, right) {
    this.reducible = true;

    this.left = left;
    this.right = right;
  }

  toString() {
    const {left, right} = this;
    return `${left} * ${right}`;
  }

  inspect() {
    return `«${this}»`;
  }

  reduce(env) {
    const {left, right} = this;
    if (left.reducible) {
      return Multiply.new(left.reduce(env), right);
    } else if (right.reducible) {
      return Multiply.new(left, right.reduce(env));
    } else {
      return Number.new(left.value * right.value);
    }
  }
}

class Boolean {
  constructor(value) {
    this.reducible = false;

    this.value = value;
  }

  toString() {
    return this.value.toString();
  }

  inspect() {
    return `«${this}»`;
  }
}

class LessThan {
  constructor(left, right) {
    this.reducible = true;

    this.left = left;
    this.right = right;
  }

  toString() {
    const {left, right} = this;
    return `${left} < ${right}`;
  }

  inspect() {
    return `«${this}»`;
  }

  reduce(env) {
    const {left, right} = this;
    if (left.reducible) {
      return LessThan.new(left.reduce(env), right);
    } else if (right.reducible) {
      return LessThan.new(left, right.reduce(env));
    } else {
      return Boolean.new(left.value < right.value);
    }
  }
}

class Variable {
  constructor(name) {
    this.reducible = true;

    this.name = name;
  }

  toString() {
    return this.name.toString();
  }

  inspect() {
    return `«${this}»`;
  }

  reduce(env) {
    return env[this.name];
  }
}

class Assign {
  constructor(name, exp) {
    this.reducible = true;

    this.name = name;
    this.exp = exp;
  }

  toString() {
    const {name, exp} = this;
    return `${name} = ${exp}`;
  }

  inspect() {
    return `«${this}»`;
  }

  reduce(env) {
    const {name, exp} = this;
    if (exp.reducible) {
      return [Assign.new(name, exp.reduce(env)), env];
    } else {
      const e = {};
      e[name] = exp;
      return [DoNothing.new(), Object.assign({}, env, e)];
    }
  }
}

class If {
  constructor(condition, consequence, alternative) {
    this.reducible = true;

    this.condition = condition;
    this.consequence = consequence;
    this.alternative = alternative;
  }

  toString() {
    const {condition, consequence, alternative} = this;
    return `if (${condition}) { ${consequence} } else { ${alternative} }`;
  }

  inspect() {
    return `«${this}»`;
  }

  reduce(env) {
    const {condition, consequence, alternative} = this;
    if (condition.reducible) {
      return [If.new(condition.reduce(env), consequence, alternative), env];
    } else {
      if (condition.value === Boolean.new(true).value) {
        return [consequence, env];
      } else if (condition.value === Boolean.new(false).value) {
        return [alternative, env];
      }
    }
  }
}

class DoNothing {
  constructor() {
    this.reducible = false;
  }

  toString() {
    return 'do-nothing';
  }
  inspect() {
    return `«${this}»`;
  }
}

class Sequence {
  constructor(first, second) {
    this.reducible = true;

    this.first = first;
    this.second = second;
  }

  toString() {
    const {first, second} = this;
    return `${first}; ${second}`;
  }

  inspect() {
    return `«${this}»`;
  }

  reduce(env) {
    const {first, second} = this;
    if (first instanceof DoNothing) {
      return [second, env];
    } else {
      const [reducedFirst, reducedEnv] = first.reduce(env);
      return [Sequence.new(reducedFirst, second), reducedEnv];
    }
  }
}

class While {
  constructor(condition, body) {
    this.reducible = true;

    this.condition = condition;
    this.body = body;
  }

  toString() {
    const {condition, body} = this;
    return `while (${condition}) { ${body} }`;
  }

  inspect() {
    return `«${this}»`;
  }

  reduce(env) {
    const {condition, body} = this;
    return [If.new(condition, Sequence.new(body, this), DoNothing.new()), env];
  }
}

class Machine {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  step() {
    [this.state, this.env ] = this.state.reduce(this.env);
  }

  run() {
    while (this.state.reducible) {
      console.log(`${this.state}, ${this.env}`);
      this.step();
    }
    console.log(`${this.state}, ${this.env}`);
  }
}

[Number, Add, Multiply, Boolean,
  LessThan, Machine, Variable, Assign,
  If, DoNothing, Sequence, While].forEach(cls => {
    cls.new = function(...args) {
      return new cls(...args);
    };
  });

module.exports = {
  Number,
  Add,
  Multiply,
  Boolean,
  LessThan,
  Sequence,
  Variable,
  DoNothing,
  Assign,
  If,
  While,
  Machine
};
