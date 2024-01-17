
let iso;
let indiceTiempo;
let indiceEncontrado = false;
let provincias = ['Gasteiz / Vitoria','Albacete','Alicante','Almería','Oviedo','Ávila','Badajoz','Barcelona','Burgos','Cáceres',
    'Cadiz','Santander','Castelló de la Plana','Ciudad Real','Córdoba','A Coruña','Cuenca','Puerto del Rosario','Gerona','Granada','Guadalajara',
    'San Sebastián de los Reyes','Girona','Huelva','Huesca','Jaén','León','Lérida','Lugo','Madrid','Málaga','Murcia',
    'Ourense','Palencia','Palma','Pamplona','Las Palmas de Gran Canaria','Lleida','Pontevedra','Logroño','Salamanca','Segovia','Sevilla','Soria','Tarragona',
    'Santa Cruz de Tenerife','Teruel','Toledo','Valencia','Valladolid','Bilbao','Zamora','Zaragoza'];
let NombrePueblos = [];
let CoordenadasPueblo = [];
let peticion;
let respuesta;
let intervaloCaja;

 

let setTiempo = async (provincia) => {
    let cajitaProvincia = document.getElementById(provincia[1]);

    let peticionProvincias = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${provincia[3]}&longitude=${provincia[4]}&current=is_day,weather_code&daily=temperature_2m_max,temperature_2m_min&forecast_days=1`);
    let respuestaProvincias = await peticionProvincias.json();



    var rect = cajitaProvincia.getBoundingClientRect();
    let topProvincia = rect.top + window.scrollY;
    let leftProvincia = rect.left + window.scrollX;


    let contenedorTiempo = document.createElement('div');


    // Creo el sol
    contenedorTiempo.innerHTML +=  setDibujoTiempo(respuestaProvincias.current);
    contenedorTiempo.className = "contenedorTiempo";

    document.body.appendChild(contenedorTiempo);

    var rect2 = contenedorTiempo.getBoundingClientRect();


    // Centrar los logos con pixeles
    contenedorTiempo.style.top = topProvincia + ((rect.height - rect2.height)/2) + "px";
    contenedorTiempo.style.left = leftProvincia + ((rect.width - rect2.width)/2) + "px";


    // Provincia Cambia de color al arrastrar raton por encima

    cajitaProvincia.onmouseenter = function() {
        mostrarTemperaturas(cajitaProvincia,respuestaProvincias.daily);
    };

    contenedorTiempo.onmouseenter = function() {
        mostrarTemperaturas(cajitaProvincia,respuestaProvincias.daily);
    };

    cajitaProvincia.onmouseleave = function() {
        cajitaProvincia.querySelector('polygon,path').style.fill = "#067f00";


        // Comprueba si es una isla y si es pinta varias
        comprobarIslas(cajitaProvincia,1);


       document.getElementById('temperaturas').style.visibility = "hidden";
       clearInterval(intervaloCaja);
    };

    contenedorTiempo.onmouseleave = function() {
        cajitaProvincia.querySelector('polygon,path').style.fill = "#067f00";

        comprobarIslas(cajitaProvincia,1);
        document.getElementById('temperaturas').style.visibility = "hidden";
        clearInterval(intervaloCaja);
    };
    
}

let setDibujoTiempo = (currentTime) => {
    let circle;
    let styleCloud;
    

    if (currentTime.is_day === 1){
        circle = '<div class="theSun"></div>';
        styleCloud = '';
    }else{
        circle = '<div class="theSun moon"></div>';
        styleCloud = 'style="background: rgb(162, 162, 162); --after-background: rgba(162, 162, 162);"';
    }

    let rainCloud = '<div id="raincloud" ' + styleCloud + '>' +
    '<div class="rain">' +
      '<div class="drop d2"></div>' +
      '<div class="drop d3"></div>' +
      '<div class="drop d4"></div>' +
      '<div class="drop d6"></div>' +
      '<div class="drop d7"></div>' +
      '<div class="drop d8"></div>' +
      '<div class="drop d9"></div>' +
      '<div class="drop d10"></div>' +
      '<div class="drop d11"></div>' +
      '<div class="drop d12"></div>' +
      '<div class="drop d13"></div>' +
      '<div class="drop d14"></div>' +
      '<div class="drop d15"></div>' +
    '</div>' +
  '</div>';


    if (currentTime.weather_code === 0){
        return circle;
    }else if(currentTime.weather_code > 50 && currentTime.weather_code < 66){
        return rainCloud;
    }else if(currentTime.weather_code === 1 || currentTime.weather_code === 2){
        return '<div class="mixed">' + circle +
        '<div class="center" style="opacity: ' + (currentTime.cloud_cover === 2 ? '0.8':'0.5') + '"><div id = "cloud" ' + styleCloud + '></div></div>';
    }else if(currentTime.weather_code === 3){
        return '<div class="center"><div id = "cloud"  ' + styleCloud + '></div></div>';
    }

}

let comprobarIslas = (caja,accion) => {
    let islasCan = [
        ["El Hierro", "La Palma", "La Gomera", "Santa Cruz de Tenerife"],
        ["Puerto del Rosario", "Tenerife"],
        ["Ciutadella","Ibiza","Palma"]
      ];
      
      let islaEncontrada = islasCan.find(islaLista => islaLista.includes(caja.id));
      
      if (islaEncontrada) {
        islaEncontrada.forEach((isla) => {
          caja = document.getElementById(isla);
          caja.querySelector('polygon,path').style.fill = accion === 0 ? "red" : "#4ab10b";
        });
      }
}

let mostrarTemperaturas = (cajita,temperatures) => {
    cajita.querySelector('polygon,path').style.fill = "red";
    comprobarIslas(cajita,0);


    let caja = document.getElementById("temperaturas");
    caja.style.left = (parseInt(event.x) + 5) + "px";
    caja.style.top = (parseInt(event.y) + 5) + "px";
    caja.style.visibility = "visible";




    let datos = document.createElement('div');
    datos = cajita.id + '<br>'; 
    datos += '<i class="fa-solid fa-temperature-arrow-up" style="color: red"></i> ' + Math.round(temperatures.temperature_2m_max) + ' Cº<br>';
    datos += '<i class="fa-solid fa-temperature-arrow-down" style="color: blue"></i> ' + Math.round(temperatures.temperature_2m_min) + ' Cº';

    caja.innerHTML = datos;

}

let Provincias = async () => {
    let salamancaFound = false;

    peticion = await fetch("http://www.alpati.net/DWEC/cities/");
    respuesta = await peticion.json();


    respuesta.forEach((pueblo) => {
        if (pueblo[5] === "ES"){
            provincias.forEach( nombre => {
                if (pueblo[1] === nombre) {
                    if (pueblo[1] === "Salamanca"){
                        provincias.splice(provincias.indexOf("Salamanca"),1);
                    }
                    setTiempo(pueblo);
                }
            });
            NombrePueblos.push(pueblo[1]);
            CoordenadasPueblo.push([pueblo[3],pueblo[4]]);
        }
    })

    document.addEventListener('keypress', (key) => key.key === "Enter" ? crearGrafico(0) : "");
    document.addEventListener('zoom', setTiempo());

}


let crearGrafico = async (valor) => {

    if (valor === 0){
        valor = document.getElementById('tags').value;
    }

    // Comprobacion de que la ciudad exista
    if (valor === "" || !NombrePueblos.includes(valor)){
        return 0;
    }

    document.getElementById('peninsula').style.visibility = "hidden";
    document.getElementById('IslasCanarias').style.visibility = "hidden";
    let figurastiempo = document.getElementsByClassName('contenedorTiempo');


    for (let i=0; i<figurastiempo.length;){
        figurastiempo[i].parentNode.removeChild(figurastiempo[i]);
    }

    document.getElementById('titulo').innerText = valor;

    document.getElementById('contenedorGrafico').innerHTML = '';
    document.getElementById('contenedorGrafico').style.visibility = "visible";


    let coordenadas = CoordenadasPueblo[NombrePueblos.indexOf(valor)];


    let peticionPuebloPequeño = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coordenadas[0]}&longitude=${coordenadas[1]}&current=is_day,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum`);
    let respuestaPuebloPequeño = await peticionPuebloPequeño.json();



    const data = {
    labels: respuestaPuebloPequeño.daily.time,
    datasets: [
        {
        label: 'Max. (Cº)',
        data: respuestaPuebloPequeño.daily.temperature_2m_max,
        borderColor: "red",
        backgroundColor: "rgb(0,0,0)",
        },
        {
            label: 'Min. (Cº)',
            data: respuestaPuebloPequeño.daily.temperature_2m_min,
            borderColor: "blue",
            backgroundColor: "rgb(0,0,0)",
        }
    ]
    };

    

    const config = {
        type: 'line',
        data: data,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Temperaturas'
            }
          },
          scales: {
            y:{
                type: "linear", display: true, position: 'left',
            }, x:{
                type: "category", display: true, position: 'bottom',
            } 
          },
          animations: {
            y: {
              easing: 'easeInOutElastic',
              from: (ctx) => {
                if (ctx.type === 'data') {
                  if (ctx.mode === 'default' && !ctx.dropped) {
                    ctx.dropped = true;
                    return 0;
                  }
                }
              }
            }
            }
        },
      };

      let divGrafico1 = document.createElement('div');

    let grafico1 = document.createElement('canvas');
    divGrafico1.appendChild(grafico1);

    let ctx = grafico1.getContext('2d');
    let miGrafico = new Chart(ctx, config);

    document.getElementById('contenedorGrafico').appendChild(divGrafico1);

    const data2 = {
      labels: respuestaPuebloPequeño.daily.time,
      datasets: [{
        label: 'mm',
        data: respuestaPuebloPequeño.daily.precipitation_sum,
        backgroundColor: [
          'darkblue'
        ],
        borderColor: [
          'black'
        ],
        borderWidth: 1
      }]
    };
        



    const config2 = {
      type: 'bar',
      data: data2,
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Precipitaciones'
          }
        }
      },
    };

    let divGrafico2 = document.createElement('div');

    let grafico2 = document.createElement('canvas');
    divGrafico2.appendChild(grafico2);

    let ctx2 = grafico2.getContext('2d');
    let miGrafico2 = new Chart(ctx2, config2);

    document.getElementById('contenedorGrafico').appendChild(divGrafico2);

      
}


