
import * as d3 from 'd3';

const newDivTemplate = (newId) => {
    let newElement = document.createElement('div');
    newElement.id = newId;
    return newElement;
};

document.body.getElementsByTagName('h1')[0].remove();
document.body.appendChild(newDivTemplate('main'));
document.getElementById('main').setAttribute('style', 'display: flex; flex-flow: column wrap; margin: 0; padding: 0');

const heatPlot = (parentSelector, dataSet, canvasProps) => {
    const newDataSet = dataSet.map(({year, month, temperature}) => ({year: new Date(year, 0), month: new Date(1970, month - 1), temperature: temperature}));
    const {
        width: CANVASWIDTH, 
        height: CANVASHEIGHT, 
        style: CANVASSTYLE,
        plotWidth: PLOTWIDTH, 
        plotHeight: PLOTHEIGHT,
        title: PLOTTITLE,
        titleStyle: PLOTTITLESTYLE
    } = canvasProps;
    const PADDINGX = (CANVASWIDTH - PLOTWIDTH) / 2;
    const MINYEAR = d3.min(newDataSet.map((d) => d.year));
    const MAXYEAR = d3.max(newDataSet.map((d) => d.year));
    const CELLWIDTH = PLOTWIDTH / (MAXYEAR.getYear() - MINYEAR.getYear() + 1);
    const scaleX = d3.scaleTime().domain([MINYEAR, MAXYEAR]).range([PADDINGX, PLOTWIDTH + PADDINGX]);
    const axisX = d3.axisBottom(scaleX).tickFormat(d3.timeFormat('%Y'));
    const PADDINGY = (CANVASHEIGHT - PLOTHEIGHT) / 2;
    const MINMONTH = d3.min(newDataSet.map((d) => d.month));
    const MAXMONTH = d3.max(newDataSet.map((d) => d.month));
    const CELLHEIGHT = PLOTHEIGHT / (MAXMONTH.getMonth() - MINMONTH.getMonth() + 1);
    const scaleY = d3.scaleTime().domain([MINMONTH, MAXMONTH]).range([PLOTHEIGHT + PADDINGY - 0.5 * CELLHEIGHT, PADDINGY + 0.5 * CELLHEIGHT]);
    const axisY = d3.axisLeft(scaleY).tickFormat(d3.timeFormat('%B'));
    const MINTEMP = d3.min(newDataSet.map((d) => d.temperature));
    const MAXTEMP = d3.max(newDataSet.map((d) => d.temperature));
    const scaleColour = d3.scaleLinear().domain([MINTEMP, MAXTEMP]).range(['blue', 'red'])
    const main = d3.select(parentSelector);
    const title = main.append('h1').text(PLOTTITLE).attr('style', PLOTTITLESTYLE).attr('id', 'title');
    const canvas = main.append('svg').attr('width', CANVASWIDTH).attr('height', CANVASHEIGHT).attr('style', CANVASSTYLE);
    canvas.append('g').call(axisX).attr('transform', `translate(0, ${PLOTHEIGHT + PADDINGY})`).attr('id', 'x-axis');
    canvas.append('g').call(axisY).attr('transform', `translate(${PADDINGX}, 0)`).attr('id', 'y-axis');
    const heatBoxes = canvas.selectAll('rect').data(newDataSet).enter().append('rect').attr('class', 'cell');
    heatBoxes
        .attr('data-year', (d) => d.year)
        .attr('data-month', (d) => d.month)
        .attr('data-temp', (d) => d.temperature);
    heatBoxes
        .attr('width', CELLWIDTH)
        .attr('height', CELLHEIGHT)
        .attr('x', (d,i,n) => scaleX(new Date(n[i].getAttribute('data-year'))))
        .attr('y', (d,i,n) => scaleY(new Date(n[i].getAttribute('data-month'))) - 0.5 * CELLHEIGHT)
        .attr('fill', (d,i,n) => scaleColour(n[i].getAttribute('data-temp')));
};

let responseObject;
let dataSet;

const dataUrl = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
const request = new XMLHttpRequest();
request.open('GET', dataUrl, true);
request.onload = () => {
    if (request.status == 200) {
        responseObject = JSON.parse(request.responseText);
        dataSet = responseObject.monthlyVariance.map((d) => ({year: d.year, month: d.month, temperature: responseObject.baseTemperature + d.variance}));
        heatPlot(
            '#main',
            dataSet,
            {
                width: 960,
                height: 540,
                plotWidth: 800,
                plotHeight: 450,
                style: 'border: 1px solid black; display: block; margin: 0 auto; padding: 0',
                title: 'Mean Earth Temperature (Celcius) by Year and Month',
                titleStyle: 'display: block; width: fit-content; margin: 0 auto; padding: 0'
            }
        );
    };
};
request.send();

