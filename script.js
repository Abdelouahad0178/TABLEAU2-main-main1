// script.js

// Module de Gestion de l'Historique
class HistoryModule {
    constructor(canvas) {
        this.canvas = canvas;
        this.history = [];
        this.currentIndex = -1;
    }

    enregistrerEtat() {
        // Supprimer les états futurs si on enregistre un nouvel état
        this.history = this.history.slice(0, this.currentIndex + 1);
        // Enregistrer l'état actuel du canevas
        this.history.push(JSON.stringify(this.canvas));
        this.currentIndex++;
    }

    annuler() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.canvas.loadFromJSON(this.history[this.currentIndex], () => {
                this.canvas.renderAll();
            });
        }
    }

    retablir() {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            this.canvas.loadFromJSON(this.history[this.currentIndex], () => {
                this.canvas.renderAll();
            });
        }
    }
}

// Module de Gestion des Couleurs
class ColorModule {
    constructor() {
        this.selectedColorBtn = null;
        this.selectedShapeColor = "#000000"; // Valeur par défaut
    }

    init() {
        this.setupCustomColorPicker();
        this.setupShapeColorPicker();
        this.setupColorSelection();
    }

    setupCustomColorPicker() {
        const customColorPicker = document.getElementById('color-picker');
        if (customColorPicker) {
            customColorPicker.addEventListener('change', (e) => {
                if (this.selectedColorBtn) {
                    this.selectedColorBtn.classList.remove("selected");
                }
                customColorPicker.parentElement.classList.add("selected");
                this.selectedColorBtn = customColorPicker.parentElement;
            });
        } else {
            console.warn("Le sélecteur de couleur personnalisé avec l'ID 'color-picker' est introuvable.");
        }
    }

    setupShapeColorPicker() {
        const shapeColorPicker = document.getElementById('shape-color-picker');
        if (shapeColorPicker) {
            shapeColorPicker.addEventListener('change', (e) => {
                this.selectedShapeColor = e.target.value;
            });
        } else {
            console.warn("Le sélecteur de couleur des formes avec l'ID 'shape-color-picker' est introuvable.");
        }
    }

    setupColorSelection() {
        const colorOptions = document.querySelectorAll('.colors .option:not(:last-child)');
        colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                if (this.selectedColorBtn) {
                    this.selectedColorBtn.classList.remove("selected");
                }
                option.classList.add("selected");
                this.selectedColorBtn = option;
            });
        });
    }

    getBrushColor() {
        if (this.selectedColorBtn) {
            return window.getComputedStyle(this.selectedColorBtn).getPropertyValue("background-color");
        }
        return "#000000"; // Valeur par défaut
    }

    getShapeColor() {
        return this.selectedShapeColor;
    }
}

// Module de Gestion du Pinceau et de la Gomme
class BrushModule {
    constructor(canvas, colorModule) {
        this.canvas = canvas;
        this.colorModule = colorModule;
        this.sizeSlider = document.querySelector("#size-slider");
    }

    init() {
        this.setupBrush();
        this.setupEraser();
        this.setupSizeSlider();
        this.setupMouseUp();
    }

    setupBrush() {
        const brushBtn = document.getElementById('brush');
        if (brushBtn) {
            brushBtn.addEventListener('click', () => {
                this.canvas.isDrawingMode = true;
                this.canvas.selection = false;
                this.canvas.freeDrawingBrush.color = this.colorModule.getBrushColor();
                this.canvas.freeDrawingBrush.width = parseInt(this.sizeSlider.value, 10);
            });
        } else {
            console.warn("Le bouton 'Pinceau' avec l'ID 'brush' est introuvable.");
        }
    }

    setupEraser() {
        const eraserBtn = document.getElementById('eraser');
        if (eraserBtn) {
            eraserBtn.addEventListener('click', () => {
                this.canvas.isDrawingMode = true;
                this.canvas.freeDrawingBrush.color = "white";
                this.canvas.freeDrawingBrush.width = parseInt(this.sizeSlider.value, 10);
            });
        } else {
            console.warn("Le bouton 'Gomme' avec l'ID 'eraser' est introuvable.");
        }
    }

    setupSizeSlider() {
        if (this.sizeSlider) {
            this.sizeSlider.addEventListener('change', (e) => {
                const size = parseInt(e.target.value, 10);
                if (this.canvas.isDrawingMode) {
                    this.canvas.freeDrawingBrush.width = size;
                }
            });
        } else {
            console.warn("Le curseur de taille avec l'ID 'size-slider' est introuvable.");
        }
    }

    setupMouseUp() {
        this.canvas.on('mouse:up', () => {
            this.canvas.isDrawingMode = false;
            this.canvas.selection = true;
            this.canvas.freeDrawingBrush.color = this.colorModule.getBrushColor();
            this.canvas.freeDrawingBrush.width = parseInt(this.sizeSlider.value, 10);
        });
    }
}

// Module de Gestion des Formes et Mesures
class ShapesModule {
    constructor(canvas, colorModule, historyModule) {
        this.canvas = canvas;
        this.colorModule = colorModule;
        this.history = historyModule;
        this.pixelsPerCm = 37.7952755906; // Conversion pixels en cm (approximation)
    }

    init() {
        this.setupShapeButtons();
        this.setupAddRuler();
        this.setupAddTable();
    }

