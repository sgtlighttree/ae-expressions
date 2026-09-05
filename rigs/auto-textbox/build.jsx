/*
  auto-textbox — build.jsx
  A single, self-contained dockable ScriptUI panel that stamps the auto-textbox
  rig into After Effects: a point-text layer with a solid box below it that
  auto-sizes and centers to the text.

  Drop this ONE file into your After Effects "Scripts/ScriptUI Panels/" folder
  (no siblings needed — the expressions are embedded below), then open it from
  Window ▸ build.jsx. Or run it once via File ▸ Scripts ▸ Run Script File….

  The embedded SIZE_EXPRESSION / POSITION_EXPRESSION are generated from the
  canonical size.js / position.js — regenerate after editing either with:
      node tools/bundle-expressions.mjs

  Requires: After Effects with the JavaScript expressions engine (CC 2019 / 16.0+).
*/

(function (thisObj) {

  // === BEGIN GENERATED EXPRESSIONS — regenerate with: node tools/bundle-expressions.mjs ===
  var SIZE_EXPRESSION = [
    "/*",
    "  auto-textbox — Size",
    "  Apply to:  box shape layer ▸ Contents ▸ Rectangle 1 ▸ Rectangle Path 1 ▸ Size",
    "  Requires on the box layer:",
    "    - Layer Control  (pickwhipped once to the target text layer)",
    "    - Slider Control named \"H_Margin\"   (horizontal padding, px)",
    "    - Slider Control named \"V_Margin\"   (vertical padding, px)",
    "",
    "  The Layer Control holds a hard reference, not a name string, so the target",
    "  text layer can be renamed or moved anywhere in the stack without breaking.",
    "*/",
    "var s = effect(\"Layer Control\")(\"Layer\");",
    "if (s == null) {",
    "  value;                       // not picked yet — hold current value, no red error",
    "} else {",
    "  var r = s.sourceRectAtTime();",
    "  [r.width + effect(\"H_Margin\")(\"Slider\"), r.height + effect(\"V_Margin\")(\"Slider\")];",
    "}"
  ].join("\n");

  var POSITION_EXPRESSION = [
    "/*",
    "  auto-textbox — Position",
    "  Apply to:  box shape layer ▸ Transform ▸ Position",
    "  Requires on the box layer:",
    "    - Layer Control  (pickwhipped once to the target text layer)",
    "",
    "  Centers the box on the text's source rectangle, converted to composition space",
    "  via toComp() — so the box lands correctly regardless of the text layer's",
    "  position, parenting, or stacking order.",
    "*/",
    "var s = effect(\"Layer Control\")(\"Layer\");",
    "if (s == null) {",
    "  value;",
    "} else {",
    "  var r = s.sourceRectAtTime();",
    "  s.toComp([r.left + r.width / 2, r.top + r.height / 2]);",
    "}"
  ].join("\n");
  // === END GENERATED EXPRESSIONS ===

  // --- Core builder ------------------------------------------------------------
  function buildRig(textContent, hMargin, vMargin) {
    app.beginUndoGroup("Create auto-textbox");
    try {
      // 1. Active comp, else create one.
      var comp = app.project.activeItem;
      if (!(comp && comp instanceof CompItem)) {
        comp = app.project.items.addComp("auto-textbox", 1920, 1080, 1.0, 10, 30);
        comp.openInViewer();
      }

      // 2. Point-text layer, on top, centered, white.
      var textLayer = comp.layers.addText(textContent);
      var td = textLayer.property("ADBE Text Properties").property("ADBE Text Document").value;
      td.fontSize = 100;
      td.applyFill = true;
      td.fillColor = [1, 1, 1];
      textLayer.property("ADBE Text Properties").property("ADBE Text Document").setValue(td);
      textLayer.property("ADBE Transform Group").property("ADBE Position")
        .setValue([comp.width / 2, comp.height / 2]);

      // 3. Shape layer (the box), moved below the text.
      var box = comp.layers.addShape();
      box.name = "auto-textbox";
      box.moveAfter(textLayer);

      var root = box.property("ADBE Root Vectors Group");
      var group = root.addProperty("ADBE Vector Group");
      group.name = "Box";
      var groupContents = group.property("ADBE Vectors Group");
      var rect = groupContents.addProperty("ADBE Vector Shape - Rect"); // Rectangle Path 1
      var fill = groupContents.addProperty("ADBE Vector Graphic - Fill");
      fill.property("ADBE Vector Fill Color").setValue([0.15, 0.15, 0.15, 1]);

      // 4. Controls on the box: Layer Control + two named sliders.
      var fx = box.property("ADBE Effect Parade");
      var layerCtrl = fx.addProperty("ADBE Layer Control");   // keep default name "Layer Control"
      var hSlider = fx.addProperty("ADBE Slider Control");
      hSlider.name = "H_Margin";
      var vSlider = fx.addProperty("ADBE Slider Control");
      vSlider.name = "V_Margin";

      hSlider.property("ADBE Slider Control-0001").setValue(hMargin);
      vSlider.property("ADBE Slider Control-0001").setValue(vMargin);
      layerCtrl.property("ADBE Layer Control-0001").setValue(textLayer.index); // programmatic pickwhip

      // 5. Apply the embedded expressions.
      rect.property("ADBE Vector Rect Size").expression = SIZE_EXPRESSION;
      box.property("ADBE Transform Group").property("ADBE Position").expression = POSITION_EXPRESSION;

      textLayer.selected = true;
      return "Created auto-textbox in '" + comp.name + "'.";
    } finally {
      app.endUndoGroup();
    }
  }

  // --- UI ----------------------------------------------------------------------
  function buildUI(thisObj) {
    var panel = (thisObj instanceof Panel)
      ? thisObj
      : new Window("palette", "auto-textbox", undefined, { resizeable: true });

    panel.orientation = "column";
    panel.alignChildren = ["fill", "top"];
    panel.spacing = 8;
    panel.margins = 12;

    var textRow = panel.add("group");
    textRow.add("statictext", undefined, "Text:");
    var textInput = textRow.add("edittext", undefined, "Text");
    textInput.characters = 18;

    var marginRow = panel.add("group");
    marginRow.add("statictext", undefined, "H margin:");
    var hInput = marginRow.add("edittext", undefined, "40");
    hInput.characters = 5;
    marginRow.add("statictext", undefined, "V margin:");
    var vInput = marginRow.add("edittext", undefined, "24");
    vInput.characters = 5;

    var createBtn = panel.add("button", undefined, "Create auto-textbox");

    var status = panel.add("statictext", undefined, "", { truncate: "middle" });
    status.alignment = ["fill", "top"];

    createBtn.onClick = function () {
      var h = parseFloat(hInput.text);
      var v = parseFloat(vInput.text);
      if (isNaN(h)) h = 0;
      if (isNaN(v)) v = 0;
      if (SIZE_EXPRESSION === "" || POSITION_EXPRESSION === "") {
        status.text = "Error: expressions not bundled — run node tools/bundle-expressions.mjs";
        alert("auto-textbox\n\nEmbedded expressions are empty.\nRun: node tools/bundle-expressions.mjs");
        return;
      }
      try {
        status.text = buildRig(textInput.text, h, v);
      } catch (err) {
        status.text = "Error: " + err.toString();
        alert("auto-textbox\n\n" + err.toString());
      }
    };

    panel.layout.layout(true);
    return panel;
  }

  var ui = buildUI(thisObj);
  if (ui instanceof Window) {
    ui.center();
    ui.show();
  }

})(this);
