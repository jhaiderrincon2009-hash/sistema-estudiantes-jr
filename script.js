/*
  Código de demostración.
  Cambia estas credenciales antes de usar el sistema.
*/
const CODIGO_ACCESO = "1234";

const $ = (id) => document.getElementById(id);

const campos = [
    "cedula",
    "nombre1",
    "nombre2",
    "apellido1",
    "apellido2",
    "telefono",
    "direccion"
];

let estudiantes = cargarEstudiantes();
let estudianteSeleccionado = null;

// Guardar datos en el navegador
function cargarEstudiantes() {
    try {
        const datos = JSON.parse(
            localStorage.getItem("estudiantes") || "[]"
        );

        return Array.isArray(datos) ? datos : [];
    } catch {
        return [];
    }
}

function persistir() {
    try {
        localStorage.setItem(
            "estudiantes",
            JSON.stringify(estudiantes)
        );
        return true;
    } catch {
        mostrarMensaje(
            "No se pudieron guardar los datos en el navegador."
        );
        return false;
    }
}

function mostrarMensaje(texto) {
    $("mensaje").textContent = texto;
}

function obtenerDatos() {
    const datos = {};

    campos.forEach((campo) => {
        datos[campo] = $(campo).value.trim();
    });

    return datos;
}

function validarDatos(datos) {
    if (
        !datos.cedula ||
        !datos.nombre1 ||
        !datos.apellido1 ||
        !datos.telefono ||
        !datos.direccion
    ) {
        mostrarMensaje(
            "Complete todos los campos obligatorios."
        );
        return false;
    }

    return true;
}

function limpiarFormulario() {
    $("formEstudiante").reset();
    estudianteSeleccionado = null;
}

function llenarFormulario(estudiante) {
    campos.forEach((campo) => {
        $(campo).value = estudiante[campo] || "";
    });

    estudianteSeleccionado = estudiante.cedula;
    mostrarMensaje("Estudiante cargado en el formulario.");
}

// Acceso al sistema
$("formAcceso").addEventListener("submit", (evento) => {
    evento.preventDefault();

    if ($("codigoAcceso").value === CODIGO_ACCESO) {
        $("pantallaAcceso").classList.add("oculto");
        $("sistema").classList.remove("oculto");
        $("codigoAcceso").value = "";
        mostrarMensaje("Acceso correcto.");
    } else {
        $("mensajeAcceso").textContent =
            "Código incorrecto. Intente nuevamente.";

        $("codigoAcceso").value = "";
        $("codigoAcceso").focus();
    }
});

// Guardar estudiante
$("btnGuardar").addEventListener("click", () => {
    const datos = obtenerDatos();

    if (!validarDatos(datos)) return;

    const existe = estudiantes.some(
        (estudiante) => estudiante.cedula === datos.cedula
    );

    if (existe) {
        mostrarMensaje(
            "Ya existe un estudiante con esa cédula. Use Consultar o Editar."
        );
        return;
    }

    estudiantes.push(datos);

    if (!persistir()) {
        estudiantes.pop();
        return;
    }

    limpiarFormulario();
    mostrarMensaje("Estudiante guardado correctamente.");
    renderizarLista();
});

// Consultar estudiante por cédula
$("btnConsultar").addEventListener("click", () => {
    const cedula = $("cedula").value.trim();

    if (!cedula) {
        mostrarMensaje("Ingrese la cédula que desea consultar.");
        $("cedula").focus();
        return;
    }

    const estudiante = estudiantes.find(
        (item) => item.cedula === cedula
    );

    if (!estudiante) {
        mostrarMensaje("No se encontró un estudiante con esa cédula.");
        return;
    }

    llenarFormulario(estudiante);
});

// Editar estudiante consultado
$("btnEditar").addEventListener("click", () => {
    if (!estudianteSeleccionado) {
        mostrarMensaje(
            "Primero consulte el estudiante que desea editar."
        );
        return;
    }

    const datos = obtenerDatos();

    if (!validarDatos(datos)) return;

    const indice = estudiantes.findIndex(
        (item) => item.cedula === estudianteSeleccionado
    );

    if (indice === -1) {
        mostrarMensaje("El estudiante ya no existe.");
        return;
    }

    const duplicado = estudiantes.some(
        (item) =>
            item.cedula === datos.cedula &&
            item.cedula !== estudianteSeleccionado
    );

    if (duplicado) {
        mostrarMensaje("La nueva cédula ya está registrada.");
        return;
    }

    const anterior = estudiantes[indice];
    estudiantes[indice] = datos;

    if (!persistir()) {
        estudiantes[indice] = anterior;
        return;
    }

    limpiarFormulario();
    mostrarMensaje("Estudiante actualizado correctamente.");
    renderizarLista();
});