    setupShapeButtons() {
        const rectangleBtn = document.getElementById('rectangle');
        const circleBtn = document.getElementById('circle');
        const triangleBtn = document.getElementById('triangle');

        if (rectangleBtn) {
            rectangleBtn.addEventListener('click', () => this.addRectangle());
        } else {
            console.warn("Le bouton 'Rectangle' avec l'ID 'rectangle' est introuvable.");
        }

        if (circleBtn) {
            circleBtn.addEventListener('click', () => this.addCircle());
        } else {
            console.warn("Le bouton 'Cercle' avec l'ID 'circle' est introuvable.");
        }

        if (triangleBtn) {
            triangleBtn.addEventListener('click', () => this.addTriangle());
        } else {
            console.warn("Le bouton 'Triangle' avec l'ID 'triangle' est introuvable.");
        }
    }

    // Méthode pour obtenir le type de remplissage sélectionné
    getFillOption() {
        const filledRadio = document.querySelector('input[name="shape-fill"]:checked');
        if (filledRadio) {
            return filledRadio.value === 'filled' ? 'filled' : 'empty';
        }
        return 'filled'; // Valeur par défaut
    }

    addRectangle() {
        const color = this.colorModule.getShapeColor();
        const fillOption = this.getFillOption();
        const rect = new fabric.Rect({
            width: 100,
            height: 100,
            left: 150,
            top: 100,
            fill: fillOption === 'filled' ? color : 'transparent', // Remplissage
            stroke: color, // Contour
            strokeWidth: 2
        });
        this.canvas.add(rect);
        this.history.enregistrerEtat();
        this.addShapeMeasurements(rect);
    }

    addCircle() {
        const color = this.colorModule.getShapeColor();
        const fillOption = this.getFillOption();
        const circle = new fabric.Circle({
            radius: 50,
            left: 150,
            top: 100,
            fill: fillOption === 'filled' ? color : 'transparent', // Remplissage
            stroke: color, // Contour
            strokeWidth: 2
        });
        this.canvas.add(circle);
        this.history.enregistrerEtat();
        this.addShapeMeasurements(circle);
    }

    addTriangle() {
        const color = this.colorModule.getShapeColor();
        const fillOption = this.getFillOption();
        const triangle = new fabric.Triangle({
            width: 100,
            height: 100,
            left: 150,
            top: 100,
            fill: fillOption === 'filled' ? color : 'transparent', // Remplissage
            stroke: color, // Contour
            strokeWidth: 2
        });
        this.canvas.add(triangle);
        this.history.enregistrerEtat();
        this.addShapeMeasurements(triangle);
    }

    setupAddRuler() {
        const addRulerBtn = document.getElementById('add-ruler');
        if (addRulerBtn) {
            addRulerBtn.addEventListener('click', () => this.addRulerShape());
        } else {
            console.warn("Le bouton 'Ajouter une règle' avec l'ID 'add-ruler' est introuvable.");
        }
    }

    // Méthode modifiée pour ajouter une règle dynamique
    addRulerShape() {
        const rulerColor = this.colorModule.getShapeColor(); // Utiliser la couleur sélectionnée pour la règle
        const ruler = new fabric.Line([0, 0, 300, 0], { // Ligne de 300 pixels de long
            stroke: rulerColor,
            strokeWidth: 3,
            selectable: true,
            hasBorders: true,
            hasControls: true,
            originX: 'center',
            originY: 'center'
        });

        const rulerText = new fabric.Text('0 cm', {
            fontSize: 14,
            fill: 'black',
            selectable: false, // Empêcher la sélection du texte
            evented: false, // Empêcher les interactions avec le texte
            originX: 'center',
            originY: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)', // Fond blanc semi-transparent
            stroke: 'black',
            strokeWidth: 0.5,
            lockRotation: true, // Verrouiller la rotation du texte
            lockScalingX: true, // Verrouiller le redimensionnement en X
            lockScalingY: true, // Verrouiller le redimensionnement en Y
            lockMovementX: true, // Verrouiller le mouvement en X
            lockMovementY: true  // Verrouiller le mouvement en Y
        });

        // Grouper la ligne et le texte pour un déplacement fluide
        const rulerGroup = new fabric.Group([ruler, rulerText], {
            left: 10,
            top: 10,
            selectable: true,
            hasBorders: true,
            hasControls: true,
            lockScalingFlip: true // Éviter les retournements involontaires
        });

        this.canvas.add(rulerGroup);
        this.history.enregistrerEtat();
        this.updateRulerShapeLength(rulerGroup, rulerText); // Mise à jour initiale de la longueur

        // Attacher les événements pour mettre à jour le texte dynamiquement
        rulerGroup.on('scaling', () => this.updateRulerShapeLength(rulerGroup, rulerText));
        rulerGroup.on('moving', () => this.updateRulerShapeLength(rulerGroup, rulerText));
        rulerGroup.on('rotating', () => this.updateRulerShapeLength(rulerGroup, rulerText));
        rulerGroup.on('modified', () => this.updateRulerShapeLength(rulerGroup, rulerText)); // Pour tout autre type de modification

        // Supprimer le texte lorsque la règle est retirée
        rulerGroup.on('removed', () => {
            this.canvas.remove(rulerText);
        });

