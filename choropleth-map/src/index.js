
import * as d3 from 'd3';
import * as topology from 'topojson-client';

const newDivTemplate = (newId) => {
    let newElement = document.createElement('div');
    newElement.id = newId;
    return newElement;
};

document.body.getElementsByTagName('h1')[0].remove();
document.body.appendChild(newDivTemplate('main'));
document.getElementById('main').setAttribute('style', 'display: flex; flex-flow: column wrap; margin: 0; padding: 0');

/*
    Notes to self:
    Promise:
        This thing is an object that actually takes only a single callback function.
        The callback function itself should only take two arguments, namely a resolve and a reject function.
        The resolve and reject functions are like specially defined return functions and are defined internally to the Promise.
        To pass more parameters to the Promise, define a wrapper function that returns the Promise.
        The wrapper function approach works because the callback function that the Promise takes as input is executed immediately.
        The value that Promise returns is defined by whether resolve or reject is called first.
        The Promise method then() then takes two callback functions to handle the resolve and reject returns respectively.
    The callback function:
        The idea is that instead of running an asynchronous function that takes parameters, a success callback, and a failure callback,
        you first do stuff with the parameters that determines if it is a success or failure
        then run the respective callbacks on the successful or failure outcomes.
*/

/*  async/await --- await turns asynchronous function calls within an async function to synchronous function calls

const myfun = async (boo) => {
    const myReturn1 = await (new Promise((res, rej) => { if (boo) { res(1) } else { rej(2) } })).then((i) => i).catch((e) => e);
    const myReturn2 = await (new Promise((res, rej) => { if (myReturn1 === 1) { res('was true') } else { rej('was false') } })).then((i) => i).catch((e) => e);
    console.log(myReturn2);
    console.log(myReturn1);
};

myfun(false);

*/

const requestData = (params) => {
    return new Promise((resolve, reject) => {
        const { method, url, async } = params;
        const request = new XMLHttpRequest();
        request.open(method, url, async);
        request.send();
        request.onload = () => {
            if (request.status === 200) {
                resolve(JSON.parse(request.responseText))
            } else {
                reject(`Failed to load from ${url}.`);
            };
        };
    });
};

/*  This is an overly complicated way to do this --- just chain promises instead

const getData = async (paramsList) => {
    let resultList = [];
    for (let i in paramsList) {
        let result = await requestData(paramsList[i]).then((data) => data).catch((error) => error);
        resultList.push(result);
    };
    return resultList;
};

const data = getData([{method: 'GET', url: dataUrlEduc, async: true}, {method: 'GET', url: dataUrlUsCounty, async: true}]);
data.then((data) => console.log(data)).catch((error) => console.log(error));

*/

const dataUrlEduc = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
const dataUrlUsCounty = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

