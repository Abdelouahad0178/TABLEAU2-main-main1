// Initialiser le canevas Fabric.js
const canvas = new fabric.Canvas('canvas', {
    isDrawingMode: false,
    backgroundColor: 'white',
    width: 1130,
    height: 1220
});

// Variables pour convertir les pixels en centimètres
const pixelsPerCm = 37.7952755906; // Conversion de pixels à centimètres


const textPropertiesMenu = document.getElementById('text-properties-menu');




// Fonction pour ajouter une règle comme forme
function addRulerShape() {
    

    const ruler = new fabric.Line([100, 100, 400, 100], {
        stroke: 'black',
        strokeWidth: 3,
        selectable: true,
        hasBorders: true,
        hasControls: true,
        originX: 'center',
        originY: 'center'
    });

    const rulerText = new fabric.Text('0 dm', {
        fontSize: 14,
        fill: 'black',
        selectable: false,
        originX: 'center',
        originY: 'center'
    });

    canvas.add(ruler);
    canvas.add(rulerText);
    updateRulerShapeLength(ruler, rulerText);

    // Mettre à jour la longueur lors de la modification
    ruler.on('modified', () => updateRulerShapeLength(ruler, rulerText));
    ruler.on('moving', () => updateRulerShapeLength(ruler, rulerText));
    ruler.on('scaling', () => updateRulerShapeLength(ruler, rulerText));

    // Supprimer le texte de mesure lorsque la règle est supprimée
    ruler.on('removed', () => {
        canvas.remove(rulerText);
    });


   
}

// Fonction pour mettre à jour la longueur de la règle et repositionner le texte
function updateRulerShapeLength(ruler, rulerText) {
    const start = ruler.calcLineCoords();
    const lengthInPixels = Math.sqrt(
        Math.pow(start.x2 - start.x1, 2) + Math.pow(start.y2 - start.y1, 2)
    );

    const lengthInCm = lengthInPixels / pixelsPerCm;
    if (lengthInCm >= 100) {
        const lengthInMeters = (lengthInCm / 100).toFixed(2);
        rulerText.set({ text: `${lengthInMeters} m` });
    } else {
        rulerText.set({ text: `${lengthInCm.toFixed(2)} dm` });
    }

    // Positionner le texte au milieu de la règle
    const newLeft = (start.x1 + start.x2) / 2;
    const newTop = (start.y1 + start.y2) / 2 - 10;
    rulerText.set({
        left: newLeft,
        top: newTop,
        originX: 'center',
        originY: 'center',
        angle: ruler.angle
    });

    // Mettre à jour le canevas
    canvas.bringToFront(rulerText);
    canvas.renderAll();
}

// Fonction pour ajouter les mesures d'une forme
function addShapeMeasurements(shape) {
    const measurementText = new fabric.Text('', {
        fontSize: 14,
        fill: 'black',
        selectable: false,
        originX: 'center',
        originY: 'center'
    });
    canvas.add(measurementText);
    updateShapeMeasurements(shape, measurementText);

    // Associer le texte de mesure à la forme
    shape.measurementText = measurementText;

    // Mettre à jour les mesures lors de la modification de la forme
    shape.on('modified', () => updateShapeMeasurements(shape, measurementText));
    shape.on('scaling', () => updateShapeMeasurements(shape, measurementText));
    shape.on('moving', () => updateShapeMeasurements(shape, measurementText));

    // Supprimer le texte de mesure lorsque la forme est supprimée
    shape.on('removed', () => {
        canvas.remove(measurementText);
    });
}