        rulerGroup.rulerText = rulerText;
    }

    // Mise à jour dynamique de la longueur de la règle avec le texte juste au-dessus
    updateRulerShapeLength(rulerGroup, rulerText) {
        let ruler = null;

        // Identifier la ligne au sein du groupe
        rulerGroup.forEachObject(obj => {
            if (obj.type === 'line') {
                ruler = obj;
            }
        });

        if (!ruler) {
            console.error('Le groupe de règle ne contient pas une ligne valide.');
            return;
        }

        // Calculer les positions absolues des points d'extrémité
        const groupTransform = rulerGroup.calcTransformMatrix();
        const startPoint = fabric.util.transformPoint({ x: ruler.x1, y: ruler.y1 }, groupTransform);
        const endPoint = fabric.util.transformPoint({ x: ruler.x2, y: ruler.y2 }, groupTransform);

        // Calculer la distance en pixels
        const dx = endPoint.x - startPoint.x;
        const dy = endPoint.y - startPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Convertir les pixels en centimètres
        const lengthInCm = (distance / this.pixelsPerCm).toFixed(2);

        let measurement = '';
        if (lengthInCm >= 100) {
            const lengthInMeters = (lengthInCm / 100).toFixed(2);
            measurement = `${lengthInMeters} m`;
        } else {
            measurement = `${lengthInCm} cm`;
        }

        // Calculer le centre de la règle
        const centerX = (startPoint.x + endPoint.x) / 2;
        const centerY = (startPoint.y + endPoint.y) / 2;

        // Calculer l'angle de la règle en radians
        const angleRad = Math.atan2(dy, dx);

        // Calculer un décalage perpendiculaire pour positionner le texte juste au-dessus
        const offset = 20; // Distance en pixels au-dessus de la règle
        const offsetX = -Math.sin(angleRad) * offset;
        const offsetY = Math.cos(angleRad) * offset;

        // Mettre à jour le texte de la règle avec la nouvelle position
        rulerText.set({
            text: measurement,
            left: centerX + offsetX,
            top: centerY + offsetY,
            angle: 0 // Garder le texte horizontal
        });

        // Amener le texte au premier plan et rafraîchir le canevas
        this.canvas.bringToFront(rulerText);
        this.canvas.renderAll();

        // Journalisation pour débogage
        console.log('Transformation du Groupe de Règle:', {
            p1: startPoint,
            p2: endPoint,
            distance: distance,
            lengthInCm: lengthInCm
        });
    }

    addShapeMeasurements(shape) {
        const measurementText = new fabric.Text('', {
            fontSize: 14,
            fill: 'black',
            selectable: false,
            originX: 'center',
            originY: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)', // Fond blanc semi-transparent
            stroke: 'black',
            strokeWidth: 0.5
        });
        this.canvas.add(measurementText);
        this.history.enregistrerEtat();
        this.updateShapeMeasurements(shape, measurementText);

        shape.measurementText = measurementText;
        shape.measurementTextActive = true;

        shape.on('modified', () => {
            if (shape.measurementTextActive) {
                this.updateShapeMeasurements(shape, measurementText);
            }
        });
        shape.on('scaling', () => {
            if (shape.measurementTextActive) {
                this.updateShapeMeasurements(shape, measurementText);
            }
        });
        shape.on('moving', () => {
            if (shape.measurementTextActive) {
                this.updateShapeMeasurements(shape, measurementText);
            }
        });

        shape.on('removed', () => {
            this.canvas.remove(measurementText);
        });
    }

    updateShapeMeasurements(shape, measurementText) {
        let measurements = '';
        if (shape.type === 'rect') {
            const width = (shape.getScaledWidth() / this.pixelsPerCm).toFixed(2);
            const height = (shape.getScaledHeight() / this.pixelsPerCm).toFixed(2);
            measurements = `L: ${width} cm, H: ${height} cm`;
        } else if (shape.type === 'circle') {
            const radius = (shape.radius * shape.scaleX / this.pixelsPerCm).toFixed(2);
            const diameter = (2 * shape.radius * shape.scaleX / this.pixelsPerCm).toFixed(2);
            measurements = `R: ${radius} cm, D: ${diameter} cm`;
        } else if (shape.type === 'triangle') {
            const a = (shape.width * shape.scaleX / this.pixelsPerCm).toFixed(2);
            const b = (shape.height * shape.scaleY / this.pixelsPerCm).toFixed(2);
            const c = (Math.sqrt(Math.pow(shape.width, 2) + Math.pow(shape.height, 2)) * shape.scaleX / this.pixelsPerCm).toFixed(2);
            measurements = `Côtés: A: ${a} cm, B: ${b} cm, C: ${c} cm`;
        }
        measurementText.set({
            text: measurements,
            left: shape.left,
            top: shape.top - 20,
            angle: 0 // Garder le texte horizontal
        });
        this.canvas.bringToFront(measurementText);
        this.canvas.renderAll();
    }

    setupAddTable() {
        const addTableBtn = document.getElementById('add-table-btn');
        if (addTableBtn) {
            addTableBtn.addEventListener('click', () => {
                const rows = parseInt(prompt("Nombre de lignes ?", "3"), 10);
                const cols = parseInt(prompt("Nombre de colonnes ?", "3"), 10);

                if (!isNaN(rows) && !isNaN(cols) && rows > 0 && cols > 0) {
                    this.addTable(rows, cols);
                } else {
                    alert("Veuillez entrer des valeurs valides pour les lignes et les colonnes.");
                }
            });
        } else {
            console.warn("Le bouton 'Ajouter un Tableau' avec l'ID 'add-table-btn' est introuvable.");
        }
    }

    addTable(rows = 3, cols = 3) {
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
        this.canvas.add(tableGroup);
        this.canvas.setActiveObject(tableGroup);
        this.canvas.renderAll();
        this.history.enregistrerEtat();
    }
}

