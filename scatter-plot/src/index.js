
import * as d3 from 'd3';

const newDivTemplate = (newId) => {
    let newElement = document.createElement('div');
    newElement.id = newId;
    return newElement;
};

document.body.getElementsByTagName('h1')[0].remove();
document.body.appendChild(newDivTemplate('main'));
document.getElementById('main').setAttribute('style', 'display: flex; flex-flow: column wrap; margin: 0; padding: 0');

const scatterPlot = (parentSelector, dataSet, canvasProps) => {
    const newDataSet = dataSet.map(({year, time, charge}) => ({xvalue: new Date(year, 0), yvalue: new Date(1970,0,1,0,0,time), charge}));
    const {
        width: CANVASWIDTH, 
        height: CANVASHEIGHT, 
        style: CANVASSTYLE, 
        plotWidth: PLOTWIDTH, 
        plotHeight: PLOTHEIGHT, 
        dotColor: DOTCOLOR,
        title: PLOTTITLE, 
        titleStyle: PLOTTITLESTYLE
    } = canvasProps;
    const MINYEAR = d3.min(newDataSet.map((d) => d.xvalue));
    const MAXYEAR = d3.max(newDataSet.map((d) => d.xvalue));
    const PADDINGX = (CANVASWIDTH - PLOTWIDTH) / 2;
    const scaleX = d3.scaleTime().domain([MINYEAR, MAXYEAR]).range([PADDINGX, PLOTWIDTH + PADDINGX]);
    const axisX = d3.axisBottom(scaleX);
    const MINTIME = d3.min(newDataSet.map((d) => d.yvalue));
    const MAXTIME = d3.max(newDataSet.map((d) => d.yvalue));
    const PADDINGY = (CANVASHEIGHT - PLOTHEIGHT) / 2;
    const scaleY = d3.scaleTime().domain([MINTIME, MAXTIME]).range([PLOTHEIGHT + PADDINGY, PADDINGY]);
    const axisY = d3.axisLeft(scaleY).tickFormat(d3.timeFormat('%M:%S'));
    const main = d3.select(parentSelector);
    const title = main.append('h1');
    title
        .text(PLOTTITLE)
        .attr('id', 'title')
        .attr('style', PLOTTITLESTYLE);
    const canvas = main.append('svg');
    canvas
        .attr('width', CANVASWIDTH)
        .attr('height', CANVASHEIGHT)
        .attr('style', CANVASSTYLE);
    const dataPoints = canvas.selectAll('circle').data(newDataSet).enter().append('circle');
    dataPoints
        .attr('class', 'dot')
        .attr('data-xvalue', (d) => d.xvalue)
        .attr('cx', (d,i,n) => scaleX(new Date(n[i].getAttribute('data-xvalue'))))
        .attr('data-yvalue', (d) => d.yvalue)
        .attr('cy', (d,i,n) => scaleY(new Date(n[i].getAttribute('data-yvalue'))))
        .attr('r', 5)
        .attr('fill', (d) => DOTCOLOR(d));
    canvas.append('g')
        .call(axisX)
        .attr('id', 'x-axis')
        .attr('transform', `translate(0, ${PLOTHEIGHT + PADDINGY})`);
    canvas.append('g')
        .call(axisY)
        .attr('id', 'y-axis')
        .attr('transform', `translate(${PADDINGX}, 0)`);
    dataPoints
        .on('mousemove', (e,d) => {
            dataPoints.attr('fill', 'lightgray')
            e.currentTarget.setAttribute('fill', 'red');
            const TARGETX = e.currentTarget.getAttribute('cx');
            const TARGETY = e.currentTarget.getAttribute('cy');
            canvas.select('#tooltip').remove();
            canvas.select('#tooltip-time').remove();
            canvas.select('#tooltip-charge').remove();
            canvas.append('text')
                .attr('id', 'tooltip')
                .attr('data-year', d.xvalue)
                .attr('x', TARGETX)
                .attr('y', TARGETY)
                .attr('dx', 12)
                .text(() => `YEAR: ${d3.timeFormat('%Y')(d.xvalue)}`);
            canvas.append('text')
                .attr('id', 'tooltip-time')
                .attr('data-time', d.yvalue)
                .attr('x', TARGETX)
                .attr('y', TARGETY)
                .attr('dx', 12)
                .attr('dy', 16)
                .text(() => `TIME: ${d3.timeFormat('%M:%S')(d.yvalue)}`);
            canvas.append('text')
                .attr('id', 'tooltip-charge')
                .attr('data-charge', d.charge)
                .attr('x', TARGETX)
                .attr('y', TARGETY)
                .attr('dx', 12)
                .attr('dy', 32)
                .text(() => `CHARGE: ${d.charge}`);
        });
    dataPoints
        .on('mouseleave', (e,d) => {
            dataPoints.attr('fill', (d) => DOTCOLOR(d));
            canvas.select('#tooltip').remove();
            canvas.select('#tooltip-time').remove();
            canvas.select('#tooltip-charge').remove();
        });
    const LEGENDX = scaleX(MINYEAR);
    const LEGENDY = scaleY(MINTIME) + 24;
    const legend = canvas.append('g').attr('id', 'legend')
    legend.append('rect')
        .attr('x', LEGENDX)
        .attr('y', LEGENDY)
        .attr('width', 256)
        .attr('height', 24)
        .attr('fill', 'white')
        .attr('stroke', 'black')
        .attr('stroke-width', 1);
    legend.append('circle')
        .attr('cx', LEGENDX + 12)
        .attr('cy', LEGENDY + 12)
        .attr('r', 5)
        .attr('fill', DOTCOLOR({charge: ''}));
    legend.append('text')
        .attr('x', LEGENDX + 24)
        .attr('y', LEGENDY + 16)
        .text('No Charge');
    legend.append('circle')
        .attr('cx', LEGENDX + 116)
        .attr('cy', LEGENDY + 12)
        .attr('r', 5)
        .attr('fill', DOTCOLOR({charge: 'Charged'}));
    legend.append('text')
        .attr('x', LEGENDX + 128)
        .attr('y', LEGENDY + 16)
        .text('Has Drug Charge');
};

let responseObject;
let dataSet;

const dataUrl = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
const request = new XMLHttpRequest();
request.open('GET', dataUrl, true);
request.onload = () => {
    if (request.status == 200) {
        responseObject = JSON.parse(request.responseText);
        dataSet = responseObject.map((d) => ({year: d.Year, time: d.Seconds, charge: d.Doping}));
        scatterPlot(
            '#main',
            dataSet,
            {
                width: 1120,
                height: 630,
                plotWidth: 880,
                plotHeight: 495,
                dotColor: (data) => { if (data.charge === '') { return 'black' } else { return 'brown' }; },
                style: 'border: 1px solid black; display: block; margin: 0 auto; padding: 0',
                title: 'Year and Race Time of Doping Incidents in Competitive Cycling',
                titleStyle: 'display: block; width: fit-content; margin: 0 auto; padding: 0'
            }
        );
    };
};
request.send();

