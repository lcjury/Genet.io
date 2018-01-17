const gridWidth = 120;
const gridLength = 4;
// first we need to create a stage
var stage = new Konva.Stage({
    container: 'container',   // id of container <div>
    width: gridWidth * gridLength + 300,
    height: gridWidth * gridLength
});

function Grid (cells, gridWidth, rows, cols) {
    cols = cols || cells;
    rows = rows || cells;

    const cellWidth = gridWidth / cells;

    const group = new Konva.Group({});

    for (let i = 0; i < rows + 1; i++) {
        const HLine = new Konva.Line({
            points: [
                //0, i * gridWidth,
                //gridWidth * cells, i * gridWidth
                0, i * gridWidth,
                gridWidth * cols, i * gridWidth
            ],
            stroke: 'black',
            strokWidth: 1
        });
        group.add(HLine);
    }

    for (let i = 0; i < cols + 1; i++) {
        const VLine = new Konva.Line({
            points: [
                i * gridWidth, 0,
                i * gridWidth, gridWidth * rows
            ],
            stroke: 'black',
            strokWidth: 1
        });
        group.add(VLine);
    }
    return group;
}

const gridLayer = new Konva.Layer();
gridLayer.add(Grid(gridLength, gridWidth));
const breedLayer = new Konva.Layer({
    x : gridWidth * gridLength + (gridWidth / 10)
});
const breedGridLayer = new Konva.Layer({
    x : gridWidth * gridLength + (gridWidth / 10)
});
breedGridLayer.add(Grid(2, gridWidth, 1, 2));

const birthGrid = Grid(2, gridWidth, 1, 2);
birthGrid.y(120 + 12);
breedGridLayer.add(birthGrid);


var parentsText = new Konva.Text({text: 'Padres', fontSize: 26});
var childsText = new Konva.Text({y: 120+12, text: 'Hijos', fontSize: 26});

breedGridLayer.add(parentsText);
breedGridLayer.add(childsText);

const layer = new Konva.Layer();

function RandomCircle()
{
    return {
        radius: Math.random()*45,
        fill: Konva.Util.getRandomColor(),
        stroke: 'black',
        strokeWidth: 4,
    };
}

function crossOverBall(father, mother)
{
    function randSelect(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    const radius = randSelect([father.radius(), mother.radius()]);
    const strokeWidth = randSelect([father.strokeWidth(), mother.strokeWidth()]);

    const fatherPalette = Konva.Util.getRGB(father.fill());
    const motherPalette = Konva.Util.getRGB(mother.fill());

    const fill = 'rgb('+
        randSelect([fatherPalette.r, motherPalette.r])+','+
        randSelect([fatherPalette.g, motherPalette.g])+','+
        randSelect([fatherPalette.b, motherPalette.b])+')';

    return {
        radius: radius,
        fill: fill,
        stroke: 'black',
        strokeWidth: strokeWidth
    };
}

function circleShapeFactory(circle, pos)
{
    // create our shape
    return circleShape = new Konva.Circle(Object.assign(circle, {
        x: (gridWidth / 2 + pos * gridWidth) % ( gridWidth * gridLength),
        y: gridWidth / 2 + gridWidth * Math.floor(pos / gridLength),
    }));
}

function randomPopulation(amount)
{
    const population = [];
    for(let i = 0; i < gridLength * gridLength; i++) {
        population.push(RandomCircle());
    }
    return population;
}

breedLayer.add(new Konva.Rect({
    width: 700,
    height: 700,
    fill: 'black',
    opacity: 0.2
}));

function Breeder()
{
    let parents = [];
    let childs = [];

    this.add = function add(shape)
    {
        parents.push(shape);
        if (parents.length > 2) {
            parents.shift();
        }
        if (parents.length == 2) {
            this.bred();
        }
        this.draw();
    }

    this.draw = function draw() {
        breedLayer.destroyChildren();
        //Draw parents
        for(let i = 0; i < parents.length; i++) {
            const shape = parents[i];
            shape.x(60 + 120 * i);
            shape.y(60);
            breedLayer.add(shape);
        }
        //Draw childs
        for(let i = 0; i < childs.length; i++) {
            const childShape = childs[i];
            childShape.x(60 + 120 * i);
            childShape.y(120 + 60 + 12);
            breedLayer.add(childShape);
        }
        breedLayer.draw();
    }

    this.bred = function bred() {
        childs[0] = circleShapeFactory(crossOverBall(parents[0], parents[1]));
        childs[1] = circleShapeFactory(crossOverBall(parents[0], parents[1]));
    }

    this.clear = function clear() {
        childs = [];
        parents = [];
        this.draw();
    }
}

const breeder = new Breeder();

// add the layer to the stage
stage.add(gridLayer);
stage.add(layer);
stage.add(breedGridLayer);
stage.add(breedLayer);

function randomize()
{
    const population = randomPopulation(gridLength ** 2);

    layer.destroyChildren();
    for(let i = 0; i < population.length; i++) {
        const shape = circleShapeFactory(population[i], i);
        shape.on('click', function(event) {
            breeder.add(event.target);
        });
        //layer.add(circleShapeFactory(crossOverBall(population[i], RandomCircle()), i));
        layer.add(shape);
    }
    layer.draw();
}
