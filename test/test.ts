import test from 'ava';
import dfaTest from './dfa';
import regTest from './reg';
import nfaTest from './nfa';

test('reg', regTest);
test('dfa', dfaTest);
test('nfa', nfaTest);
