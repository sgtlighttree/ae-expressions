/*
  auto-textbox — Position
  Apply to:  box shape layer ▸ Transform ▸ Position
  Requires on the box layer:
    - Layer Control  (pickwhipped once to the target text layer)

  Centers the box on the text's source rectangle. Keep the box and text on the
  same parent (or both unparented) so the text's source-rect coordinates map
  into the box's position space.
*/
var s = effect("Layer Control")("Layer");
if (s == null) {
  value;
} else {
  var r = s.sourceRectAtTime();
  [r.width / 2 + r.left, r.height / 2 + r.top];
}
