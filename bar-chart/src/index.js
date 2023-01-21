
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

const dataSet = [5,3,4,6,7,5,3,2,5,4,3,6,4,3,1,5,4,3,5,4,3,1,5,4,2];
//  document.body.appendChild(newDivTemplate('graph-canvas'));
//  d3.select('#graph-canvas').selectAll('p').data(dataSet).enter().append('p').text((d)=>d);

d3.select('body').append('svg').attr('width', 500).attr('height', 300).attr('style', 'border:1px solid black').attr('id', 'canvas');
d3.select('#canvas').selectAll('rect').data(dataSet).enter().append('rect').attr('width', 15).attr('height', (d,i) => 25 * d).attr('x', (d,i) => 20 * i).attr('y', (d,i) => 300 - (25 * d)).attr('fill', 'red')
