
const newH2Template = (text) =>  {
    let newElement = document.createElement('h2');
    newElement.innerText = text;
    return newElement;
};

const newButtonTemplate = (text) => {
    let newElement = document.createElement('button')
    newElement.attributes = {'type': 'button'};
    newElement.innerText = text;
    newElement.addEventListener('click', () => {document.getElementsByTagName('h2')[0].innerText = 'Clicked!'});
    return newElement;
}

document.body.appendChild(newH2Template('Compiled Successfully'));
document.body.appendChild(newButtonTemplate('Click Me!'));
