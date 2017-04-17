import FARule from '../FARule';
import {
  NFA,
  NFARulebook,
  NFADesign
} from '../nfa';
import SetExt from '../SetExt';

export default function (t) {
  let rulebook = NFARulebook.new([
    FARule.new(1, 'a', 1), FARule.new(1, 'b', 1), FARule.new(1, 'b', 2),
    FARule.new(2, 'a', 3), FARule.new(2, 'b', 3),
    FARule.new(3, 'a', 4), FARule.new(3, 'b', 4)
  ]);

  t.true(rulebook.nextStates(new SetExt([1]), 'b').equal(new Set([ 1, 2 ])));
  t.true(rulebook.nextStates(new SetExt([1, 2]), 'a').equal(new Set([1, 3])));
  t.true(rulebook.nextStates(new SetExt([1, 3]), 'b').equal(new Set([1, 2, 4])));

  t.false(NFA.new(new SetExt([1]), [4], rulebook).accepting());
  t.true(NFA.new(new SetExt([1, 2, 4]), [4], rulebook).accepting());

  let nfa = NFA.new(new SetExt([1]), [4], rulebook);
  nfa.readCharacter('b');
  t.false(nfa.accepting());
  nfa.readCharacter('a');
  t.false(nfa.accepting());
  nfa.readCharacter('b');
  t.true(nfa.accepting());
  nfa = NFA.new(new SetExt([1]), [4], rulebook);
  nfa.readString('bbbbb');
  t.true(nfa.accepting());

  let nfaDesign = NFADesign.new(1, [4], rulebook);
  t.true(nfaDesign.accepts('bab'));
  t.true(nfaDesign.accepts('bbbbb'));
  t.false(nfaDesign.accepts('bbabb'));

  rulebook = NFARulebook.new([
    FARule.new(1, null, 2), FARule.new(1, null, 4),
    FARule.new(2, 'a', 3),
    FARule.new(3, 'a', 2),
    FARule.new(4, 'a', 5),
    FARule.new(5, 'a', 6),
    FARule.new(6, 'a', 4)
  ]);
  t.true(rulebook.nextStates(new SetExt([1]), null).equal(new Set([2, 4])));
  t.true(rulebook.followFreeMoves(new SetExt([1])).equal(new Set([1, 2, 4])));

  nfaDesign = NFADesign.new(1, [2, 4], rulebook);
  t.true(nfaDesign.accepts('aa'));
  t.true(nfaDesign.accepts('aaa'));
  t.false(nfaDesign.accepts('aaaaa'));
  t.true(nfaDesign.accepts('aaaaaa'));
}