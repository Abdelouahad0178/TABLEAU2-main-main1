// =============================
// 1. Initialisation du Canevas
// =============================

// Initialiser le canevas Fabric.js







const canvas = new fabric.Canvas('canvas', {
    isDrawingMode: false,
    backgroundColor: 'white',
    width: 1130,
    height:1440
});

// Variables pour convertir les pixels en centimètres
const pixelsPerCm = 37.7952755906;

// Référence au menu des propriétés de texte
const textPropertiesMenu = document.getElementById('text-properties-menu');

// Variable pour stocker le nom du fichier JSON chargé
let nomFichierJSON = null;






// =============================
// 2. Gestion des Formes et Mesures
// =============================

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

    // Associer le texte de mesure à la règle
    ruler.rulerText = rulerText;
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
    shape.measurementTextActive = true; // Indicateur pour savoir si le texte de mesure est actif

    // Mettre à jour les mesures lors de la modification de la forme
    shape.on('modified', () => {
        if (shape.measurementTextActive) {
            updateShapeMeasurements(shape, measurementText);
        }
    });
    shape.on('scaling', () => {
        if (shape.measurementTextActive) {
            updateShapeMeasurements(shape, measurementText);
        }
    });
    shape.on('moving', () => {
        if (shape.measurementTextActive) {
            updateShapeMeasurements(shape, measurementText);
        }
    });

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

// =============================
// 3. Outils de Dessin (Pinceau, Gomme)
// =============================

// Activer le pinceau
document.getElementById('brush').addEventListener('click', () => {
    canvas.isDrawingMode = true;
    canvas.selection = false;
    canvas.freeDrawingBrush.color = getSelectedColor();
});

// Activer la gomme
document.getElementById('eraser').addEventListener('click', () => {
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.color = "white";
});

// Désactiver le pinceau après avoir dessiné
canvas.on('mouse:up', () => {
    canvas.isDrawingMode = false;
    canvas.selection = true;
});

// Ajuster la taille du pinceau/gomme
document.querySelector("#size-slider").addEventListener('change', (e) => {
    const size = parseInt(e.target.value, 10);
    canvas.freeDrawingBrush.width = size;
});

// =============================
// 4. Gestion des Couleurs
// =============================

// Fonction pour obtenir la couleur sélectionnée
function getSelectedColor() {
    const selectedColorBtn = document.querySelector(".colors .selected");
    if (selectedColorBtn) {
        return window.getComputedStyle(selectedColorBtn).getPropertyValue("background-color");
    }
    return "#000000"; // Valeur par défaut
}

// Gestion des couleurs pour le pinceau
document.querySelectorAll(".colors .option").forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector(".colors .selected").classList.remove("selected");
        btn.classList.add("selected");
        canvas.freeDrawingBrush.color = getSelectedColor();
    });
});

// Sélecteur de couleur personnalisé
document.querySelector("#color-picker").addEventListener("change", (e) => {
    canvas.freeDrawingBrush.color = e.target.value;
    document.querySelector(".colors .selected").classList.remove("selected");
    e.target.parentElement.classList.add("selected");
});

// Sélecteur de couleur pour les formes
const shapeColorPicker = document.getElementById('shape-color-picker');

// =============================
// 5. Manipulation des Objets (Ajouter, Supprimer, Dupliquer)
// =============================

// Ajouter des formes avec couleur sélectionnée
document.getElementById('rectangle').addEventListener('click', () => {
    const color = shapeColorPicker.value;
    const rect = new fabric.Rect({
        width: 100,
        height: 100,
        left: 150,
        top: 100,
        fill: 'transparent',
        stroke: color,
        strokeWidth: 2
    });
    canvas.add(rect);
    addShapeMeasurements(rect);
});

document.getElementById('circle').addEventListener('click', () => {
    const color = shapeColorPicker.value;
    const circle = new fabric.Circle({
        radius: 50,
        left: 150,
        top: 100,
        fill: 'transparent',
        stroke: color,
        strokeWidth: 2
    });
    canvas.add(circle);
    addShapeMeasurements(circle);
});

document.getElementById('triangle').addEventListener('click', () => {
    const color = shapeColorPicker.value;
    const triangle = new fabric.Triangle({
        width: 100,
        height: 100,
        left: 150,
        top: 100,
        fill: 'transparent',
        stroke: color,
        strokeWidth: 2
    });
    canvas.add(triangle);
    addShapeMeasurements(triangle);
});

// Ajouter la règle comme forme sur le canevas
document.getElementById('add-ruler').addEventListener('click', addRulerShape);

