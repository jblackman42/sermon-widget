const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
let sermon;




const loadWidget = async () => {
    sermon = await fetch(`https://phc.events/api/widgets/sermon?id=${id}`)
        .then(response => response.json())
        .then(data => data.sermon[0])
    
    console.log(sermon)
    
    const widgetCardContainer = document.getElementById('widget-card-container');

    const sermonCardImageContainer = document.createElement('div');
        sermonCardImageContainer.id = 'sermon-image-container';
    const sermonCardImageDOM = document.createElement('img');
        sermonCardImageDOM.src = sermon.Series_Image;
        sermonCardImageDOM.alt = sermon.Title;

    const sermonCardContentContainer = document.createElement('div')
        sermonCardContentContainer.id = 'sermon-content';
    const sermonCardTitleDOM = document.createElement('h1');
        sermonCardTitleDOM.innerText = sermon.Title;

    sermonCardImageContainer.appendChild(sermonCardImageDOM);
    sermonCardContentContainer.appendChild(sermonCardTitleDOM);

    widgetCardContainer.appendChild(sermonCardImageContainer);
    widgetCardContainer.appendChild(sermonCardContentContainer);
}
loadWidget();