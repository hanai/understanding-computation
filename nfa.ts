import * as _ from 'lodash';
import FARule from './FARule';
import SetExt from './SetExt';
import {log} from './utils';

class NFARulebook {
    rules: Array<FARule>;

    static new(rules: Array<FARule>) {
        return new NFARulebook(rules);
    }

    constructor(rules: Array<FARule>) {
        this.rules = rules;
    }

    nextStates(states: SetExt<number>, character) {
        return new SetExt(_.flatMap(Array.from(states), state => {
            return this.followRulesFor(state, character);
        }));
    }

    followRulesFor(state, character) {
        return this.rulesFor(state, character).map(rule => rule.follow());
    }

    followFreeMoves(states) {
        const moreStates = this.nextStates(states, null);

        if (moreStates.subset(states)) {
            return states;
        } else {
            return this.followFreeMoves(states.union(moreStates));
        }
    }

    rulesFor(state, character) {
        return this.rules.filter(rule => rule.appliesTo(state, character));
    }
}

class NFA {
    private _currentStates: SetExt<number>;
    acceptStates: Array<number>;
    rulebook: NFARulebook;

    static new(currentStates: SetExt<number>, acceptsStates: Array<number>, rulebook: NFARulebook) {
        return new NFA(currentStates, acceptsStates, rulebook);
    }

    constructor(currentStates: SetExt<number>, acceptsStates: Array<number>, rulebook: NFARulebook) {
        this._currentStates = currentStates;
        this.acceptStates = acceptsStates;
        this.rulebook = rulebook;
    }

    get currentStates() {
        return this.rulebook.followFreeMoves(this._currentStates);
    }

    set currentStates(states) {
        this._currentStates = states;
    }

    accepting() {
        return !_.isEmpty(_.intersection(Array.from(this.currentStates), this.acceptStates));
    }

    readCharacter(character) {
        this.currentStates = this.rulebook.nextStates(this.currentStates, character);
        return this;
    }

    readString(string) {
        string.split('').forEach(char => {
            this.readCharacter(char);
        });
        return this;
    }
}

class NFADesign {
    startState: number;
    acceptStates: Array<number>;
    rulebook: NFARulebook;

    static new(startState: number, acceptStates: Array<number>, rulebook: NFARulebook) {
        return new NFADesign(startState, acceptStates, rulebook);
    }

    constructor(startState: number, acceptStates: Array<number>, rulebook: NFARulebook) {
        this.startState = startState;
        this.acceptStates = acceptStates;
        this.rulebook = rulebook;
    }

    accepts(string) {
        const nfa = this.toNFA();
        return nfa.readString(string).accepting();
    }

    toNFA() {
        const currentStates = new SetExt([this.startState]);
        return NFA.new(currentStates, this.acceptStates, this.rulebook);
    }
}

function test() {
    let rulebook = NFARulebook.new([
        FARule.new(1, 'a', 1), FARule.new(1, 'b', 1), FARule.new(1, 'b', 2),
        FARule.new(2, 'a', 3), FARule.new(2, 'b', 3),
        FARule.new(3, 'a', 4), FARule.new(3, 'b', 4)
    ]);

    log(rulebook.nextStates(new SetExt([1]), 'b')); // Set { [ 1, 2 ] }
    log(rulebook.nextStates(new SetExt([1, 2]), 'a')); // Set { [ 1, 3 ] }
    log(rulebook.nextStates(new SetExt([1, 3]), 'b')); // Set { [ 1, 2, 4 ] }

    log(NFA.new(new SetExt([1]), [4], rulebook).accepting()); // false
    log(NFA.new(new SetExt([1, 2, 4]), [4], rulebook).accepting()); // true

    let nfa = NFA.new(new SetExt([1]), [4], rulebook);
    nfa.readCharacter('b');
    log(nfa.accepting()); // false
    nfa.readCharacter('a');
    log(nfa.accepting()); // false
    nfa.readCharacter('b');
    log(nfa.accepting()); // true
    nfa = NFA.new(new SetExt([1]), [4], rulebook);
    nfa.readString('bbbbb');
    log(nfa.accepting()); // true

    let nfaDesign = NFADesign.new(1, [4], rulebook);
    log(nfaDesign.accepts('bab')); // true
    log(nfaDesign.accepts('bbbbb')); // true
    log(nfaDesign.accepts('bbabb')); // false

    rulebook = NFARulebook.new([
        FARule.new(1, null, 2), FARule.new(1, null, 4),
        FARule.new(2, 'a', 3),
        FARule.new(3, 'a', 2),
        FARule.new(4, 'a', 5),
        FARule.new(5, 'a', 6),
        FARule.new(6, 'a', 4)
    ]);
    log(rulebook.nextStates(new SetExt([1]), null)); // Set { 2, 4 }
    log(rulebook.followFreeMoves(new SetExt([1]))); // Set { 1, 2, 4 }

    nfaDesign = NFADesign.new(1, [2, 4], rulebook);
    log(nfaDesign.accepts('aa')); // true
    log(nfaDesign.accepts('aaa')); // true
    log(nfaDesign.accepts('aaaaa')); // false
    log(nfaDesign.accepts('aaaaaa')); // true
}

// test();

export {
    NFA,
    NFARulebook,
    NFADesign
};
