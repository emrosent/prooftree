class ProofComponent {
  constructor() {
    this.id = "";
    this.conclusion = "";
    this.rule = "";
    this.premises = [];
    this.parent = undefined;
    this.index = undefined;
    this.lineType = LineType.SOLID;
  }
}

const LineType = {
  SOLID: 0,
  DASHED: 1,
  NO_LINE: 2,
  NUM_TYPES: 3
};

var main = new ProofComponent();
main.id = "main";

// Allow for dynamic text box sizing
function resizeInput() {
  if (this.value.length === 0) {
    this.style.width = this.placeholder.length + "ch";
  } else {
    this.style.width = this.value.length + "ch";
  }
}

/**
 * Generate text cells for the proof tree. On input, update proofComponent to
 * save the text in the textbox so info doesn't get lost when manipulating the
 * table
 * @param {ProofComponent} proofComponent 
 * @param {String} type 
 */
function generateCell(proofComponent, type) {
  var cell = document.createElement("input");
  cell.id = proofComponent.id + "_" + type;
  cell.placeholder = type;
  cell.classList.add("proof-text");
  cell.addEventListener("input", resizeInput);
  switch (type) {
    case "rule":
      cell.value = proofComponent.rule;
      cell.addEventListener("input", _ => {
        proofComponent.rule = document.getElementById(cell.id).value
      });
      break;
    case "conclusion":
      cell.value = proofComponent.conclusion;
      cell.addEventListener("input", _ => {
        proofComponent.conclusion = document.getElementById(cell.id).value
      });
      break;
    default:
      break;
  }
  resizeInput.call(cell);
  return cell;
}

/**
 * Add a component to the left of proofComponent by adding a premise to
 * proofComponent's parent
 * @param {ProofComponent} proofComponent 
 */
function addComponentOnLeft(proofComponent) {
  proofComponent.parent.premises.splice(
    proofComponent.index, 0, new ProofComponent()
  );
  generateProof();
}

/**
 * Add a component to the right of proofComponent by adding a premise to
 * proofComponent's parent
 * @param {ProofComponent} proofComponent 
 */
function addComponentOnRight(proofComponent) {
  proofComponent.parent.premises.splice(
    proofComponent.index + 1, 0, new ProofComponent()
  );
  generateProof();
}

/**
 * Add a component above proofComponent - "above" meaning between proofComponent
 * and proofComponent's premises
 * @param {ProofComponent} proofComponent 
 */
function addComponentAbove(proofComponent) {
  var newComponent = new ProofComponent();
  newComponent.premises = proofComponent.premises;
  proofComponent.premises = [newComponent];
  generateProof();
}

/**
 * Add a component below proofComponent - "below" meaning proofComponent becomes
 * the premise of the new component
 * @param {ProofComponent} proofComponent 
 */
function addComponentBelow(proofComponent) {
  var newComponent = new ProofComponent();
  newComponent.premises.push(proofComponent);
  if (proofComponent.parent === undefined) {
    main = newComponent;
    main.id = "main";
    main.parent = undefined;
    main.index = undefined;
  } else {
    proofComponent.parent.premises.splice(proofComponent.index, 1);
    proofComponent.parent.premises.splice(proofComponent.index, 0, newComponent);
  }
  generateProof();
}

/**
 * Remove proofComponent and everything that's above it
 * @param {ProofComponent} proofComponent 
 */
function removeComponentRemovePremises(proofComponent) {
  if (proofComponent.parent === undefined) {
    main = new ProofComponent();
  } else {
    proofComponent.parent.premises.splice(proofComponent.index, 1);
  }
  generateProof();
}

/**
 * Attempt to remove proofComponent and bring its premises down to its current
 * level. This fails if:
 * - The action would cause a component to have more than 5 premises
 * - The action would cause the base to have two conclusions
 * @param {ProofComponent} proofComponent 
 */
