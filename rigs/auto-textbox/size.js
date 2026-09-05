/*
  auto-textbox — Size
  Apply to:  box shape layer ▸ Contents ▸ Rectangle 1 ▸ Rectangle Path 1 ▸ Size
  Requires on the box layer:
    - Layer Control  (pickwhipped once to the target text layer)
    - Slider Control named "H_Margin"   (horizontal padding, px)
    - Slider Control named "V_Margin"   (vertical padding, px)

  The Layer Control holds a hard reference, not a name string, so the target
  text layer can be renamed or moved anywhere in the stack without breaking.
*/
var s = effect("Layer Control")("Layer");
if (s == null) {
  value;                       // not picked yet — hold current value, no red error
} else {
  var r = s.sourceRectAtTime();
  [r.width + effect("H_Margin")("Slider"), r.height + effect("V_Margin")("Slider")];
}
