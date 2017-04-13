import test from 'ava';
import {
  FARule,
  DFARulebook,
  DFA,
  DFADesign
} from '../dfa';

export default function (t) {
  const rulebook = DFARulebook.new([
    FARule.new(1, 'a', 2), FARule.new(1, 'b', 1),
    FARule.new(2, 'a', 2), FARule.new(2, 'b', 3),
    FARule.new(3, 'a', 3), FARule.new(3, 'b', 3)
  ]);

  t.is(rulebook.nextState(1, 'a'), 2);
  t.is(rulebook.nextState(1, 'b'), 1);
  t.is(rulebook.nextState(2, 'b'), 3);

  t.is(DFA.new(1, [1, 3], rulebook).accepting(), true);
  t.is(DFA.new(1, [3], rulebook).accepting(), false);

  let dfa = DFA.new(1, [3], rulebook);
  t.is(dfa.readCharacter('b').accepting(), false);
  for (let i = 0; i < 3; i++) {
    dfa.readCharacter('a');
  }
  t.is(dfa.accepting(), false);
  t.is(dfa.readCharacter('b').accepting(), true);

  dfa = DFA.new(1, [3], rulebook);
  t.is(dfa.accepting(), false);
  t.is(dfa.readString('baaab').accepting(), true);

  const dfaDesign = DFADesign.new(1, [3], rulebook);
  t.is(dfaDesign.accepts('a'), false);
  t.is(dfaDesign.accepts('baa'), false);
  t.is(dfaDesign.accepts('baba'), true);
}