function removeComponentKeepPremises(proofComponent) {
  if (proofComponent.parent === undefined) {
    if (proofComponent.premises.length === 1) {
      main = proofComponent.premises[0];
      main.id = "main";
      main.parent = undefined;
      main.index = undefined;
    } else {
      alert("Cannot keep premises! Base of proof can only have one conclusion");
    }
  } else if (proofComponent.parent.premises.length +
    proofComponent.premises.length - 1 > 5) {
    alert("Cannot keep premises! A component can have at most 5 premises");
  } else {
    proofComponent.parent.premises.splice(proofComponent.index, 1);
    proofComponent.premises.reverse();
    proofComponent.premises.forEach(premise => {
      proofComponent.parent.premises.splice(proofComponent.index, 0, premise);
    });
  }
  generateProof();
}

/**
 * Create a button for the dropdown menu depending on type
 * @param {ProofComponent} proofComponent 
 * @param {String} type The type of button to generate
 */
function generateDropdownMenuButton(proofComponent, type) {
  var button = document.createElement("button");
  button.id = proofComponent.id + "_" + type;
  switch (type) {
    case "left":
      button.innerHTML = "Add Component on Left";
      button.addEventListener('click', _ => {
        addComponentOnLeft(proofComponent)
      });
      break;
    case "right":
      button.innerHTML = "Add Component on Right";
      button.onclick = _ => addComponentOnRight(proofComponent);
      break;
    case "above":
      button.innerHTML = "Add Component Above";
      button.onclick = _ => addComponentAbove(proofComponent);
      break;
    case "below":
      button.innerHTML = "Add Component Below";
      button.onclick = _ => addComponentBelow(proofComponent);
      break;
    case "remove-remove":
      button.innerHTML = "Remove Component (Remove Premises)";
      button.onclick = _ => removeComponentRemovePremises(proofComponent);
      break;
    case "remove-keep":
      button.innerHTML = "Remove Component (Keep Premises)";
      button.onclick = _ => removeComponentKeepPremises(proofComponent);
      break;
    default:
      break;
  }
  return button;
}

function generateInnerToggleButton(proofComponent, lineType) {
  var button = document.createElement("button");
  button.id = proofComponent.id + "_toggle" + lineType;
  button.onclick = _ => {
    proofComponent.lineType = lineType;
    generateProof();
  }
  switch (lineType) {
    case LineType.SOLID:
      button.innerHTML = "Solid";
      break;
    case LineType.DASHED:
      button.innerHTML = "Dashed";
      break;
    case LineType.NO_LINE:
      button.innerHTML = "No Line";
      break;
    default:
      break;
  }
  return button;
}

function generateToggleMenu(proofComponent) {
  var menu = document.createElement("div");
  menu.classList.add("dropdown-content");
  menu.id = proofComponent.id + "_toggleMenu";
  for (var i = 0; i < LineType.NUM_TYPES; i++) {
    menu.appendChild(generateInnerToggleButton(proofComponent, i));
  }
  return menu;
}

function generateToggleButton(proofComponent) {
  var toggleButton = document.createElement("div");
  toggleButton.classList.add("dropdown");
  toggleButton.id = proofComponent.id + "_toggleDiv";

  var button = document.createElement("button");
  button.id = proofComponent.id + "_toggleButton";

  toggleButton.appendChild(button);
  button.classList.add("dropbtn");
  button.innerHTML = "Change Inference Line...";

  button.onclick = _ => {
    document.getElementById(proofComponent.id + "_toggleMenu").classList.toggle("show");
  }

  toggleButton.appendChild(button);
  toggleButton.appendChild(generateToggleMenu(proofComponent));

  return toggleButton;
}

/**
 * Generate the dropdown menu for altering the structure of the proof tree
 * @param {ProofComponent} proofComponent 
 */
function generateDropdownMenu(proofComponent) {
  var menu = document.createElement("div");
  menu.classList.add("dropdown-content");
  menu.id = proofComponent.id + "_menu";

  // Create all the buttoms
  let addComponentOnLeft = generateDropdownMenuButton(proofComponent, "left");
  let addComponentOnRight = generateDropdownMenuButton(proofComponent, "right");
  let addComponentAbove = generateDropdownMenuButton(proofComponent, "above");
  let addComponentBelow = generateDropdownMenuButton(proofComponent, "below");
  let removeComponentRemovePremises = generateDropdownMenuButton(proofComponent, "remove-remove");
  let removeComponentKeepPremises = generateDropdownMenuButton(proofComponent, "remove-keep");
  let toggleLine = generateToggleButton(proofComponent, "toggle-line");

  menu.appendChild(addComponentAbove);
  menu.appendChild(addComponentBelow);
  // Only allow at most 5 premises per component
  if ((proofComponent.parent !== undefined) && (proofComponent.parent.premises.length < 5)) {
    menu.appendChild(addComponentOnLeft);
    menu.appendChild(addComponentOnRight);
  }
  menu.appendChild(removeComponentRemovePremises);
  menu.appendChild(removeComponentKeepPremises);
  menu.appendChild(toggleLine);

  return menu;
}