let comprobacionReloj = (tiempo) => {
    return tiempo < 10 ? "0" + tiempo: tiempo;
}



let CrearReloj = () => {
    let reloj = document.createElement("div");
    reloj.id = "reloj";
    document.body.appendChild(reloj);


    setInterval(()=>{
        let hora = new Date();
        reloj.innerText = comprobacionReloj(hora.getHours()) + ":" + comprobacionReloj(hora.getMinutes()) + ":" + comprobacionReloj(hora.getSeconds());

        if (hora.getHours() < 18){
            document.body.style.background = "rgb(113, 231, 255)";
            document.body.style.background = "linear-gradient(90deg, rgb(113, 231, 255) 0%, rgba(0,212,255,1) 35%, rgb(42, 91, 160) 100%)";
        }else{
            // Pongo los estilos nocturnos
            document.getElementById('titulo').style.color = "white";
            document.body.style.background = "#000 url('https://i.ibb.co/g91MwKZ/stars.png') repeat top center";
            document.body.style.color = "white";
            document.getElementById('IslasCanarias').style.borderColor = "white";
            document.getElementsByClassName('input')[0].style.borderColor = "white";

            let provincias = document.getElementsByTagName('a');

            for (let i = 0; i < provincias.length; i++) {
                let elementos = provincias[i].querySelectorAll('polygon, path');
                
                elementos.forEach(function(elemento) {
                  elemento.style.stroke = "white";
                  elemento.style.strokeWidth = "1px";
                });
              }

        }
            },1000) 
}

let autocompleteVar = () => {
    $( function() {
        $( "#tags" ).autocomplete({
          source: NombrePueblos
        });
      } );
}



CrearReloj();
Provincias();
autocompleteVar();



