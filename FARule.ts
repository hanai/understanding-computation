class FARule {
  state: number;
  character: string;
  nextState: number;

  static new(state: number, character: string, nextState: number) {
    return new FARule(state, character, nextState);
  }

  constructor(state: number, character: string, nextState: number) {
    this.state = state;
    this.character = character;
    this.nextState = nextState;
  }

  appliesTo(state, character): boolean {
    return this.state === state && this.character === character;
  }

  follow(): number {
    return this.nextState;
  }

  inspect(): string {
    return `#<FARule ${this.state} --${this.character}--> ${this.nextState}`;
  }
}

export default FARule;
