const chaveapi= "bc63863a33654057a2d1def8e547206d";
let maisfilmes = false;
let filmes = [];

$(document).ready(async () => {
    filmes = await carregaFilmes();
    buscalancamentos();
    buscaCategoria();
    buscaDestaques(filmes, 4);
    buscaavaliacoes();
    buscaentrevista();
    
    document.getElementById("formPesquisa").addEventListener("submit", (e) =>{
        e.preventDefault();
        const valor = document.getElementById("pesquisa").value;
        window.location.href = `./pesquisa/pesquisa.html?nome=${valor}`;
    });
});

document.getElementById("categorias").addEventListener('change', () => buscaDestaqueByCategoria());

function buscaDestaqueByCategoria() {
    const selected = document.getElementById("categorias").value;
    if(selected == 0) {
        buscaDestaques(filmes, 4);
    } else {
        const filter = filmes.filter((f) => f.genre_ids.indexOf(parseInt(selected)) != -1);
        buscaDestaques(filter, filter.length < 4 ? filter.length : 4);
        maisfilmes = false;
        document.getElementById("maisfilmes").innerHTML = '+ Carregar mais filmes';
    }
}

document.getElementById("maisfilmes").addEventListener('click', () => {
    const filterSelected = parseInt(document.getElementById("categorias").value);
    maisfilmes = !maisfilmes;
    if(maisfilmes) {
        document.getElementById("maisfilmes").innerHTML = '- Mostrar menos filmes';
        if(filterSelected == 0)
        buscaDestaques(filmes, filmes.length);
        else {
            const filter = filmes.filter((f) => f.genre_ids.indexOf(filterSelected) != -1);
            buscaDestaques(filter, filter.length);
        }
    } else {
        document.getElementById("maisfilmes").innerHTML = '+ Carregar mais filmes';
        filterSelected == 0 ? buscaDestaques(filmes, 4) : buscaDestaqueByCategoria(); 
    }
});

async function buscalancamentos(){
    $("#lancamentos").empty();

    let i=0;
    while(i<4) {
        const url = await buscaVideo(filmes[i].id);
        const creditos = await carregaCreditos(filmes[i].id);
        const direcao = filterCrew(creditos[0].crew, 'Director');
        let roteiro = filterCrew(creditos[0].crew, 'Screenplay');
        roteiro += filterCrew(creditos[0].crew, 'Writer');

        $("#lancamentos").append(
            `<div class="carousel-item ${i==0 ? 'active' : ''}">
                <div>
                    <h1 class="text-center py-4">Lançamentos</h1>
                    <div class="row">
                        <iframe class="col-md-6 col-12" width="550" height="350"
                            src="https://www.youtube.com/embed/${url}" title="YouTube video player"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen></iframe>

                        <div class="col-md-6 col-12">
                            <h3>${filmes[i].title}</h3>
                            <p><b>Sinopse:</b> ${filmes[i].overview}</p>
                            <div class="d-flex justify-content-between w-75 flex-column flex-md-row">
                                <p><b>Diretor:</b> ${direcao} </p>
                                <p><b>Roteiro:</b> ${roteiro}</p>
                                <p><b>Estreia:</b> ${formatDate(new Date(filmes[i].release_date), 13)}</p>
                            </div>
                            <p><b>Elenco:</b> ${filterCast(creditos[0].cast)}</p>
                            <p><b>Avaliação:</b> ${filmes[i].vote_average}</p>
                        </div>
                    </div>
                </div>
            </div>`);
        i++;
    }
}

function buscaCategoria() {
    $.ajax(`https://api.themoviedb.org/3/genre/movie/list?api_key=${chaveapi}&language=pt-BR`)
    .then((resposta) => {
        $("#categorias").append(`<option selected value="0">Categoria: TODOS</option>`);
        for(i=0; i<resposta.genres.length; i++) {
            $("#categorias").append(`<option value="${resposta.genres[i].id}">${resposta.genres[i].name}</option>`);
        }
    });
}

