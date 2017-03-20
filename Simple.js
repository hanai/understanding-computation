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

Number.new = function(...args) {
  return new Number(...args);
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
  reduce() {
    const {left, right} = this;
    if (left.reducible) {
      return new Add(left.reduce(), right);
    } else if (right.reducible) {
      return new Add(left, right.reduce());
    } else {
      return new Number(left.value + right.value);
    }
  }
};

Add.new = function(...args) {
  return new Add(...args);
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
  reduce() {
    const {left, right} = this;
    if (left.reducible) {
      return new Multiply(left.reduce(), right);
    } else if (right.reducible) {
      return new Multiply(left, right.reduce());
    } else {
      return new Number(left.value * right.value);
    }
  }
};

Multiply.new = function(...args) {
  return new Multiply(...args);
};

module.exports = {
  Number,
  Add,
  Multiply
};
