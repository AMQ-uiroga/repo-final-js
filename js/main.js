document.addEventListener("DOMContentLoaded", async () => {

  // Elementos del DOM con querySelector
  const operacionesBody = document.querySelector("#operaciones-body");
  const operacionFormId = document.querySelector("#operacion-form-id");

  // Elementos del formulario
  const operacionformIdInput = document.querySelector("#operation-id");
  const descripcionInput = document.querySelector("#descripcion");
  const operacionModal = document.querySelector("#operacion-Modal");
  const tipoInput = document.querySelector("#tipo");
  const categoriaSelect = document.querySelector("#categoria");
  const fechaInput = document.querySelector("#fecha");
  const montoInput = document.querySelector("#monto");
  const deleteModal = document.querySelector("#delete-modal");
  const modalTitle = document.querySelector("#modal-title");
  const confirmDeleteBoton = document.querySelector("#confirm-delete-boton");

  // Elementos del balance
  const gananciasBalan = document.querySelector("#ganancias");
  const gastosBalan = document.querySelector("#gastos");
  const totalBalan = document.querySelector("#total");

  // arrays
  let operations = [];
  let operationToDeleteId = null;

async function cargarDatosIniciales() {
  operations = JSON.parse(localStorage.getItem("operations")) || [];
  // Si no hay datos en localStorage
  if (operations.length === 0) {
    try {
      const response = await fetch("./db/datainicial.json");
      const data = await response.json();
      operations = data;
      localStorage.setItem("operations", JSON.stringify(operations));
    } catch (error) { 
       Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error al cargar datos Iniciales de Operaciones!"
              });      
    }
  }}

  // Mostrar u ocultar modal de operación
  const toggleOperationModal = (open = false) => {
    let modalInstance = bootstrap.Modal.getInstance(operacionModal);
    if (!modalInstance) {
      modalInstance = new bootstrap.Modal(operacionModal);
    }
    if (open) {
      modalInstance.show();
    } else {
      modalInstance.hide();
      operacionFormId.reset();
      operacionformIdInput.value = ""; // limpio  ID
    }
  };

  //Insert json
  fetch("./db/categoria.json")
    .then((response) => response.json())
    .then((data) => {
      categoriaSelect.innerHTML =
        '<option value="">Seleccionar categoría</option>';
      data.sort((a, b) => a.nombre.localeCompare(b.nombre));
      data.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.nombre;
        option.textContent = item.nombre;
        categoriaSelect.appendChild(option);
      });
    })
    .catch((error) => {     
      Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error al cargar categorías!"
              });
      
    });

  // Mostrar u ocultar modal de eliminación
  const toggleDeleteModal = (open = false) => {
    let modalInstance = bootstrap.Modal.getInstance(deleteModal);
    if (!modalInstance) {
      modalInstance = new bootstrap.Modal(deleteModal);
    }
    if (open) {
      modalInstance.show();
    } else {
      modalInstance.hide();
      operationToDeleteId = null;
    }
  };

  // Renderizar las operaciones en DIV
  const renderOperations = () => {
    new Promise(async (resolve) => {
        await cargarDatosIniciales();
    
        operacionesBody.innerHTML = "";
        operations.forEach((operation) => {
        const row = document.createElement("div");

        row.className = "row ";
        row.innerHTML = `
                        <div class="col fw-bold">${operation.descripcion}</div>
                        <div class="col">
                            <span class="badge bg-light text-dark">${
                            operation.categoria
                            }</span>
                        </div>
                        <div class="col text-secondary">${operation.fecha}</div>
                        <div class="col fw-bold ${
                        operation.tipo === "Ganancias"
                            ? "text-success"
                            : "text-danger"
                        }">
                            ${
                            operation.tipo === "Ganancias" ? "+" : "-"
                            } $${Math.abs(operation.monto).toFixed(2)}
                        </div>
                        <div class="col text-end">
                            <a href="#" class="edit-btn text-primary me-3" data-id="${
                            operation.id
                            }">Editar</a>
                            <a href="#" class="delete-btn text-danger" data-id="${
                            operation.id
                            }">Eliminar</a>
                        </div>
                        `;
        operacionesBody.appendChild(row);
        });
        updateBalance();
        resolve();
    });
  };

  // Calcular y actualizar balance
  const updateBalance = () => {
    let ganancias = 0;
    let gastos = 0;
    // Simulación de espera con Promise y setTimeout
    return new Promise((resolve) => {
      setTimeout(() => {
        operations.forEach((op) => {          
          if (op.tipo === "Ganancias") {
            ganancias += op.monto;
          } else {
            gastos += Math.abs(op.monto);
          }
        });

        const total = ganancias - gastos;

        //console.log("updateBalance", ganancias, gastos, total);
        gananciasBalan.textContent = `+ $${ganancias.toFixed(2)}`;
        gastosBalan.textContent = `- $${gastos.toFixed(2)}`;
        totalBalan.textContent = `${total >= 0 ? "+" : ""} $${total.toFixed(
          2
        )}`;

        // Cambiar color del total
        if (total > 0) {
          totalBalan.classList.remove("text-red-600");
          totalBalan.classList.add("text-green-600");
        } else if (total < 0) {
          totalBalan.classList.remove("text-green-600");
          totalBalan.classList.add("text-red-600");
        } else {
          totalBalan.classList.remove("text-green-600", "text-red-600");
        }

        resolve(); // Promesa resuelta después de la simulación
      }, 1000); // 1 segundo de espera simulada
    });
  };

  const isValid = (descripcion, fecha, monto) => {
    // Validación de campos obligatorios
    if (!descripcion || !fecha || isNaN(monto) || monto === 0 || monto < 0) {
      return false;
    }
    return true;
  };

  // Enviar formulario
  operacionFormId.addEventListener(
    "submit",
    function (e) {
      //console.log("Formulario enviado");
      e.preventDefault();
      //const id = operacionFormId.value || Date.now().toString();
      const id = operacionformIdInput.value || Date.now().toString();
      const descripcion = descripcionInput.value;
      const tipo = tipoInput.value;
      const categoria = categoriaSelect.value;
      const fecha = fechaInput.value;
      const monto = parseFloat(montoInput.value);

      // Validación de campos obligatorios
      if (isValid(descripcion, fecha, monto) === false) {
        Toastify({
          text: "Descripción, fecha y monto son obligatorios.",
          className: "error",
          style: {
            background: "linear-gradient(to right, #ff416c, #ff4b2b)",
          },
        }).showToast();
        return;
      }

      const newOperation = { id, descripcion, tipo, categoria, fecha, monto };

      const existingIndex = operations.findIndex((op) => op.id === id);

      if (existingIndex !== -1) {
        operations[existingIndex] = newOperation; // Editar
      } else {
        operations.push(newOperation); // Crear nueva
      }

      localStorage.setItem("operations", JSON.stringify(operations));

      renderOperations();
      toggleOperationModal(false);

      Toastify({
        text: "Guardaste una operación",
        className: "info",
        style: {
          background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
      }).showToast();
    },
    true
  );

  // Editar o eliminar
  operacionesBody.addEventListener("click", function (e) {
    const target = e.target;
    const id = target.dataset.id;

    if (target.classList.contains("edit-btn")) {
      e.preventDefault();
      const op = operations.find((op) => op.id === id);
      if (op) {
        modalTitle.textContent = "Editar Operación";
        //operacionFormId.value = op.id;
        operacionformIdInput.value = op.id;
        descripcionInput.value = op.descripcion;
        tipoInput.value = op.tipo;
        categoriaSelect.value = op.categoria;
        fechaInput.value = op.fecha;
        montoInput.value = op.monto;
        toggleOperationModal(true);
      }
    } else if (target.classList.contains("delete-btn")) {
      //console.log("Eliminaste una operación");
      e.preventDefault();
      operationToDeleteId = id;
      toggleDeleteModal(true);
    }
  });

  // Confirmar eliminación
  confirmDeleteBoton.addEventListener("click", () => {
    if (operationToDeleteId) {
      operations = operations.filter((op) => op.id !== operationToDeleteId);
      localStorage.setItem("operations", JSON.stringify(operations));
      renderOperations();
      toggleDeleteModal(false);

      Toastify({
        text: "Operación eliminada",
        className: "info",
        style: {
          background: "linear-gradient(to right, #ff416c, #ff4b2b)",
        },
      }).showToast();
    }
  });

  // Cargar datos iniciales (vacío)
  renderOperations();
});
