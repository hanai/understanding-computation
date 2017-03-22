class Number {
  constructor(value) {
    this.value = value;
  }

  evalute(env) {
    return this;
  }

  toString() {
    return this.value.toString();
  }

  inspect() {
    return `«${this}»`;
  }
}

class Boolean {
  constructor(value) {
    this.value = value;
  }

  evalute(env) {
    return this;
  }

  toString() {
    return this.value.toString();
  }

  inspect() {
    return `«${this}»`;
  }
}

class Variable {
  constructor(name) {
    this.name = name;
  }

  evalute(env) {
    return env[this.name];
  }
}

class Add {
  constructor(left, right) {
    this.left = left;
    this.right = right;
  }

  evalute(env) {
    const {left, right} = this;
    return Number.new(left.evalute(env).value + right.evalute(env).value);
  }
}

class Multiply {
  constructor(left, right) {
    this.left = left;
    this.right = right;
  }

  evalute(env) {
    const {left, right} = this;
    return Number.new(left.evalute(env).value * right.evalute(env).value);
  }
}

class LessThan {
  constructor(left, right) {
    this.left = left;
    this.right = right;
  }

  evalute(env) {
    const {left, right} = this;
    return Boolean.new(left.evalute(env).value < right.evalute(env).value);
  }
}

class Assign {
  constructor(name, exp) {
    this.name = name;
    this.exp = exp;
  }

  evalute(env) {
    const {name, exp} = this;
    const e = {};
    e[name] = exp.evalute(env);
    return Object.assign({}, env, e);
  }
}

class DoNothing {
  evalute(env) {
    return env;
  }
}

class If {
  constructor(condition, consequence, alternative) {
    this.condition = condition;
    this.consequence = consequence;
    this.alternative = alternative;
  }

  evalute(env) {
    const {condition, consequence, alternative} = this;
    const res = condition.evalute(env);
    if (res.value === Boolean.new(true).value) {
      return consequence.evalute(env);
    } else if (res.value === Boolean.new(false).value) {
      return alternative.evalute(env);
    }
  }
}

class Sequence {
  constructor(first, second) {
    this.first = first;
    this.second = second;
  }

  evalute(env) {
    const {first, second} = this;
    return second.evalute(first.evalute(env));
  }
}

[Number, Boolean, Variable, Add,
  Multiply, LessThan, DoNothing, If,
  Sequence, Assign].forEach(cls => {
    cls.new = function (...args) {
      return new cls(...args);
    };
  });

module.exports = {
  Number,
  Boolean,
  Variable,
  Add,
  Assign,
  Multiply,
  LessThan,
  DoNothing,
  If,
  Sequence
};
