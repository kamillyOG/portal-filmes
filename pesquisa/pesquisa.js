const chaveapi= "bc63863a33654057a2d1def8e547206d";
const pesquisa = new URL(window.location.href).searchParams.get("nome");

$(document).ready(() => {
    buscar();

    document.getElementById("formPesquisa").addEventListener("submit", (e) =>{
        e.preventDefault();
        const valor = document.getElementById("pesquisa").value;
        window.location.href = `?nome=${valor}`;
    });
});

function buscar(){
    $.ajax(`https://api.themoviedb.org/3/search/movie?api_key=${chaveapi}&language=pt-BR&page=1&query=${pesquisa}`).then((resposta) => {
        const filmes = resposta.results;

        if(filmes.length > 0) {
            $("#filmes").empty();
            for(i=0; i<filmes.length; i++) {
                $("#filmes").append(
                    `<div class="col-lg-2 col-md-3 col-sm-4 col-6 my-2 d-flex">
                        <a class="d-flex" href="../detalhes/detalhes.html?id=${filmes[i].id}">
                            <img class="w-100 m-0" src="https://image.tmdb.org/t/p/w500/${filmes[i].poster_path}" alt="${filmes[i].title}">
                        </a>
                    </div>`);
            }
        } else {
            $("#filmes").append(`<div class="col-12 pb-5"><h2 class="text-center"> Sem filmes </h2></div>`);
        }
    });
}