// Ajouter un tableau sur le canevas
document.getElementById('add-table-btn').addEventListener('click', () => {
    const rows = parseInt(prompt("Nombre de lignes ?", "3"), 10);
    const cols = parseInt(prompt("Nombre de colonnes ?", "3"), 10);

    if (!isNaN(rows) && !isNaN(cols) && rows > 0 && cols > 0) {
        addTable(rows, cols);
    } else {
        alert("Veuillez entrer des valeurs valides pour les lignes et les colonnes.");
    }
});

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

// Supprimer l'objet sélectionné
document.getElementById('delete-object').addEventListener("click", () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.remove(activeObject);
        canvas.renderAll();
    } else {
        alert("Aucun objet sélectionné !");
    }
});

// Fonction pour supprimer le texte de mesure associé à l'objet sélectionné
function supprimerTexteDeMesure() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        const associatedText = activeObject.measurementText || activeObject.rulerText;
        if (associatedText) {
            canvas.remove(associatedText);
            if (activeObject.measurementText) {
                activeObject.measurementTextActive = false; // Désactiver l'indicateur pour empêcher la recréation du texte
                delete activeObject.measurementText; // Supprimer la référence au texte de mesure
            }
            if (activeObject.rulerText) {
                delete activeObject.rulerText; // Supprimer la référence au texte de la règle
            }
            canvas.renderAll();
        } else {
            alert("Aucun texte de mesure associé à cet objet !");
        }
    } else {
        alert("Aucun objet sélectionné !");
    }
}

// Ajouter un événement pour le bouton "Supprimer le texte de mesure"
document.getElementById('delete-measurement-text').addEventListener("click", supprimerTexteDeMesure);

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

// =============================
// 6. Gestion du Texte
// =============================

