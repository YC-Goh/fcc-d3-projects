
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
        titleStyle: PLOTTITLESTYLE,
        description: PLOTDESCRIPTION,
        descriptionStyle: PLOTDESCRIPTIONSTYLE
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
        .attr('data-year', (d) => d.year.getFullYear())
        .attr('data-month', (d) => d.month.getMonth())
        .attr('data-temp', (d) => d.temperature);
    heatBoxes
        .attr('width', CELLWIDTH)
        .attr('height', CELLHEIGHT)
        .attr('x', (d) => scaleX(d.year))
        .attr('y', (d) => scaleY(d.month) - 0.5 * CELLHEIGHT)
        .attr('fill', (d) => scaleColour(d.temperature));
    heatBoxes
        .on('mousemove', (e,d) => {
            heatBoxes.attr('fill', 'lightgray');
            e.currentTarget.setAttribute('fill', scaleColour(d.temperature));
            const TARGETX = e.currentTarget.getAttribute('x');
            const TARGETY = e.currentTarget.getAttribute('y');
            canvas.select('#tooltip').remove();
            const tooltip = canvas.append('text').attr('x', TARGETX).attr('y', TARGETY).attr('id', 'tooltip');
            tooltip
                .attr('data-year', d.year.getFullYear())
                .attr('data-month', d.month.getMonth())
                .attr('data-temp', d.temperature);
            tooltip
                .append('tspan')
                .attr('dx', '2em')
                .attr('dy', '1em')
                .text(`DATE: ${d3.timeFormat('%B')(d.month)} ${d3.timeFormat('%Y')(d.year)}`);
            tooltip
                .append('tspan')
                .attr('x', TARGETX)
                .attr('dx', '2em')
                .attr('dy', '1em')
                .text(`TEMPERATURE: ${d3.format('.3f')(d.temperature)}`);
        });
    heatBoxes
        .on('mouseleave', (e,d) => {
            heatBoxes.attr('fill', (d,i,n) => scaleColour(d.temperature))
            canvas.select('#tooltip').remove();
        });
    const description = main.append('p').text(PLOTDESCRIPTION).attr('style', PLOTDESCRIPTIONSTYLE).attr('id', 'description');
    const legend = canvas.append('g').attr('id', 'legend');
    legend
        .attr('x', scaleX(MINYEAR))
        .attr('y', 3)
        .attr('width', PLOTWIDTH)
        .attr('height', PADDINGY - 6);
    const legendMarkers = legend.selectAll('rect').data([0,1,2,3,4].map((i) => MINTEMP + (MAXTEMP - MINTEMP) * (i / 4))).enter().append('rect').attr('class', 'legend-marker');
    legendMarkers
        .attr('width', PADDINGY - 24)
        .attr('height', PADDINGY - 24)
        .attr('x', (d,i) => scaleX(d3.interpolateDate(MINYEAR, MAXYEAR)(i/5)))
        .attr('y', 12)
        .attr('fill', (d) => scaleColour(d));
    const legendTitles = legend.selectAll('text').data([0,1,2,3,4].map((i) => MINTEMP + (MAXTEMP - MINTEMP) * (i / 4))).enter().append('text').attr('id', 'legend-title');
    legendTitles
        .attr('x', (d,i) => scaleX(d3.interpolateDate(MINYEAR, MAXYEAR)(i/5+.05)))
        .attr('y', PADDINGY - 18)
        .text((d) => `${d3.format('.3f')(d)}`);
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
                title: 'Mean Earth Temperature (Celsius) by Year and Month',
                titleStyle: 'display: block; width: fit-content; margin: 0 auto; padding: 0',
                description: 'Figure 1: Heat map of monthly mean surface temperature of the Earth from ~1750 to ~2010. Mouse over each cell to see its temperature (Celsius).',
                descriptionStyle: 'display: block; width: fit-content; margin: 0 auto; padding: 0'
            }
        );
    };
};
request.send();