// Module de Gestion du Texte
class TextModule {
    constructor(canvas, historyModule) {
        this.canvas = canvas;
        this.history = historyModule;
        this.textPropertiesMenu = document.getElementById('text-properties-menu');

        // Récupérer les contrôles des propriétés de texte
        this.fontFamilySelect = document.getElementById('font-family');
        this.fontSizeInput = document.getElementById('font-size');
        this.fontWeightSelect = document.getElementById('font-weight');
        this.textColorInput = document.getElementById('text-color');

        // Garder une référence à l'objet texte sélectionné
        this.selectedText = null;
    }

    init() {
        this.setupAddTextButton();
        this.setupTextSelection();
        this.setupTextProperties();
    }

    setupAddTextButton() {
        const addTextBtn = document.getElementById('add-text-btn');
        if (addTextBtn) {
            addTextBtn.addEventListener('click', () => this.addText());
        } else {
            console.warn("Le bouton 'Ajouter Texte' avec l'ID 'add-text-btn' est introuvable.");
        }
    }

    addText() {
        const text = new fabric.IText('Entrez votre texte', {
            left: 150,
            top: 100,
            fontSize: 20,
            fontFamily: 'Arial',
            fill: '#000000',
            editable: true,
            selectable: true
        });
        this.canvas.add(text);
        this.history.enregistrerEtat();
        this.canvas.setActiveObject(text);
        this.canvas.renderAll();
    }

    setupTextSelection() {
        this.canvas.on('selection:created', (e) => this.handleSelection(e));
        this.canvas.on('selection:updated', (e) => this.handleSelection(e));
        this.canvas.on('selection:cleared', () => this.hideTextPropertiesMenu());
    }

    handleSelection(e) {
        const selected = e.selected[0];
        if (selected && selected.type === 'i-text') {
            this.selectedText = selected;
            this.showTextPropertiesMenu(selected);
        } else {
            this.selectedText = null;
            this.hideTextPropertiesMenu();
        }
    }

    showTextPropertiesMenu(text) {
        this.textPropertiesMenu.style.display = 'flex';
        this.updateTextPropertiesMenu(text);
    }

    hideTextPropertiesMenu() {
        this.textPropertiesMenu.style.display = 'none';
    }

    updateTextPropertiesMenu(text) {
        // Mettre à jour les valeurs des contrôles en fonction des propriétés de l'objet texte sélectionné
        this.fontFamilySelect.value = text.fontFamily || 'Arial';
        this.fontSizeInput.value = text.fontSize || 20;
        this.fontWeightSelect.value = text.fontWeight || 'normal';
        this.textColorInput.value = text.fill || '#000000';
    }

    setupTextProperties() {
        // Attacher les écouteurs d'événements aux contrôles des propriétés de texte

        this.fontFamilySelect.addEventListener('change', () => {
            if (this.selectedText) {
                this.selectedText.set('fontFamily', this.fontFamilySelect.value);
                this.canvas.renderAll();
                this.history.enregistrerEtat();
            }
        });

        this.fontSizeInput.addEventListener('input', () => {
            if (this.selectedText) {
                const size = parseInt(this.fontSizeInput.value, 10);
                if (!isNaN(size)) {
                    this.selectedText.set('fontSize', size);
                    this.canvas.renderAll();
                    this.history.enregistrerEtat();
                }
            }
        });

        this.fontWeightSelect.addEventListener('change', () => {
            if (this.selectedText) {
                this.selectedText.set('fontWeight', this.fontWeightSelect.value);
                this.canvas.renderAll();
                this.history.enregistrerEtat();
            }
        });

        this.textColorInput.addEventListener('input', () => {
            if (this.selectedText) {
                this.selectedText.set('fill', this.textColorInput.value);
                this.canvas.renderAll();
                this.history.enregistrerEtat();
            }
        });
    }
}

// Module de Gestion de la Calculatrice Intégrée
class CalculatorModule {
    constructor() {
        this.calculatorCanvas = document.getElementById("calculator-canvas");
        this.canvasCalcDisplay = document.getElementById("canvas-calc-display");
        this.canvasCalcButtons = document.querySelectorAll("#calculator-canvas .calc-btn");
        this.closeCanvasCalculatorBtn = document.getElementById("close-canvas-calculator");
    }

    init() {
        this.setupDrag();
        this.setupButtons();
        this.setupVisibility();
    }

