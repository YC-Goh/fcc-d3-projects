
import * as d3 from 'd3';

const newDivTemplate = (newId) => {
    let newElement = document.createElement('div');
    newElement.id = newId;
    return newElement;
};

document.body.appendChild(newDivTemplate('main'));
const main = document.getElementById('main')
main.setAttribute('style', 'margin: 0; padding: 0');
document.getElementsByTagName('h1')[0].remove();

/*
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

main.appendChild(newH2Template('title', 'Compiled Successfully'));
document.getElementById('title').setAttribute('style', 'margin:0; padding:0');
main.appendChild(newButtonTemplate('successButton', 'Click Me!'));
*/

//  let dataSet = [5,3,4,6,7,5,3,2,5,4,3,6,4,3,1,5,4,3,5,4,3,1,5,4,2];
//  d3.select('body').append('svg').attr('width', 500).attr('height', 300).attr('style', 'border:1px solid black').attr('id', 'canvas');
//  d3.select('#canvas').selectAll('rect').data(dataSet).enter().append('rect').attr('width', 15).attr('height', (d,i) => 25 * d).attr('x', (d,i) => 20 * i).attr('y', (d,i) => 300 - (25 * d)).attr('fill', 'red')

const barPlot = (parentSelector, canvasProps, dataSet, plotTitle) => {
    const newDataSet = dataSet.slice().map(([date, val]) => ({date: new Date(date), gdp: val}));
    const { id: ID, height: HEIGHT, width: WIDTH, padding: PADDINGY, style: STYLE, fill: FILL, fillHover: fillHover } = canvasProps;
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
    const MAXBARHEIGHT = HEIGHT - (2 * PADDINGY);
    const scaleY = d3.scaleLinear()
        .domain([0, MAXGDP])
        .range([MAXBARHEIGHT, 0]);
    const axisX = d3.axisBottom(scaleX).ticks(d3.timeYear.every(10)).tickFormat(d3.timeFormat('%Y'));
    const axisY = d3.axisLeft(scaleY);
    const title = d3.select(parentSelector).append('h1')
    title
        .text(plotTitle)
        .attr('id', 'title')
        .attr('style', 'display: block; width: fit-content; margin: 0 auto; padding: 0');
    const canvas = d3.select(parentSelector).append('svg').attr('id', ID);
    canvas
        .attr('width', WIDTH)
        .attr('height', HEIGHT)
        .attr('style', STYLE);
    const dataBars = canvas.selectAll('rect').data(newDataSet).enter().append('rect');
    dataBars
        .attr('class', 'bar')
        .attr('data-date', (d,i) => d3.timeFormat('%Y-%m-%d')(d.date))
        .attr('data-gdp', (d,i) => d.gdp)
        .attr('width', BARWIDTH)
        .attr('height', (d,i) => MAXBARHEIGHT - scaleY(d.gdp))
        .attr('x', (d,i) => scaleX(d.date))
        .attr('y', (d,i) => scaleY(d.gdp) + PADDINGY)
        .attr('fill', FILL);
    /*
    dataBars.append('title')
        .text((d) => `Date: ${d3.timeFormat('%B %Y')(d.date)}\nGDP: US$${d.gdp} Billion`)
        .attr('id', 'tooltip');
    */
    dataBars
        .on('mousemove', (e,d) => {
            if (e.type === 'mousemove') {
                e.currentTarget.setAttribute('fill', 'red');
                canvas.select('#tooltip').remove();
                canvas.select('#tooltip-gdp').remove();
                const x = e.currentTarget.getAttribute('x');
                const y = e.currentTarget.getAttribute('y');
                canvas.append('text')
                    .text(`Date: ${d3.timeFormat('%B %Y')(d.date)}`)
                    .attr('id', 'tooltip')
                    .attr('data-date', d3.timeFormat('%Y-%m-%d')(d.date))
                    .attr('x', x)
                    .attr('y', y)
                    .attr('fill', 'red');
                canvas.append('text')
                    .text(`GDP: ${d.gdp} Billion`)
                    .attr('id', 'tooltip-gdp')
                    .attr('x', x)
                    .attr('y', y)
                    .attr('dy', 16)
                    .attr('fill', 'red');
            };
        });
    dataBars
        .on('mouseleave', (e,d) => {
            if (e.type === 'mouseleave') {
                e.currentTarget.setAttribute('fill', FILL);
                canvas.select('#tooltip').remove();
                canvas.select('#tooltip-gdp').remove();
            };
        });
    canvas.append('g')
        .call(axisX)
        .attr('id', 'x-axis')
        .attr('transform', `translate(0, ${MAXBARHEIGHT + PADDINGY})`);
    canvas.append('g')
        .call(axisY)
        .attr('id', 'y-axis')
        .attr('transform', `translate(${PADDINGX}, ${PADDINGY})`);
    d3.select('body').append('style').html(`#canvas > rect:hover { fill: ${fillHover} }`);
};

let responseObject;
let dataSet;

const dataUrl = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';
const request = new XMLHttpRequest();
request.open('GET', dataUrl, true);
request.onload = () => {
    if (request.status == 200) {
        responseObject = JSON.parse(request.responseText);
        dataSet = responseObject.data;
        barPlot(
            '#main', 
            {
                id: 'canvas', 
                width: 960, 
                height: 540, 
                padding: 24, 
                style: 'display: block; border: 1px solid black; margin: 0 auto; padding: 0', 
                fill: 'black', 
                fillHover: 'red'
            }, 
            dataSet,
            'US GDP (US$ Billions) Over Time (Quarters)'
        );
    };
};
request.send();