const mapPlot = (parentSelector, dataSet, canvasProps) => {
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
    const { 
        education: dataEduc, 
        counties: { features: dataCounties }, 
        states: { features: dataStates }, 
        nation: dataNation, 
    } = dataSet;
    const dataCountiesMerged = dataCounties.map(({geometry, id, properties, type}) => ({geometry, id, properties: dataEduc.filter((({fips}) => fips === id))[0], type}));
    const PADDINGX = (CANVASWIDTH - PLOTWIDTH) / 2;
    const PADDINGY = (CANVASHEIGHT - PLOTHEIGHT) / 2;
    const EDUCMIN = d3.min(dataEduc.map(({bachelorsOrHigher}) => bachelorsOrHigher));
    const EDUCMAX = d3.max(dataEduc.map(({bachelorsOrHigher}) => bachelorsOrHigher));
    const scaleColour = d3.scaleLinear().domain([EDUCMAX, EDUCMIN]).range(['blue', 'red']);
    const scaleGray = d3.scaleLinear().domain([EDUCMAX, EDUCMIN]).range(['gray', 'white']);
    const scaleProjection = d3.geoIdentity().fitExtent([[PADDINGX, PADDINGY],[PLOTWIDTH, PLOTHEIGHT]], dataNation);
    const main = d3.select(parentSelector);
    const title = main.append('h1').attr('id', 'title');
    title
        .text(PLOTTITLE)
        .attr('style', PLOTTITLESTYLE);
    const canvas = main.append('svg');
    canvas
        .attr('height', CANVASHEIGHT)
        .attr('width', CANVASWIDTH)
        .attr('style', CANVASSTYLE);
    const counties = canvas.selectAll('path.county').data(dataCountiesMerged).enter().append('path').attr('d', d3.geoPath(scaleProjection)).attr('class', 'county');
    counties
        .attr('data-name', (d) => d.properties.area_name)
        .attr('data-education', (d) => d.properties.bachelorsOrHigher)
        .attr('data-fips', (d) => d.properties.fips)
        .attr('data-state', (d) => d.properties.state)
        .datum(function () { return this.dataset; })
        .attr('fill', (d) => scaleColour(d.education));
    counties
        .on('mousemove', function (e,d) {
            const thisCounty = d3.select(this);
            const [POINTERX, POINTERY] = d3.pointer(e);
            counties.attr('fill', (d) => scaleGray(d.education));
            thisCounty.attr('fill', scaleColour(d.education));
            d3.select('#tooltip').remove();
            const tooltip = canvas.append('g').attr('id', 'tooltip');
            for (let key in d) {
                tooltip.attr(`data-${key}`, d[key]);
            };
            tooltip.append('rect').attr('x', POINTERX + 16).attr('y', POINTERY - 40).attr('width', 240).attr('height', 72).attr('fill', 'white').attr('stroke', 'black');
            tooltip.append('text').attr('x', POINTERX + 24).attr('y', POINTERY).attr('dy', -24).text(`COUNTY: ${d.name}`);
            tooltip.append('text').attr('x', POINTERX + 24).attr('y', POINTERY).attr('dy', -8).text(`FIPS: ${d.fips}`);
            tooltip.append('text').attr('x', POINTERX + 24).attr('y', POINTERY).attr('dy', 8).text(`PERCENT BACHELORS: ${d.education}`);
            tooltip.append('text').attr('x', POINTERX + 24).attr('y', POINTERY).attr('dy', 24).text(`STATE: ${d.state}`);
        });
    counties
        .on('mouseleave', function () {
            counties.attr('fill', (d) => scaleColour(d.education));
            d3.select('#tooltip').remove();
        });
    const states = canvas.selectAll('path.states').data(dataStates).enter().append('path').attr('d', d3.geoPath(scaleProjection)).attr('class', 'states');
    states
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', 1);
    const legend = canvas.append('g').attr('id', 'legend');
    legend.append('rect').attr('x', PADDINGX).attr('y', CANVASHEIGHT - 40).attr('width', PLOTWIDTH).attr('height', 32).attr('fill', 'white').attr('stroke', 'black');
    const legendSymbol = legend.selectAll('rect.symbol').data([0,1,2,3,4]).enter().append('rect').attr('class', 'symbol');
    legendSymbol.attr('x', (d) => (PADDINGX + 8) + PLOTWIDTH * (d / 5)).attr('y', CANVASHEIGHT - 32).attr('width', 16).attr('height', 16).attr('fill', (d) => scaleColour(EDUCMIN + (EDUCMAX - EDUCMIN) * (d/4)));
    const legendDescription = legend.selectAll('text.description').data([0,1,2,3,4]).enter().append('text').attr('class', 'description');
    legendDescription.attr('x', (d) => (PADDINGX + 32) + PLOTWIDTH * (d / 5)).attr('y', CANVASHEIGHT - 20).text((d) => `${d3.format('.1f')(EDUCMIN + (EDUCMAX - EDUCMIN) * (d/4))}%`);
    const description = main.append('p').attr('id', 'description');
    description
        .text(PLOTDESCRIPTION)
        .attr('style', PLOTDESCRIPTIONSTYLE);
};

(async () => {
    const dataSet = await (Promise.all([
        requestData({method: 'GET', url: dataUrlEduc, async: true}),
        requestData({method: 'GET', url: dataUrlUsCounty, async: true})
    ]).then(([dataEduc, dataMap]) => ({
        education: dataEduc, 
        counties: topology.feature(dataMap, dataMap.objects.counties), 
        states: topology.feature(dataMap, dataMap.objects.states), 
        nation: topology.feature(dataMap, dataMap.objects.nation), 
    })).catch((error) => error));
    mapPlot('#main', dataSet, {
        width: 1120, 
        height: 630, 
        style: 'display: block; margin: 0 auto; padding: 0; border: 1px solid black', 
        plotWidth: 960, 
        plotHeight: 540, 
        title: 'Education Map of the USA',
        titleStyle: 'display: block; width: fit-content; margin: 0 auto; padding: 0', 
        description: 'Figure 1: Map of the Counties of the USA, coloured by the percentage of the County population with Bachelor\'s or higher educational attainment (red = lowest, blue = highest).', 
        descriptionStyle: 'display: block; width: 960; margin: 0 auto; padding: 0', 
    });
})();

/*

(async () => {
    const dataSet = await (Promise.all([
        requestData({method: 'GET', url: dataUrlEduc, async: true}),
        requestData({method: 'GET', url: dataUrlUsCounty, async: true})
    ]).then(([dataEduc, dataMap]) => ({
        educ: dataEduc, 
        arcs: dataMap.arcs, 
        bbox: dataMap.bbox, 
        counties: dataMap.objects.counties.geometries, 
        states: dataMap.objects.states.geometries, 
        usa: dataMap.objects.nation.geometries[0], 
        scale: dataMap.transform.scale, 
        translate: dataMap.transform.translate
    })).catch((error) => error));
    mapPlot('#main', dataSet, {
        width: 1280, 
        height: 720, 
        plotWidth: 1, 
        plotHeight: 1, 
    });
    console.log(dataSet);
})();

*/
