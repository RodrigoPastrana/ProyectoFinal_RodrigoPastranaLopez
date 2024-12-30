document.getElementById("ligaForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const cantidadEquipos = parseInt(document.getElementById("cantidadEquipos").value);
    const equiposDesdeJSON = await cargarEquiposDesdeJSON();

    if (equiposDesdeJSON.length >= cantidadEquipos) {
        mostrarFormularioEquipos(cantidadEquipos, equiposDesdeJSON.slice(0, cantidadEquipos));
    } else {
        mostrarFormularioEquipos(cantidadEquipos);
    }
});

async function cargarEquiposDesdeJSON() {
    try {
        const response = await fetch("assets/json/datos.json");
        const data = await response.json();
        return data.equipos || [];
    } catch (error) {
        console.error("Error al cargar el archivo JSON:", error);
        return [];
    }
}

function mostrarFormularioEquipos(cantidadEquipos, equiposPredefinidos = []) {
    const equiposForm = document.getElementById("equiposForm");
    const equiposInputs = document.getElementById("equiposInputs");

    equiposForm.classList.remove("hidden");
    equiposInputs.innerHTML = "";

    for (let i = 0; i < cantidadEquipos; i++) {
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = `Nombre del equipo ${i + 1}`;
        input.required = true;
        input.className = "nombreEquipo";
        input.value = equiposPredefinidos[i] || ""; 
        equiposInputs.appendChild(input);
    }

    document.getElementById("generarFixture").onclick = () => capturarDatosEquipos();
}

function capturarDatosEquipos() {
    const nombreLiga = document.getElementById("nombreLiga").value;
    const nombresEquipos = [...document.getElementsByClassName("nombreEquipo")].map(input => input.value);

    // Completar nombres vacíos con "Equipo X"
    for (let i = 0; i < nombresEquipos.length; i++) {
        if (nombresEquipos[i].trim() === "") {
            nombresEquipos[i] = `Equipo ${i + 1}`;
        }
    }

    if (nombresEquipos.length % 2 !== 0) {
        nombresEquipos.push("Libre");
    }

    const fixture = generarFixture(nombresEquipos);
    guardarDatosEnStorage(nombreLiga, nombresEquipos);
    mostrarFixtureEnPagina(fixture, nombresEquipos, nombreLiga);
}

function generarFixture(equipos) {
    const totalFechas = equipos.length - 1;
    const partidosPorFecha = equipos.length / 2;
    let fixture = [];

    // Ida
    for (let ida = 0; ida < totalFechas; ida++) {
        let partidos = [];
        for (let i = 0; i < partidosPorFecha; i++) {
            let local = equipos[i];
            let visitante = equipos[equipos.length - 1 - i];
            partidos.push({ local, visitante });
        }
        fixture = fixture.concat(partidos);
        equipos.splice(1, 0, equipos.pop());
    }

    const vuelta = fixture.map(partido => ({
        local: partido.visitante,
        visitante: partido.local,
    }));
    return fixture.concat(vuelta);
}

function mostrarFixtureEnPagina(fixture, equipos, nombreLiga) {
    const fixtureDiv = document.getElementById("fixture");
    fixtureDiv.innerHTML = `<h2 class="animate__animated animate__fadeIn">${nombreLiga}</h2>`;

    let partidosPorFecha = equipos.length / 2;
    let fechaActual = 1;

    fixture.forEach((partido, index) => {
        if (index % partidosPorFecha === 0) {
            const tituloFecha = document.createElement("div");
            tituloFecha.className = "fecha animate__animated animate__fadeIn";
            tituloFecha.textContent = `Fecha ${fechaActual}`;
            fixtureDiv.appendChild(tituloFecha);
            fechaActual++;
        }

        if (partido.local !== "Libre" && partido.visitante !== "Libre") {
            const partidoDiv = document.createElement("div");
            partidoDiv.className = "partido animate__animated animate__fadeIn";
            partidoDiv.textContent = `${partido.local} vs ${partido.visitante}`;
            fixtureDiv.appendChild(partidoDiv);
        }
    });

    agregarFormularioBusqueda(fixture);
}

function agregarFormularioBusqueda(fixture) {
    const buscarPartidosForm = document.getElementById("buscarPartidosForm");
    buscarPartidosForm.classList.remove("hidden");

    document.getElementById("buscarPartidos").addEventListener("submit", (event) => {
        event.preventDefault();
        const equipoBuscar = document.getElementById("equipoBuscar").value;
        buscarPartidosPorEquipo(equipoBuscar, fixture);
    });
}

function buscarPartidosPorEquipo(equipo, fixture) {
    const partidosEncontrados = fixture.filter(
        partido => partido.local === equipo || partido.visitante === equipo
    );

    const resultadosDiv = document.getElementById("resultadosBusqueda");
    resultadosDiv.innerHTML = `<h3>Partidos del equipo: ${equipo}</h3>`;

    if (partidosEncontrados.length === 0) {
        resultadosDiv.innerHTML += `<p>No se encontraron partidos para el equipo "${equipo}".</p>`;
        return;
    }

    partidosEncontrados.forEach((partido) => {
        const partidoDiv = document.createElement("div");
        partidoDiv.className = "partido";
        partidoDiv.textContent = `${partido.local} vs ${partido.visitante}`;
        resultadosDiv.appendChild(partidoDiv);
    });
}

function guardarDatosEnStorage(nombreLiga, equipos) {
    const liga = { nombre: nombreLiga, equipos };
    localStorage.setItem("liga", JSON.stringify(liga));
}
