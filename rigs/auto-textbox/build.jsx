/*
  auto-textbox — build.jsx
  Dockable ScriptUI panel that stamps the auto-textbox rig into After Effects:
  a point-text layer with a solid box below it that auto-sizes and centers to
  the text via the size.js / position.js expressions.

  Run it two ways:
    - File ▸ Scripts ▸ Run Script File…            (one-shot; shows a floating window)
    - Window ▸ build.jsx                            (docked, if installed in the
                                                     ScriptUI Panels folder)

  Requires: After Effects with the JavaScript expressions engine (CC 2019 / 16.0+).
  IMPORTANT: keep size.js and position.js in the SAME folder as this file — the
  expressions are read from them at runtime (they are the single source of truth).
*/

(function (thisObj) {

  // --- Read the canonical expression files sitting next to this script ---------
  function scriptFolder() {
    return File($.fileName).parent; // folder containing build.jsx
  }

  function readExpression(fileName) {
    var f = new File(scriptFolder().fsName + "/" + fileName);
    if (!f.exists) {
      throw new Error(
        "Could not find '" + fileName + "' next to build.jsx.\n" +
        "The auto-textbox rig needs size.js and position.js in the same folder."
      );
    }
    f.open("r");
    var text = f.read();
    f.close();
    return text;
  }

  // --- Core builder ------------------------------------------------------------
  function buildRig(textContent, hMargin, vMargin) {
    // Load expressions first so we fail before touching the project.
    var sizeExpr = readExpression("size.js");
    var posExpr = readExpression("position.js");

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

      // 5. Apply the expressions from size.js / position.js.
      rect.property("ADBE Vector Rect Size").expression = sizeExpr;
      box.property("ADBE Transform Group").property("ADBE Position").expression = posExpr;

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
