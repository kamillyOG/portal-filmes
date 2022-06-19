const chaveapi= "bc63863a33654057a2d1def8e547206d";
const idFilme = new URL(window.location.href).searchParams.get("id");

$(document).ready(() => {
    buscadetalhes();

    document.getElementById("formPesquisa").addEventListener("submit", (e) =>{
        e.preventDefault();
        const valor = document.getElementById("pesquisa").value;
        window.location.href = `../pesquisa/pesquisa.html?nome=${valor}`;
    });
});

function buscadetalhes(){
    $.ajax(`https://api.themoviedb.org/3/movie/${idFilme}?api_key=${chaveapi}&language=pt-BR`).then(async (resposta) =>{
        const creditos = await carregaCreditos(resposta.id);
        let roteiro = filterCrew(creditos[0].crew, 'Screenplay');
        roteiro += filterCrew(creditos[0].crew, 'Writer');

        $("#detalhes").append(
            `<div class="col-12 col-md-4">
                <img class="w-100 m-0" src="https://image.tmdb.org/t/p/w500${resposta.poster_path}" alt="${resposta.original_title}"></a>
            </div>
            
            <div class="col-12 col-md-8 p-3">
                <h2>${resposta.title}</h2>
                <br>
                <p><b>Sinopse: </b> ${resposta.overview}</p>

                <b>${formatDate(new Date(resposta.release_date))}</b>
                <br>
                <br>
                <p><b>Direção: </b> ${filterCrew(creditos[0].crew, 'Director')}</p>
                <p><b>Roteiro: </b> ${roteiro}</p>
                <p><b>Elenco: </b> ${filterCast(creditos[0].cast)}</p>
                <a href="${resposta.homepage}" target="_blank">Acessar Home Page.</a>
                
            </div>`);
    });
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

function formatDate(date) {
    return addZeroDate(date.getDate()+1) + "/" + addZeroDate((date.getMonth()+1)) + "/" + date.getFullYear();
}

function addZeroDate(numero){
    if (numero <= 9)
        return "0" + numero;
    else
        return numero;
}