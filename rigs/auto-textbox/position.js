/*
  auto-textbox — Position
  Apply to:  box shape layer ▸ Transform ▸ Position
  Requires on the box layer:
    - Layer Control  (pickwhipped once to the target text layer)

  Centers the box on the text's source rectangle, converted to composition space
  via toComp() — so the box lands correctly regardless of the text layer's
  position, parenting, or stacking order.
*/
var s = effect("Layer Control")("Layer");
if (s == null) {
  value;
} else {
  var r = s.sourceRectAtTime();
  s.toComp([r.left + r.width / 2, r.top + r.height / 2]);
}
