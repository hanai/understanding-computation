function Number(value) {
  this.value = value;
}

Number.prototype = {
  evalute(env) {
    return this;
  },
  toString() {
    return this.value.toString();
  },
  inspect() {
    return `«${this}»`;
  }
}

function Boolean(value) {
  this.value = value;
}

Boolean.prototype = {
  evalute(env) {
    return this;
  },
  toString() {
    return this.value.toString();
  },
  inspect() {
    return `«${this}»`;
  }
}

function Variable(name) {
  this.name = name;
}

Variable.prototype = {
  evalute(env) {
    return env[this.name];
  }
}

function Add(left, right) {
  this.left = left;
  this.right = right;
}

Add.prototype = {
  evalute(env) {
    const {left, right} = this;
    return Number.new(left.evalute(env).value + right.evalute(env).value);
  }
};

function Multiply(left, right) {
  this.left = left;
  this.right = right;
}

Multiply.prototype = {
  evalute(env) {
    const {left, right} = this;
    return Number.new(left.evalute(env).value * right.evalute(env).value);
  }
};

function LessThan(left, right) {
  this.left = left;
  this.right = right;
}

LessThan.prototype = {
  evalute(env) {
    const {left, right} = this;
    return Boolean.new(left.evalute(env).value < right.evalute(env).value);
  }
};

function Assign(name, exp) {
  this.name = name;
  this.exp = exp;
}

Assign.prototype = {
  evalute(env) {
    const {name, exp} = this;
    const e = {};
    e[name] = exp.evalute(env);
    return Object.assign({}, env, e);
  }
};

function DoNothing() {
}

DoNothing.prototype = {
  evalute(env) {
    return env;
  }
};

function If(condition, consequence, alternative) {
}

If.prototype = {
  evalute(env) {
    const {condition, consequence, alternative} = this;
    const res = condition.evalute(env);
    if (res.value === Boolean.new(true).value) {
      return consequence.evalute(env);
    } else if (res.value === Boolean.new(false).value) {
      return alternative.evalute(env);
    }
  }
};

function Sequence(first, second) {
  this.first = first;
  this.second = second;
}

Sequence.prototype = {
  evalute(env) {
    const {first, second} = this;
    return second.evalute(first.evalute(env));
  }
};

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