function generateDropdownButton(proofComponent) {
  var dots = document.createElement("div");
  dots.classList.add("dropdown");
  dots.id = proofComponent.id + "_dots";

  var button = document.createElement("div");
  button.classList.add("dropbtn");
  button.id = proofComponent.id + "_button";
  button.innerHTML = "•••";
  button.onclick = _ => {
    document.getElementById(proofComponent.id + "_menu").classList.toggle("show");
  }

  dots.appendChild(button);
  dots.appendChild(generateDropdownMenu(proofComponent));

  return dots;
}

// Create the html table for a proof component
function generateProofComponent(proofComponent) {
  var table = document.createElement("table");

  // Loop to generate the premises
  var row = table.insertRow();
  var cell = row.insertCell();
  for (var i = 0; i < proofComponent.premises.length; i++) {
    cell = row.insertCell();
    cell = row.insertCell();
    proofComponent.premises[i].parent = proofComponent;
    proofComponent.premises[i].id = proofComponent.id + "_premise" + i;
    proofComponent.premises[i].index = i;
    cell.appendChild(generateProofComponent(proofComponent.premises[i], i));
  }

  // Add button for adding/removing proof components
  // Add the middle line and the rule
  row = table.insertRow();
  cell = row.insertCell();
  cell.appendChild(generateDropdownButton(proofComponent));
  cell = row.insertCell();
  cell.colSpan = proofComponent.premises.length * 2;

  var line = document.createElement("hr");
  line.classList.add("line" + proofComponent.lineType);
  cell.appendChild(line);

  cell = row.insertCell();
  cell.appendChild(generateCell(proofComponent, "rule"));

  // Add the conclusion
  row = table.insertRow();
  cell = row.insertCell();
  cell = row.insertCell();
  cell.colSpan = proofComponent.premises.length * 2;
  cell.appendChild(generateCell(proofComponent, "conclusion"));

  return table;
}

// Clear the old table and generate the new one
function generateProof() {
  var table = document.getElementById("proof-table");
  while (table.firstChild) {
    table.removeChild(table.firstChild);
  }
  table.appendChild(generateProofComponent(main));
}

// Generate the LaTeX for a proof component
function generateLatexComponent(proofComponent) {
  var result = "";
  for (var i = 0; i < proofComponent.premises.length; i++) {
    result += generateLatexComponent(proofComponent.premises[i]);
  }
  result += "\n\\RightLabel{\\(" + proofComponent.rule + "\\)}";
  switch (proofComponent.lineType) {
    case LineType.SOLID:
      break;
    case LineType.DASHED:
      result += "\n\\dashedLine";
      break;
    case LineType.NO_LINE:
      result += "\n\\noLine"
      break;
    default:
      break;
  }
  switch (proofComponent.premises.length) {
    case 0:
      result += "\n\\AxiomC{}\n\\UnaryInfC{\\(" + proofComponent.conclusion + "\\)}";
      break;
    case 1:
      result += "\n\\UnaryInfC{\\(" + proofComponent.conclusion + "\\)}";
      break;
    case 2:
      result += "\n\\BinaryInfC{\\(" + proofComponent.conclusion + "\\)}";
      break;
    case 3:
      result += "\n\\TrinaryInfC{\\(" + proofComponent.conclusion + "\\)}";
      break;
    case 4:
      result += "\n\\QuaternaryInfC{\\(" + proofComponent.conclusion + "\\)}";
      break;
    case 5:
      result += "\n\\QuinaryInfC{\\(" + proofComponent.rule + "\\)}";
      break;
    default:
      break;
  }
  return result;
}