// Fonction pour mettre à jour les mesures de la forme
function updateShapeMeasurements(shape, measurementText) {
    let measurements = '';
    if (shape.type === 'rect') {
        const width = (shape.getScaledWidth() / pixelsPerCm).toFixed(2);
        const height = (shape.getScaledHeight() / pixelsPerCm).toFixed(2);
        measurements = `L: ${width} dm, H: ${height} dm`;
    } else if (shape.type === 'circle') {
        const radius = (shape.radius * shape.scaleX / pixelsPerCm).toFixed(2);
        const diameter = (2 * shape.radius * shape.scaleX / pixelsPerCm).toFixed(2);
        measurements = `R: ${radius} dm, D: ${diameter} dm`;
    } else if (shape.type === 'triangle') {
        const a = (shape.width * shape.scaleX / pixelsPerCm).toFixed(2);
        const b = (shape.height * shape.scaleY / pixelsPerCm).toFixed(2);
        const c = (Math.sqrt(Math.pow(shape.width, 2) + Math.pow(shape.height, 2)) * shape.scaleX / pixelsPerCm).toFixed(2);
        measurements = `Côtés: A: ${a} dm, B: ${b} dm, C: ${c} dm`;
    }
    measurementText.set({
        text: measurements,
        left: shape.left,
        top: shape.top - 20
    });
    canvas.bringToFront(measurementText);
    canvas.renderAll();
}

// Ajout des événements pour les boutons de formes
document.getElementById('rectangle').addEventListener('click', () => {
    
    const rect = new fabric.Rect({
        width: 100,
        height: 100,
        left: 150,
        top: 100,
        fill: 'transparent',
        stroke: 'black',
        strokeWidth: 2
    });
    canvas.add(rect);
    addShapeMeasurements(rect);
});

document.getElementById('circle').addEventListener('click', () => {
    const circle = new fabric.Circle({
        radius: 50,
        left: 150,
        top: 100,
        fill: 'transparent',
        stroke: 'black',
        strokeWidth: 2
    });
    canvas.add(circle);
    addShapeMeasurements(circle);
});

document.getElementById('triangle').addEventListener('click', () => {
    const triangle = new fabric.Triangle({
        width: 100,
        height: 100,
        left: 150,
        top: 100,
        fill: 'transparent',
        stroke: 'black',
        strokeWidth: 2
    });
    canvas.add(triangle);
    addShapeMeasurements(triangle);
});

// Ajouter la règle comme forme sur le canevas
document.getElementById('add-ruler').addEventListener('click', addRulerShape);

// Effacer le canevas
const clearCanvas = document.querySelector(".clear-canvas");
clearCanvas.addEventListener("click", () => {
    canvas.clear();
    canvas.backgroundColor = 'white';
    canvas.renderAll();
});

// Fonction pour ajouter du texte
const addTextBtn = document.querySelector("#add-text-btn");
addTextBtn.addEventListener('click', () => {
    const text = new fabric.IText('Entrez votre texte', {
        left: 150,
        top: 100,
        fontSize: 20,
        fontFamily: 'Arial',
        fill: '#000000',
        editable: true,
        selectable: true
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
});

// Supprimer l'objet sélectionné
const deleteObjectBtn = document.querySelector("#delete-object");
deleteObjectBtn.addEventListener("click", () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.remove(activeObject);
        canvas.renderAll();
    } else {
        alert("Aucun objet sélectionné !");
    }
});

// Créer un bouton de duplication dynamiquement
const duplicateBtn = document.createElement('button');
duplicateBtn.innerHTML = '+';
duplicateBtn.classList.add('duplicate-btn');
document.body.appendChild(duplicateBtn);
duplicateBtn.style.display = 'none'; // Masquer le bouton de duplication par défaut

// Fonction pour dupliquer un objet
duplicateBtn.addEventListener('click', () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        activeObject.clone(function(clonedObj) {
            clonedObj.set({
                left: activeObject.left + 30,
                top: activeObject.top + 30,
                evented: true
            });
            canvas.add(clonedObj);
            canvas.setActiveObject(clonedObj);
            if (clonedObj.type !== 'line') {
                addShapeMeasurements(clonedObj);
            } else {
                addRulerShape(clonedObj);
            }
            canvas.renderAll();
        });
    }
    hideDuplicateButton();
});

// Afficher le bouton "+" quand un objet est sélectionné
function showDuplicateButton() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        duplicateBtn.style.display = 'block';
    }
}