    setupDrag() {
        let isDragging = false;
        let offsetX, offsetY;

        const getPointerPosition = (e) => {
            if (e.touches) {
                return { x: e.touches[0].clientX, y: e.touches[0].clientY };
            } else {
                return { x: e.clientX, y: e.clientY };
            }
        };

        const startDrag = (e) => {
            isDragging = true;
            const pointer = getPointerPosition(e);
            const rect = this.calculatorCanvas.getBoundingClientRect();
            offsetX = pointer.x - rect.left;
            offsetY = pointer.y - rect.top;
            this.calculatorCanvas.style.cursor = 'move';
            e.preventDefault();
        };

        const drag = (e) => {
            if (isDragging) {
                const pointer = getPointerPosition(e);
                // Calculer les nouvelles positions en tenant compte des limites de la fenêtre
                let newLeft = pointer.x - offsetX;
                let newTop = pointer.y - offsetY;

                // Empêcher la calculatrice de sortir de l'écran
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                const calcWidth = this.calculatorCanvas.offsetWidth;
                const calcHeight = this.calculatorCanvas.offsetHeight;

                newLeft = Math.max(0, Math.min(newLeft, windowWidth - calcWidth));
                newTop = Math.max(0, Math.min(newTop, windowHeight - calcHeight));

                this.calculatorCanvas.style.left = `${newLeft}px`;
                this.calculatorCanvas.style.top = `${newTop}px`;
            }
        };

        const stopDrag = () => {
            isDragging = false;
            this.calculatorCanvas.style.cursor = 'default';
        };

        const calculatorHeader = this.calculatorCanvas.querySelector('h3');
        if (calculatorHeader) {
            calculatorHeader.addEventListener('mousedown', startDrag);
            calculatorHeader.addEventListener('touchstart', startDrag);
        } else {
            console.warn("Le titre de la calculatrice est introuvable.");
        }

        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
    }

    setupButtons() {
        this.canvasCalcButtons.forEach(button => {
            button.addEventListener("click", () => this.handleCalcButton(button.textContent));
        });

        if (this.closeCanvasCalculatorBtn) {
            this.closeCanvasCalculatorBtn.addEventListener("click", () => this.hideCalculator());
        } else {
            console.warn("Le bouton 'Fermer' de la calculatrice est introuvable.");
        }
    }

    setupVisibility() {
        const showCalculatorBtn = document.getElementById("show-calculator");
        if (showCalculatorBtn) {
            showCalculatorBtn.addEventListener("click", () => this.showCalculator());
        } else {
            console.warn("Le bouton 'Calculatrice' avec l'ID 'show-calculator' est introuvable.");
        }
    }

    handleCalcButton(value) {
        if (value === "C") {
            this.canvasCalcDisplay.value = "";
        } else if (value === "=") {
            try {
                // Utiliser une fonction sécurisée pour évaluer l'expression
                this.canvasCalcDisplay.value = Function('"use strict";return (' + this.canvasCalcDisplay.value + ')')();
            } catch {
                this.canvasCalcDisplay.value = "Erreur";
            }
        } else {
            this.canvasCalcDisplay.value += value;
        }
    }

    showCalculator() {
        if (this.calculatorCanvas) {
            this.calculatorCanvas.style.display = 'block';
            this.calculatorCanvas.style.zIndex = 9999;
            // Positionner la calculatrice au centre si elle n'a pas encore été positionnée
            if (!this.calculatorCanvas.style.left || !this.calculatorCanvas.style.top) {
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                const calcWidth = this.calculatorCanvas.offsetWidth;
                const calcHeight = this.calculatorCanvas.offsetHeight;
                this.calculatorCanvas.style.left = `${(windowWidth - calcWidth) / 2}px`;
                this.calculatorCanvas.style.top = `${(windowHeight - calcHeight) / 2}px`;
            }
        } else {
            console.warn("La calculatrice avec l'ID 'calculator-canvas' est introuvable.");
        }
    }

    hideCalculator() {
        if (this.calculatorCanvas) {
            this.calculatorCanvas.style.display = 'none';
        }
    }
}

// Module de Gestion de l'Importation et de l'Exportation
class ImportExportModule {
    constructor(canvas, historyModule) {
        this.canvas = canvas;
        this.history = historyModule;
        this.nomFichierJSON = null;
    }

    init() {
        this.setupSaveImage();
        this.setupUploadImage();
        this.setupSaveJSON();
        this.setupLoadJSON();
        this.setupDeleteObject();
        this.setupDeleteMeasurementText();
    }

    setupSaveImage() {
        const saveImgBtn = document.querySelector(".save-img");
        if (saveImgBtn) {
            saveImgBtn.addEventListener("click", () => this.saveAsImage());
        } else {
            console.warn("Le bouton 'Enregistrer en Image' avec la classe 'save-img' est introuvable.");
        }
    }

    saveAsImage() {
        const dataURL = this.canvas.toDataURL({
            format: 'png',
            multiplier: 2
        });
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = `canvas_${Date.now()}.png`;
        link.click();
    }

    setupUploadImage() {
        const uploadImageInput = document.getElementById("upload-image");
        if (uploadImageInput) {
            uploadImageInput.addEventListener("change", (e) => this.uploadImage(e));
        } else {
            console.warn("Le sélecteur d'image avec l'ID 'upload-image' est introuvable.");
        }
    }

