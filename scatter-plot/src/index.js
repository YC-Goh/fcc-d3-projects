
import * as d3 from 'd3';

const newDivTemplate = (newId) => {
    let newElement = document.createElement('div');
    newElement.id = newId;
    return newElement;
};

const newH2Template = (newId, text) =>  {
    let newElement = document.createElement('h2');
    newElement.innerText = text;
    newElement.id = newId;
    return newElement;
};

const newButtonTemplate = (newId, text) => {
    let newElement = document.createElement('button')
    newElement.type = 'button';
    newElement.innerText = text;
    newElement.id = newId;
    newElement.addEventListener('click', () => {document.getElementsByTagName('h2')[0].innerText = 'Clicked!'});
    return newElement;
};

document.body.appendChild(newDivTemplate('main'));
document.getElementById('main').setAttribute('style', 'display:flex; margin:0; padding:0');
document.getElementById('main').appendChild(newH2Template('title', 'Compiled Successfully'));
document.getElementById('title').setAttribute('style', 'margin:0; padding:0');
document.getElementById('main').appendChild(newButtonTemplate('successButton', 'Click Me!'));

//  let dataSet = [5,3,4,6,7,5,3,2,5,4,3,6,4,3,1,5,4,3,5,4,3,1,5,4,2];
//  d3.select('body').append('svg').attr('width', 500).attr('height', 300).attr('style', 'border:1px solid black').attr('id', 'canvas');
//  d3.select('#canvas').selectAll('rect').data(dataSet).enter().append('rect').attr('width', 15).attr('height', (d,i) => 25 * d).attr('x', (d,i) => 20 * i).attr('y', (d,i) => 300 - (25 * d)).attr('fill', 'red')

const barPlot = (parentSelector, canvasProps, dataSet) => {
    const newDataSet = dataSet.slice().map(([date, val]) => ({date: new Date(date), gdp: val}));
    const { id: ID, height: HEIGHT, width: WIDTH, padding: PADDINGY, style: STYLE, fill: FILL } = canvasProps;
    const NUMBARS = newDataSet.length;
    const BARWIDTH = Math.floor(WIDTH / NUMBARS);
    const PADDINGX = Math.floor((WIDTH - (BARWIDTH * NUMBARS)) / 2);
    const MINDATE = d3.min(newDataSet.map((d) => d.date));
    const MAXDATE = d3.max(newDataSet.map((d) => d.date));
    const scaleX = d3.scaleTime()
        .domain([MINDATE, MAXDATE])
        .range([PADDINGX, WIDTH - PADDINGX]);
    const MINGDP = d3.min(newDataSet.map((d) => d.gdp));
    const MAXGDP = d3.max(newDataSet.map((d) => d.gdp));
    const scaleY = d3.scaleLinear()
        .domain([MINGDP, MAXGDP])
        .range([HEIGHT - PADDINGY, PADDINGY]);
    const axisX = d3.axisBottom(scaleX).ticks(d3.timeYear.every(10)).tickFormat(d3.timeFormat('%Y'));
    const axisY = d3.axisLeft(scaleY);
    const canvas = d3.select(parentSelector).append('svg').attr('id', ID);
    canvas
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
        .attr('style', STYLE);
    canvas.selectAll('rect').data(newDataSet).enter().append('rect')
        .attr('width', BARWIDTH)
        .attr('height', (d,i) => (HEIGHT - PADDINGY) - scaleY(d.gdp))
        .attr('x', (d,i) => scaleX(d.date))
        .attr('y', (d,i) => scaleY(d.gdp))
        .attr('fill', FILL);
    canvas.append('g')
        .call(axisX)
        .attr('transform', `translate(0, ${HEIGHT - PADDINGY})`);
    canvas.append('g')
        .call(axisY)
        .attr('transform', `translate(${PADDINGX}, 0)`);
};

let responseObject;
let dataSet;

const dataUrl = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
const request = new XMLHttpRequest();
request.open('GET', dataUrl, true);
request.onload = () => {
    if (request.status == 200) {
        responseObject = JSON.parse(request.responseText);
        dataSet = responseObject.data;
        barPlot('body', {id: 'canvas', width: 960, height: 540, padding: 24, style: 'border:1px solid black', fill: 'black'}, dataSet);
    };
};
request.send();