// Masquer le bouton "+"
function hideDuplicateButton() {
    duplicateBtn.style.display = 'none';
}

canvas.on('selection:created', showDuplicateButton);
canvas.on('selection:updated', showDuplicateButton);
canvas.on('selection:cleared', hideDuplicateButton);

// Suppression via la touche "Delete"
document.addEventListener('keydown', (event) => {
    if (event.key === 'Delete') {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            canvas.remove(activeObject);
            canvas.renderAll();
        }
    }
});

// Activer le pinceau
document.getElementById('brush').addEventListener('click', () => {
    canvas.isDrawingMode = true;
    canvas.selection = false;
    canvas.freeDrawingBrush.color = document.querySelector(".colors .selected").style.backgroundColor || "#000000";
});

// Activer la gomme
document.getElementById('eraser').addEventListener('click', () => {
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.color = "white";
});

// Désactiver le pinceau après avoir dessiné
canvas.on('mouse:up', function() {
    canvas.isDrawingMode = false;
    canvas.selection = true;
});

// Ajuster la taille du pinceau/gomme
const sizeSlider = document.querySelector("#size-slider");
sizeSlider.addEventListener('change', () => {
    canvas.freeDrawingBrush.width = parseInt(sizeSlider.value);
});

// Sauvegarder le dessin en tant qu'image
const saveImg = document.querySelector(".save-img");
saveImg.addEventListener("click", () => {
    const dataURL = canvas.toDataURL({
        format: 'png',
        multiplier: 2
    });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `canvas_${Date.now()}.png`;
    link.click();
});

// Importer une image sur le canevas
const uploadImageInput = document.querySelector("#upload-image");
uploadImageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        fabric.Image.fromURL(event.target.result, (img) => {
            img.set({
                left: 150,
                top: 100,
                scaleX: 0.5,
                scaleY: 0.5,
                selectable: true,
                hasBorders: true,
                hasControls: true
            });

            canvas.add(img);
            canvas.renderAll();
        });
    };
    reader.readAsDataURL(file);
});

// Gestion des couleurs pour le pinceau
const colorBtns = document.querySelectorAll(".colors .option");
colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector(".colors .selected").classList.remove("selected");
        btn.classList.add("selected");
        const selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
        canvas.freeDrawingBrush.color = selectedColor;
    });
});

// Sélecteur de couleur personnalisé
const colorPicker = document.querySelector("#color-picker");
colorPicker.addEventListener("change", () => {
    canvas.freeDrawingBrush.color = colorPicker.value;
    document.querySelector(".colors .selected").classList.remove("selected");
    colorPicker.parentElement.classList.add("selected");
});

// Afficher la calculatrice
const showCalculatorBtn = document.querySelector("#show-calculator");
const calculatorCanvas = document.querySelector("#calculator-canvas");
const canvasCalcDisplay = document.querySelector("#canvas-calc-display");
const canvasCalcButtons = document.querySelectorAll("#calculator-canvas .calc-btn");
const closeCanvasCalculatorBtn = document.querySelector("#close-canvas-calculator");

showCalculatorBtn.addEventListener("click", () => {
    calculatorCanvas.style.display = 'block';
    calculatorCanvas.style.zIndex = 9999;
});

// Fermer la calculatrice
closeCanvasCalculatorBtn.addEventListener("click", () => {
    calculatorCanvas.style.display = 'none';
});

// Gestion des boutons de la calculatrice
canvasCalcButtons.forEach(button => {
    button.addEventListener("click", () => {
        const value = button.textContent;
        if (value === "C") {
            canvasCalcDisplay.value = "";
        } else if (value === "=") {
            try {
                canvasCalcDisplay.value = eval(canvasCalcDisplay.value);
            } catch {
                canvasCalcDisplay.value = "Erreur";
            }
        } else {
            canvasCalcDisplay.value += value;
        }
    });
});

// Affichage du bouton "+" lorsqu'un objet est sélectionné
canvas.on('selection:created', () => {
    duplicateBtn.style.display = 'block';
});