    uploadImage(e) {
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
                this.canvas.add(img);
                this.canvas.renderAll();
                this.history.enregistrerEtat();
            }, { /* crossOrigin: 'anonymous' */ }); // Supprimer si le serveur ne supporte pas CORS
        };
        reader.readAsDataURL(file);
    }

    setupSaveJSON() {
        const saveJSONBtn = document.getElementById("save-json");
        if (saveJSONBtn) {
            saveJSONBtn.addEventListener("click", () => this.saveAsJSON());
        } else {
            console.warn("Le bouton 'Enregistrer en JSON' avec l'ID 'save-json' est introuvable.");
        }
    }

    saveAsJSON() {
        const canvasJSON = JSON.stringify(this.canvas.toJSON());
        const blob = new Blob([canvasJSON], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = this.nomFichierJSON ? this.nomFichierJSON : `canvas_${Date.now()}.json`;
        link.click();

        alert(this.nomFichierJSON ? `Modifications enregistrées dans ${this.nomFichierJSON}` : "Nouveau fichier JSON créé !");
    }

    setupLoadJSON() {
        const loadJSONInput = document.getElementById("load-json");
        if (loadJSONInput) {
            loadJSONInput.addEventListener("change", (e) => this.loadFromJSON(e));
        } else {
            console.warn("Le sélecteur de chargement JSON avec l'ID 'load-json' est introuvable.");
        }
    }

    loadFromJSON(e) {
        const file = e.target.files[0];
        if (!file) return;

        this.nomFichierJSON = file.name;

        const reader = new FileReader();
        reader.onload = (event) => {
            const json = event.target.result;
            this.canvas.loadFromJSON(json, () => {
                this.canvas.renderAll();
                alert("Le canevas a été chargé avec succès !");
                this.history.enregistrerEtat();
            });
        };
        reader.readAsText(file);
    }

    setupDeleteObject() {
        const deleteObjectBtn = document.getElementById('delete-object');
        if (deleteObjectBtn) {
            deleteObjectBtn.addEventListener("click", () => this.deleteSelectedObject());
        } else {
            console.warn("Le bouton 'Supprimer l'objet' avec l'ID 'delete-object' est introuvable.");
        }
    }

    deleteSelectedObject() {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            // Supprimer le texte de mesure associé si présent
            const associatedText = activeObject.measurementText || activeObject.rulerText;
            if (associatedText) {
                this.canvas.remove(associatedText);
            }
            this.canvas.remove(activeObject);
            this.canvas.renderAll();
            this.history.enregistrerEtat();
        } else {
            alert("Aucun objet sélectionné !");
        }
    }

    setupDeleteMeasurementText() {
        const deleteMeasurementBtn = document.getElementById('delete-measurement-text');
        if (deleteMeasurementBtn) {
            deleteMeasurementBtn.addEventListener("click", () => this.deleteMeasurementText());
        } else {
            console.warn("Le bouton 'Supprimer le texte de mesure' avec l'ID 'delete-measurement-text' est introuvable.");
        }
    }

    deleteMeasurementText() {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            const associatedText = activeObject.measurementText || activeObject.rulerText;
            if (associatedText) {
                this.canvas.remove(associatedText);
                if (activeObject.measurementText) {
                    activeObject.measurementTextActive = false;
                    delete activeObject.measurementText;
                }
                if (activeObject.rulerText) {
                    delete activeObject.rulerText;
                }
                this.canvas.renderAll();
                this.history.enregistrerEtat();
            } else {
                alert("Aucun texte de mesure associé à cet objet !");
            }
        } else {
            alert("Aucun objet sélectionné !");
        }
    }
}

// Module de Gestion de l'Aperçu Avant Impression
class PrintPreviewModule {
    constructor(canvas) {
        this.canvas = canvas;
        this.printPreviewBtn = document.getElementById('print-preview-btn');

        // Vérifiez si les éléments existent
        if (this.printPreviewBtn) {
            this.printPreviewModal = document.getElementById('print-preview-modal');
            if (this.printPreviewModal) {
                this.closeModalSpan = this.printPreviewModal.querySelector('.close-modal');
                this.previewImage = document.getElementById('preview-image');
                this.printBtn = document.getElementById('print-btn');
            }
        }
    }

    init() {
        if (!this.printPreviewBtn || !this.printPreviewModal) {
            console.warn("Les éléments nécessaires pour l'aperçu avant impression sont manquants.");
            return;
        }
        this.setupPrintPreview();
        this.setupModalClose();
        this.setupPrint();
    }

    setupPrintPreview() {
        this.printPreviewBtn.addEventListener('click', () => this.showPreview());
    }

    showPreview() {
        const dataURL = this.canvas.toDataURL({
            format: 'png',
            multiplier: 2
        });
        if (this.previewImage) {
            this.previewImage.src = dataURL;
            this.printPreviewModal.style.display = 'block';
        }
    }

    setupModalClose() {
        if (this.closeModalSpan) {
            this.closeModalSpan.addEventListener('click', () => this.hidePreview());
        }
        window.addEventListener('click', (event) => {
            if (event.target === this.printPreviewModal) {
                this.hidePreview();
            }
        });
    }

    hidePreview() {
        if (this.printPreviewModal) {
            this.printPreviewModal.style.display = 'none';
        }
    }

    setupPrint() {
        if (this.printBtn) {
            this.printBtn.addEventListener('click', () => this.printCanvas());
        }
    }