// Fonction pour ajouter du texte
document.getElementById('add-text-btn').addEventListener('click', () => {
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

// Références aux éléments du menu de propriétés
const fontFamilySelect = document.getElementById('font-family');
const fontSizeInput = document.getElementById('font-size');
const fontWeightSelect = document.getElementById('font-weight');
const textColorInput = document.getElementById('text-color');

// Afficher le menu des propriétés de texte lorsque du texte est sélectionné, sinon le masquer
canvas.on('selection:created', (e) => {
    const selected = e.selected[0];
    if (selected && selected.type === 'i-text') {
        textPropertiesMenu.style.display = 'flex'; // Afficher le menu des propriétés de texte
        updateTextPropertiesMenu(selected); // Mettre à jour les propriétés du menu en fonction du texte sélectionné
    } else {
        textPropertiesMenu.style.display = 'none'; // Masquer le menu des propriétés de texte
    }
});

// Masquer le menu des propriétés lorsque la sélection est effacée
canvas.on('selection:cleared', () => {
    textPropertiesMenu.style.display = 'none'; // Masquer le menu des propriétés de texte
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

// =============================
// 7. Fonctionnalités Supplémentaires (Calculatrice, Tableau)
// =============================

// Variables pour la calculatrice
const calculatorCanvas = document.getElementById("calculator-canvas");
const showCalculatorBtn = document.getElementById("show-calculator");
const canvasCalcDisplay = document.getElementById("canvas-calc-display");
const canvasCalcButtons = document.querySelectorAll("#calculator-canvas .calc-btn");
const closeCanvasCalculatorBtn = document.getElementById("close-canvas-calculator");

// Variables pour le glisser-déposer de la calculatrice
let isDragging = false;
let offsetX, offsetY;

// Fonction pour obtenir les coordonnées du pointeur (souris ou tactile)
function getPointerPosition(e) {
    if (e.touches) {
        // Pour les écrans tactiles
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
        // Pour les appareils non tactiles
        return { x: e.clientX, y: e.clientY };
    }
}

// Fonction pour commencer le glissement
function startDrag(e) {
    isDragging = true;
    const pointer = getPointerPosition(e);
    offsetX = pointer.x - calculatorCanvas.offsetLeft;
    offsetY = pointer.y - calculatorCanvas.offsetTop;
    calculatorCanvas.style.cursor = 'move'; // Changer le curseur pendant le glissement
    e.preventDefault(); // Empêcher le comportement par défaut (comme le défilement)
}

// Fonction pour déplacer la calculatrice
function drag(e) {
    if (isDragging) {
        const pointer = getPointerPosition(e);
        calculatorCanvas.style.left = `${pointer.x - offsetX}px`;
        calculatorCanvas.style.top = `${pointer.y - offsetY}px`;
    }
}

// Fonction pour arrêter le glissement
function stopDrag() {
    isDragging = false;
    calculatorCanvas.style.cursor = 'default'; // Restaurer le curseur par défaut
}

// Ajouter les écouteurs d'événements pour le glisser-déposer (souris et tactile)
const calculatorHeader = calculatorCanvas.querySelector('h3');
calculatorHeader.addEventListener('mousedown', startDrag);
calculatorHeader.addEventListener('touchstart', startDrag);

document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', drag);
document.addEventListener('mouseup', stopDrag);
document.addEventListener('touchend', stopDrag);

// Afficher et masquer la calculatrice
showCalculatorBtn.addEventListener("click", () => {
    calculatorCanvas.style.display = 'block';
    calculatorCanvas.style.zIndex = 9999;
});

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

// =============================
// 8. Historique (Annuler, Rétablir)
// =============================

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
        canvas.loadFromJSON(dernierÉtat, () => {
            canvas.renderAll();
            alert("Action annulée !");
        });
    }
}

// Fonction pour rétablir
function rétablir() {
    if (pileRétablir.length > 0) {
        const prochainÉtat = pileRétablir.pop();
        historique.push(JSON.stringify(canvas));
        canvas.loadFromJSON(prochainÉtat, () => {
            canvas.renderAll();
            alert("Action rétablie !");
        });
    }
}

// Enregistrer l'état à chaque ajout ou suppression d'objet
canvas.on('object:added', enregistrerÉtat);
canvas.on('object:removed', enregistrerÉtat);

// Ajouter les événements pour les boutons "Annuler" et "Rétablir"
document.getElementById('annuler-btn').addEventListener('click', annuler);
document.getElementById('rétablir-btn').addEventListener('click', rétablir);

// =============================
// 9. Enregistrement et Chargement JSON
// =============================

// Fonction pour enregistrer le canevas sous forme de JSON
function enregistrerCanevasJSON() {
    const canvasJSON = JSON.stringify(canvas.toJSON());
    const blob = new Blob([canvasJSON], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = nomFichierJSON ? nomFichierJSON : `canvas_${Date.now()}.json`; // Utiliser le nom du fichier chargé ou générer un nouveau nom
    link.click();

    alert(nomFichierJSON ? `Modifications enregistrées dans ${nomFichierJSON}` : "Nouveau fichier JSON créé !");
}

// Ajouter un événement pour le bouton "Enregistrer sous forme de JSON"
document.getElementById("save-json").addEventListener("click", enregistrerCanevasJSON);

// Fonction pour charger un fichier JSON et restaurer l'état du canevas
function chargerCanevasJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    nomFichierJSON = file.name; // Enregistrer le nom du fichier JSON chargé

    const reader = new FileReader();
    reader.onload = (e) => {
        const json = e.target.result;
        canvas.loadFromJSON(json, () => {
            canvas.renderAll();
            alert("Le canevas a été chargé avec succès !");
        });
    };
    reader.readAsText(file);
}

// Ajouter un événement pour le chargement du fichier JSON
document.getElementById("load-json").addEventListener("change", chargerCanevasJSON);

// =============================
// 10. Fonctionnalités de Sauvegarde et Importation d'Images
// =============================

// Sauvegarder le dessin en tant qu'image
document.querySelector(".save-img").addEventListener("click", () => {
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
document.getElementById("upload-image").addEventListener("change", (e) => {
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

// =============================
// 11. Suppression via la touche "Delete"
// =============================

// Fonction pour supprimer un objet sélectionné
function supprimerObjet() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        // Supprimer le texte de mesure associé si présent
        const associatedText = activeObject.measurementText || activeObject.rulerText;
        if (associatedText) {
            canvas.remove(associatedText);
        }
        canvas.remove(activeObject);
        canvas.renderAll();
    }
}

// Suppression via la touche "Delete"
document.addEventListener('keydown', (event) => {
    if (event.key === 'Delete') {
        supprimerObjet();
    }
});

// =============================
// 12. Calculatrice Déplaçable (Support Tactile)
// =============================

// Variables pour le glisser-déposer de la calculatrice
let isCalculatorDragging = false;
let calculatorOffsetX, calculatorOffsetY;

// Fonction pour commencer le glissement de la calculatrice
function startCalculatorDrag(e) {
    isCalculatorDragging = true;
    const pointer = getPointerPosition(e);
    calculatorOffsetX = pointer.x - calculatorCanvas.offsetLeft;
    calculatorOffsetY = pointer.y - calculatorCanvas.offsetTop;
    calculatorCanvas.style.cursor = 'move';
    e.preventDefault();
}

// Fonction pour déplacer la calculatrice
function dragCalculator(e) {
    if (isCalculatorDragging) {
        const pointer = getPointerPosition(e);
        calculatorCanvas.style.left = `${pointer.x - calculatorOffsetX}px`;
        calculatorCanvas.style.top = `${pointer.y - calculatorOffsetY}px`;
    }
}

// Fonction pour arrêter le glissement de la calculatrice
function stopCalculatorDrag() {
    isCalculatorDragging = false;
    calculatorCanvas.style.cursor = 'default';
}

// Ajouter les écouteurs d'événements pour le glisser-déposer de la calculatrice (souris et tactile)
calculatorHeader.addEventListener('mousedown', startCalculatorDrag);
calculatorHeader.addEventListener('touchstart', startCalculatorDrag);

document.addEventListener('mousemove', dragCalculator);
document.addEventListener('touchmove', dragCalculator);
document.addEventListener('mouseup', stopCalculatorDrag);
document.addEventListener('touchend', stopCalculatorDrag);

// =============================
// 13. Suppression du Texte de Mesure sans Supprimer l'Objet
// =============================

// Fonction pour supprimer uniquement le texte de mesure associé à l'objet sélectionné
function supprimerTexteDeMesure() {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        const associatedText = activeObject.measurementText || activeObject.rulerText;
        if (associatedText) {
            canvas.remove(associatedText);
            if (activeObject.measurementText) {
                activeObject.measurementTextActive = false; // Désactiver l'indicateur pour empêcher la recréation du texte
                delete activeObject.measurementText; // Supprimer la référence au texte de mesure
            }
            if (activeObject.rulerText) {
                delete activeObject.rulerText; // Supprimer la référence au texte de la règle
            }
            canvas.renderAll();
        } else {
            alert("Aucun texte de mesure associé à cet objet !");
        }
    } else {
        alert("Aucun objet sélectionné !");
    }
}

// =============================
// 14. Sauvegarde et Chargement JSON avec Mise à Jour
// =============================

// Fonction pour enregistrer le canevas sous forme de JSON avec mise à jour du même fichier
function enregistrerCanevasJSON() {
    const canvasJSON = JSON.stringify(canvas.toJSON());
    const blob = new Blob([canvasJSON], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = nomFichierJSON ? nomFichierJSON : `canvas_${Date.now()}.json`; // Utiliser le nom du fichier chargé ou générer un nouveau nom
    link.click();

    alert(nomFichierJSON ? `Modifications enregistrées dans ${nomFichierJSON}` : "Nouveau fichier JSON créé !");
}

// Fonction pour charger un fichier JSON et restaurer l'état du canevas
function chargerCanevasJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    nomFichierJSON = file.name; // Enregistrer le nom du fichier JSON chargé

    const reader = new FileReader();
    reader.onload = (e) => {
        const json = e.target.result;
        canvas.loadFromJSON(json, () => {
            canvas.renderAll();
            alert("Le canevas a été chargé avec succès !");
        });
    };
    reader.readAsText(file);
}

// =============================
// 15. Initialisation des Événements
// =============================

// Événements pour les boutons "Annuler" et "Rétablir" sont déjà ajoutés dans la section Historique

// Événements pour les boutons "Enregistrer" et "Charger" sont déjà ajoutés dans la section Enregistrement JSON

// Événements pour les outils de dessin et de manipulation sont déjà ajoutés dans les sections respectives

// =============================
// Fin du Code Organisé
// =============================


// =============================
// Gestion des Pages de Travail (Similaire à Excel)
// =============================

// =============================
// 16. Fonctionnalité d'Aperçu Avant Impression
// =============================

// Références aux éléments modaux
const printPreviewBtn = document.getElementById('print-preview-btn');
const printPreviewModal = document.getElementById('print-preview-modal');
const closeModalSpan = document.querySelector('.close-modal');
const previewImage = document.getElementById('preview-image');
const printBtn = document.getElementById('print-btn');

// Ouvrir la fenêtre modale et afficher l'aperçu du canevas
printPreviewBtn.addEventListener('click', () => {
    // Générer l'image du canevas
    const dataURL = canvas.toDataURL({
        format: 'png',
        multiplier: 2
    });
    previewImage.src = dataURL;
    
    // Afficher la modale
    printPreviewModal.style.display = 'block';
});

// Fermer la fenêtre modale lorsqu'on clique sur la croix
closeModalSpan.addEventListener('click', () => {
    printPreviewModal.style.display = 'none';
});

// Fermer la fenêtre modale lorsqu'on clique en dehors de la modale
window.addEventListener('click', (event) => {
    if (event.target === printPreviewModal) {
        printPreviewModal.style.display = 'none';
    }
});

// Fonction pour imprimer l'image du canevas
printBtn.addEventListener('click', () => {
    const printWindow = window.open('', 'PrintWindow', 'width=800,height=600');
    printWindow.document.write('<html><head><title>Aperçu Avant Impression</title>');
    printWindow.document.write('<style>body { display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(`<img src="${previewImage.src}" alt="Aperçu du Canevas" style="max-width: 100%; height: auto;">`);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
});