canvas.on('selection:cleared', () => {
    duplicateBtn.style.display = 'none';
});

// Sauvegarder le canevas en tant qu'image
const saveImgBtn = document.querySelector(".save-img");
saveImgBtn.addEventListener("click", () => {
    const dataURL = canvas.toDataURL({
        format: 'png',
        multiplier: 2
    });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `canvas_${Date.now()}.png`;
    link.click();
});
// Fonction pour ajouter une règle comme forme
function addRulerShape() {
    const ruler = new fabric.Rect({
        width: 300,
        height: 5,
        left: 150,
        top: 100,
        fill: 'transparent',
        stroke: 'black',
        strokeWidth: 2,
        selectable: true,
        hasBorders: true,
        hasControls: true,
        originX: 'center',
        originY: 'center'
    });

    const rulerText = new fabric.Text('0 dm', {
        fontSize: 14,
        fill: 'black',
        left: ruler.left,
        top: ruler.top - 20,
        selectable: false,
        originX: 'center',
        originY: 'center'
    });

    canvas.add(ruler);
    canvas.add(rulerText);
    updateRulerShapeLength(ruler, rulerText);

    // Mettre à jour la longueur lors de la modification
    ruler.on('modified', () => updateRulerShapeLength(ruler, rulerText));
    ruler.on('moving', () => updateRulerShapeLength(ruler, rulerText));
    ruler.on('scaling', () => updateRulerShapeLength(ruler, rulerText));

    // Supprimer le texte de mesure lorsque la règle est supprimée
    ruler.on('removed', () => {
        canvas.remove(rulerText);
    });
}

// Fonction pour mettre à jour la longueur de la règle et repositionner le texte
function updateRulerShapeLength(ruler, rulerText) {
    const lengthInCm = ruler.getScaledWidth() / pixelsPerCm;
    if (lengthInCm >= 100) {
        const lengthInMeters = (lengthInCm / 100).toFixed(2);
        rulerText.set({ text: `${lengthInMeters} m` });
    } else {
        rulerText.set({ text: `${lengthInCm.toFixed(2)} dm` });
    }

    // Positionner le texte au milieu de la règle
    rulerText.set({
        left: ruler.left,
        top: ruler.top - 20,
        originX: 'center',
        originY: 'center',
        angle: ruler.angle
    });

    // Mettre à jour le canevas
    canvas.bringToFront(rulerText);
    canvas.renderAll();
}

// Ajouter la règle comme forme sur le canevas
document.getElementById('add-ruler').addEventListener('click', addRulerShape);


// Fonction pour ajouter un tableau sur le canevas
function addTable(rows = 3, cols = 3) {
    const tableGroup = new fabric.Group([], {
        selectable: true,
        hasBorders: true,
        hasControls: true,
        left: 150,
        top: 100
    });

    const cellWidth = 60;
    const cellHeight = 30;

    // Créer le tableau
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            // Créer une cellule
            const cell = new fabric.Rect({
                left: col * cellWidth,
                top: row * cellHeight,
                width: cellWidth,
                height: cellHeight,
                fill: 'transparent',
                stroke: 'black',
                strokeWidth: 1,
                selectable: false
            });

            // Créer le texte de la cellule
            const cellText = new fabric.Textbox('', {
                left: col * cellWidth + 5,
                top: row * cellHeight + 5,
                fontSize: 12,
                width: cellWidth - 10,
                height: cellHeight - 10,
                selectable: true,
                editable: true,
                textAlign: 'center'
            });

            // Ajouter la cellule et le texte au groupe
            tableGroup.addWithUpdate(cell);
            tableGroup.addWithUpdate(cellText);
        }
    }

    // Ajouter le groupe de tableau au canevas
    canvas.add(tableGroup);
    canvas.setActiveObject(tableGroup);
    canvas.renderAll();
}

