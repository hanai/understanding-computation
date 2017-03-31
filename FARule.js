class FARule {
  constructor(state, character, nextState) {
    this.state = state;
    this.character = character;
    this.nextState = nextState;
  }

  appliesTo(state, character) {
    return this.state === state && this.character === character;
  }

  follow() {
    return this.nextState;
  }

  inspect() {
    return `#<FARule ${this.state} --${this.character}--> ${this.nextState}`;
  }
}

FARule.new = (...args) => {
  return new FARule(...args);
}

module.exports = FARule;
