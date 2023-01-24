
import * as d3 from 'd3';

const newDivTemplate = (newId) => {
    let newElement = document.createElement('div');
    newElement.id = newId;
    return newElement;
};

document.body.getElementsByTagName('h1')[0].remove();
document.body.appendChild(newDivTemplate('main'));
document.getElementById('main').setAttribute('style', 'display: flex; flex-flow: column wrap; margin: 0; padding: 0');

const dataUrlKickstarter = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json';
const dataUrlMovies = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json';
const dataUrlVideoGames = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json';

async function newRequest(params) {
    const { method, url, async } = params;
    const response = await (new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open(method, url, async)
        request.send()
        request.onload = () => {
            if (request.status === 200) {
                resolve(JSON.parse(request.responseText))
            } else {
                reject(`Data not retrieved from ${url}.`)
            };
        };
    })).then((data) => {
        return data;
    }).catch((error) => {
        throw error;
    });
    treePlot('#main', response, {
        width: 1120, 
        height: 630, 
        style: 'display: block; margin: 0 auto; padding: 0; border: 1px solid black', 
        plotWidth: 720, 
        plotHeight: 540, 
        title: 'Treemap lmao', 
        titleStyle: 'display: block; width: fit-content; margin: 0 auto; padding: 0', 
        description: 'Figure 1: Treemap lmao', 
        descriptionStyle: 'display: block; width: 1120px; text-align: center; margin: 0 auto; padding: 0'
    });
};

const treePlot = (parentSelector, dataSet, canvasProps) => {
    const {
        width: CANVASWIDTH, 
        height: CANVASHEIGHT, 
        style: CANVASSTYLE, 
        plotWidth: PLOTWIDTH, 
        plotHeight: PLOTHEIGHT, 
        title: PLOTTITLE, 
        titleStyle: PLOTTITLESTYLE, 
        description: PLOTDESCRIPTION, 
        descriptionStyle: PLOTDESCRIPTIONSTYLE, 
    } = canvasProps;
    const [ PADDINGX, PADDINGY ] = [ (CANVASWIDTH - PLOTWIDTH) / 2, (CANVASHEIGHT - PLOTHEIGHT) / 2 ];
    const root = d3.hierarchy(dataSet);
    root.sum(function (d) { return d.value });
    root.sort(function (left, right) { return right.value - left.value });
    const tree = d3.treemap();
    tree.size([PLOTWIDTH, PLOTHEIGHT]);
    tree.tile(d3.treemapSquarify);
    const categories = tree(root).children.map(({data: {name}}) => name);
    const scaleColor = d3.scaleOrdinal().domain(categories).range(d3.schemeSet3);
    const main = d3.select(parentSelector);
    const title = main.append('h1').text(PLOTTITLE).attr('style', PLOTTITLESTYLE).attr('id', 'title');
    const canvas = main.append('svg').attr('width', CANVASWIDTH).attr('height', CANVASHEIGHT).attr('style', CANVASSTYLE).attr('id', 'canvas');
    const treeLeaves = tree(root).descendants().filter(({height}) => height === 0);
    const treeBranches = tree(root).descendants().filter(({height}) => height === 1);
    const treeTiles = canvas.selectAll('rect.tile').data(treeLeaves).enter().append('rect').attr('class', 'tile');
    treeTiles
        .attr('x', ({x0}) => x0 + PADDINGY)
        .attr('y', ({y0}) => y0 + PADDINGY)
        .attr('width', ({x0,x1}) => x1 - x0)
        .attr('height', ({y0,y1}) => y1 - y0)
        .attr('fill', ({parent:{data:{name}}}) => scaleColor(name))
        .attr('stroke', 'white')
        .attr('stroke-width', 1);
    treeTiles
        .attr('data-name', ({data:{name}}) => name)
        .attr('data-category', ({parent:{data:{name}}}) => name)
        .attr('data-value', ({value}) => value)
        .datum(function () { return this.dataset });
    treeTiles
        .on('mousemove', function (e,{name,category,value}) {
            const thisTile = d3.select(this);
            treeTiles.attr('fill', 'gray');
            thisTile.attr('fill', ({category}) => scaleColor(category));
            d3.select('#tooltip').remove();
            const [ POINTERX, POINTERY ] = d3.pointer(e);
            const tooltip = canvas.append('g').attr('id', 'tooltip');
            tooltip
                .attr('data-name', name)
                .attr('data-category', category)
                .attr('data-value', value);
            tooltip.append('rect').attr('id', 'tooltip-box')
                .attr('x', POINTERX + 16)
                .attr('y', POINTERY - 28)
                .attr('width', Math.max(`NAME: ${name}`.length,`CATEGORY: ${category}`.length) * 8 + 32)
                .attr('height', 64)
                .attr('fill', 'white')
                .attr('stroke', 'black')
                .attr('stroke-width', 1)
            tooltip.selectAll('text').data([`NAME: ${name}`,`CATEGORY: ${category}`,`VALUE: ${value}`]).enter().append('text').attr('class', 'tooltip-text')
                .attr('x', () => POINTERX + 24)
                .attr('y', (d,i) => POINTERY - 8 + i * 16)
                .text((d) => d);
        })
        .on('mouseleave', function (e,d) {
            treeTiles.attr('fill', ({category}) => scaleColor(category));
            d3.select('#tooltip').remove();
        });
    console.log(treeTiles);
    const treeCategories = canvas.selectAll('rect.category').data(treeBranches).enter().append('rect').attr('class', 'category');
    treeCategories
        .attr('x', ({x0}) => x0 + PADDINGY)
        .attr('y', ({y0}) => y0 + PADDINGY)
        .attr('width', ({x0,x1}) => x1 - x0)
        .attr('height', ({y0,y1}) => y1 - y0)
        .attr('fill', 'none')
        .attr('stroke', 'navy')
        .attr('stroke-width', 1);
    const legend = canvas.append('g').attr('id', 'legend');
    const legendItems = legend.selectAll('rect').data(categories).enter().append('rect').attr('class', 'legend-item');
    legendItems
        .attr('x', () => PADDINGY + PLOTWIDTH + 16)
        .attr('y', (d,i) => PADDINGY + i * 32)
        .attr('width', 16)
        .attr('height', 16)
        .attr('fill', (d) => scaleColor(d));
    legendItems
        .on('mousemove', function (e,d) {
            treeTiles.attr('fill', ({category}) => d === category ? scaleColor(category) : 'gray');
        })
        .on('mouseleave', function (e,d) {
            treeTiles.attr('fill', ({category}) => scaleColor(category));
        });
    const legendDescriptor = legend.selectAll('text').data(categories).enter().append('text').attr('class', 'legend-descriptor');
    legendDescriptor
        .attr('x', () => PADDINGY + PLOTWIDTH + 16 + 24)
        .attr('y', (d,i) => PADDINGY + i * 32 + 12)
        .text((d) => d);
    const description = main.append('p').text(PLOTDESCRIPTION).attr('style', PLOTDESCRIPTIONSTYLE).attr('id', 'description');
};

newRequest({method: 'GET', url: dataUrlMovies, async: true});