function buscaDestaques(list, max){
    $("#filmes").empty();
    if(list.length > 0){
        list.length < 4 ? $("#maisfilmes").hide() : $("#maisfilmes").show();

        for(i=0; i<max; i++){
            $("#filmes").append(
                `<a href="./detalhes/detalhes.html?id=${list[i].id}" class="col-12 col-sm-6 col-md-3 my-2">
                    <img class="w-100"
                    src="https://image.tmdb.org/t/p/w500${list[i].poster_path}"
                    alt="${list[i].title}">
                </a>`)
        }
    } else {
        $("#maisfilmes").hide();
        $("#filmes").append(
            `<div class="col-12 pb-5">
                <h2 class="text-center"> Nenhuma filme desta categoria. </h2>
            </div>`);
    }
}

function buscaavaliacoes(){
    $.ajax(`https://api.themoviedb.org/3/movie/135397/reviews?api_key=${chaveapi}&language=pt-BR&page=1`).then((resposta) => {
        const avaliacoes= resposta.results;

        $("#avaliacoes").empty();
        
        for(i=0; i<3; i++) {
            $("#avaliacoes").append(
                `<div class="card my-2 my-lg-0" style="width: 18rem; height: 350px; overflow-y: auto">
                    <img src="${(`${avaliacoes[i].author_details.avatar_path}`).indexOf('/http') != -1 ? avaliacoes[i].author_details.avatar_path.substr(1) : `https://image.tmdb.org/t/p/w500${avaliacoes[i].author_details.avatar_path}`}" class="card-img-top" alt="${avaliacoes[i].author}">
                    <div class="card-body" style="">
                        <h5 class="card-title">${avaliacoes[i].author}</h5>
                        <p>${formatDate(new Date(avaliacoes[i].created_at), 0)}</p>
                        <p class="card-text">${avaliacoes[i].content}</p>
                    </div>
                </div>`);
        }
    });
}

async function buscaentrevista(){
    $("#entrevistas").empty();
    let i=filmes.length-1;

    while(i>filmes.length-4) {
        const filme = filmes[i];
        const url = await buscaVideo(filme.id);

        $.ajax(`https://api.themoviedb.org/3/movie/${filme.id}/credits?api_key=${chaveapi}&language=pt-BR`).then((resposta) =>{
            const direcao = filterCrew(resposta.crew, 'Director');
            let roteiro = filterCrew(resposta.crew, 'Screenplay');
            roteiro += filterCrew(resposta.crew, 'Writer');

            $("#entrevistas").append(
                `<div class="col-12 col-md-4 my-2">
                    <div class="card">
                        <iframe class="card-img-top" width="287" height="220"
                        src="https://www.youtube.com/embed/${url}" title="YouTube video player" frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen></iframe>
    
                        <div class="card-body">
                            <h4 class="card-title"><b>${filme.title}</b></h4>
                            <p class="card-text"><b>Direção: </b> ${direcao}</p>
                            <p class="card-text"><b>Roteiro: </b> ${roteiro}</p>
                            <p class="card-text"><b>Data de lançamento: </b> ${formatDate(new Date(filme.release_date), 1)}</p>
                        </div>
                    </div>
                </div>`);
        });
        i--;
    }
}

async function carregaFilmes() {
    const list = [];
    await $.ajax(`https://api.themoviedb.org/3/movie/popular?api_key=${chaveapi}&language=pt-BR&page=1`)
    .then((data) => { list.push(...data.results) });
    return list;
}

async function buscaVideo(idFilme) {
    return await $.ajax(`https://api.themoviedb.org/3/movie/${idFilme}/videos?api_key=${chaveapi}&language=pt-BR`).then((data) =>{  return data.results.length>0 ? data.results[0].key : null });
}

async function carregaCreditos(idFilme) {
    const credits = [];
    await $.ajax(`https://api.themoviedb.org/3/movie/${idFilme}/credits?api_key=${chaveapi}&language=pt-BR`)
    .then((data) => { credits.push(data) });
    return credits;
}

function filterCrew(list, filter) {
    let result = "";
    list.map((c) => { if(c.job == filter) result += result.length>0 ? ", "+c.name : c.name });
    return result;
}

function filterCast(list) {
    let result = "";
    list.map((c) => { if(c.order <7) result += result.length>0 ? ", "+c.name : c.name });
    return result;
}

function formatDate(date, sd) {
    return addZeroDate(date.getDate()+sd) + "/" + addZeroDate((date.getMonth()+1)) + "/" + date.getFullYear();
}

function addZeroDate(numero){
    if (numero <= 9)
        return "0" + numero;
    else
        return numero;
}
