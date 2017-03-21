function Number(value) {
  this.value = value;
}

Number.prototype = {
  reducible: false,
  toString() {
    return this.value.toString();
  },
  inspect() {
    return `«${this}»`;
  }
};

function Add(left, right) {
  this.left = left;
  this.right = right;
}

Add.prototype = {
  reducible: true,
  toString() {
    const {left, right} = this;
    return `${left} + ${right}`;
  },
  inspect() {
    return `«${this}»`;
  },
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
};

function Multiply(left, right) {
  this.left = left;
  this.right = right;
}

Multiply.prototype = {
  reducible: true,
  toString() {
    const {left, right} = this;
    return `${left} * ${right}`;
  },
  inspect() {
    return `«${this}»`;
  },
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
};

function Boolean(value) {
  this.value = value;
}

Boolean.prototype = {
  reducible: false,
  toString() {
    return this.value.toString();
  },
  inspect() {
    return `«${this}»`;
  }
};

function LessThan(left, right) {
  this.left = left;
  this.right = right;
}

LessThan.prototype = {
  reducible: true,
  toString() {
    const {left, right} = this;
    return `${left} < ${right}`;
  },
  inspect() {
    return `«${this}»`;
  },
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
};

function Variable(name) {
  this.name = name;
}

Variable.prototype = {
  reducible: true,
  toString() {
    return this.name.toString();
  },
  inspect() {
    return `«${this}»`;
  },
  reduce(env) {
    return env[this.name];
  }
};

function Assign(name, exp) {
  this.name = name;
  this.exp = exp;
}

Assign.prototype = {
  reducible: true,
  toString() {
    const {name, exp} = this;
    return `${name} = ${exp}`;
  },
  inspect() {
    return `«${this}»`;
  },
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
};

function If(condition, consequence, alternative) {
  this.condition = condition;
  this.consequence = consequence;
  this.alternative = alternative;
}

If.prototype = {
  reducible: true,
  toString() {
    const {condition, consequence, alternative} = this;
    return `if (${condition}) { ${consequence} } else { ${alternative} }`;
  },
  inspect() {
    return `«${this}»`;
  },
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
};

function DoNothing() {
}

DoNothing.prototype = {
  reducible: false,
  toString() {
    return 'do-nothing';
  },
  inspect() {
    return `«${this}»`;
  }
};

function Sequence(first, second) {
  this.first = first;
  this.second = second;
}

Sequence.prototype = {
  reducible: true,
  toString() {
    const {first, second} = this;
    return `${first}; ${second}`;
  },
  inspect() {
    return `«${this}»`;
  },
  reduce(env) {
    const {first, second} = this;
    if (first instanceof DoNothing) {
      return [second, env];
    } else {
      const [reducedFirst, reducedEnv] = first.reduce(env);
      return [Sequence.new(reducedFirst, second), reducedEnv];
    }
  }
};

function While(condition, body) {
  this.condition = condition;
  this.body = body;
}

While.prototype = {
  reducible: true,
  toString() {
    const {condition, body} = this;
    return `while (${condition}) { ${body} }`;
  },
  inspect() {
    return `«${this}»`;
  },
  reduce(env) {
    const {condition, body} = this;
    return [If.new(condition, Sequence.new(body, this), DoNothing.new()), env];
  }
};

function Machine(state, env) {
  this.state = state;
  this.env = env;
}

Machine.prototype = {
  step() {
    [this.state, this.env ] = this.state.reduce(this.env);
  },
  run() {
    while (this.state.reducible) {
      console.log(`${this.state}, ${this.env}`);
      this.step();
    }
    console.log(`${this.state}, ${this.env}`);
  }
};

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
