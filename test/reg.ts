import {
  Pattern,
  Empty,
  Literal,
  Concatenate,
  Choose,
  Repeat
} from '../reg';

export default function (t) {
  let pattern: Pattern = Repeat.new(
    Choose.new(
      Concatenate.new(Literal.new('a'), Literal.new('b')),
      Literal.new('a')
    )
  );
  t.is(pattern.inspect(), '/(ab|a)*/');
  let nfaDesign = Empty.new().toNFADesign();
  t.is(nfaDesign.accepts(''), true);
  t.is(nfaDesign.accepts('a'), false);
  nfaDesign = Literal.new('a').toNFADesign();
  t.is(nfaDesign.accepts(''), false);
  t.is(nfaDesign.accepts('a'), true);
  t.is(nfaDesign.accepts('b'), false);
  t.is(Empty.new().matches('a'), false);
  t.is(Literal.new('a').matches('a'), true);

  pattern = Concatenate.new(Literal.new('a'), Literal.new('b'));
  t.is(pattern.inspect(), '/ab/');
  t.is(pattern.matches('a'), false);
  t.is(pattern.matches('ab'), true);
  t.is(pattern.matches('abc'), false);

  pattern = Concatenate.new(Literal.new('a'),
    Concatenate.new(Literal.new('b'), Literal.new('c')));
  t.is(pattern.inspect(), '/abc/');
  t.is(pattern.matches('a'), false);
  t.is(pattern.matches('ab'), false);
  t.is(pattern.matches('abc'), true);

  pattern = Choose.new(Literal.new('a'), Literal.new('b'));
  t.is(pattern.inspect(), '/a|b/');
  t.is(pattern.matches('a'), true);
  t.is(pattern.matches('b'), true);
  t.is(pattern.matches('c'), false);

  pattern = Repeat.new(Literal.new('a'));
  t.is(pattern.inspect(), '/a*/');
  t.true(pattern.matches(''));
  t.true(pattern.matches('a'));
  t.true(pattern.matches('aaaa'));
  t.false(pattern.matches('b'));

  pattern = Repeat.new(Concatenate.new(
    Literal.new('a'),
    Choose.new(Empty.new(), Literal.new('b'))
  ));
  t.is(pattern.inspect(), '/(a(|b))*/');
  t.true(pattern.matches(''));
  t.true(pattern.matches('a'));
  t.true(pattern.matches('ab'));
  t.true(pattern.matches('aba'));
  t.true(pattern.matches('abab'));
  t.true(pattern.matches('abaab'));
  t.false(pattern.matches('abba'));
}