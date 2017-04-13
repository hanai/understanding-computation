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
  t.is(pattern.toString(), '(ab|a)*');
  let nfaDesign = Empty.new().toNFADesign();
  t.is(nfaDesign.accepts(''), true);
  t.is(nfaDesign.accepts('a'), false);
  nfaDesign = Literal.new('a').toNFADesign();
  t.is(nfaDesign.accepts(''), false);
  t.is(nfaDesign.accepts('a'), true);
  t.is(nfaDesign.accepts('b'), false);
  t.is(Empty.new().matches('a'), false);
  t.is(Literal.new('a').matches('a'), true);
  pattern = Concatenate.new(Literal.new('a'),
    Concatenate.new(Literal.new('b'), Literal.new('c')));
  t.is(pattern.toString(), 'abc');
  t.is(pattern.matches('a'), false);
  t.is(pattern.matches('ab'), false);
  t.is(pattern.matches('abc'), true);
}