    printCanvas() {
        if (!this.previewImage) return;
        const printWindow = window.open('', 'PrintWindow', 'width=800,height=600');
        printWindow.document.write('<html><head><title>Aperçu Avant Impression</title>');
        printWindow.document.write('<style>body { display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(`<img src="${this.previewImage.src}" alt="Aperçu du Canevas" style="max-width: 100%; height: auto;">`);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }
}

// Module de Gestion de la Duplication d'Objets
class DuplicateModule {
    constructor(canvas, historyModule) {
        this.canvas = canvas;
        this.history = historyModule;
        this.duplicateBtn = this.createDuplicateButton();
    }

    init() {
        this.setupEvents();
    }

    createDuplicateButton() {
        const btn = document.createElement('button');
        btn.innerHTML = '+';
        btn.classList.add('duplicate-btn');
        document.body.appendChild(btn);
        btn.style.display = 'none';
        btn.style.position = 'absolute';
        btn.style.transform = 'translate(-50%, -100%)';
        btn.style.padding = '5px 10px';
        btn.style.borderRadius = '50%';
        btn.style.backgroundColor = '#4A98F7';
        btn.style.color = '#fff';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.zIndex = 1000;
        btn.style.transition = 'background-color 0.3s';
        btn.addEventListener('mouseover', () => {
            btn.style.backgroundColor = '#3672c7';
        });
        btn.addEventListener('mouseout', () => {
            btn.style.backgroundColor = '#4A98F7';
        });
        return btn;
    }

    setupEvents() {
        this.duplicateBtn.addEventListener('click', () => this.duplicateObject());
        this.canvas.on('selection:created', () => this.showDuplicateButton());
        this.canvas.on('selection:updated', () => this.showDuplicateButton());
        this.canvas.on('selection:cleared', () => this.hideDuplicateButton());

        // Suppression via touche "Delete"
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Delete') {
                this.deleteSelectedObject();
            }
        });
    }

    showDuplicateButton() {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            // Obtenir la position absolue de l'objet sur le canevas
            const canvasRect = this.canvas.upperCanvasEl.getBoundingClientRect();
            const objLeft = (activeObject.left + activeObject.width / 2) * this.canvas.getZoom() + canvasRect.left;
            const objTop = activeObject.top * this.canvas.getZoom() + canvasRect.top;

            // Positionner le bouton de duplication au centre supérieur de l'objet
            this.duplicateBtn.style.left = `${objLeft}px`;
            this.duplicateBtn.style.top = `${objTop}px`;
            this.duplicateBtn.style.display = 'block';
        }
    }

    hideDuplicateButton() {
        this.duplicateBtn.style.display = 'none';
    }

    duplicateObject() {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            activeObject.clone((clonedObj) => {
                clonedObj.set({
                    left: activeObject.left + 30,
                    top: activeObject.top + 30,
                    evented: true
                });
                this.canvas.add(clonedObj);
                this.canvas.setActiveObject(clonedObj);
                if (clonedObj.type !== 'group') {
                    // Ajouter les mesures si nécessaire
                    if (clonedObj.measurementText) {
                        clonedObj.measurementText.clone((clonedText) => {
                            clonedText.set({
                                left: clonedObj.left,
                                top: clonedObj.top - 20,
                                angle: 0
                            });
                            this.canvas.add(clonedText);
                            clonedObj.measurementText = clonedText;
                        });
                    }
                } else {
                    // Pour les règles et les groupes (comme les tableaux)
                    clonedObj.getObjects().forEach(obj => {
                        if (obj.rulerText) {
                            obj.rulerText.clone((clonedRulerText) => {
                                clonedRulerText.set({
                                    left: clonedObj.left + obj.left,
                                    top: clonedObj.top + obj.top - 20,
                                    angle: 0
                                });
                                this.canvas.add(clonedRulerText);
                                obj.rulerText = clonedRulerText;
                            });
                        }
                        if (obj.measurementText) {
                            obj.measurementText.clone((clonedText) => {
                                clonedText.set({
                                    left: clonedObj.left + obj.left,
                                    top: clonedObj.top + obj.top - 20,
                                    angle: 0
                                });
                                this.canvas.add(clonedText);
                                obj.measurementText = clonedText;
                            });
                        }
                    });
                }
                this.canvas.renderAll();
                this.history.enregistrerEtat();
            });
        }
        this.hideDuplicateButton();
    }

    deleteSelectedObject() {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            const associatedText = activeObject.measurementText || activeObject.rulerText;
            if (associatedText) {
                this.canvas.remove(associatedText);
            }
            this.canvas.remove(activeObject);
            this.canvas.renderAll();
            this.history.enregistrerEtat();
        }
    }
}

// Module de Gestion de la Palette de Photos
class PhotoPaletteModule {
    constructor(canvas, historyModule) {
        this.canvas = canvas;
        this.history = historyModule;
        this.photoPaletteModal = document.getElementById('photo-palette-modal');
        this.openPaletteBtn = document.getElementById('open-photo-palette-btn');
        this.closePaletteSpan = this.photoPaletteModal ? this.photoPaletteModal.querySelector('.close-modal') : null;
        this.photoGallery = document.getElementById('photo-gallery');
        this.photoSearchInput = document.getElementById('photo-search');
        this.photos = []; // Tableau pour stocker les photos chargées
    }

    init() {
        this.setupOpenPalette();
        this.setupClosePalette();
        this.loadPhotos();
        this.setupSearch();
    }

    setupOpenPalette() {
        if (this.openPaletteBtn) {
            this.openPaletteBtn.addEventListener('click', () => {
                this.photoPaletteModal.style.display = 'block';
            });
        } else {
            console.warn("Le bouton 'Ouvrir la Palette de Photos' avec l'ID 'open-photo-palette-btn' est introuvable.");
        }
    }