// Écouteur d'événement pour le bouton d'ajout de tableau
document.getElementById('add-table-btn').addEventListener('click', () => {
    // Demander le nombre de lignes et de colonnes
    const rows = parseInt(prompt("Nombre de lignes ?", "3"), 10);
    const cols = parseInt(prompt("Nombre de colonnes ?", "3"), 10);

    if (!isNaN(rows) && !isNaN(cols) && rows > 0 && cols > 0) {
        addTable(rows, cols);
    } else {
        alert("Veuillez entrer des valeurs valides pour les lignes et les colonnes.");
    }
});















let historique = [];
let pileRétablir = [];

// Fonction pour enregistrer l'état actuel du canevas
function enregistrerÉtat() {
    historique.push(JSON.stringify(canvas));
    pileRétablir = []; // Vider la pile de rétablissement après une nouvelle action
}

// Fonction pour annuler
function annuler() {
    if (historique.length > 0) {
        const dernierÉtat = historique.pop();
        pileRétablir.push(JSON.stringify(canvas));
        canvas.loadFromJSON(dernierÉtat, canvas.renderAll.bind(canvas));
    }
}

// Fonction pour rétablir
function rétablir() {
    if (pileRétablir.length > 0) {
        const prochainÉtat = pileRétablir.pop();
        historique.push(JSON.stringify(canvas));
        canvas.loadFromJSON(prochainÉtat, canvas.renderAll.bind(canvas));
    }
}



// Enregistrer l'état à chaque ajout ou suppression d'objet
canvas.on('object:added', enregistrerÉtat);
canvas.on('object:removed', enregistrerÉtat);

// Ajouter les événements pour les boutons "Annuler" et "Rétablir"
document.getElementById('annuler-btn').addEventListener('click', annuler);
document.getElementById('rétablir-btn').addEventListener('click', rétablir);




// Références aux éléments du menu de propriétés

const fontFamilySelect = document.getElementById('font-family');
const fontSizeInput = document.getElementById('font-size');
const fontWeightSelect = document.getElementById('font-weight');
const textColorInput = document.getElementById('text-color');


// Afficher le menu des propriétés de texte lorsque du texte est sélectionné, sinon le masquer
canvas.on('selection:created', (e) => {
    if (e.selected && e.selected[0] && e.selected[0].type === 'i-text') {
        // Si l'objet sélectionné est du texte interactif ('i-text')
        textPropertiesMenu.style.display = 'flex'; // Afficher le menu des propriétés de texte
        updateTextPropertiesMenu(e.selected[0]); // Mettre à jour les propriétés du menu en fonction du texte sélectionné
    } else {
        // Si l'objet sélectionné n'est pas du texte interactif
        textPropertiesMenu.style.display = 'none'; // Masquer le menu des propriétés de texte
    }
});

// Masquer le menu des propriétés lorsque la sélection est effacée
canvas.on('selection:cleared', () => {
    textPropertiesMenu.style.display = 'none'; // Masquer le menu des propriétés de texte lorsque rien n'est sélectionné
});












// Mettre à jour les propriétés du menu en fonction de l'objet sélectionné
function updateTextPropertiesMenu(text) {
    fontFamilySelect.value = text.fontFamily || 'Arial';
    fontSizeInput.value = text.fontSize || 20;
    fontWeightSelect.value = text.fontWeight || 'normal';
    textColorInput.value = text.fill || '#000000';
}

// Appliquer les modifications au texte sélectionné
fontFamilySelect.addEventListener('change', () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
        activeObject.set('fontFamily', fontFamilySelect.value);
        canvas.renderAll();
    }
});

fontSizeInput.addEventListener('input', () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
        activeObject.set('fontSize', parseInt(fontSizeInput.value, 10));
        canvas.renderAll();
    }
});

fontWeightSelect.addEventListener('change', () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
        activeObject.set('fontWeight', fontWeightSelect.value);
        canvas.renderAll();
    }
});

textColorInput.addEventListener('input', () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
        activeObject.set('fill', textColorInput.value);
        canvas.renderAll();
    }
});


