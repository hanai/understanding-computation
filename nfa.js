const _ = require('./lodash');
const FARule = require('./FARule');
const { log } = require('./utils');

class NFARulebook {
  constructor(rules) {
    this.rules = rules;
  }

  nextStates(states, character) {
    return new Set(_.flatMap(states, state => {
      return this.followRulesFor(state, character);
    }));
  }

  followRulesFor(state, character) {
    return this.rulesFor(state, character).map(rule => rule.follow());
  }

  rulesFor(state, character) {
    return this.rules.filter(rule => rule.appliesTo(state, character));
  }
}

[NFARulebook].forEach(cls => {
  cls.new = (...args) => {
    return new cls(...args);
  };
});

function test() {
  let rulebook = NFARulebook.new([
          FARule.new(1, 'a', 1), FARule.new(1, 'b', 1), FARule.new(1, 'b', 2),
          FARule.new(2, 'a', 3), FARule.new(2, 'b', 3),
          FARule.new(3, 'a', 4), FARule.new(3, 'b', 4)
        ]);

  log(rulebook.nextStates([1], 'b')); // Set { [ 1, 2 ] }
  log(rulebook.nextStates([1, 2], 'a')); // Set { [ 1, 3 ] }
  log(rulebook.nextStates([1, 3], 'b')); // Set { [ 1, 2, 4 ] }
}

test();

module.exports = {
  FARule,
  NFARulebook
};