// Eliminar estudiante
$("btnEliminar").addEventListener("click", () => {
    const cedula =
        estudianteSeleccionado || $("cedula").value.trim();

    if (!cedula) {
        mostrarMensaje("Ingrese o consulte la cédula que desea eliminar.");
        return;
    }

    const indice = estudiantes.findIndex(
        (item) => item.cedula === cedula
    );

    if (indice === -1) {
        mostrarMensaje("No se encontró el estudiante.");
        return;
    }

    const estudiante = estudiantes[indice];

    if (!confirm(
        `¿Desea eliminar al estudiante con cédula ${cedula}?`
    )) {
        return;
    }

    estudiantes.splice(indice, 1);

    if (!persistir()) {
        estudiantes.splice(indice, 0, estudiante);
        return;
    }

    limpiarFormulario();
    mostrarMensaje("Estudiante eliminado correctamente.");
    renderizarLista();
});

// Mostrar la lista de estudiantes
$("btnListar").addEventListener("click", () => {
    const seccion = $("seccionLista");

    seccion.classList.toggle("oculto");

    if (!seccion.classList.contains("oculto")) {
        renderizarLista();
        seccion.scrollIntoView({ behavior: "smooth" });
    }
});

// Crear la tabla de forma segura
function agregarCelda(fila, texto) {
    const celda = document.createElement("td");
    celda.textContent = texto || "";
    fila.appendChild(celda);
}

function renderizarLista() {
    const tabla = $("tablaEstudiantes");
    tabla.replaceChildren();

    estudiantes.forEach((estudiante) => {
        const fila = document.createElement("tr");

        const nombreCompleto = [
            estudiante.nombre1,
            estudiante.nombre2,
            estudiante.apellido1,
            estudiante.apellido2
        ].filter(Boolean).join(" ");

        agregarCelda(fila, estudiante.cedula);
        agregarCelda(fila, nombreCompleto);
        agregarCelda(fila, estudiante.telefono);
        agregarCelda(fila, estudiante.direccion);

        const celdaAccion = document.createElement("td");
        const boton = document.createElement("button");

        boton.textContent = "Seleccionar";
        boton.className = "btn-pequeno btn-azul";

        boton.addEventListener("click", () => {
            llenarFormulario(estudiante);
            $("formEstudiante").scrollIntoView({
                behavior: "smooth"
            });
        });

        celdaAccion.appendChild(boton);
        fila.appendChild(celdaAccion);
        tabla.appendChild(fila);
    });

    $("totalEstudiantes").textContent =
        `Total de estudiantes registrados: ${estudiantes.length}`;
}

// Cerrar sesión
$("btnSalir").addEventListener("click", () => {
    $("sistema").classList.add("oculto");
    $("pantallaAcceso").classList.remove("oculto");
    limpiarFormulario();
    $("mensajeAcceso").textContent = "";
    mostrarMensaje("");
});

// Mostrar los registros existentes al cargar el programa
renderizarLista();

$("exportarExcel").addEventListener("click", () => {

    // Verificar si hay estudiantes registrados
    if (estudiantes.length === 0) {
        alert("No hay estudiantes registrados para exportar.");
        return;
    }

    // Preparar los datos para Excel
    const datosExcel = estudiantes.map((estudiante) => ({
        "Cédula": estudiante.cedula,
        "Primer nombre": estudiante.nombre1,
        "Segundo nombre": estudiante.nombre2,
        "Primer apellido": estudiante.apellido1,
        "Segundo apellido": estudiante.apellido2,
        "Teléfono": estudiante.telefono,
        "Dirección": estudiante.direccion
    }));

    // Crear la hoja de cálculo
    const hoja = XLSX.utils.json_to_sheet(datosExcel);

    // Crear el libro de Excel
    const libro = XLSX.utils.book_new();

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(
        libro,
        hoja,
        "Estudiantes"
    );

    // Descargar el archivo
    XLSX.writeFile(
        libro,
        "estudiantes_registrados.xlsx"
    );

    mostrarMensaje("Archivo Excel generado correctamente.");
});
// AVANZAR ENTRE LOS CAMPOS AL PRESIONAR ENTER

const ordenCampos = [
    "cedula",
    "nombre1",
    "nombre2",
    "apellido1",
    "apellido2",
    "telefono",
    "direccion"
];

ordenCampos.forEach((id, indice) => {
    $(id).addEventListener("keydown", (evento) => {

        if (evento.key === "Enter") {
            evento.preventDefault();

            const siguienteIndice = indice + 1;

            if (siguienteIndice < ordenCampos.length) {
                $(ordenCampos[siguienteIndice]).focus();
            } else {
                $("btnGuardar").focus();
            }
        }

    });
});