    setupClosePalette() {
        if (this.closePaletteSpan) {
            this.closePaletteSpan.addEventListener('click', () => {
                this.photoPaletteModal.style.display = 'none';
            });
        } else {
            console.warn("Le bouton de fermeture de la palette de photos est introuvable.");
        }

        window.addEventListener('click', (event) => {
            if (event.target === this.photoPaletteModal) {
                this.photoPaletteModal.style.display = 'none';
            }
        });
    }

    async loadPhotos() {
        try {
            const response = await fetch('merged.json'); // Assurez-vous que ce fichier existe et est correctement structuré
            if (!response.ok) {
                throw new Error('Erreur lors du chargement du fichier JSON');
            }
            const data = await response.json();
            this.photos = data; // Votre JSON doit être un tableau d'objets avec au moins la propriété 'src'
            this.displayPhotos(this.photos);
        } catch (error) {
            console.error('Erreur:', error);
            alert('Impossible de charger la palette de photos.');
        }
    }

    displayPhotos(photos) {
        if (!this.photoGallery) {
            console.warn("La galerie de photos avec l'ID 'photo-gallery' est introuvable.");
            return;
        }
        this.photoGallery.innerHTML = ''; // Vider la galerie avant d'afficher les nouvelles photos
        photos.forEach(photo => {
            const img = document.createElement('img');
            img.src = photo.src; // Utiliser 'src' comme dans votre JSON
            img.alt = photo.alt || 'Photo';
            img.title = photo.alt || 'Photo';
            img.style.width = '100px'; // Ajuster selon vos besoins
            img.style.height = 'auto';
            img.style.margin = '5px';
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => this.addPhotoToCanvas(photo.src));
            this.photoGallery.appendChild(img);
        });
    }

    addPhotoToCanvas(src) {
        fabric.Image.fromURL(src, (img) => {
            img.set({
                left: 100,
                top: 100,
                scaleX: 0.5,
                scaleY: 0.5,
                selectable: true,
                hasBorders: true,
                hasControls: true
            });
            this.canvas.add(img);
            this.canvas.renderAll();
            this.history.enregistrerEtat();
            this.photoPaletteModal.style.display = 'none'; // Fermer la palette après l'ajout
        }, {
            // crossOrigin: 'anonymous', // Supprimer si le serveur ne supporte pas CORS
        });
    }

    setupSearch() {
        if (this.photoSearchInput) {
            this.photoSearchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                const filteredPhotos = this.photos.filter(photo => {
                    const altText = (photo.alt || '').toLowerCase();
                    return altText.includes(query);
                });
                this.displayPhotos(filteredPhotos);
            });
        } else {
            console.warn("Le champ de recherche de photos avec l'ID 'photo-search' est introuvable.");
        }
    }
}

// Classe Principale de l'Application
class App {
    constructor(canvas) {
        this.canvas = canvas;
        this.historyModule = new HistoryModule(canvas);
        this.colorModule = new ColorModule();
        this.brushModule = new BrushModule(canvas, this.colorModule);
        this.shapesModule = new ShapesModule(canvas, this.colorModule, this.historyModule);
        this.textModule = new TextModule(canvas, this.historyModule);
        this.calculatorModule = new CalculatorModule();
        this.importExportModule = new ImportExportModule(canvas, this.historyModule);
        this.printPreviewModule = new PrintPreviewModule(canvas);
        this.duplicateModule = new DuplicateModule(canvas, this.historyModule);
        this.photoPaletteModule = new PhotoPaletteModule(canvas, this.historyModule);
    }

    init() {
        // Initialiser tous les modules
        this.historyModule.enregistrerEtat(); // Enregistrer l'état initial
        this.colorModule.init();
        this.brushModule.init();
        this.shapesModule.init();
        this.textModule.init();
        this.calculatorModule.init();
        this.importExportModule.init();
        this.printPreviewModule.init();
        this.duplicateModule.init();
        this.photoPaletteModule.init();

        // Attacher les événements pour l'annulation et le rétablissement
        const undoBtn = document.getElementById('annuler-btn');
        const redoBtn = document.getElementById('rétablir-btn');

        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.historyModule.annuler());
        } else {
            console.warn("Le bouton 'Annuler' avec l'ID 'annuler-btn' est introuvable.");
        }

        if (redoBtn) {
            redoBtn.addEventListener('click', () => this.historyModule.retablir());
        } else {
            console.warn("Le bouton 'Rétablir' avec l'ID 'rétablir-btn' est introuvable.");
        }

        // Gérer les événements de modification du canevas pour l'historique
        this.canvas.on('object:added', () => this.historyModule.enregistrerEtat());
        this.canvas.on('object:modified', () => this.historyModule.enregistrerEtat());
        this.canvas.on('object:removed', () => this.historyModule.enregistrerEtat());
    }
}

// Initialisation de l'Application une fois le DOM chargé
document.addEventListener('DOMContentLoaded', () => {
    const canvas = new fabric.Canvas('canvas', {
        isDrawingMode: false,
        backgroundColor: 'white',
        width: 1130,
        height: 1440
    });

    // Initialiser l'application
    const app = new App(canvas);
    app.init();
});