// Generate the LaTeX for a proof component
function generateLatexOutput(proofComponent) {
  var result = "";
  for (var i = 0; i < proofComponent.premises.length; i++) {
    result += generateLatexOutput(proofComponent.premises[i]);
  }
  if (proofComponent.rule !== "") {
    result += "<br>&nbsp;&nbsp;&nbsp;&nbsp;\\RightLabel{\\(" + proofComponent.rule + "\\)}";
  }
  switch (proofComponent.lineType) {
    case LineType.SOLID:
      break;
    case LineType.DASHED:
      result += "<br>&nbsp;&nbsp;&nbsp;&nbsp;\\dashedLine";
      break;
    case LineType.NO_LINE:
      result += "<br>&nbsp;&nbsp;&nbsp;&nbsp;\\noLine"
      break;
    default:
      break;
  }
  switch (proofComponent.premises.length) {
    case 0:
      result += "<br>&nbsp;&nbsp;&nbsp;&nbsp;\\AxiomC{}<br>&nbsp;&nbsp;&nbsp;&nbsp;\\UnaryInfC{\\(" + proofComponent.conclusion + "\\)}";
      break;
    case 1:
      result += "<br>&nbsp;&nbsp;&nbsp;&nbsp;\\UnaryInfC{\\(" + proofComponent.conclusion + "\\)}";
      break;
    case 2:
      result += "<br>&nbsp;&nbsp;&nbsp;&nbsp;\\BinaryInfC{\\(" + proofComponent.conclusion + "\\)}";
      break;
    case 3:
      result += "<br>&nbsp;&nbsp;&nbsp;&nbsp;\\TrinaryInfC{\\(" + proofComponent.conclusion + "\\)}";
      break;
    case 4:
      result += "<br>&nbsp;&nbsp;&nbsp;&nbsp;\\QuaternaryInfC{\\(" + proofComponent.conclusion + "\\)}";
      break;
    case 5:
      result += "<br>&nbsp;&nbsp;&nbsp;&nbsp;\\QuinaryInfC{\\(" + proofComponent.rule + "\\)}";
      break;
  }

  return result;
}

// Generate LaTeX, and display the live rendering
function generateLatex() {
  document.getElementById("LaTeX-output").innerHTML =
    "\\begin{prooftree}" +
    generateLatexOutput(main) +
    "<br>\\end{prooftree}";
  document.getElementById("LaTeX-live").innerHTML =
    "\\begin{prooftree}" +
    "\\newcommand{\\seq}{\\Longrightarrow}" +
    "\\newcommand{\\sq}{\\longrightarrow}" +
    "\\newcommand{\\limplies}{\\supset}" +
    "\\newcommand{\\jtrue}{\\ true}" +
    "\\newcommand{\\up}{\\uparrow}" +
    "\\newcommand{\\down}{\\downarrow}" +
    "\\newcommand{\\ltrue}{\\top}" +
    "\\newcommand{\\lfalse}{\\bot}" +
    generateLatexComponent(main) +
    "\\end{prooftree}";
  MathJax.typeset([document.getElementById("LaTeX-live")]);
}

function onCreate(event) {
  generateProof();
  openTab(event, "Home");
}

function copy() {
  navigator.clipboard.writeText(
    "\\begin{prooftree}" +
    generateLatexComponent(main) +
    "\n\\end{prooftree}"
  );
}

// Need this for tab functionality
function openTab(evt, cityName) {
  // Declare all variables
  var i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " active";
}

// Need this to make the button dissapear
window.onclick = function (event) {
  if (!event.target.matches(".dropbtn")) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show") && openDropdown.id !== "test_menu") {
        openDropdown.classList.remove("show");
      }
    }
  }
  generateLatex();
}

// Need this to render the LaTeX onscreen
window.MathJax = {
  loader: { load: ["[tex]/bussproofs"] },
  tex: { packages: { "[+]": ["bussproofs"] } }
};

// Generate LaTeX dynamically
window.oninput = function () {
  generateLatex();
}

// Ask before closing (in case the proof is really important or something)
window.onbeforeunload = function (event) {
  event.preventDefault();
};

