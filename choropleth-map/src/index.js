
import * as d3 from 'd3';

const newDivTemplate = (newId) => {
    let newElement = document.createElement('div');
    newElement.id = newId;
    return newElement;
};

//  document.body.getElementsByTagName('h1')[0].remove();
document.body.appendChild(newDivTemplate('main'));
document.getElementById('main').setAttribute('style', 'display: flex; flex-flow: column wrap; margin: 0; padding: 0');

const mapPlot = (parentSelector, dataSet, canvasProps) => {};

const dataUrlEduc = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
const dataUrlUsCounty = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

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
                reject('Failed to load');
            };
        };
    });
};

/*  This is an overly complicated way to do this --- async/await is probably not needed, just chain promises instead

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
