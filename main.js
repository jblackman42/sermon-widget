let seriesList = [];
let currentPage = 0;

const createSeriesCard = (page) => {
    const tempSeriesList = [...seriesList];
    const seriesView = tempSeriesList.splice(12 * page, 12);

    
    const widgetContainer = document.getElementById('widget-container')
    widgetContainer.innerHTML = '';
    const seriesCardContainer = document.createElement('div')
    seriesCardContainer.id = 'series-card-container'
    for (let i = 0; i < seriesView.length; i ++) {
        const seriesDOM = document.createElement('a');
            seriesDOM.classList.add('series');
            seriesDOM.href = `/series.html?id=${seriesView[i].Sermon_Series_ID}`;
        const seriesImageContainerDOM = document.createElement('div');
            seriesImageContainerDOM.classList.add('series-image-container');
        const seriesImageDOM = document.createElement('img');
            seriesImageDOM.src = seriesView[i].Series_Image;
            seriesImageDOM.alt = seriesView[i].Title;
        const seriesTitleDOM = document.createElement('p');
            seriesTitleDOM.innerText = 'View More';

        seriesImageContainerDOM.appendChild(seriesImageDOM);
        seriesDOM.appendChild(seriesImageContainerDOM);
        seriesDOM.appendChild(seriesTitleDOM);
        seriesCardContainer.appendChild(seriesDOM);
        widgetContainer.appendChild(seriesCardContainer);
    }
    const buttonContainer = document.createElement('div');
        buttonContainer.id = 'series-btn-container';
    const prevPageBtnDOM = document.createElement('button');
        prevPageBtnDOM.onclick = prevPage;
        prevPageBtnDOM.innerText = 'Previous Page';
        prevPageBtnDOM.id = 'prev-btn';
    const nextPageBtnDOM = document.createElement('button');
        nextPageBtnDOM.onclick = nextPage;
        nextPageBtnDOM.innerText = 'Next Page';
        nextPageBtnDOM.id = 'next-btn';
    
    buttonContainer.appendChild(prevPageBtnDOM);
    buttonContainer.appendChild(nextPageBtnDOM);
    widgetContainer.appendChild(buttonContainer);
}

const nextPage = () => {
    const maxPages = Math.floor(seriesList.length / 12);
    if (currentPage >= maxPages) return;

    currentPage ++;
    createSeriesCard(currentPage)
}
const prevPage = () => {
    if (currentPage <= 0) return;

    currentPage --;
    createSeriesCard(currentPage)
}

const loadWidget = async () => {
    seriesList = await fetch('https://phc.events/api/widgets/sermons')
        .then(response => response.json())
        .then(data => data.sermons)
    
    createSeriesCard(currentPage)
    
}
loadWidget();